import { useState, type ReactNode } from "react";
import { ChevronDown, Plus, Search } from "lucide-react";
import { copy } from "../../../copy/copy";
import { Segmented } from "../../../shell/Segmented";

export { Segmented };

/**
 * Small building blocks shared by the Settings panes: a text segmented control,
 * an on/off switch, a dropdown-looking value, and the Skills / Connectors list
 * header. All presentational: they hold their own state and change nothing else.
 */

/** On/off switch, off by default. `onClass` colours it when on (the app's own by default). */
export function Switch({
  label,
  onClass = "bg-switch-on",
}: {
  label: string;
  onClass?: string;
}) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => setOn((v) => !v)}
      className={`relative h-[22px] w-9 shrink-0 rounded-full transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
        on ? onClass : "bg-switch-off"
      }`}
    >
      <span
        aria-hidden
        className={`absolute left-0.5 top-0.5 size-[18px] rounded-full bg-white shadow-sm transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
          on ? "translate-x-3.5" : ""
        }`}
      />
    </button>
  );
}

/** A dropdown's resting look (value + chevron). Doesn't open. */
export function SelectValue({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`flex h-8 items-center gap-1.5 rounded-md px-2 text-ui text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated ${className}`}
    >
      {children}
      <ChevronDown className="size-4 text-text-muted" strokeWidth={2} />
    </button>
  );
}

/** Black primary button (Add, Discover skills). */
export const PRIMARY_BTN =
  "flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-text px-3 text-ui font-medium text-white transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:opacity-85";

export const ICON_BTN =
  "grid size-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text";

/** Skills / Connectors header: title, Yours | Discover, search, the pane's own
 *  icon buttons (`actions`), then Add. */
export function ListHeader({
  title,
  actions,
}: {
  title: string;
  actions: ReactNode;
}) {
  const t = copy.desktop.cowork.settings.list;
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-[22px] font-semibold leading-none text-text">
        {title}
      </h2>
      <Segmented options={[t.yours, t.discover]} label={title} small />
      <div className="ml-auto flex h-8 w-[240px] items-center gap-2 rounded-md border border-prompt-border bg-surface px-2.5 focus-within:border-prompt-border-focus">
        <Search className="size-4 shrink-0 text-text-subtle" strokeWidth={2} />
        <input
          type="text"
          placeholder={t.search}
          aria-label={t.search}
          className="min-w-0 flex-1 bg-transparent text-ui text-text outline-none placeholder:text-text-subtle"
        />
      </div>
      {actions}
      <button type="button" className={PRIMARY_BTN}>
        <Plus className="size-4" strokeWidth={2} />
        {t.add}
        <ChevronDown className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}
