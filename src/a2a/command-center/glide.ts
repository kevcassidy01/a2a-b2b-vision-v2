import { useLayoutEffect, useRef, type RefObject } from "react";

/** How long a box takes to glide to its new height, in ms, and on what curve. */
export const GLIDE = { duration: 500, easing: "cubic-bezier(0.2, 0, 0, 1)" };

/**
 * When `dep` changes, the box glides from the height it had to the height it
 * has now, rather than jumping, so whatever's below it moves smoothly too.
 * While it glides it clips what's spilling out (old content fading away).
 */
export function useGlide(ref: RefObject<HTMLElement | null>, dep: unknown) {
  const last = useRef<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const to = el.offsetHeight;
    const from = last.current;
    last.current = to;
    if (from === null || from === to || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.style.overflow = "clip";
    el.style.setProperty("overflow-clip-margin", "2px");
    const anim = el.animate([{ height: `${from}px` }, { height: `${to}px` }], GLIDE);
    anim.onfinish = anim.oncancel = () => {
      el.style.overflow = "";
      el.style.removeProperty("overflow-clip-margin");
    };
    return () => anim.cancel();
  }, [ref, dep]);
}
