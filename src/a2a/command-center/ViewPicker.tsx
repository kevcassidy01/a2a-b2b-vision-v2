import { useState } from "react";
import { copy } from "../../copy/copy";

const t = copy.a2a.commandCenter.view;

/**
 * ViewPicker — the Command Center's views (Console, Dashboard, Service) as a
 * radio group of button-shaped options. Each has a radio circle before its
 * label; the chosen one gets the blue active stroke, a filled radio and a
 * semibold label (its width reserved, so nothing shifts).
 */
export function ViewPicker() {
  const [selected, setSelected] = useState(0);
  return (
    <div
      role="radiogroup"
      aria-label={t.label}
      className="flex items-center gap-2"
    >
      {t.options.map((option, i) => {
        const on = selected === i;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setSelected(i)}
            className={`a2a-control flex h-8 items-center gap-2 rounded-md pl-2.5 pr-3 text-[13.5px] text-text ${
              on ? "a2a-control-active" : ""
            }`}
          >
            <span
              aria-hidden
              className={`a2a-radio ${on ? "a2a-radio-on" : ""}`}
            />
            <span className="grid">
              <span
                aria-hidden
                className="invisible col-start-1 row-start-1 font-semibold"
              >
                {option}
              </span>
              <span
                className={`col-start-1 row-start-1 ${on ? "font-semibold" : ""}`}
              >
                {option}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
