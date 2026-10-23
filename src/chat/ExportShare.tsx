import { Download, Share } from "lucide-react";
import type { SlotBlock } from "./types";
import { useChat } from "./store";
import { Tooltip } from "../shell/Tooltip";

/** Plays the experience's export action for a slot that opts in (`exportAs`). */
export function useExport(block: SlotBlock) {
  const runAction = useChat((s) => s.runAction);
  const target = block.exportAs;
  return target ? () => runAction(`export|${target.title}|${target.id}`) : undefined;
}

const iconButton =
  "grid size-7 shrink-0 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text";

/**
 * Export and Share as icon buttons, for a card header or a file card. Export
 * runs `onExport` (a PDF of the view lands in the chat); Share is display
 * only, like the Slack card.
 */
export function ExportShareIcons({
  onExport,
  exportLabel = "Export as PDF",
  className = "",
}: {
  onExport?: () => void;
  exportLabel?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      <Tooltip label={exportLabel} side="bottom">
        <button type="button" aria-label={exportLabel} onClick={onExport} className={iconButton}>
          <Download className="size-4" strokeWidth={2} />
        </button>
      </Tooltip>
      <Tooltip label="Share" side="bottom">
        <button type="button" aria-label="Share" className={iconButton}>
          <Share className="size-4" strokeWidth={2} />
        </button>
      </Tooltip>
    </div>
  );
}

const textButton =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-label font-medium text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated";

/** The full-screen header's labeled pair: Share, then Export report. */
export function ExportShareButtons({ onExport }: { onExport: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={textButton}>
        <Share className="size-4" strokeWidth={2} />
        Share
      </button>
      <button type="button" onClick={onExport} className={textButton}>
        <Download className="size-4" strokeWidth={2} />
        Export report
      </button>
    </div>
  );
}
