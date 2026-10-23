import { Clock, Plus, type LucideIcon } from "lucide-react";

/**
 * TemplateRow — one quick-start template on the Scheduled and Agents pages.
 *
 * Hovering washes the row, swaps its icon for ＋ and, given a `preview`,
 * slides up a small preview card (Scheduled only). Inert unless given
 * `onClick` (the Daily briefing template starts the brief's session).
 */
export function TemplateRow({
  icon: Icon,
  title,
  body,
  when,
  preview,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  when: string;
  preview?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex gap-3.5 overflow-hidden rounded-lg px-3 pb-8 pt-3 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated/70"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-elevated text-text-muted transition-colors duration-[var(--dur-fast)] group-hover:bg-surface group-hover:text-text">
        <Icon className="size-[18px] group-hover:hidden" strokeWidth={1.75} />
        <Plus className="hidden size-[18px] group-hover:block" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 pr-2">
        <span className="block text-[14px] font-medium text-text">{title}</span>
        <span className="mt-0.5 block text-[14px] leading-snug text-text-muted">{body}</span>
        <span className="mt-1.5 flex items-center gap-1.5 text-[13px] text-text-subtle">
          <Clock className="size-3.5" strokeWidth={2} />
          {when}
        </span>
      </span>
      {preview && <PreviewCard title={preview} />}
    </button>
  );
}

/** The little card that slides up from a template's bottom-right on hover. It
 *  peeks only into the row's bottom padding (pb-8), so it never covers text. */
function PreviewCard({ title }: { title: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -bottom-9 right-3 w-[132px] translate-y-6 rotate-[2deg] rounded-md border border-border bg-surface px-2.5 pb-4 pt-2 opacity-0 shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition-[opacity,transform] duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:translate-y-0 group-hover:opacity-100"
    >
      <span className="block text-[11px] font-medium text-text">{title}</span>
      <span className="mt-1.5 flex items-center gap-1.5">
        <span className="grid size-2.5 place-items-center rounded-[3px] bg-check">
          <svg viewBox="0 0 8 8" className="size-2 text-white">
            <path d="M1.5 4.2 3.2 5.8 6.5 2.3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="h-1 w-20 rounded-full bg-elevated-strong" />
      </span>
      <span className="mt-1.5 flex items-center gap-1.5">
        <span className="size-2.5 rounded-[3px] border border-prompt-border-focus" />
        <span className="h-1 w-14 rounded-full bg-elevated" />
      </span>
    </span>
  );
}
