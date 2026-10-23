import { useEffect, useRef, useState } from "react";

const BARS = 18;
/** One bar plus its gap: how far the strip slides per sample. Matches wave-scroll's 5px. */
const PITCH = 5;
/** Matches wave-scroll's 110ms. */
const TICK_MS = 110;
const QUIET = 2;

/**
 * Waveform — dictation's level meter, as in the desktop app, drawn as a
 * recording: the strip streams right to left, a new sample entering on the
 * right every tick. Quiet samples are dots; while speaking they rise into bars.
 * Simulated: the levels are random, not read from a mic.
 *
 * Each tick shifts the samples one place and remounts the strip, which then
 * slides one pitch left over the tick (`animate-wave-scroll`), so it lands
 * exactly where the next tick's strip starts: seamless motion.
 */
export function Waveform({ speaking }: { speaking: boolean }) {
  // One extra sample, hidden off the right edge, slides in each tick.
  const [levels, setLevels] = useState(() => Array<number>(BARS + 1).fill(QUIET));
  const [tick, setTick] = useState(0);
  const speakingRef = useRef(speaking);
  speakingRef.current = speaking;

  useEffect(() => {
    const id = window.setInterval(() => {
      setLevels((l) => {
        const prev = l[l.length - 1];
        // Smoothed random level while speaking, so neighbouring bars relate.
        const level = speakingRef.current ? Math.min(16, Math.max(3, prev * 0.4 + (2 + Math.random() * 14) * 0.6)) : QUIET;
        return [...l.slice(1), level];
      });
      setTick((t) => t + 1);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      aria-hidden
      className="h-8 overflow-hidden px-2 [mask-image:linear-gradient(to_right,transparent,#000_16px,#000_calc(100%-8px),transparent)]"
      style={{ width: BARS * PITCH + 16 }}
    >
      <div key={tick} className="animate-wave-scroll flex h-full items-center gap-[3px]">
        {levels.map((h, i) => (
          <span key={i} className="w-0.5 shrink-0 rounded-full bg-text-muted" style={{ height: h }} />
        ))}
      </div>
    </div>
  );
}
