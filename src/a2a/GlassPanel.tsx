import type { ReactNode } from "react";

type Props = { radius: number; className?: string; children: ReactNode };

/**
 * GlassPanel — a window of frosted glass, kept flat. Two layers under the content:
 *   1. the glass: the backdrop blurred, lightly tinted, carrying the shadow;
 *   2. the body: the dark tint, fading out toward the bottom (most at the
 *      bottom-left), like the iPhone's body; the content above never fades.
 * No highlight rim: the dark outline in the glass's shadow is the only edge.
 *
 * (An SVG displacement filter bends the backdrop for real, but Chrome draws it
 * in patches on a panel this size and Safari not at all.)
 */
export function GlassPanel({ radius, className = "", children }: Props) {
  const round = { borderRadius: radius };
  return (
    <div className={`relative ${className}`} style={round}>
      <div className="a2a-glass absolute inset-0" style={round} />
      <div className="a2a-glass-body absolute inset-0" style={round} />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
