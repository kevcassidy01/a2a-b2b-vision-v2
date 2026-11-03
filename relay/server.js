import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import { WebSocketServer, WebSocket } from "ws";
import { validMessage, validRoom } from "../src/a2a/protocol.js";

const DEFAULT_ORIGINS = ["https://kevcassidy01.github.io", "http://localhost:5173", "http://127.0.0.1:5173"];

export function createRelay({ origins = DEFAULT_ORIGINS, maxRooms = 100, maxClients = 2, maxPayload = 1024, maxMessages = 60, helloTimeout = 5000 } = {}) {
  const rooms = new Map();
  const server = createServer((req, res) => {
    res.writeHead(req.url === "/health" ? 200 : 404, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    res.end(JSON.stringify(req.url === "/health" ? { ok: true } : { error: "not found" }));
  });
  const wss = new WebSocketServer({ noServer: true, maxPayload, perMessageDeflate: false });
  server.on("upgrade", (req, socket, head) => {
    const reject = (code) => { socket.end(`HTTP/1.1 ${code} Rejected\r\nConnection: close\r\n\r\n`); };
    if (!origins.includes(req.headers.origin)) return reject(403);
    // Accept origin-form only, never an absolute or protocol-relative target.
    if (typeof req.url !== "string" || !req.url.startsWith("/") || req.url.startsWith("//")) return reject(400);
    let url;
    try { url = new URL(req.url, "http://relay.invalid"); } catch { return reject(400); }
    const room = url.searchParams.get("room");
    if (url.pathname !== "/" || !validRoom(room)) return reject(400);
    if ((!rooms.has(room) && rooms.size >= maxRooms) || (rooms.get(room)?.size ?? 0) >= maxClients) return reject(503);
    wss.handleUpgrade(req, socket, head, (ws) => {
      const members = rooms.get(room) ?? new Set();
      rooms.set(room, members);
      members.add(ws);
      let identity;
      let count = 0;
      let since = Date.now();
      const helloDeadline = setTimeout(() => {
        if (!identity) ws.terminate();
      }, helloTimeout);
      helloDeadline.unref();
      ws.alive = true;
      ws.on("pong", () => { ws.alive = true; });
      ws.on("error", () => {});
      ws.on("close", () => {
        clearTimeout(helloDeadline);
        members.delete(ws);
        if (!members.size) rooms.delete(room);
      });
      ws.on("message", (data, binary) => {
        if (Date.now() - since >= 10000) { since = Date.now(); count = 0; }
        if (++count > maxMessages) return ws.close(1008, "rate limit");
        let m;
        try {
          m = JSON.parse(data.toString());
          if (binary || !validMessage(m)) return ws.close(1008, "invalid message");
        } catch { return ws.close(1008, "invalid message"); }
        if (identity && (identity.id !== m.id || identity.side !== m.side)) return ws.close(1008, "identity changed");
        if (!identity) {
          if (m.kind !== "here" || !m.hello) return ws.close(1008, "hello required");
          if ([...members].some((p) => p !== ws && p.side === m.side)) return ws.close(1008, "side occupied");
          identity = { id: m.id, side: m.side };
          clearTimeout(helloDeadline);
          ws.side = m.side;
        }
        for (const peer of members) {
          if (peer !== ws && peer.readyState === WebSocket.OPEN) {
            if (peer.bufferedAmount > maxPayload * 8) peer.terminate();
            else peer.send(JSON.stringify(m));
          }
        }
      });
    });
  });
  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.alive) ws.terminate();
      else { ws.alive = false; ws.ping(); }
    }
  }, 10000);
  heartbeat.unref();
  return { server, rooms, close: async () => {
    clearInterval(heartbeat);
    for (const ws of wss.clients) ws.terminate();
    await new Promise((resolve) => wss.close(resolve));
    await new Promise((resolve) => server.close(resolve));
  } };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const relay = createRelay();
  relay.server.listen(Number(process.env.PORT || 3000), "0.0.0.0");
  process.on("SIGTERM", () => { void relay.close(); });
}
