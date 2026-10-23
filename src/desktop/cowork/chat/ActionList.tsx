import type { ReactNode } from "react";

export type ActionItem = { label: string; icon: ReactNode; trailing?: ReactNode; onClick?: () => void };

/**
 * ActionList — the stacked buttons at the end of a response (the follow-up
 * chips): one per row, icon and label, outlined with 8px corners (`rounded-md`; `rounded-lg` is 16px here) so they read
 * as buttons. Nothing filled, so they never outshout the answer.
 */
export function ActionList({ items }: { items: ActionItem[] }) {
  return (
    <div className="flex flex-col items-start gap-2">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-[14px] text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated"
        >
          {item.icon}
          {item.label}
          {item.trailing}
        </button>
      ))}
    </div>
  );
}
