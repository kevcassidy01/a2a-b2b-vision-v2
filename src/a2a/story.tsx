import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/** The two agents, by their place in the who's-acting bar. */
export type AgentActor = "johnAgent" | "alexAgent";

/**
 * What one side of the stage has done that the other side sees, and which
 * agents are at work (for the who's-acting bar). So far one beat: John's agent
 * has sent the quote request (Q-1042 v1) to Fizz. Both sides read it; the
 * phone's agent sets it once the quote is out. Each agent reports itself
 * working while it is.
 */
type Story = {
  quoteSent: boolean;
  sendQuote: () => void;
  working: ReadonlySet<AgentActor>;
  setWorking: (agent: AgentActor, on: boolean) => void;
};

const StoryContext = createContext<Story>({
  quoteSent: false,
  sendQuote: () => {},
  working: new Set(),
  setWorking: () => {},
});

export function StoryProvider({ children }: { children: ReactNode }) {
  const [quoteSent, setQuoteSent] = useState(false);
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
  const story = useMemo(
    () => ({ quoteSent, sendQuote, working, setWorking }),
    [quoteSent, sendQuote, working, setWorking],
  );
  return <StoryContext.Provider value={story}>{children}</StoryContext.Provider>;
}

export const useStory = () => useContext(StoryContext);
