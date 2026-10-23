import { CornerDownRight } from "lucide-react";
import { useBusy, useChat } from "./store";
import type { Message, SlotBlock } from "./types";

/**
 * Suggestions — the follow-up chips at the end of the latest reply, stacked
 * one per row (the look of desktop Cowork's follow-ups, kept separate from
 * it). One chip is live and plays its beat; the others are inert, hover only.
 * Disabled while a reply is generating.
 */
export function Suggestions({ message }: { message: Message }) {
  const send = useChat((s) => s.send);
  const chipAction = useChat((s) => s.chipAction);
  const openFullscreen = useChat((s) => s.openFullscreen);
  const busy = useBusy();
  const items = message.suggestions ?? [];
  if (!items.length) return null;

  const expandable = message.blocks.find(
    (b): b is SlotBlock => b.type === "slot" && !!b.expandable && b.mode !== "inline-carousel",
  );

  return (
    <div className="flex flex-col items-start gap-2">
      {items.map((s) => {
        const onClick = s.prompt
          ? () => send(s.label, s.prompt)
          : s.action
            ? () => chipAction(s.label, s.action!, message.id)
            : s.expand && expandable
              ? () => openFullscreen(expandable)
              : undefined;
        return (
          <button
            key={s.label}
            type="button"
            disabled={busy}
            onClick={onClick}
            className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-[14px] text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated"
          >
            <CornerDownRight className="size-4 text-text-subtle" strokeWidth={1.75} />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
