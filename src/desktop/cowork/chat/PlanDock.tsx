import { useState } from "react";
import { Check, ChevronDown, ListChecks, LoaderCircle } from "lucide-react";
import { copy } from "../../../copy/copy";
import type { PlanItem } from "./types";

/**
 * PlanDock — Claude's plan for the session, pinned to the top of the prompt
 * bar: "Plan · 3 of 11 done ⌄". Two groups: what Claude does on its own
 * (spinning on the one it's doing, ticked as each lands) and what needs Aaron,
 * one at a time (the current one marked "Your call"). Once Claude's part is
 * done it folds to one line, so the list stays short. The header collapses it
 * to just the task in hand.
 */
export function PlanDock({ items }: { items: PlanItem[] }) {
  const t = copy.desktop.cowork.chat.plan;
  const [open, setOpen] = useState(true);
  const done = items.filter((i) => i.status === "done").length;
  const claude = items.filter((i) => i.by === "claude");
  const you = items.filter((i) => i.by === "you");
  const claudeFinished = claude.every((i) => i.status === "done");
  const now = items.find((i) => i.status === "now");

  return (
    <div className="mb-2 overflow-hidden rounded-xl border border-prompt-border bg-surface shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
      <button
        type="button"
        aria-expanded={open}
        aria-label={t.toggle}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-full items-center gap-2.5 px-4 text-left text-[14px]"
      >
        <ListChecks className="size-4 shrink-0 text-text-muted" strokeWidth={1.75} />
        <span className="font-medium text-text">{t.title}</span>
        <span className="text-text-subtle">· {t.done(done, items.length)}</span>
        {!open && now && <span className="ml-1 min-w-0 flex-1 truncate text-text-muted">{now.label}</span>}
        <ChevronDown
          className={`ml-auto size-4 shrink-0 text-text-subtle transition-transform duration-[var(--dur-fast)] ${open ? "" : "rotate-180"}`}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div className="max-h-[260px] overflow-y-auto border-t border-border px-4 pb-3 pt-2">
          {claudeFinished ? (
            <Row item={{ id: "claude", label: t.claudeDone(claude.length), by: "claude", status: "done" }} />
          ) : (
            <Group label={t.claude} items={claude} />
          )}
          {claudeFinished ? (
            <Group label={t.you} items={you} />
          ) : (
            <p className="mt-2 text-[12px] text-text-subtle">{t.youNext(you.length)}</p>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ label, items }: { label: string; items: PlanItem[] }) {
  return (
    <div className="mt-1">
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-text-subtle">{label}</p>
      <ul>
        {items.map((item) => (
          <Row key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

function Row({ item }: { item: PlanItem }) {
  const t = copy.desktop.cowork.chat.plan;
  const mark =
    item.status === "done" ? (
      <span className="grid size-4 place-items-center rounded-full bg-text">
        <Check className="size-2.5 text-white" strokeWidth={3} />
      </span>
    ) : item.status === "now" && item.by === "claude" ? (
      <LoaderCircle className="size-4 animate-spin text-text-subtle" strokeWidth={2} />
    ) : (
      <span className={`size-4 rounded-full border ${item.status === "now" ? "border-accent bg-accent/15" : "border-border"}`} />
    );
  return (
    <li className="flex h-7 items-center gap-2.5 text-[14px]">
      <span className="grid size-4 shrink-0 place-items-center">{mark}</span>
      <span
        className={`min-w-0 flex-1 truncate ${
          item.status === "done" ? "text-text-subtle" : item.status === "now" ? "font-medium text-text" : "text-text-muted"
        }`}
      >
        {item.label}
      </span>
      {item.status === "now" && item.by === "you" && (
        <span className="shrink-0 rounded-md bg-accent/10 px-2 py-0.5 text-[12px] font-medium text-accent">{t.yourCall}</span>
      )}
    </li>
  );
}
