import { Check, type LucideIcon } from "lucide-react";
import { Fragment, useState, type ReactNode } from "react";

/** Text segmented control (Small | Medium | Large, Yours | Discover). Same track
 *  and thumb as the app's other segmented controls, each segment sized to its label.
 *  The selected label is semibold behind a checkmark; with three or more segments a hairline
 *  divides the unselected ones (never beside the thumb).
 *  `small` matches the prompt box's Chat | Cowork (24px segments). `icon`
 *  leads the track with a glyph that labels the control (the Command Center's
 *  calendar before its periods); it's not a segment and can't be selected.
 *  `reserveCheck={false}` (long controls) keeps only the bold width: the total
 *  stays fixed, but labels slide a little when the check moves. */
export function Segmented({
  options,
  initial = 0,
  label,
  small = false,
  icon: Icon,
  reserveCheck = true,
}: {
  options: readonly string[];
  initial?: number;
  label: string;
  small?: boolean;
  icon?: LucideIcon;
  reserveCheck?: boolean;
}) {
  const [selected, setSelected] = useState(initial);
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-track p-0.5"
    >
      {Icon && (
        <span
          aria-hidden
          className={`${small ? "h-6 w-6" : "h-7 w-7"} grid place-items-center text-text-muted`}
        >
          <Icon className="size-4" strokeWidth={2} />
        </span>
      )}
      {options.map((option, i) => (
        <Fragment key={option}>
          {(i > 0 || Icon) && (
            <span
              aria-hidden
              className={`h-3.5 w-px bg-black/[0.12] transition-opacity duration-[var(--dur-fast)] ${
                options.length > 2 && selected !== i - 1 && selected !== i
                  ? ""
                  : "opacity-0"
              }`}
            />
          )}
          <button
            type="button"
            role="tab"
            aria-selected={selected === i}
            onClick={() => setSelected(i)}
            className={`${small ? "h-6 pl-1.5 pr-2" : "h-7 pl-2 pr-2.5"} grid place-items-center rounded-sm text-ui transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
              selected === i
                ? "bg-track-thumb font-semibold text-text shadow-thumb"
                : "text-text-muted hover:text-text"
            }`}
          >
            <SegmentLabel selected={selected === i} reserveCheck={reserveCheck}>
              {option}
            </SegmentLabel>
          </button>
        </Fragment>
      ))}
    </div>
  );
}

/** A segment's label: a checkmark then the label when selected. Always as wide
 *  as its selected (checked, semibold) self, so selecting a segment doesn't
 *  nudge its neighbours. */
export function SegmentLabel({
  selected,
  reserveCheck = true,
  children,
}: {
  selected: boolean;
  reserveCheck?: boolean;
  children: ReactNode;
}) {
  const check = <Check className="size-3.5 shrink-0" strokeWidth={2.5} />;
  return (
    <span className="grid">
      <span
        aria-hidden
        className="invisible col-start-1 row-start-1 flex items-center gap-1 font-semibold"
      >
        {(reserveCheck || selected) && check}
        {children}
      </span>
      <span className="col-start-1 row-start-1 flex items-center justify-center gap-1">
        {selected && check}
        {children}
      </span>
    </span>
  );
}
