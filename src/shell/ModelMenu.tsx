import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { copy } from "../copy/copy";

/**
 * ModelMenu — the model picker in the composer footer.
 *
 * The trigger shows the current model name; clicking opens an upward popover
 * listing the models. Selecting one swaps the trigger label — the single
 * genuinely interactive piece (it sells "you can pick a model" in the demo).
 * Everything else is presentational: the Pro / Upgrade badges from claude.ai
 * are omitted, and the Effort / More models rows carry chevrons that open
 * nothing. Dismisses on outside-click or Escape.
 *
 * `openUp` flips the popover direction. Default (down) suits the centered
 * new-chat / greeting prompt box; the future bottom-anchored in-chat prompt
 * box will pass `openUp`.
 */
export function ModelMenu({ openUp = false }: { openUp?: boolean }) {
  const c = copy.shell.composer.model;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>(c.default);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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

  const row =
    "flex w-full items-center rounded-md px-3 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={c.label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-8 items-center rounded-md px-1.5 text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-pressed ${
          open ? "bg-pressed" : ""
        }`}
      >
        {selected}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-50 left-0 w-[360px] rounded-lg border border-prompt-border bg-surface p-2 shadow-prompt ${
            openUp ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {/* Model list — the only interactive rows. */}
          {c.options.map((m) => {
            const isSelected = m.name === selected;
            return (
              <button
                key={m.name}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  setSelected(m.name);
                  setOpen(false);
                }}
                className={`${row} gap-3 py-2`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-ui leading-tight text-text">
                    {m.name}
                  </span>
                  <span className="mt-0.5 block text-[14px] leading-tight text-text-subtle">
                    {m.description}
                  </span>
                </span>
                {isSelected && (
                  <Check className="size-[18px] shrink-0 text-check" strokeWidth={2.5} />
                )}
              </button>
            );
          })}

          <div className="my-1.5 h-px bg-border" />

          {/* Effort — a regular 32px menu item; chevron is presentational. */}
          <button type="button" className={`${row} h-8 justify-between`}>
            <span className="text-ui text-text">{c.effort}</span>
            <span className="flex items-center gap-0.5 text-[14px] text-text-muted">
              {c.effortValue}
              <ChevronRight className="size-4" strokeWidth={2} />
            </span>
          </button>

          <div className="my-1.5 h-px bg-border" />

          {/* More models — a regular 32px menu item; chevron is presentational. */}
          <button type="button" className={`${row} h-8 justify-between`}>
            <span className="text-ui text-text">{c.moreModels}</span>
            <ChevronRight className="size-4 shrink-0 text-text-muted" strokeWidth={2} />
          </button>

          <div className="my-1.5 h-px bg-border" />

          {/* Footer note. */}
          <p className="px-3 pb-1 pt-0.5 text-[13px] leading-snug text-text-muted">
            {c.note}{" "}
            <span className="cursor-pointer underline">{c.learnMore}</span>
          </p>
        </div>
      )}
    </div>
  );
}
