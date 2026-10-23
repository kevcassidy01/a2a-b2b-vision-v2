import { Fragment, createContext, useContext, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  ClipboardCheck,
  ListChecks,
  Mail,
  MessageSquareText,
  PackageX,
  Store,
  TrendingUp,
  UserRoundX,
} from "lucide-react";
import type {
  AppAction,
  ChecklistItem,
  HBarRow,
  InsightCell,
  InsightPage,
  InsightSection,
  Kpi,
  NextAction,
  ObjectiveRow,
  Pill,
  RankedRow,
  RiskRow,
  SlotView,
  StackPart,
  Tick,
  TodoItem,
} from "../types";
import { useBusy, useChat } from "../store";
import { ChartTooltip } from "./ChartTooltip";
import { ColumnChart } from "./ColumnChart";
import { LineChart } from "./LineChart";
import { DeltaPill, InsightPill } from "./Pills";
import { Sparkline } from "./Sparkline";
import { useWidth } from "./useWidth";

const useWidthLocal = () => useWidth<HTMLDivElement>();

/**
 * InsightView — the merchant-insights view, composed from sections.
 *
 * Inline it renders the card title + subtitle and its `sections`; expanded to
 * full screen it renders the `full` page instead (page title → group titles →
 * sections). Sections are shared, so a chart looks the same wherever it shows.
 *
 * Type ladder (tokens.css): page 28 > group 22 > card / chart title 18 > body
 * 16, with KPI figures at 34 and a 14px floor for labels, ticks and meta. A
 * subtitle only adds scope or time; it never restates the title.
 */
export function InsightView({
  view,
  fullscreen,
}: {
  view: Extract<SlotView, { kind: "insight" }>;
  fullscreen: boolean;
}) {
  if (fullscreen && view.full) return <InsightPageView page={view.full} />;
  return (
    <div className="space-y-6">
      {view.heading && (
        <header className="space-y-1">
          <h3 className="text-title font-semibold text-text">{view.heading}</h3>
          {view.subtitle && <p className="text-label text-text-muted">{view.subtitle}</p>}
        </header>
      )}
      {view.sections.map((s, i) => (
        <Section key={i} section={s} />
      ))}
    </div>
  );
}

/** The full-screen page: a page title, then groups divided by hairlines. */
/** The page, group by group. `reveal` (ms) loads it one group at a time: the
 *  next group shows as a short skeleton, then fades in (Cowork's brief). */
export function InsightPageView({ page, reveal }: { page: InsightPage; reveal?: number }) {
  const total = page.groups.length;
  const [shown, setShown] = useState(reveal ? 0 : total);
  useEffect(() => {
    if (!reveal || shown >= total) return;
    const timer = window.setTimeout(() => setShown((n) => n + 1), reveal);
    return () => window.clearTimeout(timer);
  }, [reveal, shown, total]);
  return (
    <div className="space-y-10 pt-2">
      <header className="space-y-1.5">
        <h2 className="text-page font-semibold tracking-tight text-text">{page.title}</h2>
        {page.subtitle && <p className="text-body text-text-muted">{page.subtitle}</p>}
      </header>
      {page.groups.slice(0, shown).map((g) => (
        <section key={g.title} className={`space-y-6 border-t border-border pt-8 ${reveal ? "animate-fade-in" : ""}`}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-group font-semibold text-text">{g.title}</h3>
            {g.action && <AppButton action={g.action} />}
          </div>
          {g.sections.map((s, i) => (
            <Section key={i} section={s} />
          ))}
        </section>
      ))}
      {shown < total && (
        <section className="space-y-6 border-t border-border pt-8" aria-hidden>
          <div className="h-6 w-56 animate-pulse rounded-md bg-elevated" />
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-elevated" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-elevated" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-elevated" />
          </div>
        </section>
      )}
    </div>
  );
}

/** A section's own title (chart / card title scale) + optional summary line. */
function SectionTitle({ title, summary }: { title?: string; summary?: string }) {
  if (!title && !summary) return null;
  return (
    <div className="space-y-1">
      {title && <h4 className="text-title font-semibold text-text">{title}</h4>}
      {summary && <p className="text-body text-text-muted">{summary}</p>}
    </div>
  );
}

/** One section, wherever it shows (card, full-screen page, report page). */
export function Section({ section }: { section: InsightSection }) {
  switch (section.type) {
    case "kpis":
      return (
        <div className="space-y-4">
          <SectionTitle title={section.title} />
          <KpiTiles items={section.items} />
        </div>
      );
    case "line":
      return (
        <div className="space-y-4">
          <SectionTitle title={section.title} summary={section.summary} />
          <LineChart spec={section} />
        </div>
      );
    case "stacked":
      return (
        <div className="space-y-4">
          <SectionTitle title={section.title} summary={section.total} />
          <StackedBar parts={section.parts} />
        </div>
      );
    case "table":
      return (
        <div className="space-y-4">
          <SectionTitle title={section.title} />
          <InsightTable columns={section.columns} rows={section.rows} />
          {section.meta && <p className="text-label text-text-muted">{section.meta}</p>}
        </div>
      );
    case "objectives":
      return (
        <div className="space-y-4">
          <SectionTitle title={section.title} />
          <Objectives rows={section.rows} />
        </div>
      );
    case "columns":
      return (
        <div className="space-y-4">
          <SectionTitle title={section.title} summary={section.summary} />
          <ColumnChart spec={section} />
        </div>
      );
    case "ranked":
      return (
        <div className="space-y-4">
          <SectionTitle title={section.title} />
          <RankedTable columns={section.columns} rows={section.rows} />
          {section.meta && <p className="text-label text-text-muted">{section.meta}</p>}
        </div>
      );
    case "hbars":
      return (
        <div className="space-y-4">
          <SectionTitle title={section.title} summary={section.summary} />
          <HBars section={section} />
        </div>
      );
    case "mix":
      return (
        <div className="space-y-4">
          <SectionTitle title={section.title} summary={section.summary} />
          <MixBars section={section} />
        </div>
      );
    case "facts":
      return (
        <div className="space-y-4">
          <SectionTitle title={section.title} />
          <Facts items={section.items} />
        </div>
      );
    case "risk":
      return (
        <div className="space-y-4">
          <SectionTitle title={section.title} />
          <RiskList rows={section.rows} />
        </div>
      );
    case "toggle":
      return <ToggleSection section={section} />;
    case "actions":
      return (
        <div className="flex flex-wrap gap-2">
          {section.items.map((a) => (
            <PromptButton key={a.label} label={a.label} prompt={a.prompt} />
          ))}
        </div>
      );
    case "summary":
      return (
        <div className="space-y-4">
          <SectionTitle title={section.title} />
          <ul className="space-y-2.5">
            {section.items.map((it) => (
              <li key={it.lead} className="flex gap-3 text-body text-text">
                <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-text-subtle" />
                <span>
                  <span className="font-semibold">{it.lead}</span> {it.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "todo":
      return (
        <div className="space-y-4">
          <SectionTitle title={section.title} />
          <TodoList items={section.items} />
          {section.meta && <p className="text-label text-text-muted">{section.meta}</p>}
        </div>
      );
    case "messages":
      return (
        <div className="space-y-4">
          <SectionTitle title={section.title} />
          <SlackMessages items={section.items} />
        </div>
      );
    case "next":
      return <NextActions items={section.items} />;
  }
}

/** A placeholder link ("#") goes nowhere: the demo's routing lives in the hash. */
const stayPut = (e: React.MouseEvent<HTMLAnchorElement>) => {
  if (e.currentTarget.getAttribute("href") === "#") e.preventDefault();
};

/** White, 8px corners, the app's logo then the label. */
function AppButton({ action }: { action: AppAction }) {
  const hostSend = useContext(PromptSendContext);
  const send = useChat((s) => s.send);
  const cls =
    "inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-border bg-white px-3 text-label font-medium text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated";
  const inner = (
    <>
      <img src={action.logo} alt="" className="size-4" />
      {action.label}
    </>
  );
  if (action.prompt) {
    const prompt = action.prompt;
    return (
      <button type="button" onClick={() => (hostSend ?? send)(prompt)} className={cls}>
        {inner}
      </button>
    );
  }
  return (
    <a href={action.href} onClick={stayPut} target="_blank" rel="noreferrer" className={cls}>
      {inner}
    </a>
  );
}

/* ── To-do list ─────────────────────────────────────────────────────────── */

/** One row per task: an empty checkbox, the task, its owner, and a pill
 *  saying where it came from. */
function TodoList({ items }: { items: TodoItem[] }) {
  return (
    <ol className="divide-y divide-border rounded-lg border border-border">
      {items.map((it) => (
        <li key={it.task} className="grid grid-cols-[20px_minmax(0,1fr)_140px_auto] items-center gap-4 px-4 py-3.5">
          <span className="size-[18px] rounded-[5px] border-[1.5px] border-text-subtle" />
          <span className="text-body text-text">{it.task}</span>
          <span className="truncate text-label text-text-muted">{it.owner}</span>
          <span className="justify-self-end">
            <InsightPill pill={it.source} />
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ── Things to do ───────────────────────────────────────────────────────── */

/** One numbered row per task: an empty checkbox, the task in bold with its
 *  pill on the right, then its label–value pairs in two aligned columns.
 *  `bare` drops the outer border (inside a card that has its own). */
export function Checklist({ items, bare }: { items: ChecklistItem[]; bare?: boolean }) {
  return (
    <ol className={`divide-y divide-border ${bare ? "" : "rounded-lg border border-border"}`}>
      {items.map((it, i) => (
        <li key={it.title} className="flex gap-3.5 px-4 py-3.5">
          <span className="mt-[3px] size-[18px] shrink-0 rounded-[5px] border-[1.5px] border-text-subtle" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <span className="text-body font-semibold text-text">
                <span className="mr-1.5 tabular-nums text-text-muted">{i + 1}.</span>
                {it.title}
              </span>
              {it.pill && <InsightPill pill={it.pill} />}
            </div>
            <dl className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-3 gap-y-1">
              {it.pairs.map((p) => (
                <Fragment key={p.label}>
                  <dt className="text-label text-text-muted">{p.label}</dt>
                  <dd className="text-label text-text">{p.value}</dd>
                </Fragment>
              ))}
            </dl>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ── Slack messages ─────────────────────────────────────────────────────── */

/** Messages as Slack shows them: the sender's square avatar, their name in
 *  bold with the time beside it, then the text. */
function SlackMessages({ items }: { items: { from: string; time: string; text: string }[] }) {
  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {items.map((m) => (
        <li key={m.text} className="flex gap-3 px-4 py-3.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-surface">
            <img src="/connectors/slack.svg" alt="" aria-hidden className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-body font-semibold text-text">{m.from}</span>
              <span className="text-label text-text-muted">{m.time}</span>
            </div>
            <p className="text-body text-text">{m.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ── Next best actions ──────────────────────────────────────────────────── */

const NEXT_ICONS = {
  growth: TrendingUp,
  accounts: UserRoundX,
  orders: ClipboardCheck,
  stock: PackageX,
  mail: Mail,
  meeting: CalendarClock,
  slack: MessageSquareText,
  tasks: ListChecks,
  store: Store,
};

/** 2–3 action cards side by side (stacked when narrow): an icon, what to do,
 *  why it's worth it, and one CTA pinned to the bottom. */
function NextActions({ items }: { items: NextAction[] }) {
  return (
    <div className="@container">
      <div className="grid gap-3 @2xl:grid-cols-3">
        {items.map((a) => {
          const Icon = NEXT_ICONS[a.icon];
          return (
            <div key={a.title} className="flex flex-col gap-3 rounded-xl border border-border p-5">
              <span className="grid size-9 place-items-center rounded-lg bg-info-soft text-app-link">
                <Icon className="size-5" strokeWidth={2} />
              </span>
              <div className="space-y-1">
                <h4 className="text-title font-semibold text-text">{a.title}</h4>
                <p className="text-body text-text-muted">{a.body}</p>
              </div>
              <div className="mt-auto pt-1">
                {a.cta.prompt ? (
                  <PromptButton label={a.cta.label} prompt={a.cta.prompt} size="sm" />
                ) : (
                  <button
                    type="button"
                    className="whitespace-nowrap inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-label font-medium text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated"
                  >
                    {a.cta.label}
                    <ArrowUpRight className="size-4" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Buttons ────────────────────────────────────────────────────────────── */

/** Where prompt buttons send: the browser chat by default; a host with its own
 *  chat (the Cowork window) provides its own. */
export const PromptSendContext = createContext<((prompt: string) => void) | null>(null);

/** A drill-down button: posts `prompt` as Aaron's next message (a real Commerce
 *  read, never a "flag" or "add to plan"). Outline brand style, 16px label. */
function PromptButton({ label, prompt, size = "md" }: { label: string; prompt: string; size?: "sm" | "md" }) {
  const hostSend = useContext(PromptSendContext);
  const send = useChat((s) => s.send);
  const busy = useBusy() && !hostSend;
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => (hostSend ?? send)(prompt)}
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-app-link/50 font-medium text-app-link transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-info-soft disabled:opacity-50 ${
        size === "sm" ? "h-8 px-3 text-label" : "h-9 px-4 text-body"
      }`}
    >
      {label}
      <ArrowRight className="size-4" strokeWidth={2} />
    </button>
  );
}

/* ── Toggle ─────────────────────────────────────────────────────────────── */

/** A segmented switch beside the section title; swaps which sections show. */
function ToggleSection({ section }: { section: Extract<InsightSection, { type: "toggle" }> }) {
  const [i, setI] = useState(0);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionTitle title={section.title} summary={section.summary} />
        <div role="tablist" className="inline-flex shrink-0 rounded-full bg-elevated p-1">
          {section.options.map((o, j) => (
            <button
              key={o.label}
              type="button"
              role="tab"
              aria-selected={i === j}
              onClick={() => setI(j)}
              className={`whitespace-nowrap h-8 rounded-full px-3.5 text-label font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
                i === j ? "bg-surface text-text shadow-sm" : "text-text-muted hover:text-text"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      {section.options[i].sections.map((s, k) => (
        <Section key={`${i}-${k}`} section={s} />
      ))}
    </div>
  );
}

/* ── KPI tiles ──────────────────────────────────────────────────────────── */

export function KpiTiles({ items, pairs = false }: { items: Kpi[]; pairs?: boolean }) {
  // Sized to its own width (a container query), so tiles go 2-up in narrow
  // homes like the report preview's pages and 4-up in cards and full screen.
  // Three tiles share one row rather than leave a hole in a 4-up grid.
  // `pairs` keeps them 2-up everywhere, for tiles with longer lines.
  const wide = pairs ? "" : items.length === 3 ? "@xl:grid-cols-3" : "@2xl:grid-cols-4";
  return (
    <div className="@container">
      <div className={`grid grid-cols-2 gap-3 ${wide}`}>
        {items.map((k) => (
          <div key={k.label} className="flex flex-col rounded-lg border border-border bg-bg p-4">
            <div className="text-label font-medium text-text-muted">{k.label}</div>
            {k.value && (
              <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-kpi font-semibold tracking-tight tabular-nums text-text">{k.value}</span>
                {k.delta && <DeltaPill delta={k.delta} />}
              </div>
            )}
            {k.rows && (
              <ul className="mt-2.5 space-y-2.5">
                {k.rows.map((r) => (
                  <li key={r.label} className="flex items-center justify-between gap-2">
                    <span className="whitespace-nowrap text-body text-text">{r.label}</span>
                    <DeltaPill delta={r.delta} />
                  </li>
                ))}
              </ul>
            )}
            {k.progress != null && (
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-elevated">
                <div className="h-full rounded-full bg-viz" style={{ width: `${Math.min(k.progress, 1) * 100}%` }} />
              </div>
            )}
            {k.detail && <div className="mt-2 text-label text-text-muted">{k.detail}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Part-to-whole bar ──────────────────────────────────────────────────── */

const RAMP = ["bg-viz-1", "bg-viz-2", "bg-viz-3", "bg-viz-4"];

/** One horizontal bar split into parts (blue ramp, dark → light), with each
 *  part's label, value and detail in columns aligned under the bar. */
function StackedBar({ parts }: { parts: StackPart[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const total = parts.reduce((n, p) => n + p.value, 0) || 1;
  const cols = parts.map((p) => `${p.value / total}fr`).join(" ");
  return (
    <div className="space-y-3">
      <div className="relative" onMouseLeave={() => setHover(null)}>
        <div className="flex h-9 gap-[3px] overflow-hidden rounded-md">
          {parts.map((p, i) => (
            <div
              key={p.label}
              onMouseEnter={() => setHover(i)}
              className={`${RAMP[i % RAMP.length]} transition-opacity duration-[var(--dur-fast)] ${hover != null && hover !== i ? "opacity-35" : ""}`}
              style={{ flex: p.value }}
            />
          ))}
        </div>
        {hover != null && (
          <StackTip parts={parts} i={hover} total={total} />
        )}
      </div>
      {/* Legend under each part when every part is wide enough to hold it;
          otherwise an even 4-up legend so short slices never truncate. */}
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: parts.every((p) => p.value / total >= 0.16) ? cols : `repeat(${parts.length}, minmax(0, 1fr))` }}
      >
        {parts.map((p, i) => (
          <div key={p.label} className="min-w-0 pr-2">
            <div className="flex items-center gap-1.5 text-label text-text-muted">
              <span className={`size-2.5 shrink-0 rounded-sm ${RAMP[i % RAMP.length]}`} />
              <span className="truncate">{p.label}</span>
            </div>
            <div className="mt-1 text-body font-semibold tabular-nums text-text">{p.display}</div>
            {p.detail && <div className="text-label text-text-muted">{p.detail}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Tooltip over a hovered part: label, figure, share of the whole, detail. */
function StackTip({ parts, i, total }: { parts: StackPart[]; i: number; total: number }) {
  const [ref, width] = useWidthLocal();
  const before = parts.slice(0, i).reduce((n, p) => n + p.value, 0);
  const mid = ((before + parts[i].value / 2) / total) * width;
  const p = parts[i];
  return (
    <div ref={ref} className="pointer-events-none absolute inset-x-0 top-0">
      {width > 0 && (
        <ChartTooltip
          x={mid}
          y={0}
          width={width}
          lines={[p.label, p.display, `${Math.round((p.value / total) * 100)}% of the total`, ...(p.detail ? [p.detail] : [])]}
        />
      )}
    </div>
  );
}

/* ── Ranked table ───────────────────────────────────────────────────────── */

/** Rank · name (+ detail, + pinned note) · share bar + value · extra · change ·
 *  sparkline · row button. A highlighted row reads in the alert tone; when one
 *  is highlighted the other rows' bars go quiet so it stands out. */
function RankedTable({
  columns,
  rows,
}: {
  columns: Extract<InsightSection, { type: "ranked" }>["columns"];
  rows: RankedRow[];
}) {
  const max = Math.max(...rows.map((r) => r.value)) || 1;
  const focus = rows.some((r) => r.highlight);
  const hasSpark = rows.some((r) => r.spark);
  const hasAction = rows.some((r) => r.action);
  const hasExtra = rows.some((r) => r.extra);
  const grid = [
    "28px",
    "minmax(0,1.5fr)",
    "minmax(140px,1.3fr)",
    hasExtra ? "88px" : "",
    "92px",
    hasSpark ? "104px" : "",
    hasAction ? `${Math.max(...rows.map((r) => r.action?.label.length ?? 0)) * 8 + 52}px` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <div className="min-w-[640px]">
        <div className="grid items-center gap-4 bg-elevated px-4 py-2.5 text-label font-medium text-text-muted" style={{ gridTemplateColumns: grid }}>
          <span>#</span>
          <span>{columns.name}</span>
          <span>{columns.value}</span>
          {hasExtra && <span className="text-right">{columns.extra}</span>}
          <span>{columns.delta ?? "Change"}</span>
          {hasSpark && <span>{columns.spark ?? "Trend"}</span>}
          {hasAction && <span />}
        </div>
        {rows.map((r, i) => (
          <div
            key={r.name}
            className={`grid items-center gap-4 border-t border-border px-4 py-3.5 ${r.highlight ? "bg-viz-alert-soft" : ""}`}
            style={{ gridTemplateColumns: grid }}
          >
            <span className="text-label font-semibold tabular-nums text-text-muted">{i + 1}</span>
            <div className="min-w-0">
              <div className="truncate text-body font-medium text-text">{r.name}</div>
              {r.detail && <div className="truncate text-label text-text-muted">{r.detail}</div>}
              {r.note && <div className={`mt-0.5 text-label font-medium ${r.highlight ? "text-viz-alert" : "text-text"}`}>{r.note}</div>}
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-elevated">
                <div
                  className={`h-full rounded-full ${r.highlight ? "bg-viz-alert" : focus ? "bg-viz-3" : "bg-viz"}`}
                  style={{ width: `${(r.value / max) * 100}%` }}
                />
              </div>
              <span className="w-[56px] text-right text-body font-semibold tabular-nums text-text">{r.display}</span>
            </div>
            {hasExtra && <span className="text-right text-body tabular-nums text-text">{r.extra}</span>}
            <span>{r.delta && <DeltaPill delta={r.delta} />}</span>
            {hasSpark && <span>{r.spark && <Sparkline points={r.spark} labels={r.sparkLabels} alert={r.highlight} />}</span>}
            {hasAction && <span>{r.action && <PromptButton label={r.action.label} prompt={r.action.prompt} size="sm" />}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Horizontal bars with a threshold ───────────────────────────────────── */

/** Label · bar on a shared axis (with an optional threshold rule) · value ·
 *  extra. Hovering a row shows its annotation at the bar's end and fades the
 *  other bars. */
function HBars({ section }: { section: Extract<InsightSection, { type: "hbars" }> }) {
  const [hover, setHover] = useState<number | null>(null);
  const pct = (v: number) => `${Math.min(v / section.max, 1) * 100}%`;
  const hasExtra = section.rows.some((r) => r.extra);
  const grid = `minmax(0,1.1fr) minmax(0,2fr) 72px${hasExtra ? " 72px" : ""}`;
  return (
    <div className="rounded-lg border border-border">
      {section.columns && (
        <div className="grid items-center gap-4 rounded-t-lg bg-elevated px-4 py-2.5 text-label font-medium text-text-muted" style={{ gridTemplateColumns: grid }}>
          <span>{section.columns.label}</span>
          <span />
          <span className="text-right">{section.columns.value}</span>
          {hasExtra && <span className="text-right">{section.columns.extra}</span>}
        </div>
      )}
      {section.rows.map((r: HBarRow, i) => (
        <div
          key={r.label}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          className={`grid items-center gap-4 border-t border-border px-4 py-3.5 first:border-t-0 ${r.highlight ? "bg-viz-alert-soft" : ""} ${section.columns ? "first:border-t" : ""}`}
          style={{ gridTemplateColumns: grid }}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-body font-medium text-text">{r.label}</span>
              {r.tag && <InsightPill pill={r.tag} />}
            </div>
            {r.detail && <div className="text-label text-text-muted">{r.detail}</div>}
          </div>
          <div className="relative h-7">
            <div className="absolute inset-y-1.5 left-0 right-0 rounded-full bg-elevated" />
            <div
              // Dim the other bars so the hovered one holds the focus.
              className={`absolute inset-y-1.5 left-0 rounded-full transition-opacity duration-[var(--dur-fast)] ${r.highlight ? "bg-viz-alert" : "bg-viz"} ${hover != null && hover !== i ? "opacity-35" : ""}`}
              style={{ width: pct(r.value) }}
            />
            {section.threshold && (
              <div className="absolute inset-y-0 w-0 border-l-2 border-dashed border-viz-goal" style={{ left: pct(section.threshold.at) }} />
            )}
            {hover === i && r.hover && (
              <BarTip lines={r.hover} at={Math.min(r.value / section.max, 1)} />
            )}
          </div>
          <span className="text-right text-body font-semibold tabular-nums text-text">{r.display}</span>
          {hasExtra && <span className="text-right text-body tabular-nums text-text-muted">{r.extra}</span>}
        </div>
      ))}
      {(section.ticks || section.threshold) && (
        <div className="grid gap-4 px-4 pb-3 pt-1" style={{ gridTemplateColumns: grid }}>
          <span />
          <Axis max={section.max} ticks={section.ticks} threshold={section.threshold} />
        </div>
      )}
    </div>
  );
}

/** A bar row's hover tag, anchored at the bar's end. */
function BarTip({ lines, at }: { lines: string[]; at: number }) {
  const [ref, width] = useWidthLocal();
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0">
      {width > 0 && <ChartTooltip x={at * width} y={0} width={width} lines={lines} />}
    </div>
  );
}

/** Axis ticks under the bars, plus the threshold's label at its rule. */
function Axis({ max, ticks, threshold }: { max: number; ticks?: Tick[]; threshold?: { at: number; label: string } }) {
  return (
    <div className="relative h-6">
      {ticks?.map((t) => (
        <span
          key={t.at}
          className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-label tabular-nums text-text-muted"
          style={{ left: `${(t.at / max) * 100}%` }}
        >
          {t.label}
        </span>
      ))}
      {threshold && (
        <span
          className="absolute top-0 -translate-x-1/2 whitespace-nowrap rounded bg-surface px-1 text-label font-semibold text-text"
          style={{ left: `${(threshold.at / max) * 100}%` }}
        >
          {threshold.label}
        </span>
      )}
    </div>
  );
}

/* ── 100% stacked comparison ────────────────────────────────────────────── */

const MIX_RAMP = ["bg-viz-1", "bg-viz-2", "bg-viz-3", "bg-viz-4"];
const MIX_TEXT = ["text-white", "text-white", "text-text", "text-text"];

/** Rows of 100% bars split by the same categories (e.g. New Buyers vs the
 *  store average), with a shared legend, % labels inside wide-enough parts and
 *  an optional note pinned under one part. Hover shows a part's share. */
function MixBars({ section }: { section: Extract<InsightSection, { type: "mix" }> }) {
  const [hover, setHover] = useState<[number, number] | null>(null);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        {section.categories.map((c, i) => (
          <span key={c} className="inline-flex items-center gap-2 text-label text-text-muted">
            <span className={`size-3 rounded-sm ${MIX_RAMP[i % 4]}`} />
            {c}
          </span>
        ))}
      </div>
      {section.rows.map((r, ri) => {
        const total = r.parts.reduce((n, v) => n + v, 0) || 1;
        return (
          <div key={r.label} className="grid grid-cols-[148px_minmax(0,1fr)] items-start gap-4">
            <span className="pt-2 text-body font-medium text-text">{r.label}</span>
            <div>
              <div className="relative" onMouseLeave={() => setHover(null)}>
                <div className="flex h-10 gap-[3px] overflow-hidden rounded-md">
                  {r.parts.map((v, pi) => (
                    <div
                      key={pi}
                      onMouseEnter={() => setHover([ri, pi])}
                      className={`flex items-center justify-center text-label font-semibold tabular-nums transition-opacity duration-[var(--dur-fast)] ${MIX_RAMP[pi % 4]} ${MIX_TEXT[pi % 4]} ${
                        hover && (hover[0] !== ri || hover[1] !== pi) ? "opacity-35" : ""
                      }`}
                      style={{ flex: v }}
                    >
                      {v / total >= 0.09 ? `${Math.round((v / total) * 100)}%` : ""}
                    </div>
                  ))}
                </div>
                {hover && hover[0] === ri && (
                  <MixTip
                    left={(r.parts.slice(0, hover[1]).reduce((n, v) => n + v, 0) + r.parts[hover[1]] / 2) / total}
                    lines={[section.categories[hover[1]], `${Math.round((r.parts[hover[1]] / total) * 100)}%`, `of ${r.label} revenue`]}
                  />
                )}
              </div>
              {section.callout?.row === ri && (
                <div
                  className="relative mt-1 h-7"
                  style={{
                    marginLeft: `${(r.parts.slice(0, section.callout.part).reduce((n, v) => n + v, 0) / total) * 100}%`,
                  }}
                >
                  <span className="absolute right-0 top-0 flex items-center gap-1.5 whitespace-nowrap text-label font-semibold text-viz-alert">
                    <span className="h-3 w-px bg-viz-alert" />
                    {section.callout.text}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MixTip({ left, lines }: { left: number; lines: string[] }) {
  const [ref, width] = useWidthLocal();
  return (
    <div ref={ref} className="pointer-events-none absolute inset-x-0 top-0">
      {width > 0 && <ChartTooltip x={left * width} y={0} width={width} lines={lines} />}
    </div>
  );
}

/* ── Facts strip ────────────────────────────────────────────────────────── */

/** Status facts in a wrapping strip: label over value (or a pill). */
function Facts({ items }: { items: { label: string; value?: string; pill?: Pill }[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
      {items.map((f) => (
        <div key={f.label} className="space-y-1.5 bg-surface px-4 py-3">
          <div className="text-label text-text-muted">{f.label}</div>
          {f.pill ? <InsightPill pill={f.pill} /> : <div className="text-body font-medium text-text">{f.value}</div>}
        </div>
      ))}
    </div>
  );
}

/* ── At-risk accounts ───────────────────────────────────────────────────── */

/** One row per account; each signal draws its own small chart: a gap bar
 *  (days since last order vs the usual cadence), a falling sparkline, or a
 *  struck-through category chip. */
function RiskList({ rows }: { rows: RiskRow[] }) {
  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {rows.map((r) => (
        <div key={r.name} className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_88px_auto] items-center gap-5 px-4 py-4">
          <div className="min-w-0">
            <div className="truncate text-body font-semibold text-text">{r.name}</div>
            <div className="text-label text-text-muted">{r.segment}</div>
          </div>
          <div className="min-w-0 space-y-1.5">
            <Signal signal={r.signal} />
            <div className="text-label text-text-muted">{r.signalText}</div>
          </div>
          <div className="text-right">
            <div className="text-body font-semibold tabular-nums text-text">{r.annual}</div>
            <div className="text-label text-text-muted">a year</div>
          </div>
          <span>{r.action && <PromptButton label={r.action.label} prompt={r.action.prompt} size="sm" />}</span>
        </div>
      ))}
    </div>
  );
}

function Signal({ signal }: { signal: RiskRow["signal"] }) {
  if (signal.kind === "gap") {
    const max = Math.max(signal.days, signal.usual) * 1.1;
    return (
      <div className="relative h-5" title={`${signal.days} days since last order, usually every ${signal.usual}`}>
        <div className="absolute inset-y-1 left-0 right-0 rounded-full bg-elevated" />
        <div className="absolute inset-y-1 left-0 rounded-full bg-viz-alert" style={{ width: `${(signal.days / max) * 100}%` }} />
        <div className="absolute inset-y-0 w-0 border-l-2 border-viz-goal" style={{ left: `${(signal.usual / max) * 100}%` }} />
      </div>
    );
  }
  if (signal.kind === "trend") return <Sparkline points={signal.points} labels={signal.labels} alert width={140} height={28} />;
  return (
    <span className="whitespace-nowrap inline-flex rounded-full bg-elevated px-2.5 py-0.5 text-label font-medium text-text-muted line-through decoration-viz-alert decoration-2">
      {signal.category}
    </span>
  );
}

/* ── Table ──────────────────────────────────────────────────────────────── */

function Cell({ cell }: { cell: InsightCell }) {
  if (typeof cell === "string") return <>{cell}</>;
  return (
    <span className="inline-flex items-center gap-2">
      {cell.text &&
        (cell.href ? (
          <a
            href={cell.href}
            onClick={stayPut}
            target="_blank"
            rel="noreferrer"
            className={`text-app-link hover:underline ${cell.strong ? "font-semibold" : ""}`}
          >
            {cell.text}
          </a>
        ) : (
          <span className={cell.strong ? "font-semibold text-text" : cell.muted ? "text-text-muted" : ""}>{cell.text}</span>
        ))}
      {cell.pill && <InsightPill pill={cell.pill as Pill} />}
      {cell.button && <CellButton {...cell.button} />}
    </span>
  );
}

/** A table row's action: white, 8px corners, sends its prompt. */
function CellButton({ label, prompt }: { label: string; prompt: string }) {
  const hostSend = useContext(PromptSendContext);
  const send = useChat((s) => s.send);
  return (
    <button
      type="button"
      onClick={() => (hostSend ?? send)(prompt)}
      className="inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-md border border-border bg-white px-3 text-label font-medium text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated"
    >
      {label}
    </button>
  );
}

/** A data table at insight scale: 14px header band, 16px rows. */
function InsightTable({
  columns,
  rows,
}: {
  columns: { label: string; align?: "left" | "right" }[];
  rows: InsightCell[][];
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full border-collapse text-body [&_td]:px-4 [&_th]:px-4">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.label}
                className={`bg-elevated py-2.5 text-label font-medium text-text-muted ${c.align === "right" ? "text-right" : "text-left"}`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border">
              {r.map((cell, j) => (
                <td
                  key={j}
                  className={`py-3 text-text ${columns[j]?.align === "right" ? "text-right tabular-nums" : "text-left"}`}
                >
                  <Cell cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Objectives ─────────────────────────────────────────────────────────── */

function Objectives({ rows }: { rows: ObjectiveRow[] }) {
  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_auto] items-center gap-6 px-4 py-4">
          <div className="min-w-0">
            <div className="text-body font-semibold text-text">{r.label}</div>
            <div className="text-label text-text-muted">Target {r.target}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-elevated">
              <div className="h-full rounded-full bg-viz" style={{ width: `${Math.min(r.progress, 1) * 100}%` }} />
            </div>
            <span className="w-[72px] text-right text-body font-semibold tabular-nums text-text">{r.actual}</span>
          </div>
          <InsightPill pill={r.status} />
        </li>
      ))}
    </ul>
  );
}
