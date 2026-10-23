import type { InsightCell, Kpi, Tone } from "../../../../chat/types";
import type { Beat, CoworkScript, DashboardBlock, Source } from "../types";

/**
 * Delivery Watch — Agent 1 (decisions 12, 20, 21, 36, 41, 46, 50): commerce
 * outcomes, from order to delivery. It watches open orders and carts, not accounts.
 *
 * Aaron's spoken prompt asks for something that has to keep running, so
 * Claude says it'll set up an agent (the sidenav row gets its agent icon right
 * then) and builds it with `/agents`, the skill the Agents page points to.
 * The integrations timeline shows Salesforce first, each step with the
 * Headless 360 MCP call behind it, then the connectors. The live first sweep
 * runs once: the scale numbers (the wow), then every order and cart at risk,
 * strategic accounts on top. The agent card says what it'll do, what it asks first, and
 * where its data comes from. Once live, chips ask for a report, what needs
 * Aaron, which warehouse is behind and what could slip, and the agent
 * posts its own fixes as action cards (`watch`), each with a Slack notification from Salesforce.
 * The report is a Salesforce dashboard (decision 52): what it saved, on-time
 * delivery and at-risk orders coming down, with a full page behind it, pinned
 * in the right-hand panel like Growth Scout's.
 */

const SWEEP_SOURCES: Source[] = [
  { app: "salesforce", label: "Order" },
  { app: "salesforce", label: "FulfillmentOrder" },
  { app: "salesforce", label: "ProductItem" },
  { app: "salesforce", label: "WebCart" },
];

/** How long each integrations step works before its result lands. */
const STEP_MS = 1500;
const grow: Beat = { wait: STEP_MS, grow: true };

export const REPORT_CHIP = "Give me a Delivery Watch report";
export const NEEDS_YOU_CHIP = "Show me tasks that need my input";
export const WAREHOUSE_CHIP = "Which warehouse is slowing orders down?";
export const SLIP_CHIP = "Which orders could slip this week?";

/** The chips once it's live; each reply offers the others. */
const LIVE_CHIPS = [REPORT_CHIP, NEEDS_YOU_CHIP, WAREHOUSE_CHIP, SLIP_CHIP];
const others = (chip: string): Beat => ({
  wait: 400,
  block: { type: "chips", items: LIVE_CHIPS.filter((c) => c !== chip) },
});

const pill = (label: string, tone: Tone) => ({ text: "", pill: { label, tone } });
const FIXED = pill("Fixed", "success");
const AWAITING = pill("Awaiting reply", "neutral");
const NEEDS_YOU = pill("Needs you", "warning");

const REPORT_KPIS: Kpi[] = [
  { label: "Order value saved", value: "$160K", detail: "9 actions · 0 failed" },
  { label: "On-time delivery", value: "98%", detail: "Up from 91% before Delivery Watch", progress: 0.98 },
  { label: "At risk now", value: "4", detail: "Down from 12 · 3 wait on you" },
];

/** Orders and carts at risk through the day, from the first sweep to now. */
const AT_RISK: DashboardBlock["chart"] = {
  title: "Orders and carts at risk, since it went live",
  yMax: 15,
  yTicks: [0, 5, 10, 15].map((at) => ({ at, label: String(at) })),
  bars: [
    { label: "7 AM", value: 12, display: "12", tone: "danger", hover: ["First sweep", "$258,700 at risk"] },
    { label: "9 AM", value: 9, display: "9", hover: ["Brandt Bau split-shipped", "2 carts reserved"] },
    { label: "11 AM", value: 7, display: "7", hover: ["Lumen's box reshipped", "Pell & Sons allocated"] },
    { label: "1 PM", value: 6, display: "6", hover: ["Ostrava moved to Leeds"] },
    { label: "3 PM", value: 5, display: "5", hover: ["Fenwick's cart checked out"] },
    { label: "Now", value: 4, display: "4", hover: ["3 wait on you", "1 waiting on the buyer"] },
  ],
  height: 220,
};

/** Every action it took, biggest first. */
const ACTIONS: InsightCell[][] = [
  ["ORD-10482 · Brandt Bau", "Split-shipped 24 × AP-7 from Leeds", "Arrives Thursday, on time", FIXED, "$48,200"],
  ["CART-3324 · Kessler Gruppe", "Reserved 22 × SW-24, backordered 38", "Cart checked out", FIXED, "$26,400"],
  ["CART-3297 · Nordhavn Fit-Out", "Reserved 9 × SW-24", "Cart checked out", FIXED, "$22,750"],
  ["ORD-10467 · Lumen Offices", "Reshipped the lost box", "Tracking sent to buyer", FIXED, "$18,900"],
  ["ORD-10503 · Pell & Sons", "Allocated stock from Leeds", "Shipped today", FIXED, "$14,200"],
  ["ORD-10476 · Ostrava Data", "Moved 18 × AP-7 from Leeds", "Ships before go-live", FIXED, "$12,850"],
  ["CART-3302 · Fenwick Retail", "Emailed the buyer their saved cart", "Cart checked out", FIXED, "$9,600"],
  ["ORD-10519 · Brightwater Clinics", "Corrected the address from the account", "Carrier accepted", FIXED, "$7,450"],
  ["ORD-10511 · Marlow & Finch", "Offered to ship the 4 ready lines now", "Buyer hasn't replied", AWAITING, "—"],
];

/** The report: the card's tiles and chart, and the full page behind them. */
const REPORT: DashboardBlock = {
  type: "dashboard",
  title: "Delivery Watch dashboard",
  kpis: REPORT_KPIS,
  chart: AT_RISK,
  footer: "Day 1 of 60 · so far today",
  sources: [
    { app: "salesforce", label: "FulfillmentOrder" },
    { app: "salesforce", label: "ProductItem" },
    { app: "salesforce", label: "WebCart" },
    { app: "gmail", label: "Sent mail" },
  ],
  full: {
    title: "Delivery Watch dashboard",
    subtitle: "Day 1 of 60 · Wednesday 14 October · 38 open orders and 21 carts, across 5 warehouses",
    groups: [
      {
        title: "Results",
        sections: [
          {
            type: "kpis",
            items: [
              REPORT_KPIS[0],
              REPORT_KPIS[1],
              { label: "Orders back on time", value: "5", detail: "$101,600 of orders" },
              { label: "Carts checked out", value: "3", detail: "$58,750 of carts" },
            ],
          },
          {
            type: "stacked",
            title: "Where the 12 at-risk orders and carts are now",
            total: "12 at risk this morning",
            parts: [
              { label: "Fixed", value: 8, display: "8", detail: "$160,350" },
              { label: "Waiting on the buyer", value: 1, display: "1", detail: "$29,800" },
              { label: "Waiting on you", value: 3, display: "3", detail: "$68,550" },
            ],
          },
          { type: "columns", summary: "From 12 at risk to 4 in a day, without anyone asking.", ...AT_RISK },
        ],
      },
      {
        title: "What it fixed",
        sections: [
          {
            type: "hbars",
            title: "Value saved, by kind of fix",
            max: 80,
            ticks: [0, 20, 40, 60, 80].map((at) => ({ at, label: `$${at}K` })),
            columns: { label: "Fix", value: "Value saved", extra: "Actions" },
            rows: [
              {
                label: "Moved stock",
                detail: "Kessler, Nordhavn, Pell, Ostrava",
                value: 76.2,
                display: "$76,200",
                extra: "4",
              },
              { label: "Split-shipped", detail: "Brandt Bau", value: 48.2, display: "$48,200", extra: "1" },
              { label: "Reshipped a lost box", detail: "Lumen Offices", value: 18.9, display: "$18,900", extra: "1" },
              { label: "Emailed a saved cart", detail: "Fenwick Retail", value: 9.6, display: "$9,600", extra: "1" },
              {
                label: "Fixed an address",
                detail: "Brightwater Clinics",
                value: 7.45,
                display: "$7,450",
                extra: "1",
              },
            ],
          },
          {
            type: "table",
            title: "By warehouse",
            columns: [
              { label: "Warehouse" },
              { label: "At risk", align: "right" },
              { label: "Fixed", align: "right" },
              { label: "Still open", align: "right" },
              { label: "Value saved", align: "right" },
            ],
            rows: [
              ["Leeds", "7", "4", "3", "$72,950"],
              ["Rotterdam", "5", "4", "1", "$87,400"],
            ],
            meta: "Rotterdam's late AP-7 container drove most of the risk; Leeds covered it. Lyon, Milan and Dublin: nothing at risk",
          },
        ],
      },
      {
        title: "Actions",
        sections: [
          {
            type: "table",
            columns: [
              { label: "Order or cart" },
              { label: "What it did" },
              { label: "Result" },
              { label: "Status" },
              { label: "Value saved", align: "right" },
            ],
            rows: ACTIONS,
            meta: "9 actions · $160,350 of orders saved",
          },
        ],
      },
      {
        title: "Waiting on you",
        sections: [
          {
            type: "table",
            columns: [
              { label: "Order or cart" },
              { label: "The ask" },
              { label: "My recommendation" },
              { label: "Status" },
              { label: "Value", align: "right" },
            ],
            rows: [
              [
                "CART-3318 · Halden & Rook",
                "8% off a 120 × AP-7 cart",
                "Offer 5% at this volume",
                NEEDS_YOU,
                "$31,500",
              ],
              [
                "CART-3331 · Arden Build Co.",
                "Match a competitor 12% under",
                "Match on SW-24 only, this week",
                NEEDS_YOU,
                "$21,300",
              ],
              [
                "ORD-10495 · Corvid Interiors",
                "Release a credit hold",
                "Release it: 6 years paying on time",
                NEEDS_YOU,
                "$15,750",
              ],
            ],
            meta: "1 order · 2 carts · $68,550 at risk",
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
                icon: "orders",
                title: "Decide on 3 asks",
                body: "Halden & Rook, Arden and Corvid: $68,550 waiting on you.",
                cta: { label: "See my recommendations", prompt: NEEDS_YOU_CHIP },
              },
              {
                icon: "stock",
                title: "Unblock Rotterdam",
                body: "Its late AP-7 container drove most of today's risk.",
                cta: { label: "Compare warehouses", prompt: WAREHOUSE_CHIP },
              },
              {
                icon: "growth",
                title: "Get ahead of this week",
                body: "4 orders due this week could slip, $74,840.",
                cta: { label: "See what could slip", prompt: SLIP_CHIP },
              },
            ],
          },
        ],
      },
    ],
  },
};

export const delivery: CoworkScript = {
  steps: ["Understand the request", "Connect Salesforce and tools", "Run a first sweep", "Set up the agent", "Go live"],
  opening: [
    { wait: 500, thinking: "Reading your request" },
    {
      wait: 1600,
      agentIcon: true,
      progress: 1,
      block: {
        type: "text",
        content:
          "This needs to keep running for the next 60 days, so I'll set up an agent. It'll watch every open order and cart, put your strategic accounts first, and wake whenever an order, a shipment or a cart changes.",
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
            action: "Pull open orders and active carts",
            tool: { name: "dispatch_readonly", target: "merchant-order-management" },
            result: "38 orders · 21 carts",
          },
          {
            app: "salesforce",
            action: "Find the buyer accounts behind them",
            tool: { name: "dispatch_readonly", target: "buyer-profile-management" },
            result: "62 accounts · 14 strategic",
          },
          {
            app: "salesforce",
            action: "Check fulfilment on every open order",
            tool: { name: "dispatch_readonly", target: "merchant-order-management" },
            result: "214 lines · 7 delayed",
          },
          {
            app: "salesforce",
            action: "Check stock at each warehouse",
            tool: { name: "dispatch_readonly", target: "merchant-catalog-management" },
            result: "5 warehouses · 3 SKUs low",
          },
          {
            app: "salesforce",
            action: "Read the discount and exception policy",
            tool: { name: "get_sor_detail", target: "b2b-merchant-quote-management" },
            result: "Split-ships, holds and reservations allowed",
          },
          { app: "slack", action: "Confirm it can reach you on Slack", result: "DM to @aaron" },
          { app: "gmail", action: "Verify Gmail access for buyer updates", result: "Drafts and sends from you" },
        ],
      },
    },
    grow,
    grow,
    grow,
    grow,
    grow,
    { ...grow, connector: "slack" },
    grow,
    { ...grow, connector: "gmail", progress: 2 },
    { wait: 600, thinking: "Running a first sweep across every open order and cart" },
    {
      wait: 2400,
      file: "first-sweep.xlsx",
      block: {
        type: "stats",
        pairs: true,
        items: [
          { label: "Open orders", value: "38", detail: "7 delayed" },
          { label: "Active carts", value: "21", detail: "5 stalled" },
          { label: "Order lines traced", value: "214", detail: "Across 62 accounts" },
          { label: "Warehouses", value: "5", detail: "3 SKUs running low" },
        ],
        note: "Checked in **38 seconds**. By hand that's most of a day across Order Management, inventory and your inbox. From now on it happens every time a FulfillmentOrder changes, day or night.",
      },
    },
    {
      wait: 1200,
      progress: 3,
      block: {
        type: "text",
        content:
          "**12 orders and carts** are at risk right now, **$258,700** in order value. Strategic accounts first:",
      },
    },
    {
      wait: 500,
      sources: SWEEP_SOURCES,
      block: {
        type: "table",
        title: "Orders and carts at risk",
        columns: [
          { label: "Order or cart", kind: "lead" },
          { label: "Account", kind: "name" },
          { label: "Issue" },
          { label: "Site" },
          { label: "Next step", kind: "status" },
          { label: "Value", kind: "amount" },
        ],
        inline: [0, 1, 2, 5],
        preview: 5,
        rows: [
          [
            "ORD-10482",
            "Brandt Bau ★",
            "40 × AP-7 held in Rotterdam, ships 9 days late",
            "Rotterdam",
            "Agent fixes",
            "$48,200",
          ],
          [
            "CART-3318",
            "Halden & Rook ★",
            "120 × AP-7 stalled at checkout, buyer asked for 8% off",
            "Leeds",
            "Needs you",
            "$31,500",
          ],
          [
            "ORD-10511",
            "Marlow & Finch ★",
            "3 of 7 lines backordered, the rest ready to ship",
            "Leeds",
            "Agent fixes",
            "$29,800",
          ],
          ["CART-3324", "Kessler Gruppe ★", "60 × SW-24 in the cart, Leeds has 22", "Leeds", "Agent fixes", "$26,400"],
          ["CART-3297", "Nordhavn Fit-Out", "2 carts need 16 × SW-24, Leeds has 9", "Leeds", "Agent fixes", "$22,750"],
          [
            "CART-3331",
            "Arden Build Co.",
            "Cart stalled after a competitor quoted 12% under",
            "Rotterdam",
            "Needs you",
            "$21,300",
          ],
          ["ORD-10467", "Lumen Offices", "Split across 3 carriers, 1 box lost", "Rotterdam", "Agent fixes", "$18,900"],
          ["ORD-10495", "Corvid Interiors", "On credit hold, payment terms lapsed", "Leeds", "Needs you", "$15,750"],
          [
            "ORD-10503",
            "Pell & Sons",
            "Paid, but waiting on stock allocation for 4 days",
            "Leeds",
            "Agent fixes",
            "$14,200",
          ],
          [
            "ORD-10476",
            "Ostrava Data",
            "AP-7 backordered past their go-live date",
            "Rotterdam",
            "Agent fixes",
            "$12,850",
          ],
          ["CART-3302", "Fenwick Retail", "30 × SW-24 abandoned at checkout", "Leeds", "Agent fixes", "$9,600"],
          [
            "ORD-10519",
            "Brightwater Clinics",
            "Carrier rejected the delivery address",
            "Rotterdam",
            "Agent fixes",
            "$7,450",
          ],
        ],
        footer: "7 orders · 5 carts · $258,700 at risk",
        sources: SWEEP_SOURCES,
      },
    },
    {
      wait: 900,
      block: {
        type: "text",
        content:
          "**9 items I can fix within policy:** split-ships, stock holds, reroutes, address fixes and checkout nudges.\n**3 items I need your input on:** a discount ask, a competitor match and a credit hold.",
      },
    },
    {
      wait: 1200,
      block: { type: "text", content: "Here's the agent. Start it and it'll keep doing this on its own." },
    },
    {
      wait: 600,
      progress: 4,
      block: {
        type: "agent",
        status: "proposed",
        name: "Delivery Watch",
        summary: "Keeps every open order and cart moving to delivery, and fixes what it can, for the next 60 days.",
        trigger: "Wakes on order, fulfillment and cart changes",
        runsFor: "Runs for 60 days",
        things: [
          "Watch every open order and cart, with strategic accounts first",
          "Fix what's within policy: split-ships, stock holds, reroutes, checkout nudges",
          "Bring you anything else with a recommendation and the evidence",
        ],
        asksFirst: ["Price or discount changes", "Margin below policy", "Credit and policy exceptions"],
        sources: [
          { app: "salesforce", label: "Headless 360" },
          { app: "slack", label: "Slack" },
          { app: "gmail", label: "Gmail" },
        ],
        facts: [
          { label: "Type", value: "Claude agent · event-triggered" },
          {
            label: "What it does",
            value: "Keeps open orders and carts moving to delivery, and fixes what it can within policy",
          },
          { label: "Wakes on", value: "Order, FulfillmentOrder and cart changes" },
          { label: "Runs for", value: "60 days, until 13 Dec" },
          { label: "Fixes on its own", value: "Split-ships, stock holds, reroutes, address fixes, checkout nudges" },
          {
            label: "Asks you first",
            value: "Price or discount changes, margin below policy, credit and policy exceptions",
          },
          { label: "Reads from", value: "Salesforce Headless 360: Order, FulfillmentOrder, ProductItem, WebCart" },
          { label: "Reaches you on", value: "Slack, Gmail" },
          { label: "Runs in", value: "The cloud, even when your Mac is off" },
        ],
      },
    },
  ],
  onStart: [
    { wait: 400, thinking: "Starting Delivery Watch" },
    { wait: 900, thinking: "Handing off to Delivery Watch" },
    {
      wait: 1600,
      progress: 5,
      block: {
        type: "text",
        content:
          "**Delivery Watch is live.** It's working through the 9 orders and carts it can fix within policy, strategic accounts first, and each fix lands here as it happens. The 3 that need you are on Slack with my recommendation. After that it stays quiet unless something crosses your line. You'll find it under **Agents**.",
      },
    },
    { wait: 500, block: { type: "chips", items: LIVE_CHIPS } },
  ],
  hints: [
    "Ask Delivery Watch why an order is running late",
    'Change a rule, like "never split-ship Brandt Bau"',
    'Ask "what did you fix overnight?"',
  ],
  // 5s apart (5s, 10s, 15s after Start): Aaron has little time to wait.
  watch: [
    {
      wait: 5000,
      block: {
        type: "action",
        agent: "Delivery Watch",
        title: "Split-shipped Brandt Bau's access points from Leeds",
        time: "Just now",
        details: [
          { label: "Account", value: "Brandt Bau ★ · strategic" },
          {
            label: "What it saw",
            value: "FulfillmentOrder FO-10482 on hold in Rotterdam, 40 × AP-7 shipping 9 days late",
          },
          {
            label: "What it did",
            value: "Split the order: 24 × AP-7 ship from Leeds today, 16 follow from Rotterdam on Monday",
          },
          { label: "Buyer", value: "Emailed Jonas Brandt the new tracking" },
          { label: "Order value", value: "$48,200, back on time" },
        ],
      },
    },
    {
      wait: 5000,
      block: {
        type: "action",
        agent: "Delivery Watch",
        title: "Held 22 × SW-24 for Kessler Gruppe's cart",
        time: "Just now",
        details: [
          { label: "Account", value: "Kessler Gruppe ★ · strategic" },
          { label: "What it saw", value: "CART-3324: 60 × SW-24, only 22 in stock at Leeds" },
          { label: "What it did", value: "Reserved the 22 and backordered 38 from Rotterdam, due in 6 days" },
          { label: "Buyer", value: "Emailed Petra Kessler the split and dates" },
          { label: "Order value", value: "$26,400, cart checked out" },
        ],
      },
    },
    {
      wait: 5000,
      block: {
        type: "action",
        agent: "Delivery Watch",
        title: "Woke on a delay: rerouted Vantage Hotels' order",
        time: "Just now",
        details: [
          { label: "Account", value: "Vantage Hotels" },
          { label: "What it saw", value: "FulfillmentOrder FO-10591 delayed at the carrier, 2 minutes ago" },
          { label: "What it did", value: "Rebooked 12 × AP-7 with DPD, still arrives before their Friday install" },
          { label: "Buyer", value: "No email needed: delivery date unchanged" },
          { label: "Order value", value: "$11,300, still on time" },
        ],
      },
    },
  ],
  replies: {
    [NEEDS_YOU_CHIP]: [
      { wait: 400, thinking: "Pulling the evidence for each" },
      {
        wait: 1600,
        block: {
          type: "table",
          title: "Needs your input",
          columns: [
            { label: "Order or cart", kind: "lead" },
            { label: "The ask" },
            { label: "My recommendation" },
            { label: "Value", kind: "amount" },
          ],
          rows: [
            [
              "CART-3318 · Halden & Rook ★",
              "8% off a 120 × AP-7 cart",
              "Offer 5% at this volume: keeps margin above policy",
              "$31,500",
            ],
            [
              "CART-3331 · Arden Build Co.",
              "Match a competitor 12% under on SW-24",
              "Match on SW-24 only, if they check out this week",
              "$21,300",
            ],
            [
              "ORD-10495 · Corvid Interiors",
              "Release an order on credit hold",
              "Release it: 6 years paying on time, one late invoice",
              "$15,750",
            ],
          ],
          footer: "1 order · 2 carts · $68,550 at risk",
          sources: [
            { app: "salesforce", label: "Order history" },
            { app: "salesforce", label: "Price book" },
            { app: "gmail", label: "Arden thread" },
          ],
        },
      },
      {
        wait: 800,
        block: {
          type: "text",
          content: "Say the word on any of these and I'll reprice the cart or release the order.",
        },
      },
      others(NEEDS_YOU_CHIP),
    ],
    [REPORT_CHIP]: [
      { wait: 400, thinking: "Pulling Delivery Watch's activity" },
      {
        wait: 1200,
        block: {
          type: "integrations",
          shown: 0,
          steps: [
            {
              app: "salesforce",
              action: "Read the agent's actions so far",
              tool: { name: "dispatch_readonly", target: "merchant-order-management" },
              result: "9 actions · 0 failed",
            },
            {
              app: "salesforce",
              action: "Check the orders it touched",
              tool: { name: "dispatch_readonly", target: "merchant-order-management" },
              result: "5 orders on time · 3 carts checked out · 1 awaiting reply",
            },
          ],
        },
      },
      grow,
      grow,
      { wait: 600, thinking: "Building your Delivery Watch dashboard" },
      { wait: 1600, file: "delivery-watch-report.md", block: REPORT },
      {
        wait: 800,
        block: {
          type: "text",
          content:
            "**8 of 12 fixed, $160K of orders saved, and on-time delivery is up from 91% to 98%.** It's saved in your panel's Artifacts.\nStill waiting on you: **Halden & Rook's cart** (8% off), **Arden Build Co.'s cart** (competitor match) and **Corvid Interiors' order** (credit hold). Each one has my recommendation on Slack.",
        },
      },
      others(REPORT_CHIP),
    ],
    [WAREHOUSE_CHIP]: [
      { wait: 400, thinking: "Comparing the five warehouses" },
      {
        wait: 1600,
        block: {
          type: "table",
          title: "Warehouses, by orders delayed",
          columns: [
            { label: "Warehouse", kind: "lead" },
            { label: "Orders delayed" },
            { label: "SKUs low" },
            { label: "Average delay" },
            { label: "Main cause" },
          ],
          inline: [0, 1, 4],
          rows: [
            ["Rotterdam", "4", "AP-7", "6 days", "The AP-7 container from the supplier landed 5 days late"],
            ["Leeds", "2", "SW-24", "3 days", "SW-24 down to 22 units, next inbound Thursday"],
            ["Lyon", "1", "—", "2 days", "One carrier pickup missed"],
            ["Milan", "0", "—", "—", "On time"],
            ["Dublin", "0", "—", "—", "On time"],
          ],
          footer: "7 orders delayed · 3 SKUs low",
          sources: [
            { app: "salesforce", label: "FulfillmentOrder" },
            { app: "salesforce", label: "ProductItem" },
            { app: "salesforce", label: "Location" },
          ],
        },
      },
      {
        wait: 800,
        block: {
          type: "text",
          content:
            "**Rotterdam is the bottleneck.** I'm already shipping AP-7 from Leeds where it has stock. Rotterdam's next container lands Friday, and I'll release the held orders the hour it's received.",
        },
      },
      others(WAREHOUSE_CHIP),
    ],
    [SLIP_CHIP]: [
      { wait: 400, thinking: "Checking every order due this week" },
      {
        wait: 1600,
        block: {
          type: "table",
          title: "Orders that could slip this week",
          columns: [
            { label: "Order", kind: "lead" },
            { label: "Account", kind: "name" },
            { label: "Why it could slip" },
            { label: "Ships by" },
            { label: "Status", kind: "status" },
            { label: "Value", kind: "amount" },
          ],
          inline: [0, 2, 4, 5],
          rows: [
            [
              "ORD-10552",
              "Greystone Labs",
              "Needs 30 × SW-24, Leeds has 22 until Thursday",
              "Wed",
              "Agent fixes",
              "$34,500",
            ],
            ["ORD-10548", "Talbot Health", "Carrier is 2 days behind on that route", "Thu", "Watching", "$17,200"],
            [
              "ORD-10557",
              "Ostrander Hotels",
              "Waiting on a signed delivery window",
              "Thu",
              "Awaiting reply",
              "$13,900",
            ],
            [
              "ORD-10561",
              "Pike Street Studios",
              "AP-7 from Rotterdam, container due Friday",
              "Fri",
              "Agent fixes",
              "$9,240",
            ],
          ],
          footer: "4 orders · $74,840 due this week",
          sources: [
            { app: "salesforce", label: "Order" },
            { app: "salesforce", label: "FulfillmentOrder" },
          ],
        },
      },
      {
        wait: 800,
        block: {
          type: "text",
          content:
            "None of these is late yet. I'll fix the two I can now, and Delivery Watch wakes the moment any of the others changes.",
        },
      },
      others(SLIP_CHIP),
    ],
  },
};
