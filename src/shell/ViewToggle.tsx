import { Globe, Laptop } from "lucide-react";
import { copy } from "../copy/copy";
import { Tooltip } from "./Tooltip";

export type View = "browser" | "desktop";

const SEGMENTS = [
  { id: "browser" as const, icon: Globe, label: copy.demo.viewToggle.browser },
  { id: "desktop" as const, icon: Laptop, label: copy.demo.viewToggle.desktop },
];

/**
 * ViewToggle — the floating Browser | Desktop pill (COWORK_INTENT §5).
 *
 * Icon-only (labels live in the tooltip + aria-label). Demo chrome, not part
 * of either app: fixed in the bottom-right corner, 16px up (its bottom lines
 * up with the Cowork window's) and 8px in from the right. Neither the browser
 * chat nor the desktop (below the icons column) has anything there, so it
 * sits in the same spot in both views. Controlled — Root owns
 * the view and keeps it in the URL hash.
 */
export function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div
      role="tablist"
      aria-label={copy.demo.viewToggle.label}
      className="fixed bottom-4 right-2 z-50 inline-flex flex-col items-center gap-0.5 rounded-full border border-black/10 bg-white/70 p-0.5 shadow-md backdrop-blur-md"
    >
      {SEGMENTS.map(({ id, icon: Icon, label }) => {
        const active = view === id;
        return (
          <Tooltip key={id} label={label} side="left">
            <button
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={label}
              onClick={() => onChange(id)}
              className={`grid size-7 place-items-center rounded-full transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
                active ? "bg-text text-white" : "text-text-muted hover:text-text"
              }`}
            >
              <Icon className="size-3.5" strokeWidth={2} />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
