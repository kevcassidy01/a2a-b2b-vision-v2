import type { Experience, ExperienceId } from "./types";
import { quote } from "./quote";
import { checkout } from "./checkout";
import { insights } from "./insights";

export type { Experience, ExperienceId } from "./types";

/** Registry of the three journeys, keyed by id. */
export const EXPERIENCES: Record<ExperienceId, Experience> = {
  quote,
  checkout,
  insights,
};

/** Sidenav order — the three fixed chats, top to bottom. These ARE the journey
 *  selector; clicking one arms that experience and starts it from scratch. */
export const EXPERIENCE_ORDER: ExperienceId[] = ["quote", "checkout", "insights"];

/** The journey armed on load. */
export const DEFAULT_EXPERIENCE: ExperienceId = "quote";
