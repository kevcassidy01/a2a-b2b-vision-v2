import { useState } from "react";
import { CodeXml, House } from "lucide-react";
import { copy } from "../../copy/copy";

const SEGMENTS = [
  { id: "home" as const, icon: House },
  { id: "code" as const, icon: CodeXml },
];
type Segment = (typeof SEGMENTS)[number]["id"];

/**
 * HomeCodeToggle — the desktop app's full-width Home | Code segmented control
 * under the sidebar's top icons (Somnath's screenshot of the live app).
 *
 * Same track, thumb and motion as the browser's ChatCodeToggle, but labelled
 * segments that split the sidebar's width. 28px tall; the track takes the nav rows'
 * radius (md, 8px) and the thumb nests inside it (sm, 6px). Interactive thumb;
 * a no-op otherwise.
 */
export function HomeCodeToggle() {
  const [selected, setSelected] = useState<Segment>("home");
  const t = copy.desktop.cowork.sidebar;
  const activeIndex = SEGMENTS.findIndex((s) => s.id === selected);

  return (
    <div role="tablist" aria-label={t.homeOrCode} className="relative grid grid-cols-2 gap-0.5 rounded-md bg-track p-0.5">
      {/* Sliding thumb: one pill that translates between the two halves. */}
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 w-[calc(50%-3px)] rounded-sm bg-track-thumb shadow-sm transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)]"
        style={{ transform: `translateX(calc(${activeIndex} * (100% + 2px)))` }}
      />
      {SEGMENTS.map(({ id, icon: Icon }) => {
        const active = selected === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setSelected(id)}
            className={`relative z-10 flex h-6 items-center justify-center gap-1.5 rounded-sm text-ui transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
              active ? "text-text" : "text-text-muted hover:text-text"
            }`}
          >
            <Icon className="size-3.5" strokeWidth={2} />
            {t[id]}
          </button>
        );
      })}
    </div>
  );
}
