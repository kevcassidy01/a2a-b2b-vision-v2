import { useEffect, useRef, useState } from "react";
import { Archive, ChevronDown, ChevronRight, Pencil, Pin, Trash2, Upload } from "lucide-react";
import { copy } from "../copy/copy";

/**
 * ChatTitleMenu — the active chat's title in the top-left of the main stage.
 *
 * The title itself is plain text (not a button); only the trailing chevron is
 * the trigger — unlike the composer's menus, where the whole label is clickable.
 * Opens downward (the title sits at the top). All presentational: Pin / Rename
 * / Add to project / Share chat / Delete, the shortcut letters, and the
 * Add-to-project chevron open / do nothing. Dismisses on outside-click / Escape.
 */
export function ChatTitleMenu({ title }: { title: string }) {
  const m = copy.shell.chatMenu;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Base row without a text color, so the Delete row can override to danger
  // without a Tailwind ordering conflict.
  const rowBase =
    "flex h-8 w-full items-center gap-3 rounded-md px-2.5 text-left text-ui transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated";
  const row = `${rowBase} text-text`;
  const glyph = "size-[18px] shrink-0";

  return (
    <div ref={rootRef} className="relative flex items-center gap-1">
      {/* Title — plain text, not interactive. */}
      <span className="text-[16px] font-medium text-text">{title}</span>

      {/* Chevron — the only button here. */}
      <button
        type="button"
        aria-label={m.options}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`grid size-7 shrink-0 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text ${
          open ? "bg-elevated text-text" : ""
        }`}
      >
        <ChevronDown className="size-4" strokeWidth={2} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute z-50 left-0 top-full mt-2 w-[260px] rounded-lg border border-prompt-border bg-surface p-2 shadow-prompt"
        >
          <button type="button" className={row}>
            <Pin className={glyph} strokeWidth={2} />
            <span>{m.pin}</span>
          </button>
          <button type="button" className={row}>
            <Pencil className={glyph} strokeWidth={2} />
            <span>{m.rename}</span>
          </button>
          <button type="button" className={row}>
            <Archive className={glyph} strokeWidth={2} />
            <span className="flex-1">{m.addToProject}</span>
            <ChevronRight className="size-4 shrink-0 text-text-muted" strokeWidth={2} />
          </button>
          <button type="button" className={row}>
            <Upload className={glyph} strokeWidth={2} />
            <span>{m.shareChat}</span>
          </button>

          <div className="my-1.5 h-px bg-border" />

          <button type="button" className={`${rowBase} text-danger`}>
            <Trash2 className={glyph} strokeWidth={2} />
            <span>{m.delete}</span>
          </button>
        </div>
      )}
    </div>
  );
}
