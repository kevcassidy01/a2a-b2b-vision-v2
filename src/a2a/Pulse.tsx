import type { CSSProperties } from "react";

/**
 * An agent at work, after CRED's neoPOP loader (light mode): four sharp bars,
 * each a ball that rises as a dark square, stretches thin as it drops, lands
 * squashed in its colour and flattens, a frame behind the one before it, so a
 * pulse runs left to right. 36 by 16 at `scale` 1, as in the kit.
 */
const BARS = [
  { x: 5, color: "#ffcb45" },
  { x: 13.7, color: "#e5fe40" },
  { x: 22.3, color: "#6a35ff" },
  { x: 31, color: "#ff426f" },
];

export function Pulse({ scale = 1, className = "" }: { scale?: number; className?: string }) {
  return (
    <span aria-hidden className={`a2a-bars ${className}`} style={{ "--u": `${scale}px` } as CSSProperties}>
      {BARS.map((b, i) => (
        <span key={b.color} className="a2a-pulse-bar" style={{ "--x": b.x, "--c": b.color, "--p": i } as CSSProperties} />
      ))}
    </span>
  );
}
