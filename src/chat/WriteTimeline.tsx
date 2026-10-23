import { useEffect, useState } from "react";
import { Check, ChevronRight, LoaderCircle } from "lucide-react";
import type { WriteRecord, WriteStep } from "./types";

/**
 * WriteTimeline — "Writing to Salesforce", then "Wrote N records to
 * Salesforce ›": every write Claude makes, shown atop the reply it leads to
 * (the look of desktop Cowork's write timeline, kept separate from it).
 *
 * Each step is the Salesforce logo in a rounded tile, a plain-language action,
 * the `dispatch_write` call behind it, then its records landing one at a time
 * (the newest spins until the next lands): insert, update or delete, the
 * object, the record and the fields set. Once its records are in, the step's
 * result chip lands and the next step starts. Driven by one clock from mount,
 * so `writesMs` tells the store how long to wait before the reply's text.
 *
 * Like the tool timeline, the latest reply's stays open and earlier ones fold
 * to the header (its chevron reopens them). An earlier one never replays.
 */

/** How long apart a step's records land. */
const WRITE_MS = 500;
/** The beat after a step's last record before the next step starts. */
const STEP_GAP_MS = 300;
const TICK_MS = 100;

const stepMs = (s: WriteStep) => s.records.length * WRITE_MS + STEP_GAP_MS;

/** How long a write timeline takes to play out. */
export const writesMs = (steps: WriteStep[]) => steps.reduce((n, s) => n + stepMs(s), 0);

const OP_STYLE: Record<WriteRecord["op"], string> = {
  insert: "bg-success-soft text-success",
  update: "bg-app-link/10 text-app-link",
  delete: "bg-danger/10 text-danger",
};

export function WriteTimeline({ steps, latest }: { steps: WriteStep[]; latest: boolean }) {
  const total = writesMs(steps);
  const [elapsed, setElapsed] = useState(latest ? 0 : total);
  const [open, setOpen] = useState(latest);
  useEffect(() => {
    if (!latest) setOpen(false);
  }, [latest]);
  useEffect(() => {
    if (elapsed >= total) return;
    const timer = window.setTimeout(() => setElapsed((e) => e + TICK_MS), TICK_MS);
    return () => window.clearTimeout(timer);
  }, [elapsed, total]);

  const working = elapsed < total;
  const records = steps.reduce((n, s) => n + s.records.length, 0);
  const heading = working
    ? "Writing to Salesforce"
    : `Wrote ${records} ${records === 1 ? "record" : "records"} to Salesforce`;

  // Where each step is on the clock: how far in, or not started (-1).
  let start = 0;
  const progress = steps.map((s) => {
    const at = elapsed - start;
    start += stepMs(s);
    return at;
  });
  const visible = steps.filter((_, i) => progress[i] >= 0);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[14px] text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-text"
      >
        {heading}
        {working && <LoaderCircle className="size-3.5 animate-spin text-text-subtle" strokeWidth={2} />}
        <ChevronRight
          className={`size-4 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] ${open ? "rotate-90" : ""}`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <ol className="mt-3">
          {visible.map((step, i) => {
            const at = progress[i];
            const n = step.records.length;
            const landed = Math.min(n, Math.floor(at / WRITE_MS) + 1);
            const done = at >= n * WRITE_MS;
            const last = i === visible.length - 1;
            return (
              <li key={i} className="animate-fade-in flex gap-4">
                <div className="flex w-8 shrink-0 flex-col items-center">
                  <span className="grid size-8 place-items-center rounded-md border border-border bg-surface">
                    <img src="/salesforce.svg" alt="" aria-hidden className="h-3.5 w-auto" />
                  </span>
                  {!last && <span className="my-1 w-px flex-1 bg-border" />}
                </div>
                <div className={`min-w-0 flex-1 pt-1 ${last ? "" : "pb-5"}`}>
                  <p className={`text-[15px] leading-6 ${done ? "text-text" : "text-text-muted"}`}>{step.action}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-text-subtle">
                    Called
                    <code className="rounded bg-skill-chunk px-1 py-px font-mono text-[11.5px] text-text-muted">dispatch_write</code>
                    <span className="font-mono text-[11.5px]">{step.target}</span>
                  </p>
                  {done && (
                    <code className="animate-fade-in mt-1.5 inline-block rounded-md bg-elevated px-2 py-0.5 font-mono text-[12px] text-text">
                      {step.result}
                    </code>
                  )}
                  <ul className="mt-2 overflow-hidden rounded-md border border-border bg-surface">
                    {step.records.slice(0, landed).map((w, j) => {
                      const writing = !done && j === landed - 1;
                      return (
                        <li
                          key={`${w.object}-${w.name}-${j}`}
                          className="animate-fade-in flex h-8 items-center gap-2.5 border-t border-border px-2.5 text-[12.5px] first:border-t-0"
                        >
                          {writing ? (
                            <LoaderCircle className="size-3.5 shrink-0 animate-spin text-text-subtle" strokeWidth={2} />
                          ) : (
                            <Check className="size-3.5 shrink-0 text-success" strokeWidth={2.5} />
                          )}
                          <span className={`w-[52px] shrink-0 rounded px-1 py-px text-center font-mono text-[10.5px] font-medium ${OP_STYLE[w.op]}`}>
                            {w.op.toUpperCase()}
                          </span>
                          <code className="shrink-0 font-mono text-[12px] text-text">{w.object}</code>
                          <span className="shrink-0 text-text">{w.name}</span>
                          <span className="min-w-0 truncate font-mono text-[11.5px] text-text-subtle">{w.fields}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
