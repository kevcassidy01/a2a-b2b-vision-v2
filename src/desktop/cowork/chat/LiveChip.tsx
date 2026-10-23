import { Check } from "lucide-react";
import { TONE_SKIN } from "../../../chat/viz/Pills";
import { copy } from "../../../copy/copy";

/** LiveChip — "✓ Live" beside a started agent, in the right-hand panel and on Agents. */
export function LiveChip() {
  return (
    <span
      className={`animate-fade-in inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-md px-2 text-[12px] font-medium ${TONE_SKIN.success}`}
    >
      <Check className="size-3.5" strokeWidth={2.25} />
      {copy.desktop.cowork.chat.panel.liveAgent}
    </span>
  );
}
