import { useSyncExternalStore } from "react";

/**
 * The demo's clock: the story's time, which stops while the presenter has it
 * paused (the ` key). Everything that times the story (the chats' clocks, the
 * one-off timers) reads it, so a pause holds them all where they are and play
 * picks them up from there. CSS animations pause with it (.a2a-stage[data-paused]).
 */
let paused = false;
let pausedAt = 0;
/** How long the demo has spent paused, in ms. */
let away = 0;
const listeners = new Set<() => void>();

/** The story's time, in ms: the page's time less any spent paused. */
export function demoNow() {
  return (paused ? pausedAt : performance.now()) - away;
}

export function setPaused(p: boolean) {
  if (p === paused) return;
  if (p) pausedAt = performance.now();
  else away += performance.now() - pausedAt;
  paused = p;
  listeners.forEach((f) => f());
}

function subscribe(f: () => void) {
  listeners.add(f);
  return () => {
    listeners.delete(f);
  };
}

/** Whether the demo is paused. */
export function usePaused() {
  return useSyncExternalStore(subscribe, () => paused);
}

/** Calls `fn` once `ms` of story time has passed (it waits out any pause); returns a cancel. */
export function demoTimeout(fn: () => void, ms: number) {
  const due = demoNow() + ms;
  let id = 0;
  const arm = () => {
    clearTimeout(id);
    if (!paused) id = window.setTimeout(fire, Math.max(0, due - demoNow()));
  };
  const fire = () => {
    off();
    fn();
  };
  const off = subscribe(arm);
  arm();
  return () => {
    clearTimeout(id);
    off();
  };
}

/** Whether a key press is typing in a field (a prompt box), so not the presenter's. */
export function isTyping(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null;
  return !!el && (el.isContentEditable || el.tagName === "INPUT" || el.tagName === "TEXTAREA");
}
