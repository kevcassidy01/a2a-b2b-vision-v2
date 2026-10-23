import { useEffect, useState, type CSSProperties } from "react";
import { copy } from "../copy/copy";
import { Separator } from "../shell/Separator";
import { CoworkHome } from "./cowork/CoworkHome";
import { CoworkSidebar, type CoworkPage, type FlowId } from "./cowork/CoworkSidebar";
import { AgentsPage } from "./cowork/AgentsPage";
import { CoworkChat } from "./cowork/chat/CoworkChat";
import { useCoworkChat } from "./cowork/chat/store";
import { ScheduledPage } from "./cowork/ScheduledPage";
import { SettingsModal } from "./cowork/settings/SettingsModal";
import { TrafficLights } from "./TrafficLights";

/**
 * CoworkWindow — the Claude desktop app's window frame (COWORK_INTENT §1.1, §3.3–3.4).
 *
 * Nearly fills the screen, as in the live app: a thin wallpaper margin all
 * round, and the desktop-icons column kept clear on the right. Title bar
 * only (no toolbar), as in the live app: a 40px strip with the traffic lights and "Claude",
 * a hairline under it, then the Cowork app: the sidenav and the main stage
 * (the start state for now). The app is built for this window, reusing the browser shell's parts.
 *
 * Active vs inactive (HIG): the key window has colored lights and a big, soft
 * shadow; inactive gets grey lights and a lighter, tighter shadow (~150ms).
 * Clicking the window makes it key; Desktop decides when it loses focus.
 */
const SHADOW_ACTIVE =
  "0 0 0 0.5px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.35), 0 22px 70px 4px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.18)";
const SHADOW_INACTIVE =
  "0 0 0 0.5px rgba(0,0,0,0.22), inset 0 0 0 1px rgba(255,255,255,0.25), 0 10px 32px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.12)";

/** Width the desktop-icons column keeps clear on the right (matches DesktopIcons). */
export const ICON_COLUMN_WIDTH = 120;
/** Wallpaper margin around the window (left, top, bottom). */
const WINDOW_MARGIN = 16;

export function CoworkWindow({ active, onActivate }: { active: boolean; onActivate: () => void }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  // The run of show's sessions: which one is open (null = New) and which have started.
  const [selected, setSelected] = useState<FlowId | null>(null);
  const [started, setStarted] = useState<FlowId[]>([]);
  // A nav page open in the main stage instead of a session (null = none).
  const [page, setPage] = useState<CoworkPage | null>(null);

  // Sending starts the open session: an agent's "New session" row starts that
  // agent, and New starts the Canary Wharf chat (Aaron drops the files there), so
  // each mic dictates only its own prompt. The brief starts from the Scheduled
  // page's Daily briefing template (decision 54).
  const flows = copy.desktop.cowork.flows.items;
  const current = selected
    ? flows.find((f) => f.id === selected)
    : flows.find((f) => f.id === "prestige" && !started.includes(f.id)) ??
      flows.find((f) => f.kind === "agent" && !started.includes(f.id));
  const startChat = useCoworkChat((s) => s.start);
  const onSend = (files: string[] = []) => {
    if (!current) return;
    const id = current.id;
    // The hesitation marks (|) are for the dictation only.
    startChat(id, current.prompt.replace(/\s*\|\s*/g, " "), files);
    setSelected(id);
    setStarted((s) => (s.includes(id) ? s : [...s, id]));
  };
  const startBrief = () => {
    startChat("brief", copy.desktop.cowork.scheduledPage.briefingPrompt);
    setPage(null);
    setSelected("brief");
    setStarted((s) => (s.includes("brief") ? s : [...s, "brief"]));
  };

  // Opening another session's artifact from the panel goes to that session's chat.
  const opened = useCoworkChat((s) => s.opened);
  const closeArtifact = useCoworkChat((s) => s.closeArtifact);
  const openArtifact = useCoworkChat((s) => s.openArtifact);
  useEffect(() => {
    if (!opened) return;
    setPage(null);
    setSelected(opened.flow);
  }, [opened]);

  // The session on screen, so the sidenav doesn't badge or dot the one Aaron is reading.
  const setViewing = useCoworkChat((s) => s.setViewing);
  const viewing = page === null && selected && started.includes(selected) ? selected : null;
  useEffect(() => setViewing(viewing), [viewing, setViewing]);

  return (
    <div
      onPointerDown={onActivate}
      className="animate-window-open absolute flex flex-col overflow-hidden rounded-[24px] bg-bg transition-shadow duration-150"
      style={{
        // A thin margin on the left, top (under the 32px menu bar) and bottom; the icon column on the right.
        left: WINDOW_MARGIN,
        right: ICON_COLUMN_WIDTH,
        top: 32 + WINDOW_MARGIN,
        bottom: WINDOW_MARGIN,
        boxShadow: active ? SHADOW_ACTIVE : SHADOW_INACTIVE,
        // Desktop apps run smaller: 14px UI text instead of the browser's 15px...
        "--text-ui": "14px",
        // ...and tighter sidebar rows: 28px instead of 32px.
        "--spacing-row": "28px",
        // ...and 8px more air between the prompt text and the prompt box's footer row.
        "--composer-gap": "12px",
      } as CSSProperties}
    >
      {/* Above the Settings dim, so the traffic lights stay lit, as on a Mac. */}
      <div className="relative z-50 flex h-10 shrink-0 items-center px-[18px]">
        <TrafficLights active={active} />
        {/* The window title in the Mac system font, dimmed when the window isn't key. */}
        <span
          className={`ml-4 select-none text-[13px] font-semibold [font-family:-apple-system,BlinkMacSystemFont,'SF_Pro_Text',Inter,system-ui,sans-serif] transition-colors duration-150 ${active ? "text-text" : "text-text-subtle"}`}
        >
          {copy.desktop.window.title}
        </span>
      </div>
      <Separator orientation="horizontal" />
      <div className="flex min-h-0 flex-1">
        <CoworkSidebar
          selected={selected}
          started={started}
          page={page}
          onSelect={(id) => {
            closeArtifact();
            setPage(null);
            setSelected(id);
          }}
          onOpenPage={setPage}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <Separator />
        {page === "agents" ? (
          <AgentsPage
            onOpen={(id) => {
              setPage(null);
              setSelected(id);
            }}
          />
        ) : page === "scheduled" ? (
          <ScheduledPage
            onStart={startBrief}
            onOpenTask={() => {
              setPage(null);
              setSelected("brief");
              // Once the morning's run has landed, the card opens the brief itself, full screen.
              if (useCoworkChat.getState().ran.includes("brief")) openArtifact("brief", copy.desktop.slackBanner.opens);
            }}
          />
        ) : selected && started.includes(selected) ? (
          <CoworkChat key={selected} flow={selected} />
        ) : (
          // Keyed by session, so each one opens on a fresh start state.
          <CoworkHome key={selected ?? "new"} onSend={onSend} dictation={current?.prompt} />
        )}
      </div>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
