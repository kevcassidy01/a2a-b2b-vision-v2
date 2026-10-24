import { useRef, useState } from "react";
import { copy } from "../../copy/copy";
import { CanGroup, type Tone } from "./Can";

const t = copy.a2a.storefront.hero;

/** Each slide's backdrop and cans. Visuals, not copy. */
const LOOKS: { bg: string; ink: "light" | "dark"; tones: [Tone, Tone, Tone]; logsIn?: boolean }[] = [
  { bg: "#e8112d", ink: "light", tones: ["zero", "fizz", "zero"], logsIn: true },
  { bg: "#dff1cf", ink: "dark", tones: ["lime", "zero", "lime"] },
  { bg: "#1d1d1f", ink: "light", tones: ["bubbl", "fizz", "zing"] },
];

/**
 * The hero carousel, after Coca-Cola's: big rounded slides that snap, the next
 * one peeking in at the edge, and dots under them (the current one a pill).
 */
export function Hero({ onLogIn }: { onLogIn: () => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const step = () => {
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    return first ? first.offsetWidth + 12 : 1;
  };
  const onScroll = () => {
    const el = track.current;
    if (el) setIndex(Math.round(el.scrollLeft / step()));
  };
  const goTo = (i: number) =>
    track.current?.scrollTo({ left: i * step(), behavior: "smooth" });

  return (
    <section aria-label={t.label} className="pt-4">
      <div
        ref={track}
        onScroll={onScroll}
        className="sf-no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4"
      >
        {t.slides.map((s, i) => {
          const look = LOOKS[i];
          const light = look.ink === "light";
          return (
            <article
              key={s.title}
              className="relative flex h-[420px] w-[calc(100%-32px)] shrink-0 snap-start flex-col overflow-hidden rounded-[32px] p-6"
              style={{ background: look.bg }}
            >
              <p className={`text-[13px] font-semibold uppercase tracking-[0.06em] ${light ? "text-white/75" : "text-text-muted"}`}>
                {s.eyebrow}
              </p>
              <h2 className={`mt-2 text-[30px] font-bold leading-[1.1] tracking-[-0.025em] ${light ? "text-white" : "text-text"}`}>
                {s.title}
              </h2>
              <div className="sf-hero-glow mt-auto grid place-items-center pb-2">
                <CanGroup tones={look.tones} size={150} />
              </div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (look.logsIn) onLogIn();
                }}
                className={`sf-pill mt-5 self-start ${light ? "sf-pill-light" : "sf-pill-dark"}`}
              >
                {s.cta}
              </a>
            </article>
          );
        })}
      </div>
      <div className="mt-4 flex justify-center gap-1.5">
        {t.slides.map((s, i) => (
          <button
            key={s.title}
            type="button"
            aria-label={`${t.slideOf} ${i + 1}`}
            aria-current={i === index}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-200 ${i === index ? "w-6 bg-text" : "w-2 bg-black/20"}`}
          />
        ))}
      </div>
    </section>
  );
}
