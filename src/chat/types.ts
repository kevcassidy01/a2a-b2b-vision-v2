/**
 * Chat types — the shape of a conversation.
 *
 * A conversation is a list of `Message`s; each message is an ordered list of
 * `Block`s. Blocks are deliberately open-ended: today `text` and `slot` exist;
 * the union is the extension point.
 *
 * A `slot` renders an **MCP app** in the transcript. The chrome is host-owned
 * (Claude paints the surface, border, text); a connected app only tints its logo
 * + link accent. Slot bodies are a reserved placeholder region for now; real
 * widgets mount there later, wired to click-as-query or click-as-app-action.
 *
 * ── What each display mode is FOR ──────────────────────────────────────────
 * These are strong suggestions, not rules. They keep the experience Claude-like;
 * a fork is free to invent its own uses. Pick the lightest mode that fits.
 *
 *   `inline-card`      A framed, bounded widget in the transcript at chat-column
 *                      width. For a compact, self-contained result: one record, a
 *                      small form, a metric summary, a short list. An optional
 *                      footer links out when it's a truncated slice of more. Use
 *                      when the content is "done in place." Can be `expandable`.
 *
 *   `inline-carousel`  A frameless, horizontally scrollable row of tiles at column
 *                      width. For a small set of comparable peers (products,
 *                      results, options) to browse and pick from. Light-weight;
 *                      bleeds toward the edge. Not expandable (rarely warrants it).
 *
 *   `floating`         Frameless single object in the transcript (no card frame)
 *                      for a response that needs neither a card's chrome nor a
 *                      carousel's structure: one chart, a diagram, a short report.
 *                      Carries the expand affordance top-right when it reads better
 *                      large. Typically `expandable`.
 *
 *   `fullscreen`       Not a transcript block — the EXPANDED view of an
 *                      `expandable` card or floating response. Takes over the main
 *                      stage (transcript stays mounted underneath), with the app in
 *                      a 12px-inset surface and the prompt bar pinned at the bottom
 *                      in a safe inset. For immersive/large content: a full report,
 *                      a document, a big dashboard. A prompt sent from here posts to
 *                      the same chat and closes the overlay.
 */

export type Role = "user" | "assistant";

/**
 * A Headless 360 MCP tool call, shown atop a response in the tool-call timeline
 * (above any skill chip). Mirrors the real `project-codey` Codey tools —
 * `discover`, `get_sor_detail`, `dispatch_readonly` — operating over the
 * commerce SORs (service definitions). 1–3 per response; the latest response
 * shows them expanded, earlier ones collapse behind a "Headless 360 MCP tools"
 * row. Data-only; the icon (a wrench) and timeline chrome are host-painted.
 */
export interface ToolCall {
  /** The MCP tool invoked, e.g. "dispatch_readonly". Rendered as a mono chunk. */
  name: string;
  /** What it acted on — a SOR id or short argument, e.g. "buyer-cart-management".
   *  Shown quietly after the tool name. */
  target?: string;
}

/** One record a Salesforce write touched: the operation, the object's API
 *  name, the record and the fields it set (`Status Draft → Approved`). */
export interface WriteRecord {
  op: "insert" | "update" | "delete";
  object: string;
  name: string;
  fields: string;
}

/**
 * One step in another app (not Salesforce): its logo in a tile, a
 * plain-language action that spins while it works, then a mono result chip.
 */
export interface AppStep {
  app: "slack";
  action: string;
  result: string;
}

/**
 * One Salesforce write, shown in the "Writing to Salesforce" timeline: a
 * plain-language action, the `dispatch_write` call behind it (reads stay
 * `dispatch_readonly` in the tool timeline), a result chip, and the records
 * it wrote, landing one at a time.
 */
export interface WriteStep {
  action: string;
  /** The SOR it wrote through, e.g. "buyer-cart-management". */
  target: string;
  result: string;
  records: WriteRecord[];
}

/** Header identity of the app rendering a slot (host paints everything else). */
export interface CardApp {
  /** App name shown beside the logo. */
  name: string;
  /** 1–2 char monogram standing in for the app logo (fallback when no `logo`). */
  badge: string;
  /** Optional logo image src. When set, the header shows the real app logo
   *  instead of the monogram — the one permitted brand mark (e.g. Salesforce).
   *  The host still owns everything else in the frame. */
  logo?: string;
}

/* ── Slot content ─────────────────────────────────────────────────────────
 * A slot may carry a `view`: the real widget its body renders (a table, a
 * record, a status stepper …), instead of the reserved placeholder. Views are
 * data-only and declarative — `SlotContent` dispatches on `kind`. Buttons in a
 * view fire an in-app action (`actionKey`) that the store plays as the next
 * scripted beat, keeping the app-vs-chat split: freeform asks go through chat,
 * confirming/executing a prepared action happens in the app. */

/** Semantic tone for a status pill / stepper (maps to the status tokens). */
export type Tone = "neutral" | "success" | "info" | "warning" | "danger";

/** A small status pill (e.g. Draft, Approved, Free). */
export interface Pill {
  label: string;
  tone: Tone;
}

/** A key/value fact in a record header. `pill` renders the value as a pill. */
export interface Field {
  label: string;
  value?: string;
  pill?: Pill;
  /** Render the value in a monospace caption (e.g. a record id). */
  mono?: boolean;
  /** Emphasize the value (e.g. the order total on a review). */
  strong?: boolean;
}

/** A pending-quote row (step 1). Each quote belongs to one buyer account under
 *  the Morton org, so the list carries `buyer` to disambiguate them. */
export interface QuoteRow {
  number: string;
  /** The buyer account (under the org) this quote belongs to. */
  buyer: string;
  created: string;
  expires: string;
  total: string;
  status: Pill;
}

/** A quote line item (steps 2, 4). */
export interface LineRow {
  id: string;
  product: string;
  /** Quiet line under the product name (a SKU or the product family). */
  detail?: string;
  qty: string;
  list: string;
  discount?: string;
  total: string;
  /** A free promo line — rendered with a "Free" pill. */
  free?: boolean;
}

/** An entitled-catalog product row (step 3). */
export interface ProductRow {
  id?: string;
  product: string;
  family: string;
  price: string;
  /** List price, struck through beside a contract `price`. */
  listPrice?: string;
  /** Already on the quote — flagged, not addable. */
  onQuote?: boolean;
  /** Claude's pick. `reason` (one line) replaces the family under the name;
   *  `why` fills the Recommended pill's hover popover. The row also gets the
   *  primary add button. */
  recommended?: { reason: string; why: string[] };
}

/** A single bar in a `chart` view (e.g. spend by buyer account). `value` sets
 *  the bar length (relative to the largest bar); `display` is the formatted
 *  label shown at the bar's end. */
export interface ChartBar {
  label: string;
  value: number;
  display: string;
  /** Optional accent tone; defaults to the app-link (Salesforce blue). */
  tone?: Tone;
  /** Hover annotation lines: label, figure, then quiet detail. */
  hover?: string[];
}

/** A per-buyer-account spend row in the full-screen account-360 report. */
export interface AccountStat {
  account: string;
  orders: string;
  spend: string;
  share: string;
  lastOrder: string;
}

/** The full-screen report for a `chart` view — shown only when the floating
 *  chart is expanded. The inline chart stays a single bar chart; expanding it
 *  opens this richer breakdown (KPIs + account table + spend-by-family). */
export interface ChartReport {
  /** KPI tiles across the top (big value + small label). Reuses `Field`. */
  stats?: Field[];
  /** Per-account breakdown table. */
  accounts?: AccountStat[];
  /** A secondary "spend by product family" chart. */
  families?: ChartBar[];
  familiesCaption?: string;
}

/** A before/after delta row (rollup, approval). */
export interface DeltaRow {
  label: string;
  before: string;
  after: string;
  emphasize?: boolean;
}

/** A totals / summary row (cart totals, order totals). A single value, not a
 *  before/after. */
export interface SummaryRow {
  label: string;
  value: string;
  /** Bold both label + value (e.g. the grand total / order total). */
  emphasize?: boolean;
  /** Strike the value through (e.g. a list price before a contract discount). */
  strike?: boolean;
}

/** One option in a numbered pick-one `select` menu (checkout anywhere). Picking
 *  it posts `prompt` as a user message, so the choice reads as the rep asking
 *  Claude in chat (the app-vs-chat split: freeform/choices go through chat). */
export interface SelectOption {
  /** The primary label (a product family, a flavor, an address line). */
  label: string;
  /** Optional secondary line under the label (e.g. a street address). */
  detail?: string;
  /** Optional right-aligned meta (e.g. a price or a tag). */
  meta?: string;
  /** Optional pill beside the label (e.g. "Frequently used" on an address). */
  pill?: Pill;
  /** The user message posted when this option is picked. */
  prompt: string;
}

/** A product tile in an `inline-carousel` (checkout anywhere). Image region on
 *  top (a real `image` src, or a tinted placeholder until product shots land),
 *  then name, a quiet detail line, the contract price, and a pick button that
 *  posts `prompt` as a user message (same app-vs-chat split as `select`). */
export interface ProductTile {
  name: string;
  /** Quiet line under the name (e.g. a family, or "3 workout phases"). */
  detail?: string;
  /** The buyer's (contract) price. */
  price?: string;
  /** Optional list price, shown struck through beside `price`. */
  listPrice?: string;
  /** Product image src (e.g. `/products/chai.png`). Omit for the placeholder. */
  image?: string;
  /** Placeholder wash behind the image region (any CSS color). */
  tint?: string;
  /** Button label (default "Choose"). */
  actionLabel?: string;
  /** The user message posted when the tile's button is clicked. */
  prompt: string;
}

/** A past-order row (checkout anywhere's "successful orders this week"). */
export interface OrderRow {
  number: string;
  /** When it was placed (relative, e.g. "Today", "2 days ago"). */
  placed: string;
  /** Short line summary (e.g. "3 lines · 9 units"). */
  items: string;
  total: string;
  status: Pill;
  /** When set, the row shows a Reorder button that PREFILLS the composer with
   *  this text (e.g. "/reorder MIXOZ-…") instead of sending it, so the rep sees
   *  the skill + order number before pressing Enter. */
  reorderPrefill?: string;
}

/* ── Insight views (merchant insights) ─────────────────────────────────────
 * One composable `insight` view built from SECTIONS (KPI tiles, a line chart,
 * a part-to-whole bar, a table …). The same sections render inline, full
 * screen, and (later) as report pages, so an export reuses what was shown.
 * All copy follows the insight type scale (tokens.css `--text-*`). */

/** A change indicator (▲ 6%, Flat, ▼ 4%). Tone carries the judgment (a drop in
 *  returns is good news), direction only draws the arrow. */
export interface Delta {
  label: string;
  tone: Tone;
  direction?: "up" | "down" | "flat";
}

/** A KPI tile: label on top, the big figure, then one quiet detail line. Can
 *  carry a progress bar (0–1, e.g. % to goal), a delta beside the figure, or —
 *  instead of a figure — a short list of labelled deltas. */
export interface Kpi {
  label: string;
  value?: string;
  delta?: Delta;
  detail?: string;
  progress?: number;
  rows?: { label: string; delta: Delta }[];
}

/** A point on a chart's x/y plane (x in the chart's own units, e.g. day of quarter).
 *  `label` / `display` / `detail` feed the hover annotation (e.g. "Week of Aug 26"
 *  · "$784K" · "$151K behind goal pace"); points without a label aren't hoverable. */
export interface XY {
  x: number;
  y: number;
  label?: string;
  display?: string;
  detail?: string;
}

/** An axis tick: where it sits, and its label. */
export interface Tick {
  at: number;
  label: string;
}

/** A line chart: the main series, an optional dashed projection (continuing from
 *  the series' last point), an optional goal/pace line, vertical event markers,
 *  and one pinned annotation. */
export interface LineChartSpec {
  x: [number, number];
  y: [number, number];
  xTicks: Tick[];
  yTicks: Tick[];
  series: XY[];
  /** Legend label for the main series. */
  seriesLabel: string;
  projection?: XY[];
  projectionLabel?: string;
  goal?: XY[];
  goalLabel?: string;
  markers?: { at: number; label: string }[];
  /** A pinned annotation: a dot on the point + a short label with a leader. */
  callout?: { at: XY; text: string; side?: "left" | "right" };
  /** Labels in the right margin at a line's end (e.g. "Goal $1.5M"), nudged
   *  apart so close values never overlap. Tone colours the text. */
  endLabels?: { y: number; text: string; tone: "viz" | "goal" | "danger" }[];
  /** A second, quieter comparison line (e.g. Filters beside Machines). */
  compare?: XY[];
  compareLabel?: string;
  /** One line under the chart title stating what the chart shows. */
  summary?: string;
  height?: number;
}

/** A column (vertical bar) chart: one bar per period, an optional hatched
 *  projection stacked on a bar (e.g. September's remaining pace), a goal line,
 *  and one pinned callout. Hovering a bar shows its annotation. */
export interface ColumnChartSpec {
  yMax: number;
  yTicks: Tick[];
  bars: {
    label: string;
    value: number;
    /** Projected amount stacked on top, drawn hatched. */
    projected?: number;
    /** Label above the bar (e.g. "$420K", "~$498K"). */
    display: string;
    /** Hover annotation lines. */
    hover?: string[];
    /** Draw this bar in the alert tone. */
    tone?: "viz" | "danger" | "muted";
  }[];
  /** `label` names it in the legend; `short` sits at the line's right end. */
  goal?: { at: number; label: string; short?: string };
  callout?: { bar: number; text: string };
  /** Legend label for the hatched part. */
  projectedLabel?: string;
  height?: number;
}

/** A row in a ranked table: name, a bar for its share of the top value, an
 *  optional extra column, a change pill, an optional sparkline, a pinned note,
 *  and an optional row button (posts a follow-up prompt). */
export interface RankedRow {
  name: string;
  detail?: string;
  value: number;
  display: string;
  extra?: string;
  delta?: Delta;
  /** A few points for an inline sparkline (oldest first). */
  spark?: number[];
  /** Hover labels for the sparkline points (same length as `spark`). */
  sparkLabels?: string[];
  /** A short pinned annotation shown under the row's name. */
  note?: string;
  /** Highlight the row (alert tone) and mute the others. */
  highlight?: boolean;
  action?: { label: string; prompt: string };
}

/** A horizontal bar row with an optional tag (e.g. "High returns"). */
export interface HBarRow {
  label: string;
  detail?: string;
  value: number;
  display: string;
  /** Extra right-hand figure (e.g. stock value). */
  extra?: string;
  tag?: Pill;
  highlight?: boolean;
  hover?: string[];
}

/** A signal row in the at-risk accounts list; each signal draws its own mini chart. */
export interface RiskRow {
  name: string;
  segment: string;
  signal:
    | { kind: "gap"; days: number; usual: number }
    | { kind: "trend"; points: number[]; labels: string[] }
    | { kind: "stopped"; category: string };
  signalText: string;
  annual: string;
  action?: { label: string; prompt: string };
}

/** One part of a part-to-whole bar (e.g. pipeline by status). */
export interface StackPart {
  label: string;
  value: number;
  display: string;
  detail?: string;
}

/** A table cell: plain text, or text with a pill / muted / emphasis treatment. */
export type InsightCell =
  | string
  | {
      text?: string;
      pill?: Pill;
      muted?: boolean;
      strong?: boolean;
      /** The text as a link (to the Salesforce record or area). */
      href?: string;
      /** A small white button that sends a prompt. */
      button?: { label: string; prompt: string };
    };

/** One row of an objectives list: name, target vs actual, progress, status. */
export interface ObjectiveRow {
  label: string;
  target: string;
  actual: string;
  /** 0–1 (can exceed 1 when beating target; the bar caps at full). */
  progress: number;
  status: Pill;
}

export type InsightSection =
  | { type: "kpis"; title?: string; items: Kpi[] }
  | ({ type: "line"; title?: string } & LineChartSpec)
  | { type: "stacked"; title?: string; total?: string; parts: StackPart[] }
  | {
      type: "table";
      title?: string;
      columns: { label: string; align?: "left" | "right" }[];
      rows: InsightCell[][];
      meta?: string;
    }
  | { type: "objectives"; title?: string; rows: ObjectiveRow[] }
  | ({ type: "columns"; title?: string; summary?: string } & ColumnChartSpec)
  | {
      type: "ranked";
      title?: string;
      /** Column headers: name, bar, extra (optional), change. */
      columns: { name: string; value: string; extra?: string; delta?: string; spark?: string };
      rows: RankedRow[];
      meta?: string;
    }
  | {
      type: "hbars";
      title?: string;
      summary?: string;
      /** Axis end + ticks (e.g. 0–90 days). */
      max: number;
      ticks?: Tick[];
      /** A vertical threshold line across the rows (e.g. 60 days, store average). */
      threshold?: { at: number; label: string };
      columns?: { label: string; value: string; extra?: string };
      rows: HBarRow[];
    }
  | {
      type: "mix";
      title?: string;
      summary?: string;
      categories: string[];
      rows: { label: string; parts: number[] }[];
      /** Pin a note to one part: row index + category index. */
      callout?: { row: number; part: number; text: string };
    }
  | { type: "facts"; title?: string; items: { label: string; value?: string; pill?: Pill }[] }
  | { type: "risk"; title?: string; rows: RiskRow[] }
  /** An in-card switch between alternate section sets (Revenue / Orders). */
  | { type: "toggle"; title?: string; summary?: string; options: { label: string; sections: InsightSection[] }[] }
  /** Card buttons: real Commerce drill-downs that post a prompt. */
  | { type: "actions"; items: { label: string; prompt: string }[] }
  /** A short summary: a few lines, each led by a bold phrase. */
  | { type: "summary"; title?: string; items: { lead: string; text: string }[] }
  /** A to-do list: each task with its owner and where it came from. */
  | { type: "todo"; title?: string; items: TodoItem[]; meta?: string }
  /** Messages as they read in Slack (e.g. today's reminders): sender, time, text. */
  | { type: "messages"; title?: string; items: { from: string; time: string; text: string }[] }
  /** Next best actions: 2–3 cards, each a short why and one CTA. A CTA with a
   *  `prompt` posts it as Aaron; one with `href` goes somewhere (display only). */
  | { type: "next"; items: NextAction[] };

export interface ChecklistItem {
  title: string;
  pill?: Pill;
  pairs: { label: string; value: string }[];
}

export interface TodoItem {
  task: string;
  owner: string;
  source: Pill;
}

/** A white button with an app's logo beside a group's title: a prompt to
 *  send, or a link out. */
export interface AppAction {
  label: string;
  logo: string;
  prompt?: string;
  href?: string;
}

export interface NextAction {
  icon: "growth" | "accounts" | "orders" | "stock" | "mail" | "meeting" | "slack" | "tasks" | "store";
  title: string;
  body: string;
  cta: { label: string; prompt?: string; href?: string };
}

/** The expanded (full-screen) form of an insight: a page title, then groups,
 *  each a group title over its sections. */
export interface InsightPage {
  title: string;
  subtitle?: string;
  groups: InsightGroup[];
}

/** A titled group on a full-screen page. */
export interface InsightGroup {
  title: string;
  /** A white app button beside the group's title (Push to Asana, Open Slack). */
  action?: AppAction;
  sections: InsightSection[];
}

/** A promotion in the draft / created card. */
export interface PromoRow {
  id: string;
  name: string;
  discount: string;
  appliesTo: string;
  audience: string;
  dates: string;
  note?: string;
  /** Changed by an edit — shows an "Updated" pill. */
  updated?: boolean;
  /** Switched on with Make live — shows a Live pill. */
  live?: boolean;
}

/** One view Aaron can include in an exported report. */
export interface ExportItem {
  id: string;
  label: string;
  group: string;
  checked?: boolean;
}

/** A page of a previewed report (the side panel). */
export interface ReportPage {
  /** The cover page: title, scope line, KPI strip. */
  cover?: { title: string; scope: string; kpis: Kpi[] };
  title?: string;
  takeaway?: string;
  /** Two or three key points under the takeaway, before the charts. */
  points?: string[];
  sections?: InsightSection[];
}

/** A file Claude created (file card → side preview). */
export interface FileRef {
  id: string;
  title: string;
  /** "PDF" — shown as "Document · PDF" on the card and "· PDF" in the panel. */
  format: string;
  pages: ReportPage[];
}

/** Every view carries an optional body `heading` (the card's own title, per the
 *  slot type scale) and an optional `headingPill` shown beside it. */
interface ViewChrome {
  heading?: string;
  headingPill?: Pill;
  /** One quiet line under the heading: scope, owner or time. Never restates
   *  the heading. */
  subtitle?: string;
}

export type SlotView =
  | ({ kind: "quote-list"; rows: QuoteRow[] } & ViewChrome)
  | ({
      kind: "quote-detail";
      /** The headline figures (grand total, units, expiry). */
      kpis: Kpi[];
      lines: LineRow[];
      /** Optional SLDS Path stepper above the fields (e.g. Draft → Needs Review
       *  → Approved), showing where the quote sits in its lifecycle. `current`
       *  is the active stage. */
      steps?: string[];
      current?: string;
      /** An optional note the buyer attached to the quote for the merchant
       *  (buyer → merchant, incoming — distinct from the step-5 storefront note
       *  the merchant writes back). Shown as a callout on the detail card. */
      buyerNote?: { author: string; body: string };
    } & ViewChrome)
  | ({
      kind: "entitlement";
      products: ProductRow[];
      /** How many products to show inline before the full-screen catalog (rest
       *  are shown only when expanded). Default: all. */
      inlineCount?: number;
      /** When set, each addable product row shows this button; clicking it posts
       *  a user message asking Claude to add that product as a free sample. */
      addLabel?: string;
      /** When set, each row gets a checkbox and the table a footer button
       *  ("Add 3 to cart"). The button posts one user message naming every
       *  ticked product: `${prompt} A, B and C.` */
      cartPicker?: { prompt: string };
    } & ViewChrome)
  | ({ kind: "sample-result"; line: LineRow; deltas: DeltaRow[] } & ViewChrome)
  | ({
      kind: "note";
      title: string;
      /** The note body. A `{name}` token is rendered as a merge-field chunk
       *  (labelled by `mergeLabel`), so the merchant sees that the buyer will be
       *  addressed by their first name at send time rather than a hard-coded name. */
      body: string;
      /** Label shown inside the `{name}` merge-field chunk (default "First name"). */
      mergeLabel?: string;
      audience: string;
    } & ViewChrome)
  | ({ kind: "approval"; steps: string[]; current: string; facts: Field[] } & ViewChrome)
  | ({
      kind: "context";
      /** Resolved facts (store / buyer / account ids, or a checkout summary). */
      fields: Field[];
      /** Optional quiet note under the fields. */
      note?: string;
      /** Optional primary action (e.g. "Place order") — fires an in-app
       *  `actionKey` beat (no user bubble; the app does the thing). */
      action?: { label: string; actionKey: string };
    } & ViewChrome)
  | ({
      kind: "select";
      /** Optional lead-in line above the options. */
      intro?: string;
      options: SelectOption[];
    } & ViewChrome)
  | ({
      kind: "cart";
      lines: LineRow[];
      totals: SummaryRow[];
      /** Optional primary action (e.g. "Proceed to checkout") — posts a user
       *  message (`sendPrompt`), reading as the rep's next ask in chat. */
      action?: { label: string; sendPrompt: string };
    } & ViewChrome)
  | ({
      kind: "order-confirm";
      /** The placed order number, shown large with a success check. */
      orderNumber: string;
      fields: Field[];
    } & ViewChrome)
  | ({
      kind: "order-list";
      rows: OrderRow[];
      /** Label on each row's prefill button (default "Reorder"). */
      reorderLabel?: string;
    } & ViewChrome)
  | ({
      kind: "order-detail";
      kpis: Kpi[];
      /** Who placed the order when a rep placed it on the buyer's behalf. */
      placedBy?: { name: string; email: string; initial: string; onBehalfOf: string };
      fields: Field[];
      lines: LineRow[];
      totals: SummaryRow[];
    } & ViewChrome)
  | ({
      kind: "chart";
      /** Headline figures above the bars (inline and full screen). */
      kpis?: Kpi[];
      bars: ChartBar[];
      /** Optional label for what the bars measure (e.g. "Spend by buyer account"). */
      caption?: string;
      /** Optional quiet meta line under the chart (e.g. "$412,900 across 37 orders"). */
      meta?: string;
      /** Full-screen report shown when the floating chart is expanded. The inline
       *  view stays just the bar chart; this adds KPIs + breakdown + family split. */
      report?: ChartReport;
    } & ViewChrome)
  | ({
      kind: "insight";
      /** Scope / time under the heading ("Alpine · Q3 to date"). Never restates
       *  the heading. */
      subtitle?: string;
      sections: InsightSection[];
      /** The full-screen page shown when the slot is expanded. */
      full?: InsightPage;
    } & ViewChrome)
  | ({
      kind: "promotions";
      /** draft → Create all 3 / Edit promotions; created → Make live per row. */
      stage: "draft" | "created";
      rows: PromoRow[];
      /** Audience choices offered in edit mode. */
      audiences?: string[];
      /** Draft: the create action. The card appends each row's audience
       *  (`key|aud1|aud2|…`) so in-card edits carry into the created promotions. */
      createActionKey?: string;
      /** Created: the action that turns on every inactive promotion at once,
       *  a button at the card's end while any is still inactive. */
      liveAllActionKey?: string;
      footnote?: string;
    } & ViewChrome)
  | ({
      kind: "export";
      defaultTitle: string;
      items: ExportItem[];
      /** Plays `key|title|id1,id2,…` (no user bubble). */
      actionKey: string;
    } & ViewChrome);

/**
 * Optional card footer. Present only when a response overflows the card — e.g.
 * a list truncated to a few rows links out to the rest in the connected app.
 *   - `meta` — left-aligned status ("Showing 4 of 12 results").
 *   - `link` — right-aligned "View in App" link label (arrow added by the UI).
 */
export interface CardFooter {
  meta?: string;
  link?: string;
}

/** In-transcript display modes. `fullscreen` is not a mode here — it's the
 *  expanded view of an `expandable` `inline-card` or `floating` block. */
export type SlotMode = "inline-card" | "inline-carousel" | "floating";

export type Block =
  | { type: "text"; content: string }
  /** Claude acknowledging something to remember: a muted bookmark line,
   *  "Noted for later · Premium Grinder". */
  | { type: "noted"; items: string }
  /** A file Claude created: the file card; clicking opens the side preview. */
  | { type: "file"; file: FileRef }
  /** A share affordance shaped like the file card (e.g. Send to Slack).
   *  With `actionKey` its button plays that in-app action (no user bubble)
   *  and the card shows `sent` once it has (or a chip fired it); without,
   *  display only. */
  | { type: "share"; service: "slack"; title: string; meta: string; action: string; actionKey?: string; sent?: string }
  /** Another app Claude used (Slack): the app's logo, what it did, then the
   *  result (see `AppStep`). */
  | { type: "apps"; steps: AppStep[] }
  /** Claude's own to-do list from the chat (not a Salesforce card): numbered
   *  tasks, each a pill and its label–value pairs (see `ChecklistItem`). */
  | { type: "checklist"; title: string; meta?: string; items: ChecklistItem[] }
  /** Tool calls made partway through a response (a follow-on part, see
   *  `ScriptedResponse.then`): the same timeline, between blocks. */
  | { type: "tools"; tools: ToolCall[]; skill?: string }
  /** Salesforce writes: the "Writing to Salesforce" timeline (see `WriteStep`). */
  | { type: "writes"; steps: WriteStep[] }
  /** Claude asking before it writes to Salesforce: what it would change, then
   *  Deny / Allow. Allow plays the experience action `allow`; Deny replies
   *  with `denied`. Folds to one line once decided. */
  | { type: "permission"; title: string; changes: string[]; allow: string; denied: string }
  | {
      type: "slot";
      mode: SlotMode;
      app: CardApp;
      /** Footer applies to `inline-card` only; carousels have no footer. */
      footer?: CardFooter;
      /** `inline-carousel` only: how many placeholder tiles to render (default 4)
       *  when no `tiles` are given. */
      count?: number;
      /** `inline-carousel` only: real product tiles. Omit for placeholders. */
      tiles?: ProductTile[];
      /** `inline-card` / `floating` only: show the expand affordance so the app
       *  can be opened full-screen. Carousels are never expandable. */
      expandable?: boolean;
      /** The widget the slot body renders. Omit for the reserved placeholder. */
      view?: SlotView;
      /** Override the card's skeleton dwell (ms) for this slot. */
      skeletonMs?: number;
      /** Show Export (PDF) and Share in the card header and the full-screen
       *  header. Export plays the experience action `export|title|id`; Share
       *  is display only. */
      exportAs?: { id: string; title: string };
    };

/** A slot block, narrowed out of the `Block` union. */
export type SlotBlock = Extract<Block, { type: "slot" }>;

export interface Message {
  id: string;
  role: Role;
  blocks: Block[];
  /** A skill this response ran (shown as a grey "Ran skill" chip on top, with a
   *  scroll icon) — for transparency, even when Claude selected it itself. */
  skill?: string;
  /** Headless 360 MCP tool calls this response made, shown as a vertical
   *  timeline above the response (and above the skill chip). See `ToolCall`. */
  tools?: ToolCall[];
  /** Claude's own tool summary ("Ran 2 commands, created a file"), a muted
   *  collapsed line atop the response. Not MCP. */
  activity?: string;
  /** True while a follow-on part is still playing: the action row waits. */
  pending?: boolean;
  /** Follow-up chips under the reply, shown only while it's the chat's last
   *  message (see `Suggestion`). */
  suggestions?: Suggestion[];
  /** A user message sent from a chip: the full prompt it played (the bubble
   *  shows the chip's short label), so the mic knows that step is done. */
  said?: string;
  /** Sent from the prompt box (typed or dictated): it counts as the mic's
   *  next step even when its words differ from the line. */
  typed?: boolean;
}

/**
 * A follow-up chip at the end of the latest reply. Of a reply's three, one is
 * live and plays a beat: `prompt` (sent as if typed, the bubble showing
 * `label`), `action` (an in-app button's beat, after a bubble with `label`),
 * or `expand` (opens the reply's expandable card full screen). The others are
 * inert, as the greeting's suggestion pills are. A reply that asks a question
 * in its card has none: it ends with just the logo.
 */
export interface Suggestion {
  label: string;
  prompt?: string;
  action?: string;
  expand?: boolean;
}

/**
 * A scripted response: the thinking steps to play (label + how long to dwell,
 * in ms) followed by the assistant blocks to render. This is what a forker
 * edits/replaces — see `script.ts`.
 */
export interface ScriptedResponse {
  thinking: { label: string; delay: number }[];
  response: Block[];
  /** Optional skill this beat ran (surfaced as a grey chip atop the response). */
  skill?: string;
  /** Optional Headless 360 MCP tool calls this beat made (shown as a vertical
   *  timeline atop the response, above the skill chip). See `ToolCall`. */
  tools?: ToolCall[];
  /** Optional Claude tool summary line (see `Message.activity`). */
  activity?: string;
  /** Optional follow-on part, played in the same message right after this one:
   *  its thinking runs below the text so far, then its tools and blocks append.
   *  Lets Claude say something (a margin check), then keep working. */
  then?: ScriptedResponse;
  /** Follow-up chips for the end of the reply (on the last part of a `then`
   *  chain). See `Suggestion`. */
  suggestions?: Suggestion[];
  /** Salesforce writes this beat makes. They play first, as their own part
   *  (the records land one at a time), then a pause, then `response`. */
  writes?: WriteStep[];
}
