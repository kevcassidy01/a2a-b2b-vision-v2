import { useEffect, useState } from "react";
import { ChevronRight, LoaderCircle } from "lucide-react";
import type { AppStep } from "./types";

/**
 * AppTimeline — "Using Slack", then "Used Slack ›": a step Claude took in
 * another app, shown in the reply it leads to (the look of desktop Cowork's
 * integrations timeline, kept separate from it).
 *
 * Each step is the app's logo in a rounded tile and a plain-language action
 * (where it posted), spinning while it works; then its mono result chip lands
 * and the next step starts. Driven by one clock from mount, so `appsMs` tells
 * the script how long to wait before the reply's text.
 *
 * Like the write timeline, the latest reply's stays open and earlier ones
 * fold to the header (its chevron reopens them). An earlier one never replays.
 */

/** How long each step works before its result lands. */
const STEP_MS = 1200;
const TICK_MS = 100;

const LOGO: Record<AppStep["app"], { src: string; name: string }> = {
  slack: { src: "/connectors/slack.svg", name: "Slack" },
};

/** How long an app timeline takes to play out. */
export const appsMs = (steps: AppStep[]) => steps.length * STEP_MS;

export function AppTimeline({ steps, latest }: { steps: AppStep[]; latest: boolean }) {
  const total = appsMs(steps);
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
  const names = [...new Set(steps.map((s) => LOGO[s.app].name))].join(" and ");
  const heading = working ? `Using ${names}` : `Used ${names}`;
  const shown = Math.min(steps.length, Math.floor(elapsed / STEP_MS) + 1);

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
          {steps.slice(0, shown).map((step, i) => {
            const done = elapsed >= (i + 1) * STEP_MS;
            const last = i === shown - 1;
            return (
              <li key={i} className="animate-fade-in flex gap-4">
                <div className="flex w-8 shrink-0 flex-col items-center">
                  <span className="grid size-8 place-items-center rounded-md border border-border bg-surface">
                    <img src={LOGO[step.app].src} alt="" aria-hidden className="size-4" />
                  </span>
                  {!last && <span className="my-1 w-px flex-1 bg-border" />}
                </div>
                <div className={`min-w-0 flex-1 pt-1 ${last ? "" : "pb-5"}`}>
                  <p className={`flex items-center gap-2 text-[15px] leading-6 ${done ? "text-text" : "text-text-muted"}`}>
                    {step.action}
                    {!done && <LoaderCircle className="size-3.5 animate-spin text-text-subtle" strokeWidth={2} />}
                  </p>
                  {done && (
                    <code className="animate-fade-in mt-1.5 inline-block rounded-md bg-elevated px-2 py-0.5 font-mono text-[12px] text-text">
                      {step.result}
                    </code>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
