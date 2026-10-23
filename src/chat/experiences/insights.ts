import type {
  AppStep,
  Block,
  CardApp,
  ChecklistItem,
  ExportItem,
  FileRef,
  InsightPage,
  InsightSection,
  Kpi,
  PromoRow,
  ReportPage,
  ScriptedResponse,
  SlotBlock,
  SlotView,
  XY,
} from "../types";
import type { Experience } from "./types";
import { copy } from "../../copy/copy";
import { appsMs } from "../AppTimeline";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  MERCHANT INSIGHTS — store health → problems → action (Salesforce Commerce)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Merchant "Aaron" checks how the **Alpine** store (a B2B coffee-equipment
 * store) is tracking this quarter, follows the numbers down to a few problems,
 * has Claude remember them, gets the list back, sets up promotions, and exports
 * a report. One continuous thread. Plan + beat table: docs/merchant-insights-plan.md
 * (the PRD in docs/references/merchant-insights-prd.md is reference only).
 *
 * Beats (typed prompt → response; runbook: docs/merchant-insights-flow.md).
 * Every typed prompt is a full sentence that makes sense on its own, so the
 * audience can follow a demo without the previous turn.
 *    1. /store-health How's my store doing this quarter?  → STORE_PICK
 *    2. pick Alpine (any option)  → SNAPSHOT (expand: dashboard with next best actions)
 *    3. "Break my Q3 revenue down by month. Is September on track to beat August?"
 *       (typed in the chat or the dashboard, which closes)  → MONTHS (expand: full page)
 *    4. "Which products are driving my growth the most, and are any of my top 10
 *       slipping?"  → PRODUCTS
 *    5. See trend (button)  → GRINDER (expand: full page)
 *    6. "Is the Testa Rossa Coffee Machine in a bundle or a promotion right now?"  → BUNDLE
 *    7. "Keep the Premium Grinder in mind, I'll come back to it. Do we have any stock
 *       that isn't selling?"  → DEAD_STOCK (Noted for later)
 *    8. Check returns (button)  → RETURNS
 *    9. "Remember the dead stock and the Travel Mug listing too. How are my buyer
 *       doing this quarter?"  → SEGMENTS (Noted for later)
 *   10. See trends (button on New Buyers) → NEW_BUYERS; on the other two
 *       rows → segmentMix
 *   11. "Which of my accounts might we be losing this quarter?"  → AT_RISK_BEAT
 *   12. View profile on Omega (button)  → OMEGA (expand: full page)
 *   13. "Remember Omega too. Now pull up everything I asked you to remember, and what
 *       I should do about each."  → RECAP (+ Slack card)
 *   14. "Set up the three promotions you suggested."  → draft (edit in the card, or
 *       type "Make the Premium Grinder promotion Loyal Customers only.")
 *   15. Create all 3 (button)  → promotions written to Salesforce (inactive, each
 *       with its audience); Make live on a row writes it live and shows the
 *       card again
 *   16. /export-report  → export picker
 *   17. Create PDF (button)  → file card → side preview
 *
 * Every insight card (and its full screen) has Export, which plays
 * `export|title|id` and drops a one-view PDF in the chat; Share is display only.
 *
 * "Today" in the script is **Sep 22**: Q3 to date, September partial. Numbers
 * reuse the PRD's (revenue $1.24M vs $1.5M goal, $310K / 128 open orders,
 * 12 orders in 24h at $2,140 AOV); dashboard-only detail is invented to match.
 *
 * Tool calls mirror the real project-codey insights skill: it resolves the
 * store first (asks when there are several), runs read-only queries through the
 * data360 `query-sql` step, and grounds the recent window + goals in live
 * Commerce (`search-order-summaries`, `get-business-objectives`).
 *
 * HOUSE STYLE: no em dashes; no AI filler; lead with the payload; business
 * terms only (never the systems underneath); bold what a merchant scans for.
 */

/** The MCP app identity for every slot header: Salesforce logo + name. */
const SF: CardApp = { name: "Salesforce Commerce", badge: "SF", logo: "/salesforce.svg" };

const INSIGHTS_SOR = "commerce-merchant-insights";
const QUERY_SOR = "data360-query";

/* ── Canonical data ───────────────────────────────────────────────────── */

/** Day of quarter (Jul 1 = day 1) → "Jul 14". */
function dateOf(day: number) {
  if (day <= 31) return `Jul ${day}`;
  if (day <= 62) return `Aug ${day - 31}`;
  return `Sep ${day - 62}`;
}

/** $K → "$784K" / "$1.24M". */
function money(k: number) {
  return k >= 1000 ? `$${(k / 1000).toFixed(2)}M` : `$${Math.round(k)}K`;
}

/** Cumulative Q3 revenue ($K) by day of quarter, weekly to today (day 84 =
 *  Sep 22). Monthly totals land on the PRD's figures: Jul $420K, Aug $455K,
 *  Sep to date $365K = $1.24M. Each point carries its hover annotation against
 *  the straight-line pace to the $1.5M goal. */
const REVENUE_TO_DATE: XY[] = [0, 91, 192, 281, 377, 482, 578, 688, 784, 893, 1004, 1126, 1240].map((y, i) => {
  const x = i * 7;
  if (!x) return { x, y };
  const gap = Math.round(y - (1500 * x) / 92);
  return {
    x,
    y,
    label: `Through ${dateOf(x)}`,
    display: money(y),
    detail: gap >= 0 ? `$${gap}K ahead of goal pace` : `$${-gap}K behind goal pace`,
  };
});

/** Weekly revenue ($K), the differences of the cumulative series. */
const WEEKLY = [91, 101, 89, 96, 105, 96, 110, 96, 109, 111, 122, 114];

/** Premium Grinder units by week (Jul 4 weeks = 38, Aug = 31, Sep 3 weeks =
 *  20, on pace for ~27). $770 a unit. */
const GRINDER_WEEKS = [
  { day: 7, units: 9 },
  { day: 14, units: 10 },
  { day: 21, units: 9 },
  { day: 28, units: 10 },
  { day: 38, units: 8 },
  { day: 45, units: 8 },
  { day: 52, units: 7 },
  { day: 59, units: 8 },
  { day: 69, units: 7 },
  { day: 76, units: 6 },
  { day: 83, units: 7 },
];

const QUARTER_TICKS = [
  { at: 0, label: "Jul 1" },
  { at: 31, label: "Aug 1" },
  { at: 62, label: "Sep 1" },
  { at: 92, label: "Sep 30" },
];

/* ── Reusable sections (cards, the dashboard, and report pages) ───────── */

const REVENUE_VS_GOAL: InsightSection = {
  type: "line",
  title: "Revenue vs goal",
  summary: "Running behind the pace needed for $1.5M since mid-August.",
  x: [0, 92],
  y: [0, 1600],
  xTicks: QUARTER_TICKS,
  yTicks: [
    { at: 0, label: "$0" },
    { at: 400, label: "$400K" },
    { at: 800, label: "$800K" },
    { at: 1200, label: "$1.2M" },
    { at: 1600, label: "$1.6M" },
  ],
  series: REVENUE_TO_DATE,
  seriesLabel: "Revenue to date",
  projection: [{ x: 92, y: 1373, label: "Quarter end, projected", display: "~$1.37M", detail: "~$130K short of the goal" }],
  projectionLabel: "Projected at September's pace",
  goal: [
    { x: 0, y: 0 },
    { x: 92, y: 1500 },
  ],
  goalLabel: "Pace to $1.5M goal",
  markers: [{ at: 84, label: "Today" }],
  endLabels: [
    { y: 1500, text: "Goal $1.5M", tone: "goal" },
    { y: 1373, text: "~$1.37M", tone: "viz" },
  ],
  height: 320,
};

const OBJECTIVES: InsightSection = {
  type: "objectives",
  rows: [
    { label: "Quarterly revenue", target: "$1.5M", actual: "$1.24M", progress: 0.83, status: { label: "Behind", tone: "warning" } },
    { label: "Avg. order value", target: "$2,050", actual: "$2,140", progress: 1.04, status: { label: "On track", tone: "success" } },
    { label: "Conversion rate", target: "3.2%", actual: "2.8%", progress: 0.875, status: { label: "Flat vs Q2", tone: "neutral" } },
  ],
};

const SNAPSHOT_KPIS: Kpi[] = [
  { label: "Revenue", value: "$1.24M", progress: 0.83, detail: "83% of $1.5M goal" },
  { label: "Open pipeline", value: "$310K", detail: "128 orders" },
  { label: "Orders, last 24 hours", value: "12", detail: "$2,140 avg. order" },
  {
    label: "Against objectives",
    rows: [
      { label: "Order value", delta: { label: "6%", tone: "success", direction: "up" } },
      { label: "Conversion", delta: { label: "Flat", tone: "neutral", direction: "flat" } },
    ],
  },
];

const MONTH_GOAL = { at: 500, label: "Monthly goal ($1.5M ÷ 3)", short: "$500K goal" };

const MONTHS_REVENUE: InsightSection = {
  type: "columns",
  yMax: 600,
  yTicks: [
    { at: 0, label: "$0" },
    { at: 200, label: "$200K" },
    { at: 400, label: "$400K" },
    { at: 600, label: "$600K" },
  ],
  bars: [
    { label: "July", value: 420, display: "$420K", hover: ["July", "$420K", "198 orders", "$80K under the monthly goal"] },
    { label: "August", value: 455, display: "$455K", hover: ["August", "$455K", "212 orders", "Best full month so far"] },
    {
      label: "September",
      value: 365,
      projected: 133,
      display: "~$498K",
      hover: ["September", "$365K so far", "~$498K at the current pace", "8 days left"],
    },
  ],
  goal: MONTH_GOAL,
  callout: { bar: 2, text: "On pace to beat August" },
  projectedLabel: "Projected, rest of September",
};

const MONTHS_ORDERS: InsightSection = {
  type: "columns",
  yMax: 300,
  yTicks: [
    { at: 0, label: "0" },
    { at: 100, label: "100" },
    { at: 200, label: "200" },
    { at: 300, label: "300" },
  ],
  bars: [
    { label: "July", value: 198, display: "198", hover: ["July", "198 orders", "$2,120 avg. order"] },
    { label: "August", value: 212, display: "212", hover: ["August", "212 orders", "$2,150 avg. order"] },
    {
      label: "September",
      value: 170,
      projected: 62,
      display: "~232",
      hover: ["September", "170 orders so far", "~232 at the current pace"],
    },
  ],
  callout: { bar: 2, text: "Most orders of the quarter" },
  projectedLabel: "Projected, rest of September",
};

const MONTHS_TOGGLE: InsightSection = {
  type: "toggle",
  title: "Monthly totals",
  summary: "September is on pace to be the best month of the quarter.",
  options: [
    { label: "Revenue", sections: [MONTHS_REVENUE] },
    { label: "Orders", sections: [MONTHS_ORDERS] },
  ],
};

const WEEKLY_LINE: InsightSection = {
  type: "line",
  title: "Revenue by week",
  summary: "The three best weeks of the quarter were all in September.",
  x: [1, 12],
  y: [0, 140],
  xTicks: [
    { at: 1, label: "Jul 7" },
    { at: 5, label: "Aug 4" },
    { at: 9, label: "Sep 1" },
    { at: 12, label: "Sep 22" },
  ],
  yTicks: [
    { at: 0, label: "$0" },
    { at: 40, label: "$40K" },
    { at: 80, label: "$80K" },
    { at: 120, label: "$120K" },
  ],
  series: WEEKLY.map((y, i) => ({
    x: i + 1,
    y,
    label: `Week ending ${dateOf((i + 1) * 7)}`,
    display: `$${y}K`,
    detail: y >= 110 ? "One of the strongest weeks" : undefined,
  })),
  seriesLabel: "Weekly revenue",
  height: 260,
};

const TOP_PRODUCTS: InsightSection = {
  type: "ranked",
  columns: { name: "Product", value: "Q3 revenue", delta: "vs Q2", spark: "Jul to Sep" },
  rows: [
    {
      name: "Testa Rossa Coffee Machine",
      detail: "Machines",
      value: 180,
      display: "$180K",
      delta: { label: "22%", tone: "success", direction: "up" },
      spark: [54, 60, 66],
      sparkLabels: ["Jul $54K", "Aug $60K", "Sep ~$66K"],
    },
    {
      name: "Standard Filter (6-pack)",
      detail: "Filters",
      value: 96,
      display: "$96K",
      delta: { label: "8%", tone: "success", direction: "up" },
      spark: [30, 32, 34],
      sparkLabels: ["Jul $30K", "Aug $32K", "Sep ~$34K"],
    },
    {
      name: "Premium Grinder",
      detail: "Grinders",
      value: 69,
      display: "$69K",
      delta: { label: "4%", tone: "danger", direction: "down" },
      spark: [38, 31, 27],
      sparkLabels: ["Jul 38 units", "Aug 31 units", "Sep ~27 units"],
      note: "Only top-10 product trending down",
      highlight: true,
      action: { label: "See trend", prompt: "Show me the Premium Grinder trend" },
    },
    {
      name: "Milk Frother Pro",
      detail: "Accessories",
      value: 61,
      display: "$61K",
      delta: { label: "5%", tone: "success", direction: "up" },
      spark: [19, 20, 22],
      sparkLabels: ["Jul $19K", "Aug $20K", "Sep ~$22K"],
    },
    {
      name: "Barista Starter Kit",
      detail: "Bundle",
      value: 58,
      display: "$58K",
      delta: { label: "11%", tone: "success", direction: "up" },
      spark: [17, 19, 22],
      sparkLabels: ["Jul $17K", "Aug $19K", "Sep ~$22K"],
    },
  ],
  meta: "Showing 5 of the top 10 · the other 5 are all up on Q2",
};

const GRINDER_KPIS: InsightSection = {
  type: "kpis",
  items: [
    { label: "Units, September", value: "20", detail: "so far · on pace for ~27" },
    { label: "Units, July", value: "38", detail: "down 29% since" },
    { label: "Q3 revenue", value: "$69K", delta: { label: "4%", tone: "danger", direction: "down" }, detail: "vs Q2" },
    { label: "Price", value: "$770", detail: "unchanged since May" },
  ],
};

const GRINDER_TREND: InsightSection = {
  type: "toggle",
  title: "Weekly sales",
  summary: "Sales started falling the week a competitor discounted a similar grinder.",
  options: [
    {
      label: "Units",
      sections: [
        {
          type: "line",
          x: [0, 92],
          y: [0, 12],
          xTicks: QUARTER_TICKS,
          yTicks: [
            { at: 0, label: "0" },
            { at: 4, label: "4" },
            { at: 8, label: "8" },
            { at: 12, label: "12" },
          ],
          series: GRINDER_WEEKS.map((w) => ({
            x: w.day,
            y: w.units,
            label: `Week ending ${dateOf(w.day)}`,
            display: `${w.units} units`,
            detail: `$${((w.units * 770) / 1000).toFixed(1)}K`,
          })),
          seriesLabel: "Units sold",
          markers: [
            { at: 43, label: "Competitor discount starts" },
            { at: 84, label: "Today" },
          ],
          height: 260,
        },
      ],
    },
    {
      label: "Revenue",
      sections: [
        {
          type: "line",
          x: [0, 92],
          y: [0, 9],
          xTicks: QUARTER_TICKS,
          yTicks: [
            { at: 0, label: "$0" },
            { at: 3, label: "$3K" },
            { at: 6, label: "$6K" },
            { at: 9, label: "$9K" },
          ],
          series: GRINDER_WEEKS.map((w) => ({
            x: w.day,
            y: (w.units * 770) / 1000,
            label: `Week ending ${dateOf(w.day)}`,
            display: `$${((w.units * 770) / 1000).toFixed(1)}K`,
            detail: `${w.units} units`,
          })),
          seriesLabel: "Revenue",
          markers: [
            { at: 43, label: "Competitor discount starts" },
            { at: 84, label: "Today" },
          ],
          height: 260,
        },
      ],
    },
  ],
};

const GRINDER_FACTS: InsightSection = {
  type: "facts",
  items: [
    { label: "Status", pill: { label: "Active", tone: "success" } },
    { label: "Stock", value: "84 units" },
    { label: "Store", value: "Published to Alpine" },
    { label: "Promotions", value: "No bundle or promotion" },
  ],
};

const DEAD_STOCK_BARS: InsightSection = {
  type: "hbars",
  title: "Days since last sale",
  summary: "3 products, about $28K of stock.",
  max: 90,
  ticks: [
    { at: 0, label: "0" },
    { at: 30, label: "30" },
    { at: 90, label: "90 days" },
  ],
  threshold: { at: 60, label: "60 days" },
  columns: { label: "Product", value: "Days", extra: "Stock" },
  rows: [
    {
      label: "Pour-Over Set",
      detail: "340 units",
      value: 74,
      display: "74 days",
      extra: "$11.6K",
      hover: ["Pour-Over Set", "Last sold Jul 10", "340 units · $11.6K"],
    },
    {
      label: "Travel Mug (Teal)",
      detail: "210 units",
      value: 68,
      display: "68 days",
      extra: "$9.0K",
      tag: { label: "High returns", tone: "warning" },
      hover: ["Travel Mug (Teal)", "Last sold Jul 16", "210 units · $9.0K"],
    },
    {
      label: "Descaling Kit",
      detail: "190 units",
      value: 61,
      display: "61 days",
      extra: "$7.4K",
      hover: ["Descaling Kit", "Last sold Jul 23", "190 units · $7.4K"],
    },
  ],
};

const RETURNS_KPIS: InsightSection = {
  type: "kpis",
  items: [
    { label: "Return rate", value: "3.1%", delta: { label: "0.7 pts", tone: "success", direction: "down" }, detail: "down from 3.8% in Q1" },
    { label: "Orders with a return", value: "41", detail: "of 1,320" },
    { label: "Refunded", value: "$38K", detail: "2.6% of revenue" },
  ],
};

const RETURNS_BARS: InsightSection = {
  type: "hbars",
  title: "Return rate by product",
  max: 12,
  ticks: [
    { at: 0, label: "0%" },
    { at: 8, label: "8%" },
    { at: 12, label: "12%" },
  ],
  threshold: { at: 3.1, label: "Store avg. 3.1%" },
  rows: [
    {
      label: "Travel Mug (Teal)",
      value: 11,
      display: "11.0%",
      highlight: true,
      hover: ["Travel Mug (Teal)", "11.0% returned", "3.5× the store average", "23 of 210 orders"],
    },
    { label: "Pour-Over Set", value: 4.2, display: "4.2%", hover: ["Pour-Over Set", "4.2% returned", "9 of 214 orders"] },
    { label: "Milk Frother Pro", value: 3.4, display: "3.4%", hover: ["Milk Frother Pro", "3.4% returned", "8 of 236 orders"] },
    { label: "Standard Filter (6-pack)", value: 1.2, display: "1.2%", hover: ["Standard Filter (6-pack)", "1.2% returned"] },
    { label: "Testa Rossa Coffee Machine", value: 0.8, display: "0.8%", hover: ["Testa Rossa Coffee Machine", "0.8% returned"] },
  ],
};

const MUG_REASONS: InsightSection = {
  type: "stacked",
  title: "Why Travel Mugs come back",
  total: "23 returns",
  parts: [
    { label: "Color not as expected", value: 64, display: "64%", detail: "15 returns" },
    { label: "Arrived damaged", value: 18, display: "18%", detail: "4 returns" },
    { label: "Too small", value: 12, display: "12%", detail: "3 returns" },
    { label: "Other", value: 6, display: "6%", detail: "1 return" },
  ],
};

const SEGMENTS_TABLE: InsightSection = {
  type: "ranked",
  columns: { name: "Segment", value: "Q3 revenue", extra: "Avg. order", delta: "vs Q2" },
  rows: [
    {
      name: "OEM Partners",
      detail: "64 accounts",
      value: 520,
      display: "$520K",
      extra: "$4,100",
      delta: { label: "14%", tone: "success", direction: "up" },
      action: { label: "See trends", prompt: "What are OEM Partners mostly buying?" },
    },
    {
      name: "Loyal Customers",
      detail: "210 accounts",
      value: 310,
      display: "$310K",
      extra: "$1,950",
      delta: { label: "3%", tone: "success", direction: "up" },
      action: { label: "See trends", prompt: "What are Loyal Customers mostly buying?" },
    },
    {
      name: "New Buyers",
      detail: "138 accounts",
      value: 88,
      display: "$88K",
      extra: "$640",
      delta: { label: "41%", tone: "success", direction: "up" },
      note: "Fastest growing, lowest order value",
      action: { label: "See trends", prompt: "What are New Buyers mostly buying?" },
    },
  ],
  meta: "Accounts outside these segments: $322K",
};

const NEW_BUYER_MIX: Extract<InsightSection, { type: "mix" }> = {
  type: "mix",
  title: "Spend by category",
  summary: "New Buyers vs the whole store, Q3 to date.",
  categories: ["Filters", "Accessories", "Grinders", "Machines"],
  rows: [
    { label: "New Buyers", parts: [52, 31, 13, 4] },
    { label: "Store average", parts: [24, 14, 20, 42] },
  ],
  callout: { row: 0, part: 3, text: "Hardly any machines" },
};

const AT_RISK: InsightSection = {
  type: "risk",
  rows: [
    {
      name: "TSV Distributors",
      segment: "OEM Partners",
      signal: { kind: "trend", points: [17, 16, 9], labels: ["Q1 $17K", "Q2 $16K", "Q3 $9K"] },
      signalText: "47 days since last order (usually 14)",
      annual: "$62K",
      action: { label: "View profile", prompt: "Tell me more about TSV Distributors" },
    },
    {
      name: "Omega Inc",
      segment: "Loyal Customers",
      signal: { kind: "trend", points: [22, 19, 12], labels: ["Q1 $22K", "Q2 $19K", "Q3 $12K"] },
      signalText: "Spend down 38% vs Q2",
      annual: "$48K",
      action: { label: "View profile", prompt: "Tell me more about Omega Inc" },
    },
    {
      name: "Bluewater Supply",
      segment: "Loyal Customers",
      signal: { kind: "trend", points: [8, 8, 5], labels: ["Q1 $8K", "Q2 $8K", "Q3 $5K"] },
      signalText: "Stopped ordering filters in August",
      annual: "$30K",
      action: { label: "View profile", prompt: "Tell me more about Bluewater Supply" },
    },
  ],
};

/* ── At-risk account pages (Omega, TSV, Bluewater) ─────────────────────── */

const ACCOUNT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

/** One at-risk account's page: the same report for each, with its own
 *  numbers. `main` is the falling line (machines, or Bluewater's filters);
 *  `other` the one it's compared with. Spend in $K. */
interface Account {
  id: "omega" | "tsv" | "bluewater";
  name: string;
  segment: string;
  since: string;
  kpis: Kpi[];
  /** Q1–Q3 spend; Q3 so far, plus what the pace adds by quarter end. */
  quarters: [number, number, number];
  projected?: number;
  quarterHover: [string, string, string];
  yMax: number;
  main: { label: string; values: number[] };
  other: { label: string; values: number[] };
  lineMax: number;
  summary: string;
  marker: { at: number; label: string };
  orders: [string, string, string, string][];
  ordersMeta: string;
  contacts: [string, string, string][];
  /** The reply's text, the report's one-line takeaway, and the beat's thinking. */
  text: string;
  takeaway: string;
  /** The report page's key points. */
  points: string[];
  thinking: string;
}

const ACCOUNTS: Record<Account["id"], Account> = {
  omega: {
    id: "omega",
    name: "Omega Inc",
    segment: "Loyal Customers",
    since: "2021",
    kpis: [
      { label: "Q3 revenue", value: "$12K", delta: { label: "38%", tone: "danger", direction: "down" }, detail: "vs Q2" },
      { label: "Last machine order", value: "45 days", detail: "Aug 8" },
      { label: "Main contact last login", value: "39 days", detail: "Priya Raman · Aug 14" },
    ],
    quarters: [22, 19, 12],
    projected: 2,
    quarterHover: ["Machines $16K · Filters $6K", "Machines $13K · Filters $6K", "Machines $6K · Filters $6K"],
    yMax: 25,
    main: { label: "Machines", values: [5.2, 4.8, 6.1, 4.6, 4.2, 4.2, 4.0, 2.2, 0] },
    other: { label: "Filters", values: [1.8, 1.9, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 1.8] },
    lineMax: 8,
    summary: "Filters are steady; machine orders stopped after August.",
    marker: { at: 8, label: "Last machine order" },
    orders: [
      ["00012893", "Standard Filter (6-pack) ×20", "Sep 14", "$980"],
      ["00012611", "Standard Filter (6-pack) ×20", "Aug 31", "$980"],
      ["00012240", "Compact Espresso Machine ×1", "Aug 8", "$2,200"],
      ["00011987", "Testa Rossa Coffee Machine ×1", "Jul 22", "$3,090"],
    ],
    ordersMeta: "Showing 4 of 19 orders this year",
    contacts: [
      ["Priya Raman", "Purchasing manager · buys machines", "Aug 14 · 39 days ago"],
      ["Marco Bell", "Operations · reorders filters", "Sep 14 · 8 days ago"],
    ],
    text: "**Omega Inc** spent **$12K** this quarter, down 38% from Q2. They **haven't ordered a machine since Aug 8**, and their main contact hasn't logged in for **39 days**. Filter orders are still coming in, so the account isn't gone.",
    takeaway: "Down 38% on Q2, no machine orders since Aug 8; filters still coming in.",
    points: ["Main contact Priya Raman last logged in Aug 14, 39 days ago", "Q3 on pace for about $14K, against $19K in Q2"],
    thinking: "Pulling Omega Inc's orders this year",
  },
  tsv: {
    id: "tsv",
    name: "TSV Distributors",
    segment: "OEM Partners",
    since: "2019",
    kpis: [
      { label: "Q3 revenue", value: "$9K", delta: { label: "44%", tone: "danger", direction: "down" }, detail: "vs Q2" },
      { label: "Last order", value: "47 days", detail: "Aug 6 · usually every 14" },
      { label: "Buyer last login", value: "51 days", detail: "Dana Ortiz · Aug 2" },
    ],
    quarters: [17, 16, 9],
    quarterHover: ["Machines $11K · Filters $6K", "Machines $11K · Filters $5K", "Machines $6K · Filters $3K"],
    yMax: 20,
    main: { label: "Machines", values: [3.8, 3.6, 3.9, 3.4, 3.6, 3.5, 4.6, 1.6, 0] },
    other: { label: "Filters", values: [1.9, 1.8, 2.0, 1.8, 1.9, 1.8, 2.0, 0.8, 0] },
    lineMax: 6,
    summary: "Machines and filters both stopped after the Aug 6 order.",
    marker: { at: 8, label: "Last order" },
    orders: [
      ["00012205", "Commercial Grinder ×1 · Filters ×16", "Aug 6", "$2,400"],
      ["00011932", "Testa Rossa Coffee Machine ×1 · Filters ×20", "Jul 23", "$4,090"],
      ["00011804", "Compact Espresso Machine ×1", "Jul 9", "$2,200"],
      ["00011750", "Standard Filter (6-pack) ×6", "Jul 2", "$310"],
    ],
    ordersMeta: "Showing 4 of 22 orders this year",
    contacts: [
      ["Dana Ortiz", "Buyer · places every order", "Aug 2 · 51 days ago"],
      ["Luis Moreno", "Accounts payable", "Aug 20 · 33 days ago"],
    ],
    text: "**TSV Distributors** usually orders every 14 days. The last order was **47 days ago** (Aug 6), and their buyer, Dana Ortiz, last logged in Aug 2. Nothing is open in the pipeline for them.",
    takeaway: "No order in 47 days against a usual 14; Q3 down 44% on Q2.",
    points: ["Buyer Dana Ortiz last logged in Aug 2, 51 days ago", "Nothing open in the pipeline"],
    thinking: "Pulling TSV Distributors' orders this year",
  },
  bluewater: {
    id: "bluewater",
    name: "Bluewater Supply",
    segment: "Loyal Customers",
    since: "2020",
    kpis: [
      { label: "Q3 revenue", value: "$5K", delta: { label: "38%", tone: "danger", direction: "down" }, detail: "vs Q2" },
      { label: "Last filter order", value: "39 days", detail: "Aug 14 · was monthly" },
      { label: "Last machine order", value: "12 days", detail: "Sep 10" },
    ],
    quarters: [8, 8, 5],
    projected: 1,
    quarterHover: ["Filters $7.5K · Machines $0.5K", "Filters $7.5K · Machines $0.5K", "Filters $3.7K · Machines $1.3K"],
    yMax: 10,
    main: { label: "Filters", values: [2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 1.2, 0] },
    other: { label: "Machines & parts", values: [0.2, 0.1, 0.2, 0.2, 0.2, 0.1, 0.3, 0.2, 0.8] },
    lineMax: 4,
    summary: "Filter orders stopped after Aug 14; machines and parts still come in.",
    marker: { at: 8, label: "Last filter order" },
    orders: [
      ["00012877", "Grinder burr set ×4", "Sep 10", "$780"],
      ["00012390", "Standard Filter (6-pack) ×24", "Aug 14", "$1,180"],
      ["00012102", "Standard Filter (6-pack) ×50", "Jul 30", "$2,450"],
      ["00011890", "Descaling tablets ×10", "Jul 18", "$220"],
    ],
    ordersMeta: "Showing 4 of 16 orders this year",
    contacts: [
      ["Ken Whitaker", "Purchasing · orders filters", "Aug 14 · 39 days ago"],
      ["Amy Cho", "Service lead · orders parts", "Sep 10 · 12 days ago"],
    ],
    text: "**Bluewater Supply** still orders machines and parts, but **stopped buying filters** after Aug 14, about $2.5K a month. They may have found another filter supplier.",
    takeaway: "Stopped buying filters after Aug 14, about $2.5K a month; machines still come in.",
    points: ["Filters were about $2.5K a month through July", "May have found another filter supplier"],
    thinking: "Pulling Bluewater Supply's orders this year",
  },
};

const k = (n: number) => `$${n}K`;

const accountKpis = (a: Account): InsightSection => ({ type: "kpis", items: a.kpis });

function accountQuarters(a: Account): InsightSection {
  const [q1, q2, q3] = a.quarters;
  const step = a.yMax / 2.5;
  return {
    type: "columns",
    title: "Revenue by quarter",
    yMax: a.yMax,
    yTicks: [0, 1, 2].map((i) => ({ at: i * step, label: i ? k(i * step) : "$0" })),
    bars: [
      { label: "Q1", value: q1, display: k(q1), hover: ["Q1", k(q1), a.quarterHover[0]] },
      { label: "Q2", value: q2, display: k(q2), hover: ["Q2", k(q2), a.quarterHover[1]] },
      {
        label: "Q3",
        value: q3,
        ...(a.projected ? { projected: a.projected } : {}),
        display: a.projected ? `~${k(q3 + a.projected)}` : k(q3),
        tone: "danger",
        hover: a.projected
          ? ["Q3", `${k(q3)} so far`, `~${k(q3 + a.projected)} at the current pace`, a.quarterHover[2]]
          : ["Q3", k(q3), "Nothing ordered since", a.quarterHover[2]],
      },
    ],
    ...(a.projected ? { projectedLabel: "Projected, rest of Q3" } : {}),
    height: 240,
  };
}

function accountMix(a: Account): InsightSection {
  const step = a.lineMax / 2;
  return {
    type: "line",
    title: `${a.main.label} vs ${a.other.label.toLowerCase()}`,
    summary: a.summary,
    x: [1, 9],
    y: [0, a.lineMax],
    xTicks: ACCOUNT_MONTHS.map((m, i) => ({ at: i + 1, label: m })),
    yTicks: [0, 1, 2].map((i) => ({ at: i * step, label: i ? k(i * step) : "$0" })),
    series: a.main.values.map((y, i) => ({
      x: i + 1,
      y,
      label: ACCOUNT_MONTHS[i],
      display: `$${y.toFixed(1)}K`,
      detail: y === 0 ? `No ${a.main.label.toLowerCase()} orders` : undefined,
    })),
    seriesLabel: a.main.label,
    compare: a.other.values.map((y, i) => ({ x: i + 1, y, display: `$${y.toFixed(1)}K` })),
    compareLabel: a.other.label,
    markers: [a.marker],
    height: 260,
  };
}

/* ── The store dashboard (Alpine snapshot, full screen) ───────────────── */

/** Next best actions atop the dashboard: two drill-downs that post a full,
 *  standalone prompt, and one that goes to Commerce (display only). */
const NEXT_ACTIONS: InsightSection = {
  type: "next",
  items: [
    {
      icon: "growth",
      title: "Close the ~$130K gap",
      body: "September's pace gets you to ~$1.37M. Your best sellers are the fastest way to the rest.",
      cta: { label: "See top products", prompt: "Which products are driving my growth the most, and are any of my top 10 slipping?" },
    },
    {
      icon: "accounts",
      title: "Win back quiet accounts",
      body: "3 accounts have gone quiet. Together they're worth about $140K a year.",
      cta: { label: "See at-risk accounts", prompt: "Which of my accounts might we be losing this quarter?" },
    },
    {
      icon: "orders",
      title: "Approve 22 waiting orders",
      body: "$52K is waiting on approval. Approving it this week counts it toward Q3.",
      cta: { label: "Open approvals", href: "commerce://orders?status=awaiting-approval" },
    },
  ],
};

/** Health by area: one 0–100 score per part of the store, the two below the
 *  healthy line highlighted. An active store, so catalog and pricing are near
 *  full; the low scores point at the same problems the journey digs into. */
const HEALTH_BY_AREA: InsightSection = {
  type: "hbars",
  max: 100,
  ticks: [
    { at: 0, label: "0" },
    { at: 50, label: "50" },
    { at: 100, label: "100" },
  ],
  threshold: { at: 75, label: "Healthy at 75+" },
  columns: { label: "Area", value: "Score" },
  rows: [
    { label: "Pricing coverage", detail: "All 1,284 products priced", value: 98, display: "98" },
    { label: "Catalog completeness", detail: "2 products missing images", value: 96, display: "96" },
    { label: "Product momentum", detail: "1 top-10 product trending down", value: 84, display: "84" },
    { label: "Returns", detail: "Travel Mug (Teal) at 11%", value: 79, display: "79" },
    { label: "Inventory health", detail: "3 products unsold for 60+ days", value: 72, display: "72", highlight: true },
    { label: "Account retention", detail: "3 accounts slipping", value: 68, display: "68", highlight: true },
  ],
};

/** The accounts strip on the dashboard, over the at-risk list. */
const ACCOUNT_KPIS: InsightSection = {
  type: "kpis",
  items: [
    { label: "Active accounts", value: "486", delta: { label: "5%", tone: "success", direction: "up" }, detail: "vs Q2" },
    { label: "New this quarter", value: "41", detail: "Most join New Buyers" },
    { label: "Repeat buyers", value: "72%", detail: "Ordered more than once" },
    { label: "At risk", value: "3", detail: "$140K in annual spend" },
  ],
};

/** The full-screen store dashboard. */
function dashboard(): InsightPage {
  return {
    title: "Alpine store health",
    subtitle: "Q3 to date · Jul 1 to Sep 22 · updated today",
    groups: [
      { title: "Next best actions", sections: [NEXT_ACTIONS] },
      { title: "Health by area", sections: [HEALTH_BY_AREA] },
      {
        title: "Revenue",
        sections: [
          {
            type: "kpis",
            items: [
              { label: "Revenue to date", value: "$1.24M", progress: 0.83, detail: "83% of $1.5M goal" },
              { label: "Projected quarter end", value: "~$1.37M", detail: "at September's pace" },
              { label: "Gap to goal", value: "~$130K", detail: "with 8 days left" },
              { label: "Avg. order value", value: "$2,140", delta: { label: "6%", tone: "success", direction: "up" }, detail: "vs Q2" },
            ],
          },
          REVENUE_VS_GOAL,
        ],
      },
      {
        title: "Orders",
        sections: [
          {
            type: "stacked",
            title: "Open pipeline by status",
            total: "$310K across 128 orders",
            parts: [
              { label: "Awaiting approval", value: 52, display: "$52K", detail: "22 orders" },
              { label: "Ready to fulfill", value: 94, display: "$94K", detail: "39 orders" },
              { label: "In fulfillment", value: 121, display: "$121K", detail: "48 orders" },
              { label: "Shipped", value: 43, display: "$43K", detail: "19 orders" },
            ],
          },
          {
            type: "table",
            title: "Last 24 hours",
            columns: [{ label: "Account" }, { label: "Items" }, { label: "Placed" }, { label: "Total", align: "right" }],
            rows: [
              ["Northline Café Group", { text: "Testa Rossa Coffee Machine ×2", muted: true }, { text: "1 hr ago", muted: true }, { text: "$6,180", strong: true }],
              ["Harbor Hospitality", { text: "Standard Filter (6-pack) ×40", muted: true }, { text: "3 hrs ago", muted: true }, { text: "$1,960", strong: true }],
              ["Bean & Barrel Roasters", { text: "Premium Grinder ×3", muted: true }, { text: "5 hrs ago", muted: true }, { text: "$2,310", strong: true }],
              ["Crema Collective", { text: "Milk Frother Pro ×6", muted: true }, { text: "8 hrs ago", muted: true }, { text: "$1,440", strong: true }],
              ["Summit Office Supply", { text: "Standard Filter (6-pack) ×25", muted: true }, { text: "11 hrs ago", muted: true }, { text: "$1,225", strong: true }],
              ["Metro Coffee Service", { text: "Testa Rossa Coffee Machine ×1", muted: true }, { text: "19 hrs ago", muted: true }, { text: "$3,090", strong: true }],
            ],
            meta: "Showing 6 of 12 orders · $25,680 total · $2,140 avg. order",
          },
        ],
      },
      { title: "Accounts", sections: [ACCOUNT_KPIS, { ...(AT_RISK as Extract<InsightSection, { type: "risk" }>), title: "At-risk accounts" }] },
      { title: "Business objectives", sections: [OBJECTIVES] },
    ],
  };
}

const SNAPSHOT_VIEW: Extract<SlotView, { kind: "insight" }> = {
  kind: "insight",
  heading: "Store health",
  subtitle: "Alpine · Q3 to date (Jul 1 to Sep 22)",
  sections: [{ type: "kpis", items: SNAPSHOT_KPIS }],
  full: dashboard(),
};

const SNAPSHOT_CARD: SlotBlock = {
  type: "slot",
  mode: "inline-card",
  app: SF,
  expandable: true,
  exportAs: { id: "snapshot", title: "Alpine · Store health" },
  view: SNAPSHOT_VIEW,
};

/* ── Beats ────────────────────────────────────────────────────────────── */

/** Step 1 — /store-health with no store named: the skill resolves the store
 *  scope first and, with several live stores, asks (never guesses). */
const STORE_PICK: ScriptedResponse = {
  skill: "store-health",
  tools: [
    { name: "discover", target: "commerce insights" },
    { name: "get_sor_detail", target: INSIGHTS_SOR },
    { name: "dispatch_readonly", target: INSIGHTS_SOR },
  ],
  thinking: [
    { label: "Loading the store health skill", delay: 900 },
    { label: "Finding your live stores", delay: 1100 },
  ],
  response: [
    {
      type: "text",
      content: "You have **3 live stores**. Which one should I check, or should I look across all of them?",
    },
    {
      type: "slot",
      mode: "inline-card",
      app: SF,
      view: {
        kind: "select",
        options: [
          { label: "Alpine", detail: "Coffee equipment · B2B", meta: "580 orders this quarter", prompt: "Alpine" },
          { label: "Barista Pro Online", detail: "Home espresso · B2C", meta: "3,860 orders", prompt: "Barista Pro Online" },
          { label: "Partner Wholesale", detail: "Distributor portal · B2B", meta: "212 orders", prompt: "Partner Wholesale" },
          { label: "All stores", detail: "Each store side by side, plus the total", prompt: "All stores" },
        ],
      },
    },
  ],
};

/** Step 2 — the Alpine store health snapshot (expands to the dashboard). */
const SNAPSHOT: ScriptedResponse = {
  suggestions: [
    { label: "Open the full dashboard", expand: true },
    { label: "Why 83%?" },
    { label: "Compare to Q2" },
  ],
  skill: "store-health",
  tools: [
    { name: "dispatch_readonly", target: QUERY_SOR },
    { name: "dispatch_readonly", target: "search-order-summaries" },
    { name: "dispatch_readonly", target: "get-business-objectives" },
  ],
  thinking: [
    { label: "Pulling Alpine's revenue for the quarter", delay: 1100 },
    { label: "Checking open orders and the last 24 hours", delay: 1100 },
    { label: "Comparing against your business objectives", delay: 1000 },
  ],
  response: [
    {
      type: "text",
      content:
        "Here's **Alpine** for Q3 to date. You're at **83% of your $1.5M revenue goal** with 8 days left in the quarter. Average order value is **up 6%**, but conversion is **flat**.",
    },
    SNAPSHOT_CARD,
    {
      type: "text",
      content: "Want me to break this down further, by month, product, segment, or account?",
    },
  ],
};

const MONTHS_THINKING = [
  { label: "Splitting Q3 revenue by month", delay: 1100 },
  { label: "Projecting the rest of September", delay: 1000 },
];

/** The Revenue by month card (expands to its own page: by month, by week). */
const MONTHS_CARD: SlotBlock = {
  type: "slot",
  mode: "inline-card",
  app: SF,
  expandable: true,
  exportAs: { id: "months", title: "Alpine · Revenue by month" },
  view: {
    kind: "insight",
    heading: "Revenue by month",
    subtitle: "Alpine · Q3 to date",
    sections: [MONTHS_TOGGLE],
    full: {
      title: "Revenue by month",
      subtitle: "Alpine · Q3 to date · Jul 1 to Sep 22",
      groups: [
        { title: "By month", sections: [MONTHS_TOGGLE] },
        { title: "By week", sections: [WEEKLY_LINE] },
      ],
    },
  },
};

/** Step 3 — by month. Asked from the chat or the full-screen dashboard (which
 *  closes), the answer is a card in the transcript that expands to its own page. */
const MONTHS: ScriptedResponse = {
  suggestions: [
    { label: "What's selling best?", prompt: "Which products are driving my growth the most, and are any of my top 10 slipping?" },
    { label: "Forecast October" },
  ],
  tools: [{ name: "dispatch_readonly", target: QUERY_SOR }],
  thinking: MONTHS_THINKING,
  response: [
    {
      type: "text",
      content:
        "Yes, if the pace holds. September is at **$365K** with 8 days left, on pace for **~$498K**, ahead of August's **$455K**. It's still just under the **$500K** a month the goal needs.",
    },
    MONTHS_CARD,
  ],
};

/** Step 4 — top products, one slipping. */
const PRODUCTS: ScriptedResponse = {
  suggestions: [
    { label: "See the Grinder trend", prompt: "Show me the Premium Grinder trend" },
    { label: "Compare to last year" },
    { label: "Which ones are new?" },
  ],
  tools: [{ name: "dispatch_readonly", target: QUERY_SOR }],
  thinking: [
    { label: "Ranking Alpine's products by Q3 revenue", delay: 1100 },
    { label: "Comparing each against Q2", delay: 900 },
  ],
  response: [
    {
      type: "text",
      content:
        "The **Testa Rossa Coffee Machine** is driving it: **$180K**, up 22% on Q2. One problem: the **Premium Grinder** is the only top-10 product going down, from **38 units in July to 31 in August**, and September is pacing for about 27.",
    },
    {
      type: "slot",
      mode: "inline-card",
      app: SF,
      exportAs: { id: "products", title: "Alpine · Top products" },
      view: { kind: "insight", heading: "Top products", subtitle: "By revenue · Q3 vs Q2", sections: [TOP_PRODUCTS] },
    },
  ],
};

/** Step 5 — the Premium Grinder trend (expands to a full page). */
const GRINDER: ScriptedResponse = {
  suggestions: [
    { label: "Check the bestseller's deals", prompt: "Is the Testa Rossa Coffee Machine in a bundle or a promotion right now?" },
    { label: "Match the competitor" },
  ],
  tools: [
    { name: "dispatch_readonly", target: QUERY_SOR },
    { name: "dispatch_readonly", target: "get-product" },
  ],
  thinking: [
    { label: "Pulling 90 days of Premium Grinder sales", delay: 1100 },
    { label: "Checking price, stock and promotions", delay: 1000 },
  ],
  response: [
    {
      type: "text",
      content:
        "Sales started falling the week of **Aug 12**, when a competitor began discounting a similar grinder. Nothing changed on your side: the price, stock and listing are the same, and it's **not in any bundle or promotion**.",
    },
    {
      type: "slot",
      mode: "floating",
      app: SF,
      exportAs: { id: "grinder", title: "Alpine · Premium Grinder" },
      expandable: true,
      view: {
        kind: "insight",
        heading: "Premium Grinder",
        subtitle: "Last 90 days",
        sections: [GRINDER_KPIS, GRINDER_TREND, GRINDER_FACTS],
        full: {
          title: "Premium Grinder",
          subtitle: "Grinders · $770 · last 90 days",
          groups: [
            { title: "Sales", sections: [GRINDER_KPIS, GRINDER_TREND] },
            {
              title: "Who's buying it",
              sections: [
                {
                  type: "stacked",
                  title: "Q3 revenue by segment",
                  total: "$69K",
                  parts: [
                    { label: "Loyal Customers", value: 58, display: "$40K", detail: "Down 9% vs Q2" },
                    { label: "OEM Partners", value: 30, display: "$21K", detail: "Flat vs Q2" },
                    { label: "New Buyers", value: 12, display: "$8K", detail: "Up 6% vs Q2" },
                  ],
                },
              ],
            },
            { title: "Product status", sections: [GRINDER_FACTS] },
          ],
        },
      },
    },
  ],
};

/** The Barista Starter Kit bundle (card + report page). */
const BUNDLE_SECTIONS: InsightSection[] = [
  {
    type: "facts",
    items: [
      { label: "Status", pill: { label: "Active", tone: "success" } },
      { label: "Bundle price", value: "$3,150" },
      { label: "Buyer saves", value: "$278" },
      { label: "Promotions", value: "No active promotion" },
    ],
  },
  {
    type: "table",
    title: "In the bundle",
    columns: [{ label: "Product" }, { label: "Qty" }, { label: "List price", align: "right" }],
    rows: [
      ["Testa Rossa Coffee Machine", { text: "1", muted: true }, { text: "$3,090", strong: true }],
      ["Milk Frother Pro", { text: "1", muted: true }, { text: "$240", strong: true }],
      ["Standard Filter (6-pack)", { text: "2", muted: true }, { text: "$98", strong: true }],
    ],
    meta: "$3,428 bought separately",
  },
];

/** Step 6 — is the Testa Rossa in a bundle or promotion? */
const BUNDLE: ScriptedResponse = {
  suggestions: [
    { label: "Build a new bundle" },
    { label: "Show bundle sales" },
  ],
  tools: [
    { name: "dispatch_readonly", target: "get-product" },
    { name: "dispatch_readonly", target: "promotion-management" },
  ],
  thinking: [
    { label: "Looking up the Testa Rossa's bundles", delay: 900 },
    { label: "Checking active promotions", delay: 800 },
  ],
  response: [
    {
      type: "text",
      content:
        "It's in one bundle, the **Barista Starter Kit**, and has **no active promotion**. So its 22% growth is coming from full-price sales.",
    },
    {
      type: "slot",
      mode: "inline-card",
      app: SF,
      exportAs: { id: "bundle", title: "Alpine · Barista Starter Kit" },
      view: {
        kind: "insight",
        heading: "Barista Starter Kit",
        subtitle: "Bundle · Alpine",
        sections: BUNDLE_SECTIONS,
      },
    },
  ],
};

/** Step 7 — note the Grinder; dead stock. */
const DEAD_STOCK: ScriptedResponse = {
  suggestions: [
    { label: "Check returns", prompt: "How did product returns look last quarter?" },
    { label: "Mark these down" },
    { label: "Clear them out" },
  ],
  tools: [
    { name: "dispatch_readonly", target: QUERY_SOR },
    { name: "dispatch_readonly", target: "get-inventory" },
  ],
  thinking: [
    { label: "Finding products with no recent sales", delay: 1100 },
    { label: "Adding up the stock they hold", delay: 900 },
  ],
  response: [
    { type: "noted", items: "Premium Grinder" },
    {
      type: "text",
      content:
        "Yes. **3 products** haven't sold in over 60 days, about **$28K** of stock. The **Travel Mug (Teal)** also has a high return rate, which may be why it stopped selling.",
    },
    {
      type: "slot",
      mode: "inline-card",
      app: SF,
      exportAs: { id: "deadstock", title: "Alpine · Dead stock" },
      view: {
        kind: "insight",
        heading: "Dead stock",
        subtitle: "No sales in 60+ days",
        sections: [
          DEAD_STOCK_BARS,
          { type: "actions", items: [{ label: "Check returns", prompt: "How did product returns look last quarter?" }] },
        ],
      },
    },
  ],
};

/** Step 8 — returns, last quarter. */
const RETURNS: ScriptedResponse = {
  suggestions: [
    { label: "Read the reviews" },
    { label: "Fix the listing" },
  ],
  tools: [{ name: "dispatch_readonly", target: QUERY_SOR }],
  thinking: [
    { label: "Pulling last quarter's returns", delay: 1000 },
    { label: "Grouping return reasons", delay: 900 },
  ],
  response: [
    {
      type: "text",
      content:
        "Returns are down overall, to **3.1%**. The exception is the **Travel Mug (Teal) at 11%**, more than 3× the store average, and **64% of those say the color isn't what they expected**. That points to the listing photos, not the product, so I'd fix the listing before discounting it.",
    },
    {
      type: "slot",
      mode: "inline-card",
      app: SF,
      exportAs: { id: "returns", title: "Alpine · Returns" },
      view: {
        kind: "insight",
        heading: "Returns",
        subtitle: "Q2 · Apr 1 to Jun 30",
        sections: [RETURNS_KPIS, RETURNS_BARS, MUG_REASONS],
      },
    },
  ],
};

/** Step 9 — note dead stock + the listing; buyer segments. */
const SEGMENTS: ScriptedResponse = {
  suggestions: [
    { label: "Accounts at risk", prompt: "Which of my accounts might we be losing this quarter?" },
    { label: "New accounts at risk" },
    { label: "Compare to Q2" },
  ],
  tools: [{ name: "dispatch_readonly", target: QUERY_SOR }],
  thinking: [
    { label: "Splitting Q3 revenue by buyer segment", delay: 1100 },
    { label: "Comparing each against Q2", delay: 800 },
  ],
  response: [
    { type: "noted", items: "Dead stock, Travel Mug listing" },
    {
      type: "text",
      content:
        "**OEM Partners** bring in the most, **$520K**, up 14%. **New Buyers** are the fastest growing (up 41%) but spend the least per order, **$640** against a $2,140 store average.",
    },
    {
      type: "slot",
      mode: "inline-card",
      app: SF,
      exportAs: { id: "segments", title: "Alpine · Buyer segments" },
      view: { kind: "insight", heading: "Buyer segments", subtitle: "Q3 vs Q2", sections: [SEGMENTS_TABLE] },
    },
  ],
};

/** Step 10 — what New Buyers buy. */
const NEW_BUYERS: ScriptedResponse = {
  suggestions: [
    { label: "Accounts at risk", prompt: "Which of my accounts might we be losing this quarter?" },
    { label: "New accounts at risk" },
    { label: "Win more new buyers" },
  ],
  tools: [{ name: "dispatch_readonly", target: QUERY_SOR }],
  thinking: [{ label: "Breaking down New Buyers' spend by category", delay: 1100 }],
  response: [
    {
      type: "text",
      content:
        "Mostly **filters and accessories**, 83% of their spend. Only **4%** goes to machines, against 42% store-wide, so most haven't made the big purchase yet.",
    },
    {
      type: "slot",
      mode: "inline-card",
      app: SF,
      exportAs: { id: "newbuyers", title: "Alpine · What New Buyers buy" },
      view: { kind: "insight", heading: "What New Buyers buy", subtitle: "Q3 to date", sections: [NEW_BUYER_MIX] },
    },
  ],
};

/** Step 10, other rows — what OEM Partners or Loyal Customers buy, against the
 *  same store average as New Buyers. */
const SEGMENT_MIX: Record<"oem" | "loyal", { name: string; parts: number[]; callout: { part: number; text: string }; text: string }> = {
  oem: {
    name: "OEM Partners",
    parts: [12, 8, 22, 58],
    callout: { part: 3, text: "Most of the machine revenue" },
    text: "Mostly **machines**, 58% of their spend against 42% store-wide. They're your biggest machine buyers, with **grinders** next at 22%.",
  },
  loyal: {
    name: "Loyal Customers",
    parts: [34, 18, 26, 22],
    callout: { part: 0, text: "Steady refills" },
    text: "A bit of everything, led by **filters** at 34%, mostly repeat refills. Machines are only **22%**, about half the store average, since most already own one.",
  },
};

function segmentMix(key: keyof typeof SEGMENT_MIX): ScriptedResponse {
  const seg = SEGMENT_MIX[key];
  return {
    suggestions: [
      { label: "Accounts at risk", prompt: "Which of my accounts might we be losing this quarter?" },
      { label: "New accounts at risk" },
    ],
    tools: [{ name: "dispatch_readonly", target: QUERY_SOR }],
    thinking: [{ label: `Breaking down ${seg.name}' spend by category`, delay: 1100 }],
    response: [
      { type: "text", content: seg.text },
      {
        type: "slot",
        mode: "inline-card",
        app: SF,
        exportAs: { id: `mix-${key}`, title: `Alpine · What ${seg.name} buy` },
        view: {
          kind: "insight",
          heading: `What ${seg.name} buy`,
          subtitle: "Q3 to date",
          sections: [
            {
              ...NEW_BUYER_MIX,
              summary: `${seg.name} vs the whole store, Q3 to date.`,
              rows: [{ label: seg.name, parts: seg.parts }, NEW_BUYER_MIX.rows[1]],
              callout: { row: 0, ...seg.callout },
            },
          ],
        },
      },
    ],
  };
}

/** Step 11 — accounts at risk. */
const AT_RISK_BEAT: ScriptedResponse = {
  suggestions: [
    { label: "Omega's profile", prompt: "Tell me more about Omega Inc" },
    { label: "Call TSV" },
    { label: "Email Bluewater" },
  ],
  tools: [
    { name: "dispatch_readonly", target: QUERY_SOR },
    { name: "dispatch_readonly", target: "search-order-summaries" },
  ],
  thinking: [
    { label: "Comparing each account's orders to its usual pattern", delay: 1200 },
    { label: "Flagging drops in spend and gaps in ordering", delay: 1000 },
  ],
  response: [
    {
      type: "text",
      content: "**3 accounts** look at risk, about **$140K** a year between them. Each one is slipping in a different way.",
    },
    {
      type: "slot",
      mode: "inline-card",
      app: SF,
      exportAs: { id: "atrisk", title: "Alpine · At-risk accounts" },
      view: { kind: "insight", heading: "At-risk accounts", subtitle: "Compared with each account's last 12 months", sections: [AT_RISK] },
    },
  ],
};

/** Step 12 — an at-risk account's profile (Omega on the main path; TSV and
 *  Bluewater get the same report with their own numbers). Expands to a full
 *  account page. */
function accountBeat(a: Account, suggestions: ScriptedResponse["suggestions"]): ScriptedResponse {
  return {
    suggestions,
    tools: [
      { name: "dispatch_readonly", target: "get-account" },
      { name: "dispatch_readonly", target: "search-order-summaries" },
      { name: "dispatch_readonly", target: QUERY_SOR },
    ],
    thinking: [
      { label: a.thinking, delay: 1100 },
      { label: "Checking their contacts' activity", delay: 900 },
    ],
    response: [
      { type: "text", content: a.text },
      {
        type: "slot",
        mode: "floating",
        app: SF,
        exportAs: { id: a.id, title: `Alpine · ${a.name}` },
        expandable: true,
        view: {
          kind: "insight",
          heading: a.name,
          subtitle: `${a.segment} · account since ${a.since}`,
          sections: [accountKpis(a), accountQuarters(a)],
          full: {
            title: a.name,
            subtitle: `${a.segment} · account since ${a.since} · Jan 1 to Sep 22`,
            groups: [
              { title: "Revenue", sections: [accountKpis(a), accountQuarters(a)] },
              { title: "What they buy", sections: [accountMix(a)] },
              {
                title: "Recent orders",
                sections: [
                  {
                    type: "table",
                    columns: [{ label: "Order" }, { label: "Items" }, { label: "Placed" }, { label: "Total", align: "right" }],
                    rows: a.orders.map(([id, items, placed, total]) => [
                      id,
                      { text: items, muted: true },
                      { text: placed, muted: true },
                      { text: total, strong: true },
                    ]),
                    meta: a.ordersMeta,
                  },
                ],
              },
              {
                title: "Contacts",
                sections: [
                  {
                    type: "table",
                    columns: [{ label: "Name" }, { label: "Role" }, { label: "Last login", align: "right" }],
                    rows: a.contacts.map(([name, role, login]) => [name, { text: role, muted: true }, { text: login, strong: true }]),
                  },
                ],
              },
            ],
          },
        },
      },
    ],
  };
}

const OMEGA = accountBeat(ACCOUNTS.omega, [
  { label: "Offer Omega a deal" },
  { label: "Show Omega's contacts" },
]);

/** The other two at-risk profiles (off the main path): the same report. */
const TSV = accountBeat(ACCOUNTS.tsv, [
  { label: "Omega's profile", prompt: "Tell me more about Omega Inc" },
  { label: "Offer TSV a deal" },
]);

const BLUEWATER = accountBeat(ACCOUNTS.bluewater, [
  { label: "Omega's profile", prompt: "Tell me more about Omega Inc" },
  { label: "Offer Bluewater a deal" },
  { label: "Show Bluewater's contacts" },
]);

/** Where the follow-ups go on Slack, and the action that posts them. */
const SLACK_CHANNEL = "#alpine-merchandising";
const SLACK_POST = "slack-post";
const SLACK_SENT_STEPS: AppStep[] = [{ app: "slack", action: `Post Alpine follow-ups to ${SLACK_CHANNEL}`, result: "4 items · 2 teammates tagged" }];

/** Send to Slack (the follow-ups card's button, or its chip): Claude reaches
 *  Slack, finds the channel and posts the list as a checklist, each owner
 *  tagged, then says where it went. */
const SLACK_SENT: ScriptedResponse = {
  thinking: [
    { label: "Connecting to Slack", delay: 900 },
    { label: `Finding ${SLACK_CHANNEL}`, delay: 900 },
  ],
  response: [{ type: "apps", steps: SLACK_SENT_STEPS }],
  then: {
    thinking: [{ label: "", delay: appsMs(SLACK_SENT_STEPS) + 600 }],
    response: [
      {
        type: "text",
        content:
          `Posted to **${SLACK_CHANNEL}** as a checklist of 4. **@Lena Ortiz** has the Travel Mug listing, and **@Sam Patel** has the dead stock bundle. The Grinder and Omega promotions stay with you.`,
      },
    ],
    suggestions: [
      { label: "Go ahead with those", prompt: "Set up the three promotions you suggested." },
      { label: "Remind me Friday" },
    ],
  },
};

/** Step 13 — note Omega; everything remembered, with what to do. */
/** The recap's to-do list: what was found and what to do, per item. */
const THINGS_TO_DO: ChecklistItem[] = [
  {
    title: "Premium Grinder",
    pill: { label: "Promotion", tone: "info" },
    pairs: [
      { label: "Found", value: "Down from 38 to about 27 units a month" },
      { label: "Do", value: "15% off for 30 days to win back volume" },
    ],
  },
  {
    title: "Dead stock",
    pill: { label: "Promotion", tone: "info" },
    pairs: [
      { label: "Found", value: "$28K across 3 products, no sales in 60+ days" },
      { label: "Do", value: "Bundle the Pour-Over Set and Descaling Kit at 30% off" },
    ],
  },
  {
    title: "Travel Mug listing",
    pill: { label: "Merchandising", tone: "neutral" },
    pairs: [
      { label: "Found", value: "11% come back, mostly over the color" },
      { label: "Do", value: "Fix the photos and description first" },
    ],
  },
  {
    title: "Omega Inc",
    pill: { label: "Promotion", tone: "info" },
    pairs: [
      { label: "Found", value: "Down 38%, no machine order since August" },
      { label: "Do", value: "Win-back offer: 10% off machines" },
    ],
  },
];

const RECAP: ScriptedResponse = {
  suggestions: [
    { label: "Go ahead with those", prompt: "Set up the three promotions you suggested." },
    { label: "Share it on Slack", action: SLACK_POST },
    { label: "Remind me Friday" },
  ],
  thinking: [
    { label: "Pulling together what you asked me to remember", delay: 1000 },
    { label: "Working out a next step for each", delay: 1100 },
  ],
  response: [
    { type: "noted", items: "Omega Inc" },
    {
      type: "text",
      content: "Here's everything you asked me to remember, with a next step for each.",
    },
    {
      type: "checklist",
      title: "Things to do",
      meta: "4 follow-ups from this chat",
      items: THINGS_TO_DO,
    },
    {
      type: "text",
      content:
        "Want me to set up the promotions for 1, 2 and 4? They'll be created **inactive**, so nothing goes live until you turn it on.",
    },
    {
      type: "share",
      service: "slack",
      title: "Alpine follow-ups",
      meta: "Slack message · 4 items",
      action: "Send to Slack",
      actionKey: SLACK_POST,
      sent: `Sent to ${SLACK_CHANNEL}`,
    },
  ],
};

/* ── Promotions ───────────────────────────────────────────────────────── */

const AUDIENCES = ["All buyers", "Loyal Customers only", "OEM Partners only", "New Buyers only", "Loyal Customers, excluding OEM Partners"];

const PROMOS: PromoRow[] = [
  {
    id: "clearance",
    name: "Clearance – Coffee Accessories Bundle",
    discount: "30% off when bought together",
    appliesTo: "Pour-Over Set, Descaling Kit",
    audience: "All buyers",
    dates: "Sep 23 to Oct 31",
    note: "Travel Mug held back until its photos and description are updated.",
  },
  {
    id: "grinder",
    name: "Premium Grinder – 15% Off",
    discount: "15% off",
    appliesTo: "Premium Grinder",
    audience: "All buyers",
    dates: "Sep 23 to Oct 22 (30 days)",
  },
  {
    id: "omega",
    name: "Welcome Back, Omega",
    discount: "10% off machines",
    appliesTo: "Machines category",
    audience: "Loyal Customers, excluding OEM Partners",
    dates: "Sep 23 to Oct 31",
  },
];

/** Audiences as edited so far (a typed edit changes the Grinder's). */
let audiences = PROMOS.map((p) => p.audience);

/** Promotions switched on with Make live (the report shows them as Live). */
const live = new Set<string>();

const withAudiences = (list: string[]): PromoRow[] =>
  PROMOS.map((p, i) => ({ ...p, audience: list[i] ?? p.audience, updated: (list[i] ?? p.audience) !== p.audience, live: live.has(p.id) }));

/** "all inactive until you turn them on", "1 live, 2 inactive", "all live". */
function liveNote(): string {
  const n = live.size;
  if (n === 0) return "Alpine · all inactive until you turn them on";
  if (n === PROMOS.length) return "Alpine · all live";
  return `Alpine · ${n} live, ${PROMOS.length - n} inactive`;
}

function promoCard(stage: "draft" | "created", list: string[]): SlotBlock {
  return {
    type: "slot",
    mode: "inline-card",
    app: SF,
    ...(stage === "created" ? { exportAs: { id: "promos", title: "Alpine · Promotions" } } : {}),
    view: {
      kind: "promotions",
      heading: stage === "draft" ? "Promotions to create" : "Promotions created",
      stage,
      subtitle: stage === "draft" ? "Draft · nothing is created yet" : liveNote(),
      rows: withAudiences(list),
      audiences: AUDIENCES,
      createActionKey: "promo-create",
      liveAllActionKey: "promo-live-all",
      footnote: "Created as inactive",
    },
  };
}

/** Step 14 — the draft. */
function promoDraft(): ScriptedResponse {
  return {
    suggestions: [
      { label: "Narrow the Grinder's audience", prompt: "Make the Premium Grinder promotion Loyal Customers only." },
      { label: "Change the dates" },
      { label: "Add a fourth" },
    ],
    tools: [{ name: "get_sor_detail", target: "promotion-management" }],
    thinking: [
      { label: "Drafting the three promotions", delay: 1100 },
      { label: "Matching each to its products and buyers", delay: 900 },
    ],
    response: [
      {
        type: "text",
        content:
          "Here are the **3 promotions**. Nothing is created until you confirm. I left the **Travel Mug** out of the clearance until its listing is fixed.",
      },
      promoCard("draft", audiences),
    ],
  };
}

/** Typed edit — Grinder for Loyal Customers only. */
function promoEdit(): ScriptedResponse {
  audiences = audiences.map((a, i) => (PROMOS[i].id === "grinder" ? "Loyal Customers only" : a));
  return {
    suggestions: [
      { label: "Create all 3", action: ["promo-create", ...audiences].join("|") },
      { label: "Change a discount" },
    ],
    thinking: [{ label: "Updating the Grinder promotion", delay: 900 }],
    response: [
      { type: "text", content: "Done. The **Premium Grinder** promotion is now for **Loyal Customers only**." },
      promoCard("draft", audiences),
    ],
  };
}

/** Step 15 — create all 3 (key carries each row's audience from the card). */
function promoCreate(list: string[]): ScriptedResponse {
  audiences = list;
  return {
    suggestions: [
      { label: "Make all 3 live", action: "promo-live-all" },
      { label: "Preview for buyers" },
    ],
    tools: [{ name: "get_sor_detail", target: "promotion-management" }],
    thinking: [{ label: "Creating the promotions in Alpine", delay: 1100 }],
    writes: [
      {
        action: `Create ${PROMOS.length} promotions in Alpine, inactive`,
        target: "promotion-management",
        result: `${PROMOS.length} promotions · inactive`,
        records: withAudiences(list).map((p) => ({
          op: "insert" as const,
          object: "Promotion",
          name: p.name,
          fields: `Audience ${p.audience} · ${p.discount} · IsActive false`,
        })),
      },
    ],
    response: [
      { type: "text", content: "Created **3 promotions**, all **inactive**. Turn each on when you're ready." },
      promoCard("created", list),
    ],
  };
}

/** Make live on a created promotion: it's switched on in Salesforce, then the
 *  card comes back with it Live (remembered for the report). */
function promoLive(id: string): ScriptedResponse | undefined {
  const promo = withAudiences(audiences).find((p) => p.id === id);
  if (!promo) return undefined;
  live.add(id);
  const rest = PROMOS.length - live.size;
  return {
    suggestions: [
      { label: "Export a report", prompt: "/export-report" },
      { label: "Share with the team" },
    ],
    thinking: [{ label: `Turning on ${promo.name}`, delay: 800 }],
    writes: [
      {
        action: `Turn on ${promo.name}`,
        target: "promotion-management",
        result: `${promo.name.replace(/ – .*$/, "")} · live`,
        records: [{ op: "update", object: "Promotion", name: promo.name, fields: "IsActive false → true" }],
      },
    ],
    response: [
      {
        type: "text",
        content:
          `**${promo.name}** is live for **${promo.audience}**, ${promo.dates}. ` +
          (rest === 0 ? "All 3 are live now." : `${rest === 1 ? "1 is" : `${rest} are`} still inactive.`),
      },
      promoCard("created", audiences),
    ],
  };
}

/** Make all live (dictated, the card's button or its chip): every inactive
 *  promotion is switched on in one write. */
function promoLiveAll(): ScriptedResponse {
  const off = withAudiences(audiences).filter((p) => !p.live);
  off.forEach((p) => live.add(p.id));
  return {
    suggestions: [
      { label: "Export a report", prompt: "/export-report" },
      { label: "Share with the team" },
      { label: "Check them next week" },
    ],
    thinking: [{ label: off.length === 1 ? `Turning on ${off[0].name}` : `Turning on ${off.length} promotions`, delay: 900 }],
    writes: [
      {
        action: off.length === PROMOS.length ? `Turn on all ${off.length} promotions` : `Turn on the other ${off.length}`,
        target: "promotion-management",
        result: `${off.length} ${off.length === 1 ? "promotion" : "promotions"} · live`,
        records: off.map((p) => ({ op: "update" as const, object: "Promotion", name: p.name, fields: "IsActive false → true" })),
      },
    ],
    response: [
      {
        type: "text",
        content: off.length
          ? `All **${PROMOS.length} promotions are live**. Each runs for its own audience and dates, as on the card.`
          : `All **${PROMOS.length} promotions** were already live.`,
      },
      promoCard("created", audiences),
    ],
  };
}

/* ── Export ───────────────────────────────────────────────────────────── */

const EXPORT_ITEMS: ExportItem[] = [
  { id: "snapshot", label: "Store health", group: "Store", checked: true },
  { id: "months", label: "Revenue by month", group: "Store" },
  { id: "products", label: "Top products", group: "Products" },
  { id: "grinder", label: "Premium Grinder trend", group: "Products", checked: true },
  { id: "deadstock", label: "Dead stock", group: "Products", checked: true },
  { id: "returns", label: "Returns", group: "Products", checked: true },
  { id: "segments", label: "Buyer segments", group: "Customers" },
  { id: "atrisk", label: "At-risk accounts", group: "Customers" },
  { id: "omega", label: "Omega Inc", group: "Customers", checked: true },
  { id: "tsv", label: "TSV Distributors", group: "Customers" },
  { id: "bluewater", label: "Bluewater Supply", group: "Customers" },
  { id: "promos", label: "Promotions", group: "Actions", checked: true },
];

/** Report pages drop the in-chat buttons (a PDF can't drill down). */
function forReport(s: InsightSection): InsightSection {
  if (s.type === "ranked") return { ...s, rows: s.rows.map((r) => ({ ...r, action: undefined })) };
  if (s.type === "risk") return { ...s, rows: s.rows.map((r) => ({ ...r, action: undefined })) };
  return s;
}

function reportPage(id: string): ReportPage {
  switch (id) {
    case "snapshot":
      return {
        title: "Store health",
        takeaway: "83% of the $1.5M goal with 8 days left; on pace to finish around $1.37M.",
        points: [
          "Average order value up 6%",
          "Conversion flat",
        ],
        sections: [HEALTH_BY_AREA, REVENUE_VS_GOAL, OBJECTIVES],
      };
    case "months":
      return {
        title: "Revenue by month",
        takeaway: "September is on pace for ~$498K, ahead of August's $455K.",
        points: [
          "September at $365K with 8 days left",
          "Still just under the $500K a month the goal needs",
        ],
        sections: [MONTHS_REVENUE],
      };
    case "products":
      return {
        title: "Top products",
        takeaway: "Testa Rossa leads at $180K; the Premium Grinder is the only top-10 product going down.",
        points: [
          "Testa Rossa Coffee Machine: $180K, up 22% on Q2",
          "Premium Grinder: 38 units in July, 31 in August, about 27 in September",
        ],
        sections: [forReport(TOP_PRODUCTS)],
      };
    case "grinder":
      return {
        title: "Premium Grinder",
        takeaway: "Down from 38 to about 27 units a month since a competitor's discount on Aug 12.",
        points: [
          "Sales started falling the week of Aug 12",
          "Price, stock and listing unchanged; not in any bundle or promotion",
        ],
        sections: [GRINDER_KPIS, (GRINDER_TREND as Extract<InsightSection, { type: "toggle" }>).options[0].sections[0]],
      };
    case "deadstock":
      return {
        title: "Dead stock",
        takeaway: "3 products, about $28K of stock, with no sales in 60+ days.",
        points: [
          "The Travel Mug (Teal) also has a high return rate",
          "Pour-Over Set and Descaling Kit can be cleared as a bundle",
        ],
        sections: [DEAD_STOCK_BARS],
      };
    case "returns":
      return {
        title: "Returns",
        takeaway: "Down to 3.1% overall; the Travel Mug (Teal) is at 11%, mostly over the color.",
        points: [
          "Travel Mug (Teal) returns are more than 3× the store average",
          "64% of its returns say the color isn't what they expected",
        ],
        sections: [RETURNS_BARS, MUG_REASONS],
      };
    case "bundle":
      return {
        title: "Barista Starter Kit",
        takeaway: "The Testa Rossa's only bundle; no active promotion, so its growth is full-price.",
        points: [
          "Testa Rossa up 22% on Q2, all at full price",
        ],
        sections: BUNDLE_SECTIONS,
      };
    case "newbuyers":
      return {
        title: "What New Buyers buy",
        takeaway: "Mostly filters and accessories; hardly any machines yet.",
        points: [
          "83% of their spend is filters and accessories",
          "4% goes to machines, against 42% store-wide",
        ],
        sections: [NEW_BUYER_MIX],
      };
    case "segments":
      return {
        title: "Buyer segments",
        takeaway: "OEM Partners lead at $520K; New Buyers grow fastest at the lowest order value.",
        points: [
          "OEM Partners: $520K, up 14%",
          "New Buyers: up 41%, $640 an order against a $2,140 store average",
        ],
        sections: [forReport(SEGMENTS_TABLE)],
      };
    case "atrisk":
      return {
        title: "At-risk accounts",
        takeaway: "3 accounts, about $140K a year between them.",
        points: [
          "Omega Inc: machine orders stopped after August",
          "TSV Distributors: no order in 47 days",
          "Bluewater Supply: stopped buying filters in August",
        ],
        sections: [forReport(AT_RISK)],
      };
    case "omega":
    case "tsv":
    case "bluewater": {
      const a = ACCOUNTS[id];
      return { title: a.name, takeaway: a.takeaway, points: a.points, sections: [accountQuarters(a), accountMix(a)] };
    }
    default:
      return {
        title: "Promotions",
        takeaway:
          live.size === 0
            ? "3 promotions created in Alpine, all inactive."
            : `3 promotions created in Alpine, ${live.size === 3 ? "all" : live.size} live.`,
        sections: [
          {
            type: "table",
            columns: [{ label: "Promotion" }, { label: "Discount" }, { label: "Audience" }, { label: "Status", align: "right" }],
            rows: withAudiences(audiences).map((p) => [
              { text: p.name, strong: true },
              { text: p.discount, muted: true },
              { text: p.audience, muted: true },
              live.has(p.id) ? { pill: { label: "Live", tone: "success" } } : { pill: { label: "Inactive", tone: "neutral" } },
            ]),
          },
        ],
      };
  }
}

function exportFile(title: string, ids: string[]): ScriptedResponse {
  const file: FileRef = {
    id: `report-${Date.now()}`,
    title,
    format: "PDF",
    pages: [
      { cover: { title, scope: "Alpine · Q3 to date · Jul 1 to Sep 22", kpis: SNAPSHOT_KPIS } },
      ...ids.map(reportPage),
    ],
  };
  const response: Block[] = [
    {
      type: "text",
      content:
        ids.length === 1
          ? `Here's **${file.pages[1].title}** as a PDF: a cover plus one page, with the numbers as of today.`
          : `Your report is ready: **${file.pages.length} pages**, a cover plus one page for each view, with the numbers as of today.`,
    },
    { type: "file", file },
  ];
  return {
    suggestions: [
      { label: "Store health again", prompt: "Alpine" },
      { label: "Email it" },
    ],
    skill: "export-report",
    activity: "Ran 2 commands, created a file",
    thinking: [
      { label: "Laying out the report", delay: 1100 },
      { label: "Rendering the charts", delay: 1100 },
      { label: "Saving the PDF", delay: 700 },
    ],
    response,
  };
}

/** Step 16 — /export-report with no scope: pick the views. */
const EXPORT_PICK: ScriptedResponse = {
  skill: "export-report",
  thinking: [{ label: "Gathering the views from this chat", delay: 900 }],
  response: [
    { type: "text", content: "Pick what goes in the report. I've checked the ones we spent the most time on." },
    {
      type: "slot",
      mode: "inline-card",
      app: SF,
      view: { kind: "export", heading: "Export report", defaultTitle: "Alpine · Q3 review", items: EXPORT_ITEMS, actionKey: "export" },
    },
  ],
};

/** Off-script fallback: keep it on Alpine and point at what's possible. */
const FALLBACK: ScriptedResponse = {
  suggestions: [
    { label: "Check store health", prompt: "Alpine" },
    { label: "What can you help with?" },
    { label: "Show all stores" },
  ],
  thinking: [{ label: "Working through the request", delay: 700 }],
  response: [
    {
      type: "text",
      content:
        "Let me keep us on **Alpine**. I can break the quarter down by **month**, **product**, **buyer segment** or **account**, check **returns** or **stock that isn't selling**, or run **/store-health** again.",
    },
  ],
};

/** A beat's "Noted for later" line shows only when Aaron asked to remember
 *  something (a drill-down from the dashboard reaches the same beat without). */
const noted = (r: ScriptedResponse, keep: boolean): ScriptedResponse =>
  keep ? r : { ...r, response: r.response.filter((b) => b.type !== "noted") };

/** Match the typed prompt to a beat. Order matters: prompts that mention an
 *  earlier topic ("Remember the dead stock… segments?") are checked first. */
function getResponse(prompt: string): ScriptedResponse {
  const p = prompt.toLowerCase();
  const has = (...terms: string[]) => terms.some((t) => p.includes(t));

  // Export: a typed scope skips the picker.
  if (p.startsWith("/export-report")) {
    if (has("just", "only", "revenue", "products", "accounts")) {
      const ids = [
        ...(has("revenue") ? ["months"] : []),
        ...(has("product") ? ["products"] : []),
        ...(has("account", "risk") ? ["atrisk"] : []),
      ];
      return exportFile("Alpine · Q3 review", ids.length ? ids : ["snapshot"]);
    }
    return EXPORT_PICK;
  }
  if (has("all live", "all three live", "all 3 live", "promotions live", "them live", "them all on", "turn them on")) return promoLiveAll();
  if (has("by month", "september beat", "month by month")) return MONTHS;
  if (has("grinder one", "loyal customers only")) return promoEdit();
  if (has("set up the promotions", "promotions you suggested", "create the promotions", "set those up", "set them up")) return promoDraft();
  if (has("remember omega", "everything i asked")) return RECAP;
  if (has("omega")) return OMEGA;
  if (has("tsv")) return TSV;
  if (has("bluewater")) return BLUEWATER;
  if (has("losing", "at risk", "at-risk", "churn")) return AT_RISK_BEAT;
  if (has("oem partners mostly")) return segmentMix("oem");
  if (has("loyal customers mostly")) return segmentMix("loyal");
  if (has("new buyers")) return NEW_BUYERS;
  if (has("segment", "buyers doing")) return noted(SEGMENTS, has("remember", "keep", "in mind"));
  if (has("return")) return RETURNS;
  if (has("grinder trend", "show me the premium grinder")) return GRINDER;
  if (has("isn't selling", "not selling", "dead stock", "keep the grinder", "keep the premium grinder"))
    return noted(DEAD_STOCK, has("keep", "remember", "in mind"));
  if (has("testa rossa", "bundle or promo")) return BUNDLE;
  if (has("driving", "which products", "top 10", "top products")) return PRODUCTS;
  // Store picked from the menu (every option continues with Alpine).
  if (has("alpine", "barista pro", "partner wholesale", "all stores")) return SNAPSHOT;
  // Store health with no store named → ask which store.
  if (has("/store-health", "health check", "this quarter going", "how are we tracking", "how is my store", "how's my store", "my store doing"))
    return STORE_PICK;

  return FALLBACK;
}

/** In-app buttons: Create all (`promo-create|aud1|aud2|aud3`) and Create PDF
 *  (`export|title|id1,id2`). */
function getAction(key: string): ScriptedResponse | undefined {
  const [name, ...rest] = key.split("|");
  if (name === "promo-create") return promoCreate(rest);
  if (name === "promo-live") return promoLive(rest[0]);
  if (name === "promo-live-all") return promoLiveAll();
  if (name === SLACK_POST) return SLACK_SENT;
  if (name === "export") return exportFile(rest[0] || "Alpine · Q3 review", (rest[1] ?? "").split(",").filter(Boolean));
  return undefined;
}

/** Start the journey fresh: promotions lose their edits and live state. */
function reset() {
  audiences = PROMOS.map((p) => p.audience);
  live.clear();
}

/** The merchant-insights journey. */
export const insights: Experience = {
  id: "insights",
  title: copy.shell.experiences.insights,
  getResponse,
  getAction,
  reset,
  dictations: [
    "/store-health How's my store doing this quarter?",
    "Break my Q3 revenue down by month. Is September on track to beat August?",
    "Which products are driving my growth the most, and are any of my top 10 slipping?",
    "Is the Testa Rossa Coffee Machine in a bundle or a promotion right now?",
    "Keep the Premium Grinder in mind, I'll come back to it. Do we have any stock that isn't selling?",
    "Remember the dead stock and the Travel Mug listing too. How are buyers doing this quarter?",
    "Which of my accounts might we be losing this quarter?",
    "Remember Omega too. Now pull up everything I asked you to remember, and what I should do about each.",
    "Set up the three promotions you suggested.",
    "Make the Premium Grinder promotion Loyal Customers only.",
    "Make all three promotions live.",
  ],
};
