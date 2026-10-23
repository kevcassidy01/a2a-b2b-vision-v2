import { useEffect, useRef } from "react";
import { ScrollText } from "lucide-react";
import type { ComposerEditor } from "./useComposer";

/**
 * SkillMenu — the slash-skill picker that floats above the prompt box.
 *
 * Opens when the caret is in a fresh `/query` token; the list is already
 * filtered + ordered by `useComposer` (default section, then — when the
 * Commerce connector is on — a separator and the Salesforce section). Rows are
 * styled like the other composer popovers (AddMenu / ModelMenu). Selecting a
 * row (click or the highlighted row via ↑/↓ + Enter) drops the chunk in.
 *
 * Positioned by the caret: its left tracks the `/` (clamped to the box) and it
 * sits just above the editor line via `bottom-full`.
 */
export function SkillMenu({ editor }: { editor: ComposerEditor }) {
  const { slash, onSelect, onHover, menuLabel } = editor;

  // Keep the highlighted row visible as ↑/↓ walks a scrolled (capped) list.
  const activeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [slash.active]);

  return (
    <div
      role="listbox"
      aria-label={menuLabel}
      style={{ left: slash.left }}
      className="absolute bottom-full z-50 mb-2 max-h-[min(22rem,55vh)] w-[280px] overflow-y-auto rounded-lg border border-prompt-border bg-surface p-1.5 shadow-prompt"
    >
      {slash.items.map((skill, i) => (
        <div key={skill.id}>
          {/* Separator between the default section and the Salesforce section. */}
          {i === slash.defaultCount && slash.defaultCount > 0 && (
            <div className="my-1 h-px bg-border" />
          )}
          <button
            type="button"
            role="option"
            ref={i === slash.active ? activeRef : undefined}
            aria-selected={i === slash.active}
            // Keep the editor focused (and its caret) — select on mousedown.
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(i);
            }}
            onMouseEnter={() => onHover(i)}
            className={`flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-ui transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
              i === slash.active ? "bg-elevated" : ""
            }`}
          >
            <ScrollText className="size-[18px] shrink-0 text-text-muted" strokeWidth={2} />
            <span className="truncate text-text">{skill.id}</span>
          </button>
        </div>
      ))}
    </div>
  );
}
