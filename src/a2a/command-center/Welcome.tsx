import { ArrowRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import agentforce from "../../assets/desktop/menubar/agentforce.png";
import { copy } from "../../copy/copy";

const t = copy.a2a.commandCenter.welcome;

/** The apps floating around the edges: where each sits (% of the area), its size and tilt. Visuals, not copy. */
const TILES: { src: string; x: number; y: number; size: number; tilt: number }[] = [
  { src: "/salesforce.svg", x: 22, y: 22, size: 76, tilt: -8 },
  { src: "/connectors/slack.svg", x: 40, y: 14, size: 52, tilt: 6 },
  { src: "/connectors/gmail.svg", x: 8, y: 41, size: 52, tilt: 5 },
  { src: "/connectors/tableau.svg", x: 18, y: 67, size: 64, tilt: -5 },
  { src: "/connectors/google-drive.svg", x: 35, y: 82, size: 50, tilt: 9 },
  { src: agentforce, x: 77, y: 17, size: 62, tilt: 7 },
  { src: "/connectors/asana.svg", x: 94, y: 40, size: 48, tilt: -9 },
  { src: "/connectors/notion.svg", x: 86, y: 52, size: 58, tilt: 6 },
  { src: "/connectors/gong.png", x: 91, y: 85, size: 46, tilt: -4 },
  { src: "/connectors/google-calendar.svg", x: 64, y: 80, size: 54, tilt: -8 },
];

/** The signals' pills: where each sits and its dot's colour, in the order of `t.signals`. */
const PILLS: { x: number; y: number; dot: string; tilt: number }[] = [
  { x: 59, y: 23, dot: "#0176d3", tilt: -2 },
  { x: 11, y: 26, dot: "#2e844a", tilt: 3 },
  { x: 86, y: 28, dot: "#dd7a01", tilt: -3 },
  { x: 13, y: 54, dot: "#9050e9", tilt: -2 },
  { x: 81, y: 68, dot: "#0b827c", tilt: 3 },
  { x: 47, y: 91, dot: "#e3066a", tilt: 2 },
];

/**
 * Welcome — the Command Center before it loads: Alex has been away. The apps
 * it draws from float around the edges as tiles, with pills for what it
 * tracks (bursting out a few seconds in), and in the middle how many updates
 * are waiting, a headline and Load Command Center. Light,
 * after a dark welcome Somnath shared.
 */
export function Welcome({ onLoad }: { onLoad: () => void }) {
  return (
    <section aria-labelledby="a2a-welcome-title" className="a2a-welcome absolute inset-0 overflow-hidden bg-white">
      <div aria-hidden>
        {TILES.map((tile, i) => (
          <Burst key={tile.src} x={tile.x} y={tile.y}>
            <span
              className="a2a-float grid place-items-center rounded-[24%] bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_4px_rgb(0_0_0/0.04),0_12px_32px_-8px_rgb(0_0_0/0.14)]"
              style={{ width: tile.size, height: tile.size, rotate: `${tile.tilt}deg`, animationDelay: `${i * -0.7}s` }}
            >
              <img src={tile.src} alt="" className="size-[52%] object-contain" />
            </span>
          </Burst>
        ))}
        {t.signals.map((s, i) => {
          const p = PILLS[i];
          return (
            <Burst key={s} x={p.x} y={p.y}>
              <span
                className="a2a-float flex h-7 items-center gap-2 whitespace-nowrap rounded-lg bg-white px-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_6px_16px_-6px_rgb(0_0_0/0.12)]"
                style={{ rotate: `${p.tilt}deg`, animationDelay: `${i * -1.1 - 0.4}s` }}
              >
                <span className="size-1.5 rounded-full" style={{ background: p.dot }} />
                {s}
              </span>
            </Burst>
          );
        })}
      </div>

      <div className="relative flex h-full flex-col items-center justify-center px-8 text-center">
        <p className="flex h-7 items-center gap-2 rounded-lg bg-[#f3f3f5] px-2.5 text-[12.5px] font-medium text-text-muted">
          <span aria-hidden className="size-1.5 rounded-full bg-[#2e844a]" />
          {t.eyebrow}
        </p>
        <h1
          id="a2a-welcome-title"
          className="a2a-title mt-5 whitespace-nowrap text-[38px] font-normal leading-[1.08] tracking-[-0.02em] text-text"
        >
          {t.title[0]}
          <br />
          {t.title[1]}
        </h1>
        <p className="mt-4 max-w-[400px] text-pretty text-[15px] leading-[1.55] text-text-muted">{t.body}</p>
        <button
          type="button"
          onClick={onLoad}
          className="mt-8 flex h-11 items-center gap-2 rounded-[10px] bg-[#1d1d1f] px-5 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#333336] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0176d3]"
        >
          {t.cta}
          <ArrowRight className="size-4" strokeWidth={2.25} />
        </button>
      </div>
    </section>
  );
}

/** Places a tile or pill at (x, y)% of the area. A moment after the welcome
 *  opens, it bursts out to there from part-way toward the centre, fading in
 *  (not from one pile in the middle): `--dx`/`--dy` are where it starts. */
function Burst({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <span
      className="a2a-burst absolute"
      style={
        {
          left: `${x}%`,
          top: `${y}%`,
          translate: "-50% -50%",
          "--dx": `${(50 - x) * 0.4}cqw`,
          "--dy": `${(50 - y) * 0.4}cqh`,
        } as CSSProperties
      }
    >
      {children}
    </span>
  );
}
