import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { connect } from "node:net";
import { WebSocket } from "ws";
import { createRelay } from "./server.js";
import { relayAddress, connectRelay } from "../src/a2a/transport.js";
import { validMessage } from "../src/a2a/protocol.js";

const room = "test-room-12345678";
const hello = (side, id = side) => ({ id, side, kind: "here", hello: true });
async function setup(t, options) {
  const relay = createRelay(options);
  relay.server.listen(0, "127.0.0.1");
  await once(relay.server, "listening");
  const base = `ws://127.0.0.1:${relay.server.address().port}`;
  t.after(() => relay.close());
  const open = async (r = room) => {
    const ws = new WebSocket(`${base}/?room=${r}`, { origin: "https://kevcassidy01.github.io" });
    await once(ws, "open");
    return ws;
  };
  return { ...relay, base, open };
}
async function rejected(base, r, origin) {
  const ws = new WebSocket(`${base}/?room=${r}`, { origin });
  ws.on("error", () => {});
  const [, response] = await once(ws, "unexpected-response");
  response.resume();
  ws.terminate();
  return response.statusCode;
}

test("health and live room isolation, hello, beats, jump and pause", async (t) => {
  const { base, open } = await setup(t);
  const health = await fetch(base.replace("ws:", "http:") + "/health");
  assert.deepEqual(await health.json(), { ok: true });
  const buyer = await open();
  buyer.send(JSON.stringify(hello("buyer")));
  const seller = await open();
  const stranger = await open("another-room-123456");
  let leaked = false;
  stranger.on("message", () => { leaked = true; });
  const first = once(buyer, "message");
  seller.send(JSON.stringify(hello("seller")));
  assert.deepEqual(JSON.parse((await first)[0]), hello("seller"));
  for (const m of [
    { id: "buyer", side: "buyer", kind: "beat", beat: "quoteSent" },
    { id: "buyer", side: "buyer", kind: "jump", from: 15 },
    { id: "buyer", side: "buyer", kind: "pause", paused: true },
  ]) {
    const received = once(seller, "message");
    buyer.send(JSON.stringify(m));
    assert.deepEqual(JSON.parse((await received)[0]), m);
  }
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(leaked, false);
});

test("reject missing/invalid rooms, origins, room and client limits", async (t) => {
  const { base, open } = await setup(t, { maxRooms: 1 });
  assert.equal(await rejected(base, "", "https://kevcassidy01.github.io"), 400);
  assert.equal(await rejected(base, room, "https://evil.example"), 403);
  assert.equal(await rejected(base, room, undefined), 403);
  await open();
  await open();
  assert.equal(await rejected(base, room, "https://kevcassidy01.github.io"), 503);
  assert.equal(await rejected(base, "another-room-123456", "https://kevcassidy01.github.io"), 503);
});

test("malformed, binary, unknown beats, impersonation and payload limits close connection", async (t) => {
  const { open } = await setup(t);
  for (const [payload, binary, expected] of [
    ["{", false, 1008],
    [JSON.stringify({ id: "buyer", side: "buyer", kind: "toString" }), false, 1008],
    [JSON.stringify({ ...hello("buyer"), extra: true }), false, 1008],
    [JSON.stringify({ id: "buyer", side: "buyer", kind: "beat", beat: "toString" }), false, 1008],
    [JSON.stringify(hello("buyer")), true, 1008],
    ["x".repeat(1025), false, 1009],
  ]) {
    const ws = await open();
    const closed = once(ws, "close");
    ws.send(payload, { binary });
    assert.equal((await closed)[0], expected);
  }
  const ws = await open();
  ws.send(JSON.stringify(hello("buyer")));
  const closed = once(ws, "close");
  ws.send(JSON.stringify(hello("seller")));
  assert.equal((await closed)[0], 1008);
});

test("rate limit and empty-room cleanup", async (t) => {
  const { open, rooms } = await setup(t, { maxMessages: 2 });
  const ws = await open();
  const closed = once(ws, "close");
  for (let i = 0; i < 3; i++) ws.send(JSON.stringify(hello("buyer")));
  assert.equal((await closed)[0], 1008);
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(rooms.size, 0);
});

test("unannounced connections expire and duplicate sides cannot pair", async (t) => {
  const { open, rooms } = await setup(t, { helloTimeout: 50 });
  const idle = await open();
  await once(idle, "close");
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(rooms.size, 0);
  const buyer = await open();
  buyer.send(JSON.stringify(hello("buyer")));
  const duplicate = await open();
  const closed = once(duplicate, "close");
  duplicate.send(JSON.stringify(hello("buyer", "duplicate")));
  assert.equal((await closed)[0], 1008);
});

test("known beats, ownership and bounded presenter steps", () => {
  for (const m of [
    { ...hello("buyer"), kind: "jump", from: 16 },
    { ...hello("buyer"), kind: "beat", beat: "counterSent" },
    { ...hello("buyer"), kind: "pause", paused: "yes" },
    null, [],
  ]) assert.equal(validMessage(m), false);
});

test("object kind and beat reject without coercion", () => {
  for (const value of [{ toString: null }, {}, [], null, 1]) {
    assert.equal(validMessage({ id: "buyer", side: "buyer", kind: value }), false);
    assert.equal(validMessage({ id: "buyer", side: "buyer", kind: "beat", beat: value }), false);
  }
});

test("object message fields close real sockets without losing health", { timeout: 2000 }, async (t) => {
  const { base, open } = await setup(t);
  for (const m of [
    { id: "buyer", side: "buyer", kind: { toString: null } },
    { id: "buyer", side: "buyer", kind: "beat", beat: { toString: null } },
  ]) {
    const ws = await open();
    const closed = once(ws, "close");
    ws.send(JSON.stringify(m));
    assert.equal((await closed)[0], 1008);
    const health = await fetch(base.replace("ws:", "http:") + "/health");
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { ok: true });
  }
});

test("raw malformed upgrade targets reject safely with origin checked first", { timeout: 2000 }, async (t) => {
  const { base } = await setup(t);
  for (const [target, origin, status] of [
    ["http://[", "https://evil.example", 403],
    ["http://[", "https://kevcassidy01.github.io", 400],
    [`http://relay.invalid/?room=${room}`, "https://kevcassidy01.github.io", 400],
    [`//relay.invalid/?room=${room}`, "https://kevcassidy01.github.io", 400],
  ]) {
    const socket = connect(Number(new URL(base).port), "127.0.0.1");
    t.after(() => socket.destroy());
    await once(socket, "connect");
    let response = "";
    socket.on("data", (data) => { response += data.toString(); });
    const ended = once(socket, "end");
    socket.write(`GET ${target} HTTP/1.1\r\nHost: localhost\r\nOrigin: ${origin}\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n\r\n`);
    await ended;
    assert.match(response, new RegExp(`^HTTP/1.1 ${status} `));
    const health = await fetch(base.replace("ws:", "http:") + "/health");
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { ok: true });
  }
});

test("production address requires explicit room and ws URL", () => {
  assert.equal(relayAddress("wss://relay.example", null), undefined);
  assert.equal(relayAddress("", room), undefined);
  assert.equal(relayAddress("https://relay.example", room), undefined);
  assert.equal(relayAddress("wss://relay.example", "short"), undefined);
  assert.equal(new URL(relayAddress("wss://relay.example", room)).searchParams.get("room"), room);
});

test("browser hello waits for open; reconnect and cleanup cancel stale work", async () => {
  const sockets = [];
  class FakeSocket {
    readyState = 0;
    sent = [];
    constructor() { sockets.push(this); }
    send(m) { this.sent.push(JSON.parse(m)); }
    close() { this.readyState = 3; this.onclose?.(); }
  }
  let closed = 0;
  let received = 0;
  const transport = connectRelay("wss://relay.example", () => received++,
    () => transport.send(hello("buyer")), () => closed++, FakeSocket, 5);
  assert.equal(sockets[0].sent.length, 0);
  sockets[0].readyState = 1;
  sockets[0].onopen();
  assert.deepEqual(sockets[0].sent, [hello("buyer")]);
  sockets[0].onmessage({ data: "{" });
  assert.equal(received, 0);
  sockets[0].close();
  await new Promise((r) => setTimeout(r, 15));
  assert.equal(sockets.length, 2);
  sockets[1].readyState = 1;
  sockets[1].onopen();
  assert.deepEqual(sockets[1].sent, [hello("buyer")]);
  sockets[1].close();
  transport.close();
  await new Promise((r) => setTimeout(r, 15));
  assert.equal(sockets.length, 2);
  assert.equal(closed, 2);
  assert.equal(sockets[1].onmessage, null);
});
