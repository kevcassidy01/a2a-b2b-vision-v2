import { ArrowUp } from "lucide-react";
import { copy } from "../../copy/copy";
import { useStory } from "../story";

const t = copy.a2a.commandCenter;
type Metric = { label: string; value: string; delta?: string; compare?: string };

/**
 * MetricTiles — the last 6 months in eight tiles, four to a row. Each tile is
 * a subgrid of the row, so labels, values, rises and comparisons line up
 * across a row even when a tile has no rise or comparison.
 */
export function MetricTiles() {
  // Once O-5531 is in, the tiles it moves take their new figures, each flashing as it changes.
  const { ordered } = useStory();
  return (
    <div className="grid grid-cols-4 gap-3">
      {t.metrics.map((m) => {
        const after = ordered ? t.afterOrder[m.label] : undefined;
        return <Tile key={m.label} metric={after ? { ...m, ...after } : m} bumped={!!after} />;
      })}
    </div>
  );
}

function Tile({ metric: m, bumped }: { metric: Metric; bumped: boolean }) {
  return (
    <div className="a2a-card row-span-4 grid grid-rows-subgrid gap-y-0 rounded-xl p-4">
      <p className="text-[13px] text-text-muted">{m.label}</p>
      <p className="a2a-title mt-1.5 text-[30px] font-semibold leading-none tracking-[-0.025em] tabular-nums text-text">
        <span key={m.value} className={bumped ? "a2a-bump" : undefined}>
          {m.value}
        </span>
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
