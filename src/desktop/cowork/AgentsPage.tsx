import { Eye, Goal, MessageSquareReply, Telescope, Waypoints, type LucideIcon } from "lucide-react";
import { copy } from "../../copy/copy";
import { PageSearch } from "./PageSearch";
import { TemplateRow } from "./TemplateRow";
import type { FlowId } from "./CoworkSidebar";
import { LiveChip } from "./chat/LiveChip";
import { useCoworkChat } from "./chat/store";

type TemplateId = (typeof copy.desktop.cowork.agentsPage.templates)[number]["id"];

const TEMPLATE_ICON: Record<TemplateId, LucideIcon> = {
  goal: Goal,
  research: Telescope,
  followup: MessageSquareReply,
  watch: Eye,
};

/** The wavy divider between your agents and the quick starts (as on Scheduled). */
const WAVE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='8'%3E%3Cpath d='M0 4 Q4 1 8 4 T16 4' fill='none' stroke='%23D6D5D0' stroke-width='1.25'/%3E%3C/svg%3E")`;

/**
 * AgentsPage — opened from the sidenav's Agents item (decision 45).
 *
 * Built like the Scheduled page but lighter: the serif title and its `/agents`
 * hint, search and New agent, then four quick starts. The agents Aaron starts
 * in sessions (Delivery Watch, Growth Scout) are listed above the quick starts,
 * a second door into each agent's chat (decision 45), each in a bordered card
 * with a "✓ Live" chip, so they read apart from the quick starts. The quick
 * starts are inert.
 */
export function AgentsPage({ onOpen }: { onOpen: (id: FlowId) => void }) {
  const t = copy.desktop.cowork.agentsPage;
  const live = useCoworkChat((s) => s.live);
  const agents = copy.desktop.cowork.flows.items.filter((f) => live.includes(f.id));
  const [before, command, after] = t.subline;

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-bg">
      <div className="mx-auto w-full max-w-[880px] px-10 pb-16 pt-14">
        <header className="flex items-center justify-between gap-6">
          <h1 className="font-serif text-[28px] font-medium leading-tight text-text">{t.title}</h1>
          <div className="flex shrink-0 items-center gap-2">
            <PageSearch placeholder={t.search} />
            <button
              type="button"
              className="flex h-8 items-center rounded-md bg-text px-3.5 text-[13px] font-medium text-white transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:opacity-85"
            >
              {t.newAgent}
            </button>
          </div>
        </header>
        <p className="mt-3 text-[14px] text-text-muted">
          {before} <code className="rounded-sm bg-elevated px-1 py-px font-mono text-[13px] text-text">{command}</code>{" "}
          {after}
        </p>

        {agents.length > 0 && (
          <>
            <div className="mt-10 flex flex-col gap-3">
              {agents.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onOpen(a.id)}
                  className="flex items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated/70"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-elevated text-text-muted">
                    <Waypoints className="size-[18px]" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium text-text">{a.title}</span>
                    <span className="mt-0.5 block truncate text-[14px] text-text-muted">{a.schedule}</span>
                  </span>
                  <LiveChip />
                </button>
              ))}
            </div>
            <div aria-hidden className="mt-8 h-2 bg-repeat-x" style={{ backgroundImage: WAVE }} />
          </>
        )}
        <div className="mt-10 grid grid-cols-2 gap-x-4">
          {t.templates.map((tpl) => (
            <TemplateRow key={tpl.id} icon={TEMPLATE_ICON[tpl.id]} {...tpl} />
          ))}
        </div>
      </div>
    </div>
  );
}
