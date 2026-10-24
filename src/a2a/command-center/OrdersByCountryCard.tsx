import { Download, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { copy } from "../../copy/copy";
import { Segmented } from "../../shell/Segmented";
import { ActionButton } from "./ActionButton";
import { OrdersMap } from "./OrdersMap";

const t = copy.a2a.commandCenter.ordersByCountry;

const share = (n: number) => `${((n / t.total) * 100).toFixed(1)}%`;

/**
 * OrdersByCountryCard — the wide card under the metrics: its title and scope,
 * with Ask about this and Export CSV at the right; a line on what it counts;
 * the metric to break down by (a segmented control that scrolls sideways if
 * the card is narrow); then the map, in its own box, beside the list by
 * country. Hovering a bubble or a row picks out that country in both: the
 * other bubbles dim and the row gets a light blue box. Only Orders has figures so far. On a
 * narrower card the list moves under the map, in two columns.
 */
export function OrdersByCountryCard() {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <section className="a2a-card @container rounded-xl p-5">
      <div className="flex items-center gap-2">
        <h3 className="a2a-title text-[14px] font-semibold text-text">{t.title}</h3>
        <span className="mr-auto pl-1 text-[13.5px] text-text-muted">{t.scope}</span>
        <ActionButton icon={MessageSquareText} label={t.ask} />
        <ActionButton icon={Download} label={t.export} />
      </div>
      <p className="mt-1.5 text-[13.5px] text-text-muted">{t.description}</p>

      <div className="a2a-no-scrollbar -mx-5 mt-4 flex overflow-x-auto px-5">
        <Segmented options={t.metric.options} label={t.metric.label} reserveCheck={false} />
      </div>

      {/* Wide cards: the map beside the list. Narrower: the map across the card,
          the list under it in two columns. */}
      <div className="mt-5 grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_260px] @5xl:gap-8">
        <div className="flex flex-col">
          <OrdersMap hovered={hovered} onHover={setHovered} />
        </div>
        <div>
          <h4 className="text-[13.5px] font-semibold text-text">{t.byCountry}</h4>
          <ul className="-mx-2 mt-2 grid @max-5xl:grid-flow-col @max-5xl:grid-cols-2 @max-5xl:grid-rows-6 @max-5xl:gap-x-8">
            {t.countries.map((c) => (
              <li
                key={c.code}
                className="a2a-map-row flex h-9 items-center gap-3 border-b border-border px-2 text-[13.5px]"
                data-on={hovered === c.name || undefined}
                onPointerEnter={() => setHovered(c.name)}
                onPointerLeave={() => setHovered(null)}
              >
                <span className="mr-auto truncate text-text">{c.name}</span>
                <span className="tabular-nums text-text">{c.orders}</span>
                <span className="w-11 text-right tabular-nums text-text-muted">{share(c.orders)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] text-text-muted">{t.none}</p>
        </div>
      </div>
    </section>
  );
}
