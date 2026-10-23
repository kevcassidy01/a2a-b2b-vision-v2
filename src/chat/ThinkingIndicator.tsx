/**
 * ThinkingIndicator — the loading state between send and response.
 *
 * The Claude clay spark **is** the loader: it pulses — scaling down and back to
 * its original size on a loop — the way the real product's thinking state does
 * (replaces the old three-dot pulse). The store swaps `label` through the steps
 * beside it. Kept in the UI sans — it's chrome, not content. (The spark is the
 * `/favicon.webp` placeholder, same as the greeting; swap for the hand-made SVG
 * later.)
 */
export function ThinkingIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-text-muted">
      <img
        src="/favicon.webp"
        alt=""
        aria-hidden
        className="size-6 shrink-0 animate-thinking-pulse"
      />
      {label && <span className="text-ui">{label}…</span>}
    </div>
  );
}
