import {
  Bell,
  CalendarDays,
  ExternalLink,
  RotateCw,
  Store,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { copy } from "../../copy/copy";
import { Segmented } from "../../shell/Segmented";
import { ThemeSegmented } from "../../shell/ThemeSegmented";
import { Tooltip } from "../Tooltip";
import { AgentButton } from "./AgentButton";
import { ApprovalsCard } from "./ApprovalsCard";
import { CurrencyMenu } from "./CurrencyMenu";
import { MetricTiles } from "./MetricTiles";
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
    <div className="a2a-canvas min-h-full">
      <Header />
      <div className="a2a-hero-fade" aria-hidden />
      <div className="relative flex flex-col gap-8 px-8 pt-2">
        <Section {...t.sections.last12Months}>
          <ApprovalsCard />
          <MetricTiles />
          {/* Room for what comes next: a wide white card that fades out, border
              and all, as it runs off the bottom of the page. The fade sits on a
              wrapper 16px bigger all round, so it doesn't clip the hairline and
              shadow, which are drawn outside the card. */}
          <div className="a2a-fade-out -mx-4 px-4 pt-4 -mt-4" aria-hidden>
            <div className="a2a-card h-64 rounded-t-xl" />
          </div>
        </Section>
      </div>
    </div>
  );
}

/**
 * The greeting, small and grey. Then the store as the page title (with a link
 * that opens it in a new tab), and at the far right the theme, Refresh and
 * Notifications. Under it: the currency, data source and scope, and the Agent
 * at the far right. Then, under a hairline, the view and the period.
 */
function Header() {
  return (
    <header className="a2a-hero flex flex-col px-8 pb-6 pt-6">
      <p className="text-[13.5px] text-text-muted">{t.greeting}</p>
      <div className="mt-1 flex items-center gap-2">
        <div className="mr-auto flex min-w-0 items-center gap-2.5">
          <Store
            className="size-[22px] shrink-0 text-text-muted"
            strokeWidth={1.75}
          />
          <h1 className="truncate text-[24px] font-normal leading-tight tracking-[-0.015em] text-text">
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
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <CurrencyMenu />
        <Segmented options={t.source.options} label={t.source.label} />
        <Segmented
          options={t.scope.options}
          initial={2}
          label={t.scope.label}
        />
        <AgentButton className="ml-auto" />
      </div>
      <div className="mt-5 h-px bg-border" aria-hidden />
      {/* What to look at: the view (a mode), then the period. */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <ViewPicker />
        <div className="flex items-center gap-2">
          <Segmented
            options={t.period.options}
            label={t.period.label}
            icon={CalendarDays}
            reserveCheck={false}
          />
          <StoreMenu />
        </div>
      </div>
    </header>
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
        <h2 className="text-[16px] font-semibold leading-snug tracking-[-0.01em] text-text">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[13px] leading-normal text-text-muted">{subtitle}</p>
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
