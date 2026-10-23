import type { ReactNode } from "react";

/**
 * Tooltip — a lightweight, presentational dark tooltip.
 *
 * Deliberately "dummy": hover/focus reveals the label; there is no menu,
 * action, or state behind it. It exists to reproduce the *feel* of the Claude
 * app while we build the shell. Wrap any trigger; the label reveals on the
 * chosen `side` (default below).
 *
 * Motion pulls from the shared tokens (--dur-fast / --ease-out).
 */
export function Tooltip({
  label,
  side = "bottom",
  align = "center",
  children,
}: {
  label: string;
  side?: "top" | "bottom" | "left" | "right";
  /** For top/bottom: horizontal anchoring. Use "start" near the left edge so
   *  the tooltip extends inward instead of off-screen. Ignored for left/right. */
  align?: "start" | "center" | "end";
  children: ReactNode;
}) {
  const vertical = side === "left" || side === "right";
  const offset = {
    top: "bottom-full mb-1.5",
    bottom: "top-full mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  }[side];
  const anchor = vertical
    ? ""
    : { start: "left-0", center: "left-1/2 -translate-x-1/2", end: "right-0" }[align];

  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-tooltip px-2 py-1 text-sm font-medium text-tooltip-fg opacity-0 shadow-sm transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover/tooltip:opacity-100 group-hover/tooltip:delay-500 ${offset} ${anchor}`}
      >
        {label}
      </span>
    </span>
  );
}
