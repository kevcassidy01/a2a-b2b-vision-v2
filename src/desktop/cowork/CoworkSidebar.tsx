import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  ChevronDown,
  Clock,
  Waypoints,
  Package2,
  PanelLeft,
  Plus,
  Search,
  Shapes,
  SlidersVertical,
} from "lucide-react";
import { copy } from "../../copy/copy";
import { AccountMenu } from "../../shell/AccountMenu";
import { NavItem } from "../../shell/NavItem";
import { RecentItem } from "../../shell/RecentItem";
import { FlowItem } from "./FlowItem";
import { Separator } from "../../shell/Separator";
import { Tooltip } from "../../shell/Tooltip";
import { HomeCodeToggle } from "./HomeCodeToggle";
import { useCoworkChat } from "./chat/store";

const ICON_BTN =
  "grid size-8 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text";

/**
 * CoworkSidebar — the sidenav inside the Cowork window (COWORK_INTENT §8).
 *
 * Built for the desktop window, from the browser shell's parts: nav group,
 * recents and account footer, with the same collapse-to-rail behavior. Somnath
 * names what differs from the browser one at a time. So far: the live app's
 * header (collapse · search · back · forward, then Home | Code) replaces the
 * wordmark, Chat/Code and search field; the footer reads "Name · email",
 * smaller, with no download button. The recents open with the two agents'
 * "New session" rows (each starts its own agent from a goal), set off from the
 * dummy past chats by a hairline, as the browser does with its three journeys.
 * The Canary Wharf chat (from New, with files) and the brief (from Scheduled)
 * have no row until they start; then theirs lands on top, newest first. Each
 * reads "New session" until it starts, then retitles (see FlowItem). The nav has Agents (Waypoints) and the live app's Scheduled
 * (clock) in place of Code.
 */
export type FlowId = (typeof copy.desktop.cowork.flows.items)[number]["id"];
/** A nav item that opens a page in the main stage. */
export type CoworkPage = "agents" | "scheduled";

export function CoworkSidebar({
  selected,
  started,
  page,
  onSelect,
  onOpenPage,
  onOpenSettings,
}: {
  selected: FlowId | null;
  started: FlowId[];
  page: CoworkPage | null;
  onSelect: (id: FlowId | null) => void;
  onOpenPage: (page: CoworkPage) => void;
  onOpenSettings: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const flows = copy.desktop.cowork.flows;
  const t = copy.desktop.cowork.sidebar;
  const agentIcon = useCoworkChat((s) => s.agentIcon);
  const talking = useCoworkChat((s) => s.talking);
  const unread = useCoworkChat((s) => s.unread);
  // Sessions started elsewhere (New, Scheduled) on top, newest first, then the agents' rows.
  const rows = [
    ...[...started].reverse().flatMap((id) => flows.items.filter((f) => f.id === id && f.kind !== "agent")),
    ...flows.items.filter((f) => f.kind === "agent"),
  ];

  return (
    <aside
      className={`flex shrink-0 flex-col bg-sidenav transition-[width] duration-[var(--dur-base)] ease-[var(--ease-out)] ${
        collapsed ? "w-16" : "w-[288px]"
      }`}
    >
      {/* Clipped only when expanded, so rail tooltips can escape when collapsed;
          the account footer sits outside so its popover is never clipped. */}
      <div className={`flex min-h-0 flex-col ${collapsed ? "" : "overflow-hidden"}`}>
        {/* Top icons (collapse, search, back, forward), then Home | Code: the
            live desktop app's header. There's no wordmark or search field. */}
        <div className={`flex items-center gap-0.5 pt-3 ${collapsed ? "justify-center px-2" : "px-3"}`}>
          <Tooltip label={copy.shell.toggleSidebar} align="start">
            <button type="button" aria-label={copy.shell.toggleSidebar} onClick={() => setCollapsed((v) => !v)} className={ICON_BTN}>
              <PanelLeft className="size-[18px]" strokeWidth={2} />
            </button>
          </Tooltip>
          {!collapsed && (
            <>
              <Tooltip label={t.search}>
                <button type="button" aria-label={t.search} className={ICON_BTN}>
                  <Search className="size-[18px]" strokeWidth={2} />
                </button>
              </Tooltip>
              <Tooltip label={t.back}>
                <button type="button" aria-label={t.back} className={ICON_BTN}>
                  <ArrowLeft className="size-[18px]" strokeWidth={2} />
                </button>
              </Tooltip>
              {/* Nothing to go forward to yet, so it's dimmed, as in the live app. */}
              <button type="button" aria-label={t.forward} disabled className={`${ICON_BTN} disabled:text-text-subtle disabled:hover:bg-transparent`}>
                <ArrowRight className="size-[18px]" strokeWidth={2} />
              </button>
            </>
          )}
        </div>

        {!collapsed && (
          <div className="mb-1 mt-3 px-3">
            <HomeCodeToggle />
          </div>
        )}

        <nav className={`mt-2 flex flex-col ${collapsed ? "items-center gap-1 px-2" : "px-3"}`}>
          <NavItem icon={Plus} label={copy.shell.nav.new} active={selected === null && page === null} shortcut={copy.shell.shortcuts.new} collapsed={collapsed} onClick={() => onSelect(null)} />
          <NavItem icon={Package2} label={copy.shell.nav.projects} shortcut={copy.shell.shortcuts.projects} collapsed={collapsed} />
          <NavItem icon={Shapes} label={copy.shell.nav.artifacts} shortcut={copy.shell.shortcuts.artifacts} collapsed={collapsed} />
          {/* Code lives in Home | Code, so its slot holds Agents, then the live app's Scheduled. */}
          <NavItem icon={Waypoints} label={t.agents} active={page === "agents"} collapsed={collapsed} onClick={() => onOpenPage("agents")} />
          <NavItem icon={Clock} label={t.scheduled} active={page === "scheduled"} collapsed={collapsed} onClick={() => onOpenPage("scheduled")} />
          <NavItem icon={Briefcase} label={copy.shell.nav.customize} collapsed={collapsed} />
        </nav>

        {!collapsed && (
          <>
            <div className="mt-7 flex items-center justify-between px-5 pb-1">
              <span className="flex w-fit cursor-pointer items-center gap-0.5 text-[13px]/[16px] font-normal text-text-subtle transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-text-muted">
                {copy.shell.recentsCaption}
                <ChevronDown className="size-3.5" strokeWidth={2} />
              </span>
              <button
                type="button"
                aria-label={copy.shell.recentsPrefs}
                className="grid size-6 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text"
              >
                <SlidersVertical className="size-4" strokeWidth={2} />
              </button>
            </div>
            <div className="flex min-h-0 flex-col overflow-y-auto">
              {/* The run of show's sessions, then the dummy past chats under a
                  hairline (the browser's journey-chats pattern). */}
              <nav className="mt-1 flex flex-col gap-0.5 px-3">
                {rows.map(({ id, title, kind, schedule }) => (
                  <FlowItem
                    key={id}
                    title={title}
                    kind={kind}
                    placeholder={flows.placeholder}
                    schedule={schedule}
                    started={started.includes(id)}
                    agentReady={agentIcon.includes(id)}
                    talking={talking.includes(id)}
                    unread={unread[id] ?? 0}
                    active={page === null && id === selected}
                    onClick={() => onSelect(id)}
                  />
                ))}
              </nav>
              <div className="my-2 px-5">
                <Separator orientation="horizontal" />
              </div>
              <nav className="flex flex-col gap-0.5 px-3">
                {copy.shell.pastChats.map((label) => (
                  <RecentItem key={label} label={label} />
                ))}
              </nav>
            </div>
          </>
        )}
      </div>

      <div className="mt-auto">
        <Separator orientation="horizontal" />
        <div className={`flex items-center pb-3 pt-2 ${collapsed ? "justify-center px-2" : "gap-1 px-3"}`}>
          {/* No download button: this is already the desktop app. */}
          <AccountMenu collapsed={collapsed} compact email={`${copy.shell.account.name.toLowerCase()}@${copy.desktop.brand.domain}`} onSettings={onOpenSettings} />
        </div>
      </div>
    </aside>
  );
}
