import { ArrowUpDown, ScrollText, Send, SlidersVertical } from "lucide-react";
import { copy } from "../../../copy/copy";
import { ICON_BTN, ListHeader, PRIMARY_BTN } from "./parts";

/**
 * SkillsPane — Settings → Skills, as in the live app: the header, an "Add your
 * first skills" callout, then every skill from the organization (our Salesforce
 * skills). Each row: skill icon, name, a "Salesforce Headless 360" badge, the
 * description truncated underneath, and when it was updated. The header sticks
 * while the list scrolls; header, callout and list share both edges.
 */
export function SkillsPane() {
  const t = copy.desktop.cowork.settings.skills;
  const list = copy.desktop.cowork.settings.list;

  return (
    // One scroller for the header and the list, so a scrollbar can't shift one
    // against the other: their left and right edges stay aligned.
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 mx-auto w-full max-w-[880px] bg-surface px-8 pb-4 pt-14">
        <ListHeader
          title={t.title}
          actions={
            <>
              <button type="button" aria-label={list.filter} className={ICON_BTN}>
                <SlidersVertical className="size-[18px]" strokeWidth={2} />
              </button>
              <button type="button" aria-label={list.sort} className={ICON_BTN}>
                <ArrowUpDown className="size-[18px]" strokeWidth={2} />
              </button>
            </>
          }
        />
      </div>

      <div>
        <div className="mx-auto w-full max-w-[880px] px-8 pb-8">
          {/* Callout, as in the live app with no personal skills yet. */}
          <div className="flex items-center gap-6 rounded-lg bg-callout px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="text-[16px] font-medium text-text">{t.emptyTitle}</div>
              <p className="mt-1 text-ui text-text-muted">{t.emptyBody}</p>
              <button type="button" className={`${PRIMARY_BTN} mt-3`}>
                {t.discoverCta}
              </button>
            </div>
            <Send aria-hidden className="mr-4 size-14 shrink-0 text-text" strokeWidth={1} />
          </div>

          <div className="mb-1 mt-7 flex items-center gap-2">
            <h3 className="text-ui font-medium text-text">{t.orgCaption}</h3>
            <span className="rounded-sm bg-track px-1.5 text-[11px]/[18px] text-text-muted">{t.items.length}</span>
          </div>

          <ul>
            {t.items.map(({ id, description }) => (
              <li key={id} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  className="-mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-pressed"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-md border border-prompt-border bg-surface text-text-muted">
                    <ScrollText className="size-[18px]" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-ui font-medium text-text">{id}</span>
                      <span className="rounded-sm bg-track px-1.5 text-[12px]/[20px] text-text-muted">{t.source}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-text-muted">{description}</span>
                  </span>
                  <span className="w-16 shrink-0 text-right text-[13px] text-text-subtle">{t.updated}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
