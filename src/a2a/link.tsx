import { useCallback, useEffect, useRef, useState } from "react";
import { demoTimeout } from "./demoClock";
import { OWNER, useStory, type Beat } from "./story";
import { validMessage } from "./protocol.js";
import { connectRelay, relayAddress } from "./transport.js";

/**
 * The link between the two pages (no split screen): John's phone at /buyer and
 * Alex's Command Center at /seller, each on its own device. Run with
 * `npm run demo`, both pages are served by the one dev server, and its socket
 * (Vite's own, relayed by the a2a-link plugin in vite.config.ts) carries each
 * side's moves, and the presenter's restart, jump and pause, to the other.
 * Production uses VITE_RELAY_URL only with an explicit ?room= token.
 * With no other side there (or no configured server), a page
 * plays the missing side's moves itself, on that side's timings (StandIn).
 */
export type Side = "buyer" | "seller";

/** Which side the URL asks for: /buyer or /seller (or #buyer, #seller, for the one-file share build); none for the split screen. */
export function sideFromUrl(): Side | undefined {
  const at = `${window.location.pathname} ${window.location.hash}`;
  return /\bbuyer\b/.test(at) ? "buyer" : /\bseller\b/.test(at) ? "seller" : undefined;
}

type Msg = { id: string; side: Side } & (
  | { kind: "here"; hello?: boolean }
  | { kind: "beat"; beat: Beat }
  | { kind: "jump"; from: number }
  | { kind: "pause"; paused: boolean }
);
type Body = Msg extends infer M ? (M extends Msg ? Omit<M, "id" | "side"> : never) : never;

const EVENT = "a2a:link";
/** This page, so it can tell its own messages from the other side's. */
const ID = Math.random().toString(36).slice(2);
const hot = import.meta.hot;
const address = relayAddress(import.meta.env.VITE_RELAY_URL, new URLSearchParams(window.location.search).get("room"));
const listeners = new Set<(m: Msg) => void>();
let connection: ReturnType<typeof connectRelay> | undefined;

function send(side: Side, body: Body) {
  hot?.send(EVENT, { ...body, id: ID, side });
  if (!hot) connection?.send({ ...body, id: ID, side });
}

function listen(fn: (m: Msg) => void) {
  const on = (m: Msg) => {
    if (validMessage(m) && m.id !== ID) fn(m);
  };
  if (hot) {
    hot.on(EVENT, on);
    return () => hot.off(EVENT, on);
  }
  listeners.add(on);
  return () => { listeners.delete(on); };
}

/** How often a page says it's there, and how long without word before the other side counts as gone, in ms. */
const HEARTBEAT = 2000;
const GONE_AFTER = 5000;

/**
 * The link for a page showing one `side`: whether the other side is there, and
 * the presenter's moves sent across. `jumpHere` and `pauseHere` apply what
 * arrives without sending it back. When the other side's page opens, this one
 * restarts from the top, so the two start together.
 */
export function useLink(side: Side | undefined, jumpHere: (step: number) => void, pauseHere: (p: boolean) => void) {
  const [peer, setPeer] = useState(Boolean(side && (hot || address)));
  const heard = useRef(0);
  const here = useRef({ jumpHere, pauseHere });
  here.current = { jumpHere, pauseHere };
  useEffect(() => {
    setPeer(Boolean(side && (hot || address)));
    heard.current = 0;
    if (!side || (!hot && !address)) return;
    const started = performance.now();
    const off = listen((m) => {
      if (m.kind === "jump") return here.current.jumpHere(m.from);
      if (m.kind === "pause") return here.current.pauseHere(m.paused);
      if (m.kind !== "here" || m.side === side) return;
      const newlyPaired = heard.current === 0 || performance.now() - heard.current > GONE_AFTER;
      heard.current = performance.now();
      setPeer(true);
      if (m.hello || newlyPaired) {
        send(side, { kind: "here" });
        here.current.jumpHere(1);
      }
    });
    if (hot) send(side, { kind: "here", hello: true });
    else connection = connectRelay(address!, (m) => {
      for (const listener of listeners) listener(m as Msg);
    }, () => send(side, { kind: "here", hello: true }), () => {
      heard.current = 0;
      setPeer(false);
    });
    const id = window.setInterval(() => {
      send(side, { kind: "here" });
      if (performance.now() - (heard.current || started) > GONE_AFTER) setPeer(false);
    }, HEARTBEAT);
    return () => {
      off();
      clearInterval(id);
      connection?.close();
      connection = undefined;
    };
  }, [side]);
  const jump = useCallback((step: number) => side && send(side, { kind: "jump", from: step }), [side]);
  const pause = useCallback((p: boolean) => side && send(side, { kind: "pause", paused: p }), [side]);
  return { peer, jump, pause };
}

const BEATS = Object.keys(OWNER) as Beat[];

/** Inside the story: sends this side's moves as they're made, and makes the other side's as they arrive. */
export function Relay({ side }: { side: Side }) {
  const story = useStory();
  const { fire } = story;
  const sent = useRef(new Set<Beat>());
  const mine = BEATS.filter((b) => OWNER[b] === side && story[b]).join();
  useEffect(() => {
    for (const b of mine.split(",") as Beat[]) {
      if (!b || sent.current.has(b)) continue;
      sent.current.add(b);
      send(side, { kind: "beat", beat: b });
    }
  }, [side, mine]);
  useEffect(
    () =>
      listen((m) => {
        if (m.kind === "beat" && m.side !== side && OWNER[m.beat] !== side) fire(m.beat);
      }),
    [side, fire],
  );
  return null;
}

/** One of the missing side's moves: made `ms` after the move it answers (`after`; none: from the start). */
export type Cue = { beat: Beat; after: Beat | null; ms: number };

/** Inside the story: plays the missing side's moves on its timings (each script exports its own cues). */
export function StandIn({ cues }: { cues: readonly Cue[] }) {
  return cues.map((c) => <CueTimer key={c.beat} {...c} />);
}

function CueTimer({ beat, after, ms }: Cue) {
  const story = useStory();
  const { fire } = story;
  const ready = after === null || story[after];
  const done = story[beat];
  useEffect(() => {
    if (!ready || done) return;
    return demoTimeout(() => fire(beat), ms);
  }, [ready, done, beat, ms, fire]);
  return null;
}
