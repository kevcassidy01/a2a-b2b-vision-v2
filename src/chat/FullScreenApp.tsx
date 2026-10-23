import { useEffect } from "react";
import { X } from "lucide-react";
import { InChatComposer } from "../shell/InChatComposer";
import { AppLogo } from "./CardShell";
import { ExportShareButtons } from "./ExportShare";
import { SlotContent } from "./SlotContent";
import { useChat, useNextDictation } from "./store";

/**
 * FullScreenApp — the expanded view of an `expandable` card / floating slot
 * (Figma 467-39705). It takes over the main stage while the transcript stays
 * mounted underneath; closing returns to the exact same scroll position.
 *
 * The **host owns three things** (everything between is the app's own content,
 * a reserved placeholder for now):
 *   1. The surface — a 12px-inset, rounded, bordered panel over the stage.
 *   2. The app header (64px) — logo badge + name on the left; Share + Export
 *      report (when the slot opts in with `exportAs`) and a close X on the
 *      right (the collapse control).
 *   3. The prompt bar — pinned at the bottom in a safe inset, centered (~752px)
 *      with an app-contextual placeholder. A prompt sent here posts to the same
 *      chat and closes the overlay, so the answer lands in the transcript.
 *
 * Mounts inside the main stage (`onSend` routes to the shell's `sendMessage`, so
 * full-screen prompts run the same bookkeeping as any chat message). Renders
 * nothing when no slot is expanded.
 */
export function FullScreenApp({ onSend }: { onSend: (text: string) => void }) {
  const expanded = useChat((s) => s.expanded);
  const close = useChat((s) => s.closeFullscreen);
  const runAction = useChat((s) => s.runAction);
  const dictation = useNextDictation();

  // Escape collapses back to the transcript.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded, close]);

  if (!expanded) return null;
  const { app, exportAs } = expanded;

  return (
    // Opaque fill so the transcript underneath (incl. the 12px gutter) is hidden.
    <div className="absolute inset-0 z-30 bg-bg">
      {/* The app surface — 12px inset, host-owned frame. */}
      <div className="absolute inset-3 flex flex-col overflow-hidden rounded-xl border border-prompt-border bg-surface">
        {/* App header — 64px: identity left, close (collapse) right. */}
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-4">
          <AppLogo app={app} />
          <span className="text-[16px] font-medium text-text">{app.name}</span>
          {exportAs && (
            <div className="ml-auto mr-2">
              <ExportShareButtons onExport={() => runAction(`export|${exportAs.title}|${exportAs.id}`)} />
            </div>
          )}
          <button
            type="button"
            aria-label="Close full screen"
            onClick={close}
            className={`${exportAs ? "" : "ml-auto "}grid size-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text`}
          >
            <X className="size-[18px]" strokeWidth={2} />
          </button>
        </div>

        {/* Content region — a non-scrolling positioning layer that holds the
            scroll container and the prompt bar as SIBLINGS, so the body scrolls
            behind a prompt bar that stays pinned (same pattern as ChatStage).
            `min-h-0` lets it shrink so its child, not the panel, does the
            scrolling. */}
        <div className="relative min-h-0 flex-1">
          {/* Scroll container — the app's own surface; scrolls behind the prompt
              bar. The reserved placeholder fills it for now; real widgets mount
              here later, following the slot type scale. `pb` reserves clearance
              so content scrolls fully clear of the floating prompt bar. */}
          <div className="absolute inset-0 overflow-y-auto">
            <div className="flex min-h-full flex-col p-6 pb-32">
              {expanded.view ? (
                <div className="mx-auto w-full max-w-[900px]">
                  <SlotContent view={expanded.view} fullscreen />
                </div>
              ) : (
                <div className="grid flex-1 place-items-center rounded-lg border border-dashed border-danger bg-slot-placeholder text-[13px] font-medium text-danger">
                  App content
                </div>
              )}
            </div>
          </div>

          {/* Prompt bar — pinned at the bottom in a safe inset, centered, and
              never scrolls. A gradient fades content out behind it. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-6 pt-12 bg-gradient-to-t from-surface from-40% to-transparent">
            <div className="pointer-events-auto mx-auto max-w-[752px]">
              <InChatComposer onSend={onSend} placeholder={`Ask ${app.name}`} hideMeta chatDictation={dictation} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
