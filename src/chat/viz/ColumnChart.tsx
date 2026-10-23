import { useState } from "react";
import type { ColumnChartSpec } from "../types";
import { ChartTooltip } from "./ChartTooltip";
import { useWidth } from "./useWidth";

/**
 * ColumnChart — vertical bars per period (e.g. revenue by month).
 *
 * Same construction as LineChart: SVG shapes in real pixels, all text as HTML
 * overlays. A bar can carry a hatched `projected` cap (what's still to come at
 * the current pace). A dashed goal line runs across with its label in the right
 * margin; one pinned callout sits above its bar. Hovering a bar fades the others
 * and shows the bar's annotation.
 */
const PAD = { l: 64, t: 44, b: 36 };

const FILL = {
  viz: "var(--color-viz)",
  danger: "var(--color-viz-alert)",
  muted: "var(--color-viz-muted)",
} as const;

export function ColumnChart({ spec }: { spec: ColumnChartSpec }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const h = spec.height ?? 280;
  const padR = spec.goal ? 120 : 20;
  const iw = Math.max(width - PAD.l - padR, 40);
  const ih = h - PAD.t - PAD.b;
  const sy = (v: number) => PAD.t + ih - (v / spec.yMax) * ih;
  const slot = iw / spec.bars.length;
  const bw = Math.min(64, slot * 0.52);
  const bx = (i: number) => PAD.l + slot * i + (slot - bw) / 2;
  const hasProjection = spec.bars.some((b) => b.projected);

  return (
    <div className="space-y-3">
      {(hasProjection || spec.goal) && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <span className="inline-flex items-center gap-2 text-label text-text-muted">
            <span className="size-3 rounded-sm bg-viz" />
            Actual
          </span>
          {hasProjection && (
            <span className="inline-flex items-center gap-2 text-label text-text-muted">
              <svg width="12" height="12" aria-hidden>
                <rect width="12" height="12" rx="2" fill="url(#viz-hatch)" stroke="var(--color-viz)" strokeWidth="1" />
              </svg>
              {spec.projectedLabel ?? "Projected"}
            </span>
          )}
          {spec.goal && (
            <span className="inline-flex items-center gap-2 text-label text-text-muted">
              <svg width="20" height="4" aria-hidden>
                <line x1="0" x2="20" y1="2" y2="2" stroke="var(--color-viz-goal)" strokeWidth="1.5" strokeDasharray="5 4" />
              </svg>
              {spec.goal.label}
            </span>
          )}
        </div>
      )}

      <div ref={ref} className="relative w-full" style={{ height: h }} onMouseLeave={() => setHover(null)}>
        {width > 0 && (
          <>
            <svg width={width} height={h} className="absolute inset-0 overflow-visible" aria-hidden>
              <defs>
                <pattern id="viz-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="6" height="6" fill="var(--color-viz-soft)" />
                  <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-viz)" strokeWidth="2" />
                </pattern>
              </defs>
              {spec.yTicks.map((t) => (
                <line key={t.at} x1={PAD.l} x2={PAD.l + iw} y1={sy(t.at)} y2={sy(t.at)} stroke="var(--color-viz-grid)" />
              ))}
              {spec.bars.map((b, i) => {
                const fade = hover != null && hover !== i ? 0.35 : 1;
                const top = sy(b.value);
                return (
                  <g key={b.label} opacity={fade} style={{ transition: "opacity 120ms" }}>
                    <rect x={bx(i)} y={top} width={bw} height={sy(0) - top} rx={4} fill={FILL[b.tone ?? "viz"]} />
                    {b.projected ? (
                      <rect
                        x={bx(i) + 0.75}
                        y={sy(b.value + b.projected)}
                        width={bw - 1.5}
                        height={sy(b.value) - sy(b.value + b.projected) - 2}
                        rx={4}
                        fill="url(#viz-hatch)"
                        stroke="var(--color-viz)"
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                      />
                    ) : null}
                  </g>
                );
              })}
              {spec.goal && (
                <line
                  x1={PAD.l}
                  x2={PAD.l + iw}
                  y1={sy(spec.goal.at)}
                  y2={sy(spec.goal.at)}
                  stroke="var(--color-viz-goal)"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                />
              )}
            </svg>

            {spec.yTicks.map((t) => (
              <span
                key={t.at}
                className="absolute text-label tabular-nums text-text-muted"
                style={{ right: width - PAD.l + 12, top: sy(t.at), transform: "translateY(-50%)" }}
              >
                {t.label}
              </span>
            ))}

            {spec.bars.map((b, i) => (
              <span
                key={b.label}
                className="absolute text-label text-text-muted"
                style={{ left: bx(i) + bw / 2, top: PAD.t + ih + 10, transform: "translateX(-50%)" }}
              >
                {b.label}
              </span>
            ))}

            {/* Value labels above each bar (skipped for the callout bar, which
                carries its value in the callout). */}
            {spec.bars.map((b, i) =>
              spec.callout?.bar === i ? null : (
                <span
                  key={b.label}
                  className="absolute whitespace-nowrap rounded bg-surface px-1 text-label font-semibold tabular-nums text-text"
                  style={{ left: bx(i) + bw / 2, top: sy(b.value + (b.projected ?? 0)) - 6, transform: "translate(-50%, -100%)" }}
                >
                  {b.display}
                </span>
              ),
            )}

            {spec.goal && (
              <span
                className="absolute whitespace-nowrap text-label font-semibold text-text-muted"
                style={{ left: PAD.l + iw + 12, top: sy(spec.goal.at), transform: "translateY(-50%)" }}
              >
                {spec.goal.short ?? spec.goal.label}
              </span>
            )}

            {spec.callout &&
              (() => {
                const i = spec.callout.bar;
                const b = spec.bars[i];
                const cx = bx(i) + bw / 2;
                const top = sy(b.value + (b.projected ?? 0));
                return (
                  <span
                    className="absolute w-max max-w-[200px] rounded-md border border-border bg-surface px-2.5 py-1.5 text-label shadow-sm"
                    style={{ left: Math.min(cx, PAD.l + iw - 100), top: top - 8, transform: "translate(-50%, -100%)" }}
                  >
                    <span className="block font-semibold tabular-nums text-text">{b.display}</span>
                    <span className="block text-text-muted">{spec.callout.text}</span>
                  </span>
                );
              })()}

            {/* Hover targets — one full-height column per bar. */}
            {spec.bars.map((b, i) => (
              <div
                key={b.label}
                className="absolute cursor-default"
                style={{ left: PAD.l + slot * i, top: PAD.t, width: slot, height: ih }}
                onMouseEnter={() => setHover(i)}
              />
            ))}

            {hover != null &&
              spec.bars[hover].hover &&
              (() => {
                const b = spec.bars[hover];
                const top = sy(b.value + (b.projected ?? 0)) - 26;
                return (
                  <ChartTooltip x={bx(hover) + bw / 2} y={top < 90 ? sy(b.value) + 12 : top} width={width} lines={b.hover!} below={top < 90} />
                );
              })()}
          </>
        )}
      </div>
    </div>
  );
}
