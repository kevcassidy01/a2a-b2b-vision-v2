import { X } from "lucide-react";
import { copy } from "../../../copy/copy";

/**
 * FileChips — files sent with a message (or waiting in the prompt box), per
 * Somnath's sketch: a white chip each, with the file's page on the left
 * (tilted, a second page behind it; white on a soft blurred shadow) and about
 * the same padding all round it, then the name (up to 2 lines) over its kind
 * and size, centred against the pages. In the prompt box an ✕ removes one.
 */
export function FileChips({
  names,
  onRemove,
  align = "end",
}: {
  names: string[];
  onRemove?: (name: string) => void;
  align?: "start" | "end";
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${align === "end" ? "justify-end" : "justify-start"}`}>
      {names.map((name) => (
        <span
          key={name}
          className="animate-fade-in group relative flex h-[64px] w-[228px] items-center gap-3 rounded-xl border border-border bg-white p-[10px] pr-4"
        >
          {/* The pages, in a 44px square: the blank one behind, tilted right. */}
          <span aria-hidden className="pointer-events-none relative size-11 shrink-0">
            <span className="absolute left-[13px] top-[3px] rotate-[12deg]">
              <Sheet />
            </span>
            <span className="absolute left-[3px] top-[4px] -rotate-[8deg]">
              <Page name={name} />
            </span>
          </span>
          <span className="min-w-0">
            <span className="line-clamp-2 break-words text-[13px] leading-[17px] text-text">{name}</span>
            <span className="block truncate text-[12px] leading-4 text-text-subtle">{copy.desktop.fileInfo[name] ?? ""}</span>
          </span>
          {onRemove && (
            <button
              type="button"
              aria-label={`${copy.desktop.cowork.home.removeFile} ${name}`}
              onClick={() => onRemove(name)}
              className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full border border-border bg-white text-text-muted opacity-0 shadow-sm transition-opacity duration-[var(--dur-fast)] hover:text-text group-hover:opacity-100"
            >
              <X className="size-3" strokeWidth={2.25} />
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

/** Label colour per file type, at the page's top. */
const LABEL: Record<string, string> = { pdf: "#D93025", txt: "#6B7280", xlsx: "#188038", jpg: "#1A73E8" };

const PAGE = "M2 0h14l8 8v20a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z";
const SHADOW = "[filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.14))_drop-shadow(0_0_0.5px_rgba(0,0,0,0.3))]";

/** The blank page behind. */
function Sheet() {
  return (
    <svg viewBox="0 0 24 30" className={`h-[36px] w-[29px] overflow-visible ${SHADOW}`}>
      <path d={PAGE} fill="#fff" />
    </svg>
  );
}

/** A page: a folded top corner, the type's label, then a few lines (a
 *  picture, for a photo), on a soft blurred shadow so it reads on the white chip. */
function Page({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const photo = ext === "jpg" || ext === "jpeg" || ext === "png";
  return (
    <svg
      viewBox="0 0 24 30"
      className={`h-[36px] w-[29px] overflow-visible ${SHADOW}`}
      aria-hidden
    >
      <path d={PAGE} fill="#fff" />
      <path d="M16 0v6a2 2 0 0 0 2 2h6z" fill="#E5E7EB" />
      {photo ? (
        <g>
          <rect x="3.5" y="10" width="17" height="11" rx="1" fill="#CFE3F7" />
          <path d="M3.5 21l5-5 3.5 3.5 3-2.5 5.5 4z" fill="#7FA8D1" />
          <circle cx="15.5" cy="13.5" r="1.6" fill="#fff" />
        </g>
      ) : ext === "xlsx" ? (
        <g fill="none" stroke="#C7D2CB" strokeWidth="0.8">
          <rect x="3.5" y="10" width="17" height="11" />
          <path d="M3.5 13.7h17M3.5 17.3h17M9.2 10v11M14.8 10v11" />
        </g>
      ) : (
        <g fill="#D1D5DB">
          {[10, 13, 16, 19].map((y, i) => (
            <rect key={y} x="3.5" y={y} width={i === 3 ? 10 : 17} height="1.4" rx="0.7" />
          ))}
        </g>
      )}
      <rect x="3.5" y="3" width="11" height="4" rx="1" fill={LABEL[photo ? "jpg" : ext] ?? LABEL.txt} />
      <text x="9" y="6.1" textAnchor="middle" fontSize="3.2" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">
        {(photo ? "JPG" : ext).toUpperCase()}
      </text>
    </svg>
  );
}
