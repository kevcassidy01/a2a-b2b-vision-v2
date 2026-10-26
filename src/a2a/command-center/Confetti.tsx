import { useEffect, useMemo, useState } from "react";
import { demoTimeout } from "../demoClock";

/** How many bursts, and how far apart they start, in ms. */
const BURSTS = 3;
const GAP = 1400;
/** How long the confetti's on screen, in ms: the last burst's slowest piece's delay and fall. */
const FOR = 4600 + (BURSTS - 1) * GAP;
const COLORS = ["#0176d3", "#2e844a", "#f2b33d", "#e5484d", "#7f5af0", "#7cc4fa", "#9bd8a9"];
/** Pieces in each burst. */
const PIECES = 90;

/** A steady pseudo-random sequence, so the pieces don't reshuffle on a re-render. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

/**
 * Confetti — a burst over the Command Center, falling from the top, once the
 * Oktoberfest campaign converts (O-5531 placed). Three bursts, a beat apart, each
 * its own scatter; then it unmounts.
 * It doesn't catch clicks, pauses with the demo, and is off with reduced motion.
 */
export function Confetti({ on }: { on: boolean }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!on) return;
    setShown(true);
    return demoTimeout(() => setShown(false), FOR);
  }, [on]);
  const pieces = useMemo(() => {
    const r = seeded(5531);
    return Array.from({ length: PIECES * BURSTS }, (_, i) => ({
      left: r() * 100,
      delay: Math.floor(i / PIECES) * GAP + r() * 900,
      fall: 2600 + r() * 1100,
      drift: (r() - 0.5) * 160,
      spin: 360 + r() * 720,
      w: 6 + r() * 5,
      h: r() > 0.5 ? 10 + r() * 6 : 6 + r() * 3,
      round: r() > 0.8,
      color: COLORS[i % COLORS.length],
    }));
  }, []);
  if (!shown) return null;
  return (
    <div aria-hidden className="a2a-confetti pointer-events-none absolute inset-0 z-[40] overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="a2a-confetti-piece absolute top-0"
          style={
            {
              left: `${p.left}%`,
              width: p.w,
              height: p.h,
              background: p.color,
              borderRadius: p.round ? "50%" : 2,
              animationDuration: `${p.fall}ms`,
              animationDelay: `${p.delay}ms`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
