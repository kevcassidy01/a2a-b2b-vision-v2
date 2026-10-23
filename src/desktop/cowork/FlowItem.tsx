import { useEffect, useState } from "react";
import { Clock, Waypoints, type LucideIcon } from "lucide-react";
import { RecentItem } from "../../shell/RecentItem";
import { Tooltip } from "../../shell/Tooltip";

/** How long the title "generates" (spinner) before it types in, and the pace of the typing. */
const TITLING_MS = 700;
const CHAR_MS = 35;

/** The icon a started session shows, by kind: an agent (as on the Agents nav
 * item) or a scheduled task (as on Scheduled). A plain chat has none. */
const KIND_ICON: Record<"agent" | "task" | "chat", LucideIcon | null> = {
  agent: Waypoints,
  task: Clock,
  chat: null,
};

/**
 * FlowItem — one of the run of show's sessions in the Cowork sidenav.
 *
 * Reads `placeholder` ("New session") until the session starts (its first
 * prompt is sent). Then it retitles the way a fresh chat does in the browser:
 * a brief spinner, then the title types in. Then its kind's icon fades in,
 * with a tooltip saying when it runs: a task's once the title is in, an
 * agent's only once Claude says it'll set one up (`agentReady`). No live dot
 * on the icon (dropped 2026-10-12); the Agents page and the panel say it's live.
 *
 * While Aaron is in another session, the row shows three hopping dots as
 * Claude replies or the agent is about to post (`talking`), then a count of the
 * actions it completed (`unread`), until Aaron opens it.
 */
export function FlowItem({
  title,
  kind,
  placeholder,
  schedule,
  started,
  agentReady = false,
  talking = false,
  unread = 0,
  active,
  onClick,
}: {
  title: string;
  kind: keyof typeof KIND_ICON;
  placeholder: string;
  schedule: string | null;
  started: boolean;
  agentReady?: boolean;
  talking?: boolean;
  unread?: number;
  active: boolean;
  onClick: () => void;
}) {
  // How much of the title is showing: null before the start, then 0 → full.
  const [typed, setTyped] = useState<number | null>(null);

  useEffect(() => {
    if (!started) return;
    const step = (n: number) => {
      setTyped(n);
      if (n < title.length) timer = window.setTimeout(() => step(n + 1), CHAR_MS);
    };
    let timer = window.setTimeout(() => step(0), TITLING_MS);
    return () => window.clearTimeout(timer);
  }, [started, title]);

  const titling = started && typed === null;
  const done = typed === title.length;
  const Icon = KIND_ICON[kind];
  const showIcon = done && (kind !== "agent" || agentReady);

  return (
    <RecentItem
      label={typed === null ? placeholder : title.slice(0, typed)}
      loading={titling}
      active={active}
      onClick={onClick}
      trailing={
        <span className="flex shrink-0 items-center gap-2">
          {!active && talking && <TypingDots />}
          {!active && !talking && unread > 0 && (
            <span className="animate-fade-in grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1.5 text-[11px] font-medium leading-none text-white">
              {unread}
            </span>
          )}
          {showIcon && Icon && schedule && (
            <Tooltip label={schedule} side="bottom" align="end">
              <span className="flex shrink-0">
                <Icon aria-label={schedule} className="animate-fade-in size-4 text-text-subtle" strokeWidth={2} />
              </span>
            </Tooltip>
          )}
        </span>
      }
    />
  );
}

/** Three dots hopping in turn: Claude is talking in this session. */
function TypingDots() {
  return (
    <span aria-label="Typing" className="animate-fade-in flex items-center gap-[3px]">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="animate-typing-dot size-1 rounded-full bg-text-muted"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}
