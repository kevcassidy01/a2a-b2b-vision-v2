import type { CSSProperties } from "react";
import { copy } from "../../copy/copy";

/** The drinks' colours, by brand. Visuals, not copy. */
export const TONES = {
  fizz: { can: "#e8112d", label: "#fff" },
  zero: { can: "#1d1d1f", label: "#e8112d" },
  lime: { can: "#7cc242", label: "#fff" },
  bubbl: { can: "#2f8fd8", label: "#fff" },
  zing: { can: "#f4c430", label: "#1d1d1f" },
  pulp: { can: "#f28c28", label: "#fff" },
  brew: { can: "#8a5a3b", label: "#fff" },
  cherry: { can: "#8e1430", label: "#fff" },
  vanilla: { can: "#e6d2a8", label: "#1d1d1f" },
  lemon: { can: "#f7d63e", label: "#1d1d1f" },
} as const;
export type Tone = keyof typeof TONES;

/**
 * A drawn drinks can (no photos yet): a coloured body with a metal sheen, rims
 * top and bottom, and the brand name running up the side. `size` is its height
 * in px; everything else follows from it.
 */
export function Can({
  tone,
  size = 96,
  className = "",
  style,
}: {
  tone: Tone;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const { can, label } = TONES[tone];
  return (
    <div
      aria-hidden
      className={`sf-can ${className}`}
      style={
        {
          "--can": can,
          width: size * 0.5,
          height: size,
          fontSize: size * 0.15,
          color: label,
          ...style,
        } as CSSProperties
      }
    >
      <span className="sf-can-label">{copy.a2a.storefront.canLabels[tone]}</span>
    </div>
  );
}

/** Three cans, the middle one forward: the default product shot. */
export function CanGroup({
  tones,
  size = 96,
}: {
  tones: readonly [Tone, Tone, Tone];
  size?: number;
}) {
  return (
    <div className="flex items-end" aria-hidden>
      <Can tone={tones[0]} size={size * 0.86} className="-mr-2 -rotate-6" />
      <Can tone={tones[1]} size={size} className="relative z-10" />
      <Can tone={tones[2]} size={size * 0.86} className="-ml-2 rotate-6" />
    </div>
  );
}

/**
 * A drawn concentrate drum, how a bottler gets its drinks from Fizz: a steel
 * drum in the brand's colour, two rolling hoops, a metal lid, and a white
 * label with the brand and "concentrate". `size` is its height in px.
 */
export function Drum({ tone, size = 120, className = "" }: { tone: Tone; size?: number; className?: string }) {
  const { can, label } = TONES[tone];
  // The brand in its colour on the white label, or in near-black if that's too pale to read.
  const ink = label === "#1d1d1f" ? label : can;
  return (
    <div
      aria-hidden
      className={`sf-drum ${className}`}
      style={{ "--can": can, width: size * 0.68, height: size, fontSize: size * 0.13 } as CSSProperties}
    >
      <span className="sf-drum-label" style={{ color: ink }}>
        <span className="sf-logo leading-none" style={{ color: ink }}>
          {copy.a2a.storefront.canLabels[tone]}
        </span>
        <span className="sf-drum-kind">{copy.a2a.storefront.concentrate}</span>
      </span>
    </div>
  );
}

/** Three drums, the middle one forward. */
export function DrumGroup({ tones, size = 120 }: { tones: readonly [Tone, Tone, Tone]; size?: number }) {
  return (
    <div className="flex items-end" aria-hidden>
      <Drum tone={tones[0]} size={size * 0.84} className="-mr-3" />
      <Drum tone={tones[1]} size={size} className="relative z-10" />
      <Drum tone={tones[2]} size={size * 0.84} className="-ml-3" />
    </div>
  );
}
