import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
export { OWNER } from "./protocol.js";

/**
 * Who's at it, for the who's-acting bar: an agent while it works, a person
 * while it's their turn (a decision waits on them). One of the bar's four, or
 * one of them and what it's for ("alexAgent:inbox"), so two parts of the app
 * can each light the same one without turning the other's off.
 */
export type Doing = `${"john" | "johnAgent" | "alexAgent" | "alex"}${"" | `:${string}`}`;

/**
 * What one side of the stage has done that the other side sees, and which
 * agents are at work (for the who's-acting bar). So far seven beats: John's
 * agent has sent the quote request (Q-1042 v1) to Fizz (the phone's agent sets
 * it once the quote is out); Fizz's agent has sent its counter-offer, v2 (set
 * from its chat); John's agent has taken v2's quantities and held out for 15%
 * (set from the phone); Fizz's agent has handed it to Alex (15% is past its
 * limit); Alex chose to send both, and v3a and v3b are out (both set from the
 * seller agent's chat); John approved v3a and his agent has accepted it with
 * Fizz; and his agent has placed order O-5531 (both set from the phone). Each
 * agent reports itself working while it is, and each side reports its person
 * while a decision waits on them.
 */
type Story = {
  /** The story step this run started from (1, the top, unless the presenter jumped), so each part can start where that step begins. */
  from: number;
  quoteSent: boolean;
  sendQuote: () => void;
  counterSent: boolean;
  sendCounter: () => void;
  heldOut: boolean;
  holdOut: () => void;
  askedAlex: boolean;
  askAlex: () => void;
  v3Sent: boolean;
  sendV3: () => void;
  accepted: boolean;
  accept: () => void;
  ordered: boolean;
  placeOrder: () => void;
  /** Makes a move by name: for a page showing one side, when the other side's move arrives or is stood in for (SidePage). */
  fire: (beat: Beat) => void;
  working: ReadonlySet<Doing>;
  setWorking: (who: Doing, on: boolean) => void;
};

const StoryContext = createContext<Story>({
  from: 1,
  quoteSent: false,
  sendQuote: () => {},
  counterSent: false,
  sendCounter: () => {},
  heldOut: false,
  holdOut: () => {},
  askedAlex: false,
  askAlex: () => {},
  v3Sent: false,
  sendV3: () => {},
  accepted: false,
  accept: () => {},
  ordered: false,
  placeOrder: () => {},
  fire: () => {},
  working: new Set(),
  setWorking: () => {},
});

/** The moves one side makes that the other side sees (the booleans above). */
export type Beat = "quoteSent" | "counterSent" | "heldOut" | "askedAlex" | "v3Sent" | "accepted" | "ordered";

/** Whose move each one is: John's side (the phone) or Fizz's (the Command Center). */

/** The step from which each move has already happened, on a run that jumps there. */
const DONE_FROM: Record<Beat, number> = { quoteSent: 6, counterSent: 9, heldOut: 10, askedAlex: 11, v3Sent: 12, accepted: 14, ordered: 15 };

/** Starting `from` a later step (a jump), the beats before it have already happened. */
export function StoryProvider({ from = 1, children }: { from?: number; children: ReactNode }) {
  const [beats, setBeats] = useState(() => {
    const b = {} as Record<Beat, boolean>;
    for (const k of Object.keys(DONE_FROM) as Beat[]) b[k] = from >= DONE_FROM[k];
    return b;
  });
  const [working, setWorkingSet] = useState<ReadonlySet<Doing>>(new Set());
  const setWorking = useCallback((agent: Doing, on: boolean) => {
    setWorkingSet((s) => {
      if (s.has(agent) === on) return s;
      const next = new Set(s);
      if (on) next.add(agent);
      else next.delete(agent);
      return next;
    });
  }, []);
  const fire = useCallback((beat: Beat) => setBeats((b) => (b[beat] ? b : { ...b, [beat]: true })), []);
  const sendQuote = useCallback(() => fire("quoteSent"), [fire]);
  const sendCounter = useCallback(() => fire("counterSent"), [fire]);
  const holdOut = useCallback(() => fire("heldOut"), [fire]);
  const askAlex = useCallback(() => fire("askedAlex"), [fire]);
  const sendV3 = useCallback(() => fire("v3Sent"), [fire]);
  const accept = useCallback(() => fire("accepted"), [fire]);
  const placeOrder = useCallback(() => fire("ordered"), [fire]);
  const story = useMemo(
    () => ({ from, ...beats, fire, sendQuote, sendCounter, holdOut, askAlex, sendV3, accept, placeOrder, working, setWorking }),
    [from, beats, fire, sendQuote, sendCounter, holdOut, askAlex, sendV3, accept, placeOrder, working, setWorking],
  );
  return <StoryContext.Provider value={story}>{children}</StoryContext.Provider>;
}

export const useStory = () => useContext(StoryContext);

/**
 * How far into its turn a clock starts, in ms, on a run that jumped `from` a
 * step: from step `over` on, the turn's already over (past `end`); at a step
 * in `at`, that far in; otherwise from its start.
 */
export function skipTo(from: number, end: number, over: number, at: Partial<Record<number, number>> = {}) {
  return from >= over ? end + 1 : (at[from] ?? 0);
}
