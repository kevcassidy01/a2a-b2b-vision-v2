import { useState } from "react";
import { CodeXml, MessageSquare } from "lucide-react";
import { copy } from "../copy/copy";
import { Tooltip } from "./Tooltip";

type Segment = "chat" | "code";

const SEGMENTS = [
  { id: "chat" as const, icon: MessageSquare, label: copy.shell.segmented.chat },
  { id: "code" as const, icon: CodeXml, label: copy.shell.segmented.code },
];

/**
 * ChatCodeToggle — the Chat/Code segmented control on the wordmark row.
 *
 * Interactive: the white thumb moves as you switch. Deliberately a no-op —
 * both segments show the same (chat) canvas; nothing changes on switch. It's
 * here for feel and to reserve the seam for a real Code mode later.
 */
export function ChatCodeToggle() {
  const [selected, setSelected] = useState<Segment>("chat");

  const activeIndex = SEGMENTS.findIndex((s) => s.id === selected);

  return (
    <div
      role="tablist"
      aria-label="Chat or Code"
      className="relative inline-flex items-center gap-0.5 rounded-md bg-track p-0.5"
    >
      {/* Sliding thumb — one pill that translates between segments. */}
      <span
        aria-hidden
        className="absolute left-0.5 top-0.5 h-7 w-9 rounded-sm bg-track-thumb shadow-sm transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)]"
        style={{ transform: `translateX(calc(${activeIndex} * (100% + 2px)))` }}
      />
      {SEGMENTS.map(({ id, icon: Icon, label }) => {
        const active = selected === id;
        return (
          <Tooltip key={id} label={label}>
            <button
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelected(id)}
              className={`relative z-10 grid h-7 w-9 place-items-center rounded-sm transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
                active ? "text-text" : "text-text-muted hover:text-text"
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
