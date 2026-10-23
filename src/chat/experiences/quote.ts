import type { CardApp, ChartBar, InsightSection, Kpi, LineRow, ProductRow, QuoteRow, ReportPage, ScriptedResponse } from "../types";
import type { Experience } from "./types";
import { onePageExport, parseExport } from "./export";
import { copy } from "../../copy/copy";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  DEMO SCRIPT — Quote management / approval (Salesforce Commerce, B2B merchant)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This is the one file that fakes "Claude". The chat plumbing (store, transcript,
 * thinking state, slots) is driven off what's here.
 *
 * The scripted flow (merchant "Aaron" working buyer Morton's pending quotes on the
 * Alpine Group LWR storefront):
 *   1. free text   — pull Morton's pending quotes              → QUOTE_LIST
 *   2. free text   — details of the first quote + line items   → QUOTE_DETAIL
 *   3. /entitlement-check — what Morton is entitled to buy      → ENTITLEMENT (expandable)
 *        Claude recommends one sample, with a margin check
 *   4. click "Add free sample" (posts a user msg) or free text  → sampleAdd()
 *        Claude checks the margin, then adds the line in the same turn (`then`)
 *   5. /add-note   — attach a buyer-visible note               → ADD_NOTE
 *   6. /approve-quote — approve directly                        → APPROVE
 *
 * Interspersed conversational beats (free-floating text, no slot) keep it feeling
 * like a real working session rather than a slash-command demo:
 *   • "How much has Morton ordered this year?"   → HISTORY (runs account-360)
 *   • "What's the margin impact of that sample?"  → MARGIN  (no skill)
 *   • "Do I need approval to add a free item?"    → POLICY  (no skill)
 *
 * Tool calls are real project-codey Codey tools over the merchant-side SORs
 * (`b2b-merchant-quote-management`, `merchant-catalog-management`,
 * `merchant-order-management`), shown as the tool-call timeline atop each
 * response: reads via `dispatch_readonly` and a `get_sor_detail` contract read
 * before each write. Writes go through `dispatch_write`, shown as their own
 * "Writing to Salesforce" timeline with the records they touch. Asking for
 * the write is the OK, so none asks again. Margin / policy / fallback have
 * none (Claude reasons directly).
 *
 * `getResponse(prompt)` matches the typed prompt (slash command first, then
 * keywords) to a beat. `getAction(key)` plays a beat triggered by an in-app
 * button (no user bubble). See the demo runbook in docs/quote-management-flow.md.
 *
 * HOUSE STYLE for the Claude-side text: no em dashes; no AI filler; lead with the
 * payload; confident enterprise commerce tone; realistic synthetic data. Bold the
 * things a merchant scans for (first mention of the buyer, quote numbers, dates,
 * totals) with **markdown** — MessageBubble renders `**bold**` and `- ` bullets.
 */

/** The MCP app identity for every slot header: Salesforce logo + name. */
const SF: CardApp = { name: "Salesforce Commerce", badge: "SF", logo: "/salesforce.svg" };

/** A "View in Salesforce" footer link — an extra, permitted brand touch
 *  (app-link accent) that also reads as "this is a real record you can open." */
const SF_LINK = { link: "View in Salesforce" };

/* ── Canonical synthetic data ─────────────────────────────────────────── */

/** Alpine Group catalog Morton is entitled to. Index 0–4 are the curated
 *  free sample candidates shown inline (index 0 is Claude's pick); the rest (incl. the two already on the
 *  quote) appear when the catalog is expanded to full screen. */
const ENTITLED_PRODUCTS: ProductRow[] = [
  {
    product: "Alpine Energy Drink Chai Post 0.5L PET – 6 pack",
    family: "Alpine Energy",
    price: "$20.50",
    recommended: {
      reason: "Requested by Morton · pairs with Chai Pre on the quote",
      why: [
        "Morton asked for this exact 6-pack in the quote note",
        "Pairs with the 900 units of Chai Pre already on quote 00000011",
        "Low margin impact: 24 units cost about $187, under 1% of the quote total",
        "Same Alpine Energy family Riverside reorders most",
      ],
    },
  },
  { product: "Alpine Energy Drink Green Tea Pre 0.5L PET – 6 pack", family: "Alpine Energy", price: "$20.50" },
  { product: "Alpine Energy Post Eco Pod, Chai", family: "Alpine Energy", price: "$11.50" },
  { product: "GoBrew Moca MCT + Protein Vegetarian – 6 pack", family: "Alpine Blends", price: "$13.99" },
  { product: "Alpine Energy CO2 Cartridge – 24 Pack", family: "Alpine Energy", price: "$55.50" },
  { product: "Alpine Energy Drink Green Tea Post 0.5L PET – 6 pack", family: "Alpine Energy", price: "$20.50" },
  { product: "Alpine Energy Drink Chai Pre 0.5L PET – 6 pack", family: "Alpine Energy", price: "$20.50", onQuote: true },
  { product: "Alpine Energy Pre Eco Pod, Chai", family: "Alpine Energy", price: "$11.50", onQuote: true },
  { product: "Alpine Energy Drink Berry Pre 0.5L PET – 6 pack", family: "Alpine Energy", price: "$20.50" },
  { product: "Alpine Energy Drink Berry Post 0.5L PET – 6 pack", family: "Alpine Energy", price: "$20.50" },
  { product: "GoBrew Moca MCT + Protein Vegan – 6 pack", family: "Alpine Blends", price: "$13.99" },
  { product: "GoBrew Vanilla MCT + Protein – 6 pack", family: "Alpine Blends", price: "$13.99" },
  { product: "Alpine Sparkling Water Lime 0.33L – 12 pack", family: "Alpine Hydrate", price: "$9.75" },
  { product: "Alpine Sparkling Water Yuzu 0.33L – 12 pack", family: "Alpine Hydrate", price: "$9.75" },
  { product: "Alpine Still Water 0.5L – 24 pack", family: "Alpine Hydrate", price: "$12.00" },
  { product: "Alpine Energy Pod Starter Kit", family: "Alpine Gear", price: "$79.00" },
  { product: "Alpine Reusable Bottle 0.75L", family: "Alpine Gear", price: "$24.00" },
  { product: "Alpine Cooler Bag – 12L", family: "Alpine Gear", price: "$39.00" },
  { product: "Alpine Energy Drink Chai Pre 0.33L Can – 12 pack", family: "Alpine Energy", price: "$28.00" },
  { product: "Alpine Energy Drink Chai Post 0.33L Can – 12 pack", family: "Alpine Energy", price: "$28.00" },
  { product: "Alpine Energy Variety Pack – 12 pack", family: "Alpine Energy", price: "$34.50" },
  { product: "GoBrew Cold Brew Concentrate 1L", family: "Alpine Blends", price: "$16.50" },
  { product: "Alpine Electrolyte Mix – 20 sachets", family: "Alpine Hydrate", price: "$18.00" },
  { product: "Alpine Energy CO2 Cartridge – 8 Pack", family: "Alpine Energy", price: "$21.00" },
];

/** A free sample is 24 units; cost runs about 38% of list (Chai Post: $492 list ≈ $187). */
const SAMPLE_UNITS = 24;
const COST_RATIO = 0.38;
/** Quote 00000011's grand total, which the free line never moves. */
const QUOTE_TOTAL = 24660;

/** Morton's pending quotes, one per buyer account (card + export). */
const PENDING: QuoteRow[] = [
  { number: "00000011", buyer: "Morton – Riverside", created: "Jul 29", expires: "Aug 21", total: "$24,660.00", status: { label: "Draft", tone: "neutral" } },
  { number: "00000010", buyer: "Morton – Midtown", created: "Jul 29", expires: "Aug 20", total: "$18,320.00", status: { label: "Draft", tone: "neutral" } },
  { number: "00000009", buyer: "Morton – Eastgate", created: "Jul 29", expires: "Aug 20", total: "$9,875.00", status: { label: "Draft", tone: "neutral" } },
];

/** Quote 00000011 before the free sample: its headline figures and two lines. */
const QUOTE_KPIS: Kpi[] = [
  { label: "Grand total", value: "$24,660", detail: "No discounts applied" },
  { label: "Units", value: "1,440", detail: "Across 2 lines" },
  { label: "Expires", value: "Aug 21", detail: "Created Jul 29" },
];
const QUOTE_LINES: LineRow[] = [
  { id: "00000021", product: "Alpine Energy Drink Chai Pre 0.5L PET – 6 pack", detail: "Alpine Energy", qty: "900", list: "$20.50", total: "$18,450.00" },
  { id: "00000022", product: "Alpine Energy Pre Eco Pod, Chai", detail: "Alpine Energy", qty: "540", list: "$11.50", total: "$6,210.00" },
];

/** Morton's spend this year (the floating chart + its full-screen report). */
const SPEND_KPIS: Kpi[] = [
  { label: "Spend", value: "$412.9K", detail: "65% on Alpine Energy" },
  { label: "Orders", value: "37", detail: "About $11.2K each" },
  { label: "Reorder cadence", value: "~9 days", detail: "Steady all year" },
  { label: "Largest order", value: "$28.1K", detail: "Placed in March" },
];
const SPEND_BY_ACCOUNT: ChartBar[] = [
  { label: "Riverside", value: 214500, display: "$214,500", hover: ["Morton – Riverside", "52% of spend", "18 orders · last on Sep 24"] },
  { label: "Midtown", value: 121700, display: "$121,700", hover: ["Morton – Midtown", "29% of spend", "12 orders · last on Sep 18"] },
  { label: "Eastgate", value: 76700, display: "$76,700", hover: ["Morton – Eastgate", "19% of spend", "7 orders · last on Sep 2"] },
];
const SPEND_BY_FAMILY: ChartBar[] = [
  { label: "Alpine Energy", value: 268400, display: "$268,400", hover: ["Alpine Energy", "65% of spend"] },
  { label: "Alpine Blends", value: 92600, display: "$92,600", hover: ["Alpine Blends", "22% of spend"] },
  { label: "Alpine Accessories", value: 51900, display: "$51,900", hover: ["Alpine Accessories", "13% of spend"] },
];

/* ── Beats ────────────────────────────────────────────────────────────── */

/** Step 1 — Morton's pending quotes. */
const QUOTE_LIST: ScriptedResponse = {
  suggestions: [
    { label: "Sort by total" },
    { label: "Which one expires first?" },
    { label: "Email Morton a summary" },
  ],
  skill: "account-quote-list",
  tools: [
    { name: "discover", target: "commerce SORs" },
    { name: "get_sor_detail", target: "b2b-merchant-quote-management" },
    { name: "dispatch_readonly", target: "b2b-merchant-quote-management" },
  ],
  thinking: [
    { label: "Opening the merchant quote workflow", delay: 950 },
    { label: "Resolving the Morton org", delay: 1200 },
    { label: "Scanning its buyer accounts for open quotes", delay: 1000 },
  ],
  response: [
    {
      type: "text",
      content:
        "I checked the buyer accounts under the **Morton** org and pulled every open quote. There are **3 pending**, all still in Draft, one per account.",
    },
    {
      type: "slot",
      mode: "inline-card",
      app: SF,
      footer: { ...SF_LINK },
      exportAs: { id: "quotes", title: "Morton · Pending quotes" },
      view: {
        kind: "quote-list",
        heading: "Pending quotes",
        subtitle: "Morton org · $52,855 across 3 buyer accounts",
        rows: PENDING,
      },
    },
    {
      type: "text",
      content: "Want me to open one of these in detail, or take a look at Morton's recent order history first?",
    },
  ],
};

/** Step 2 — quote detail + line items. (No skill: a plain record read.) */
const QUOTE_DETAIL: ScriptedResponse = {
  suggestions: [
    { label: "Check entitlement for free sample", prompt: "Which free samples is Morton entitled to?" },
    { label: "Check stock on these lines" },
    { label: "Compare to his last quote" },
  ],
  tools: [
    { name: "dispatch_readonly", target: "b2b-merchant-quote-management" },
  ],
  thinking: [
    { label: "Opening quote 00000011", delay: 950 },
    { label: "Loading line items", delay: 950 },
  ],
  response: [
    {
      type: "text",
      content:
        "Here's quote **00000011**. It belongs to **Morton – Riverside** and is still in **Draft**, with two line items. The buyer also left a note on it.",
    },
    {
      type: "slot",
      mode: "inline-card",
      app: SF,
      footer: { meta: "Record 0Q0SG0001yTxp", ...SF_LINK },
      exportAs: { id: "quote", title: "Quote 00000011" },
      view: {
        kind: "quote-detail",
        heading: "Quote 00000011",
        subtitle: "Morton – Riverside",
        steps: ["Draft", "Needs Review", "Approved"],
        current: "Draft",
        kpis: QUOTE_KPIS,
        buyerNote: {
          author: "Dana Morales · Morton – Riverside",
          body: "Hi Aaron, before we lock this in, could you add a small free sample of the Chai Post 6-pack for the team to try? Happy to confirm the order once we have.",
        },
        lines: QUOTE_LINES,
      },
    },
    {
      type: "text",
      content:
        "Anything you'd like to do with it? I can pull up what Riverside is entitled to order, or dig into their buying history.",
    },
  ],
};

/** Conversational beat — account history. Runs an account-360 skill (shown atop). */
const HISTORY: ScriptedResponse = {
  suggestions: [
    { label: "Check entitlement for free sample", prompt: "Which free samples is Morton entitled to?" },
    { label: "Show his top buyer accounts" },
    { label: "Compare to last year" },
  ],
  skill: "account-360",
  tools: [
    { name: "get_sor_detail", target: "merchant-order-management" },
    { name: "dispatch_readonly", target: "merchant-order-management" },
  ],
  thinking: [
    { label: "Pulling Morton's order history", delay: 1100 },
    { label: "Aggregating this year's orders", delay: 1200 },
    { label: "Summarizing spend by family", delay: 1000 },
  ],
  response: [
    {
      type: "text",
      content:
        "Here's **Morton's** spend this year, rolled up across all **3 buyer accounts**. **Riverside** carries just over half of it.",
    },
    {
      type: "slot",
      mode: "floating",
      app: SF,
      expandable: true,
      exportAs: { id: "spend", title: "Morton · Spend this year" },
      view: {
        kind: "chart",
        heading: "Morton spend this year",
        subtitle: "Year to date",
        kpis: SPEND_KPIS,
        caption: "Spend by buyer account",
        bars: SPEND_BY_ACCOUNT,
        // Expanding the chart opens the full account-360 report.
        report: {
          accounts: [
            { account: "Morton – Riverside", orders: "18", spend: "$214,500", share: "52%", lastOrder: "Sep 24" },
            { account: "Morton – Midtown", orders: "12", spend: "$121,700", share: "29%", lastOrder: "Sep 18" },
            { account: "Morton – Eastgate", orders: "7", spend: "$76,700", share: "19%", lastOrder: "Sep 2" },
          ],
          familiesCaption: "Spend by product family",
          families: SPEND_BY_FAMILY,
        },
      },
    },
    {
      type: "text",
      content:
        "They reorder like clockwork and lean heavily on **Alpine Energy**, so a small free sample on the Riverside quote is easy to justify.",
    },
  ],
};

/** Conversational beat — margin of the sample. No skill (Claude reasons directly). */
const MARGIN: ScriptedResponse = {
  suggestions: [
    { label: "Check entitlement for free sample", prompt: "Which free samples is Morton entitled to?" },
    { label: "Show the cost breakdown" },
    { label: "Compare to other samples" },
  ],
  thinking: [
    { label: "Estimating cost on the promo line", delay: 950 },
    { label: "Comparing against the quote total", delay: 900 },
  ],
  response: [
    {
      type: "text",
      content:
        "The free 6-pack has a **list value of $492.00**, but your real cost is much lower:\n" +
        "- Unit cost runs about **$7.80**, so **24 units ≈ $187** in COGS\n" +
        "- Against Morton's **$24,660.00** quote, that's well under **1%** of margin\n" +
        "- The billed total doesn't move, Morton still pays **$24,660.00**\n" +
        "Low-risk goodwill given their volume.",
    },
  ],
};

/**
 * Approval-policy beat is **muted** for this demo: per the PM, there's no real
 * checkable "does the seller need approval to modify a quote" policy, so we don't
 * want to imply one. The beat is kept (not deleted) behind this flag — flip to
 * `false` to restore it as a step. While muted, the policy keywords route to the
 * fallback (see getResponse) so an improvised prompt doesn't mis-fire elsewhere.
 */
const POLICY_MUTED = true;

/** Conversational beat — approval policy. No skill. Muted (see POLICY_MUTED). */
const POLICY: ScriptedResponse = {
  thinking: [{ label: "Checking your discount authority", delay: 1000 }],
  response: [
    {
      type: "text",
      content:
        "For a free sample this size, no separate sign-off is needed:\n" +
        "- Your role can apply **100% discounts** on promo lines up to **$1,000** in list value\n" +
        "- A sample like the Chai Post 6-pack runs about **$492.00** in list value, comfortably inside that limit\n" +
        "- The quote itself still needs the normal **quote approval** before it reaches Morton\n" +
        "So you're clear to add it. Want me to pull up what Riverside is entitled to, so you can add it from there?",
    },
  ],
};

/** Step 3 — /entitlement-check for a free sample: which entitled products could
 *  be added to the quote as a free gift (curated inline, full catalog on
 *  expand). Not checkout anywhere's "what can the buyer buy" catalog. */
const ENTITLEMENT: ScriptedResponse = {
  suggestions: [
    { label: "Add the Chai Post", prompt: "Add the Alpine Energy Drink Chai Post 0.5L PET – 6 pack as a free sample." },
    { label: "Why the Chai Post?" },
    { label: "Show the full catalog" },
  ],
  skill: "entitlement-check",
  tools: [
    { name: "dispatch_readonly", target: "merchant-catalog-management" },
    { name: "dispatch_readonly", target: "b2b-merchant-quote-management" },
    { name: "get_sor_detail", target: "promotion-management" },
  ],
  thinking: [
    { label: "Reading Riverside's entitlement policy", delay: 1100 },
    { label: "Finding products eligible as a free sample", delay: 1200 },
    { label: "Checking margin on each candidate", delay: 1100 },
    { label: "Keeping the ones that barely touch margin", delay: 900 },
    { label: "Matching them to the lines on quote 00000011", delay: 900 },
  ],
  response: [
    {
      type: "text",
      content:
        "**Morton – Riverside's** entitlement policy covers the full **Alpine Group** catalog. I'd add the **Chai Post 6-pack** as the free sample: Morton asked for it in his note, and it pairs with the Chai Pre already on quote **00000011**.\n" +
        "Margin check: I've listed only the samples that barely touch your margin, about **2%** of the quote total or less. The Chai Post costs you about **$187**, under **1%**.",
    },
    {
      type: "slot",
      mode: "inline-card",
      app: SF,
      expandable: true,
      footer: { meta: "Showing 5 of 100+ entitled products", link: "Open full catalog" },
      view: {
        kind: "entitlement",
        heading: "Eligible free samples",
        subtitle: "Morton – Riverside · All Access policy · B2B Standard price book",
        products: ENTITLED_PRODUCTS,
        inlineCount: 5,
        addLabel: "Add free sample",
      },
    },
    {
      type: "text",
      content: "Add the recommended sample right from the list, pick another, or tell me which product you had in mind.",
    },
  ],
};

/** /find-products — catalog search, same entitled set with add actions. */
const FIND_PRODUCTS: ScriptedResponse = {
  suggestions: [
    { label: "Check entitlement for free sample", prompt: "Which free samples is Morton entitled to?" },
    { label: "Search for something else" },
    { label: "Show the full catalog" },
  ],
  skill: "find-products",
  tools: [
    { name: "dispatch_readonly", target: "merchant-catalog-management" },
  ],
  thinking: [
    { label: "Searching the entitled catalog", delay: 1050 },
    { label: "Ranking matches", delay: 850 },
  ],
  response: [
    {
      type: "text",
      content:
        "Here are entitled products matching your search, all on **Morton's** price book. Add any as a free sample.",
    },
    {
      type: "slot",
      mode: "inline-card",
      app: SF,
      expandable: true,
      footer: { meta: "Showing 6 of 100+ entitled products", link: "Open full catalog" },
      view: {
        kind: "entitlement",
        heading: "Entitled products",
        subtitle: "Matching “Alpine Energy” · B2B Standard price book",
        products: ENTITLED_PRODUCTS,
        inlineCount: 6,
        addLabel: "Add free sample",
      },
    },
    { type: "text", content: "Pick one to add, or refine the search." },
  ],
};

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Step 4 — add a free sample. Claude rechecks the margin against the live quote
 * and says so in one line, then adds the line in the same turn. Built per
 * product, so a sample other than the recommended one gets its own numbers.
 */
function sampleAdd(product: ProductRow): ScriptedResponse {
  const price = Number(product.price.replace(/[$,]/g, ""));
  const list = price * SAMPLE_UNITS;
  const cost = Math.round(list * COST_RATIO);
  const share = (cost / QUOTE_TOTAL) * 100;
  const impact = share < 1 ? "under **1%**" : `about **${Math.round(share)}%**`;
  return {
    skill: "add-promo-line",
    tools: [
      { name: "get_sor_detail", target: "promotion-management" },
      { name: "dispatch_readonly", target: "b2b-merchant-quote-management" },
    ],
    thinking: [
      { label: "Re-reading quote 00000011 as it stands now", delay: 950 },
      { label: "Rechecking margin on the live totals", delay: 1050 },
    ],
    response: [
      {
        type: "text",
        // The recommended sample's cost was already stated, so only confirm it holds;
        // any other pick gets its own numbers.
        content: product.recommended
          ? `Rechecked against the live quote: nothing has changed, Morton still pays **${usd(QUOTE_TOTAL)}**, and the sample stays ${impact} of the total. Adding it now.`
          : `Rechecked against the live quote: ${SAMPLE_UNITS} units of this one cost you about **${usd(cost).replace(/\.00$/, "")}**, ${impact} of the total, and Morton still pays **${usd(QUOTE_TOTAL)}**. Low risk, so I'm adding it now.`,
      },
    ],
    then: sampleAdded(product),
  };
}

/** Step 4, second part — the free line goes on the quote. */
function sampleAdded(product: ProductRow): ScriptedResponse {
  const price = Number(product.price.replace(/[$,]/g, ""));
  const list = price * SAMPLE_UNITS;
  const line: LineRow = {
    id: "00000023",
    product: product.product,
    detail: product.family,
    qty: String(SAMPLE_UNITS),
    list: usd(list),
    discount: "100%",
    total: "$0.00",
    free: true,
  };
  return {
    suggestions: [
      { label: "Recheck the margin" },
      { label: "Undo the sample" },
      { label: "Preview as Morton" },
    ],
    tools: [{ name: "dispatch_readonly", target: "b2b-merchant-quote-management" }],
    thinking: [
      { label: "Adding the free line to the quote", delay: 1000 },
      { label: "Recalculating totals", delay: 1000 },
    ],
    writes: [
      {
        action: "Add the free sample to quote 00000011",
        target: "b2b-merchant-quote-management",
        result: `00000023 · ${SAMPLE_UNITS} units · $0.00`,
        records: [
          { op: "insert", object: "QuoteLineItem", name: "00000023", fields: `Quantity ${SAMPLE_UNITS} · ListPrice ${product.price} · Discount 100% · TotalPrice $0.00` },
          { op: "update", object: "Quote", name: "00000011", fields: `LineItemCount 2 → 3 · Discount $0.00 → −${usd(list)} · GrandTotal ${usd(QUOTE_TOTAL)}` },
        ],
      },
    ],
    response: [
      {
        type: "text",
        content: `Done. The free sample is on quote **00000011** as a **100% discount** line. Morton gets it at no charge and the billed total doesn't move.`,
      },
      {
        type: "slot",
        mode: "inline-card",
        app: SF,
        footer: { ...SF_LINK },
        view: {
          kind: "sample-result",
          heading: "Free sample added",
          subtitle: "Quote 00000011 · line 00000023",
          line,
          deltas: [
            { label: "Line items", before: "2", after: "3" },
            { label: "List subtotal", before: usd(QUOTE_TOTAL), after: usd(QUOTE_TOTAL + list) },
            { label: "Promotional discount", before: "$0.00", after: `−${usd(list)}` },
            { label: "Grand total", before: usd(QUOTE_TOTAL), after: usd(QUOTE_TOTAL), emphasize: true },
          ],
        },
      },
      {
        type: "text",
        content: "Want to leave Morton a note explaining the sample, or is this ready to approve?",
      },
    ],
  };
}

/** The product a free-sample request names (longest match wins), else Claude's pick. */
function sampleFor(p: string): ProductRow {
  const named = ENTITLED_PRODUCTS.filter((r) => !r.onQuote && p.includes(r.product.toLowerCase())).sort(
    (a, b) => b.product.length - a.product.length,
  )[0];
  return named ?? ENTITLED_PRODUCTS[0];
}

/** The note the /add-note skill drafts: the rep's line wrapped in a first-name
 *  greeting and sign-off, like any automated company message. `{name}`
 *  renders as a merge field. */
const NOTE_CARD: ScriptedResponse["response"][number] = {
  type: "slot",
  mode: "inline-card",
  app: SF,
  view: {
    kind: "note",
    heading: "Buyer note",
    headingPill: { label: "Visible to buyer", tone: "info" },
    title: "Your free sample",
    body: "Hi {name},\n\nAdded a free sample as per your request.\n\nBest,\nAaron | Team Alpine",
    audience: "Visible to buyer",
  },
};

/** Step 5 — attach a buyer-visible note (the /add-note skill). */
const ADD_NOTE: ScriptedResponse = {
  skill: "add-note",
  suggestions: [
    { label: "Approve the quote", prompt: "/approve-quote" },
    { label: "Edit the note" },
    { label: "Preview as Morton" },
  ],
  tools: [{ name: "get_sor_detail", target: "b2b-merchant-quote-management" }],
  thinking: [{ label: "Attaching a buyer-visible note", delay: 950 }],
  writes: [
    {
      action: "Attach the buyer note to quote 00000011",
      target: "b2b-merchant-quote-management",
      result: "Note · visible to buyer",
      records: [{ op: "insert", object: "Note", name: "Your free sample", fields: "ParentId Quote 00000011 · Visibility Buyer" }],
    },
  ],
  response: [
    {
      type: "text",
      content: "Attached. The note is on quote **00000011**, and **Morton – Riverside** will see it on the storefront.",
    },
    NOTE_CARD,
    {
      type: "text",
      content: "That's the quote squared away. Should I approve it now, or leave it in Draft for you to review?",
    },
  ],
};

/** Step 6 — approve directly (the /approve-quote skill). */
const APPROVE: ScriptedResponse = {
  skill: "approve-quote",
  suggestions: [
    { label: "Morton's spend this year", prompt: "How much has Morton ordered from us this year?" },
    { label: "Email Morton the quote" },
    { label: "Review the next quote" },
  ],
  tools: [{ name: "get_sor_detail", target: "b2b-merchant-quote-management" }],
  thinking: [{ label: "Running the approval workflow", delay: 1150 }],
  writes: [
    {
      action: "Approve quote 00000011",
      target: "b2b-merchant-quote-management",
      result: "00000011 · $24,660.00 · approved",
      records: [{ op: "update", object: "Quote", name: "00000011", fields: "Status Draft → Approved · ApprovedBy Aaron · ApprovedDate Today" }],
    },
  ],
  response: [
    { type: "text", content: "Quote **00000011** is **approved**." },
    {
      type: "slot",
      mode: "inline-card",
      app: SF,
      footer: { ...SF_LINK },
      view: {
        kind: "approval",
        heading: "Quote 00000011",
        subtitle: "Morton – Riverside",
        steps: ["Draft", "Needs Review", "Approved"],
        current: "Approved",
        facts: [
          { label: "Grand total", value: "$24,660.00" },
          { label: "Line items", value: "3, 1 free" },
          { label: "Approved by", value: "Aaron · today" },
        ],
      },
    },
    {
      type: "text",
      content:
        "It stays reversible. Morton's other buyer accounts still have pending quotes, **Midtown** (00000010) and **Eastgate** (00000009). Want to work those next?",
    },
  ],
};

/** Fallback when a prompt doesn't match a scripted beat. Kept graceful and
 *  specific (not a generic "I didn't get that") so an off-script prompt during a
 *  live demo still lands on something useful. Lists what's actually wired. */
const FALLBACK: ScriptedResponse = {
  suggestions: [
    { label: "Show pending quotes", prompt: "Pull up all the pending quotes for the Morton account." },
    { label: "What can you help with?" },
    { label: "Show Morton's account" },
  ],
  thinking: [{ label: "Working through the request", delay: 700 }],
  response: [
    {
      type: "text",
      content:
        "Let me keep us on **Morton's** quotes. Here's what I can do right now:\n" +
        "- Pull **pending quotes** across Morton's buyer accounts\n" +
        "- Open a **quote's details** and its line items\n" +
        "- Summarize Morton's **order history** for the year\n" +
        "- Check what a buyer is **entitled to buy**\n" +
        "- Add a **free sample** line, or attach a **buyer-visible note**\n" +
        "- **Approve** a quote\n" +
        "Which of those would you like?",
    },
  ],
};

/**
 * Match the typed prompt to a beat. Slash commands win; then the specific
 * conversational asks (history / margin / policy) before the structural quote
 * beats, since those share loose keywords ("quote", "add", "approval"). The demo
 * is linear, but matching (not a step counter) keeps it robust to rephrasing.
 */
function getResponse(prompt: string): ScriptedResponse {
  const p = prompt.toLowerCase();
  const has = (...terms: string[]) => terms.some((t) => p.includes(t));

  // Slash commands win.
  if (has("/entitlement-check")) return ENTITLEMENT;
  if (has("/find-products")) return FIND_PRODUCTS;
  if (has("/add-note")) return ADD_NOTE;
  if (has("/approve-quote")) return APPROVE;

  // Conversational asks — checked before the structural beats they'd collide with.
  if (has("order history", "ordered", "how much has", "bought", "spend", "spent", "purchas", "this year"))
    return HISTORY;
  if (has("margin", "profit", "cost of", "cost on", "how much does it cost")) return MARGIN;
  if (has("need approval", "require approval", "approval to", "allowed to", "authority", "policy", "sign off", "sign-off"))
    return POLICY_MUTED ? FALLBACK : POLICY;

  // Structural quote beats.
  if (has("detail", "line item")) return QUOTE_DETAIL;
  if (has("entitle", "entitled", "storefront", "eligible")) return ENTITLEMENT;
  if (has("free sample") || (has("add") && has("free"))) return sampleAdd(sampleFor(p));
  if (has("note")) return ADD_NOTE;
  if (has("approve", "approval")) return APPROVE;
  if (has("pending", "quotes", "quote", "review", "pull up", "morton", "help")) return QUOTE_LIST;

  return FALLBACK;
}

/** A bar chart as a report section (bars on a shared scale). */
const barsSection = (title: string, bars: ChartBar[]): InsightSection => ({
  type: "hbars",
  title,
  max: Math.max(...bars.map((b) => b.value)) * 1.1,
  rows: bars.map((b) => ({ label: b.label, value: b.value, display: b.display })),
});

/** The one PDF page behind each exportable card (`exportAs.id`). */
function reportPage(id: string): ReportPage {
  switch (id) {
    case "quote":
      return {
        title: "Quote 00000011",
        takeaway: "Draft for Morton – Riverside: 1,440 units on two lines, expiring Aug 21.",
        sections: [
          { type: "kpis", items: QUOTE_KPIS },
          {
            type: "table",
            title: "Line items",
            columns: [{ label: "Product" }, { label: "Qty", align: "right" }, { label: "List", align: "right" }, { label: "Total", align: "right" }],
            rows: QUOTE_LINES.map((l) => [l.product, { text: l.qty, muted: true }, { text: l.list, muted: true }, { text: l.total, strong: true }]),
          },
        ],
      };
    case "spend":
      return {
        title: "Morton spend this year",
        takeaway: "$412,900 across 37 orders; Riverside carries just over half.",
        sections: [
          { type: "kpis", items: SPEND_KPIS },
          barsSection("Spend by buyer account", SPEND_BY_ACCOUNT),
          barsSection("Spend by product family", SPEND_BY_FAMILY),
        ],
      };
    default:
      return {
        title: "Pending quotes",
        takeaway: "3 Draft quotes under the Morton org, $52,855 in total.",
        sections: [
          {
            type: "table",
            columns: [{ label: "Quote" }, { label: "Buyer account" }, { label: "Expires" }, { label: "Total", align: "right" }],
            rows: PENDING.map((q) => [{ text: q.number, strong: true }, q.buyer, { text: q.expires, muted: true }, q.total]),
          },
        ],
      };
  }
}

/** Beats triggered by an in-app button (no user bubble). */
function getAction(key: string): ScriptedResponse | undefined {
  const exp = parseExport(key);
  if (exp) return onePageExport(exp.title, reportPage(exp.id));
  return undefined;
}

/** The quote-management / approval journey (merchant works a buyer's quotes). */
export const quote: Experience = {
  id: "quote",
  title: copy.shell.experiences.quote,
  getResponse,
  getAction,
  dictations: [
    "Pull up all the pending quotes for the Morton account.",
    "Show me the details of the first pending quote, and list every line item on it.",
    "Which free samples is Morton entitled to?",
  ],
};
