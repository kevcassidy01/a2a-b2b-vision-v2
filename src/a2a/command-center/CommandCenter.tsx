import {
  Bell,
  CalendarDays,
  ExternalLink,
  RotateCw,
  Store,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { copy } from "../../copy/copy";
import { Segmented } from "../../shell/Segmented";
import { ThemeSegmented } from "../../shell/ThemeSegmented";
import { Tooltip } from "../Tooltip";
import { AgentButton, type AgentStatus } from "./AgentButton";
import { ApprovalsCard } from "./ApprovalsCard";
import { CurrencyMenu } from "./CurrencyMenu";
import { MetricTiles } from "./MetricTiles";
import { OrdersByCountryCard } from "./OrdersByCountryCard";
import { SourceMenu } from "./SourceMenu";
import { StoreMenu } from "./StoreMenu";
import { ViewPicker } from "./ViewPicker";

const t = copy.a2a.commandCenter;

/**
 * CommandCenter — Alex's B2B Command Center, the MCP app inside the artifact
 * frame. Light mode: white behind the header, fading into a pale grey canvas
 * for the white cards below. Built top to bottom a section at a time from the
 * engineering version; so far, the header.
 */
export function CommandCenter() {
  return (
    <div className="a2a-canvas a2a-no-scrollbar absolute inset-0 overflow-y-auto">
      <Header />
      <div className="relative flex flex-col gap-8 px-8 pb-8 pt-2">
        <Section {...t.sections.last6Months}>
          <ApprovalsCard />
          <MetricTiles />
          <OrdersByCountryCard />
        </Section>
      </div>
    </div>
  );
}

/**
 * The greeting, small and grey. Then the store as the page title (with a link
 * that opens it in a new tab), and at the far right the theme, Refresh,
 * Notifications and the Agent. Under it: the view, and at the far right the
 * currency, data source and scope. All that, down to the hairline, stays put as
 * the page scrolls, with a light fade under it so the content slips behind it.
 * Then the period, which scrolls with the page.
 */
function Header() {
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
          <AgentButton status={agent} className="ml-1" />
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
 * A section of the Command Center: a heading, an optional line of grey context
 * under it, then its cards. Headings stay well under the store name (24px):
 * 16px semibold.
 */
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
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
      {children}
    </section>
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
