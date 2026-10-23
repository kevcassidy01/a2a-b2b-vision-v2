import { Maximize2 } from "lucide-react";
import type { CardApp } from "./types";
import { ExportShareIcons } from "./ExportShare";

/**
 * Floating — an MCP app rendered **frameless** in the transcript: no card
 * surface, border, or header row, just the app's content sitting directly on the
 * chat column. For responses that don't warrant a card's chrome or a carousel's
 * structure (a single chart, a diagram, a short report).
 *
 * When `onExpand` is passed, a small expand button floats at the top-right so the
 * object can be opened full-screen (its natural home when it reads better large);
 * `onExport` adds Export (PDF) + Share beside it.
 * The body is a reserved placeholder for now; real widgets mount here later.
 */
export function Floating({
  onExpand,
  onExport,
  children,
}: {
  app: CardApp;
  onExpand?: () => void;
  onExport?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {(onExpand || onExport) && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-0.5 rounded-md bg-surface/80 shadow-sm backdrop-blur">
          {onExport && <ExportShareIcons onExport={onExport} />}
          {onExpand && (
            <button
              type="button"
              aria-label="Open full screen"
              onClick={onExpand}
              className="grid size-7 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text"
            >
              <Maximize2 className="size-4" strokeWidth={2} />
            </button>
          )}
        </div>
      )}
      {children ?? (
        <div className="grid min-h-[220px] place-items-center rounded-lg border border-dashed border-danger bg-slot-placeholder text-[13px] font-medium text-danger">
          App content
        </div>
      )}
    </div>
  );
}
