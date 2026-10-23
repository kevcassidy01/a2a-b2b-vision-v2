import { useEffect } from "react";
import { Check, CornerDownLeft, Info, Lightbulb, ShieldCheck } from "lucide-react";
import { copy } from "../../../copy/copy";
import { AppLogo } from "./AppLogo";
import { FactsTable } from "./FactsTable";
import { isTyping } from "./isTyping";
import type { ApprovalBlock } from "./types";

/**
 * ApprovalCard — something Claude won't do without Aaron's OK, built like
 * ScheduleCard: a "Needs your OK" header, the ask and why, a key-value table
 * (FactsTable) of what changes, then the approve button ↵ / Not now Esc.
 * Once decided it folds to one line. A recommendation (`recommend`) has its
 * own header, an info note on why Claude picked it (each reason with its
 * source), and its own label for the other button (e.g. "Send without it").
 */
export function ApprovalCard({ block, onApprove, onDecline }: { block: ApprovalBlock; onApprove: () => void; onDecline: () => void }) {
  const t = copy.desktop.cowork.chat.approval;
  const proposed = block.status === "proposed";
  const rec = block.recommend;

  // ↵ approves and Esc declines, unless Aaron is mid-message (isTyping).
  useEffect(() => {
    if (!proposed) return;
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      if (e.key === "Enter") onApprove();
      if (e.key === "Escape") onDecline();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [proposed, onApprove, onDecline]);

  if (!proposed) {
    const approved = block.status === "approved";
    return (
      <div className="animate-fade-in flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-[15px]">
        {approved ? (
          <Check className="size-[18px] shrink-0 text-success" strokeWidth={2} />
        ) : (
          <ShieldCheck className="size-[18px] shrink-0 text-text-subtle" strokeWidth={1.75} />
        )}
        <span className={`min-w-0 flex-1 truncate ${approved ? "text-text" : "text-text-subtle"}`}>
          {rec ? (
            <span className="font-medium">{approved ? rec.folded.approved : rec.folded.declined}</span>
          ) : (
            <>
              {approved ? t.approved : t.declined} <span className="font-medium">{block.title}</span>
            </>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in rounded-xl border border-border bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md border border-border text-text-muted">
          {rec ? <Lightbulb className="size-[18px]" strokeWidth={1.75} /> : <ShieldCheck className="size-[18px]" strokeWidth={1.75} />}
        </span>
        <h3 className="text-[16px] text-text">
          <span className="font-semibold">{rec ? rec.header : t.needsOk}</span>
          <span className="mx-2 text-text-subtle">·</span>
          {block.title}
        </h3>
      </div>

      <p className="mt-3 text-[15px] leading-relaxed text-text">{block.summary}</p>

      {rec && (
        <div className="mt-4 rounded-lg bg-app-link/[0.06] p-4">
          <p className="flex items-center gap-2 text-[14px] font-medium text-text">
            <Info className="size-4 text-app-link" strokeWidth={2} />
            {t.why}
          </p>
          <ul className="mt-2.5 space-y-2">
            {rec.why.map((w) => (
              <li key={w.text} className="flex items-start justify-between gap-4 pl-6 text-[14px] leading-5 text-text">
                <span>{w.text}</span>
                <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-surface px-2 py-0.5 text-[12px] text-text-muted">
                  <AppLogo app={w.source.app} className="size-3.5" />
                  {w.source.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-border bg-bg/60 p-4">
        <FactsTable facts={block.details} />
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={onApprove}
          className="flex h-9 items-center gap-2 rounded-md bg-text px-4 text-[14px] font-medium text-white transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:opacity-85"
        >
          {block.approve}
          <CornerDownLeft className="size-3.5 opacity-70" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={onDecline}
          className="flex h-9 items-center gap-2 rounded-md border border-border px-4 text-[14px] text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated"
        >
          {rec ? rec.decline : t.notNow}
          <span className="text-[12px] text-text-subtle">Esc</span>
        </button>
      </div>
    </div>
  );
}
