import { useEffect, useRef, useState, type ReactNode } from "react";
import { copy } from "../copy/copy";
import { AppMenu } from "./AppMenu";
import { useCoworkChat } from "./cowork/chat/store";
import {
  // AgentforceGlyph, (hidden for now; see the status items below)
  AppleLogo,
  BatteryGlyph,
  ControlCenterGlyph,
  SalesforceGlyph,
  SearchGlyph,
  WifiGlyph,
} from "./menubarGlyphs";

/** "Sun Oct 11  1:43 AM" — macOS menu-bar clock format (en-US). */
function formatClock(d: Date) {
  const date = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).replace(",", "");
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return { date, time };
}

/** The next morning, when the brief has run: Thursday 15 October, 8:52 AM (decision 54). */
const MORNING = new Date(2026, 9, 15, 8, 52);

/**
 * MenuBar — the macOS (Tahoe) menu bar across the top of the desktop.
 *
 * Dark-mode glass (the macOS chrome is dark; the Cowork app stays light): a
 * dark tint over a heavy blur + saturation of the wallpaper, white medium-weight
 * labels, bold app name. Height and spacing were measured off
 * Somnath's screenshot (cowork-app-real.png). Every item has a hover pill;
 * only the Claude app menu opens (click to toggle, click away or Esc closes).
 * The clock is the real time until the brief runs (the presenter's Ctrl+S);
 * then it jumps to the next morning and keeps ticking from there.
 */
export function MenuBar() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(id);
  }, []);
  const [menuOpen, setMenuOpen] = useState(false);
  const appMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!appMenuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);
  // When the morning began, in real time, so the clock ticks on from 8:52.
  const morning = useCoworkChat((s) => s.morning);
  const [morningAt, setMorningAt] = useState<number | null>(null);
  useEffect(() => {
    if (!morning) return;
    const at = Date.now();
    setMorningAt(at);
    setNow(new Date(at));
  }, [morning]);
  const shown = morningAt === null ? now : new Date(MORNING.getTime() + now.getTime() - morningAt);
  const { date, time } = formatClock(shown);
  const m = copy.desktop.menuBar;

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 flex h-8 select-none items-center justify-between bg-black/[0.32] px-3 text-[13px] font-medium text-white backdrop-blur-2xl backdrop-saturate-150 [font-family:-apple-system,BlinkMacSystemFont,'SF_Pro_Text',Inter,system-ui,sans-serif] [text-shadow:0_0_1px_rgba(0,0,0,0.2)]"
    >
      {/* Left: Apple menu, the active app (bold), then its menus. */}
      <nav className="flex items-center">
        <MenuItem label={m.apple} className="px-3">
          <AppleLogo className="h-[15px] w-[13px] -translate-y-px" />
        </MenuItem>
        <div ref={appMenuRef} className="relative">
          <MenuItem label={m.app} className="font-bold" active={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
            {m.app}
          </MenuItem>
          {menuOpen && <AppMenu />}
        </div>
        {m.menus.map((name) => (
          <MenuItem key={name} label={name}>
            {name}
          </MenuItem>
        ))}
      </nav>

      {/* Right: status items, then Control Center and the clock. */}
      <div className="flex items-center">
        {/* Agentforce extra, hidden for now (Somnath, 2026-10-11). Restore with its import above.
        <MenuItem label={m.agentforce}>
          <AgentforceGlyph className="size-[24px]" />
        </MenuItem>
        */}
        <MenuItem label={m.salesforce}>
          <SalesforceGlyph className="h-[15px] w-auto" />
        </MenuItem>
        <MenuItem label={m.wifi}>
          <WifiGlyph className="h-[13px] w-[17px]" />
        </MenuItem>
        <MenuItem label={m.battery}>
          <BatteryGlyph className="h-[12px] w-[25px]" />
        </MenuItem>
        <MenuItem label={m.spotlight}>
          <SearchGlyph className="size-[14px]" />
        </MenuItem>
        <MenuItem label={m.controlCenter}>
          <ControlCenterGlyph className="h-[13px] w-[15px]" />
        </MenuItem>
        <MenuItem label={`${date} ${time}`} className="tabular-nums">
          <span>{date}</span>
          <span className="ml-2">{time}</span>
        </MenuItem>
      </div>
    </header>
  );
}

/** One menu-bar target: a rounded pill that shows on hover and stays lit while its menu is open. */
function MenuItem({
  label,
  className = "",
  active = false,
  onClick,
  children,
}: {
  label: string;
  className?: string;
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={onClick ? active : undefined}
      onClick={onClick}
      className={`flex h-6 items-center rounded-[5px] px-2.5 leading-none outline-none transition-colors duration-[var(--dur-fast)] hover:bg-white/15 active:bg-white/20 ${active ? "bg-white/20" : ""} ${className}`}
    >
      {children}
    </button>
  );
}
