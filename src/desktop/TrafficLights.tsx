import type { CSSProperties } from "react";
import { copy } from "../copy/copy";

/**
 * TrafficLights — the macOS close / minimize / zoom buttons (COWORK_INTENT §3.4).
 *
 * 13px circles (a touch over macOS's 12, Somnath), 8px apart. Colored in the
 * key (active) window, grey when it's
 * inactive. Hovering the group colors them (even when inactive) and shows all
 * three glyphs at once, as macOS does.
 * They don't act yet.
 */
const LIGHTS = [
  { key: "close", fill: "#FF5F57", stroke: "#E0443E", glyph: <path d="M3.5 3.5l5 5M8.5 3.5l-5 5" strokeWidth="1.2" /> },
  { key: "minimize", fill: "#FEBC2E", stroke: "#DEA123", glyph: <path d="M2.8 6h6.4" strokeWidth="1.3" /> },
  {
    key: "zoom",
    fill: "#28C840",
    stroke: "#1AAB29",
    // The two diagonal full-screen arrowheads.
    glyph: <path d="M3.3 4.6v4.1h4.1ZM8.7 7.4V3.3H4.6Z" fill="currentColor" stroke="none" />,
  },
] as const;

export function TrafficLights({ active }: { active: boolean }) {
  const t = copy.desktop.window.trafficLights;
  return (
    <div className="group flex items-center gap-2">
      {LIGHTS.map((l) => (
        <button
          key={l.key}
          type="button"
          aria-label={t[l.key]}
          tabIndex={-1}
          className={`grid size-[13px] place-items-center rounded-full transition-colors duration-150 group-hover:bg-[var(--fill)] group-hover:shadow-[inset_0_0_0_0.5px_var(--stroke)] ${
            active
              ? "bg-[var(--fill)] shadow-[inset_0_0_0_0.5px_var(--stroke)]"
              : "bg-[#CECECE] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)]"
          }`}
          style={{ "--fill": l.fill, "--stroke": l.stroke } as CSSProperties}
        >
          <svg
            viewBox="0 0 12 12"
            className="size-[13px] text-black/55 opacity-0 group-hover:opacity-100"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            aria-hidden
          >
            {l.glyph}
          </svg>
        </button>
      ))}
    </div>
  );
}
