import { useRef, useState } from "react";
import { copy } from "../../copy/copy";
import autumn from "../../assets/a2a/products/hero-autumn-cans.jpg";
import credit from "../../assets/a2a/products/hero-credit-card.jpg";
import lime from "../../assets/a2a/products/hero-lime-pouches.jpg";
import { CanGroup, DrumGroup, type Tone } from "./Can";

const t = copy.a2a.storefront.hero;

/** Each slide's look: its colour and Somnath's photo, shot on that colour
 *  (`photo`, under the title), or filling the slide behind the words
 *  (`backdrop`); or drawn cans or drums. Visuals, not copy. */
const LOOKS: {
  bg: string;
  ink: "light" | "dark";
  tones: [Tone, Tone, Tone];
  drums?: boolean;
  photo?: string;
  backdrop?: string;
  logsIn?: boolean;
}[] = [
  { bg: "#bed487", ink: "dark", tones: ["lime", "zero", "lime"], photo: lime },
  { bg: "#1f2022", ink: "light", tones: ["bubbl", "fizz", "zing"], backdrop: credit },
  { bg: "#e80c2d", ink: "light", tones: ["lime", "zero", "lime"], photo: autumn, logsIn: true },
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
              className="relative flex h-[480px] w-[calc(100%-32px)] shrink-0 snap-start flex-col overflow-hidden rounded-[32px] p-6"
              style={{ background: look.bg }}
            >
              {look.backdrop && (
                <img src={look.backdrop} alt="" className="absolute inset-0 size-full object-cover object-bottom" />
              )}
              <p className={`relative text-[13px] font-semibold uppercase tracking-[0.06em] ${light ? "text-white/75" : "text-text-muted"}`}>
                {s.eyebrow}
              </p>
              <h2 className={`sf-display relative mt-2 text-[36px] leading-[1.04] ${light ? "text-white" : "text-text"}`}>
                {s.title}
              </h2>
              {look.backdrop ? null : look.photo ? (
                <img src={look.photo} alt="" className="mt-3 min-h-0 w-full flex-1 object-contain" />
              ) : (
                <div className="sf-hero-glow mt-auto grid place-items-center pb-2">
                  {look.drums ? <DrumGroup tones={look.tones} size={150} /> : <CanGroup tones={look.tones} size={150} />}
                </div>
              )}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (look.logsIn) onLogIn();
                }}
                className={`sf-pill relative self-start ${look.backdrop ? "mt-auto" : "mt-5"} ${light ? "sf-pill-light" : "sf-pill-dark"}`}
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
