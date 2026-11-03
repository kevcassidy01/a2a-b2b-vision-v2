import { Cloud, Copy, Ellipsis, RotateCw, Share, X, type LucideIcon } from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { copy } from "../copy/copy";
import { Tooltip } from "./Tooltip";

const t = copy.a2a.commandCenter.frame;

/** Lets the app inside say it's loading, so the frame runs its load line. */
const FrameLoading = createContext<(loading: boolean) => void>(() => {});

/** For the app inside the frame: while `loading`, the line sweeps along the bottom of the frame's bar. */
export function useFrameLoading(loading: boolean) {
  const setLoading = useContext(FrameLoading);
  useEffect(() => {
    setLoading(loading);
    return () => setLoading(false);
  }, [loading, setLoading]);
}

/**
 * ArtifactFrame — the host app's full-screen bar around an MCP app (the
 * Command Center): its title on the left; toward the right, when its data was
 * last updated, then Reload, Share and Pop out
 * with icon and label; then More and Close, icon only, at the far right. Host
 * chrome, not the app's content, so it stays plain and light. While the app
 * loads (`useFrameLoading`), a line sweeps along the bar's bottom edge, left
 * to right.
 */
export function ArtifactFrame({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="a2a-artifact flex h-full flex-col">
      <header className="relative flex h-11 shrink-0 items-center gap-1 border-b border-border pl-4 pr-2">
        <h2 className="mr-auto truncate text-[13.5px] font-medium text-text">
          {t.title}
        </h2>
        {/* Quiet, lighter than the buttons: it's a note, not a control. */}
        <span className="mr-1.5 flex min-w-0 items-center gap-1.5 text-[12.5px] text-[#a1a1a6]">
          <Cloud className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="truncate">{t.updated}</span>
        </span>
        <BarAction icon={RotateCw} label={t.reload} />
        <BarAction icon={Share} label={t.share} />
        <BarAction icon={Copy} label={t.popOut} />
        <span className="mx-1 h-4 w-px bg-border" aria-hidden />
        <IconAction icon={Ellipsis} label={t.more} />
        <IconAction icon={X} label={t.close} />
        {loading && <span aria-hidden className="a2a-load-swipe absolute inset-x-0 -bottom-[1.5px] z-10 h-[3px]" />}
      </header>
      <FrameLoading.Provider value={setLoading}>
        <div className="relative min-h-0 flex-1 overflow-y-auto">{children}</div>
      </FrameLoading.Provider>
    </div>
  );
}

function BarAction({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button
      type="button"
      className="flex h-7 shrink-0 items-center gap-1.5 rounded-md pl-1.5 pr-2 text-[13px] text-text transition-colors duration-[var(--dur-fast)] hover:bg-black/[0.05]"
    >
      <Icon className="size-3.5" strokeWidth={2} />
      {label}
    </button>
  );
}

function IconAction({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <Tooltip label={label}>
      <button
        type="button"
        aria-label={label}
        className="grid size-7 shrink-0 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] hover:bg-black/[0.05] hover:text-text"
      >
        <Icon className="size-4" strokeWidth={2} />
      </button>
    </Tooltip>
  );
}
