import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/** The two agents, by their place in the who's-acting bar. */
export type AgentActor = "johnAgent" | "alexAgent";

/**
 * What one side of the stage has done that the other side sees, and which
 * agents are at work (for the who's-acting bar). So far three beats: John's
 * agent has sent the quote request (Q-1042 v1) to Fizz (the phone's agent sets
 * it once the quote is out); Fizz's agent has sent its counter-offer, v2 (set
 * from its chat); John's agent has taken v2's quantities and held out for 15%
 * (set from the phone). Each agent reports itself working while it is.
 */
type Story = {
  quoteSent: boolean;
  sendQuote: () => void;
  counterSent: boolean;
  sendCounter: () => void;
  heldOut: boolean;
  holdOut: () => void;
  working: ReadonlySet<AgentActor>;
  setWorking: (agent: AgentActor, on: boolean) => void;
};

const StoryContext = createContext<Story>({
  quoteSent: false,
  sendQuote: () => {},
  counterSent: false,
  sendCounter: () => {},
  heldOut: false,
  holdOut: () => {},
  working: new Set(),
  setWorking: () => {},
});

export function StoryProvider({ children }: { children: ReactNode }) {
  const [quoteSent, setQuoteSent] = useState(false);
  const [counterSent, setCounterSent] = useState(false);
  const [heldOut, setHeldOut] = useState(false);
  const [working, setWorkingSet] = useState<ReadonlySet<AgentActor>>(new Set());
  const setWorking = useCallback((agent: AgentActor, on: boolean) => {
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
  const story = useMemo(
    () => ({ quoteSent, sendQuote, counterSent, sendCounter, heldOut, holdOut, working, setWorking }),
    [quoteSent, sendQuote, counterSent, sendCounter, heldOut, holdOut, working, setWorking],
  );
  return <StoryContext.Provider value={story}>{children}</StoryContext.Provider>;
}

export const useStory = () => useContext(StoryContext);
