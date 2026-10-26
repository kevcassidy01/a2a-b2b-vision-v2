import { Download, MessageSquareText } from "lucide-react";
import type { KeyboardEvent } from "react";
import { copy } from "../../copy/copy";
import { useStory } from "../story";
import { Segmented } from "../../shell/Segmented";
import { ActionButton } from "./ActionButton";

const t = copy.a2a.commandCenter.activity;
type Tone = (typeof t.statuses)[keyof typeof t.statuses]["tone"];

const DOT: Record<Tone, string> = {
  success: "bg-success",
  info: "bg-[var(--blue-500)]",
  warning: "bg-[#f5b500]",
  neutral: "bg-text-muted/50",
};

/** J and K move through the rows (as do the arrow keys). */
function onRowKey(e: KeyboardEvent<HTMLTableRowElement>) {
  const row = e.currentTarget;
  const next =
    e.key === "j" || e.key === "ArrowDown"
      ? row.nextElementSibling
      : e.key === "k" || e.key === "ArrowUp"
        ? row.previousElementSibling
        : null;
  if (next instanceof HTMLElement) {
    e.preventDefault();
    next.focus();
  }
}

/**
 * ActivityCard — the newest orders, as a plain table (shadcn's): its title,
 * with Ask about this and Export CSV at the right; what to list (Orders, Carts, Quotes, Cases); then the table in its own
 * hairline box, a quiet header row over hairline-divided rows that light up on
 * hover or focus. Dates and totals in tabular figures, totals right-aligned;
 * the status as a small outlined badge with a coloured dot. Twelve rows, then
 * Show all with the count. On a narrow card the store beside each order
 * number goes. Only Orders has rows so far.
 */
export function ActivityCard() {
  const c = t.columns;
  // Once O-5531 is in, it heads the list (rising in with a pale blue wash), and the oldest row goes.
  const { ordered } = useStory();
  const rows = ordered ? [t.newRow, ...t.rows.slice(0, -1)] : t.rows;
  const total = ordered ? t.total + 1 : t.total;
  return (
    <section className="a2a-card @container rounded-xl p-5">
      <div className="flex items-center gap-2">
        <h3 className="a2a-title mr-auto text-[14px] font-semibold text-text">{t.title}</h3>
        <ActionButton icon={MessageSquareText} label={t.ask} />
        <ActionButton icon={Download} label={t.export} />
      </div>

      <div className="a2a-no-scrollbar -mx-5 mt-4 flex overflow-x-auto px-5">
        <Segmented options={t.kind.options} label={t.kind.label} reserveCheck={false} />
      </div>

      <div className="mt-4 overflow-x-auto rounded-md border border-border">
        <table className="w-full whitespace-nowrap text-[13px]">
          <thead className="bg-[#fafafb] text-left text-[12.5px] text-text-muted">
            <tr className="h-9 border-b border-border">
              <th className="px-3 font-medium">{c.date}</th>
              <th className="px-3 font-medium">{c.order}</th>
              <th className="px-3 font-medium">{c.account}</th>
              <th className="px-3 font-medium">{c.status}</th>
              <th className="px-3 text-right font-medium">{c.total}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const s = t.statuses[r.status as keyof typeof t.statuses];
              return (
                <tr
                  key={r.order}
                  tabIndex={0}
                  onKeyDown={onRowKey}
                  className={`${r === t.newRow ? "a2a-arrive" : ""} h-11 cursor-pointer border-b border-border outline-none transition-colors last:border-b-0 hover:bg-black/[0.025] focus-visible:bg-[rgb(45_127_249/0.06)]`}
                >
                  <td className="px-3 tabular-nums text-text-muted">{r.date}</td>
                  <td className="px-3">
                    <span className="font-medium tabular-nums text-text">{r.order}</span>
                    <span className="pl-2 text-text-muted @max-3xl:hidden">{r.store}</span>
                  </td>
                  <td className="px-3 text-text">{r.account}</td>
                  <td className="px-3">
                    <span className="inline-flex h-6 items-center gap-1.5 rounded-md border border-border px-2 text-[12px] font-medium text-text">
                      <span aria-hidden className={`size-1.5 rounded-full ${DOT[s.tone]}`} />
                      {s.label}
                    </span>
                  </td>
                  <td className="px-3 text-right font-medium tabular-nums text-text">{r.total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          className="a2a-control flex h-8 items-center rounded-md px-3 text-[13.5px] font-medium text-text"
        >
          {t.showAll} {total}
        </button>
        <span className="text-[13px] text-text-muted">
          {rows.length} {t.of} {total}
        </span>
      </div>
    </section>
  );
}
