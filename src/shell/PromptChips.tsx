import { CodeXml, GraduationCap, Palette } from "lucide-react";
import { copy } from "../copy/copy";

/**
 * PromptChips — the suggestion pills below the composer (empty/home state).
 *
 * Claude.ai's row (Write · Learn · Code) recast as Salesforce actions; the
 * design-system chip swaps Write's pencil for a palette. Presentational: pill
 * buttons with a muted icon + label, no behavior. Labels come from copy;
 * icons are paired here by position.
 */
const ICONS = [Palette, CodeXml, GraduationCap];

export function PromptChips() {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {copy.shell.suggestions.map((label, i) => {
        const Icon = ICONS[i];
        return (
          <button
            key={label}
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-prompt-border bg-surface pl-2 pr-2.5 text-[16px] text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated"
          >
            <Icon className="size-[18px] text-text-muted" strokeWidth={2} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
