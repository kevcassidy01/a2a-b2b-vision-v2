import { useEffect, useRef, useState } from "react";
import {
  Archive,
  Blocks,
  Briefcase,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  Globe,
  HardDrive,
  History,
  Mail,
  Palette,
  Paperclip,
  Plug,
  Plus,
  Scroll,
} from "lucide-react";
import { Tooltip } from "./Tooltip";
import { copy } from "../copy/copy";

/**
 * AddMenu — the composer's "+" (add content) menu.
 *
 * Trigger is the footer "+"; clicking opens an upward popover in three groups.
 * Mostly presentational: only Skills and Add connector open real submenus (on
 * hover, to the right). Web search / Memory are toggles that flip a blue check
 * — the small interactive bits. Everything else (screenshot, Add to project,
 * Design system, Add plugins, submenu leaves) is a dummy. Dismisses on
 * outside-click / Escape.
 *
 * The "Salesforce Commerce" connector shows here as a static **connected** row —
 * it's wired up once during setup (on another screen), not toggled from this menu.
 * Its `commerce` state (always on in this build) still drives the connected chip
 * beside "+" and the Salesforce skill gating.
 */

/** Connector submenu leaves — icons paired by position with copy.items. */
const CONNECTOR_ICONS = [Mail, HardDrive, Calendar];

export function AddMenu({
  commerce,
  openUp = false,
}: {
  commerce: boolean;
  /** Popover direction. Default (down) suits the new-chat prompt box; the
   *  future bottom-anchored in-chat prompt box will pass `openUp`. */
  openUp?: boolean;
}) {
  const a = copy.shell.composer.add;
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<null | "skills" | "connector">(null);
  const [webSearch, setWebSearch] = useState(true);
  const [memory, setMemory] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSub(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSub(null);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const row =
    "flex h-8 w-full items-center gap-3 rounded-md px-2.5 text-left text-ui text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated";
  const glyph = "size-[18px] shrink-0";
  const chevron = <ChevronRight className="size-4 shrink-0 text-text-muted" strokeWidth={2} />;
  const divider = <div className="my-1.5 h-px bg-border" />;

  return (
    <div ref={rootRef} className="relative">
      <Tooltip label={a.tooltip} side="top" align="start">
        <button
          type="button"
          aria-label={a.tooltip}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => {
            setOpen((v) => !v);
            setSub(null);
          }}
          className={`grid size-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text ${
            open ? "bg-elevated text-text" : ""
          }`}
        >
          <Plus className="size-[18px]" strokeWidth={2} />
        </button>
      </Tooltip>

      {open && (
        <div
          role="menu"
          className={`absolute z-50 left-0 w-[288px] rounded-lg border border-prompt-border bg-surface p-2 shadow-prompt ${
            openUp ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {/* Group 1 — files / screenshot / project */}
          <button type="button" className={row} onMouseEnter={() => setSub(null)}>
            <Paperclip className={glyph} strokeWidth={2} />
            <span className="flex-1">{a.files}</span>
          </button>
          <button type="button" className={row} onMouseEnter={() => setSub(null)}>
            <Camera className={glyph} strokeWidth={2} />
            <span className="flex-1">{a.screenshot}</span>
          </button>
          <button type="button" className={row} onMouseEnter={() => setSub(null)}>
            <Archive className={glyph} strokeWidth={2} />
            <span className="flex-1">{a.project}</span>
            {chevron}
          </button>

          {divider}

          {/* Group 2 — skills (submenu) / connector (submenu) / design / plugins */}
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setSub("skills")}
              className={`${row} ${sub === "skills" ? "bg-elevated" : ""}`}
            >
              <Scroll className={glyph} strokeWidth={2} />
              <span className="flex-1">{a.skills}</span>
              {chevron}
            </button>
            {sub === "skills" && (
              <div
                role="menu"
                className={`absolute z-50 left-full ml-2 w-[224px] rounded-lg border border-prompt-border bg-surface p-2 shadow-prompt ${
                  openUp ? "bottom-0" : "top-0"
                }`}
              >
                {a.skillsMenu.items.map((name) => (
                  <button key={name} type="button" className={row}>
                    <Scroll className={glyph} strokeWidth={2} />
                    <span className="flex-1 truncate">{name}</span>
                  </button>
                ))}
                {divider}
                <button type="button" className={row}>
                  <Briefcase className={glyph} strokeWidth={2} />
                  <span className="flex-1">{a.skillsMenu.manage}</span>
                </button>
                <button type="button" className={row}>
                  <Plus className={glyph} strokeWidth={2} />
                  <span className="flex-1">{a.skillsMenu.browse}</span>
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setSub("connector")}
              className={`${row} ${sub === "connector" ? "bg-elevated" : ""}`}
            >
              <Blocks className={glyph} strokeWidth={2} />
              <span className="flex-1">{a.connector}</span>
              {chevron}
            </button>
            {sub === "connector" && (
              <div
                role="menu"
                className={`absolute z-50 left-full ml-2 w-[272px] rounded-lg border border-prompt-border bg-surface p-2 shadow-prompt ${
                  openUp ? "bottom-0" : "top-0"
                }`}
              >
                {/* Salesforce Commerce — connected during setup, shown here as a
                    static connected row (not toggled from this menu). */}
                <div className="flex h-8 w-full items-center gap-3 rounded-md px-2.5 text-left text-ui text-text">
                  <img
                    src="/salesforce.svg"
                    alt=""
                    aria-hidden
                    className="h-[18px] w-auto shrink-0"
                  />
                  <span className="flex-1 whitespace-nowrap">{a.connectorMenu.commerce}</span>
                  {commerce && (
                    <span className="flex shrink-0 items-center gap-1.5 text-[13px] text-text-muted">
                      {a.connectorMenu.connected}
                      <Check className="size-[18px] text-check" strokeWidth={2.5} />
                    </span>
                  )}
                </div>
                {divider}
                {a.connectorMenu.items.map((name, i) => {
                  const Icon = CONNECTOR_ICONS[i];
                  return (
                    <button key={name} type="button" className={row}>
                      <Icon className={glyph} strokeWidth={2} />
                      <span className="flex-1 truncate">{name}</span>
                    </button>
                  );
                })}
                {divider}
                <button type="button" className={row}>
                  <Briefcase className={glyph} strokeWidth={2} />
                  <span className="flex-1">{a.connectorMenu.manage}</span>
                </button>
                <button type="button" className={row}>
                  <Plus className={glyph} strokeWidth={2} />
                  <span className="flex-1">{a.connectorMenu.browse}</span>
                </button>
              </div>
            )}
          </div>

          <button type="button" className={row} onMouseEnter={() => setSub(null)}>
            <Palette className={glyph} strokeWidth={2} />
            <span className="flex-1">{a.designSystem}</span>
            {chevron}
          </button>
          <button type="button" className={row} onMouseEnter={() => setSub(null)}>
            {/* Plug reads optically small — nudged to 20px to match the rest. */}
            <Plug className="size-5 shrink-0" strokeWidth={2} />
            <span className="flex-1">{a.plugins}</span>
          </button>

          {divider}

          {/* Group 3 — toggles (blue check when on) */}
          <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={webSearch}
            onClick={() => setWebSearch((v) => !v)}
            onMouseEnter={() => setSub(null)}
            className={row}
          >
            <Globe className={glyph} strokeWidth={2} />
            <span className="flex-1">{a.webSearch}</span>
            {webSearch && <Check className="size-[18px] shrink-0 text-check" strokeWidth={2.5} />}
          </button>
          <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={memory}
            onClick={() => setMemory((v) => !v)}
            onMouseEnter={() => setSub(null)}
            className={row}
          >
            <History className={glyph} strokeWidth={2} />
            <span className="flex-1">{a.memory}</span>
            {memory && <Check className="size-[18px] shrink-0 text-check" strokeWidth={2.5} />}
          </button>
        </div>
      )}
    </div>
  );
}
