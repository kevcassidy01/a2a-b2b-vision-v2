import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Tooltip — a small black label under an icon-only button (or, `side="right"`,
 * beside it: the collapsed sidenav's icons), on hover or keyboard focus. Drawn fixed in a portal, so the sidenav's scroll area can't clip it.
 */
export function Tooltip({
  label,
  side = "bottom",
  children,
}: {
  label: string;
  side?: "bottom" | "right";
  children: ReactNode;
}) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const show = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setAt(side === "right" ? { x: r.right + 8, y: r.top + r.height / 2 } : { x: r.left + r.width / 2, y: r.bottom + 6 });
  };
  const hide = () => setAt(null);

  return (
    <span
      className="inline-flex"
      onMouseEnter={(e) => show(e.currentTarget)}
      onMouseLeave={hide}
      onFocus={(e) =>
        e.target.matches(":focus-visible") && show(e.currentTarget)
      }
      onBlur={hide}
    >
      {children}
      {at &&
        createPortal(
          <span
            role="tooltip"
            className={`a2a-stage a2a-tooltip pointer-events-none fixed z-50 ${side === "right" ? "-translate-y-1/2" : "-translate-x-1/2"} whitespace-nowrap rounded-md px-2 py-1 text-[12px] text-white`}
            style={{ left: at.x, top: at.y }}
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  );
}
