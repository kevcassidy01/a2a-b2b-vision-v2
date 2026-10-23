import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type DropdownOption = {
  value: string;
  /** The name in the menu. */
  label: string;
  /** What the trigger shows when this is chosen (defaults to the label). */
  short?: string;
  /** A leading mark (flag, icon), in the trigger and the menu. */
  mark?: ReactNode;
};

/**
 * Dropdown — the Command Center's shaped dropdown: a trigger (mark, value,
 * chevron) opening a short menu with the current option semibold and checked.
 * While open, the trigger takes the blue active stroke. The menu shares its
 * radius; the inset rows' is smaller. Dismisses on outside click or Escape,
 * like the composer's ModelMenu. Presentational: picking only swaps the trigger.
 */
export function Dropdown({
  label,
  options,
  initial,
  className = "",
}: {
  label: string;
  options: readonly DropdownOption[];
  initial: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(initial);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === selected) ?? options[0];

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

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={`${label}: ${current.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`a2a-control flex h-8 items-center gap-1.5 rounded-md pr-2 text-[13.5px] text-text ${
          current.mark ? "pl-2" : "pl-2.5"
        } ${open ? "a2a-control-active" : ""}`}
      >
        {current.mark}
        <span className="whitespace-nowrap">
          {current.short ?? current.label}
        </span>
        <ChevronDown
          className="-ml-0.5 size-3.5 text-text-muted"
          strokeWidth={2}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={label}
          className="absolute left-0 top-full z-50 mt-1.5 min-w-full w-max rounded-md border border-border bg-surface p-1 shadow-prompt"
        >
          {options.map((o) => {
            const isSelected = o.value === selected;
            return (
              <button
                key={o.value}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  setSelected(o.value);
                  setOpen(false);
                }}
                className="flex h-8 w-full items-center gap-2 rounded-sm pl-2 pr-2.5 text-left text-[13.5px] transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated"
              >
                {o.mark}
                <span
                  className={`mr-auto whitespace-nowrap text-text ${isSelected ? "font-semibold" : ""}`}
                >
                  {o.label}
                </span>
                <Check
                  className={`ml-4 size-4 shrink-0 text-check ${isSelected ? "" : "invisible"}`}
                  strokeWidth={2.5}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
