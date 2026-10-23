import { Check } from "lucide-react";
import type { ChoiceBlock } from "./types";

/**
 * ChoiceCard — a question Claude asks with a few answers, one click each, as
 * in the live app's ask-user prompt: the question, then each answer as a row
 * (its label, a muted line on what it means, and an optional tag such as
 * "Recommended"). Clicking one sends it as Aaron's reply; then the pick is
 * ticked and the others dim.
 */
export function ChoiceCard({ block, onPick }: { block: ChoiceBlock; onPick: (label: string) => void }) {
  const answered = block.picked !== undefined;
  return (
    <div className="animate-fade-in rounded-xl border border-border bg-surface p-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <p className="px-3 pb-2 pt-2 text-[15px] font-medium text-text">{block.question}</p>
      <div className="flex flex-col gap-1">
        {block.options.map((o, i) => {
          const picked = block.picked === o.label;
          return (
            <button
              key={o.label}
              type="button"
              disabled={answered}
              onClick={() => onPick(o.label)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
                answered ? (picked ? "bg-elevated" : "opacity-45") : "hover:bg-elevated"
              }`}
            >
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-md border text-[12px] ${
                  picked ? "border-text bg-text text-white" : "border-border text-text-muted"
                }`}
              >
                {picked ? <Check className="size-3.5" strokeWidth={2.5} /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] text-text">{o.label}</span>
                <span className="block text-[13px] text-text-subtle">{o.detail}</span>
              </span>
              {o.tag && !answered && (
                <span className="shrink-0 whitespace-nowrap rounded-full bg-elevated px-2 py-0.5 text-[12px] text-text-muted">
                  {o.tag}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
