import type { CSSProperties } from "react";

/** A grey placeholder block with a soft shimmer, shaped by the caller. Shared by the phone and the Command Center. */
export function Bone({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <span aria-hidden className={`a2a-bone block ${className}`} style={style} />;
}
