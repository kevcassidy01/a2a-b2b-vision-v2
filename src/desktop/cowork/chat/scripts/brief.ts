import type { InsightCell, Kpi, Pill, RiskRow, TodoItem } from "../../../../chat/types";
import { copy } from "../../../../copy/copy";
import type { Beat, CoworkBlock, CoworkScript, DashboardBlock, IntegrationStep, Source } from "../types";
import { writing } from "./writes";

/**
 * Morning Brief — the run of show's scheduled task (decision 54). It starts
 * where the feature lives in Cowork: the Scheduled page's Daily briefing
 * template. Claude loads `/schedule`, explains how scheduled tasks work (the
 * live app's explainer, so the room learns the feature), and shows its setup
 * questions as a prompt template, a line per answer. Aaron dictates the whole
 * answer; Claude shows what it read as a key-value table, checks what it can
 * reach (Salesforce first, then the connectors), picks 8:30 AM from the
 * calendar, and proposes the task. Aaron adds "Slack me when it's ready" in a
 * second dictation, and the card updates. Schedule sets it up.
 *
 * Then the demo jumps to the next morning, Thursday 15 October (the demo is
 * Wednesday 14): the presenter's Ctrl+S pops Claude's Slack banner and the run
 * lands here (it ran at 8:30 while Aaron was away). Aaron dismisses the
 * banner, and opens the brief from its card on the Scheduled page. It's
 * commerce-first: a short summary, today's focus list (for Slack or Asana),
 * accounts at risk, store health fixes, today's Slack reminders, and what got
 * handled without him. Then Aaron dictates three instructions from it, and
 * Claude makes the changes in Salesforce: each write lists its records as
 * they land, as do the Fix issue buttons. The one thing the agents held for
 * Aaron overnight (Delivery Watch's split shipment) waits under the brief as a
 * one-click choice; once he picks, the agent carries on without him.
 */

const t = copy.desktop.cowork.flows.items.find((f) => f.id === "brief")!;

/** The second dictation: the edit to the proposed task. */
const SLACK_ASK = "And Slack me when it's ready";
/** The third: Aaron's instructions, from the brief's own data points. */
const INSTRUCT =
  "Approve Hartwell's quote with a 5% promo. | Put AP-7 back in stock on the store from Leeds. | And hold Halden & Rook's cart price till Friday, and nudge their buyer.";

/** The brief's next best actions, also its closing chips. */
export const SLACK_TEAM_CHIP = "Send the focus list to my team on Slack";
export const ASANA_CHIP = "Push the focus list to Asana";

/** The store-health table's Fix issue buttons. */
const FIX = {
  product: "Fix the AP-7 product page",
  checkout: "Fix the checkout drop-off",
  search: 'Fix the "PoE switch" search',
  payments: "Turn on payment retry",
};

/** Generic follow-ups, so every reply ends with something to click. */
const NEXT_CHIP = "What should I do next?";
const RISK_CHIP = "Who else might be at risk?";
const REMIND_CHIP = "Remind me at 4 PM to check on Hartwell";
const SETUP = "setup";
const SLACK = "slack";
const ACT = "act";

/** How long each integrations step works before its result lands. */
const STEP_MS = 1300;
const grow: Beat = { wait: STEP_MS, grow: true };

const SETUP_STEPS: IntegrationStep[] = [
  {
    app: "salesforce",
    action: "Read your accounts' orders, carts and quotes",
    tool: { name: "dispatch_readonly", target: "merchant-order-management" },
    result: "214 active accounts · 1,240 open quotes",
  },
  {
    app: "salesforce",
    action: "Read your B2B store's health",
    tool: { name: "dispatch_readonly", target: "merchant-storefront-management" },
    result: "Stock on product pages, checkout, search, payments",
  },
  {
    app: "salesforce",
    action: "Read what Delivery Watch and Growth Scout do",
    tool: { name: "dispatch_readonly", target: "agent activity" },
    result: "2 live agents · their actions and dashboards",
  },
  { app: "calendar", action: "Read your calendar", result: "Most days start at 10:00 AM" },
  { app: "gmail", action: "Read your inbox", result: "Buyer threads and quote replies" },
  { app: "slack", action: "Read your Slack reminders", result: "Reminders you set for yourself" },
];

const INSTRUCTIONS = [
  "Read what Delivery Watch and Growth Scout did since yesterday",
  "Go through my accounts in Salesforce: orders, carts and quotes, and flag the ones at risk",
  "Check my B2B store: stock on product pages, checkout, search and payments",
  "Check my inbox, my calendar and today's Slack reminders",
  "Write one brief: a short summary, today's focus list, accounts at risk, store fixes, and what got handled without me",
];

const FACTS = (slack: boolean) => [
  { label: "Type", value: "Scheduled task · weekdays" },
  { label: "Runs", value: "Weekdays at 8:30 AM, ready by 9" },
  { label: "First run", value: "Tomorrow, Thursday 15 October" },
  { label: "Reads", value: "Salesforce Headless 360, both agents' results, Calendar, Gmail, Slack" },
  { label: "Results", value: slack ? "In this session, and a Slack DM when it's ready" : "In this session" },
  { label: "Runs on", value: "This computer, while Claude is open" },
];

const schedule = (slack: boolean): CoworkBlock => ({
  type: "schedule",
  status: "proposed",
  name: "Morning Brief",
  summary: "One brief each weekday morning: a short summary, today's focus list, accounts at risk, what to fix on your store, and what got handled without you.",
  when: "Weekdays at 8:30 AM",
  ready: "Ready by 9 AM",
  steps: slack ? [...INSTRUCTIONS, "DM Aaron on Slack when it's ready"] : INSTRUCTIONS,
  changes: slack ? ["notifications"] : undefined,
  facts: FACTS(slack),
});

/* ── The run: Thursday 15 October, 8:30 AM ─────────────────────────────── */

const DELIVERY: Pill = { label: "Delivery Watch", tone: "info" };
const GROWTH: Pill = { label: "Growth Scout", tone: "success" };
const BOOK: Pill = { label: "Your book", tone: "neutral" };
const STORE: Pill = { label: "Store health", tone: "warning" };

/** The run's own integrations, all done by the time Aaron looks. */
const RUN_STEPS: IntegrationStep[] = [
  {
    app: "salesforce",
    action: "Read what your agents did overnight",
    tool: { name: "dispatch_readonly", target: "agent activity" },
    result: "836 actions · 1 held for you",
  },
  {
    app: "salesforce",
    action: "Find accounts at risk",
    tool: { name: "dispatch_readonly", target: "merchant-order-management" },
    result: "4 accounts · $1.34M a year in orders",
  },
  {
    app: "salesforce",
    action: "Check your B2B store's health",
    tool: { name: "dispatch_readonly", target: "merchant-storefront-management" },
    result: "4 issues · ~$38K a week in lost orders",
  },
  { app: "calendar", action: "Read today's calendar", result: "3 meetings · first at 10:00 AM" },
  { app: "gmail", action: "Check for buyers waiting on you", result: "1 buyer · Hartwell Hospital" },
  { app: "slack", action: "Read today's Slack reminders", result: "3 reminders" },
];

const KPIS: Kpi[] = [
  { label: "Focus today", value: "6", detail: "2 for you, 4 for your team" },
  { label: "Accounts at risk", value: "4", detail: "$1.34M a year in orders" },
  { label: "Store fixes", value: "4", detail: "~$38K a week in lost orders" },
];

const ORDERS = [118, 124, 96, 40, 32, 131, 161];
const CHART: DashboardBlock["chart"] = {
  title: "Orders by day · 8 to 14 October",
  yMax: 200,
  yTicks: [0, 50, 100, 150, 200].map((at) => ({ at, label: String(at) })),
  bars: ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"].map((label, i) => ({
    label,
    value: ORDERS[i],
    display: String(ORDERS[i]),
    hover: i === 6 ? ["161 orders, your best day this month", "41 won back by Growth Scout"] : [`${ORDERS[i]} orders`],
  })),
  height: 220,
};

const FOCUS: TodoItem[] = [
  { task: "Approve Hartwell Hospital's $210K quote before it expires Friday", owner: "You", source: BOOK },
  { task: "Get AP-7 showing in stock on the store: Leeds has 40", owner: "Jun Park", source: STORE },
  { task: "Save Halden & Rook's stalled $31.5K cart", owner: "Marcus Webb", source: DELIVERY },
  { task: "Clear the 3 Growth Scout quotes over $15K", owner: "You", source: GROWTH },
  { task: "Fix the checkout step losing 18% of carts", owner: "Jun Park", source: STORE },
  { task: "Chase Brandt Bau's PO for the Leeds site", owner: "Dana Whitfield", source: BOOK },
];

const AT_RISK: RiskRow[] = [
  {
    name: "Hartwell Hospital",
    segment: "Healthcare · your book",
    signal: { kind: "gap", days: 74, usual: 30 },
    signalText: "No order in 74 days. Their $210K quote expires Friday; their buyer opened it 4 times yesterday",
    annual: "$640K",
  },
  {
    name: "Halden & Rook",
    segment: "Construction · from Delivery Watch",
    signal: { kind: "trend", points: [42, 40, 37, 33, 28, 22], labels: ["Sep 7", "Sep 14", "Sep 21", "Sep 28", "Oct 5", "Oct 12"] },
    signalText: "Orders down 48% in 6 weeks; a 120 × AP-7 cart has stalled for 3 days",
    annual: "$380K",
  },
  {
    name: "Mistral Hotels",
    segment: "Hospitality · from Growth Scout",
    signal: { kind: "trend", points: [30, 29, 27, 24, 21, 19], labels: ["Sep 7", "Sep 14", "Sep 21", "Sep 28", "Oct 5", "Oct 12"] },
    signalText: "Orders down 36% since August; their $15,960 quote waits on you",
    annual: "$220K",
  },
  {
    name: "Brockley Labs",
    segment: "Education",
    signal: { kind: "stopped", category: "Optics" },
    signalText: "Stopped ordering optics, and on credit hold",
    annual: "$96K",
  },
];

/** Each area links to it in Salesforce; Fix issue asks Claude to fix it. */
const area = (text: string): InsightCell => ({ text, strong: true, href: "#" });
const fix = (prompt: string): InsightCell => ({ button: { label: "Fix issue", prompt } });
const STORE_FIXES: InsightCell[][] = [
  [area("Product page"), "AP-7 shows out of stock, but Leeds has 40 on hand", "$14,200", fix(FIX.product)],
  [area("Checkout"), "18% of carts drop at the shipping step since Tuesday", "$12,600", fix(FIX.checkout)],
  [area("Search"), '212 searches for "PoE switch" found nothing', "$6,900", fix(FIX.search)],
  [area("Payments"), "9 card payments failed, with no retry", "$4,300", fix(FIX.payments)],
];

const REMINDERS = [
  { from: "Slackbot", time: "9:00 AM", text: "Reminder: chase Brandt Bau's PO for the Leeds site." },
  { from: "Slackbot", time: "11:00 AM", text: "Reminder: send Dana the Q4 forecast before the 4 PM call." },
  { from: "Slackbot", time: "2:00 PM", text: "Reminder: check in with Marcus on Halden & Rook." },
];

const HANDLED: InsightCell[][] = [
  ["2:14 AM", { pill: DELIVERY }, "Rebooked Holloway Labs' order with DPD after a carrier delay", "$6,200, still on time"],
  ["6:05 AM", { pill: DELIVERY }, "Moved 12 × RT-5 to Leeds for Marlow & Finch", "$3,700, back on time"],
  ["7:00 AM", { pill: GROWTH }, "Moved 570 open quotes to 10% off, as you asked", "All above floor"],
  ["7:05 AM", { pill: GROWTH }, "Reminded 240 buyers who hadn't opened their quote", "From your Gmail"],
];

const DASHBOARD_SOURCES: Source[] = [
  { app: "salesforce", label: "Order" },
  { app: "salesforce", label: "Quote" },
  { app: "salesforce", label: "B2B store" },
  { app: "slack", label: "Reminders" },
];

const BRIEF: DashboardBlock = {
  type: "dashboard",
  title: "Morning Brief",
  kpis: KPIS,
  chart: CHART,
  footer: "Thursday 15 October · ran at 8:30 AM",
  sources: DASHBOARD_SOURCES,
  full: {
    title: "Morning Brief",
    subtitle: "Thursday 15 October · ran at 8:30 AM · your accounts, store, inbox, Slack and both agents",
    groups: [
      {
        title: "Summary",
        sections: [
          {
            type: "summary",
            items: [
              { lead: "Hartwell comes first.", text: "Their $210K quote expires Friday, and their buyer opened it 4 times yesterday." },
              { lead: "4 accounts are at risk,", text: "worth $1.34M a year in orders. Halden & Rook's stalled cart is the one to save today." },
              { lead: "Your store is losing ~$38K a week", text: "to 4 fixable issues. The biggest: AP-7 shows out of stock while Leeds has 40." },
              { lead: "Yesterday was your best day this month:", text: "161 orders, 41 of them won back by Growth Scout. Your agents handled 836 things overnight." },
            ],
          },
          {
            type: "kpis",
            items: [...KPIS, { label: "Handled overnight", value: "836", detail: "By your 2 agents, all within policy" }],
          },
        ],
      },
      {
        title: "Today's focus",
        action: { label: "Push to Asana", logo: "/connectors/asana.svg", prompt: ASANA_CHIP },
        sections: [{ type: "todo", items: FOCUS, meta: "6 tasks · 2 for you, 4 for your team" }],
      },
      {
        title: "Accounts at risk",
        sections: [{ type: "risk", rows: AT_RISK }],
      },
      {
        title: "Store health: what to fix",
        sections: [
          {
            type: "table",
            columns: [{ label: "Area" }, { label: "What's wrong" }, { label: "Lost a week", align: "right" }, { label: "" }],
            rows: STORE_FIXES,
            meta: "~$38K a week in lost orders · biggest first",
          },
        ],
      },
      {
        title: "Your Slack reminders for today",
        action: { label: "Open Slack", logo: "/connectors/slack.svg", href: "#" },
        sections: [{ type: "messages", items: REMINDERS }],
      },
      {
        title: "Handled without you",
        sections: [
          {
            type: "table",
            columns: [{ label: "Time" }, { label: "Agent" }, { label: "What it did" }, { label: "Result" }],
            rows: HANDLED,
            meta: "836 actions overnight, all within policy",
          },
          {
            type: "columns",
            summary: "Yesterday was your best day this month: 41 of its 161 orders came from Growth Scout's quotes.",
            ...CHART,
          },
        ],
      },
      {
        title: "Next best actions",
        sections: [
          {
            type: "next",
            items: [
              {
                icon: "slack",
                title: "Hand the focus list to your team",
                body: "Post it to #ohana-sales-team, with each owner tagged.",
                cta: { label: "Send on Slack", prompt: SLACK_TEAM_CHIP },
              },
              {
                icon: "tasks",
                title: "Track it in Asana",
                body: "One task per item, assigned to its owner and due today.",
                cta: { label: "Push to Asana", prompt: ASANA_CHIP },
              },
              {
                icon: "store",
                title: "See your store's health",
                body: "All 4 issues, with the orders each one cost this week.",
                cta: { label: "Open in Salesforce", href: "#" },
              },
            ],
          },
        ],
      },
    ],
  },
};

/** Putting Leeds' AP-7s on the store: from an instruction or Fix issue. */
const STOCK_WRITES: IntegrationStep["writes"] = [
  { op: "insert", object: "LocationGroupAssignment", name: "Leeds", fields: "LocationGroup Ohana B2B store" },
  { op: "update", object: "ProductItem", name: "AP-7 · Leeds", fields: "QuantityOnHand 40 · store visible" },
  { op: "update", object: "Product2", name: "AP-7 access point", fields: "Availability Out of stock → In stock" },
];

/** Aaron's three instructions, as Claude makes them in Salesforce. */
const ACT_STEPS: IntegrationStep[] = [
  {
    app: "salesforce",
    action: "Approve Hartwell Hospital's quote with a 5% promo",
    tool: { name: "dispatch_write", target: "merchant-quote-management" },
    result: "Q-20418 · $199,500 · approved",
    writes: [
      { op: "update", object: "Quote", name: "Q-20418", fields: "Status Approved · Discount 5% · GrandTotal $199,500" },
      { op: "insert", object: "PromotionQualifier", name: "Hartwell Q4 promo", fields: "Quote Q-20418 · 5% · ends 16 Oct" },
      { op: "insert", object: "EmailMessage", name: "Approved quote", fields: "To the buyer · ohana.store/q/20418" },
    ],
  },
  {
    app: "salesforce",
    action: "Show Leeds stock for AP-7 on your store",
    tool: { name: "dispatch_write", target: "merchant-catalog-management" },
    result: "40 in stock · page live",
    writes: STOCK_WRITES,
  },
  {
    app: "salesforce",
    action: "Hold Halden & Rook's cart price, and nudge their buyer",
    tool: { name: "dispatch_write", target: "merchant-cart-management" },
    result: "Price held to Friday · buyer nudged",
    writes: [
      { op: "update", object: "WebCart", name: "CART-3381", fields: "PriceHeldUntil 16 Oct · Discount 0%" },
      { op: "insert", object: "EmailMessage", name: "Cart reminder", fields: "To the buyer · checkout link" },
    ],
  },
];

const done = (title: string, time: string, details: { label: string; value: string }[]): CoworkBlock => ({
  type: "action",
  agent: "Claude",
  title,
  time,
  details,
  footer: "Done in Salesforce, as you asked",
});

/** The one ask the agents held for Aaron overnight: a one-click choice. */
const SPLIT = "Ship the 60 access points now";
const HOLD = "Hold it, ship all 68 on Tuesday";
const OVERNIGHT_ASK: CoworkBlock = {
  type: "choice",
  id: "whitcombe",
  question: "Whitcombe Schools: 8 SW-24 switches are backordered until Tuesday. Their term starts Monday. Ship in two?",
  options: [
    { label: SPLIT, detail: "Arrives Friday, before term · the switches follow Tuesday · +$85 freight", tag: "Recommended" },
    { label: HOLD, detail: "One delivery, after term starts · no extra freight" },
  ],
};
/** After the pick: the writes, then the agent takes it from there. */
const shipWrites = (split: boolean): IntegrationStep => ({
  app: "salesforce",
  action: split ? "Split Whitcombe Schools' order and ship" : "Hold Whitcombe Schools' order for Tuesday",
  tool: { name: "dispatch_write", target: "merchant-fulfillment-management" },
  result: split ? "ORD-10566 · 2 shipments" : "ORD-10566 · ships Tuesday",
  writes: split
    ? [
        { op: "insert", object: "FulfillmentOrder", name: "FO-10566-1", fields: "60 × AP-7 · Leeds · ships today" },
        { op: "insert", object: "FulfillmentOrder", name: "FO-10566-2", fields: "8 × SW-24 · ships Tuesday" },
        { op: "update", object: "OrderSummary", name: "ORD-10566", fields: "Status Partially Shipped · Freight +$85" },
        { op: "insert", object: "EmailMessage", name: "Shipping update", fields: "To the buyer · 2 deliveries" },
      ]
    : [
        { op: "update", object: "FulfillmentOrder", name: "FO-10566", fields: "Status Held · ShipDate Tue 20 Oct" },
        { op: "insert", object: "EmailMessage", name: "Shipping update", fields: "To the buyer · arrives Wednesday" },
      ],
});
const shipped = (split: boolean): Beat[] => [
  ...writing([shipWrites(split)], ["Telling Delivery Watch"]),
  {
    wait: 800,
    block: {
      type: "text",
      content: split
        ? "**Delivery Watch has it from here.** The 60 access points leave Leeds today and arrive Friday. When the switches land on Tuesday it'll ship them and tell the buyer, without coming back to you."
        : "**Delivery Watch has it from here.** It'll ship all 68 together when the switches land on Tuesday and keep the buyer posted, without coming back to you.",
    },
  },
  { wait: 400, block: SUGGEST },
];

/** Every reply's suggestions; the chat drops the ones Aaron has already used. */
const SUGGEST: CoworkBlock = { type: "chips", items: [SLACK_TEAM_CHIP, ASANA_CHIP, NEXT_CHIP, RISK_CHIP, REMIND_CHIP] };

/** A Fix issue reply: the write, then Claude's action card. */
const fixed = (step: IntegrationStep, title: string, details: { label: string; value: string }[]): Beat[] => [
  { wait: 400, thinking: "Fixing it in Salesforce" },
  ...writing([step], ["Fixing it in Salesforce"]),
  { wait: 700, block: done(title, "9:06 AM", details) },
  { wait: 400, block: SUGGEST },
];

/** A short answer, then the suggestions. */
const answer = (thinking: string, content: string): Beat[] => [
  { wait: 400, thinking },
  { wait: 1200, block: { type: "text", content } },
  { wait: 400, block: SUGGEST },
];

export const brief: CoworkScript = {
  steps: ["Understand the request", "Set up the schedule", "Connect your tools", "Schedule the task", "First run"],
  opening: [
    { wait: 500, thinking: "Reading your request" },
    { wait: 1200, thinking: "Loading the schedule skill" },
    { wait: 1000, progress: 1, skill: "schedule", block: { type: "skill", name: "/schedule" } },
    {
      wait: 900,
      block: {
        type: "text",
        content:
          "**How scheduled tasks work in Cowork**\n- **What it is:** a saved task I run for you on a schedule.\n- **When it runs:** at the time you pick, in your time zone.\n- **Fresh start every time:** each run reads everything again, so the brief is always current.\n- **App must be open:** it runs on this computer while Claude is open. If your Mac is asleep, it runs when it wakes.\n- **Results:** each run lands here in this session, and I can message you when it's ready.",
      },
    },
    { wait: 900, block: { type: "text", content: "A few questions to set up your daily brief:" } },
    {
      wait: 500,
      progress: 2,
      block: {
        type: "template",
        title: "Your answer, a line each",
        lines: [
          { label: "How often:", hint: "every weekday, every morning…" },
          { label: "Go through:", hint: "your accounts, your store, your inbox, your agents…" },
          { label: "Ready by:", hint: "a time, like 9 AM" },
          { label: "Give me:", hint: "what goes in it: a summary, a to-do list…" },
        ],
      },
    },
  ],
  onStart: [
    { wait: 400, thinking: "Scheduling Morning Brief" },
    {
      wait: 1400,
      progress: 4,
      block: {
        type: "text",
        content:
          "**Morning Brief is scheduled.** Your first one is ready tomorrow, **Thursday 15 October, by 9 AM**, and I'll Slack you when it is. You'll find it under **Scheduled**.",
      },
    },
  ],
  dictations: [t.prompt, SLACK_ASK, INSTRUCT],
  run: {
    file: "morning-brief-15-oct.md",
    progress: 5,
    blocks: [
      { type: "divider", label: "Thursday 15 October · 8:30 AM" },
      { type: "integrations", steps: RUN_STEPS, shown: RUN_STEPS.length },
      {
        type: "text",
        content:
          "**Good morning, Aaron.** **6 things to focus on** today, 4 accounts at risk and 4 store fixes. Hartwell's $210K quote comes first: it expires Friday.",
      },
      BRIEF,
      {
        type: "text",
        content:
          "**One ask waited for you.** Your agents handled 836 things overnight on their own; Delivery Watch held this one, because it adds freight:",
      },
      OVERNIGHT_ASK,
      {
        type: "text",
        content: "Then tell me what to act on, in your own words, or hand the focus list to your team.",
      },
      SUGGEST,
    ],
  },
  replies: {
    [SPLIT]: [{ wait: 300, thinking: "Splitting the order" }, ...shipped(true)],
    [HOLD]: [{ wait: 300, thinking: "Holding the order" }, ...shipped(false)],
    [SETUP]: [
      { wait: 400, thinking: "Reading your answers" },
      {
        wait: 1200,
        block: {
          type: "answers",
          title: "Here's what I've got",
          facts: [
            { label: "How often", value: "Every weekday morning" },
            { label: "Goes through", value: "Your accounts, your B2B store, your inbox, Slack, and both agents' overnight work" },
            { label: "Ready by", value: "9 AM" },
            { label: "Gives you", value: "A short summary, today's focus list, accounts at risk, and what to fix on your store" },
          ],
        },
      },
      { wait: 700, block: { type: "text", content: "Let me check what it can reach." } },
      { wait: 600, thinking: "Checking your connectors" },
      { wait: 900, connector: "salesforce", block: { type: "integrations", shown: 0, steps: SETUP_STEPS } },
      grow,
      grow,
      grow,
      { ...grow, connector: "calendar" },
      { ...grow, connector: "gmail" },
      { ...grow, connector: "slack", progress: 3 },
      {
        wait: 900,
        block: {
          type: "text",
          content:
            "Your first meeting most days is at **10:00 AM**, so I'll run it at **8:30**: ready by 9, with time to read it. Here's the task:",
        },
      },
      { wait: 600, block: schedule(false) },
    ],
    [SLACK]: [
      { wait: 400, thinking: "Updating the task" },
      { wait: 1000, block: { type: "text", content: "Added: I'll DM you on Slack when it's ready." } },
      { wait: 500, block: schedule(true) },
    ],
    [ACT]: [
      { wait: 400, thinking: "Reading your instructions" },
      { wait: 1200, block: { type: "text", content: "On it: three changes in Salesforce." } },
      ...writing(ACT_STEPS, ["Approving Hartwell's quote", "Showing Leeds stock on the store", "Holding the cart price", "Wrapping up"]),
      {
        wait: 700,
        block: done("Approved Hartwell Hospital's quote with a 5% promo", "9:04 AM", [
          { label: "Quote", value: "Q-20418 · 500 × AP-7 and installation" },
          { label: "Was", value: "$210,000" },
          { label: "Now", value: "$199,500, with the 5% Hartwell Q4 promo" },
          { label: "Valid until", value: "Friday 16 October" },
          { label: "Buyer", value: "Emailed the approved quote, with a link to order" },
        ]),
      },
      {
        wait: 700,
        block: done("AP-7 is back in stock on your store", "9:04 AM", [
          { label: "Product", value: "AP-7 access point" },
          { label: "Was", value: "Out of stock" },
          { label: "Now", value: "40 in stock, ships from Leeds" },
          { label: "Why", value: "Leeds wasn't in the store's inventory list" },
          { label: "Expected", value: "About $14K a week of orders back" },
        ]),
      },
      {
        wait: 700,
        block: done("Held Halden & Rook's cart price until Friday", "9:05 AM", [
          { label: "Cart", value: "CART-3381 · 120 × AP-7 · $31,500" },
          { label: "Price", value: "Held until Friday 16 October, no extra discount" },
          { label: "Buyer", value: "Sent a reminder with a checkout link" },
        ]),
      },
      {
        wait: 800,
        block: {
          type: "text",
          content: "All three are done. **3 of today's 6 focus items are cleared**, and Hartwell's buyer has the approved quote.",
        },
      },
      { wait: 400, block: SUGGEST },
    ],
    [SLACK_TEAM_CHIP]: [
      { wait: 400, thinking: "Finding your team's channel" },
      {
        wait: 1200,
        block: {
          type: "integrations",
          shown: 0,
          steps: [{ app: "slack", action: "Post the focus list to #ohana-sales-team", result: "6 tasks · 3 teammates tagged" }],
        },
      },
      grow,
      {
        wait: 800,
        block: {
          type: "text",
          content:
            "Posted to **#ohana-sales-team** as a checklist, with each owner tagged: **@Jun Park** (2), **@Marcus Webb** (1) and **@Dana Whitfield** (1). Your 2 stay with you.",
        },
      },
      { wait: 400, block: SUGGEST },
    ],
    [ASANA_CHIP]: [
      { wait: 400, thinking: "Connecting to Asana" },
      {
        wait: 1200,
        connector: "asana",
        block: {
          type: "integrations",
          shown: 0,
          steps: [{ app: "asana", action: "Create tasks in the Ohana Sales project", result: "6 tasks · due today" }],
        },
      },
      grow,
      {
        wait: 800,
        block: {
          type: "text",
          content:
            "Done: **6 tasks in Asana**, in the **Ohana Sales** project. Each is assigned to its owner, due today, and links back to its Salesforce record.",
        },
      },
      { wait: 400, block: SUGGEST },
    ],
    [FIX.product]: fixed(
      { app: "salesforce", action: "Show Leeds stock for AP-7 on your store", tool: { name: "dispatch_write", target: "merchant-catalog-management" }, result: "40 in stock · page live", writes: STOCK_WRITES },
      "AP-7 is back in stock on your store",
      [
        { label: "Was", value: "Out of stock" },
        { label: "Now", value: "40 in stock, ships from Leeds" },
        { label: "Expected", value: "About $14K a week of orders back" },
      ],
    ),
    [FIX.checkout]: fixed(
      { app: "salesforce", action: "Bring back saved addresses at checkout", tool: { name: "dispatch_write", target: "merchant-storefront-management" }, result: "Shipping step fixed · live",
        writes: [
          { op: "update", object: "CartCheckoutSession", name: "Shipping step", fields: "UseSavedAddresses On" },
          { op: "update", object: "ContactPointAddress", name: "Buyers' saved addresses", fields: "IsDefault restored", count: 214 },
        ],
      },
      "Saved addresses are back at checkout",
      [
        { label: "Was", value: "18% of carts dropping at the shipping step" },
        { label: "Now", value: "Buyers' saved addresses fill in again" },
        { label: "Expected", value: "About $12.6K a week of orders back" },
      ],
    ),
    [FIX.search]: fixed(
      { app: "salesforce", action: 'Map "PoE switch" to SW-24 in store search', tool: { name: "dispatch_write", target: "merchant-storefront-management" }, result: "Synonym added · 212 searches now match",
        writes: [
          { op: "insert", object: "SearchSynonymGroup", name: '"PoE switch"', fields: "Synonyms SW-24, PoE switch, 24-port PoE" },
          { op: "update", object: "SearchIndex", name: "Ohana B2B store", fields: "Rebuilt · 212 searches now match" },
        ],
      },
      'Store search finds SW-24 for "PoE switch"',
      [
        { label: "Was", value: '212 searches for "PoE switch" found nothing' },
        { label: "Now", value: "They land on SW-24, the 24-port PoE switch" },
        { label: "Expected", value: "About $6.9K a week of orders back" },
      ],
    ),
    [FIX.payments]: fixed(
      { app: "salesforce", action: "Turn on payment retry", tool: { name: "dispatch_write", target: "merchant-payment-management" }, result: "Retry on · 7 of 9 now paid",
        writes: [
          { op: "insert", object: "PaymentRetryPolicy", name: "Card payments", fields: "3 tries over 24 hours" },
          { op: "update", object: "PaymentAuthorization", name: "Failed card payments", fields: "Status Failed → Captured", count: 7 },
        ],
      },
      "Payment retry is on",
      [
        { label: "Was", value: "9 card payments failed, with no retry" },
        { label: "Now", value: "Failed payments retry automatically; 7 of the 9 went through" },
        { label: "Expected", value: "About $4.3K a week of orders back" },
      ],
    ),
    [NEXT_CHIP]: answer(
      "Checking today's focus list",
      "Next: **clear the 3 Growth Scout quotes over $15K**, starting with Mistral Hotels' $15,960, then your **10:00 with Brandt Bau**: their Leeds PO is still open.",
    ),
    [RISK_CHIP]: answer(
      "Looking across your accounts",
      "Three more are slipping, but not at risk yet: **Corbel Studios** (orders down 22% since August), **Pennant Logistics** (no order in 41 days; they usually order every 28) and **Arden Clinics** (stopped ordering cabling). I'll keep an eye on them and flag them in tomorrow's brief.",
    ),
    [REMIND_CHIP]: [
      { wait: 400, thinking: "Setting a Slack reminder" },
      {
        wait: 1200,
        block: { type: "integrations", shown: 0, steps: [{ app: "slack", action: "Set a reminder for 4:00 PM", result: "Today · 4:00 PM" }] },
      },
      grow,
      { wait: 700, block: { type: "text", content: "Done: Slackbot will remind you at **4:00 PM** to check whether Hartwell has ordered." } },
      { wait: 400, block: SUGGEST },
    ],
  },
  intents: [
    { match: /hartwell|halden|ap-7/i, reply: ACT },
    { match: /slack me/i, reply: SLACK },
    { match: /weekday|every morning/i, reply: SETUP },
  ],
};
