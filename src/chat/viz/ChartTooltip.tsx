/**
 * ChartTooltip — the hover annotation shared by every chart.
 *
 * Positioned in the chart's own pixel space (`x`, `y` = the point being
 * annotated); it sits above the point and is clamped inside `width` so it
 * never spills past the chart's edges. First line is the label (what / when),
 * the second the figure, the rest quiet detail. 14px floor throughout.
 */
export function ChartTooltip({
  x,
  y,
  width,
  lines,
  below = false,
}: {
  x: number;
  y: number;
  width: number;
  lines: string[];
  /** Open below the point instead of above (for points near the top). */
  below?: boolean;
}) {
  if (!lines.length) return null;
  const W = 220;
  const left = Math.min(Math.max(x - W / 2, 0), Math.max(width - W, 0));
  const [label, value, ...rest] = lines;
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-20 w-max max-w-[220px] rounded-lg border border-border bg-surface px-3 py-2 shadow-md"
      style={{ left, top: y, transform: below ? "translateY(14px)" : "translateY(calc(-100% - 14px))" }}
    >
      <div className="text-label text-text-muted">{label}</div>
      {value && <div className="text-body font-semibold tabular-nums text-text">{value}</div>}
      {rest.map((l) => (
        <div key={l} className="text-label text-text-muted">
          {l}
        </div>
      ))}
    </div>
  );
}
