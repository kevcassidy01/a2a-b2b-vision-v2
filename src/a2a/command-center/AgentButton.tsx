import type { CSSProperties } from "react";
import agentLogo from "../../assets/a2a/agent-logo.png";
import { copy } from "../../copy/copy";

const t = copy.a2a.commandCenter.agent;

/** idle: just a button. working: three dots bounce after the label. done: they
 *  draw together into one red dot. asking: the agent has questions for Alex,
 *  and the dot becomes a red badge with their count. Only the buyer-agent flow
 *  moves it off idle. */
export type AgentStatus = "idle" | "working" | "done" | "asking";

/**
 * AgentButton — opens the seller agent. While the agent works, the button
 * widens for three bouncing dots (typing); when it finishes, the outer dots
 * fold into the middle one, which turns red: something to look at. The mark
 * is the agent logo (a violet speech bubble with a sparkle).
 */
export function AgentButton({
  status = "idle",
  questions = 1,
  className = "",
}: {
  status?: AgentStatus;
  /** How many questions are waiting (asking). */
  questions?: number;
  className?: string;
}) {
  const busy = status !== "idle";
  return (
    <button
      type="button"
      data-status={status}
      className={`a2a-control a2a-agent ${className} flex h-8 items-center rounded-md pl-3.5 text-[13.5px] font-medium text-text ${
        busy ? "pr-3.5" : "pr-4"
      }`}
    >
      <img src={agentLogo} alt="" className="size-4 shrink-0" />
      <span className="ml-1.5">{t.label}</span>
      <span
        className="a2a-agent-dots"
        aria-hidden
        style={
          { "--badge-w": questions > 9 ? "22px" : "16px" } as CSSProperties
        }
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="a2a-agent-dot"
            style={{ "--i": i } as CSSProperties}
          >
            <span />
          </span>
        ))}
        <span className="a2a-agent-badge">{questions}</span>
      </span>
      <span className="sr-only" role="status">
        {status === "working"
          ? t.working
          : status === "done"
            ? t.done
            : status === "asking"
              ? t.asking(questions)
              : ""}
      </span>
    </button>
  );
}
