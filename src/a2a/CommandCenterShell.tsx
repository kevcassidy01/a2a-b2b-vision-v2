import {
  Clock,
  Folder,
  FolderOpen,
  PanelLeft,
  Pin,
  Plus,
  Search,
  Shapes,
  type LucideIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import alex from "../assets/a2a/alex.png";
import { copy } from "../copy/copy";
import { GlassPanel } from "./GlassPanel";
import { Tooltip } from "./Tooltip";

const t = copy.a2a.shell;

/** The shell's corner, and the white layer's (the gap between them stays even round the curve). */
const SHELL_RADIUS = 22;
const INSET = 8;

/** Projects shown in full, then the last two, which start the sidenav's fade. */
const lead = t.projects.slice(0, -2);
const tail = t.projects.slice(-2);

/**
 * Below this window width (13" and 14" laptops) the sidenav is an icon rail
 * from the start, leaving the room to the Command Center. There's no toggle:
 * nobody should have to collapse it before the layout holds.
 */
const RAIL_BELOW = 1536;
const RAIL_QUERY = `(max-width: ${RAIL_BELOW - 1}px)`;

/** Whether the window's narrow enough for the rail, kept up to date as it's resized. */
function useRail() {
  const [rail, setRail] = useState(() => matchMedia(RAIL_QUERY).matches);
  useEffect(() => {
    const mq = matchMedia(RAIL_QUERY);
    const onChange = () => setRail(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return rail;
}

/**
 * CommandCenterShell — the right half: a generic AI chat app (not Claude,
 * Cowork or ChatGPT), shaped like Dia: one dark-mode glass window whose own
 * surface is the sidenav, with a white layer inset on the right. The white
 * layer's edge is the only thing separating the two. The Command Center fills
 * the white layer edge to edge (A2A_INTENT §4).
 */
export function CommandCenterShell({ children, window }: { children?: ReactNode; window?: boolean }) {
  const rail = useRail();
  const mark = window ? <Lights /> : <span className="a2a-orb size-[28px]" aria-hidden />;
  return (
    <GlassPanel radius={SHELL_RADIUS} className="h-full min-w-0 flex-1">
      <div className="flex h-full">
        {rail ? <Rail mark={mark} wide={window} /> : <Sidenav mark={mark} wide={window} />}
        <main
          className="a2a-white-layer a2a-content min-w-0 flex-1 overflow-hidden bg-surface"
          style={{
            margin: `${INSET}px ${INSET}px ${INSET}px 0`,
            borderRadius: SHELL_RADIUS - INSET,
          }}
        >
          {children}
        </main>
      </div>
    </GlassPanel>
  );
}

/**
 * A Mac window's close, minimise and zoom lights, for the shell shown as its
 * own window (/seller). Set dressing, so not buttons. Inset as far from the
 * window's left edge as from its top (20px).
 */
function Lights() {
  return (
    <span className="flex h-[28px] items-center gap-2" aria-hidden>
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <span key={c} className="size-3 rounded-full shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.25)]" style={{ background: c }} />
      ))}
    </span>
  );
}

function Sidenav({ mark, wide }: { mark: ReactNode; wide?: boolean }) {
  return (
    <nav className="flex w-[232px] shrink-0 flex-col pb-2 pt-3 text-[13.5px] text-white/55">
      {/* Header: the app mark (or a window's lights), then search and collapse (Cowork's header icons). */}
      <div className="flex items-center gap-0.5 px-3">
        <span className={`mr-auto flex ${wide ? "pl-2" : ""}`}>{mark}</span>
        <IconButton icon={Search} label={t.search} />
        <IconButton icon={PanelLeft} label={t.collapse} />
      </div>

      <div className="mt-3 flex flex-col gap-px px-2">
        <NavRow icon={Plus} label={t.nav.newChat} />
        <Group icon={Shapes} label={t.nav.artifacts}>
          <ChatRow icon={Pin} label={t.pinnedArtifact} active />
        </Group>
        <NavRow icon={Clock} label={t.nav.scheduled} />
      </div>

      <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-y-auto">
        <SectionLabel
          label={t.projectsLabel}
          action={{ icon: Plus, label: t.newProject }}
        />
        <div className="flex flex-col gap-px px-2">
          {lead.map((p, i) =>
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

        {/* Set dressing from here down: the last two folders and the recents fade
            out, so the eye stays on the Command Center. */}
        <div className="a2a-fade-down mt-px">
          <div className="flex flex-col gap-px px-2">
            {tail.map((p) => (
              <NavRow key={p.name} icon={Folder} label={p.name} />
            ))}
          </div>
          <SectionLabel label={t.recentsLabel} className="mt-5" />
          <div className="flex flex-col gap-px px-2">
            {t.recents.map((c) => (
              <ChatRow key={c} label={c} />
            ))}
          </div>
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
          <img src={alex} alt="" className="size-7 shrink-0 rounded-full bg-[#e3effc] object-cover" />
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

/**
 * The sidenav on smaller screens: its icons only, each named in a tooltip at
 * its right. The app mark and search; the nav, with Artifacts current (the
 * Command Center's pinned there); Projects; Alex at the foot. The chats and
 * recents are set dressing, so they go.
 */
/** `wide` makes room for a window's lights, inset as on a Mac, with the white layer's gap after them. */
function Rail({ mark, wide }: { mark: ReactNode; wide?: boolean }) {
  return (
    <nav className={`flex ${wide ? "w-[80px]" : "w-[56px]"} shrink-0 flex-col items-center pb-2 pt-3 text-white/55`}>
      {wide ? <span className="flex self-start pl-5">{mark}</span> : mark}
      <div className="mt-2">
        <IconButton icon={Search} label={t.search} side="right" />
      </div>
      <div className="mt-3 flex flex-col gap-px">
        <RailItem icon={Plus} label={t.nav.newChat} />
        <RailItem icon={Shapes} label={t.nav.artifacts} active />
        <RailItem icon={Clock} label={t.nav.scheduled} />
      </div>
      <div className="mt-3 w-6 border-t border-white/[0.07] pt-3" aria-hidden />
      <RailItem icon={Folder} label={t.projectsLabel} />
      <div className="mt-auto w-10 border-t border-white/[0.07] pt-2">
        <Tooltip label={t.user.name} side="right">
          <button
            type="button"
            aria-label={t.user.name}
            className="a2a-nav-btn grid size-10 place-items-center rounded-md"
            style={{ borderBottomLeftRadius: SHELL_RADIUS - INSET }}
          >
            <img src={alex} alt="" className="size-7 rounded-full bg-[#e3effc] object-cover" />
          </button>
        </Tooltip>
      </div>
    </nav>
  );
}

/** A rail icon: 36px, the nav row's look, named in its tooltip. */
function RailItem({ icon: Icon, label, active }: { icon: LucideIcon; label: string; active?: boolean }) {
  return (
    <Tooltip label={label} side="right">
      <button
        type="button"
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={`a2a-nav-btn grid size-9 place-items-center rounded-md ${active ? "a2a-nav-active text-white" : "hover:text-white/90"}`}
      >
        <Icon className="size-4" strokeWidth={2} />
      </button>
    </Tooltip>
  );
}

function IconButton({
  icon: Icon,
  label,
  side,
}: {
  icon: LucideIcon;
  label: string;
  side?: "bottom" | "right";
}) {
  return (
    <Tooltip label={label} side={side}>
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
