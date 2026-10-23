import type { LucideIcon } from "lucide-react";
import { Tooltip } from "./Tooltip";

/**
 * NavItem — a single sidenav row: icon + label, with hover / selected states.
 *
 * Resting label + icon use `--color-text-muted` (#52514F); the selected row
 * gets the hover/selected wash (`--color-elevated` #EDECE8) plus a darker
 * label + icon (`--color-text` #0B0B0B). Presentational for now — no routing.
 *
 * "New" passes `active` so it always carries the wash (a persistent, always-
 * visible CTA); hover and default read the same for it by design.
 */
export function NavItem({
  icon: Icon,
  label,
  active = false,
  shortcut,
  onClick,
  collapsed = false,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  /** Keyboard-shortcut hint, revealed on hover (right-aligned). */
  shortcut?: string;
  /** Optional click handler. Most nav items are presentational (no handler). */
  onClick?: () => void;
  /** Icon-only rail mode (collapsed sidenav) — the label moves into a
   *  right-side tooltip and the row becomes a centered icon button. */
  collapsed?: boolean;
}) {
  // Collapsed rail — icon only, centered, label surfaced on hover.
  if (collapsed) {
    return (
      <Tooltip label={label} side="right">
        <button
          type="button"
          onClick={onClick}
          aria-current={active ? "page" : undefined}
          aria-label={label}
          className={`grid size-9 place-items-center rounded-md transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
            active ? "bg-elevated text-text" : "text-text-muted hover:bg-elevated hover:text-text"
          }`}
        >
          <Icon className="size-[18px]" strokeWidth={2} />
        </button>
      </Tooltip>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`group flex h-row w-full items-center gap-2.5 rounded-md px-2 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
        active ? "bg-elevated" : "hover:bg-elevated"
      }`}
    >
      <span
        className={`grid size-6 shrink-0 place-items-center ${
          active ? "text-text" : "text-text-muted"
        }`}
      >
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <span className={`text-ui ${active ? "text-text" : "text-text-muted"}`}>
        {label}
      </span>
      {shortcut && (
        <span className="ml-auto text-[13px] text-text-subtle opacity-0 transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover:opacity-100">
          {shortcut}
        </span>
      )}
    </button>
  );
}
