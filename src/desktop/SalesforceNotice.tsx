import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { copy } from "../copy/copy";
import { useCoworkChat } from "./cowork/chat/store";
import { SlackLogo } from "./SlackBanner";

/** How long a banner stays before it slides away, as macOS banners do. */
const SHOW_MS = 6000;

/**
 * SalesforceNotice — a Slack banner from the Salesforce app each time a live
 * agent acts (useCoworkChat's `notices`), built like SlackBanner: Aaron gets
 * Claude's daily brief on Slack, and Salesforce's agent updates there too. The
 * body is what the agent did. Unlike the daily brief (Ctrl+S) it comes on its
 * own and times out, since the agent posts more than once. It leaves the way
 * it came in, sliding back out to the right.
 */
export function SalesforceNotice() {
  const t = copy.desktop.salesforceNotice;
  const notices = useCoworkChat((s) => s.notices);
  const body = useCoworkChat((s) => s.noticeText);
  // Usually Salesforce; a reminder Claude sets comes from Slackbot.
  const sender = useCoworkChat((s) => s.noticeFrom) ?? t.sender;
  // "out" plays the slide back out, then the banner unmounts.
  const [phase, setPhase] = useState<"hidden" | "in" | "out">("hidden");

  useEffect(() => {
    if (!notices) return;
    setPhase("in");
    const timer = window.setTimeout(() => setPhase("out"), SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [notices]);

  if (phase === "hidden") return null;

  return (
    <div
      key={notices}
      onAnimationEnd={(e) => e.target === e.currentTarget && phase === "out" && setPhase("hidden")}
      className={`group ${phase === "out" ? "animate-banner-out" : "animate-banner-in"} fixed right-3 top-[44px] z-50 w-[356px] [font-family:-apple-system,BlinkMacSystemFont,'SF_Pro_Text',Inter,system-ui,sans-serif]`}
    >
      <div
        role="status"
        aria-label={`${t.app}: ${sender}. ${body}`}
        className="flex items-start gap-3 rounded-[22px] border border-white/15 bg-[rgba(18,18,20,0.88)] py-3.5 pl-3.5 pr-4 shadow-[0_10px_30px_rgba(0,0,0,0.3),inset_0_0.5px_0_rgba(255,255,255,0.12)] backdrop-blur-3xl backdrop-saturate-[1.8]"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-white">
          <SlackLogo className="size-[22px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[14px] font-semibold text-white">{sender}</span>
            <span className="shrink-0 text-[13px] text-white/55">{t.time}</span>
          </span>
          <span className="mt-0.5 line-clamp-3 block text-[14px] leading-[18px] text-white/90">{body}</span>
        </span>
      </div>
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
