import { useState } from "react";
import type { LineChartSpec, XY } from "../types";
import { ChartTooltip } from "./ChartTooltip";
import { useWidth } from "./useWidth";

/**
 * LineChart — a hand-built line chart for insight views.
 *
 * Shapes are SVG in real pixels; every piece of text (ticks, legend, markers,
 * end labels, the callout) is HTML laid over the plot, so type stays at the
 * insight scale (14px floor) and wraps / measures like any other copy.
 *
 * Layers, back to front: gridlines → goal line (dashed, muted) → area wash →
 * main series → projection (dashed, continues the series) → event markers →
 * callout dot. End labels sit in a right margin, nudged apart so two close
 * values (e.g. goal vs projection) never collide. An optional `compare` line
 * draws quieter, behind the main series.
 *
 * Hover: moving across the plot snaps a guide to the nearest labelled point
 * (series, projection end, or compare) and shows its annotation.
 */
const PAD = { l: 64, t: 40, b: 36 };
const END_GAP = 22; // min vertical px between two end labels

const END_TONE = {
  viz: "text-viz",
  goal: "text-text-muted",
  danger: "text-danger",
} as const;

export function LineChart({ spec }: { spec: LineChartSpec }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<XY | null>(null);
  const h = spec.height ?? 280;
  const padR = spec.endLabels?.length ? 132 : 20;
  const iw = Math.max(width - PAD.l - padR, 40);
  const ih = h - PAD.t - PAD.b;

  const sx = (x: number) => PAD.l + ((x - spec.x[0]) / (spec.x[1] - spec.x[0])) * iw;
  const sy = (y: number) => PAD.t + ih - ((y - spec.y[0]) / (spec.y[1] - spec.y[0])) * ih;
  const path = (pts: XY[]) => pts.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join("");

  const s = spec.series;
  const last = s[s.length - 1];
  const area = `${path(s)}L${sx(last.x)},${sy(spec.y[0])}L${sx(s[0].x)},${sy(spec.y[0])}Z`;
  const projection = spec.projection ? [last, ...spec.projection] : undefined;

  // End labels: place at their value, then push apart top-down.
  const ends = [...(spec.endLabels ?? [])]
    .map((e) => ({ ...e, top: sy(e.y) }))
    .sort((a, b) => a.top - b.top);
  for (let i = 1; i < ends.length; i++) ends[i].top = Math.max(ends[i].top, ends[i - 1].top + END_GAP);

  // Hoverable points: anything carrying a label. Compare points fold into the
  // main point at the same x as an extra detail line.
  const hoverable = [...s, ...(spec.projection ?? [])].filter((p) => p.label);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverable.length) return;
    const r = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - r.left;
    let best = hoverable[0];
    for (const p of hoverable) if (Math.abs(sx(p.x) - mx) < Math.abs(sx(best.x) - mx)) best = p;
    setHover(best);
  };
  const hoverLines = (p: XY) => {
    const c = spec.compare?.find((q) => q.x === p.x);
    return [p.label!, p.display ?? "", ...(p.detail ? [p.detail] : []), ...(c?.display ? [`${spec.compareLabel}: ${c.display}`] : [])].filter(Boolean);
  };

  return (
    <div className="space-y-3">
      <Legend spec={spec} />
      <div ref={ref} className="relative w-full" style={{ height: h }} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {width > 0 && (
          <>
            <svg width={width} height={h} className="absolute inset-0 overflow-visible" aria-hidden>
              <defs>
                <linearGradient id="viz-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-viz)" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="var(--color-viz)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Gridlines — one per y tick, hairline. */}
              {spec.yTicks.map((t) => (
                <line key={t.at} x1={PAD.l} x2={PAD.l + iw} y1={sy(t.at)} y2={sy(t.at)} stroke="var(--color-viz-grid)" />
              ))}

              {spec.goal && (
                <path d={path(spec.goal)} fill="none" stroke="var(--color-viz-goal)" strokeWidth={1.5} strokeDasharray="5 5" />
              )}

              {spec.compare && (
                <path d={path(spec.compare)} fill="none" stroke="var(--color-viz-muted)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
              )}

              <path d={area} fill="url(#viz-area)" />
              <path d={path(s)} fill="none" stroke="var(--color-viz)" strokeWidth={2.75} strokeLinejoin="round" strokeLinecap="round" />

              {projection && (
                <>
                  <path d={path(projection)} fill="none" stroke="var(--color-viz)" strokeWidth={2.75} strokeDasharray="2 6" strokeLinecap="round" />
                  {(() => {
                    const p = projection[projection.length - 1];
                    return <circle cx={sx(p.x)} cy={sy(p.y)} r={4.5} fill="var(--color-surface)" stroke="var(--color-viz)" strokeWidth={2.5} />;
                  })()}
                </>
              )}

              {/* The series' current point. */}
              <circle cx={sx(last.x)} cy={sy(last.y)} r={5} fill="var(--color-viz)" stroke="var(--color-surface)" strokeWidth={2} />

              {spec.markers?.map((m) => (
                <line
                  key={m.label}
                  x1={sx(m.at)}
                  x2={sx(m.at)}
                  y1={PAD.t - 8}
                  y2={PAD.t + ih}
                  stroke="var(--color-text-muted)"
                  strokeWidth={1}
                  strokeDasharray="3 4"
                />
              ))}

              {spec.callout && (
                <>
                  <line
                    x1={sx(spec.callout.at.x)}
                    x2={sx(spec.callout.at.x) + (spec.callout.side === "left" ? -18 : 18)}
                    y1={sy(spec.callout.at.y)}
                    y2={sy(spec.callout.at.y) - 18}
                    stroke="var(--color-text)"
                    strokeWidth={1}
                  />
                  <circle cx={sx(spec.callout.at.x)} cy={sy(spec.callout.at.y)} r={5} fill="var(--color-text)" stroke="var(--color-surface)" strokeWidth={2} />
                </>
              )}

              {hover && (
                <>
                  <line x1={sx(hover.x)} x2={sx(hover.x)} y1={PAD.t} y2={PAD.t + ih} stroke="var(--color-text-muted)" strokeWidth={1} />
                  <circle cx={sx(hover.x)} cy={sy(hover.y)} r={6} fill="var(--color-surface)" stroke="var(--color-viz)" strokeWidth={3} />
                </>
              )}
            </svg>

            {/* Y ticks — right-aligned into the left gutter. */}
            {spec.yTicks.map((t) => (
              <span
                key={t.at}
                className="absolute text-label tabular-nums text-text-muted"
                style={{ right: width - PAD.l + 12, top: sy(t.at), transform: "translateY(-50%)" }}
              >
                {t.label}
              </span>
            ))}

            {/* X ticks — centered under their position. */}
            {spec.xTicks.map((t) => (
              <span
                key={t.at}
                className="absolute whitespace-nowrap text-label text-text-muted"
                style={{ left: sx(t.at), top: PAD.t + ih + 10, transform: "translateX(-50%)" }}
              >
                {t.label}
              </span>
            ))}

            {/* Event markers — label on top of the dashed rule. */}
            {spec.markers?.map((m) => (
              <span
                key={m.label}
                className="absolute whitespace-nowrap rounded bg-surface px-1.5 text-label font-medium text-text"
                style={{ left: sx(m.at), top: 4, transform: "translateX(-50%)" }}
              >
                {m.label}
              </span>
            ))}

            {ends.map((e) => (
              <span
                key={e.text}
                className={`absolute whitespace-nowrap text-label font-semibold tabular-nums ${END_TONE[e.tone]}`}
                style={{ left: PAD.l + iw + 12, top: e.top, transform: "translateY(-50%)" }}
              >
                {e.text}
              </span>
            ))}

            {spec.callout && (
              <span
                className="absolute max-w-[220px] rounded-md border border-border bg-surface px-2.5 py-1.5 text-label font-medium text-text shadow-sm"
                style={{
                  top: sy(spec.callout.at.y) - 18,
                  left: sx(spec.callout.at.x) + (spec.callout.side === "left" ? -18 : 18),
                  transform: `translate(${spec.callout.side === "left" ? "-100%" : "0"}, -100%)`,
                }}
              >
                {spec.callout.text}
              </span>
            )}

            {hover && (
              <ChartTooltip x={sx(hover.x)} y={sy(hover.y)} width={width} lines={hoverLines(hover)} below={sy(hover.y) < PAD.t + 90} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Legend — one swatch per drawn layer (solid / dashed series, dashed goal). */
function Legend({ spec }: { spec: LineChartSpec }) {
  const item = (swatch: React.ReactNode, label: string) => (
    <span key={label} className="inline-flex items-center gap-2 text-label text-text-muted">
      {swatch}
      {label}
    </span>
  );
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
      {item(<span className="h-[3px] w-5 rounded-full bg-viz" />, spec.seriesLabel)}
      {spec.compare && item(<span className="h-[3px] w-5 rounded-full bg-viz-muted" />, spec.compareLabel ?? "Compare")}
      {spec.projection &&
        item(
          <svg width="20" height="4" aria-hidden>
            <line x1="1" x2="19" y1="2" y2="2" stroke="var(--color-viz)" strokeWidth="2.75" strokeDasharray="2 5" strokeLinecap="round" />
          </svg>,
          spec.projectionLabel ?? "Projected",
        )}
      {spec.goal &&
        item(
          <svg width="20" height="4" aria-hidden>
            <line x1="0" x2="20" y1="2" y2="2" stroke="var(--color-viz-goal)" strokeWidth="1.5" strokeDasharray="5 4" />
          </svg>,
          spec.goalLabel ?? "Goal",
        )}
    </div>
  );
}
