import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

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
  working: new Set(),
  setWorking: () => {},
});

/** Starting `from` a later step (a jump), the beats before it have already happened. */
export function StoryProvider({ from = 1, children }: { from?: number; children: ReactNode }) {
  const [quoteSent, setQuoteSent] = useState(from >= 6);
  const [counterSent, setCounterSent] = useState(from >= 9);
  const [heldOut, setHeldOut] = useState(from >= 10);
  const [askedAlex, setAskedAlex] = useState(from >= 11);
  const [v3Sent, setV3Sent] = useState(from >= 12);
  const [accepted, setAccepted] = useState(from >= 14);
  const [ordered, setOrdered] = useState(from >= 15);
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
  const sendQuote = useCallback(() => setQuoteSent(true), []);
  const sendCounter = useCallback(() => setCounterSent(true), []);
  const holdOut = useCallback(() => setHeldOut(true), []);
  const askAlex = useCallback(() => setAskedAlex(true), []);
  const sendV3 = useCallback(() => setV3Sent(true), []);
  const accept = useCallback(() => setAccepted(true), []);
  const placeOrder = useCallback(() => setOrdered(true), []);
  const story = useMemo(
    () => ({ from, quoteSent, sendQuote, counterSent, sendCounter, heldOut, holdOut, askedAlex, askAlex, v3Sent, sendV3, accepted, accept, ordered, placeOrder, working, setWorking }),
    [from, quoteSent, sendQuote, counterSent, sendCounter, heldOut, holdOut, askedAlex, askAlex, v3Sent, sendV3, accepted, accept, ordered, placeOrder, working, setWorking],
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
