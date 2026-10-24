import { Download, MessageSquareText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { copy } from "../../copy/copy";
import { ActionButton } from "./ActionButton";

const t = copy.a2a.commandCenter.checkoutFunnel;
type Node = (typeof t.nodes)[number];

/** Layout, in px: the plot's height, the room above it for the steps' names,
 *  the room at the right for the last steps' names, a node's width, and the
 *  gap between nodes in a column. */
const PLOT = 220;
const TOP = 44;
const RIGHT = 190;
const NODE = 8;
const GAP = 12;

const byId = new Map<string, Node>(t.nodes.map((n) => [n.id, n]));
const parent = (n: Node) => ("from" in n ? byId.get(n.from) : undefined);
/** A step's share of the step before, e.g. "33%"; null for the first. */
const share = (n: Node) => {
  const p = parent(n);
  return p ? `${Math.round((n.n / p.n) * 100)}%` : null;
};
const depth = (n: Node): number => {
  const p = parent(n);
  return p ? depth(p) + 1 : 0;
};
const columns: Node[][] = [];
for (const n of t.nodes) (columns[depth(n)] ??= []).push(n);
const leaves = new Set(t.nodes.filter((n) => !t.nodes.some((c) => "from" in c && c.from === n.id)).map((n) => n.id));
/** Every column stacks to the first's total, so one scale fits them all. */
const scale = (PLOT - GAP * (Math.max(...columns.map((c) => c.length)) - 1)) / columns[0][0].n;

type Box = { x: number; y: number; h: number };

/** Where each node sits for a card `width` px wide, and each flow's band. */
function layout(width: number) {
  const step = (width - RIGHT - NODE) / (columns.length - 1);
  const box = new Map<string, Box>();
  columns.forEach((col, i) => {
    let y = TOP;
    for (const n of col) {
      box.set(n.id, { x: i * step, y, h: n.n * scale });
      y += n.n * scale + GAP;
    }
  });
  // Each flow leaves from the next slice of its source, top down.
  const used = new Map<string, number>();
  const flows = t.nodes.flatMap((n) => {
    const p = parent(n);
    if (!p) return [];
    const s = box.get(p.id)!;
    const d = box.get(n.id)!;
    const s0 = s.y + (used.get(p.id) ?? 0);
    used.set(p.id, (used.get(p.id) ?? 0) + d.h);
    const x0 = s.x + NODE;
    const x1 = d.x;
    const xm = (x0 + x1) / 2;
    const path =
      `M${x0},${s0} C${xm},${s0} ${xm},${d.y} ${x1},${d.y} ` +
      `L${x1},${d.y + d.h} C${xm},${d.y + d.h} ${xm},${s0 + d.h} ${x0},${s0 + d.h} Z`;
    // The tooltip sits under the band's middle, clear of the names above.
    return [{ node: n, path, mid: { x: xm, y: (s0 + d.y) / 2 + d.h } }];
  });
  return { box, flows };
}

/**
 * CheckoutFunnelCard — the checkout funnel as a Sankey, left to right: carts
 * created, checkout started, order placed, then the orders split by CRM status
 * (pending approval, activated). Each band's width is its count; the carts that
 * leave (no checkout, no order) branch off in grey. The steps carrying on are
 * named above their nodes; the ends are named beside theirs, each with its
 * count and its share of the step before. Hovering a band or its node lifts it
 * and names the step and what its share is of, dimming the rest.
 */
export function CheckoutFunnelCard() {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  useEffect(() => {
    const el = wrap.current!;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { box, flows } = layout(width);
  const tip = flows.find((f) => f.node.id === hovered);
  const hover = (id: string | null) => ({
    onPointerEnter: () => setHovered(id),
    onPointerLeave: () => setHovered(null),
  });
  const dim = (id: string) => (hovered !== null && hovered !== id) || undefined;

  return (
    <section className="a2a-card rounded-xl p-5">
      <div className="flex items-center gap-2">
        <h3 className="a2a-title mr-auto text-[14px] font-semibold text-text">{t.title}</h3>
        <ActionButton icon={MessageSquareText} label={t.ask} />
        <ActionButton icon={Download} label={t.export} />
      </div>
      <p className="mt-1.5 text-[13.5px] text-text-muted">{t.description}</p>

      <div ref={wrap} className="relative mt-5">
        {width > 0 && (
          <svg width={width} height={TOP + PLOT + 4} role="img" aria-label={t.title} className="block overflow-visible">
            {flows.map((f) => (
              <path
                key={f.node.id}
                d={f.path}
                className="a2a-flow"
                data-drop={("drop" in f.node && f.node.drop) || undefined}
                data-waiting={("waiting" in f.node && f.node.waiting) || undefined}
                data-dim={dim(f.node.id)}
                {...hover(f.node.id)}
              />
            ))}
            {t.nodes.map((n) => {
              const b = box.get(n.id)!;
              const leaf = leaves.has(n.id);
              const s = share(n);
              return (
                <g key={n.id} {...hover(parent(n) ? n.id : null)}>
                  <rect
                    x={b.x}
                    y={b.y}
                    width={NODE}
                    height={Math.max(b.h, 1)}
                    rx={2}
                    className="a2a-flow-node"
                    data-drop={("drop" in n && n.drop) || undefined}
                    data-waiting={("waiting" in n && n.waiting) || undefined}
                    data-dim={parent(n) ? dim(n.id) : undefined}
                  />
                  {leaf ? (
                    // An end: named beside its node, on one line.
                    <text x={b.x + NODE + 8} y={b.y + b.h / 2} dominantBaseline="central" className="text-[12.5px]">
                      <tspan className="fill-text font-medium">{n.label}</tspan>
                      <tspan className="fill-text tabular-nums" dx={6}>{n.n}</tspan>
                      {s && <tspan className="fill-text-muted" dx={5}>{s}</tspan>}
                    </text>
                  ) : (
                    // A step carrying on: named above its node.
                    <text x={b.x} y={TOP - 26} className="text-[12.5px]">
                      <tspan className="fill-text font-medium">{n.label}</tspan>
                      <tspan x={b.x} dy={17}>
                        <tspan className="fill-text tabular-nums">{n.n}</tspan>
                        {s && <tspan className="fill-text-muted" dx={5}>{s}</tspan>}
                      </tspan>
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
        {tip && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 translate-y-2 whitespace-nowrap rounded-md bg-tooltip px-2 py-1 text-[12px] text-white shadow-md"
            style={{ left: tip.mid.x, top: tip.mid.y }}
          >
            <span className="text-white/60">{parent(tip.node)!.label} → </span>
            <span className="font-medium">{tip.node.label}</span>{" "}
            <span className="tabular-nums">{tip.node.n}</span>
            <span className="text-white/60">
              {" "}· {share(tip.node)} {"of" in tip.node && tip.node.of}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
