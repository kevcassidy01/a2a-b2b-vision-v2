import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { CardHeader } from "./CardShell";
import { useBusy, useChat } from "./store";
import type { CardApp, ProductTile } from "./types";

/** Tile geometry from Figma (467-31023): 220×355 tiles, 12px gap. Tiles grow
 *  (keeping that shape) to fill the chat column when they fit; past that they
 *  stay 220 wide and scroll. */
const TILE_W = 220;
const GAP = 12;

/**
 * InlineCarousel — an MCP app shown as a horizontal, scrollable row of tiles
 * (Figma 467-31023). Unlike the inline card, the carousel is **frameless**: the
 * header and tile row float directly on the chat column (no surface, border, or
 * divider). The header carries no expand affordance: a carousel is a browse-row,
 * so it has effectively no full-screen use case.
 *
 * Tiles are either real product tiles (`tiles` — image, name, price, a pick
 * button that posts the tile's `prompt`) or, when none are given, `count`
 * dashed placeholder slots. Navigation arrows are driven by
 * scroll position: only forward at the start, both once scrolled, only back at
 * the end, and none at all when everything already fits.
 */
export function InlineCarousel({
  app,
  count = 4,
  tiles,
}: {
  app: CardApp;
  count?: number;
  tiles?: ProductTile[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollable(el.scrollWidth > el.clientWidth + 1);
    setAtStart(el.scrollLeft <= 0);
    setAtEnd(Math.ceil(el.scrollLeft) >= el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    update();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update, count, tiles]);

  const page = (dir: 1 | -1) =>
    scrollRef.current?.scrollBy({ left: dir * (TILE_W + GAP), behavior: "smooth" });

  const showLeft = scrollable && !atStart;
  const showRight = scrollable && !atEnd;

  return (
    <div>
      <CardHeader app={app} />

      {/* Gap below the header before the tiles (Figma 467-31023). */}
      <div className="relative mt-4">
        <div
          ref={scrollRef}
          className="flex items-start gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tiles
            ? tiles.map((t) => <ProductTileView key={t.name} tile={t} />)
            : Array.from({ length: count }).map((_, i) => (
                <div
                  key={i}
                  className="grid aspect-[220/355] min-w-[220px] flex-[1_0_0%] place-items-center rounded-lg border border-dashed border-danger bg-slot-placeholder text-[13px] font-medium text-danger"
                >
                  App content
                </div>
              ))}
        </div>

        {/* Back — appears once scrolled off the start. */}
        {showLeft && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-bg to-transparent" />
            <button
              type="button"
              aria-label="Previous"
              onClick={() => page(-1)}
              className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface text-text shadow-sm hover:bg-elevated"
            >
              <ChevronLeft className="size-5" strokeWidth={2} />
            </button>
          </>
        )}

        {/* Forward — appears whenever more tiles remain to the right. */}
        {showRight && (
          <>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-bg to-transparent" />
            <button
              type="button"
              aria-label="Next"
              onClick={() => page(1)}
              className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface text-text shadow-sm hover:bg-elevated"
            >
              <ChevronRight className="size-5" strokeWidth={2} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * ProductTileView — one 220×355 product tile (scaled up to fill the row): a square image region (the real
 * product shot, or a tinted placeholder with an image glyph until shots land),
 * then name, detail, price (list struck through when discounted), and a pick
 * button pinned to the bottom. The button posts the tile's `prompt` as a user
 * message, so the pick reads as the rep's ask (same as the `select` menu).
 */
function ProductTileView({ tile }: { tile: ProductTile }) {
  const send = useChat((s) => s.send);
  const busy = useBusy();
  return (
    <div className="flex aspect-[220/355] min-w-[220px] flex-[1_0_0%] flex-col overflow-hidden rounded-lg border border-border bg-surface">
      {tile.image ? (
        <img src={tile.image} alt={tile.name} style={{ background: tile.tint }} className="aspect-[220/188] w-full object-cover" />
      ) : (
        <div
          aria-hidden
          style={{ background: tile.tint }}
          className="grid aspect-[220/188] w-full place-items-center bg-elevated text-text-subtle"
        >
          <ImageIcon className="size-8" strokeWidth={1.5} />
        </div>
      )}
      <div className="flex flex-1 flex-col p-3">
        <div className="line-clamp-2 text-[14px] font-semibold leading-snug text-text">{tile.name}</div>
        {tile.detail && <div className="mt-1 truncate text-[12px] text-text-muted">{tile.detail}</div>}
        {tile.price && (
          <div className="mt-1.5 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-[18px] font-semibold text-text">{tile.price}</span>
            {tile.listPrice && <span className="text-[13px] text-text-subtle line-through">{tile.listPrice}</span>}
          </div>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => send(tile.prompt)}
          className="mt-auto inline-flex h-8 items-center justify-center rounded-full border border-app-link/50 text-[13px] font-medium text-app-link transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-info-soft disabled:opacity-50"
        >
          {tile.actionLabel ?? "Choose"}
        </button>
      </div>
    </div>
  );
}
