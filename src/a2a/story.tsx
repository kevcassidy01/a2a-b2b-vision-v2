import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/** The two agents, by their place in the who's-acting bar. */
export type AgentActor = "johnAgent" | "alexAgent";

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
 * agent reports itself working while it is.
 */
type Story = {
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

export function StoryProvider({ children }: { children: ReactNode }) {
  const [quoteSent, setQuoteSent] = useState(false);
  const [counterSent, setCounterSent] = useState(false);
  const [heldOut, setHeldOut] = useState(false);
  const [askedAlex, setAskedAlex] = useState(false);
  const [v3Sent, setV3Sent] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [ordered, setOrdered] = useState(false);
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
  const askAlex = useCallback(() => setAskedAlex(true), []);
  const sendV3 = useCallback(() => setV3Sent(true), []);
  const accept = useCallback(() => setAccepted(true), []);
  const placeOrder = useCallback(() => setOrdered(true), []);
  const story = useMemo(
    () => ({ quoteSent, sendQuote, counterSent, sendCounter, heldOut, holdOut, askedAlex, askAlex, v3Sent, sendV3, accepted, accept, ordered, placeOrder, working, setWorking }),
    [quoteSent, sendQuote, counterSent, sendCounter, heldOut, holdOut, askedAlex, askAlex, v3Sent, sendV3, accepted, accept, ordered, placeOrder, working, setWorking],
  );
  return <StoryContext.Provider value={story}>{children}</StoryContext.Provider>;
}

export const useStory = () => useContext(StoryContext);
