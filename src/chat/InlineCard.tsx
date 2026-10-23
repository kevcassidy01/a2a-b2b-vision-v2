import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { CardShell } from "./CardShell";
import type { CardApp, CardFooter } from "./types";

/**
 * How long the inline-card skeleton shows before the content reveals, in ms.
 * Deliberately quick. Bump this (or pass `skeletonMs` per card) to dwell longer.
 */
export const CARD_SKELETON_MS = 650;

/**
 * InlineCard — an MCP app rendered inline in the transcript (Figma 467-24635).
 *
 * The **host owns the frame**: Claude paints the surface, hairline border, and
 * all chrome text. A connected app only supplies its identity (logo monogram +
 * name) in the header and may tint the footer link/primary-action accent —
 * nothing else recolours, so every app reads as native to Claude.
 *
 * Three stacked parts:
 *   1. Header — 52px: logo badge + app name, plus the expand affordance when
 *                `onExpand` is passed (opens the app full-screen).
 *   2. Content — the app's slot; padding is uniform and height hugs content.
 *                Shows a skeleton for `skeletonMs`, then reveals content (a
 *                reserved placeholder for now — real widgets mount here later).
 *   3. Footer — 41px, OPTIONAL: left status text + a right "View in App →"
 *                link. Shown only once loaded, and only when passed.
 */
export function InlineCard({
  app,
  footer,
  onExpand,
  onExport,
  skeletonMs = CARD_SKELETON_MS,
  children,
}: {
  app: CardApp;
  footer?: CardFooter;
  onExpand?: () => void;
  onExport?: () => void;
  skeletonMs?: number;
  children?: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), skeletonMs);
    return () => clearTimeout(t);
  }, [skeletonMs]);

  return (
    <CardShell app={app} onExpand={onExpand} onExport={onExport}>
      {/* Content — skeleton while loading, then the app slot. 24px padding. */}
      <div className="p-6">
        {loading ? (
          <CardSkeleton />
        ) : (
          children ?? (
            <div className="grid min-h-[132px] place-items-center rounded-lg border border-dashed border-danger bg-slot-placeholder text-[13px] font-medium text-danger">
              App content
            </div>
          )
        )}
      </div>

      {/* Footer — optional, only after load. */}
      {!loading && footer && (footer.meta || footer.link) && (
        <div className="flex h-[41px] items-center justify-between border-t border-border px-4">
          <span className="text-xs text-text-subtle">{footer.meta}</span>
          {footer.link && (
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-app-link"
            >
              {footer.link}
              <ArrowRight className="size-4" strokeWidth={2} />
            </button>
          )}
        </div>
      )}
    </CardShell>
  );
}

/**
 * CardSkeleton — the loading state (Figma "Loading"): rows of an avatar circle
 * and three pill bars, gently pulsing in the neutral wash.
 */
export function CardSkeleton() {
  return (
    <div className="space-y-3.5" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="size-8 shrink-0 animate-pulse rounded-full bg-elevated" />
          <div className="h-8 flex-1 animate-pulse rounded-lg bg-elevated" />
          <div className="h-8 flex-1 animate-pulse rounded-lg bg-elevated" />
          <div className="h-8 flex-1 animate-pulse rounded-lg bg-elevated" />
        </div>
      ))}
    </div>
  );
}
