import type { Photo } from "./photos";

/** A product photo on its tint, filling a box the caller sizes and rounds. */
export function ProductPhoto({ photo, className = "", pad = "8%" }: { photo: Photo; className?: string; pad?: string }) {
  return (
    <span aria-hidden className={`block overflow-hidden ${className}`} style={{ background: photo.tint, padding: pad }}>
      <img src={photo.src} alt="" className="size-full object-contain mix-blend-multiply" />
    </span>
  );
}
