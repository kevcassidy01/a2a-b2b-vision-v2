import { Check, SlidersVertical } from "lucide-react";
import { copy } from "../../../copy/copy";
import { ICON_BTN, ListHeader } from "./parts";

/** Columns: connector (flexible), type, status (as wide as its chip and button, so
 *  they end on the header's right edge). No Authorization column (Somnath). */
const GRID = "grid grid-cols-[minmax(0,1fr)_200px_112px] items-center gap-4";

/**
 * ConnectorsPane — Settings → Connectors, as in the live app: a read-only
 * table. The demo's connectors (Salesforce Headless 360, Slack, Gmail, Google
 * Calendar, Google Drive) carry a green "Connected" chip; the others a Connect
 * button (it doesn't act) so the list doesn't look pre-arranged. Chip and
 * button share a width, so the status column lines up. Brand logos are
 * Somnath's (public/connectors/); a row without one shows an initial tile.
 */
export function ConnectorsPane() {
  const t = copy.desktop.cowork.settings.connectors;
  const list = copy.desktop.cowork.settings.list;

  return (
    // One scroller for the header and the list, so a scrollbar can't shift one
    // against the other: their left and right edges stay aligned.
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 mx-auto w-full max-w-[880px] bg-surface px-8 pb-4 pt-14">
        <ListHeader
          title={t.title}
          actions={
            <button type="button" aria-label={list.filter} className={ICON_BTN}>
              <SlidersVertical className="size-[18px]" strokeWidth={2} />
            </button>
          }
        />
      </div>

      <div>
        <div className="mx-auto w-full max-w-[880px] px-8 pb-8">
          <div className={`${GRID} h-9 border-b border-border text-ui text-text-muted`}>
            <span>{t.columns.connector}</span>
            <span>{t.columns.type}</span>
            <span>{t.columns.status}</span>
          </div>
          <ul>
            {t.items.map(({ name, connected, badge, logo }) => (
              <li key={name} className={`${GRID} h-[52px] border-b border-border`}>
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-md border border-prompt-border bg-surface">
                    {logo ? (
                      <img src={logo} alt="" aria-hidden className="size-4 object-contain" />
                    ) : (
                      <span className="text-[12px] font-semibold text-text-muted">{name[0]}</span>
                    )}
                  </span>
                  <span className="truncate text-ui font-medium text-text">{name}</span>
                </span>
                <span className="flex items-center gap-2 text-ui text-text-muted">
                  {t.web}
                  {badge && <span className="rounded-sm bg-track px-1.5 text-[11px]/[18px] text-text-muted">{badge}</span>}
                </span>
                <span>
                  {connected ? (
                    <span className="inline-flex h-8 w-[112px] items-center justify-center gap-1.5 rounded-md bg-success-soft text-ui text-success">
                      <Check className="size-4" strokeWidth={2.25} />
                      {t.connected}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="h-8 w-[112px] rounded-md border border-prompt-border bg-surface text-ui text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-pressed"
                    >
                      {t.connect}
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
