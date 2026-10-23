import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { AppLogo } from "./AppLogo";
import type { QuoteBlock } from "./types";

const secs = (t: string) => {
  const [m, s] = t.split(":").map(Number);
  return m * 60 + s;
};
const clock = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;

/**
 * QuoteCard — a moment from a call recording, under the message that cites
 * it: the app and the call, the speaker's words, then who said it. The
 * timestamp plays the clip: it ticks from `at` to `to` as a bar fills, then
 * rests back on `at`.
 */
export function QuoteCard({ block }: { block: QuoteBlock }) {
  const start = secs(block.at);
  const length = secs(block.to) - start;
  const [played, setPlayed] = useState<number | null>(null);

  useEffect(() => {
    if (played === null) return;
    if (played >= length) {
      const done = window.setTimeout(() => setPlayed(null), 600);
      return () => window.clearTimeout(done);
    }
    const tick = window.setTimeout(() => setPlayed(played + 1), 1000);
    return () => window.clearTimeout(tick);
  }, [played, length]);

  const playing = played !== null;
  return (
    <div className="animate-fade-in overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2.5 px-4 pt-3">
        <AppLogo app={block.app} className="size-5" />
        <span className="min-w-0 truncate text-[13px] text-text-subtle">{block.source}</span>
        <button
          type="button"
          aria-label={playing ? "Pause" : `Play from ${block.at}`}
          onClick={() => setPlayed(playing ? null : 0)}
          className="ml-auto flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 text-[13px] font-medium tabular-nums text-app-link transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated"
        >
          {playing ? <Pause className="size-3.5" strokeWidth={2.25} /> : <Play className="size-3.5" strokeWidth={2.25} />}
          {clock(start + (played ?? 0))}
        </button>
      </div>
      <blockquote className="mx-4 mt-3 border-l-2 border-border pl-3 text-[15px] leading-[22px] text-text">
        “{block.text}”
      </blockquote>
      <p className="px-4 pb-3 pl-[30px] pt-2 text-[13px] text-text-subtle">
        {block.speaker} · {block.role}
      </p>
      <div className="h-[3px] bg-elevated">
        <div
          className="h-full bg-app-link transition-[width] duration-1000 ease-linear"
          style={{ width: `${playing ? (played / length) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}
