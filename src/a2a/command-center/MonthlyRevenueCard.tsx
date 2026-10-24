import { Download, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { copy } from "../../copy/copy";
import { ActionButton } from "./ActionButton";

const t = copy.a2a.commandCenter.monthlyRevenue;

/** The y scale's top, in thousands, and its gridlines. */
const TOP = 400;
const TICKS = [400, 200, 0];
const money = (k: number) => (k === 0 ? "$0" : `$${k}k`);

/**
 * MonthlyRevenueCard — a plain bar chart of revenue by order month over the
 * last 24 months: its title and scope, with Ask about this and Export CSV at
 * the right; a line on what it sums; then the bars on a $0–$400k scale, every
 * third month named under them. The last bar, the month so far, is a paler
 * blue. Hovering a bar names its month and figure and dims the others.
 */
export function MonthlyRevenueCard() {
  const [hovered, setHovered] = useState<number | null>(null);
  const last = t.months.length - 1;
  return (
    <section className="a2a-card rounded-xl p-5">
      <div className="flex items-center gap-2">
        <h3 className="a2a-title text-[14px] font-semibold text-text">{t.title}</h3>
        <span className="mr-auto pl-1 text-[13.5px] text-text-muted">{t.scope}</span>
        <ActionButton icon={MessageSquareText} label={t.ask} />
        <ActionButton icon={Download} label={t.export} />
      </div>
      <p className="mt-1.5 text-[13.5px] text-text-muted">{t.description}</p>

      <div className="mt-6 flex gap-3" role="img" aria-label={t.title}>
        {/* The y labels, each centred on its gridline. */}
        <div className="relative h-60 w-10 shrink-0 text-right text-[12px] tabular-nums text-text-muted">
          {TICKS.map((k) => (
            <span key={k} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - k / TOP) * 100}%` }}>
              {money(k)}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-60">
            {TICKS.map((k) => (
              <div
                key={k}
                aria-hidden
                className={`absolute inset-x-0 h-px ${k === 0 ? "bg-[var(--paper-300)]" : "bg-border"}`}
                style={{ top: `${(1 - k / TOP) * 100}%` }}
              />
            ))}
            <div className="absolute inset-0 flex items-end gap-[3px]">
              {t.months.map((m, i) => (
                <div
                  key={m.label}
                  className="relative flex h-full flex-1 items-end"
                  onPointerEnter={() => setHovered(i)}
                  onPointerLeave={() => setHovered(null)}
                >
                  <div
                    className="a2a-bar w-full rounded-t-[4px]"
                    data-partial={i === last || undefined}
                    data-dim={(hovered !== null && hovered !== i) || undefined}
                    style={{ height: `${(m.k / TOP) * 100}%` }}
                  />
                  {hovered === i && (
                    <div
                      className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-md bg-tooltip px-2 py-1 text-[12px] text-white shadow-md ${i > last - 3 ? "right-0" : "left-1/2 -translate-x-1/2"}`}
                      style={{ bottom: `calc(${(m.k / TOP) * 100}% + 6px)` }}
                    >
                      <span className="font-medium">{m.label}</span>{" "}
                      <span className="tabular-nums">{money(m.k)}</span>
                      {i === last && <span className="text-white/60"> · {t.monthToDate}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Every third month, centred under its bar. */}
          <div className="mt-2 flex gap-[3px] text-[12px] text-text-muted">
            {t.months.map((m, i) => (
              <div key={m.label} className="flex flex-1 justify-center whitespace-nowrap">
                {i % 3 === 0 && m.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
