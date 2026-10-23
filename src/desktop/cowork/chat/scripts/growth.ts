import type { InsightCell, InsightGroup, Kpi, Tone } from "../../../../chat/types";
import type { Beat, CoworkBlock, CoworkScript, DashboardBlock, IntegrationStep, Source } from "../types";
import { writing } from "./writes";

/**
 * Growth Scout — Agent 2 (decision 50, from Aaron's own win-back notes):
 * commerce outcomes, from quote to order. Lapsed buyers win back with approved
 * quotes. Independent of Delivery Watch: its own accounts, data and results.
 *
 * Same build as Delivery Watch: Claude says it'll set up an agent and builds
 * it with `/agents`; the integrations timeline shows Salesforce first, each
 * step with its Headless 360 call, then the connectors; the first sweep shows
 * the scale numbers, then the lapsed accounts with their quotes, biggest
 * first. The agent card says it runs daily for 7 days. Once live, a Salesforce
 * dashboard (quotes sent vs. orders from them) ticks up as the agent's result
 * cards land, each with Salesforce's Slack notification; its expand button
 * opens the full page (quote funnel, products, latest activity), and the
 * right-hand panel keeps it pinned. Chips ask what needs Aaron, who hasn't
 * opened, and which products win. It all happens on day 1, demo day (Wednesday
 * 14 October): no jumping ahead. The discount isn't a chip: Aaron types or
 * dictates it ("change the discount to 10%"), and the reply posts the dashboard
 * again with the rest of the week projected at 10% (hatched), pinned in the
 * panel, with Extend on its next best actions. "Stop" in Aaron's own words stops it.
 *
 * It grows revenue too: each quote email suggests one more product the account
 * is likely to add ("Also picked for you", from what it owns and what accounts
 * like it buy), never on the quote and never discounted, so it needs no OK. The
 * 2 big quotes that need Aaron come one at a time as recommendations, each with
 * an info note on why: add it and send, or send without it (the credit-hold one
 * is held, with nothing added). Add-ons count on the dashboard and in the
 * 10% projection.
 */

const SWEEP_SOURCES: Source[] = [
  { app: "salesforce", label: "Order" },
  { app: "salesforce", label: "OrderItem" },
  { app: "salesforce", label: "Pricebook" },
  { app: "salesforce", label: "Quote" },
];

/** How long each integrations step works before its result lands. */
const STEP_MS = 1500;
const grow: Beat = { wait: STEP_MS, grow: true };

export const NEEDS_YOU_CHIP = "Show me tasks that need my input";
export const EXTEND_CHIP = "Extend for 30 days";
export const STOP_CHIP = "Stop agent";
export const UNOPENED_CHIP = "Who hasn't opened their quote yet?";
export const PRODUCTS_CHIP = "Which products are winning back the most?";
/** Not a chip: Aaron asks for the new discount in their own words (`intents`). */
const DISCOUNT = "discount";
/** What the in-chat mic dictates: that change, in Aaron's words. */
const DISCOUNT_ASK = "Change the discount to 10% | for the rest of the week";

/** The chips once it's live; each reply offers the others. */
const LIVE_CHIPS = [NEEDS_YOU_CHIP, UNOPENED_CHIP, PRODUCTS_CHIP];
const others = (chip: string): Beat => ({
  wait: 400,
  block: { type: "chips", items: LIVE_CHIPS.filter((c) => c !== chip) },
});

/** The run's 7 days, from demo day: Wednesday 14 to Tuesday 20 October. */
const DAYS = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"];

/** The dashboard's chart: orders from win-back quotes, one column per day of the run. */
const ordersByDay = (orders: number[]): DashboardBlock["chart"] => ({
  title: "Orders from win-back quotes, by day",
  yMax: 100,
  yTicks: [0, 25, 50, 75, 100].map((at) => ({ at, label: String(at) })),
  bars: DAYS.map((label, i) => ({
    label,
    value: orders[i] ?? 0,
    display: orders[i] === undefined ? "" : String(orders[i]),
  })),
  height: 220,
});

const DASHBOARD_SOURCES: Source[] = [
  { app: "salesforce", label: "Quote" },
  { app: "salesforce", label: "Order" },
  { app: "salesforce", label: "OrderItem" },
];

/** The full page's closing row: what to do next, each a prompt to this chat. */
const nextActions = (items: Extract<InsightGroup["sections"][number], { type: "next" }>["items"]): InsightGroup => ({
  title: "Next best actions",
  sections: [{ type: "next", items }],
});
const APPROVE_NEXT = {
  icon: "orders",
  title: "Approve 3 waiting quotes",
  body: "$44,365 in quotes over your $15K limit or on credit hold.",
  cta: { label: "See the 3 quotes", prompt: NEEDS_YOU_CHIP },
} as const;

/** What each buyer gets: the quote, then one more product picked for them. */
const SAMPLE_EMAIL: CoworkBlock = {
  type: "email",
  header: "Each buyer's quote email",
  thread: "Sample: Tavistock Schools",
  to: "Grace Okafor, Tavistock Schools",
  subject: "Your AP-7 quote, 5% off for 14 days",
  body: "Hi Grace,\n\nIt's been a couple of months since your last order, so here's a quote for your usual: 32 AP-7 access points, 5% off for the next 14 days. You can order it in one click: ohana.store/q/20417\n\nAlso picked for you: AP-7 licence renewal, 3 years ($180 each). Your current licences end on 30 November, and renewing keeps updates and support running. Add it to the same order in one click.\n\nAaron",
  status: "sample",
  note: "Sample · every buyer's email has its own quote and pick",
};

/** The 2 quotes over $15K, each with a product to add: why (with sources), then Add and send or Send without it. */
const recCard = (
  id: string,
  title: string,
  summary: string,
  why: { text: string; source: Source }[],
  details: { label: string; value: string }[],
  folded: { approved: string; declined: string },
): Beat => ({
  wait: 700,
  block: {
    type: "approval",
    id,
    title,
    summary,
    details,
    approve: "Add and send",
    status: "proposed",
    recommend: {
      header: "Recommended add-on",
      why,
      decline: "Send without it",
      folded,
    },
  },
});
const CORRAN_CARD = recCard(
  "corran",
  "Corran Logistics: add 36 SFP+ optics, then send the quote",
  "The quote is over $15K, so it needs your OK. Corran's SW-24s take 2 optics each, and this order has none.",
  [
    { text: "Every SW-24 order Corran placed came with 2 optics per switch", source: { app: "salesforce", label: "Order history" } },
    { text: "4 in 5 accounts that buy 10+ SW-24s add optics to the same order", source: { app: "salesforce", label: "Bought together" } },
    { text: "In stock in Rotterdam, so it ships with the switches", source: { app: "salesforce", label: "Inventory" } },
  ],
  [
    { label: "Quote", value: "QUO-20391 · 18 × SW-24, 5% off · $19,665" },
    { label: "Adds", value: "36 × SFP+ optics at full price · +$3,420" },
    { label: "New total", value: "$23,085" },
  ],
  { approved: "Corran Logistics: optics added, quote sent · $23,085", declined: "Corran Logistics: quote sent without optics · $19,665" },
);
const MISTRAL_CARD = recCard(
  "mistral",
  "Mistral Hotels: add 4 RT-5 guest routers, then send the quote",
  "The quote is over $15K, so it needs your OK. Mistral's new hotel will need guest Wi-Fi, and their routers are past support.",
  [
    { text: "Their buyer emailed that a new hotel opens on 20 November", source: { app: "gmail", label: "Mistral thread" } },
    { text: "9 in 10 hotel groups with 40+ AP-7s run RT-5 guest routers", source: { app: "salesforce", label: "Bought together" } },
    { text: "Their 4 routers are 6 years old and out of support since June", source: { app: "salesforce", label: "Asset" } },
  ],
  [
    { label: "Quote", value: "QUO-20395 · 40 × AP-7, 5% off · $15,960" },
    { label: "Adds", value: "4 × RT-5 guest router at full price · +$2,560" },
    { label: "New total", value: "$18,520" },
  ],
  { approved: "Mistral Hotels: routers added, quote sent · $18,520", declined: "Mistral Hotels: quote sent without routers · $15,960" },
);

/** Approving a quote over $15K, with or without the add-on: the writes, then the send. */
const approveWrites = (quote: string, total: string, add?: IntegrationStep["writes"]): IntegrationStep => ({
  app: "salesforce",
  action: add ? `Add it to ${quote} and send` : `Approve ${quote} and send`,
  tool: { name: "dispatch_write", target: "merchant-quote-management" },
  result: `${quote} · ${total} · sent`,
  writes: [
    ...(add ?? []),
    { op: "update", object: "Quote", name: quote, fields: `Status Approved → Sent · GrandTotal ${total}` },
    { op: "insert", object: "EmailMessage", name: "Quote email", fields: `To the buyer · ohana.store/q/${quote.slice(4)}` },
  ],
});
const CORRAN_ADD: IntegrationStep["writes"] = [
  { op: "insert", object: "QuoteLineItem", name: "SFP+ optics", fields: "Quantity 36 · UnitPrice $95 · Discount 0%" },
];
const MISTRAL_ADD: IntegrationStep["writes"] = [
  { op: "insert", object: "QuoteLineItem", name: "RT-5 guest router", fields: "Quantity 4 · UnitPrice $640 · Discount 0%" },
];

/** After Corran's card, either way: what was sent, then Mistral's. */
const toMistral = (said: string): Beat[] => [
  { wait: 900, block: { type: "text", content: said } },
  { wait: 700, block: { type: "text", content: "**Next, Mistral Hotels:**" } },
  MISTRAL_CARD,
];
/** After Mistral's, either way: Brockley stays held, then where that leaves the 3. */
const toBrockley = (said: string): Beat[] => [
  { wait: 900, block: { type: "text", content: said } },
  {
    wait: 1200,
    block: {
      type: "text",
      content: "**Brockley Labs I'm holding:** they're on credit hold with 2 invoices 60 days overdue, so I won't send a quote or suggest anything more. I'll send their $8,740 quote once they pay.\n\nThat's the 3: **2 sent**, and Brockley waits on payment.",
    },
  },
  others(NEEDS_YOU_CHIP),
];

const pill = (label: string, tone: Tone) => ({ text: "", pill: { label, tone } });
const ORDERED = pill("Ordered", "success");
const OPENED = pill("Opened", "info");
const SENT = pill("Sent", "neutral");
const WAITING = pill("Waiting on you", "warning");

/** Day 1, as the agent works: quotes sent, opened and ordered, the value won
 *  back (add-ons included), and orders that added the product picked for them. */
type DayOne = { sent: number; opened: number; orders: number; value: string; addons: number; addonValue: string };

/** Day 1's latest quote activity, newest first: the orders, then the rest. */
const DAY_ONE_ORDERS: InsightCell[][] = [
  ["Quayside Medical", "14 × SW-24, raised from 10", ORDERED, "$15,295"],
  ["Tavistock Schools", "32 × AP-7, + licence renewal", ORDERED, "$18,528"],
];
const DAY_ONE_ACTIVITY: InsightCell[][] = [
  ["Elmstead Retail", "24 × AP-7", OPENED, "$9,576"],
  ["Harrow & Vale", "12 × RT-5", OPENED, "$7,296"],
  ["Saltire Coworking", "6 × SW-24", SENT, "$6,555"],
  ["Corran Logistics", "18 × SW-24, over $15K", WAITING, "$19,665"],
  ["Mistral Hotels", "40 × AP-7, over $15K", WAITING, "$15,960"],
  ["Brockley Labs", "8 × SW-24, credit hold", WAITING, "$8,740"],
];

/** Day 1's quotes by product: count and value, before any has had time to convert. */
const PRODUCTS = [
  { label: "AP-7 access point", quotes: 289, value: "$1.31M" },
  { label: "SW-24 switch", quotes: 193, value: "$1.12M" },
  { label: "RT-5 router", quotes: 78, value: "$290K" },
  { label: "CB-48 cable kit", quotes: 51, value: "$120K" },
];

/** The products picked for the quote emails, by how often, and why. */
const PICKS = [
  { label: "AP-7 licence renewal", why: "Their licences end within 60 days", emails: 212 },
  { label: "SFP+ optics", why: "Bought with SW-24s by 4 in 5 accounts", emails: 148 },
  { label: "Ceiling mounts", why: "Bought with AP-7s by drop-ceiling sites", emails: 131 },
  { label: "RT-5 guest router", why: "Routers past support, or a new site", emails: 64 },
  { label: "CB-48 cable kit", why: "Reordered every 8 weeks by accounts like them", emails: 56 },
];

/** The dashboard on day 1: the card's tiles and chart, and the full page behind them. */
const dayOne = ({ sent, opened, orders, value, addons, addonValue }: DayOne): Pick<DashboardBlock, "kpis" | "chart" | "full"> => {
  const pct = (n: number) => (sent ? `${Math.round((n / sent) * 1000) / 10}% of quotes` : "None yet");
  const ordered = orders ? `${orders} so far today` : "None yet";
  const kpis: Kpi[] = [
    { label: "Win-back quotes sent", value: String(sent), detail: sent ? "Of 614 lapsed accounts" : "Sending now" },
    {
      label: "Orders converted from quotes",
      value: String(orders),
      detail: ordered,
      progress: sent ? orders / sent : 0,
    },
    { label: "Won-back order value", value, detail: "At 5% off, add-ons included" },
    {
      label: "Added the product picked for them",
      value: String(addons),
      detail: addons ? `${addonValue} more, from the email` : "Suggested in every email",
    },
  ];
  return {
    kpis,
    chart: ordersByDay([orders]),
    full: {
      title: "Win-back dashboard",
      subtitle: "Day 1 of 7 · Wednesday 14 October · accounts with no order in 30 days, quoted at 5% off",
      groups: [
        {
          title: "Today",
          sections: [
            {
              type: "kpis",
              items: [
                { ...kpis[0], detail: sent ? "Of 614 lapsed accounts · 3 wait on you" : "Sending now" },
                {
                  label: "Quotes opened",
                  value: String(opened),
                  detail: pct(opened),
                  progress: sent ? opened / sent : 0,
                },
                { ...kpis[1], detail: orders ? pct(orders) : "None yet" },
                kpis[2],
              ],
            },
            {
              type: "table",
              title: "Also picked for them, in the quote emails",
              columns: [
                { label: "Product picked" },
                { label: "Why" },
                { label: "Emails", align: "right" },
                { label: "Added", align: "right" },
              ],
              rows: PICKS.map((p, i) => [p.label, p.why, sent ? String(p.emails) : "—", i === 0 ? String(addons) : "0"]),
              meta: "One per email, never discounted and never on the quote, so it needs no OK",
            },
            {
              type: "stacked",
              title: "Where today's quotes are",
              total: sent ? `${sent + 3} quotes` : "614 quotes",
              parts: sent
                ? [
                    { label: "Ordered", value: orders, display: String(orders) },
                    { label: "Opened, no order yet", value: opened - orders, display: String(opened - orders) },
                    { label: "Not opened yet", value: sent - opened, display: String(sent - opened) },
                    { label: "Waiting on you", value: 3, display: "3" },
                  ]
                : [
                    { label: "Sending now", value: 611, display: "611" },
                    { label: "Waiting on you", value: 3, display: "3" },
                  ],
            },
            { type: "columns", ...ordersByDay([orders]) },
          ],
        },
        {
          title: "By product",
          sections: [
            {
              type: "hbars",
              title: "Quotes sent, by most-ordered product",
              max: 300,
              ticks: [0, 100, 200, 300].map((at) => ({ at, label: String(at) })),
              columns: { label: "Product", value: "Quotes", extra: "Quote value" },
              rows: PRODUCTS.map((p) => ({
                label: p.label,
                value: sent ? p.quotes : 0,
                display: sent ? String(p.quotes) : "0",
                extra: sent ? p.value : "—",
              })),
            },
          ],
        },
        {
          title: "Latest activity",
          sections: [
            {
              type: "table",
              columns: [
                { label: "Account" },
                { label: "Quote" },
                { label: "Status" },
                { label: "Value", align: "right" },
              ],
              rows: [
                ...DAY_ONE_ORDERS.slice(2 - orders),
                ...(sent ? DAY_ONE_ACTIVITY.slice(opened ? 0 : 2) : DAY_ONE_ACTIVITY.slice(3)),
              ],
              meta: sent ? `Showing the latest of ${sent + 3} quotes` : "611 quotes sending now",
            },
          ],
        },
        nextActions([
          APPROVE_NEXT,
          {
            icon: "accounts",
            title: "Nudge the unopened",
            body: "Most of today's quotes haven't been opened yet.",
            cta: { label: "See who hasn't opened", prompt: UNOPENED_CHIP },
          },
          {
            icon: "growth",
            title: "Back your best converter",
            body: "AP-7 access points lead on quotes and opens so far.",
            cta: { label: "See winning products", prompt: PRODUCTS_CHIP },
          },
        ]),
      ],
    },
  };
};

/** The week at 10% off, by time since the last order: accounts quoted, and
 *  expected conversion at 5% and at 10% (from last quarter's win-back quotes). */
const RECENCY_AT_10 = [
  { label: "31 to 45 days ago", accounts: 250, at5: 45, at10: 52, orders: 130 },
  { label: "46 to 60 days ago", accounts: 200, at5: 33, at10: 41, orders: 82 },
  { label: "61 to 90 days ago", accounts: 164, at5: 14, at10: 24, orders: 39 },
];
/** Orders expected each day after today, at 10% off and at 5%. */
const WEEK_AT_10 = [70, 58, 44, 34, 25, 18];
const WEEK_AT_5 = [56, 46, 35, 27, 20, 15];

/** The week by day: today's orders so far, then the rest hatched as expected at 10% off. */
const THIS_WEEK: DashboardBlock["chart"] = {
  title: "Orders from win-back quotes, by day · 14 to 20 October",
  yMax: 100,
  yTicks: [0, 25, 50, 75, 100].map((at) => ({ at, label: String(at) })),
  bars: [
    { label: DAYS[0], value: 2, display: "2", hover: ["Today so far, at 5% off", "10% quotes go out tomorrow, 7 AM"] },
    ...WEEK_AT_10.map((n, i) => ({
      label: DAYS[i + 1],
      value: 0,
      projected: n,
      display: `~${n}`,
      hover: [`~${n} orders expected at 10% off`, `~${WEEK_AT_5[i]} at 5%`],
    })),
  ],
  projectedLabel: "Expected at 10% off",
  height: 220,
};

const PROJECTION_KPIS: Kpi[] = [
  { label: "Orders expected this week", value: "~251", detail: "~50 more than at 5% off" },
  { label: "Won-back value expected", value: "~$1.07M", detail: "Incl. ~$105K from add-ons" },
  { label: "Quotes moving to 10% off", value: "609", detail: "Every quote not yet ordered" },
];

/** Add-ons expected this week: orders that add the product picked for them (never discounted). */
const ADDONS_AT_10 = [
  { label: "AP-7 licence renewal", orders: 24, value: "~$43K", n: 43 },
  { label: "RT-5 guest router", orders: 9, value: "~$28K", n: 28 },
  { label: "SFP+ optics", orders: 14, value: "~$22K", n: 22 },
  { label: "Ceiling mounts", orders: 8, value: "~$12K", n: 12 },
];

/** The dashboard after the discount change: today so far, the rest of the week projected at 10% off. */
const AT_TEN: Pick<DashboardBlock, "kpis" | "chart" | "full"> = {
  kpis: PROJECTION_KPIS,
  chart: THIS_WEEK,
  full: {
    title: "Win-back dashboard",
    subtitle: "This week projected · 10% off from Thursday 15 October · for every quote not yet ordered",
    groups: [
      {
        title: "Projection",
        sections: [
          {
            type: "kpis",
            items: [
              { label: "Quotes moving to 10% off", value: "609", detail: "Plus every account that lapses this week" },
              { label: "Orders expected", value: "~251", detail: "41% of 614 quotes, up from 33%", progress: 0.41 },
              { label: "Order value expected", value: "~$1.07M", detail: "~$966K from quotes + ~$105K from add-ons" },
              { label: "Extra discount", value: "~$54K", detail: "3.5× back in orders" },
            ],
          },
          {
            type: "columns",
            summary: "Today's orders so far, then the rest of the week hatched: what 10% off is expected to bring.",
            ...THIS_WEEK,
          },
        ],
      },
      {
        title: "Where the lift comes from",
        sections: [
          {
            type: "hbars",
            title: "Expected conversion at 10% off, by time since the last order",
            summary: "The biggest lift is past 60 days, where 5% barely moves them.",
            max: 60,
            ticks: [0, 20, 40, 60].map((at) => ({ at, label: `${at}%` })),
            columns: { label: "Last ordered", value: "Expected", extra: "Orders" },
            rows: RECENCY_AT_10.map((r) => ({
              label: r.label,
              detail: `~${r.orders} of ${r.accounts} accounts`,
              value: r.at10,
              display: `${r.at10}%`,
              extra: `~${r.orders}`,
            })),
          },
          {
            type: "hbars",
            title: "Expected from the products picked for them",
            summary: "About 1 in 5 orders adds the pick, at full price: ~$105K on top of the quotes.",
            max: 50,
            ticks: [0, 25, 50].map((at) => ({ at, label: `$${at}K` })),
            columns: { label: "Product picked", value: "Value", extra: "Orders" },
            rows: ADDONS_AT_10.map((a) => ({
              label: a.label,
              value: a.n,
              display: a.value,
              extra: `~${a.orders}`,
            })),
          },
          {
            type: "table",
            title: "5% against 10%",
            columns: [
              { label: "Last ordered" },
              { label: "Accounts", align: "right" },
              { label: "Expected at 5%", align: "right" },
              { label: "Expected at 10%", align: "right" },
            ],
            rows: RECENCY_AT_10.map((r) => [r.label, String(r.accounts), `${r.at5}%`, `${r.at10}%`]),
            meta: "Expected from last quarter's win-back quotes, by recency and product",
          },
        ],
      },
      {
        title: "Guardrails",
        sections: [
          {
            type: "table",
            title: "Price at 10% off against your floor",
            columns: [
              { label: "Product" },
              { label: "List", align: "right" },
              { label: "At 10% off", align: "right" },
              { label: "Floor", align: "right" },
              { label: "Status" },
            ],
            rows: [
              ["AP-7 access point", "$420", "$378", "$340", pill("Above floor", "success")],
              ["SW-24 switch", "$1,150", "$1,035", "$940", pill("Above floor", "success")],
              ["RT-5 router", "$640", "$576", "$520", pill("Above floor", "success")],
              ["CB-48 cable kit", "$95", "$85.50", "$78", pill("Above floor", "success")],
            ],
            meta: "All four stay above floor, so the quotes still approve on their own",
          },
          {
            type: "facts",
            items: [
              { label: "Starts", value: "Thursday 15 October, the 7 AM run" },
              { label: "Updates", value: "Every open 5% quote, and quotes for newly lapsed accounts" },
              { label: "Approvals", value: "Under $15K send on their own; over $15K wait on you" },
              { label: "Runs until", value: "Tuesday 20 October" },
            ],
          },
        ],
      },
      nextActions([
        {
          icon: "growth",
          title: "Keep it going past this week",
          body: "Run 30 more days on the new 10% rules.",
          cta: { label: "Extend for 30 days", prompt: EXTEND_CHIP },
        },
        {
          ...APPROVE_NEXT,
          title: "Approve the big ones",
          body: "Quotes over $15K still wait on you, at 10% too.",
        },
        {
          icon: "accounts",
          title: "Watch the 10% quotes land",
          body: "Every updated quote, live in a Salesforce list view.",
          cta: { label: "Open in Salesforce", href: "#" },
        },
      ]),
    ],
  },
};

export const growth: CoworkScript = {
  steps: [
    "Understand the request",
    "Connect Salesforce and tools",
    "Find lapsed accounts",
    "Set up the agent",
    "Go live",
  ],
  opening: [
    { wait: 500, thinking: "Reading your request" },
    {
      wait: 1600,
      agentIcon: true,
      progress: 1,
      block: {
        type: "text",
        content:
          "This needs to run every day for a week, so I'll set up an agent. Each morning it'll find the accounts that haven't ordered in 30 days, send each one an approved quote, and track which quotes turn into orders.",
      },
    },
    { wait: 900, thinking: "Loading the agents skill" },
    { wait: 1200, skill: "agents", block: { type: "skill", name: "/agents" } },
    { wait: 600, thinking: "Connecting to Salesforce Headless 360" },
    {
      wait: 1000,
      connector: "salesforce",
      block: {
        type: "integrations",
        shown: 0,
        steps: [
          {
            app: "salesforce",
            action: "Find the Commerce tools it needs",
            tool: { name: "discover", target: "commerce SORs" },
            result: "6 SORs, 41 tools",
          },
          {
            app: "salesforce",
            action: "Find accounts with no order in 30 days",
            tool: { name: "dispatch_readonly", target: "merchant-order-management" },
            result: "614 accounts · last order 31 to 90 days ago",
          },
          {
            app: "salesforce",
            action: "Read each account's order history",
            tool: { name: "dispatch_readonly", target: "merchant-order-management" },
            result: "18,240 order lines · top product and average quantity",
          },
          {
            app: "salesforce",
            action: "Pick one more product each account is likely to add",
            tool: { name: "dispatch_readonly", target: "merchant-catalog-management" },
            result: "614 picks · renewals, bought-together, end of support",
          },
          {
            app: "salesforce",
            action: "Find the buyer on each account",
            tool: { name: "dispatch_readonly", target: "buyer-profile-management" },
            result: "614 buyers · 1 account on credit hold",
          },
          {
            app: "salesforce",
            action: "Price each product from the account's price book",
            tool: { name: "dispatch_readonly", target: "merchant-catalog-management" },
            result: "4 products · 3 price books",
          },
          {
            app: "salesforce",
            action: "Read the discount and approval policy",
            tool: { name: "get_sor_detail", target: "b2b-merchant-quote-management" },
            result: "5% auto-approves on quotes under $15K",
          },
          { app: "slack", action: "Confirm it can reach you on Slack", result: "DM to @aaron" },
          { app: "gmail", action: "Verify Gmail access for buyer follow-ups", result: "Drafts and sends from you" },
        ],
      },
    },
    grow,
    grow,
    grow,
    grow,
    grow,
    grow,
    { ...grow, connector: "slack" },
    grow,
    { ...grow, connector: "gmail", progress: 2 },
    { wait: 600, thinking: "Finding every account that hasn't ordered in 30 days" },
    {
      wait: 2400,
      file: "lapsed-accounts.xlsx",
      block: {
        type: "stats",
        pairs: true,
        items: [
          { label: "Lapsed accounts", value: "614", detail: "No order in 31 to 90 days" },
          { label: "Order lines read", value: "18,240", detail: "For each one's top product" },
          { label: "Products picked for them", value: "614", detail: "One each, in the quote email" },
          { label: "Quotes, ready to send", value: "$2.88M", detail: "611 approve on their own" },
        ],
        note: "Built in **41 seconds**. By hand that's a week of pulling order history and pricing quotes one at a time. From now on it runs every morning at 7 AM, and picks up each account the day it reaches 30 days.",
      },
    },
    {
      wait: 1200,
      progress: 3,
      block: {
        type: "text",
        content:
          "**614 accounts** haven't ordered in 30 days. Their quotes come to **$2.88M** at 5% off, and each gets one more product picked for it. The biggest first:",
      },
    },
    {
      wait: 500,
      sources: SWEEP_SOURCES,
      block: {
        type: "table",
        title: "Win-back quotes, ready to send",
        columns: [
          { label: "Account", kind: "lead" },
          { label: "Last order" },
          { label: "Most-ordered" },
          { label: "Avg order" },
          { label: "Also picked" },
          { label: "Next step", kind: "status" },
          { label: "Quote, 5% off", kind: "amount" },
        ],
        inline: [0, 2, 4, 6],
        preview: 5,
        rows: [
          ["Corran Logistics", "47 days ago", "SW-24 switch", "18 units", "SFP+ optics", "Needs you", "$19,665"],
          ["Mistral Hotels", "38 days ago", "AP-7 access point", "40 units", "RT-5 guest router", "Needs you", "$15,960"],
          ["Tavistock Schools", "62 days ago", "AP-7 access point", "32 units", "Licence renewal", "Agent sends", "$12,768"],
          ["Quayside Medical", "33 days ago", "SW-24 switch", "10 units", "SFP+ optics", "Agent sends", "$10,925"],
          ["Elmstead Retail", "41 days ago", "AP-7 access point", "24 units", "Ceiling mounts", "Agent sends", "$9,576"],
          ["Brockley Labs", "55 days ago", "SW-24 switch", "8 units", "None, credit hold", "Needs you", "$8,740"],
          ["Harrow & Vale", "36 days ago", "RT-5 router", "12 units", "CB-48 cable kit", "Agent sends", "$7,296"],
          ["Saltire Coworking", "31 days ago", "SW-24 switch", "6 units", "SFP+ optics", "Agent sends", "$6,555"],
          ["Penrose Clinics", "44 days ago", "AP-7 access point", "16 units", "Licence renewal", "Agent sends", "$6,384"],
          ["Dunmore Foods", "70 days ago", "CB-48 cable kit", "30 units", "RT-5 guest router", "Agent sends", "$5,130"],
          ["Kilbride Estates", "39 days ago", "AP-7 access point", "12 units", "Ceiling mounts", "Agent sends", "$4,788"],
          ["Ashgrove Dental", "52 days ago", "RT-5 router", "6 units", "Licence renewal", "Agent sends", "$3,648"],
        ],
        footer: "Top 12 of 614 accounts · $2.88M in quotes",
        sources: SWEEP_SOURCES,
      },
    },
    {
      wait: 900,
      block: {
        type: "text",
        content:
          "**611 quotes I can send within policy:** 5% off and under $15K, so they approve on their own. Each email also suggests **one more product they're likely to add**, from what they own and what accounts like them buy. It's in the email, not on the quote, and never discounted, so it needs no OK. Here's what Tavistock's buyer gets:",
      },
    },
    { wait: 900, block: SAMPLE_EMAIL },
    {
      wait: 1000,
      block: {
        type: "text",
        content: "**3 quotes I need your input on:** two over $15K and one account on credit hold.",
      },
    },
    {
      wait: 1200,
      block: {
        type: "text",
        content: "Here's the agent. Start it and it'll send today's quotes now, then run every morning for 7 days.",
      },
    },
    {
      wait: 600,
      progress: 4,
      block: {
        type: "agent",
        status: "proposed",
        name: "Growth Scout",
        summary:
          "Wins back accounts that haven't ordered in 30 days with an approved quote, every day for the next 7 days.",
        trigger: "Checks daily at 7 AM for accounts with no order in 30 days",
        runsFor: "Runs for 7 days",
        things: [
          "Find every account that hasn't ordered in 30 days, each morning",
          "Send each an approved quote: their most-ordered product, at their average quantity, 5% off",
          "Suggest one more product in each email: what they're likely to add, at full price",
          "Track quotes sent against orders on a dashboard, and send you a summary on day 7",
        ],
        asksFirst: ["Quotes over $15K", "Accounts on credit hold", "Any discount above 5%"],
        sources: [
          { app: "salesforce", label: "Headless 360" },
          { app: "slack", label: "Slack" },
          { app: "gmail", label: "Gmail" },
        ],
        facts: [
          { label: "Type", value: "Claude agent · scheduled, daily" },
          {
            label: "What it does",
            value:
              "Sends lapsed accounts an approved quote for their most-ordered product, and tracks which turn into orders",
          },
          { label: "Checks", value: "Every day at 7 AM, for accounts with no order in 30 days" },
          { label: "Runs for", value: "7 days, until 20 Oct" },
          { label: "Sends on its own", value: "Quotes under $15K at 5% off, at the account's average quantity" },
          { label: "Recommends", value: "One product per email, from renewals, bought-together and end of support" },
          { label: "Asks you first", value: "Quotes over $15K, accounts on credit hold, any discount above 5%" },
          { label: "Reads from", value: "Salesforce Headless 360: Order, OrderItem, Pricebook, Quote" },
          { label: "Reaches you on", value: "Slack, Gmail" },
          { label: "Runs in", value: "The cloud, even when your Mac is off" },
        ],
      },
    },
  ],
  onStart: [
    { wait: 400, thinking: "Starting Growth Scout" },
    { wait: 900, thinking: "Handing off to Growth Scout" },
    {
      wait: 1600,
      progress: 5,
      block: {
        type: "text",
        content:
          "**Growth Scout is live.** It's sending the 611 quotes it can approve within policy, each with a product picked for them, and the 3 that need you are on Slack with my recommendation. Your dashboard fills in as quotes turn into orders. You'll find it under **Agents**.",
      },
    },
    {
      wait: 600,
      block: {
        type: "dashboard",
        title: "Win-back dashboard",
        ...dayOne({ sent: 0, opened: 0, orders: 0, value: "$0", addons: 0, addonValue: "" }),
        footer: "Day 1 of 7 · updates as orders come in",
        sources: DASHBOARD_SOURCES,
      },
    },
    { wait: 500, block: { type: "chips", items: LIVE_CHIPS } },
  ],
  hints: [
    "Ask Growth Scout which accounts ordered today",
    'Change a rule, like "skip accounts on credit hold"',
    'Tell it a new discount, like "change the discount to 10%"',
  ],
  // 5s apart (5s, 10s, 15s after Start), as Delivery Watch's.
  watch: [
    {
      wait: 5000,
      dashboard: dayOne({ sent: 611, opened: 38, orders: 0, value: "$0", addons: 0, addonValue: "" }),
      block: {
        type: "action",
        agent: "Growth Scout",
        title: "Sent 611 win-back quotes, approved within policy",
        time: "Just now",
        details: [
          { label: "What it saw", value: "611 accounts with no order in 30 days, every quote under $15K" },
          {
            label: "What it did",
            value: "Created a quote for each: their most-ordered product, at their average quantity, 5% off",
          },
          { label: "Approval", value: "Auto-approved by your discount policy: 5%, under $15K" },
          { label: "Buyers", value: "Each buyer got the quote by email, with a link to order on your storefront" },
          { label: "Also picked", value: "One more product in each email, at full price: 212 licence renewals, 148 SFP+ optics…" },
          { label: "Quote value", value: "$2.84M sent" },
        ],
      },
    },
    {
      wait: 5000,
      dashboard: dayOne({ sent: 611, opened: 96, orders: 1, value: "$18.5K", addons: 1, addonValue: "$5.8K" }),
      block: {
        type: "action",
        agent: "Growth Scout",
        title: "Tavistock Schools ordered, and added the licence renewal",
        time: "Just now",
        footer: "Won back from a quote",
        details: [
          { label: "Account", value: "Tavistock Schools · last ordered 62 days ago" },
          { label: "Quote", value: "QUO-20417: 32 × AP-7 at 5% off" },
          { label: "What happened", value: "The buyer accepted it 6 minutes after it landed, and added the renewal picked for them" },
          { label: "Added", value: "32 × AP-7 licence renewal, 3 years · $5,760 at full price" },
          { label: "Order", value: "ORD-20931, ships from Leeds tomorrow" },
          { label: "Order value", value: "$18,528, won back ($5,760 from the add-on)" },
        ],
      },
    },
    {
      wait: 5000,
      dashboard: dayOne({ sent: 611, opened: 142, orders: 2, value: "$33.8K", addons: 1, addonValue: "$5.8K" }),
      block: {
        type: "action",
        agent: "Growth Scout",
        title: "Quayside Medical ordered 14 × SW-24, more than quoted",
        time: "Just now",
        footer: "Won back from a quote",
        details: [
          { label: "Account", value: "Quayside Medical · last ordered 33 days ago" },
          { label: "Quote", value: "QUO-20388: 10 × SW-24 at 5% off" },
          { label: "What happened", value: "The buyer raised it to 14 before checking out, and the 5% still applied" },
          { label: "Order", value: "ORD-20937, ships from Rotterdam on Thursday" },
          { label: "Order value", value: "$15,295, 40% more than quoted" },
        ],
      },
    },
  ],
  approvals: {
    corran: {
      approve: [
        ...writing([approveWrites("QUO-20391", "$23,085", CORRAN_ADD)], ["Adding the optics and sending"]),
        ...toMistral("**Added and sent:** Corran's quote is now **$23,085**, with the optics at full price."),
      ],
      decline: [
        ...writing([approveWrites("QUO-20391", "$19,665")], ["Sending Corran's quote"]),
        ...toMistral("**Sent as it was:** Corran's **$19,665** quote, no optics."),
      ],
    },
    mistral: {
      approve: [
        ...writing([approveWrites("QUO-20395", "$18,520", MISTRAL_ADD)], ["Adding the routers and sending"]),
        ...toBrockley("**Added and sent:** Mistral's quote is now **$18,520**, routers included."),
      ],
      decline: [
        ...writing([approveWrites("QUO-20395", "$15,960")], ["Sending Mistral's quote"]),
        ...toBrockley("**Sent as it was:** Mistral's **$15,960** quote, no routers."),
      ],
    },
  },
  replies: {
    [NEEDS_YOU_CHIP]: [
      { wait: 400, thinking: "Pulling the evidence for each" },
      {
        wait: 1600,
        block: {
          type: "text",
          content:
            "**3 quotes need you.** Two are over $15K, and for each I found one more product they're likely to need. Add it and I'll send the quote with it, or send it as it is. **First, Corran Logistics:**",
        },
      },
      CORRAN_CARD,
    ],
    [UNOPENED_CHIP]: [
      { wait: 400, thinking: "Checking who's opened their quote" },
      {
        wait: 1600,
        block: {
          type: "table",
          title: "Quotes not opened yet",
          columns: [
            { label: "Account", kind: "lead" },
            { label: "Buyer", kind: "name" },
            { label: "Quote for" },
            { label: "Sent" },
            { label: "Quote", kind: "amount" },
          ],
          inline: [0, 1, 2, 4],
          preview: 5,
          rows: [
            ["Penrose Clinics", "Dr. Lena Ortiz", "16 × AP-7", "7:02 AM", "$6,384"],
            ["Dunmore Foods", "Callum Reid", "30 × CB-48", "7:02 AM", "$5,130"],
            ["Kilbride Estates", "Hannah Moss", "12 × AP-7", "7:02 AM", "$4,788"],
            ["Castlegate Gym", "Tom Ashby", "4 × SW-24", "7:03 AM", "$4,370"],
            ["Ashgrove Dental", "Ravi Menon", "6 × RT-5", "7:03 AM", "$3,648"],
            ["Wexford Print", "Siobhan Kerr", "8 × AP-7", "7:03 AM", "$3,192"],
          ],
          footer: "469 of 611 not opened yet · $2.21M",
          sources: [
            { app: "salesforce", label: "Quote" },
            { app: "salesforce", label: "Contact" },
          ],
        },
      },
      {
        wait: 800,
        block: {
          type: "text",
          content:
            "Most buyers open a quote within 48 hours, so it's early. **Tomorrow at 7 AM** I'll send a reminder from your Gmail to anyone who still hasn't opened theirs.",
        },
      },
      others(UNOPENED_CHIP),
    ],
    [PRODUCTS_CHIP]: [
      { wait: 400, thinking: "Comparing quotes by product" },
      {
        wait: 1600,
        block: {
          type: "table",
          title: "Win-back quotes by product, day 1",
          columns: [
            { label: "Product", kind: "lead" },
            { label: "Quotes sent" },
            { label: "Opened" },
            { label: "Orders" },
            { label: "Quote value", kind: "amount" },
          ],
          rows: [
            ["AP-7 access point", "289", "71", "1", "$1.31M"],
            ["SW-24 switch", "193", "46", "1", "$1.12M"],
            ["RT-5 router", "78", "16", "0", "$290K"],
            ["CB-48 cable kit", "51", "9", "0", "$120K"],
          ],
          footer: "611 quotes · $2.84M",
          sources: [
            { app: "salesforce", label: "Quote" },
            { app: "salesforce", label: "Product" },
          ],
        },
      },
      {
        wait: 800,
        block: {
          type: "text",
          content:
            "**AP-7 access points** lead so far: the most quotes, the most opens and Tavistock's order. It's only day 1, so the win-back dashboard will say more by Friday.",
        },
      },
      others(PRODUCTS_CHIP),
    ],
    [EXTEND_CHIP]: [
      { wait: 400, thinking: "Extending Growth Scout" },
      {
        wait: 1400,
        block: {
          type: "text",
          content:
            "**Growth Scout now runs for 30 more days**, until 19 November, on the same rules. Any account still lapsed gets a reminder on its open quote first, and a fresh one when it expires.",
        },
      },
    ],
    [DISCOUNT]: [
      { wait: 400, thinking: "Checking 10% against your floor prices" },
      {
        wait: 1600,
        block: {
          type: "text",
          content:
            "**Done: 10% off from tomorrow's 7 AM run.** Every quote not yet ordered gets an updated one at 10%, and newly lapsed accounts start at 10%. It stays above your floor price on all four products, so the quotes still approve on their own.",
        },
      },
      { wait: 600, thinking: "Projecting the week at 10% off" },
      {
        wait: 1600,
        block: {
          type: "dashboard",
          title: "Win-back dashboard",
          ...AT_TEN,
          footer: "Projected at 10% off · starts tomorrow, 7 AM",
          sources: DASHBOARD_SOURCES,
        },
      },
      {
        wait: 900,
        block: {
          type: "text",
          content:
            "**About 50 more orders this week, ~$192K**, on ~$54K of extra discount, plus **~$105K from the products I picked for them**: **~251 orders, ~$1.07M** in all. The biggest lift is from accounts past 60 days. I've added the projection to your win-back dashboard: the hatched bars are what's expected.",
        },
      },
      { wait: 400, block: { type: "chips", items: [NEEDS_YOU_CHIP, EXTEND_CHIP] } },
    ],
    [STOP_CHIP]: [
      { wait: 400, thinking: "Stopping Growth Scout" },
      {
        wait: 1200,
        stop: true,
        block: {
          type: "text",
          content:
            "**Growth Scout is stopped.** Its orders stand, and the open quotes stay valid for 14 days. Your dashboard keeps counting any that turn into orders.",
        },
      },
    ],
  },
  intents: [
    { match: /discount|\d+\s*(%|percent)/i, reply: DISCOUNT },
    { match: /\bstop\b/i, reply: STOP_CHIP },
  ],
  dictations: [DISCOUNT_ASK],
};
