import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Delta, Pill, Tone } from "../types";

/** Tone → pill skin (the status tokens; app content only, never host chrome). */
export const TONE_SKIN: Record<Tone, string> = {
  neutral: "bg-elevated text-text-muted",
  success: "bg-success-soft text-success",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  danger: "bg-slot-placeholder text-danger",
};

/** A status pill at the insight label size (14px — the legibility floor). */
export function InsightPill({ pill }: { pill: Pill }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-label font-medium ${TONE_SKIN[pill.tone]}`}>
      {pill.label}
    </span>
  );
}

const ARROW = { up: ArrowUpRight, down: ArrowDownRight, flat: ArrowRight } as const;

/** A change pill: arrow + label (e.g. ↗ 6%). Tone carries good/bad; the arrow
 *  only shows direction, so "returns ↘ 0.7 pts" can still read green. */
export function DeltaPill({ delta }: { delta: Delta }) {
  const Icon = delta.direction ? ARROW[delta.direction] : null;
  return (
    <span
      className={`whitespace-nowrap inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label font-medium tabular-nums ${TONE_SKIN[delta.tone]}`}
    >
      {Icon && <Icon className="size-3.5" strokeWidth={2.5} />}
      {delta.label}
    </span>
  );
}
