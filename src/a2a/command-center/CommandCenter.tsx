import {
  Bell,
  CalendarDays,
  ExternalLink,
  RotateCw,
  Store,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { copy } from "../../copy/copy";
import { Segmented } from "../../shell/Segmented";
import { ThemeSegmented } from "../../shell/ThemeSegmented";
import { useFrameLoading } from "../ArtifactFrame";
import { useStory } from "../story";
import { Tooltip } from "../Tooltip";
import { AgentButton, type AgentStatus } from "./AgentButton";
import { AgentDrawer } from "./AgentDrawer";
import { ActivityCard } from "./ActivityCard";
import { ApprovalsCard } from "./ApprovalsCard";
import { CheckoutFunnelCard } from "./CheckoutFunnelCard";
import { CommandCenterSkeleton } from "./CommandCenterSkeleton";
import { CurrencyMenu } from "./CurrencyMenu";
import { MetricTiles } from "./MetricTiles";
import { MonthlyRevenueCard } from "./MonthlyRevenueCard";
import { OrdersByCountryCard } from "./OrdersByCountryCard";
import { SourceMenu } from "./SourceMenu";
import { StoreMenu } from "./StoreMenu";
import { useGlide } from "./glide";
import { ViewPicker } from "./ViewPicker";
import { Welcome } from "./Welcome";

const t = copy.a2a.commandCenter;
/** How long the Command Center loads, in ms (skeleton cards, the frame's load line), before it's ready. Matches .a2a-load-swipe. */
const LOAD = 1500;
/** If the quote's already in when the Command Center loads, Today follows the cards this long after, in ms. */
const TODAY_AFTER = 700;
/** How long after John's agent sends its quote it lands here, in ms: a short hop, so the send and the arrival read as two moments. */
const QUOTE_GAP = 600;

/**
 * CommandCenter — Alex's B2B Command Center, the MCP app inside the artifact
 * frame. Light mode: white behind the header, fading into a pale grey canvas
 * for the white cards below. Built top to bottom a section at a time from the
 * engineering version; so far, the header.
 *
 * It opens on the Welcome (Alex has been away). Load Command Center brings it
 * in: skeleton cards under the header while the frame's load line sweeps
 * along the bottom of its bar, edge to edge; then the real cards fade up.
 */
export function CommandCenter() {
  const [phase, setPhase] = useState<"away" | "loading" | "ready">("away");
  const [agentOpen, setAgentOpen] = useState(false);
  // Once Alex opens Q-1042, the drawer holds the agent's chat about it from then on.
  const [quoteOpen, setQuoteOpen] = useState(false);
  const openQuote = useCallback(() => {
    setQuoteOpen(true);
    setAgentOpen(true);
  }, []);
  const closeAgent = useCallback(() => setAgentOpen(false), []);
  const { quoteSent, counterSent, heldOut, askedAlex, v3Sent, accepted, ordered, setWorking } = useStory();
  const stage = ordered ? "ordered" : accepted ? "accepted" : v3Sent ? "v3" : askedAlex ? "needsYou" : heldOut ? "heldOut" : counterSent ? "countered" : "request";
  const today = useToday(phase === "ready", quoteSent);
  // The seller agent picks Q-1042 up as it lands, whether or not Alex has the Command Center open, and stays at it.
  useEffect(() => {
    if (!quoteSent) return;
    const id = window.setTimeout(() => setWorking("alexAgent", true), QUOTE_GAP);
    return () => clearTimeout(id);
  }, [quoteSent, setWorking]);
  // Once v2 is out, it waits on the buyer: no longer at work.
  useEffect(() => {
    if (counterSent) setWorking("alexAgent", false);
  }, [counterSent, setWorking]);
  // Isar's agent holds out: it's at it again, until it hands Q-1042 to Alex. (Alex's pick sets it working
  // from the chat; v3 going out stops it.)
  useEffect(() => {
    if (!heldOut) return;
    const id = window.setTimeout(() => setWorking("alexAgent", true), QUOTE_GAP);
    return () => clearTimeout(id);
  }, [heldOut, setWorking]);
  useEffect(() => {
    if (askedAlex || v3Sent) setWorking("alexAgent", false);
  }, [askedAlex, v3Sent, setWorking]);
  useEffect(() => {
    if (phase !== "loading") return;
    const id = window.setTimeout(() => setPhase("ready"), LOAD);
    return () => clearTimeout(id);
  }, [phase]);
  useFrameLoading(phase === "loading");
  if (phase === "away") return <Welcome onLoad={() => setPhase("loading")} />;
  const loading = phase === "loading";
  return (
    <div className="absolute inset-0 overflow-hidden" aria-busy={loading}>
      <div className="a2a-canvas a2a-no-scrollbar absolute inset-0 overflow-y-auto">
        <Header agentOpen={agentOpen} onAgent={() => setAgentOpen((o) => !o)} />
        <div className="relative flex flex-col gap-8 px-8 pb-8 pt-2">
          {loading ? (
            <CommandCenterSkeleton />
          ) : (
            <div className="a2a-load-in flex flex-col gap-8">
              {/* Once John's agent sends its quote, the period's heading gives way to Today's
                  above the pipeline card (which stays put), and the period's heading opens
                  beneath it, easing everything below down. See .a2a-today. */}
              <section className="flex flex-col gap-3">
                <SwapHeading shown={today ? "today" : "last6Months"} />
                <ApprovalsCard request={today} stage={stage} onOpen={openQuote} />
                <div className="a2a-today -mt-3" data-open={today || undefined} aria-hidden={!today}>
                  <div className="min-h-0">
                    <div className="a2a-today-heading pt-8">
                      <Heading {...t.sections.last6Months} />
                    </div>
                  </div>
                </div>
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
    </div>
  );
}

/**
 * Whether Today shows. The moment the quote's sent if the Command Center is
 * already up; if it loads with the quote already in, a beat after its cards
 * (TODAY_AFTER), so the request lands on its own rather than with everything.
 */
function useToday(ready: boolean, quoteSent: boolean) {
  const readyAt = useRef(0);
  const sentAt = useRef(0);
  const [today, setToday] = useState(false);
  useEffect(() => {
    if (ready) readyAt.current = performance.now();
  }, [ready]);
  useEffect(() => {
    if (quoteSent) sentAt.current = performance.now();
  }, [quoteSent]);
  useEffect(() => {
    if (!ready || !quoteSent || today) return;
    const at = Math.max(readyAt.current + TODAY_AFTER, sentAt.current + QUOTE_GAP);
    const wait = Math.max(0, at - performance.now());
    const id = window.setTimeout(() => setToday(true), wait);
    return () => clearTimeout(id);
  }, [ready, quoteSent, today]);
  return today;
}

/**
 * The greeting, small and grey. Then the store as the page title (with a link
 * that opens it in a new tab), and at the far right the theme, Refresh,
 * Notifications and the Agent (which opens its drawer). Under it: the view, and at the far right the
 * currency, data source and scope. All that, down to the hairline, stays put as
 * the page scrolls, with a light fade under it so the content slips behind it.
 * Then the period, which scrolls with the page.
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
        <div className="mt-1 flex items-center gap-2">
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
          <ViewPicker className="mr-auto" />
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
      <div className="flex flex-wrap items-center gap-2 px-8 pb-6 pt-5">
        <Segmented
          options={t.period.options}
          initial={4}
          label={t.period.label}
          icon={CalendarDays}
          reserveCheck={false}
        />
        <StoreMenu />
      </div>
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
 * The heading above the pipeline card: the period's, until Today takes its
 * place. The old one lifts away as the new one rises in, and the box glides
 * to the new one's height (Today's subtitle is a line shorter).
 */
function SwapHeading({ shown }: { shown: "today" | "last6Months" }) {
  const ref = useRef<HTMLDivElement>(null);
  useGlide(ref, shown);
  return (
    <div ref={ref} className="relative">
      {(["last6Months", "today"] as const).map((key, i) => {
        const state = key === shown ? "shown" : i === 0 ? "above" : "below";
        return (
          <div
            key={key}
            data-state={state}
            aria-hidden={state !== "shown"}
            className={`a2a-swap ${state === "shown" ? "relative" : "absolute inset-x-0 top-0"}`}
          >
            <Heading {...t.sections[key]} />
          </div>
        );
      })}
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
