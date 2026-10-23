import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, CornerDownLeft, Waypoints, Zap } from "lucide-react";
import { copy } from "../../../copy/copy";
import { FactsTable } from "./FactsTable";
import { isTyping } from "./isTyping";
import { SourceChips } from "./SourceChips";
import type { CoworkBlock } from "./types";

type Agent = Extract<CoworkBlock, { type: "agent" }>;

/**
 * AgentCard — Claude's proposal for a long-running agent, with the live app's
 * Schedule card hierarchy (docs/references/cowork/scheduled-task.png):
 *   1. the header: icon tile, "Create agent · name";
 *   2. a one-line summary;
 *   3. the meta line: the trigger, and chips for how long and where it runs;
 *   4. "Details ⌄", opening a bordered box: what it'll do, what it asks you
 *      first, and where it reads from (decision 41);
 *   5. Start agent ↵ / Cancel Esc.
 * Once started it folds to the live app's one-line "Created …" row; its ›
 * opens a key-value table (FactsTable) of what was created: type, what it
 * does, how long it runs, and so on.
 */
export function AgentCard({ agent, onStart, onCancel }: { agent: Agent; onStart: () => void; onCancel: () => void }) {
  const t = copy.desktop.cowork.chat;
  const proposed = agent.status === "proposed";
  // Open on the proposal; the folded "Created agent" row starts closed.
  const [details, setDetails] = useState(proposed);

  // ↵ starts and Esc cancels, as the hints say, unless Aaron is mid-message (isTyping).
  useEffect(() => {
    if (!proposed) return;
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      if (e.key === "Enter") onStart();
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [proposed, onStart, onCancel]);

  if (agent.status === "cancelled") return null;

  if (agent.status === "started") {
    return (
      <div className="animate-fade-in rounded-xl border border-border bg-surface">
        <button
          type="button"
          aria-expanded={details}
          onClick={() => setDetails((v) => !v)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px]"
        >
          <Waypoints className="size-[18px] shrink-0 text-text-muted" strokeWidth={1.75} />
          <span className="min-w-0 flex-1 truncate text-text">
            {t.createdAgent} <span className="font-medium">{agent.name}</span>
          </span>
          <span className="shrink-0 truncate text-[14px] text-text-subtle">{agent.trigger}</span>
          <ChevronRight
            className={`size-4 shrink-0 text-text-subtle transition-transform duration-[var(--dur-fast)] ${details ? "rotate-90" : ""}`}
            strokeWidth={2}
          />
        </button>
        {details && (
          <div className="px-4 pb-4 pl-[46px]">
            <FactsTable facts={agent.facts} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in rounded-xl border border-border bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md border border-border text-text-muted">
          <Waypoints className="size-[18px]" strokeWidth={1.75} />
        </span>
        <h3 className="text-[16px] text-text">
          <span className="font-semibold">{t.createAgent}</span>
          <span className="mx-2 text-text-subtle">·</span>
          {agent.name}
        </h3>
      </div>

      <p className="mt-3 text-[15px] leading-relaxed text-text">{agent.summary}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-[14px] text-text-muted">
        <span className="flex items-center gap-1.5">
          <Zap className="size-4 shrink-0" strokeWidth={1.75} />
          {agent.trigger}
        </span>
        <span className="whitespace-nowrap rounded-md bg-accent/10 px-2 py-0.5 text-[12px] font-medium text-accent">{agent.runsFor}</span>
        <span className="whitespace-nowrap rounded-md bg-elevated px-2 py-0.5 text-[12px] text-text-muted">{t.inCloud}</span>
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

      {details && <AgentDetails agent={agent} />}

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={onStart}
          className="flex h-9 items-center gap-2 rounded-md bg-text px-4 text-[14px] font-medium text-white transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:opacity-85"
        >
          {t.startAgent}
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

/** The bordered Details box: what it'll do, what it asks first, where it reads from. */
function AgentDetails({ agent }: { agent: Agent }) {
  const t = copy.desktop.cowork.chat;
  return (
    <div className="mt-2 flex flex-col gap-4 rounded-lg border border-border bg-bg/60 p-4">
      <Section label={t.thingsIllDo}>
        <ol className="list-decimal space-y-1 pl-5 text-[14px] leading-relaxed text-text marker:text-text-subtle">
          {agent.things.map((thing) => (
            <li key={thing} className="pl-1">
              {thing}
            </li>
          ))}
        </ol>
      </Section>
      <Section label={t.asksFirst}>
        <ul className="list-disc space-y-1 pl-5 text-[14px] leading-relaxed text-text marker:text-text-subtle">
          {agent.asksFirst.map((ask) => (
            <li key={ask} className="pl-1">
              {ask}
            </li>
          ))}
        </ul>
      </Section>
      <Section label={t.readsFrom}>
        <SourceChips sources={agent.sources} />
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[12px] font-medium uppercase tracking-wide text-text-subtle">{label}</p>
      {children}
    </div>
  );
}
