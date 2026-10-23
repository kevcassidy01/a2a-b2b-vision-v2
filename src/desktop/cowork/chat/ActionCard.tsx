import { useState } from "react";
import { ChevronRight, ExternalLink, Waypoints } from "lucide-react";
import { copy } from "../../../copy/copy";
import { AppLogo } from "./AppLogo";
import { FactsTable } from "./FactsTable";
import type { CoworkBlock } from "./types";

type Action = Extract<CoworkBlock, { type: "action" }>;

/**
 * ActionCard — something the live agent just did, posted on its own, framed
 * like the browser chat's MCP cards (CardShell): the agent's identity and the
 * time in a bordered header, the title as a row with a › that turns down to
 * open its key-value Details (FactsTable), and a footer saying it stayed within
 * policy (or the card's own note), with an "Open in Salesforce" link (Slack, for one done in Slack). Talking to the agent is left to
 * the follow-up chips at the end of the transcript.
 */
export function ActionCard({ action }: { action: Action }) {
  const t = copy.desktop.cowork.chat;
  const [open, setOpen] = useState(false);

  return (
    <div className="animate-fade-in overflow-hidden rounded-xl border border-prompt-border bg-surface">
      <div className="flex h-[52px] items-center gap-2.5 border-b border-border px-4">
        {action.app ? (
          <AppLogo app={action.app} className="size-6" />
        ) : (
          <span className="grid size-6 shrink-0 place-items-center rounded-md border border-border text-text-muted">
            <Waypoints className="size-3.5" strokeWidth={1.75} />
          </span>
        )}
        <span className="text-[16px] font-medium text-text">{action.agent}</span>
        <span className="ml-auto text-[13px] text-text-subtle">{action.time}</span>
      </div>

      <div className="px-4 py-3">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-3 text-left text-[15px] text-text"
        >
          <span className="min-w-0 flex-1">{action.title}</span>
          <ChevronRight
            className={`size-4 shrink-0 text-text-subtle transition-transform duration-[var(--dur-fast)] ${open ? "rotate-90" : ""}`}
            strokeWidth={2}
          />
        </button>
        {open && (
          <div className="animate-fade-in mt-3">
            <FactsTable facts={action.details} />
          </div>
        )}
      </div>

      <div className="flex h-[41px] items-center justify-between border-t border-border px-4">
        <span className="text-[13px] text-text-subtle">{action.footer ?? t.fixedInPolicy}</span>
        <button type="button" className="flex items-center gap-1.5 text-[13px] text-app-link">
          {action.app === "slack" ? t.openInSlack : t.openInSalesforce}
          <ExternalLink className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
