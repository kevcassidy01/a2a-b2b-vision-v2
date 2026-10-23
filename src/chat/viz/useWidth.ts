import { useLayoutEffect, useRef, useState } from "react";

/**
 * useWidth — the live pixel width of an element (ResizeObserver).
 *
 * Charts draw in real pixels rather than a scaled viewBox, so their text stays
 * at a true 14–16px however wide the card is (a scaled SVG would shrink its
 * labels below the legibility floor in a narrow column).
 */
export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}
