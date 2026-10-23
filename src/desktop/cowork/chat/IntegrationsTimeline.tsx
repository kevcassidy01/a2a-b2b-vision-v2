import { useEffect, useState } from "react";
import { Check, ChevronRight, LoaderCircle } from "lucide-react";
import { copy } from "../../../copy/copy";
import { AppLogo } from "./AppLogo";
import { FileChips } from "./FileChips";
import { WRITE_MS, type IntegrationStep, type WriteRecord } from "./types";

/**
 * IntegrationsTimeline — "Used N integrations ›", after the Cowork promo
 * (docs/references/cowork/promo-integrations-timeline.png).
 *
 * Each step is the app's logo in a rounded tile, a plain-language action, the Headless 360 MCP
 * call behind it (Salesforce steps: "Called `dispatch_readonly` <SOR>") and a
 * mono result chip, joined by a hairline. Steps work one at a time as the
 * script grows `shown`: the current one spins on its call, then its result
 * lands in place (decision 41). Salesforce steps come first, then the other
 * connectors, at the same weight (decision 46). The header folds the list away.
 * A long read (`listen`) shows its labels in turn while it works, over a
 * progress bar along the recording if it's a call; a step can land with what it
 * found (`moments`) and files that came with it (`attachments`). A Salesforce
 * write (`writes`) lists its records as they land: insert or update, the
 * object, the record and the fields set. A timeline of only writes is headed
 * "Writing to Salesforce", then the records it wrote.
 */
export function IntegrationsTimeline({ steps, shown }: { steps: IntegrationStep[]; shown: number }) {
  const t = copy.desktop.cowork.chat;
  const [open, setOpen] = useState(true);
  const apps = new Set(steps.map((s) => s.app)).size;
  const writing = steps.every((s) => s.writes);
  const records = steps.flatMap((s) => s.writes ?? []).reduce((n, w) => n + (w.count ?? 1), 0);
  const working = shown < steps.length;
  const heading = writing
    ? working ? t.writingSalesforce : t.wroteRecords(records)
    : working ? t.usingIntegrations : t.usedIntegrations(apps);
  // The resolved steps, plus the one being worked on.
  const visible = steps.slice(0, Math.min(shown + 1, steps.length));

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[14px] text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-text"
      >
        {heading}
        <ChevronRight
          className={`size-4 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] ${open ? "rotate-90" : ""}`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <ol className="mt-3">
          {visible.map((step, i) => {
            const done = i < shown;
            const last = i === visible.length - 1;
            return (
              <li key={i} className="animate-fade-in flex gap-4">
                <div className="flex w-8 shrink-0 flex-col items-center">
                  <span className="grid size-8 place-items-center rounded-md border border-border bg-surface">
                    <AppLogo app={step.app} className="size-5" />
                  </span>
                  {!last && <span className="my-1 w-px flex-1 bg-border" />}
                </div>
                <div className={`min-w-0 pt-1 ${last ? "" : "pb-5"}`}>
                  <p className={`flex items-center gap-2 text-[15px] leading-6 ${done ? "text-text" : "text-text-muted"}`}>
                    {step.action}
                    {!done && <LoaderCircle className="size-3.5 animate-spin text-text-subtle" strokeWidth={2} />}
                  </p>
                  {step.tool && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-text-subtle">
                      {t.called}
                      <code className="rounded bg-skill-chunk px-1 py-px font-mono text-[11.5px] text-text-muted">{step.tool.name}</code>
                      <span className="font-mono text-[11.5px]">{step.tool.target}</span>
                    </p>
                  )}
                  {!done && step.listen && <Listen {...step.listen} />}
                  {done && (
                    <code className="animate-fade-in mt-1.5 inline-block rounded-md bg-elevated px-2 py-0.5 font-mono text-[12px] text-text">
                      {step.result}
                    </code>
                  )}
                  {done && step.moments && (
                    <ul className="animate-fade-in mt-2 space-y-1 text-[13px] leading-5 text-text-muted">
                      {step.moments.map((m) => {
                        const [at, ...rest] = m.split(" ");
                        return (
                          <li key={m} className="flex gap-2">
                            <span className="w-10 shrink-0 font-mono text-[12px] text-text-subtle">{at}</span>
                            <span>{rest.join(" ")}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {done && step.attachments && <Attachments names={step.attachments} />}
                  {step.writes && <Writes records={step.writes} done={done} />}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

/** How often the listen bar ticks. */
const TICK_MS = 100;

/** How long apart an email's attachments land. */
const ATTACH_MS = 700;

/** A step's Salesforce writes, landing one at a time (the newest spins until
 *  the next lands), each on one line: the operation, the object's API name,
 *  the record and the fields it set. */
function Writes({ records, done }: { records: WriteRecord[]; done: boolean }) {
  const [count, setCount] = useState(done ? records.length : 1);
  useEffect(() => {
    if (count >= records.length) return;
    const timer = window.setTimeout(() => setCount((n) => n + 1), WRITE_MS);
    return () => window.clearTimeout(timer);
  }, [count, records.length]);
  const shown = done ? records.length : count;
  return (
    <ul className="mt-2 overflow-hidden rounded-md border border-border bg-surface">
      {records.slice(0, shown).map((w, i) => {
        const writing = !done && i === shown - 1;
        return (
          <li
            key={`${w.object}-${w.name}`}
            className="animate-fade-in flex h-8 items-center gap-2.5 border-t border-border px-2.5 text-[12.5px] first:border-t-0"
          >
            {writing ? (
              <LoaderCircle className="size-3.5 shrink-0 animate-spin text-text-subtle" strokeWidth={2} />
            ) : (
              <Check className="size-3.5 shrink-0 text-success" strokeWidth={2.5} />
            )}
            <span
              className={`w-[52px] shrink-0 rounded px-1 py-px text-center font-mono text-[10.5px] font-medium ${
                w.op === "insert" ? "bg-success-soft text-success" : "bg-app-link/10 text-app-link"
              }`}
            >
              {w.op.toUpperCase()}
            </span>
            <code className="shrink-0 font-mono text-[12px] text-text">{w.object}</code>
            <span className="shrink-0 text-text">{w.name}</span>
            <span className="min-w-0 truncate font-mono text-[11.5px] text-text-subtle">{w.fields}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** An email's attachments, landing one at a time as Claude opens them. */
function Attachments({ names }: { names: string[] }) {
  const [count, setCount] = useState(1);
  useEffect(() => {
    if (count >= names.length) return;
    const timer = window.setTimeout(() => setCount((n) => n + 1), ATTACH_MS);
    return () => window.clearTimeout(timer);
  }, [count, names.length]);
  return (
    <div className="mt-2.5">
      <FileChips align="start" names={names.slice(0, count)} />
    </div>
  );
}

/** A long read: what Claude is doing in turn and, for a recording, a bar filling
 *  along it and the time reached (driven by timers, not CSS, so it plays under test too). */
function Listen({ ms, length, stages }: { ms: number; length?: string; stages: string[] }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((e) => Math.min(e + TICK_MS, ms)), TICK_MS);
    return () => window.clearInterval(timer);
  }, [ms]);
  const share = elapsed / ms;
  const stage = stages[Math.min(Math.floor(share * stages.length), stages.length - 1)];
  if (!length) {
    return (
      <p key={stage} className="animate-fade-in mt-1.5 text-[13px] text-text-subtle">
        {stage}
      </p>
    );
  }
  const [m, sec] = length.split(":").map(Number);
  const at = Math.round(share * (m * 60 + sec));
  return (
    <div className="mt-2 w-[360px] max-w-full">
      <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
        <div className="h-full rounded-full bg-accent transition-[width] duration-100 ease-linear" style={{ width: `${share * 100}%` }} />
      </div>
      <p className="mt-1.5 flex justify-between text-[12px] text-text-subtle">
        <span>{stage}</span>
        <span className="font-mono">
          {Math.floor(at / 60)}:{String(at % 60).padStart(2, "0")} / {length}
        </span>
      </p>
    </div>
  );
}
