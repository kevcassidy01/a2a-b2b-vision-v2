import { useState } from "react";

/**
 * Sparkline — a tiny trend line for a table row (e.g. 3 months of revenue).
 *
 * Ends on a dot so the latest value reads as "now". `alert` draws it in the
 * alert tone (a product trending down). With `labels`, hovering shows each
 * point's label in a small tag above the line.
 */
export function Sparkline({
  points,
  labels,
  alert = false,
  width = 96,
  height = 32,
}: {
  points: number[];
  labels?: string[];
  alert?: boolean;
  width?: number;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const pad = 4;
  const x = (i: number) => pad + (i / Math.max(points.length - 1, 1)) * (width - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (height - pad * 2);
  const d = points.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const stroke = alert ? "var(--color-viz-alert)" : "var(--color-viz)";
  const last = points.length - 1;

  return (
    <div
      className="relative"
      style={{ width, height }}
      onMouseLeave={() => setHover(null)}
      onMouseMove={(e) => {
        if (!labels) return;
        const r = e.currentTarget.getBoundingClientRect();
        const i = Math.round(((e.clientX - r.left - pad) / (width - pad * 2)) * last);
        setHover(Math.min(Math.max(i, 0), last));
      }}
    >
      <svg width={width} height={height} className="overflow-visible" aria-hidden>
        <path d={d} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(hover ?? last)} cy={y(points[hover ?? last])} r={3.5} fill={stroke} stroke="var(--color-surface)" strokeWidth={1.5} />
      </svg>
      {hover != null && labels?.[hover] && (
        <span
          className="pointer-events-none absolute z-20 whitespace-nowrap rounded-md border border-border bg-surface px-2 py-0.5 text-label font-medium tabular-nums text-text shadow-sm"
          style={{ left: x(hover), top: -6, transform: "translate(-50%, -100%)" }}
        >
          {labels[hover]}
        </span>
      )}
    </div>
  );
}
