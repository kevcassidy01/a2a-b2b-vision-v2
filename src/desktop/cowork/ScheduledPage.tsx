import {
  Binoculars,
  Calendar,
  Lightbulb,
  ListChecks,
  Mailbox,
  Sunrise,
  type LucideIcon,
} from "lucide-react";
import { copy } from "../../copy/copy";
import { useCoworkChat } from "./chat/store";
import { PageSearch } from "./PageSearch";
import { TemplateRow } from "./TemplateRow";

export type TemplateId = (typeof copy.desktop.cowork.scheduledPage.templates)[number]["id"];

const TEMPLATE_ICON: Record<TemplateId, LucideIcon> = {
  briefing: Sunrise,
  inbox: Mailbox,
  meeting: Calendar,
  weekly: ListChecks,
  content: Lightbulb,
  monitor: Binoculars,
};

/** The live page's wavy divider: one 16×8 wave, repeated across. */
const WAVE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='8'%3E%3Cpath d='M0 4 Q4 1 8 4 T16 4' fill='none' stroke='%23D6D5D0' stroke-width='1.25'/%3E%3C/svg%3E")`;

/**
 * ScheduledPage — the live app's Scheduled tasks page (COWORK_INTENT §8.5,
 * decision 45), opened from the sidenav's Scheduled item.
 *
 * The starting point: the serif title and its `/schedule` hint, search and
 * New task, then the six templates. Hovering a template previews it
 * (TemplateRow). The Daily briefing template starts the brief's session
 * (decision 54); the others are inert. Once the brief is scheduled, its card
 * sits above the templates with the wavy divider between (as in the live app,
 * live-scheduled-07.png), and opens its session.
 */
export function ScheduledPage({ onStart, onOpenTask }: { onStart: (id: TemplateId) => void; onOpenTask: () => void }) {
  const t = copy.desktop.cowork.scheduledPage;
  const [before, command, after] = t.subline;
  const scheduled = useCoworkChat((s) => s.scheduled.includes("brief"));
  const ran = useCoworkChat((s) => s.ran.includes("brief"));
  const brief = copy.desktop.cowork.flows.items.find((f) => f.id === "brief")!;

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
              {t.newTask}
            </button>
          </div>
        </header>
        <p className="mt-3 text-[14px] text-text-muted">
          {before}{" "}
          <code className="rounded-sm bg-elevated px-1 py-px font-mono text-[13px] text-text">{command}</code>{" "}
          {after}
        </p>

        {/* Once a task exists, its card goes here, then the wavy divider. */}
        {scheduled && (
          <>
            <button
              type="button"
              onClick={onOpenTask}
              className="animate-fade-in mt-10 flex w-full items-start gap-3.5 rounded-lg border border-border bg-surface p-4 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated/50"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-elevated text-text-muted">
                <Sunrise className="size-[18px]" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-text">{brief.title}</span>
                <span className="mt-0.5 block text-[14px] leading-snug text-text-muted">
                  {copy.desktop.cowork.scheduledPage.taskBody}
                </span>
                <span className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
                  <span className="whitespace-nowrap rounded-md bg-success-soft px-2 py-0.5 font-medium text-success">{t.taskWhen}</span>
                  <span className="whitespace-nowrap rounded-md bg-warning-soft px-2 py-0.5 font-medium text-warning">
                    {copy.desktop.cowork.chat.onThisComputer}
                  </span>
                  <span className="text-text-subtle">{ran ? t.lastRun : t.nextRun}</span>
                </span>
              </span>
            </button>
            <div aria-hidden className="mt-10 h-2 bg-repeat-x" style={{ backgroundImage: WAVE }} />
          </>
        )}
        <div className="mt-10 grid grid-cols-2 gap-x-4">
          {t.templates.map((tpl) => (
            <TemplateRow
              key={tpl.id}
              icon={TEMPLATE_ICON[tpl.id]}
              {...tpl}
              onClick={tpl.id === "briefing" ? () => onStart(tpl.id) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
