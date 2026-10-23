import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { copy } from "../copy/copy";
import { useCoworkChat } from "./cowork/chat/store";

/**
 * SlackBanner — a macOS notification from Slack, top right (decision 47). Dark,
 * like the Mac around it (the window stays light), as in the live banner
 * (Somnath's screenshot, 2026-10-12).
 *
 * The presenter pops it with Ctrl+S whenever the story's ready for it (there's
 * no timer). Ctrl+S types nothing, so it works even with the prompt box
 * focused. It stays until closed (the ✕ on hover), so the presenter isn't
 * racing it. Closing slides it back out to the right, the way it came.
 *
 * It's the next morning's (decision 54): if the brief is scheduled, Ctrl+S
 * also runs it (the store lands the run in the brief's session and the
 * menu-bar clock jumps to Thursday 15 October). The banner is Slack's, so
 * clicking it doesn't open Cowork: it just goes, and Aaron opens the brief
 * from its card on Scheduled.
 */
export function SlackBanner() {
  // "out" plays the slide back out, then the banner unmounts.
  const [phase, setPhase] = useState<"hidden" | "in" | "out">("hidden");
  const t = copy.desktop.slackBanner;
  const runTask = useCoworkChat((s) => s.runTask);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyS" || !e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.repeat) return;
      e.preventDefault();
      runTask("brief");
      setPhase("in");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runTask]);

  if (phase === "hidden") return null;

  return (
    <div
      onAnimationEnd={(e) => e.target === e.currentTarget && phase === "out" && setPhase("hidden")}
      className={`group ${phase === "out" ? "animate-banner-out" : "animate-banner-in"} fixed right-3 top-[44px] z-50 w-[356px] [font-family:-apple-system,BlinkMacSystemFont,'SF_Pro_Text',Inter,system-ui,sans-serif]`}
    >
      <div
        role="status"
        aria-label={`${t.app}: ${t.sender}. ${t.body}`}
        onClick={() => setPhase("out")}
        className="flex items-start gap-3 rounded-[22px] border border-white/15 bg-[rgba(18,18,20,0.88)] py-3.5 pl-3.5 pr-4 shadow-[0_10px_30px_rgba(0,0,0,0.3),inset_0_0.5px_0_rgba(255,255,255,0.12)] backdrop-blur-3xl backdrop-saturate-[1.8]"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-white">
          <SlackLogo className="size-[22px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[14px] font-semibold text-white">{t.sender}</span>
            <span className="shrink-0 text-[13px] text-white/55">{t.time}</span>
          </span>
          <span className="mt-0.5 line-clamp-3 block whitespace-pre-line text-[14px] leading-[18px] text-white/90">{t.body}</span>
        </span>
      </div>
      {/* The close button on the top-left corner, on hover, as on a Mac. */}
      <button
        type="button"
        aria-label={t.close}
        onClick={() => setPhase("out")}
        className="absolute -left-1.5 -top-1.5 grid size-5 cursor-default place-items-center rounded-full border border-white/20 bg-[rgba(60,60,64,0.9)] text-white/85 opacity-0 shadow-[0_1px_3px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100"
      >
        <X className="size-3" strokeWidth={2.5} />
      </button>
    </div>
  );
}

/** Slack's four-color mark. */
export function SlackLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 122.8 122.8" className={className} aria-hidden>
      <path fill="#E01E5A" d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" />
      <path fill="#36C5F0" d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" />
      <path fill="#2EB67D" d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" />
      <path fill="#ECB22E" d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" />
    </svg>
  );
}
