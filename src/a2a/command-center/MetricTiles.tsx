import { ArrowUp } from "lucide-react";
import { copy } from "../../copy/copy";

const t = copy.a2a.commandCenter;
type Metric = (typeof t.metrics)[number];

/**
 * MetricTiles — the last 12 months in eight tiles, four to a row. Each tile is
 * a subgrid of the row, so labels, values, rises and comparisons line up
 * across a row even when a tile has no rise or comparison.
 */
export function MetricTiles() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {t.metrics.map((m) => (
        <Tile key={m.label} metric={m} />
      ))}
    </div>
  );
}

function Tile({ metric: m }: { metric: Metric }) {
  return (
    <div className="a2a-card row-span-4 grid grid-rows-subgrid gap-y-0 rounded-xl p-4">
      <p className="text-[13px] text-text-muted">{m.label}</p>
      <p className="a2a-title mt-1.5 text-[30px] font-semibold leading-none tracking-[-0.025em] tabular-nums text-text">
        {m.value}
      </p>
      <div>
        {"delta" in m && (
          <span className="mt-1.5 inline-flex h-5 items-center gap-0.5 rounded-md bg-success-soft pl-1 pr-1.5 text-[12px] font-semibold tabular-nums text-success">
            <ArrowUp className="size-3" strokeWidth={2.75} aria-hidden />
            <span className="sr-only">{t.up} </span>
            {m.delta}
          </span>
        )}
      </div>
      <p className="text-[12.5px] text-text-muted [&:not(:empty)]:mt-1.5">
        {"compare" in m ? m.compare : null}
      </p>
    </div>
  );
}
