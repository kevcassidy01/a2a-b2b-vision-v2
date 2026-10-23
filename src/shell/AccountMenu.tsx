import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CircleArrowUp,
  CircleHelp,
  Download,
  Globe,
  Info,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import { copy } from "../copy/copy";

/** Theme segmented-control options (System / Light / Dark). */
const THEME_OPTIONS = [
  { key: "system", Icon: Monitor },
  { key: "light", Icon: Sun },
  { key: "dark", Icon: Moon },
] as const;
type ThemeKey = (typeof THEME_OPTIONS)[number]["key"];

/**
 * AccountMenu — the sidebar footer's account button + its popover.
 *
 * The button (avatar + email + chevron) opens an upward menu: email header,
 * a Theme segmented control, then Settings / Language / Get help, Upgrade plan
 * / Get apps / Learn more, and Log out. All presentational (Learn more carries
 * a dummy chevron; the theme control moves its thumb but doesn't reskin yet —
 * dark theme is deferred). Dismisses on outside-click / Escape.
 *
 * Renders as a flex-1 wrapper so it fills the footer row beside the separate
 * download button. `compact` (the Cowork desktop app) shows a smaller
 * "Name · email" label instead: the name darker, the email lighter, and the
 * menu's icons in the sidenav's muted grey.
 * `onSettings` makes Settings act (the Cowork window opens its Settings modal).
 */
export function AccountMenu({
  collapsed = false,
  compact = false,
  email,
  onSettings,
}: {
  collapsed?: boolean;
  compact?: boolean;
  /** Overrides the account email (Cowork shows Aaron's work address). */
  email?: string;
  onSettings?: () => void;
}) {
  const acc = copy.shell.account;
  const address = email ?? acc.email;
  const it = acc.items;
  const [open, setOpen] = useState(false);
  // Presentational for now — light theme only (see DESIGN_DECISIONS).
  const [theme, setTheme] = useState<ThemeKey>("light");
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

  // Rows take the sidebar's row height (h-row: 32px in the browser, 28px in Cowork).
  const row =
    "flex h-row w-full items-center gap-3 rounded-md px-2.5 text-left text-ui text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated";
  // Cowork: icons in the sidenav items' muted grey; the browser keeps them dark.
  const glyph = `size-[18px] shrink-0 ${compact ? "text-text-muted" : ""}`;
  const divider = <div className="my-1.5 h-px bg-border" />;

  return (
    <div ref={rootRef} className={collapsed ? "relative" : "relative min-w-0 flex-1"}>
      {/* Identity trigger — full row (avatar + email + chevron) when expanded;
          avatar-only in the collapsed rail. Both open the same menu. */}
      {collapsed ? (
        <button
          type="button"
          aria-label={acc.menu}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`grid size-8 place-items-center rounded-md transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated ${
            open ? "bg-elevated" : ""
          }`}
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-avatar text-[13px] font-medium text-text">
            {acc.initial}
          </span>
        </button>
      ) : (
        <button
          type="button"
          aria-label={acc.menu}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`flex h-8 w-full items-center gap-2 rounded-md px-1.5 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated ${
            open ? "bg-elevated" : ""
          }`}
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-avatar text-[13px] font-medium text-text">
            {acc.initial}
          </span>
          {compact ? (
            <span className="min-w-0 flex-1 truncate text-[13px]">
              <span className="text-text">{acc.name}</span>
              <span className="text-text-subtle"> · {address}</span>
            </span>
          ) : (
            <span className="min-w-0 flex-1 truncate text-ui text-text-muted">
              {address}
            </span>
          )}
          <ChevronDown className="size-4 shrink-0 text-text-muted" strokeWidth={2} />
        </button>
      )}

      {open && (
        <div
          role="menu"
          className="absolute z-50 bottom-full left-0 mb-2 w-[300px] rounded-lg border border-prompt-border bg-surface p-2 shadow-prompt"
        >
          {/* Email header — non-interactive. */}
          <div className="truncate px-2.5 pb-1.5 pt-1 text-[14px] text-text-subtle">
            {address}
          </div>

          {/* Theme — a segmented control (not a single action, so it's a plain
              row). No leading icon; label sits flush like the email header
              above it. Interactive thumb; presentational (no reskin yet). */}
          <div className="flex h-9 w-full items-center px-2.5 text-ui text-text">
            <span className="flex-1">{it.theme}</span>
            <div className="inline-flex items-center gap-0.5 rounded-md bg-track p-0.5">
              {THEME_OPTIONS.map(({ key, Icon }) => (
                <button
                  key={key}
                  type="button"
                  aria-label={it.themeOptions[key]}
                  aria-pressed={theme === key}
                  onClick={() => setTheme(key)}
                  className={`grid size-7 place-items-center rounded-sm transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
                    theme === key
                      ? "bg-track-thumb text-text shadow-sm"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  <Icon className="size-[18px]" strokeWidth={2} />
                </button>
              ))}
            </div>
          </div>

          {divider}

          <button
            type="button"
            className={row}
            onClick={() => {
              setOpen(false);
              onSettings?.();
            }}
          >
            <Settings className={glyph} strokeWidth={2} />
            <span className="flex-1">{it.settings}</span>
          </button>
          <button type="button" className={row}>
            <Globe className={glyph} strokeWidth={2} />
            <span className="flex-1">{it.language}</span>
          </button>
          <button type="button" className={row}>
            <CircleHelp className={glyph} strokeWidth={2} />
            <span className="flex-1">{it.help}</span>
          </button>

          {divider}

          <button type="button" className={row}>
            <CircleArrowUp className={glyph} strokeWidth={2} />
            <span className="flex-1">{it.upgrade}</span>
          </button>
          <button type="button" className={row}>
            <Download className={glyph} strokeWidth={2} />
            <span className="flex-1">{it.apps}</span>
          </button>
          <button type="button" className={row}>
            <Info className={glyph} strokeWidth={2} />
            <span className="flex-1">{it.learnMore}</span>
            <ChevronRight className="size-4 shrink-0 text-text-muted" strokeWidth={2} />
          </button>

          {divider}

          <button type="button" className={row}>
            <LogOut className={glyph} strokeWidth={2} />
            <span className="flex-1">{it.logout}</span>
          </button>
        </div>
      )}
    </div>
  );
}
