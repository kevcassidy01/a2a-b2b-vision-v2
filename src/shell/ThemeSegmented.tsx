import { Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { copy } from "../copy/copy";

/** Theme segmented-control options (System / Light / Dark). */
const THEME_OPTIONS = [
  { key: "system", Icon: Monitor },
  { key: "light", Icon: Sun },
  { key: "dark", Icon: Moon },
] as const;
type ThemeKey = (typeof THEME_OPTIONS)[number]["key"];

/**
 * ThemeSegmented — the System / Light / Dark icon segmented control (account
 * menu, Settings → General, the A2A Command Center). Presentational: the thumb
 * moves, nothing reskins — light theme only (see DESIGN_DECISIONS).
 */
export function ThemeSegmented({ iconSize = 16 }: { iconSize?: number }) {
  const labels = copy.shell.account.items.themeOptions;
  const [theme, setTheme] = useState<ThemeKey>("light");
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md bg-track p-0.5">
      {THEME_OPTIONS.map(({ key, Icon }) => (
        <button
          key={key}
          type="button"
          aria-label={labels[key]}
          aria-pressed={theme === key}
          onClick={() => setTheme(key)}
          className={`grid size-7 place-items-center rounded-sm transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
            theme === key ? "bg-track-thumb text-text shadow-thumb" : "text-text-muted hover:text-text"
          }`}
        >
          <Icon style={{ width: iconSize, height: iconSize }} strokeWidth={2} />
        </button>
      ))}
    </div>
  );
}
