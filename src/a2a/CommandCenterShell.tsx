import {
  Clock,
  Folder,
  FolderOpen,
  PanelLeft,
  Pin,
  Plus,
  Search,
  Shapes,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { copy } from "../copy/copy";
import { GlassPanel } from "./GlassPanel";
import { Tooltip } from "./Tooltip";

const t = copy.a2a.shell;

/** The shell's corner, and the white layer's (the gap between them stays even round the curve). */
const SHELL_RADIUS = 22;
const INSET = 8;

/**
 * CommandCenterShell — the right half: a generic AI chat app (not Claude,
 * Cowork or ChatGPT), shaped like Dia: one dark-mode glass window whose own
 * surface is the sidenav, with a white layer inset on the right. The white
 * layer's edge is the only thing separating the two. The Command Center fills
 * the white layer edge to edge (A2A_INTENT §4).
 */
export function CommandCenterShell({ children }: { children?: ReactNode }) {
  return (
    <GlassPanel radius={SHELL_RADIUS} className="h-full min-w-0 flex-1">
      <div className="flex h-full">
        <Sidenav />
        <main
          className="a2a-white-layer min-w-0 flex-1 overflow-hidden bg-surface"
          style={{
            margin: `${INSET}px ${INSET}px ${INSET}px 0`,
            borderRadius: SHELL_RADIUS - INSET,
          }}
        >
          {children ?? (
            <div className="grid h-full place-items-center text-sm text-text-subtle">
              {copy.a2a.commandCenter.placeholder}
            </div>
          )}
        </main>
      </div>
    </GlassPanel>
  );
}

function Sidenav() {
  return (
    <nav className="flex w-[232px] shrink-0 flex-col pb-2 pt-3 text-[13.5px] text-white/55">
      {/* Header: the app mark, then search and collapse (Cowork's header icons). */}
      <div className="flex items-center gap-0.5 px-3">
        <span className="a2a-orb mr-auto size-[28px]" aria-hidden />
        <IconButton icon={Search} label={t.search} />
        <IconButton icon={PanelLeft} label={t.collapse} />
      </div>

      <div className="mt-3 flex flex-col gap-px px-2">
        <NavRow icon={Plus} label={t.nav.newChat} />
        <Group icon={Shapes} label={t.nav.artifacts}>
          <ChatRow icon={Pin} label={t.pinnedArtifact} active />
        </Group>
        <NavRow icon={Waypoints} label={t.nav.agents} />
        <NavRow icon={Clock} label={t.nav.scheduled} />
      </div>

      <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-y-auto">
        <SectionLabel
          label={t.projectsLabel}
          action={{ icon: Plus, label: t.newProject }}
        />
        <div className="flex flex-col gap-px px-2">
          {t.projects.map((p, i) =>
            i === 0 ? (
              <Group key={p.name} icon={FolderOpen} label={p.name}>
                {p.chats.map((c) => (
                  <ChatRow key={c} label={c} />
                ))}
              </Group>
            ) : (
              <NavRow key={p.name} icon={Folder} label={p.name} />
            ),
          )}
        </div>

        <SectionLabel label={t.recentsLabel} className="mt-5" />
        <div className="flex flex-col gap-px px-2">
          {t.recents.map((c) => (
            <ChatRow key={c} label={c} />
          ))}
        </div>
      </div>

      {/* Account footer under a hairline: name over email, as in Cowork. It sits
          INSET from the shell's bottom-left corner, so that corner of its hover
          is concentric with the shell's, like the white layer's. */}
      <div className="mx-2 mt-2 border-t border-white/[0.07] pt-2">
        <button
          type="button"
          className="a2a-nav-btn flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left"
          style={{ borderBottomLeftRadius: SHELL_RADIUS - INSET }}
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/15 text-[11px] font-semibold text-white/90">
            {t.user.initials}
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[13px] text-white/90">
              {t.user.name}
            </span>
            <span className="truncate text-[11.5px] text-white/45">
              {t.user.email}
            </span>
          </span>
        </button>
      </div>
    </nav>
  );
}

function IconButton({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Tooltip label={label}>
      <button
        type="button"
        aria-label={label}
        className="a2a-nav-btn grid size-8 place-items-center rounded-md text-white/60 hover:text-white"
      >
        <Icon className="size-[18px]" strokeWidth={2} />
      </button>
    </Tooltip>
  );
}

function SectionLabel({
  label,
  action,
  className = "",
}: {
  label: string;
  action?: { icon: LucideIcon; label: string };
  className?: string;
}) {
  return (
    <div
      className={`flex h-7 items-center justify-between pl-4 pr-3 ${className}`}
    >
      <span className="text-[12px] font-medium text-white/40">{label}</span>
      {action && (
        <Tooltip label={action.label}>
          <button
            type="button"
            aria-label={action.label}
            className="a2a-nav-btn grid size-6 place-items-center rounded-md text-white/45 hover:text-white"
          >
            <action.icon className="size-3.5" strokeWidth={2} />
          </button>
        </Tooltip>
      )}
    </div>
  );
}

function NavRow({
  icon: Icon,
  label,
  active,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      className={`a2a-nav-btn flex h-8 items-center gap-2.5 rounded-md px-2 text-left ${active ? "a2a-nav-active text-white" : "hover:text-white/90"}`}
    >
      <Icon className="size-4 shrink-0" strokeWidth={2} />
      <span className="truncate">{label}</span>
    </button>
  );
}

/**
 * An open item: its row, then its children indented under a guide line that
 * drops from the icon to the last child, clear of both ends.
 */
function Group({
  icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-px">
      <NavRow icon={icon} label={label} />
      <div className="relative flex flex-col gap-px pl-[26px]">
        <span
          className="absolute bottom-1.5 left-4 top-1 w-px bg-white/[0.12]"
          aria-hidden
        />
        {children}
      </div>
    </div>
  );
}

/** A chat (or pinned item, its icon filled): label only, long ones fading into the right edge (Cowork's recents). */
function ChatRow({
  label,
  icon: Icon,
  active,
}: {
  label: string;
  icon?: LucideIcon;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      className={`a2a-nav-btn flex h-8 items-center gap-2 rounded-md px-2 text-left ${active ? "a2a-nav-active text-white" : "hover:text-white/90"}`}
    >
      {Icon && (
        <Icon
          className="size-3.5 shrink-0"
          strokeWidth={2}
          fill="currentColor"
        />
      )}
      <span className="a2a-fade-end min-w-0 flex-1 overflow-hidden whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}
