import { copy } from "../copy/copy";
import { ICON_COLUMN_WIDTH } from "./CoworkWindow";

/**
 * DesktopIcons — the files on Aaron's desktop (COWORK_INTENT §3.4, §4.6 step 1).
 *
 * One column from the top right, on a ~100×110 grid. Like Finder with icon
 * previews on, each file shows a thumbnail of its contents (a text page, the
 * floor-plan PDF's first page, the photo). Labels are white with a soft shadow,
 * two lines max, long names cut in the middle.
 *
 * Click selects (translucent backing + blue label pill). When the Cowork window
 * has focus instead, the selection stays but turns grey, as Finder does.
 * Dragging shows the browser's translucent ghost; dropping one on Cowork's
 * start state attaches it to the next prompt (CoworkHome).
 */
export type DesktopFile = (typeof copy.desktop.files)[number];

export function DesktopIcons({
  selected,
  desktopFocused,
  onSelect,
}: {
  selected: string | null;
  desktopFocused: boolean;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="absolute right-2.5 top-[44px] flex flex-col gap-1.5" style={{ width: ICON_COLUMN_WIDTH - 20 }}>
      {copy.desktop.files.map((f) => (
        <DesktopIcon
          key={f.name}
          file={f}
          selected={selected === f.name}
          desktopFocused={desktopFocused}
          onSelect={() => onSelect(f.name)}
        />
      ))}
    </div>
  );
}

function DesktopIcon({
  file,
  selected,
  desktopFocused,
  onSelect,
}: {
  file: DesktopFile;
  selected: boolean;
  desktopFocused: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      draggable
      onPointerDown={onSelect}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", file.name);
        e.dataTransfer.effectAllowed = "copy";
      }}
      className="flex h-[110px] w-full cursor-default select-none flex-col items-center outline-none [font-family:-apple-system,BlinkMacSystemFont,'SF_Pro_Text',Inter,system-ui,sans-serif]"
    >
      <span className={`grid size-[72px] place-items-center rounded-[6px] ${selected ? "bg-black/25" : ""}`}>
        <Thumbnail kind={file.kind} />
      </span>
      <span
        className={`mt-1 line-clamp-2 max-w-full rounded-[4px] px-1 text-center text-[12px] font-medium leading-[15px] break-words text-white ${
          selected ? (desktopFocused ? "bg-[#0A64D8]" : "bg-white/25") : "[text-shadow:0_1px_3px_rgba(0,0,0,0.6)]"
        }`}
      >
        {truncateMiddle(file.name)}
      </span>
    </button>
  );
}

/** Finder cuts long names in the middle and keeps the extension ("CanaryWharf_…L1-L3.pdf"). */
function truncateMiddle(name: string, max = 26) {
  if (name.length <= max) return name;
  const head = Math.ceil((max - 1) / 2);
  return `${name.slice(0, head)}…${name.slice(name.length - (max - 1 - head))}`;
}

function Thumbnail({ kind }: { kind: DesktopFile["kind"] }) {
  if (kind === "photo") return <PhotoThumb />;
  return (
    // A document page: white, a hairline, a soft drop shadow (Finder's preview look).
    <span className="relative block h-[60px] w-[46px] overflow-hidden rounded-[2px] bg-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.35)]">
      {kind === "text" ? <TextPage /> : <FloorPlanPage />}
      <span className="absolute inset-x-0 bottom-0 bg-black/[0.06] py-px text-center text-[6px] font-bold tracking-wide text-black/45">
        {kind === "text" ? "TXT" : "PDF"}
      </span>
    </span>
  );
}

/** The notes file's first lines, too small to read, as Finder renders text previews. */
function TextPage() {
  return (
    <span className="block p-[4px] text-left text-[3.2px] leading-[4.2px] text-black/70">
      {copy.desktop.notesPreview.map((line, i) => (
        <span key={i} className={`block truncate ${i === 0 ? "font-bold" : ""}`}>
          {line}
        </span>
      ))}
    </span>
  );
}

/** First page of the floor-plan PDF: a title strip and three floor outlines with rooms. */
function FloorPlanPage() {
  return (
    <svg viewBox="0 0 46 60" className="block size-full" aria-hidden>
      <rect x="4" y="4" width="22" height="2" rx="0.5" fill="#1f2937" opacity="0.7" />
      <rect x="4" y="7.5" width="14" height="1.2" rx="0.5" fill="#9ca3af" />
      {[12, 27, 42].map((y) => (
        <g key={y} fill="none" stroke="#3b6ea5" strokeWidth="0.6">
          <rect x="5" y={y} width="36" height="12" />
          <path d={`M17 ${y}v7M29 ${y}v12M5 ${y + 7}h12M29 ${y + 5}h12`} />
        </g>
      ))}
    </svg>
  );
}

/** Comms-room photo stand-in: waiting on Somnath's photo (COWORK_INTENT §8.3). */
function PhotoThumb() {
  return (
    <span className="relative block h-[48px] w-[64px] overflow-hidden rounded-[3px] bg-gradient-to-b from-[#3a3f47] to-[#1d2026] shadow-[0_0_0_0.5px_rgba(255,255,255,0.15),0_1px_3px_rgba(0,0,0,0.45)]">
      {/* A rack with a few lit switches. */}
      <span className="absolute inset-y-[5px] left-[18px] w-[28px] rounded-[1px] bg-[#111317]">
        {[4, 11, 18, 25, 32].map((t) => (
          <span key={t} className="absolute inset-x-[2px] h-[4px] rounded-[0.5px] bg-[#2b2f36]" style={{ top: t }}>
            <span className="absolute right-[2px] top-[1.5px] size-[1px] rounded-full bg-[#34d399]" />
            <span className="absolute right-[5px] top-[1.5px] size-[1px] rounded-full bg-[#fbbf24]" />
          </span>
        ))}
      </span>
    </span>
  );
}
