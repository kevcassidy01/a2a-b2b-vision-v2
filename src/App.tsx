import { useState } from "react";
import { Briefcase, ChevronDown, CodeXml, Download, FileText, PanelLeft, Package2, Plus, Shapes, SlidersVertical } from "lucide-react";
import { AccountMenu } from "./shell/AccountMenu";
import { ChatCodeToggle } from "./shell/ChatCodeToggle";
import { ChatTitleMenu } from "./shell/ChatTitleMenu";
import { Composer } from "./shell/Composer";
import { NavItem } from "./shell/NavItem";
import { PromptChips } from "./shell/PromptChips";
import { RecentItem } from "./shell/RecentItem";
import { SearchBar } from "./shell/SearchBar";
import { Separator } from "./shell/Separator";
import { Tooltip } from "./shell/Tooltip";
import { IncognitoIcon } from "./shell/icons/IncognitoIcon";
import { ChatStage } from "./chat/ChatStage";
import { FilePreview } from "./chat/FilePreview";
import { FullScreenApp } from "./chat/FullScreenApp";
import { EXPERIENCES, EXPERIENCE_ORDER } from "./chat/experiences";
import { useActiveChat, useChat, useNextDictation } from "./chat/store";
import { copy } from "./copy/copy";

/**
 * App — the shell.
 *
 * Sidenav (collapse toggle + "Claude" wordmark) ↔ vertical Separator ↔ main
 * region that swaps between the empty/greeting state and the chat transcript.
 *
 * Journey model (this build has no new-chat creation): the sidenav holds three
 * fixed chats, one per authored experience (Quote approval / Checkout anywhere
 * / Merchant insights). Those rows ARE the journey selector — clicking one arms
 * that experience in the store and shows its chat as it was left (the greeting
 * if it hasn't started). The armed journey decides which script `send`
 * dispatches to.
 *   - Load → the default journey, greeting box.
 *   - Pick a sidenav chat → that journey is armed; its chat is as it was left,
 *     scrolled where it was, every card as clicked (each started chat stays
 *     mounted, hidden while another is shown). A refresh starts all three
 *     from scratch.
 *   - First send → the main stage **instantly swaps** to the chat transcript
 *     (`ChatStage`), the typed text lands as a user bubble, and the thinking
 *     state plays before the scripted response.
 *   - "New" → restarts the currently armed journey from scratch; the other
 *     two keep theirs.
 * The transcript + armed journey live in the `useChat` store; App owns only the
 * sidebar chrome and decides which view the main stage shows.
 */
export default function App() {
  // Remount key for the greeting composer — bumped on a journey switch so the
  // box clears any typed text.
  const [composerKey, setComposerKey] = useState(0);
  // Sidenav collapse — icon-only rail when true. Presentational chrome state.
  const [navCollapsed, setNavCollapsed] = useState(false);

  // Transcript store — the conversation itself. `started` drives the empty →
  // chat view swap; `send` posts a message; `selectExperience` arms a journey.
  const send = useChat((s) => s.send);
  // The prompt boxes' sends: typed or dictated, each one the mic's next step.
  const chatSend = (text: string) => send(text, undefined, true);
  const activeExperience = useChat((s) => s.activeExperience);
  const selectExperience = useChat((s) => s.selectExperience);
  const resetChat = useChat((s) => s.reset);
  const started = useActiveChat().messages.length > 0;
  // Which journeys' chats have started — each stays mounted once it has.
  const startedIds = useChat((s) => EXPERIENCE_ORDER.filter((id) => s.chats[id].messages.length > 0).join(","));
  // The mic's next line (the journey's prompts, dictated instead of typed).
  const dictation = useNextDictation();
  // Created files: the top bar gets a doc icon that reopens the latest one in
  // the side preview (claude.ai's artifacts button); Share hides while it's open.
  const preview = useChat((s) => s.preview);
  const openPreview = useChat((s) => s.openPreview);
  const latestFile = useChat((s) => {
    const messages = s.chats[s.activeExperience].messages;
    for (let i = messages.length - 1; i >= 0; i--) {
      const f = messages[i].blocks.find((b) => b.type === "file");
      if (f && f.type === "file") return f.file;
    }
    return null;
  });

  // Pick a journey from the sidenav: arm it (its chat as it was left), and
  // remount the greeting composer so stale text is dropped.
  const selectChat = (id: typeof activeExperience) => {
    selectExperience(id);
    setComposerKey((k) => k + 1);
  };
  // "New": restart the armed journey from scratch.
  const newChat = () => {
    resetChat();
    setComposerKey((k) => k + 1);
  };

  // The armed journey's title fills the top bar once the chat has started.
  const activeTitle = EXPERIENCES[activeExperience].title;

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={`flex shrink-0 flex-col bg-sidenav transition-[width] duration-[var(--dur-base)] ease-[var(--ease-out)] ${
          navCollapsed ? "w-16" : "w-[288px]"
        }`}
      >
        {/* Top flow section. Clipped only when expanded so the width-grow
            animation can't spill past the rail; left un-clipped when collapsed
            so the icon-rail tooltips can escape to the right. The account
            footer sits OUTSIDE this wrapper so its popover is never clipped. */}
        <div className={`flex flex-col ${navCollapsed ? "" : "overflow-hidden"}`}>
        <div
          className={`flex items-center pt-4 ${
            navCollapsed ? "justify-center px-2" : "gap-1.5 px-3"
          }`}
        >
          <Tooltip label={copy.shell.toggleSidebar} align="start">
            <button
              type="button"
              aria-label={copy.shell.toggleSidebar}
              onClick={() => setNavCollapsed((v) => !v)}
              className="grid size-8 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text"
            >
              <PanelLeft className="size-[18px]" strokeWidth={2} />
            </button>
          </Tooltip>
          {!navCollapsed && (
            <>
              <span className="font-serif text-[18px] font-medium leading-none text-text">
                {copy.shell.wordmark}
              </span>
              {/* Chat/Code switcher — pinned to the sidebar's right edge. */}
              <div className="ml-auto">
                <ChatCodeToggle />
              </div>
            </>
          )}
        </div>

        {/* Search field — presentational (no search behavior yet). Hidden in
            the collapsed rail. */}
        {!navCollapsed && (
          <div className="mt-3 px-3">
            <SearchBar />
          </div>
        )}

        {/* Top nav group. Icons are Lucide approximations of Claude's custom
            glyphs; labels + routing are presentational for now. */}
        <nav
          className={`mt-2 flex flex-col ${
            navCollapsed ? "items-center gap-1 px-2" : "px-3"
          }`}
        >
          <NavItem
            icon={Plus}
            label={copy.shell.nav.new}
            active
            shortcut={copy.shell.shortcuts.new}
            onClick={newChat}
            collapsed={navCollapsed}
          />
          <NavItem
            icon={Package2}
            label={copy.shell.nav.projects}
            shortcut={copy.shell.shortcuts.projects}
            collapsed={navCollapsed}
          />
          <NavItem
            icon={Shapes}
            label={copy.shell.nav.artifacts}
            shortcut={copy.shell.shortcuts.artifacts}
            collapsed={navCollapsed}
          />
          <NavItem
            icon={CodeXml}
            label={copy.shell.nav.code}
            shortcut={copy.shell.shortcuts.code}
            collapsed={navCollapsed}
          />
          <NavItem
            icon={Briefcase}
            label={copy.shell.nav.customize}
            collapsed={navCollapsed}
          />
        </nav>

        {/* Recents caption + list — hidden in the collapsed rail (icons only). */}
        {!navCollapsed && (
          <>
            {/* Recents section caption + preferences (list of chats/tasks next). */}
            <div className="mt-7 flex items-center justify-between px-5 pb-1">
              <span className="flex w-fit cursor-pointer items-center gap-0.5 text-[14px]/[16px] font-normal text-text-subtle transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-text-muted">
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

            {/* Recents list — the three fixed journey chats. Clicking one arms
                that experience, its chat as it was left; the armed one shows
                the selected wash. These replace the new-chat recents history. */}
            <nav className="mt-1 flex flex-col gap-0.5 px-3">
              {EXPERIENCE_ORDER.map((id) => (
                <RecentItem
                  key={id}
                  label={EXPERIENCES[id].title}
                  active={id === activeExperience}
                  onClick={() => selectChat(id)}
                />
              ))}
            </nav>

            {/* Dummy past chats — set off from the journeys by a hairline. */}
            <div className="my-2 px-5">
              <Separator orientation="horizontal" />
            </div>
            <nav className="flex flex-col gap-0.5 px-3">
              {copy.shell.pastChats.map((label) => (
                <RecentItem key={label} label={label} />
              ))}
            </nav>
          </>
        )}
        </div>

        {/* Account footer — separated from the recents above. Identity
            (avatar + email) with dummy chevron / download affordances. */}
        <div className="mt-auto">
          <Separator orientation="horizontal" />
          <div
            className={`flex items-center pb-3 pt-2 ${
              navCollapsed ? "justify-center px-2" : "gap-1 px-3"
            }`}
          >
            {/* Identity — full row (avatar + email + chevron) when expanded,
                avatar-only in the collapsed rail; opens the account menu. */}
            <AccountMenu collapsed={navCollapsed} />
            {/* Download — a proper 32px icon button (the norm). Hidden when
                collapsed to keep the rail icons-only. */}
            {!navCollapsed && (
              <button
                type="button"
                aria-label={copy.shell.account.download}
                className="grid size-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text"
              >
                <Download className="size-[18px]" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </aside>
      <Separator />
      {/* Main stage + the file preview panel beside it (when a file is open). */}
      <div className="flex min-w-0 flex-1 overflow-hidden">
      {/* Main stage — swaps between the empty/greeting state and the chat
          transcript (`ChatStage`). `started` drives the swap; "New" resets it.
          `relative` + `overflow-hidden` make this the scroll viewport: the
          transcript scrolls *inside* here, behind the top + bottom safe areas.
          Every started journey's stage stays mounted; the others are hidden
          (`invisible` keeps their scroll position) until armed again. */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-bg">
        {startedIds &&
          startedIds.split(",").map((id) => {
            const shown = id === activeExperience;
            return (
              <div key={id} aria-hidden={!shown} className={`absolute inset-0 ${shown ? "" : "invisible"}`}>
                <ChatStage journey={id as typeof activeExperience} shown={shown} onSend={chatSend} />
              </div>
            );
          })}
        {!started && (
          <div className="flex flex-1 flex-col items-center justify-center pb-24">
            <div className="w-full max-w-[820px] px-4">
              <div className="flex items-center justify-center gap-3">
                {/* Clay spark — placeholder asset; swap for the hand-made SVG later. */}
                <img src="/favicon.webp" alt="" aria-hidden className="size-8" />
                <h1 className="font-serif text-[32px] font-normal leading-none text-text">
                  {copy.shell.greeting.timeOfDay} {copy.shell.account.name}
                </h1>
              </div>
              <div className="mt-8 w-full">
                <Composer key={composerKey} onSend={chatSend} chatDictation={dictation} />
                <PromptChips />
              </div>
            </div>
          </div>
        )}

        {/* Top safe area — overlays the scrolling transcript. Once a chat has
            started: a gradient mask fades content out under the bar, the title
            (+ menu) on the left once its title resolves, and a Share button on
            the right. Otherwise the empty-state incognito (ghost) button. */}
        {started ? (
          <>
            {/* Mask so the transcript fades out behind the title / Share. */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-20 bg-gradient-to-b from-bg via-bg to-transparent" />
            <div className="absolute left-4 top-4 z-10">
              <ChatTitleMenu title={activeTitle} />
            </div>
            {/* Files + Share — 28px small button variants (vs the 32px
                icon-button norm). Both give way to the preview panel's header. */}
            {!preview && (
              <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5">
                {latestFile && (
                  <Tooltip label="Files" side="bottom" align="end">
                    <button
                      type="button"
                      aria-label="Files"
                      onClick={() => openPreview(latestFile)}
                      className="grid size-7 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text"
                    >
                      <FileText className="size-[18px]" strokeWidth={2} />
                    </button>
                  </Tooltip>
                )}
                <button
                  type="button"
                  className="flex h-7 items-center rounded-md border border-prompt-border bg-bg px-2.5 text-[14px] text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text"
                >
                  {copy.shell.share}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="absolute right-3 top-3 z-10">
            <Tooltip label={copy.shell.incognito} side="bottom" align="end">
              <button
                type="button"
                aria-label={copy.shell.incognito}
                className="grid size-8 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text"
              >
                <IncognitoIcon className="size-[18px]" />
              </button>
            </Tooltip>
          </div>
        )}

        {/* Full-screen app — takes over the stage when a slot is expanded; the
            transcript stays mounted underneath. Prompts route to the store. */}
        <FullScreenApp onSend={chatSend} />
      </div>
      <FilePreview />
      </div>
    </div>
  );
}
