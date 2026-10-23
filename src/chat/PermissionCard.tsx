import { useEffect } from "react";
import { Check, CornerDownLeft, ShieldCheck, X } from "lucide-react";
import { useBusy, useChat, useJourney } from "./store";
import { useMessageId } from "./MessageId";
import type { Block } from "./types";

type Permission = Extract<Block, { type: "permission" }>;

/**
 * PermissionCard — Claude asking before it writes to Salesforce: "Claude
 * wants to write to Salesforce", what it's about to do, the changes in plain
 * words, then Deny (Esc) and a black Allow (↵), the desktop Cowork pattern.
 * Allow plays the write; Deny leaves Salesforce as it was. Once decided it
 * folds to one line. Only for writes a prompt asked for: a pick in a card or
 * a button that names the write (Place order, Create all 3) is already the OK.
 *
 * ↵ and Esc work while it's the last message of the chat on screen and the
 * prompt box is empty (the box keeps focus, and an empty Enter sends nothing).
 */
export function PermissionCard({ block }: { block: Permission }) {
  const msg = useMessageId();
  const decision = useChat((s) => (msg ? s.permits[msg] : undefined));
  const permit = useChat((s) => s.permit);
  const busy = useBusy();
  const journey = useJourney();
  // Last message of the chat on screen (a hidden journey's card stays quiet).
  const last = useChat((s) => {
    const m = s.chats[journey].messages;
    return s.activeExperience === journey && m[m.length - 1]?.id === msg;
  });
  const open = !decision && !!msg;

  useEffect(() => {
    if (!open || !last || busy) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.isContentEditable && (el.textContent ?? "").trim()) return;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT")) return;
      if (e.key === "Enter" && !e.shiftKey) permit(msg!, true, block);
      if (e.key === "Escape") permit(msg!, false, block);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, last, busy, msg, permit, block]);

  if (decision) {
    const allowed = decision === "allowed";
    return (
      <div className="animate-fade-in flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-[15px]">
        {allowed ? (
          <Check className="size-[18px] shrink-0 text-success" strokeWidth={2} />
        ) : (
          <X className="size-[18px] shrink-0 text-text-subtle" strokeWidth={2} />
        )}
        <span className={`min-w-0 flex-1 truncate ${allowed ? "text-text" : "text-text-subtle"}`}>
          {allowed ? "Allowed:" : "Denied:"} <span className="font-medium">{block.title}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in rounded-xl border border-border bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md border border-border text-text-muted">
          <ShieldCheck className="size-[18px]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[13px] text-text-muted">
            <img src="/salesforce.svg" alt="" aria-hidden className="h-3 w-auto" />
            Claude wants to write to Salesforce
          </p>
          <h3 className="text-[16px] font-semibold text-text">{block.title}</h3>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5 rounded-lg border border-border bg-bg/60 px-4 py-3">
        {block.changes.map((c) => (
          <li key={c} className="flex items-start gap-2 text-[14px] leading-5 text-text">
            <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-text-subtle" />
            {c}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => permit(msg!, false, block)}
          className="flex h-9 items-center gap-2 rounded-md border border-border px-4 text-[14px] text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated disabled:opacity-50"
        >
          Deny
          <span className="text-[12px] text-text-subtle">Esc</span>
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => permit(msg!, true, block)}
          className="flex h-9 items-center gap-2 rounded-md bg-text px-4 text-[14px] font-medium text-white transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:opacity-85 disabled:opacity-50"
        >
          Allow
          <CornerDownLeft className="size-3.5 opacity-70" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
