import {
  Bell,
  CalendarDays,
  ExternalLink,
  RotateCw,
  Store,
  type LucideIcon,
} from "lucide-react";
import { type RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { copy } from "../../copy/copy";
import { Segmented } from "../../shell/Segmented";
import { ThemeSegmented } from "../../shell/ThemeSegmented";
import { useFrameLoading } from "../ArtifactFrame";
import { useStory } from "../story";
import { Tooltip } from "../Tooltip";
import { AgentButton, type AgentStatus } from "./AgentButton";
import { AgentDrawer } from "./AgentDrawer";
import { ActivityCard } from "./ActivityCard";
import { Campaigns } from "./Campaigns";
import { CheckoutFunnelCard } from "./CheckoutFunnelCard";
import { CommandCenterSkeleton } from "./CommandCenterSkeleton";
import { Confetti } from "./Confetti";
import { Converted } from "./Converted";
import { CurrencyMenu } from "./CurrencyMenu";
import { MetricTiles } from "./MetricTiles";
import { MonthlyRevenueCard } from "./MonthlyRevenueCard";
import { OrdersByCountryCard } from "./OrdersByCountryCard";
import { SourceMenu } from "./SourceMenu";
import { StoreMenu } from "./StoreMenu";
import { Today } from "./Today";
import { ViewPicker } from "./ViewPicker";
import { Welcome } from "./Welcome";
import { demoNow, demoTimeout } from "../demoClock";

const t = copy.a2a.commandCenter;
/** How long the Command Center loads, in ms (skeleton cards, the frame's load line), before it's ready. Matches .a2a-load-swipe. */
const LOAD = 1500;
/** If the quote's already in when the Command Center loads, its task card follows the cards this long after, in ms. */
const TODAY_AFTER = 700;
/** How long after John's agent sends its quote it lands here, in ms: a short hop, so the send and the arrival read as two moments. */
const QUOTE_GAP = 600;

/**
 * CommandCenter — Alex's B2B Command Center, the MCP app inside the artifact
 * frame. Light mode: white behind the header, fading into a pale grey canvas
 * for the white cards below. Built top to bottom a section at a time from the
 * engineering version; so far, the header.
 *
 * It opens on the Welcome (Alex has been away). See Command Center brings it
 * in: skeleton cards under the header while the frame's load line sweeps
 * along the bottom of its bar, edge to edge; then the real cards fade up.
 */
export function CommandCenter() {
  // On a jump: from step 5 the dashboard's up; from step 7 Alex has Q-1042 open in the drawer.
  const { from, quoteSent, counterSent, heldOut, askedAlex, v3Sent, accepted, ordered, setWorking } = useStory();
  const [phase, setPhase] = useState<"away" | "loading" | "ready">(from >= 5 ? "ready" : "away");
  const [agentOpen, setAgentOpen] = useState(from >= 7);
  // Once Alex opens Q-1042, the drawer holds the agent's chat about it from then on.
  const [quoteOpen, setQuoteOpen] = useState(from >= 7);
  const openQuote = useCallback(() => {
    setQuoteOpen(true);
    setAgentOpen(true);
  }, []);
  const closeAgent = useCallback(() => setAgentOpen(false), []);
  const stage = ordered ? "ordered" : accepted ? "accepted" : v3Sent ? "v3" : askedAlex ? "needsYou" : heldOut ? "heldOut" : counterSent ? "countered" : "request";
  const task = useTaskIn(phase === "ready", quoteSent, from >= 6);
  // The seller agent picks Q-1042 up as it lands, whether or not Alex has the Command Center open, and
  // stays at it until Alex opens it; from then on, its chat (QuoteThread) says when it's at work.
  useEffect(() => {
    if (!quoteSent || quoteOpen) return setWorking("alexAgent:inbox", false);
    return demoTimeout(() => setWorking("alexAgent:inbox", true), QUOTE_GAP);
  }, [quoteSent, quoteOpen, setWorking]);
  useEffect(() => {
    if (phase !== "loading") return;
    return demoTimeout(() => setPhase("ready"), LOAD);
  }, [phase]);
  useFrameLoading(phase === "loading");
  const canvas = useRef<HTMLDivElement>(null);
  const period = useRef<HTMLDivElement>(null);
  useFadeTo(canvas, period, phase);
  if (phase === "away") return <Welcome onLoad={() => setPhase("loading")} />;
  const loading = phase === "loading";
  return (
    <div className="absolute inset-0 overflow-hidden" aria-busy={loading}>
      <div ref={canvas} className="a2a-canvas a2a-no-scrollbar absolute inset-0 overflow-y-auto">
        <Header agentOpen={agentOpen} onAgent={() => setAgentOpen((o) => !o)} />
        <div className="a2a-dashboard-body relative flex flex-col gap-8 px-8 pb-8 pt-6">
          {loading ? (
            <CommandCenterSkeleton />
          ) : (
            <div className="a2a-load-in flex flex-col gap-8">
              {/* Today first, in its dashed frame; the agent's task joins its row when John's agent sends the quote. Then the campaigns, Isar's row following the quote; then the period, and the last 6 months. */}
              <Today task={task} stage={stage} onOpen={openQuote} />
              <Campaigns task={task} stage={stage} />
              <section className="flex flex-col gap-3">
                <Period ref={period} />
                <Heading {...t.sections.last6Months} />
                <MetricTiles />
                <OrdersByCountryCard />
                <MonthlyRevenueCard />
                <CheckoutFunnelCard />
                <ActivityCard />
              </section>
            </div>
          )}
        </div>
      </div>
      {/* While the agent's open, a dark glass scrim over the dashboard keeps the eye on the chat. Clicking it closes the drawer. */}
      <button
        type="button"
        aria-label={t.agent.close}
        tabIndex={-1}
        onClick={closeAgent}
        data-open={agentOpen || undefined}
        className="a2a-scrim absolute inset-0 z-[25]"
      />
      <AgentDrawer open={agentOpen} quote={quoteOpen} onClose={closeAgent} />
      {/* The campaign's conversion: confetti from the top, over everything, and the notification that stays. Not again on a jump past it. */}
      <Converted on={ordered && phase === "ready"} />
      <Confetti on={ordered && phase === "ready" && from < 15} />
    </div>
  );
}

/**
 * Whether the agent's task is in Today. The moment the quote's sent if the Command Center is
 * already up; if it loads with the quote already in, a beat after its cards
 * (TODAY_AFTER), so the task lands on its own rather than with everything.
 * `already`: on a jump past it, it's in from the start.
 */
function useTaskIn(ready: boolean, quoteSent: boolean, already: boolean) {
  const readyAt = useRef(0);
  const sentAt = useRef(0);
  const [today, setToday] = useState(already);
  useEffect(() => {
    if (ready) readyAt.current = demoNow();
  }, [ready]);
  useEffect(() => {
    if (quoteSent) sentAt.current = demoNow();
  }, [quoteSent]);
  useEffect(() => {
    if (!ready || !quoteSent || today) return;
    const at = Math.max(readyAt.current + TODAY_AFTER, sentAt.current + QUOTE_GAP);
    return demoTimeout(() => setToday(true), Math.max(0, at - demoNow()));
  }, [ready, quoteSent, today]);
  return today;
}

/**
 * The greeting, small and grey. Then the store as the page title (with a link
 * that opens it in a new tab), and at the far right the theme, Refresh,
 * Notifications and the Agent (which opens its drawer). Under it: the view, and at the far right the
 * currency, data source and scope. All that, down to the hairline, stays put as
 * the page scrolls, with a light fade under it so the content slips behind it.
 */
function Header({
  agentOpen,
  onAgent,
}: {
  agentOpen: boolean;
  onAgent: () => void;
}) {
  // Demo hotkey: Ctrl+A sets the Agent working (dots bouncing), and back to idle.
  const [agent, setAgent] = useState<AgentStatus>("idle");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.code !== "KeyA" ||
        !e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey ||
        e.repeat
      )
        return;
      e.preventDefault();
      setAgent((s) => (s === "working" ? "idle" : "working"));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="a2a-hero sticky top-0 z-20 flex flex-col px-8 pt-6">
        <p className="text-[13.5px] text-text-muted">{t.greeting}</p>
        <div className="a2a-dashboard-heading mt-1 flex items-center gap-2">
          <div className="mr-auto flex min-w-0 items-center gap-2.5">
            <Store
              className="size-[22px] shrink-0 text-text-muted"
              strokeWidth={1.75}
            />
            <h1 className="a2a-title truncate text-[24px] font-normal leading-tight tracking-[-0.015em] text-text">
              {t.store}
            </h1>
            <Tooltip label={t.openStore}>
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                aria-label={`${t.openStore} ${t.opensInNewTab}`}
                className="a2a-control grid size-7 place-items-center rounded-md text-text-muted hover:text-text"
              >
                <ExternalLink className="size-3.5" strokeWidth={2} />
              </a>
            </Tooltip>
          </div>
          <ThemeSegmented />
          <IconButton icon={RotateCw} label={t.refresh} />
          <IconButton icon={Bell} label={t.notifications} />
          <AgentButton status={agent} open={agentOpen} onClick={onAgent} className="ml-1" />
        </div>
        <div className="mt-4 flex flex-wrap items-start gap-2">
          {/* What to look at: the view (a mode). */}
          <ViewPicker className="a2a-view-picker mr-auto" />
          {/* Where the figures come from. On narrower screens the scope drops
              to the next line, still at the right. */}
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <CurrencyMenu />
            <SourceMenu />
            <Segmented
              options={t.scope.options}
              initial={2}
              label={t.scope.label}
            />
          </div>
        </div>
        <div className="mt-5 h-px bg-border" aria-hidden />
        <div className="a2a-sticky-fade" aria-hidden />
      </header>
    </>
  );
}

/**
 * A section heading of the Command Center, with an optional line of grey
 * context under it. Headings stay well under the store name (24px):
 * 16px semibold.
 */
function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="a2a-title text-[16px] font-semibold leading-snug tracking-[-0.01em] text-text">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[13px] leading-normal text-text-muted">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * Where the canvas's white starts fading to grey: the bottom of the period
 * control, so the control's grey sits on white, the fade running on below it. Kept up to date as Today's row changes height.
 */
function useFadeTo(canvas: RefObject<HTMLDivElement | null>, mark: RefObject<HTMLDivElement | null>, dep: unknown) {
  useLayoutEffect(() => {
    const c = canvas.current;
    const m = mark.current;
    if (!c || !m) return;
    const set = () => {
      const at = m.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop + m.offsetHeight;
      c.style.setProperty("--fade-end", `${Math.round(at)}px`);
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(c.firstElementChild?.nextElementSibling ?? c);
    return () => ro.disconnect();
  }, [canvas, mark, dep]);
}

/** The period and store the figures below Today cover. It scrolls with the page. */
function Period({ ref }: { ref: RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={ref} className="a2a-period mb-3 flex flex-wrap items-center gap-2">
      <Segmented
        options={t.period.options}
        initial={2}
        label={t.period.label}
        icon={CalendarDays}
        reserveCheck={false}
      />
      <StoreMenu />
    </div>
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
        className="a2a-control grid size-8 place-items-center rounded-md text-text-muted hover:text-text"
      >
        <Icon className="size-4" strokeWidth={2} />
      </button>
    </Tooltip>
  );
}
