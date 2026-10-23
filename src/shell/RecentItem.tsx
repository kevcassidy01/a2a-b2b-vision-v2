import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

/**
 * RecentItem — a single recents row: just a label, single line.
 *
 * Long labels fade into the right edge via a mask (softer than an ellipsis);
 * short ones sit flush left with no visible fade. Presentational — no behavior.
 *
 * `loading` shows a spinner in place of the label — used briefly while a fresh
 * chat's title is being "generated" (see App's new-chat interaction).
 * `active` gives the row the selected wash (same as the New button / nav).
 * `onClick` makes the row a journey selector (the three fixed experience chats).
 * `trailing` sits after the label (Cowork's scheduled-session clock).
 */
export function RecentItem({
  label,
  loading = false,
  active = false,
  onClick,
  trailing,
}: {
  label: string;
  loading?: boolean;
  active?: boolean;
  onClick?: () => void;
  trailing?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex h-row w-full items-center rounded-md px-2 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
        active ? "bg-elevated" : "hover:bg-elevated"
      }`}
    >
      {loading ? (
        <Loader2 className="size-4 shrink-0 animate-spin text-text-muted" strokeWidth={2} />
      ) : (
        <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-ui text-text-muted [mask-image:linear-gradient(to_right,#000_calc(100%-28px),transparent)]">
          {label}
        </span>
      )}
      {trailing}
    </button>
  );
}
