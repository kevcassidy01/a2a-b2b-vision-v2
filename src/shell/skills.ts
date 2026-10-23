import { copy } from "../copy/copy";

/**
 * Slash-skill catalog.
 *
 * Skills are the pre-authored commands that either ship by default or come
 * with a connector — a shorthand the user drops into the prompt instead of
 * typing a long instruction. The ids double as the displayed label (lowercase,
 * hyphen-separated) and as the text serialized into the sent prompt (`/id`).
 *
 * Two kinds:
 *   - `default`   — always available, rendered as a grey chunk.
 *   - `salesforce`— available only when the Commerce connector is on, rendered
 *                   as a light-blue chunk (`ask` + `report` lead the list).
 *
 * The id lists live in `copy.ts`; this module adds the typed shape + the
 * availability/lookup helpers the composer uses.
 */
export type SkillKind = "default" | "salesforce";

export interface Skill {
  id: string;
  kind: SkillKind;
}

const DEFAULT_SKILLS: Skill[] = copy.shell.composer.skills.defaultItems.map(
  (id) => ({ id, kind: "default" }),
);

const SALESFORCE_SKILLS: Skill[] = copy.shell.composer.skills.salesforceItems.map(
  (id) => ({ id, kind: "salesforce" }),
);

/**
 * The skills available given the connector state — default section first, then
 * the Salesforce section (only when the Commerce connector is on). This is the
 * canonical order the menu renders in.
 */
export function availableSkills(commerce: boolean): Skill[] {
  return commerce ? [...DEFAULT_SKILLS, ...SALESFORCE_SKILLS] : [...DEFAULT_SKILLS];
}

/** How many of `availableSkills(commerce)` are default (i.e. where the
 *  Salesforce section starts) — used to place the menu separator. */
export function defaultSkillCount(): number {
  return DEFAULT_SKILLS.length;
}

/** Exact-id lookup among the *currently available* skills (drives the
 *  type-then-space auto-convert; Salesforce ids only resolve when connected). */
export function findSkill(id: string, commerce: boolean): Skill | undefined {
  return availableSkills(commerce).find((s) => s.id === id);
}
