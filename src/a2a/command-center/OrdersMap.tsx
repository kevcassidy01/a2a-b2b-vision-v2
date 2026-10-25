import { geoNaturalEarth1, geoPath } from "d3-geo";
import { Maximize2, Minus, Plus, RotateCcw, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-110m.json";
import { copy } from "../../copy/copy";
import { Tooltip } from "../Tooltip";

const t = copy.a2a.commandCenter.ordersByCountry;
export type Country = { name: string; code: string; orders: number; at: readonly number[]; label: boolean };

/** The map's own units (it scales to the card's width). */
const W = 800;
const H = 390;
const MAX_ZOOM = 8;

// The countries, without Antarctica, projected once.
const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
const land = feature(topo, topo.objects.countries);
land.features = land.features.filter((f) => f.id !== "010");
const projection = geoNaturalEarth1().fitExtent(
  [
    [4, 4],
    [W - 4, H - 4],
  ],
  land,
);
const shapes = land.features.map((f) => geoPath(projection)(f) ?? "");

/** Bubbles by area, smallest drawn last so they sit on top. */
function toBubbles(countries: readonly Country[]) {
  const most = Math.max(...countries.map((c) => c.orders));
  return countries
    .map((c) => {
      const [x, y] = projection(c.at as [number, number]) ?? [0, 0];
      return { ...c, x, y, r: 4 + 22 * Math.sqrt(c.orders / most) };
    })
    .sort((a, b) => b.r - a.r);
}

type View = { k: number; x: number; y: number };
const HOME: View = { k: 1, x: 0, y: 0 };

/** Zoom by `f` about a point in map units, keeping the map filling the frame. */
function zoomAt(v: View, f: number, px: number, py: number, oy: number): View {
  const k = Math.min(MAX_ZOOM, Math.max(1, v.k * f));
  const s = k / v.k;
  return clamp({ k, x: px - (px - v.x) * s, y: py - (py - v.y) * s }, oy);
}
/** Keeps the map across the frame's width. The frame runs `oy` above and below
 *  the map; while the map is shorter than the frame it stays centred, and once
 *  taller its edges can't come inside the frame's. */
function clamp(v: View, oy: number): View {
  const h = H * v.k;
  const y =
    h <= H + 2 * oy
      ? (H - h) / 2
      : Math.min(-oy, Math.max(H + oy - h, v.y));
  return { k: v.k, x: Math.min(0, Math.max(W - W * v.k, v.x)), y };
}

/**
 * OrdersMap — a world map with a bubble per bill-to country, sized by its
 * orders. Scroll or double-click to zoom, drag to pan (the hand shows
 * anywhere in the box), or use the buttons; bubbles and labels keep their size
 * as the land zooms. It sits in its own light box, which grows to fill the
 * space it's given (never shorter than the map); the drawing grows with it, so
 * zoomed land fills the whole box. Icon buttons sit in the top-right corner. Hovering a bubble or
 * its row in the list dims the other bubbles. Full screen is display only.
 */
export function OrdersMap({
  countries,
  fresh,
  hovered,
  onHover,
}: {
  /** A country that's just had an order: a ring spreads from its bubble. */
  fresh?: string;
  /** The countries and their orders (Germany gains one once O-5531 is in; its bubble grows). */
  countries: readonly Country[];
  hovered: string | null;
  onHover: (name: string | null) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [view, setView] = useState(HOME);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const bubbles = useMemo(() => toBubbles(countries), [countries]);
  const [dragging, setDragging] = useState(false);
  // The drawing's size: map units per screen pixel (so bubbles and labels keep
  // their size on screen), and how far the frame runs above and below the map.
  const [frame, setFrame] = useState({ unit: 1, oy: 0 });
  const oy = useRef(0);
  useEffect(() => {
    const el = svg.current!;
    const ro = new ResizeObserver(() => {
      const unit = W / (el.clientWidth || W);
      const f = { unit, oy: Math.max(0, (el.clientHeight * unit - H) / 2) };
      oy.current = f.oy;
      setFrame(f);
      setView((v) => clamp(v, f.oy));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { unit } = frame;

  /** A pointer's position in map units. */
  const toMap = (cx: number, cy: number) => {
    const r = svg.current!.getBoundingClientRect();
    return [(cx - r.left) * frame.unit, (cy - r.top) * frame.unit - frame.oy] as const;
  };
  const toMapRef = useRef(toMap);
  toMapRef.current = toMap;

  // Wheel zoom needs a non-passive listener to stop the page scrolling.
  useEffect(() => {
    const el = box.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const [px, py] = toMapRef.current(e.clientX, e.clientY);
      setView((v) => zoomAt(v, Math.exp(-e.deltaY * 0.002), px, py, oy.current));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /** The buttons in the corner are not part of the map. */
  const onButton = (e: { target: EventTarget }) => (e.target as Element).closest("button") !== null;

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || onButton(e)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, ...pointAt(e) };
    setDragging(true);
  };
  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const p = pointAt(e);
    setView((v) => clamp({ k: v.k, x: v.x + p.x - d.x, y: v.y + p.y - d.y }, oy.current));
    drag.current = { id: d.id, ...p };
  };
  const pointAt = (e: PointerEvent) => {
    const [x, y] = toMap(e.clientX, e.clientY);
    return { x, y };
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  const centre = (f: number) => setView((v) => zoomAt(v, f, W / 2, H / 2, oy.current));
  const home = view.k === 1;

  return (
    <div
      ref={box}
      className={`relative flex-1 touch-none select-none overflow-hidden rounded-md border border-border bg-[#fafafb] p-3 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={(e) => {
        if (onButton(e)) return;
        const [px, py] = toMap(e.clientX, e.clientY);
        setView((v) => zoomAt(v, 2, px, py, frame.oy));
      }}
    >
      {/* Holds the box at least the map's height; the drawing fills the box. */}
      <div aria-hidden style={{ aspectRatio: `${W} / ${H}` }} />
      <svg
        ref={svg}
        viewBox={`0 ${-frame.oy} ${W} ${H + 2 * frame.oy}`}
        className="absolute inset-3 size-[calc(100%-24px)]"
        role="img"
        aria-label={t.title}
      >
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          {shapes.map((d, i) => (
            <path key={i} d={d} className="a2a-map-land" vectorEffect="non-scaling-stroke" />
          ))}
        </g>
        {bubbles.map((b) => {
          const x = view.x + b.x * view.k;
          const y = view.y + b.y * view.k;
          const dim = hovered !== null && hovered !== b.name;
          return (
            <g
              key={b.code}
              className="a2a-map-bubble"
              data-dim={dim || undefined}
              onPointerEnter={() => onHover(b.name)}
              onPointerLeave={() => onHover(null)}
            >
              <circle cx={x} cy={y} r={b.r * unit} strokeWidth={1.5 * unit}>
                <title>{`${b.name}: ${b.orders}`}</title>
              </circle>
              {b.code === fresh && <circle className="a2a-map-ping" cx={x} cy={y} r={b.r * unit} strokeWidth={1.5 * unit} />}
              {(b.label || view.k >= 2.5 || hovered === b.name) && (
                <text
                  // A big bubble's label sits to its left, clear of its neighbours.
                  {...(b.r > 16
                    ? { x: x - (b.r + 6) * unit, y: y + 4 * unit, textAnchor: "end" }
                    : { x, y: y - (b.r + 5) * unit, textAnchor: "middle" })}
                  fontSize={11.5 * unit}
                  strokeWidth={3 * unit}
                >
                  {b.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="absolute right-3 top-3 flex gap-1.5">
        <MapButton icon={Plus} label={t.zoomIn} onClick={() => centre(1.6)} disabled={view.k >= MAX_ZOOM} />
        <MapButton icon={Minus} label={t.zoomOut} onClick={() => centre(1 / 1.6)} disabled={home} />
        <MapButton icon={RotateCcw} label={t.reset} onClick={() => setView(HOME)} disabled={home} />
        <MapButton icon={Maximize2} label={t.fullScreen} />
      </div>
    </div>
  );
}

/** A shaped 28px icon button with its name in a tooltip. */
function MapButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip label={label}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className="a2a-control grid size-7 place-items-center rounded-md text-text disabled:cursor-default disabled:text-text-muted/40"
      >
        <Icon className="size-4" strokeWidth={2} />
      </button>
    </Tooltip>
  );
}
