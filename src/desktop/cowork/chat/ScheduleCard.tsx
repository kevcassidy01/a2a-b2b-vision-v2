import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Clock, CornerDownLeft } from "lucide-react";
import { copy } from "../../../copy/copy";
import { FactsTable } from "./FactsTable";
import { isTyping } from "./isTyping";
import type { CoworkBlock } from "./types";

type Schedule = Extract<CoworkBlock, { type: "schedule" }>;

/**
 * ScheduleCard — Claude's proposal for a scheduled task, after the live app's
 * Schedule card (docs/references/cowork/scheduled-task.png), built like
 * AgentCard:
 *   1. the header: clock tile, "Schedule task · name";
 *   2. a one-line summary;
 *   3. the meta line: when it runs, and chips for when it's ready and where it runs;
 *   4. "Details ⌄", opening a bordered box of the numbered steps each run
 *      takes, and on an edit, "Also changes: …";
 *   5. Schedule ↵ / Cancel Esc.
 * An edit folds the old card to one muted line ("Updated below"). Once
 * scheduled it folds to the live app's "Created scheduled task" row; its ›
 * opens a key-value table (FactsTable) of what was set up.
 */
export function ScheduleCard({ task, onSchedule, onCancel }: { task: Schedule; onSchedule: () => void; onCancel: () => void }) {
  const t = copy.desktop.cowork.chat;
  const proposed = task.status === "proposed";
  // Open on the proposal; the folded "Created scheduled task" row starts closed.
  const [details, setDetails] = useState(proposed);

  // ↵ schedules and Esc cancels, as the hints say, unless Aaron is mid-message (isTyping).
  useEffect(() => {
    if (!proposed) return;
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      if (e.key === "Enter") onSchedule();
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [proposed, onSchedule, onCancel]);

  if (task.status === "cancelled") return null;

  if (task.status === "superseded") {
    return (
      <div className="animate-fade-in flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-[15px] text-text-subtle">
        <Clock className="size-[18px] shrink-0" strokeWidth={1.75} />
        <span className="min-w-0 flex-1 truncate">
          {t.scheduleTask} · {task.name}
        </span>
        <span className="shrink-0 text-[14px]">{t.superseded}</span>
      </div>
    );
  }

  if (task.status === "scheduled") {
    return (
      <div className="animate-fade-in rounded-xl border border-border bg-surface">
        <button
          type="button"
          aria-expanded={details}
          onClick={() => setDetails((v) => !v)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px]"
        >
          <Clock className="size-[18px] shrink-0 text-text-muted" strokeWidth={1.75} />
          <span className="min-w-0 flex-1 truncate text-text">
            {t.createdTask} <span className="font-medium">{task.name}</span>
          </span>
          <span className="shrink-0 truncate text-[14px] text-text-subtle">{task.when}</span>
          <ChevronRight
            className={`size-4 shrink-0 text-text-subtle transition-transform duration-[var(--dur-fast)] ${details ? "rotate-90" : ""}`}
            strokeWidth={2}
          />
        </button>
        {details && (
          <div className="px-4 pb-4 pl-[46px]">
            <FactsTable facts={task.facts} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in rounded-xl border border-border bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md border border-border text-text-muted">
          <Clock className="size-[18px]" strokeWidth={1.75} />
        </span>
        <h3 className="text-[16px] text-text">
          <span className="font-semibold">{t.scheduleTask}</span>
          <span className="mx-2 text-text-subtle">·</span>
          {task.name}
        </h3>
      </div>

      <p className="mt-3 text-[15px] leading-relaxed text-text">{task.summary}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-[14px] text-text-muted">
        <span className="flex items-center gap-1.5">
          <Clock className="size-4 shrink-0" strokeWidth={1.75} />
          {task.when}
        </span>
        <span className="whitespace-nowrap rounded-md bg-accent/10 px-2 py-0.5 text-[12px] font-medium text-accent">{task.ready}</span>
        <span className="whitespace-nowrap rounded-md bg-elevated px-2 py-0.5 text-[12px] text-text-muted">{t.onThisComputer}</span>
      </div>

      <button
        type="button"
        aria-expanded={details}
        onClick={() => setDetails((v) => !v)}
        className="mt-4 flex items-center gap-1 text-[14px] text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-text"
      >
        <ChevronDown
          className={`size-4 transition-transform duration-[var(--dur-fast)] ${details ? "" : "-rotate-90"}`}
          strokeWidth={2}
        />
        {t.details}
      </button>

      {details && (
        <div className="mt-2 flex flex-col gap-3 rounded-lg border border-border bg-bg/60 p-4">
          <p className="text-[12px] font-medium uppercase tracking-wide text-text-subtle">{t.instructions}</p>
          <ol className="list-decimal space-y-1 pl-5 text-[14px] leading-relaxed text-text marker:text-text-subtle">
            {task.steps.map((step, i) => (
              // The step an edit adds lands with a fade, so it's easy to spot.
              <li key={step} className={`pl-1 ${task.changes && i === task.steps.length - 1 ? "animate-fade-in font-medium" : ""}`}>
                {step}
              </li>
            ))}
          </ol>
          {task.changes && (
            <p className="text-[13px] text-text-muted">
              {t.alsoChanges}{" "}
              {task.changes.map((c) => (
                <code key={c} className="rounded-md bg-skill-chunk px-1.5 py-0.5 font-mono text-[12px]">
                  {c}
                </code>
              ))}
            </p>
          )}
        </div>
      )}

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={onSchedule}
          className="flex h-9 items-center gap-2 rounded-md bg-text px-4 text-[14px] font-medium text-white transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:opacity-85"
        >
          {t.schedule}
          <CornerDownLeft className="size-3.5 opacity-70" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-9 items-center gap-2 rounded-md border border-border px-4 text-[14px] text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated"
        >
          {t.cancel}
          <span className="text-[12px] text-text-subtle">Esc</span>
        </button>
      </div>
    </div>
  );
}
