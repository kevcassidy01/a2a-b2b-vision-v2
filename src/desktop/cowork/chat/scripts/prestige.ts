import { copy } from "../../../../copy/copy";
import type { Beat, CoworkScript, IntegrationStep, PlanItem, Source } from "../types";
import { writing } from "./writes";

/**
 * Canary Wharf — the multimodal chat (decision 56): Wednesday 14 October, Aaron is
 * just off a call with Canary Wharf Workspaces about their new Manchester site.
 * Aaron drags the call notes, the floor plan and a comms-room photo from the
 * desktop into the prompt box, and dictates the ask.
 *
 * Claude reads everything: the files, the Gong call (a progress bar along the
 * recording, then its moments), Tom's email (a search through Gmail first,
 * then a newer floor plan and a requirements sheet, landing one at a time),
 * Slack, then Salesforce. The cart ends on its total. What it found
 * connects the sources: Tom's plan adds 2 rooms, so 20 APs, which happens to
 * unlock free pre-configuration; the photo shows no UPS.
 *
 * Then Claude pins a plan above the prompt bar (PlanDock) and works it: 8
 * tasks on its own, ticked off one by one (the cart and quote, contacts,
 * buyer access, address, stock, a reorder list, the phase 2 quote, and a
 * Slack reminder for Friday, set through the Slack integration, and
 * Slackbot's banner confirms it straight away), then 4 that
 * need Aaron, one at a time, each only after the last, said and clicked in
 * turn: the price (said; or, after "What would 5% off the licences come to?",
 * one click on a choice), a UPS (said, or the card), Marta's PO terms (the
 * card) and the quote email (Send). Then the receipt, and a few seconds later
 * Priya accepts on her own: Salesforce's Slack banner, then the order. Every
 * reply ends with one-time chips. (The session's id stays "prestige", its
 * first name.)
 */

const PROMPT = copy.desktop.cowork.flows.items.find((f) => f.id === "prestige")!.prompt;
/** Aaron's answers, dictated (a chip or a card's button does the same). */
const MATCH_ASK = "Match them on the access points.";
const UPS_ASK = "Yes, add the UPS and the power strips.";

const MATCH = "match";
const LICENCES_CHIP = "What would 5% off the licences come to?";
const DELIVERY_CHIP = "What's the delivery plan?";
const CALL_CHIP = "What else came up on the call?";
const WHO_CHIP = "Who's who at Canary Wharf?";
const LICENCES_PICK = "Take 5% off the licences";
/** Generic follow-ups, so every reply ends with something to click (each once). */
const SUGGEST: Beat = { wait: 400, block: { type: "chips", items: [DELIVERY_CHIP, CALL_CHIP, WHO_CHIP] } };

/** How long each integrations step works before its result lands, and the Gong read. */
const STEP_MS = 1300;
const LISTEN_MS = 6500;
const GMAIL_MS = 5200;
const grow: Beat = { wait: STEP_MS, grow: true };

const TOMS_FILES = ["Floorplan_rev-B.pdf", "Manchester_requirements.xlsx"];

const STEPS: IntegrationStep[] = [
  {
    app: "files",
    action: "Read your call notes, floor plan and comms-room photo",
    result: "18 AP spots on the plan · 4 × SW-24 in the rack · no UPS",
  },
  {
    app: "gong",
    action: "Go through today's call with Canary Wharf",
    result: "41 min · 5 moments · 1 competitor mention",
    listen: {
      ms: LISTEN_MS,
      length: "41:12",
      stages: ["Reading the transcript", "Finding who said what", "Identifying their needs", "Flagging competitor mentions"],
    },
    moments: [
      "03:40 Priya: move-in on 3 December is a hard date",
      "23:14 Priya: another vendor quoted $410 an access point",
      "31:02 Priya: phase 2 is 40 cameras, in January",
      "33:30 Tom: could we reorder room kits ourselves?",
      "36:50 Tom: a power cut took our Leeds network down for a day",
    ],
  },
  {
    app: "gmail",
    action: "Find Tom's email in your Gmail",
    result: "A newer floor plan · requirements · 2 new buyers · site address",
    listen: {
      ms: GMAIL_MS,
      stages: [
        "Searching your inbox for Tom Reilly, since the call",
        "Found it: “Manchester requirements”, 2:14 PM",
        "Reading the email",
        "Opening 2 attachments",
      ],
    },
    attachments: TOMS_FILES,
  },
  { app: "slack", action: "Check #canarywharf-manchester", result: "Jun: their SW-24s have PoE to spare" },
  {
    app: "salesforce",
    action: "Read Canary Wharf's account, open cart and installed base",
    tool: { name: "dispatch_readonly", target: "merchant-cart-management" },
    result: "Cart has 12 × AP-7 · owns 4 × SW-24",
  },
  {
    app: "salesforce",
    action: "Read their partner agreement and price book",
    tool: { name: "get_sor_detail", target: "b2b-merchant-quote-management" },
    result: "Free pre-config at 20+ APs · up to 5% approves itself",
  },
  {
    app: "salesforce",
    action: "Check AP-7 stock for delivery before 3 Dec",
    tool: { name: "dispatch_readonly", target: "merchant-catalog-management" },
    result: "14 in Manchester · 6 in Rotterdam",
  },
];

const PLAN: PlanItem[] = [
  { id: "cart", label: "Rebuild the cart to Tom's new plan, and draft the quote", by: "claude", status: "todo" },
  { id: "contacts", label: "Add Jess and Marta as contacts", by: "claude", status: "todo" },
  { id: "access", label: "Give Jess storefront access", by: "claude", status: "todo" },
  { id: "address", label: "Add the Manchester ship-to address", by: "claude", status: "todo" },
  { id: "reserve", label: "Reserve 20 AP-7s for 24 November", by: "claude", status: "todo" },
  { id: "reorder", label: "Set up the room-kit reorder list", by: "claude", status: "todo" },
  { id: "phase2", label: "Draft the phase 2 cameras quote", by: "claude", status: "todo" },
  { id: "remind", label: "Remind you on Friday to chase Priya", by: "claude", status: "todo" },
  { id: "price", label: "Match the other vendor's $410?", by: "you", status: "todo" },
  { id: "ups", label: "Add a UPS for the comms room?", by: "you", status: "todo" },
  { id: "terms", label: "Put Marta on PO, net 30?", by: "you", status: "todo" },
  { id: "send", label: "Send the quote to Priya and Tom", by: "you", status: "todo" },
];

/** The cart and the quote, written before the cart table shows them. */
const CART_WRITES: IntegrationStep[] = [
  {
    app: "salesforce",
    action: "Rebuild the cart to Tom's rev B plan",
    tool: { name: "dispatch_write", target: "merchant-cart-management" },
    result: "CART-4127 · 6 lines · $14,360",
    writes: [
      { op: "update", object: "CartItem", name: "AP-7 access point", fields: "Quantity 12 → 20 · TotalPrice $5,040 → $8,400" },
      { op: "insert", object: "CartItem", name: "AP-7 licence, 3 years", fields: "Quantity 20 · TotalPrice $3,600" },
      { op: "insert", object: "CartItem", name: "Ceiling mount", fields: "Quantity 20 · TotalPrice $700" },
      { op: "insert", object: "CartItem", name: "RT-5 router", fields: "Quantity 2 · TotalPrice $1,280" },
      { op: "insert", object: "CartItem", name: "SFP+ optic", fields: "Quantity 4 · TotalPrice $380" },
      { op: "insert", object: "CartItem", name: "Pre-configuration", fields: "Quantity 20 · $0 · Partner agreement PA-0192" },
      { op: "update", object: "WebCart", name: "CART-4127", fields: "GrandTotalAmount $5,040 → $14,360" },
    ],
  },
  {
    app: "salesforce",
    action: "Draft the quote from the cart",
    tool: { name: "dispatch_write", target: "merchant-quote-management" },
    result: "Q-20511 · Draft · $14,360",
    writes: [
      { op: "insert", object: "Quote", name: "Q-20511", fields: "Status Draft · GrandTotal $14,360" },
      { op: "insert", object: "QuoteLineItem", name: "6 lines", fields: "From CART-4127", count: 6 },
      { op: "update", object: "Opportunity", name: "Canary Wharf Manchester", fields: "StageName → Proposal · Amount $14,360" },
    ],
  },
];

/** Claude's own tasks after the cart, one write step each (keyed by plan id). */
const TASK_WRITES: (IntegrationStep & { id: string; thinking: string })[] = [
  {
    id: "contacts",
    thinking: "Adding Jess and Marta from Tom's email",
    app: "salesforce",
    action: "Add Jess and Marta as contacts",
    tool: { name: "dispatch_write", target: "buyer-profile-management" },
    result: "2 contacts on Canary Wharf Workspaces",
    writes: [
      { op: "insert", object: "Contact", name: "Jess Park", fields: "Title Facilities lead · Email jess.park@cwworkspaces.co.uk" },
      { op: "insert", object: "Contact", name: "Marta Silva", fields: "Title Procurement · Email marta.silva@cwworkspaces.co.uk" },
    ],
  },
  {
    id: "access",
    thinking: "Giving Jess storefront access",
    app: "salesforce",
    action: "Give Jess storefront access",
    tool: { name: "dispatch_write", target: "buyer-profile-management" },
    result: "Jess can order · on card, like Tom",
    writes: [
      { op: "insert", object: "User", name: "Jess Park", fields: "Profile B2B Buyer · Username jess.park@cwworkspaces.co.uk" },
      { op: "insert", object: "BuyerGroupMember", name: "Jess Park", fields: "BuyerGroup Canary Wharf · Card buyers" },
    ],
  },
  {
    id: "address",
    thinking: "Adding the ship-to address",
    app: "salesforce",
    action: "Add the Manchester ship-to address",
    tool: { name: "dispatch_write", target: "buyer-profile-management" },
    result: "Ship-to · 40 Portland Street, M1 4GS",
    writes: [
      { op: "insert", object: "ContactPointAddress", name: "Manchester site", fields: "AddressType Shipping · M1 4GS" },
    ],
  },
  {
    id: "reserve",
    thinking: "Reserving stock in Manchester and Rotterdam",
    app: "salesforce",
    action: "Reserve 20 AP-7s for 24 November",
    tool: { name: "dispatch_write", target: "merchant-order-management" },
    result: "20 reserved · 14 Manchester, 6 Rotterdam",
    writes: [
      { op: "insert", object: "InventoryReservation", name: "AP-7 · Manchester", fields: "Quantity 14 · ExpiresOn 2026-11-24" },
      { op: "insert", object: "InventoryReservation", name: "AP-7 · Rotterdam", fields: "Quantity 6 · ExpiresOn 2026-11-24" },
    ],
  },
  {
    id: "reorder",
    thinking: "Building the room kit",
    app: "salesforce",
    action: "Set up the room-kit reorder list",
    tool: { name: "dispatch_write", target: "merchant-storefront-management" },
    result: "Room kit · 4 items · shared with 3 buyers",
    writes: [
      { op: "insert", object: "Wishlist", name: "Room kit", fields: "WebStore Ohana Store · Shared with Tom, Jess, Marta" },
      { op: "insert", object: "WishlistItem", name: "4 items", fields: "AP-7, ceiling mount, patch cables, PoE injector", count: 4 },
    ],
  },
  {
    id: "phase2",
    thinking: "Pricing 40 cameras for January",
    app: "salesforce",
    action: "Draft the phase 2 cameras quote",
    tool: { name: "dispatch_write", target: "merchant-quote-management" },
    result: "Q-20514 · Draft · $12,800",
    writes: [
      { op: "insert", object: "Opportunity", name: "Phase 2 cameras", fields: "CloseDate 2027-01-15 · Amount $12,800" },
      { op: "insert", object: "Quote", name: "Q-20514", fields: "Status Draft · GrandTotal $12,800 · 40 × CAM-4" },
      { op: "insert", object: "QuoteLineItem", name: "3 lines", fields: "Cameras, licences, mounts", count: 3 },
    ],
  },
];

const CART_SOURCES: Source[] = [
  { app: "gmail", label: "Floorplan_rev-B.pdf" },
  { app: "gmail", label: "Requirements" },
  { app: "salesforce", label: "Cart" },
  { app: "salesforce", label: "Installed base" },
  { app: "salesforce", label: "Partner agreement" },
];

/** The UPS ask, after the price (either one): its new total. */
const upsCard = (total: string): Beat => ({
  wait: 600,
  block: {
    type: "approval",
    id: "ups",
    title: "Add a UPS and surge-protected power strips for the comms room",
    summary:
      "Your photo shows their rack with no UPS, and on the call (36:50) Tom said a power cut took their Leeds network down for a day. This keeps the switches and routers up through a cut. It also takes the quote over $15K, so it's yours to approve.",
    details: [
      { label: "Adds", value: "1 × UPS-1500, 2 × surge-protected PDU · +$1,130" },
      { label: "New total", value: total },
      { label: "Stock", value: "In Manchester, ships with the access points" },
      { label: "Seen in", value: "Comms room.jpg · Gong, 36:50" },
    ],
    approve: "Add them",
    status: "proposed",
  },
});

/** A decision's writes, one step each (the price either way, the UPS, Marta's terms). */
const quoteWrite = (action: string, writes: IntegrationStep["writes"], result: string): IntegrationStep => ({
  app: "salesforce",
  action,
  tool: { name: "dispatch_write", target: "merchant-quote-management" },
  result,
  writes,
});
const MATCH_WRITES = quoteWrite(
  "Reprice the access points on Q-20511",
  [
    { op: "update", object: "QuoteLineItem", name: "AP-7 access point", fields: "UnitPrice $420 → $410 · Discount 2.4%" },
    { op: "update", object: "Quote", name: "Q-20511", fields: "GrandTotal $14,360 → $14,160 · ApprovalStatus Auto" },
  ],
  "Q-20511 · $14,160 · approved",
);
const LICENCES_WRITES = quoteWrite(
  "Reprice the licences on Q-20511",
  [
    { op: "update", object: "QuoteLineItem", name: "AP-7 licence, 3 years", fields: "Discount 0% → 5% · TotalPrice $3,600 → $3,420" },
    { op: "update", object: "Quote", name: "Q-20511", fields: "GrandTotal $14,360 → $14,180 · ApprovalStatus Auto" },
  ],
  "Q-20511 · $14,180 · approved",
);
const UPS_WRITES = quoteWrite(
  "Add the UPS and PDUs to Q-20511",
  [
    { op: "insert", object: "QuoteLineItem", name: "UPS-1500", fields: "Quantity 1 · TotalPrice $790" },
    { op: "insert", object: "QuoteLineItem", name: "Surge-protected PDU", fields: "Quantity 2 · TotalPrice $340" },
    { op: "insert", object: "CartItem", name: "UPS-1500, 2 × PDU", fields: "CART-4127 · ships from Manchester", count: 2 },
    { op: "update", object: "Quote", name: "Q-20511", fields: "GrandTotal +$1,130" },
  ],
  "Q-20511 · +$1,130",
);
const TERMS_WRITES: IntegrationStep = {
  app: "salesforce",
  action: "Put Marta on PO, net 30",
  tool: { name: "dispatch_write", target: "buyer-profile-management" },
  result: "PO · net 30 · $20K limit",
  writes: [
    { op: "update", object: "BuyerAccount", name: "Canary Wharf Workspaces", fields: "PaymentTerms Net 30 · CreditLimit $20,000" },
    { op: "insert", object: "User", name: "Marta Silva", fields: "Profile B2B Buyer · Username marta.silva@cwworkspaces.co.uk" },
    { op: "insert", object: "BuyerGroupMember", name: "Marta Silva", fields: "BuyerGroup Canary Wharf · PO buyers" },
  ],
};

const priced = (thinking: string, said: string, total: string, writes: IntegrationStep): Beat[] => [
  ...writing([writes], [thinking], [null], null),
  { wait: 500, planStatus: { price: "done", ups: "now" }, block: { type: "text", content: said } },
  { wait: 700, block: { type: "text", content: "Next, something I'd add:" } },
  upsCard(total),
];

/** Marta's terms, then the quote email: the last two asks, whichever way the UPS went. */
const TERMS_CARD: Beat = {
  wait: 600,
  block: {
    type: "approval",
    id: "terms",
    title: "Put Marta on purchase orders, net 30",
    summary:
      "Marta raises Canary Wharf's POs, and Tom's email asks for net 30. New payment terms need your OK. Canary Wharf pays on time.",
    details: [
      { label: "Marta Silva", value: "Procurement · buyer in Canary Wharf's buyer group" },
      { label: "Terms", value: "PO, net 30, $20K limit" },
      { label: "Payment history", value: "38 invoices · paid in 22 days on average · none overdue" },
    ],
    approve: "Approve terms",
    status: "proposed",
  },
};
const toTerms = (said: string): Beat[] => [
  { wait: 1400, planStatus: { ups: "done", terms: "now" }, block: { type: "text", content: said } },
  { wait: 700, block: { type: "text", content: "Next, Marta's payment terms:" } },
  TERMS_CARD,
];

const EMAIL: Beat = {
  wait: 600,
  block: {
    type: "email",
    to: "Priya Shah, Tom Reilly",
    subject: "Your Manchester quote: Q-20511",
    thread: "Re: Manchester requirements",
    body: "Hi Priya, hi Tom,\n\nThanks for today. Here's your quote for Manchester: 20 AP-7 access points to Tom's rev B plan, pre-configured at no charge, with backup power for the comms room. We're reusing your four SW-24s, and we've sharpened the price with the other quote you mentioned in mind.\n\nEverything arrives by 24 November, a week before you move in. You can accept it here: ohana.store/q/20511\n\nJess and Marta can order from today, and the room kit is on your reorder list.\n\nAaron",
    status: "draft",
  },
};
const toSend = (said: string): Beat[] => [
  { wait: 1400, planStatus: { terms: "done", send: "now" }, block: { type: "text", content: said } },
  { wait: 700, block: { type: "text", content: "**Last one:** the quote, ready to go to Priya and Tom." } },
  EMAIL,
];

export const prestige: CoworkScript = {
  steps: ["Read your files and the call", "Check Gmail, Slack and Salesforce", "Claude's tasks", "Your decisions"],
  opening: [
    { wait: 500, thinking: "Reading your notes, floor plan and photo" },
    { wait: 1200, skill: "account-360", block: { type: "skill", name: "/account-360" } },
    { wait: 600, thinking: "Pulling in the call, Tom's email and Salesforce" },
    { wait: 1000, block: { type: "integrations", shown: 0, steps: STEPS } },
    { ...grow, thinking: "Listening to today's call" },
    { wait: LISTEN_MS, grow: true, connector: "gong", progress: 1, thinking: "Looking through your Gmail" },
    // Tom's attachments land one at a time (IntegrationsTimeline), then Slack.
    { wait: GMAIL_MS, grow: true, connector: "gmail", file: TOMS_FILES[0], thinking: "Opening Tom's attachments" },
    { wait: 700, file: TOMS_FILES[1] },
    { wait: STEP_MS + 600, grow: true, connector: "slack" },
    { ...grow, connector: "salesforce" },
    grow,
    { ...grow, progress: 2 },
    { wait: 600, thinking: "Comparing your floor plan with Tom's" },
    {
      wait: 1600,
      block: {
        type: "text",
        content:
          "**Your floor plan is out of date.** Tom's email has a newer one, rev B, with 2 more meeting rooms on L2. So the job needs **20 access points, not 18**, and the cart only has 12.\n- **20 is the number that matters:** at 20 APs their partner agreement gives them **free pre-configuration**, which Tom asked for on the call. It's also exactly what's in stock: 14 in Manchester and 6 in Rotterdam, arriving by 24 November.\n- **They can reuse their 4 SW-24 switches:** they're in your photo and their installed base, and Jun says there's power to spare. That's **$4,600 they don't spend**.\n- **But the photo shows no UPS in the rack**, and Tom said a power cut took their Leeds network down for a day.\n- **Priya mentioned another vendor at $410 an AP.** Yours is $420.",
      },
    },
    { wait: 700, thinking: "Making a plan" },
    {
      wait: 1200,
      plan: PLAN,
      block: {
        type: "text",
        content:
          "Here's my plan, pinned above the prompt box. **I'll do the first 8 now** from what you've given me, then bring you the 4 that need you, one at a time.",
      },
    },
    { wait: 500, skill: "add-to-cart", block: { type: "skill", name: "/add-to-cart" }, planStatus: { cart: "now" } },
    ...writing(CART_WRITES, ["Rebuilding the cart", "Drafting the quote"], [null, null], null),
    {
      wait: 400,
      sources: CART_SOURCES,
      planStatus: { cart: "done" },
      block: {
        type: "table",
        title: "Canary Wharf Manchester cart · CART-4127",
        columns: [
          { label: "Item", kind: "lead" },
          { label: "Qty" },
          { label: "Why" },
          { label: "Total", kind: "amount" },
        ],
        rows: [
          ["AP-7 access point", "20", "Tom's rev B plan: 20 spots (cart had 12)", "$8,400"],
          ["AP-7 licence, 3 years", "20", "One per access point", "$3,600"],
          ["Ceiling mount", "20", "Tom's sheet: drop ceilings", "$700"],
          ["RT-5 router", "2", "Tom's sheet: member and guest networks", "$1,280"],
          ["SFP+ optic", "4", "Uplinks for their own 4 × SW-24", "$380"],
          ["Pre-configuration", "20", "Free at 20+ APs, by their partner agreement", "$0"],
        ],
        total: ["Total", "", "", "$14,360"],
        footer: "6 lines · reuses their 4 × SW-24 · draft quote Q-20511",
        sources: CART_SOURCES,
      },
    },
    { wait: 200, planStatus: { contacts: "now" }, skill: "reorder" },
    ...writing(
      TASK_WRITES,
      TASK_WRITES.map((s) => s.thinking),
      TASK_WRITES.map((s) => s.id),
      "remind",
    ),
    // Friday 16 October is 2 days on. Claude sets it through Slack, and
    // Slackbot's banner confirms it now (not on Friday).
    { wait: 300, thinking: "Setting a reminder in Slack", planStatus: { remind: "now" } },
    {
      wait: 1100,
      block: {
        type: "action",
        agent: "Slack",
        app: "slack",
        title: "Set a Slack reminder for Fri 16 Oct, 9:00 AM",
        time: "Just now",
        footer: "Through the Slack integration",
        details: [
          { label: "Remind", value: "You: chase Priya on Q-20511" },
          { label: "Unless", value: "Canary Wharf accepts first, then I'll clear it" },
        ],
      },
    },
    {
      wait: 900,
      planStatus: { remind: "done" },
      notice: "I'll remind you on Friday 16 October at 9:00 AM: chase Priya on Q-20511 if Canary Wharf hasn't accepted.",
      noticeFrom: "Slackbot",
    },
    {
      wait: 600,
      progress: 3,
      block: {
        type: "table",
        title: "Done on my own",
        columns: [{ label: "What I did", kind: "lead" }, { label: "From" }, { label: "Status", kind: "status" }],
        rows: [
          ["Added Jess Park and Marta Silva as contacts", "Tom's email", "Done"],
          ["Gave Jess storefront access, on card like Tom", "Your buyer policy", "Done"],
          ["Added the Manchester ship-to address", "Tom's signature", "Done"],
          ["Reserved 20 × AP-7: 14 Manchester, 6 Rotterdam", "Gong 03:40, move-in 3 Dec", "Done"],
          ["Created the room-kit reorder list, shared with 3 buyers", "Gong 33:30, Tom's ask", "Done"],
          ["Drafted Q-20514: 40 cameras for January, $12,800", "Gong 31:02", "Done"],
          ["Set a Slack reminder to chase Priya, Fri 16 Oct", "Gong 23:14, a rival quote", "Done"],
        ],
        footer: "17 records written in Salesforce · 1 Slack reminder",
        sources: [
          { app: "salesforce", label: "Contact" },
          { app: "salesforce", label: "Buyer group" },
          { app: "salesforce", label: "Inventory" },
          { app: "salesforce", label: "Product list" },
          { app: "salesforce", label: "Quote" },
        ],
      },
    },
    {
      wait: 900,
      planStatus: { price: "now" },
      block: {
        type: "text",
        content:
          "**That's my part.** Now the 4 that need you. First, the price: Priya said another vendor quoted **$410 an access point**. Matching it on the APs is 2.4% off, inside the 5% that approves itself, and brings the quote to **$14,160**. Just say if you want it.",
      },
    },
    // Her words, from the recording: the timestamp plays the clip.
    {
      wait: 700,
      block: {
        type: "quote",
        app: "gong",
        source: "Canary Wharf Workspaces call · today",
        speaker: "Priya Shah",
        role: "Head of Operations",
        text: "To be straight with you, another vendor's come in at four-ten an access point. Get close to that and I can sign it off this week.",
        at: "23:14",
        to: "23:22",
      },
    },
    // No chip to match: Aaron says it (the mic has the line).
    { wait: 400, block: { type: "chips", items: [LICENCES_CHIP] } },
  ],
  onStart: [],
  replies: {
    [MATCH]: priced(
      "Repricing the access points",
      "**Done: AP-7s at $410, $14,160 in all.** It approved itself, so there's nothing to wait on.",
      "$15,290",
      MATCH_WRITES,
    ),
    [LICENCES_PICK]: priced(
      "Repricing the licences",
      "**Done: 5% off the licences, $14,180 in all.** It approved itself, so there's nothing to wait on.",
      "$15,310",
      LICENCES_WRITES,
    ),
    [LICENCES_CHIP]: [
      { wait: 400, thinking: "Pricing both" },
      {
        wait: 1300,
        block: {
          type: "text",
          content:
            "5% off the licences is $180 off, so **$14,180**. Matching $410 on the access points is **$14,160**: $20 less for them, and it lands the exact number they'll compare. Both approve themselves.",
        },
      },
      {
        wait: 600,
        block: {
          type: "choice",
          id: "price",
          question: "Which price should go on the quote?",
          options: [
            { label: "Match $410 on the access points", detail: "$14,160 · the exact number they'll compare", tag: "Recommended" },
            { label: LICENCES_PICK, detail: "$14,180 · the access points stay at $420" },
          ],
        },
      },
    ],
    [DELIVERY_CHIP]: [
      { wait: 400, thinking: "Checking stock and shipping" },
      {
        wait: 1400,
        block: {
          type: "text",
          content:
            "- **14 access points from Manchester and 6 from Rotterdam**, reserved, and pre-configured to Tom's network names before they ship.\n- **Everything arrives by 24 November**, a week before move-in on 3 December.\n- **Their 4 SW-24s stay**: the optics and power ship with the access points.",
        },
      },
      SUGGEST,
    ],
    [CALL_CHIP]: [
      { wait: 400, thinking: "Going back through the Gong call" },
      {
        wait: 1400,
        block: {
          type: "text",
          content:
            "Beyond what's in the plan:\n- **12:05** Priya wants one invoice per floor, for their accounts team.\n- **18:20** Tom asked for guest Wi-Fi with a separate network for members. The 2 RT-5s cover that.\n- **39:40** They're opening a Bristol site next spring. Worth a call in January, with phase 2.",
        },
      },
      SUGGEST,
    ],
    [WHO_CHIP]: [
      { wait: 400, thinking: "Looking at Canary Wharf's contacts" },
      {
        wait: 1400,
        block: {
          type: "table",
          title: "Canary Wharf Workspaces · Manchester",
          columns: [{ label: "Name", kind: "name" }, { label: "Role" }, { label: "On this deal" }],
          rows: [
            ["Priya Shah", "Head of Operations", "Signs off the quote"],
            ["Tom Reilly", "IT lead", "Sent the plan and requirements"],
            ["Jess Park", "Facilities lead", "Orders room kits · added today"],
            ["Marta Silva", "Procurement", "Raises the POs · added today"],
          ],
          footer: "4 contacts",
          sources: [
            { app: "salesforce", label: "Contact" },
            { app: "gmail", label: "Tom's email" },
          ],
        },
      },
      SUGGEST,
    ],
  },
  approvals: {
    ups: {
      approve: [
        ...writing([UPS_WRITES], ["Adding them to the cart and quote"], [null], null),
        ...toTerms("**Added: a UPS-1500 and 2 surge-protected PDUs,** +$1,130 on the quote."),
      ],
      decline: [{ wait: 200 }, ...toTerms("Okay, no UPS for now. The price stays as it is.")],
    },
    terms: {
      approve: [
        ...writing([TERMS_WRITES], ["Setting Marta's terms"], [null], null),
        ...toSend("**Marta's on PO, net 30**, with a $20K limit, and has her storefront sign-in."),
      ],
      decline: [{ wait: 200 }, ...toSend("Okay, Marta pays by card for now, like Jess.")],
    },
  },
  onEmailSent: [
    { wait: 400, thinking: "Sending from your Gmail" },
    {
      wait: 1300,
      progress: 4,
      planStatus: { send: "done" },
      block: {
        type: "text",
        content: "**Sent. That's everything from today's call,** with 4 decisions from you. Here's what it took:",
      },
    },
    {
      wait: 800,
      block: {
        type: "stats",
        pairs: true,
        items: [
          { label: "Sources read", value: "9", detail: "Notes, 2 plans, photo, Gong, Tom's email and sheet, Slack, Salesforce" },
          { label: "Salesforce records written", value: "42", detail: "Cart, 2 quotes, contacts, access, terms, stock, reorder list" },
          { label: "Your time", value: "~6 min", detail: "Against ~3 hours by hand" },
          { label: "Waiting on others", value: "None", detail: "Against ~3 days for approvals and setup" },
        ],
      },
    },
    // A few seconds on, Priya accepts on the storefront: Salesforce's Slack
    // banner pops on its own, then the order lands here.
    {
      wait: 4500,
      notice: "Priya accepted Q-20511 on your storefront: ORD-20977 for Canary Wharf Workspaces, shipping from Manchester and Rotterdam.",
    },
    {
      wait: 900,
      block: {
        type: "action",
        agent: "Salesforce",
        app: "salesforce",
        title: "Priya accepted Q-20511 on your storefront",
        time: "Just now",
        footer: "From the storefront",
        details: [
          { label: "Order", value: "ORD-20977 · Q-20511 as sent" },
          { label: "Ships", value: "14 from Manchester, 6 from Rotterdam, pre-configured" },
          { label: "Arrives", value: "24 November, a week before move-in" },
          { label: "Paid", value: "On the quote's terms" },
        ],
      },
    },
    {
      wait: 700,
      block: {
        type: "text",
        content: "**Canary Wharf has ordered.** I've told #canarywharf-manchester, Jun has the install on the calendar, and I've cleared Friday's reminder.",
      },
    },
    SUGGEST,
  ],
  intents: [
    { match: /\bmatch\b|\$?410/i, reply: MATCH },
    { match: /\bups\b|power strips/i, reply: "approve:ups" },
    { match: /marta.*\b(terms|po|net)\b|approve (the )?terms/i, reply: "approve:terms" },
    { match: /^send (it|the quote)/i, reply: "send-email" },
  ],
  dictations: [PROMPT, MATCH_ASK, UPS_ASK],
};
