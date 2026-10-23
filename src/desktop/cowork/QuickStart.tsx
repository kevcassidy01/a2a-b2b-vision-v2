import { CalendarClock, FileText, Newspaper, RefreshCw, Sunrise, type LucideIcon } from "lucide-react";
import { copy } from "../../copy/copy";
import { useCoworkChat } from "./chat/store";

/** Paired with `copy.desktop.cowork.quickStart.items` by position. */
const ICONS: LucideIcon[] = [Newspaper, CalendarClock, FileText, RefreshCw];

/**
 * QuickStart — the short list under the start state's banner, in the live
 * app's "Ideas for you" slot: a caption, then rows of icon tile + one line.
 * Generic, everyday starts (the demo itself is driven by voice). Presentational
 * for now: rows have a hover wash but don't act. Its corners are the tile's 8px
 * plus the 4px inset (12px), so the two curves run parallel.
 *
 * Once the morning's brief has run (Ctrl+S, the Slack banner), "Daily brief"
 * tops the list, above a hairline: it opens the brief full screen, another way
 * in besides the Scheduled page.
 */
export function QuickStart() {
  const t = copy.desktop.cowork.quickStart;
  const ran = useCoworkChat((s) => s.ran.includes("brief"));
  const openArtifact = useCoworkChat((s) => s.openArtifact);
  return (
    <section className="mt-7">
      <h2 className="px-1 pb-1.5 text-[13px] text-text-subtle">{t.title}</h2>
      {ran && (
        <div className="animate-fade-in">
          <Row icon={Sunrise} label={t.brief} onClick={() => openArtifact("brief", copy.desktop.slackBanner.opens)} />
          <div className="mx-1 my-1.5 h-px bg-border" />
        </div>
      )}
      <ul>
        {t.items.map((label, i) => {
          const Icon = ICONS[i];
          return (
            <li key={label}>
              <Row icon={Icon} label={label} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Row({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-full items-center gap-3 rounded-[12px] px-1 text-left text-ui text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-md border border-prompt-border bg-surface text-text-muted">
        <Icon className="size-[18px]" strokeWidth={1.75} />
      </span>
      {label}
    </button>
  );
}
