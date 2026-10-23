import type { ScriptedResponse } from "../types";

/**
 * Experiences — the three authored Salesforce commerce journeys.
 *
 * The shell is one chat surface; the *content* that fakes "Claude" is split per
 * journey into one module each (`quote.ts`, `checkout.ts`, `insights.ts`). Each
 * exports an `Experience`: a title (shown in the sidenav + top bar) and the two
 * scripted-beat resolvers the store drives off (`getResponse` for a typed
 * prompt, `getAction` for an in-app button). The sidenav's three fixed chats ARE
 * the journey selector — clicking one arms that experience and starts it fresh.
 */

/** The three fixed journeys. */
export type ExperienceId = "quote" | "checkout" | "insights";

export interface Experience {
  id: ExperienceId;
  /** Shown as the sidenav chat label and the top-bar title. */
  title: string;
  /** Match a typed prompt to a scripted beat (slash commands first, then
   *  keywords). */
  getResponse: (prompt: string) => ScriptedResponse;
  /** Play a beat triggered by an in-app button (no user bubble). */
  getAction: (key: string) => ScriptedResponse | undefined;
  /** The prompts the presenter would type, in demo order, for the mic to
   *  dictate instead: it offers the one after the last sent. A prompt that's
   *  only a `/skill` isn't here; it's still typed. */
  dictations?: string[];
  /** Optional: note a silent in-app state change that plays no beat (e.g. a
   *  promotion switched on), so later beats can reflect it. */
  onEvent?: (key: string) => void;
  /** Optional: clear any state the script keeps across beats (e.g. checkout's
   *  open cart + placed orders). Called whenever the journey starts fresh. */
  reset?: () => void;
}
