import { useEffect, useState, type ComponentType } from "react";
import {
  Blocks,
  BriefcaseBusiness,
  ChartColumn,
  CircleUser,
  CodeXml,
  ListTodo,
  Monitor,
  Plug,
  ScrollText,
  Settings,
  Shield,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { copy } from "../../../copy/copy";
import { ConnectorsPane } from "./ConnectorsPane";
import { GeneralPane } from "./GeneralPane";
import { SkillsPane } from "./SkillsPane";

type PaneId = (typeof copy.desktop.cowork.settings.nav)[number]["items"][number]["id"];

const ICONS: Record<PaneId, LucideIcon> = {
  general: Settings,
  account: CircleUser,
  privacy: Shield,
  usage: ChartColumn,
  capabilities: BriefcaseBusiness,
  claudeCode: CodeXml,
  cowork: ListTodo,
  system: Monitor,
  extensions: Plug,
  developer: Wrench,
  skills: ScrollText,
  connectors: Blocks,
  plugins: Plug,
};

/** The panes that exist; the other nav rows don't open anything yet. */
const PANES: Partial<Record<PaneId, ComponentType>> = {
  general: GeneralPane,
  skills: SkillsPane,
  connectors: ConnectorsPane,
};

/**
 * SettingsModal — the desktop app's Settings, opened from the account menu
 * (Somnath's screenshots of the live app). It dims the whole Cowork window
 * (the traffic lights stay on top, as on a Mac) and floats a card with a
 * grouped nav on the left and the pane on the right. The live app's nav search
 * is left out (Somnath). Closes on ×, a click on the dim, or Escape.
 */
export function SettingsModal({ onClose }: { onClose: () => void }) {
  const t = copy.desktop.cowork.settings;
  const [pane, setPane] = useState<PaneId>("general");
  const Pane = PANES[pane];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-40">
      <div aria-hidden onClick={onClose} className="animate-fade-in absolute inset-0 bg-scrim" />
      <div
        role="dialog"
        aria-modal
        aria-label={t.nav[0].caption}
        className="animate-window-open absolute inset-x-[11%] inset-y-[6%] flex overflow-hidden rounded-lg bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.25)]"
      >
        <nav className="flex w-[200px] shrink-0 flex-col overflow-y-auto border-r border-border bg-sidenav px-3 pb-4 pt-3">
          {t.nav.map((group) => (
            <div key={group.caption} className="mb-5">
              <div className="px-2.5 pb-1.5 pt-2 text-[13px] text-text-subtle">{group.caption}</div>
              {group.items.map(({ id, label }) => {
                const Icon = ICONS[id];
                const active = pane === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => PANES[id] && setPane(id)}
                    className={`flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-ui transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
                      active ? "bg-elevated text-text" : "text-text-muted hover:bg-elevated hover:text-text"
                    }`}
                  >
                    <Icon className="size-[18px] shrink-0" strokeWidth={1.75} />
                    {label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="relative min-w-0 flex-1 overflow-y-auto">
          <button
            type="button"
            aria-label={t.close}
            onClick={onClose}
            className="absolute right-4 top-4 z-20 grid size-8 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text"
          >
            <X className="size-[18px]" strokeWidth={2} />
          </button>
          {Pane && <Pane />}
        </div>
      </div>
    </div>
  );
}
