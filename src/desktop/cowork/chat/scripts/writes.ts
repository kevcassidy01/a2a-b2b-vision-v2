import { WRITE_MS, type Beat, type IntegrationStep } from "../types";

/** How long a write step works: its records land WRITE_MS apart, then a beat to settle. */
const writeMs = (step: IntegrationStep) => (step.writes?.length ?? 0) * WRITE_MS + 700;

/** Plays a write timeline: it lands, then each step resolves when its records
 *  have, moving the plan along (`ids`: the plan item per step, if any). */
export const writing = (
  steps: IntegrationStep[],
  thinking: string[],
  ids: (string | null)[] = [],
  after: string | null = null,
): Beat[] => [
  { wait: 300, thinking: thinking[0], block: { type: "integrations", steps, shown: 0 } },
  ...steps.map((step, i): Beat => {
    const id = ids[i];
    const next = i + 1 < steps.length ? ids[i + 1] : after;
    return {
      wait: writeMs(step),
      grow: true,
      thinking: thinking[i + 1],
      planStatus: id ? (next ? { [id]: "done", [next]: "now" } : { [id]: "done" }) : undefined,
    };
  }),
];
