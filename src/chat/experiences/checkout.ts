import type { CardApp, Kpi, LineRow, Pill, ProductRow, ReportPage, ScriptedResponse, SummaryRow, WriteRecord } from "../types";
import type { Experience } from "./types";
import { onePageExport, parseExport } from "./export";
import { copy } from "../../copy/copy";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  CHECKOUT ANYWHERE — order on behalf of a buyer (Salesforce Commerce, B2B)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * A sales rep / CSR places (and reorders) on behalf of a buyer; the resulting
 * cart and order attribute to the buyer. Buyer is Morton Breitenberg on the
 * Alpine B2B store, backed by the project-codey Headless 360 MCP.
 *
 * The scripted flow (rep working buyer Morton's order on Alpine B2B):
 *   1. free text  — "place an order on behalf of Morton"  → RESOLVE (context
 *      card), then in the same turn (`then`) ENTITLEMENT: the catalog he can buy,
 *      a checkbox table with "Add N to cart"
 *   2. tick products → "Add 3 to cart" (posts their names)  → addPicked
 *   3. the Energy Drink has flavors, so only it asks       → FLAVOR (product tiles)
 *   4. pick a flavor (tile button)                         → cartAsk (select)
 *      (no Energy Drink ticked → step 2 goes straight to cartAsk)
 *   5. "go ahead with a fresh cart"                        → cartBeat (summary)
 *   6. "proceed to checkout"                               → addressBeat (select)
 *   7. pick a shipping address (select menu)               → checkoutReview
 *   8. click "Place order" (in-app action)                 → placeOrder
 *   9. "full details on the order just placed"             → orderDetail
 *  11a. "reorder the same thing for Morton again"          → reorder(last order)
 *  11b. "Morton's successful orders this week"             → ordersBeat (Reorder
 *       buttons prefill `/reorder <number>`) → `/reorder <number>` → reorder(it)
 *       (bare `/reorder` with no number asks which order)
 *  12+. the reorder cart checks out like steps 6–8 → a new placed order, which
 *       then shows in the successful-orders list (3 past + those placed today)
 *
 * The journey keeps light `session` state (open cart, address, orders placed)
 * so the flow is end to end; it resets when the journey is restarted.
 *
 * Unlike quote management's /entitlement-check (which surfaces free-sample
 * candidates for a quote), this journey's /entitlement-check lists what the
 * buyer can BUY, priced on his contract.
 *
 * The interaction is a numbered pick-one `select` menu (vs quote mgmt's typed-
 * prompt + confirm-button). Tool calls are real project-codey Codey tools —
 * `discover`, `get_sor_detail`, `dispatch_readonly` (reads) — over the commerce
 * SORs, shown as the tool-call timeline atop each response (1–3 per beat).
 * Every write (the cart, the checkout session, the order) goes through
 * `dispatch_write` and plays as a "Writing to Salesforce" timeline with its
 * records. A pick in a card or the Place order button is the OK for its write;
 * /reorder, asked in a prompt, asks first. Climax: the rep completes a PO-based checkout on
 * behalf, order attributed to the buyer.
 *
 * HOUSE STYLE: no em dashes; no AI filler; lead with the payload; realistic
 * synthetic data; **bold** the things a rep scans for (buyer, store, order #,
 * totals). MessageBubble renders `**bold**` and `- ` bullets.
 */

/** The MCP app identity for every slot header: Salesforce logo + name. */
const SF: CardApp = { name: "Salesforce Commerce", badge: "SF", logo: "/salesforce.svg" };

/** A "View in Salesforce" footer link. */
const SF_LINK = { link: "View in Salesforce" };

/* ── Canonical synthetic data ─────────────────────────────────────────── */

/** Page 1 of the entitled catalog Morton can buy on Alpine B2B, at his
 *  contract price (list in the cart: e.g. Energy Drink $24.99 → $20.50). */
const CATALOG_PAGE: ProductRow[] = [
  { product: "Alpine Energy Drink 0.5L PET – 6 pack", family: "Alpine Energy", price: "$20.50", listPrice: "$24.99" },
  { product: "Alpine Energy Eco Pod – 12 pack", family: "Alpine Energy", price: "$11.50", listPrice: "$13.50" },
  { product: "GoBrew Moca MCT + Protein – 6 pack", family: "Alpine Blends", price: "$11.49", listPrice: "$13.99" },
  { product: "GoBar Protein Bar – 12 pack", family: "Alpine Blends", price: "$14.75", listPrice: "$18.00" },
  { product: "GoGoo Hydration Gel – 24 pack", family: "Alpine Hydrate", price: "$17.25", listPrice: "$21.00" },
  { product: "Alpine Hardware Starter Kit", family: "Alpine Gear", price: "$64.00", listPrice: "$72.00" },
];

/** One product line on a cart / order, in numbers (rows + totals derive from
 *  these so every cart, review, confirmation, and detail stays consistent). */
interface Line {
  sku: string;
  product: string;
  qty: number;
  /** Unit list price. */
  list: number;
  /** Unit contract price (Morton's price book). */
  price: number;
}

/** A shipping address on Morton's account. */
interface Address {
  name: string;
  street: string;
}

/** A successful order of Morton's — a past one, or one placed this session. */
interface Order {
  number: string;
  placed: string;
  status: Pill;
  lines: Line[];
  shipTo: Address;
  po: string;
  shippingGroup: string;
  /** The order this one was reordered from, if any. */
  reorderOf?: string;
}

const DELIVERY = 11.99;
/** FedEx Delivery 1's delivery window. */
const ARRIVES = "3–5 business days";
const usd = (n: number) => `$${n.toFixed(2)}`;
const units = (lines: Line[]) => lines.reduce((n, l) => n + l.qty, 0);
const listSum = (lines: Line[]) => lines.reduce((n, l) => n + l.list * l.qty, 0);
const subtotal = (lines: Line[]) => lines.reduce((n, l) => n + l.price * l.qty, 0);
const orderTotal = (lines: Line[]) => subtotal(lines) + DELIVERY;
const lineCount = (lines: Line[]) => `${lines.length} ${lines.length === 1 ? "line" : "lines"} · ${units(lines)} units`;

/** Line rows for the cart / detail tables. */
const rows = (lines: Line[]): LineRow[] =>
  lines.map((l) => ({
    id: l.sku,
    product: l.product,
    detail: `SKU ${l.sku}`,
    qty: String(l.qty),
    list: usd(l.list),
    discount: `–${usd((l.list - l.price) * l.qty)}`,
    total: usd(l.price * l.qty),
  }));

/** Cart totals: list struck through, the contract discount, the cart subtotal. */
const cartTotals = (lines: Line[]): SummaryRow[] => [
  { label: "List subtotal", value: usd(listSum(lines)), strike: true },
  { label: "Contract discount", value: `–${usd(listSum(lines) - subtotal(lines))}` },
  { label: "Cart subtotal", value: usd(subtotal(lines)), emphasize: true },
];

/** "2x Alpine Energy Drink Chai Pre" for one line, else "3 lines · 9 units". */
const itemsSummary = (lines: Line[]) =>
  lines.length === 1 ? `${lines[0].qty}x ${lines[0].product.replace(/ 0\.5L PET – 6 pack$/, "")}` : lineCount(lines);

/** An address on two lines (name, then street) for the fact lists. */
const twoLine = (a: Address) => `${a.name}\n${a.street}`;

/** An order's headline figures (order detail card + its PDF). */
const orderKpis = (o: Order): Kpi[] => [
  { label: "Order total", value: usd(orderTotal(o.lines)), detail: `Incl. ${usd(DELIVERY)} delivery` },
  { label: "Units", value: String(units(o.lines)), detail: o.lines.length === 1 ? "1 line" : `${o.lines.length} lines` },
  { label: "Purchase order", value: o.po, detail: "Invoiced to the account" },
];

/** Units of each ticked product that go in the cart. */
const QTY = 2;

/** The cart line behind each catalog row, with the words that name it in a
 *  typed prompt. The Energy Drink is a family: its line comes from a flavor. */
const CATALOG_LINES: { match: string; line?: Line }[] = [
  { match: "energy drink" },
  { match: "eco pod", line: { sku: "6020014", product: "Alpine Energy Eco Pod – 12 pack", qty: QTY, list: 13.5, price: 11.5 } },
  { match: "gobrew", line: { sku: "6030021", product: "GoBrew Moca MCT + Protein – 6 pack", qty: QTY, list: 13.99, price: 11.49 } },
  { match: "gobar", line: { sku: "6040008", product: "GoBar Protein Bar – 12 pack", qty: QTY, list: 18, price: 14.75 } },
  { match: "gogoo", line: { sku: "6050003", product: "GoGoo Hydration Gel – 24 pack", qty: QTY, list: 21, price: 17.25 } },
  { match: "hardware", line: { sku: "6060001", product: "Alpine Hardware Starter Kit", qty: QTY, list: 72, price: 64 } },
];

/** The Energy Drink's flavors, each its own SKU at the same contract price. */
const FLAVORS: Record<"chai" | "green tea" | "tart cherry", Line> = {
  chai: { sku: "6010010", product: "Alpine Energy Drink Chai 0.5L PET – 6 pack", qty: QTY, list: 24.99, price: 20.5 },
  "green tea": { sku: "6010013", product: "Alpine Energy Drink Green Tea 0.5L PET – 6 pack", qty: QTY, list: 24.99, price: 20.5 },
  "tart cherry": { sku: "6010016", product: "Alpine Energy Drink Tart Cherry 0.5L PET – 6 pack", qty: QTY, list: 24.99, price: 20.5 },
};

/** The demo's pick: the first three rows, Energy Drink in Chai. Also the cart
 *  when a step is reached without picking (e.g. a bare /add-to-cart). */
const DEFAULT_PICK: Line[] = [FLAVORS.chai, CATALOG_LINES[1].line!, CATALOG_LINES[2].line!];

/** "GoBrew Moca MCT + Protein" from "GoBrew Moca MCT + Protein – 6 pack". */
const shortName = (l: Line) => l.product.replace(/ – .*$/, "");
/** "A", "A and B", "A, B and C". */
const andList = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}` : xs[0] ?? "");

const ADDRESSES: Record<"shirley" | "sylvan" | "billing", Address> = {
  shirley: { name: "Shirley", street: "7052 Jayson Road, Norwalk, MS 68744" },
  sylvan: { name: "Sylvan", street: "418 Sylvan Avenue, Norwalk, MS 68744" },
  billing: { name: "Billing address", street: "7052 Jayson Road, Norwalk, MS 68744" },
};

/** Morton's earlier successful orders this week (a cancelled one is filtered
 *  out). Orders placed during the demo are prepended to these. */
const PAST_ORDERS: Order[] = [
  {
    number: "QJRTA-WMBKE-HXLDP-NAUVC",
    placed: "2 days ago",
    status: { label: "Shipped", tone: "info" },
    lines: [
      { sku: "6020014", product: "Alpine Energy Eco Pod – 12 pack", qty: 4, list: 13.5, price: 11.5 },
      { sku: "6030021", product: "GoBrew Moca MCT + Protein – 6 pack", qty: 3, list: 13.99, price: 11.49 },
      { sku: "6010014", product: "Alpine Energy Drink Green Tea During 0.5L PET – 6 pack", qty: 2, list: 24.99, price: 20.5 },
    ],
    shipTo: ADDRESSES.shirley,
    po: "PO121",
    shippingGroup: "#00000148",
  },
  {
    number: "ZPLKE-RTNVA-CQOWM-BYDSF",
    placed: "5 days ago",
    status: { label: "Fulfilled", tone: "success" },
    lines: [
      { sku: "6040008", product: "GoBar Protein Bar – 12 pack", qty: 5, list: 18, price: 14.75 },
      { sku: "6050003", product: "GoGoo Hydration Gel – 24 pack", qty: 2, list: 21, price: 17.25 },
    ],
    shipTo: ADDRESSES.sylvan,
    po: "PO119",
    shippingGroup: "#00000143",
  },
];

/** Morton's active cart from an earlier session (step 4 clears or keeps it),
 *  then the carts created this session, in order. */
const ACTIVE_CART = "0a6Wx000001aQ9T";
const NEW_CART_IDS = ["0a6Wx000001aRkQ", "0a6Wx000001aS3V", "0a6Wx000001aT7M", "0a6Wx000001aU2P"];
/** A cart's checkout session (same record suffix, its own key prefix). */
const checkoutId = (cart: string) => `2z9${cart.slice(3)}`;

/** A cart's lines as CartItem inserts. */
const cartItems = (lines: Line[]): WriteRecord[] =>
  lines.map((l) => ({ op: "insert", object: "CartItem", name: shortName(l), fields: `Sku ${l.sku} · Quantity ${l.qty} · SalesPrice ${usd(l.price)}` }));

/** Order numbers handed out in sequence as orders are placed this session. The
 *  first is the one from the recorded demo. */
const NEW_ORDER_NUMBERS = [
  "MIXOZ-FKSNI-ETRZN-OWHOH",
  "TQWEB-NLKRA-PVZXO-HUMDE",
  "GHAVF-RYOQT-MZLWE-KCJUN",
  "PUXEL-DWQIA-BVNRS-TOYZK",
];

/**
 * Session state — the one place this journey remembers across beats, so the
 * flow is end to end: the products picked, the open cart (a fresh or a reorder cart), the
 * address picked, and the orders placed so far (newest first). Cleared by
 * `reset()` whenever the journey is (re)started from the sidenav.
 */
const session = {
  /** Lines ticked in the catalog, waiting for the cart (the Energy Drink joins
   *  once its flavor is picked). */
  picked: [] as Line[],
  cart: null as Line[] | null,
  /** Source order of the open cart, when it's a reorder cart. */
  cartFrom: undefined as string | undefined,
  /** The open cart's record id, and how many carts this session created. */
  cartId: ACTIVE_CART,
  carts: 0,
  shipTo: ADDRESSES.shirley,
  placed: [] as Order[],
};

/** Hand out the next new cart id. */
function newCart(): string {
  session.cartId = NEW_CART_IDS[session.carts % NEW_CART_IDS.length];
  session.carts += 1;
  return session.cartId;
}

function reset() {
  session.picked = [];
  session.cart = null;
  session.cartFrom = undefined;
  session.cartId = ACTIVE_CART;
  session.carts = 0;
  session.shipTo = ADDRESSES.shirley;
  session.placed = [];
}

/** Every successful order this week, newest first. */
const allOrders = () => [...session.placed, ...PAST_ORDERS];
/** The last order placed (this session, else the newest past one). */
const lastOrder = () => allOrders()[0];
/** The next PO number (PO123 for the first order placed). */
const nextPo = () => `PO${123 + session.placed.length}`;

/** Find an order referenced in a prompt (by its first segment, so "/reorder
 *  QJRTA" works as well as the full number). */
function findOrder(p: string): Order | undefined {
  return allOrders().find((o) => p.includes(o.number.slice(0, 5).toLowerCase()));
}

/* ── Beats ────────────────────────────────────────────────────────────── */

/** Step 1, part 2 (and /entitlement-check on its own) — what Morton can BUY:
 *  his entitled catalog at contract price, as a checkbox table. Ticking rows
 *  and hitting "Add N to cart" posts their names. Not quote mgmt's free sample
 *  check. */
const ENTITLEMENT: ScriptedResponse = {
  skill: "entitlement-check",
  tools: [
    { name: "get_sor_detail", target: "buyer-product-discovery" },
    { name: "dispatch_readonly", target: "buyer-product-discovery" },
  ],
  thinking: [
    { label: "Reading the entitlement policy on Morton's buyer group", delay: 1100 },
    { label: "Loading the products he can buy", delay: 1000 },
    { label: "Applying his contract prices", delay: 900 },
  ],
  response: [
    {
      type: "text",
      content:
        "Morton's buyer group is entitled to the full **Alpine Group** catalog, **150 products**, all priced on his contract price book. Here's page 1 of 25.",
    },
    {
      type: "slot",
      mode: "inline-card",
      app: SF,
      expandable: true,
      footer: { meta: "Showing 6 of 150 entitled products · page 1 of 25", link: "Open full catalog" },
      view: {
        kind: "entitlement",
        heading: "Entitled products",
        subtitle: "Alpine Group catalog · contract price beside list",
        products: CATALOG_PAGE,
        inlineCount: 6,
        cartPicker: { prompt: "Add these to Morton's cart:" },
      },
    },
    {
      type: "text",
      content: `Tick what Morton needs and hit **Add to cart**. I'll add **${QTY} of each**.`,
    },
  ],
};

/** Step 1 — resolve the store + buyer context (order will attribute to Morton).
 *  The context card is the intermediary step: Claude keeps going in the same
 *  turn and runs the entitlement check, so the rep lands on what Morton can buy. */
const RESOLVE: ScriptedResponse = {
  skill: "order-on-behalf",
  tools: [
    { name: "discover", target: "commerce SORs" },
    { name: "dispatch_readonly", target: "b2b-store-setup" },
    { name: "dispatch_readonly", target: "buyer-profile-management" },
  ],
  thinking: [
    { label: "Starting the order-on-behalf workflow", delay: 900 },
    { label: "Resolving the Alpine B2B store", delay: 1100 },
    { label: "Looking up Morton's buyer context", delay: 1050 },
  ],
  response: [
    {
      type: "text",
      content:
        "I resolved the store and **Morton Breitenberg's** buyer context on **Alpine B2B**. Any cart and order I create will attribute to Morton, not to you. Checking what he can buy next.",
    },
    {
      type: "slot",
      mode: "inline-card",
      app: SF,
      footer: { meta: "Store 0ZER00000004C9y · Account 001SG00001xM4bT", ...SF_LINK },
      view: {
        kind: "context",
        heading: "Morton Breitenberg",
        subtitle: "Buyer on Alpine B2B",
        fields: [
          { label: "Email", value: "Morton.Breitenberg10@1695911415110.leonie.com" },
          { label: "Account", value: "B2B Business Account" },
          { label: "Entitlement", value: "All Access" },
          { label: "Price book", value: "Morton Contract" },
          { label: "Payment", value: "PO number only" },
        ],
        note: "Acting as the buyer, so pricing, entitlements, and the order history all follow Morton's contract.",
      },
    },
  ],
  then: ENTITLEMENT,
};

/** Step 3 — the Energy Drink is a family, so only it asks which flavor, as
 *  product tiles with shots from `public/products/alpine-energy-drinks-product-images/`
 *  (the `tint` shows while an image loads or if one is missing). */
function flavorBeat(others: Line[]): ScriptedResponse {
  const ready = others.length
    ? `${andList(others.map((l) => `**${shortName(l)}**`))} ${others.length === 1 ? "is" : "are"} ready to go in. `
    : "";
  return {
    skill: "find-products",
    tools: [{ name: "dispatch_readonly", target: "buyer-product-discovery" }],
    thinking: [{ label: "Loading Alpine Energy Drink flavors", delay: 950 }],
    response: [
      {
        type: "text",
        content: `${ready}**Alpine Energy Drink 0.5L PET 6-pack** comes in three flavors, each at **$20.50** on Morton's contract. Which one?`,
      },
      {
        type: "slot",
        mode: "inline-carousel",
        app: SF,
        tiles: [
          { name: "Alpine Energy Drink Chai", detail: "0.5L PET · 6 pack · SKU 6010010", price: "$20.50", listPrice: "$24.99", tint: "#F1E6D6", image: "/products/alpine-energy-drinks-product-images/chai.webp", prompt: "Flavor: Chai" },
          { name: "Alpine Energy Drink Green Tea", detail: "0.5L PET · 6 pack · SKU 6010013", price: "$20.50", listPrice: "$24.99", tint: "#E3EEDB", image: "/products/alpine-energy-drinks-product-images/green-tea.webp", prompt: "Flavor: Green Tea" },
          { name: "Alpine Energy Drink Tart Cherry", detail: "0.5L PET · 6 pack · SKU 6010016", price: "$20.50", listPrice: "$24.99", tint: "#F4DFE2", image: "/products/alpine-energy-drinks-product-images/tart-cherry.webp", prompt: "Flavor: Tart Cherry" },
        ],
      },
    ],
  };
}

/** Step 4 — Morton has an active cart; fresh or keep? */
function cartAsk(): ScriptedResponse {
  const lines = session.picked.length ? session.picked : DEFAULT_PICK;
  const what = lines.length === 1 ? "this line" : `these **${lines.length} lines**`;
  return {
    skill: "add-to-cart",
    tools: [{ name: "dispatch_readonly", target: "buyer-cart-management" }],
    thinking: [{ label: "Checking Morton's active cart", delay: 1000 }],
    response: [
      {
        type: "text",
        content: `Morton already has an **active cart** with items from an earlier session. I can clear it and start fresh with ${what}, or add ${lines.length === 1 ? "it" : "them"} to the existing cart.`,
      },
      {
        type: "slot",
        mode: "inline-card",
        app: SF,
        view: {
          kind: "select",
          heading: "Morton has an active cart",
          options: [
            { label: "Go ahead with a fresh cart", detail: "Delete the active cart and create a new one", prompt: "Go ahead with a fresh cart" },
            { label: "Keep the existing cart", detail: "Add these lines to Morton's active cart", prompt: "Keep the existing cart and add the lines" },
          ],
        },
      },
    ],
  };
}

/** Step 2 — the ticked products (or ones named in a typed prompt). The Energy
 *  Drink needs a flavor first; everything else waits in `session.picked`. */
function addPicked(p: string): ScriptedResponse {
  const hits = CATALOG_LINES.filter((c) => p.includes(c.match));
  if (!hits.length) {
    session.picked = DEFAULT_PICK.slice(1);
    return flavorBeat(session.picked);
  }
  session.picked = hits.flatMap((c) => (c.line ? [c.line] : []));
  return hits.some((c) => !c.line) ? flavorBeat(session.picked) : cartAsk();
}

/** Step 3 → 4 — the flavor joins the picked lines (first, as in the catalog). */
function pickFlavor(p: string): ScriptedResponse {
  const flavor = p.includes("green tea") ? FLAVORS["green tea"] : p.includes("tart cherry") ? FLAVORS["tart cherry"] : FLAVORS.chai;
  session.picked = [flavor, ...session.picked.filter((l) => !l.product.startsWith("Alpine Energy Drink"))];
  return cartAsk();
}

/** Step 5 — the cart, repriced on Morton's contract: a fresh one (the active
 *  cart deleted) or the lines added to the active cart. */
function cartBeat(fresh: boolean): ScriptedResponse {
  const lines = session.picked.length ? session.picked : DEFAULT_PICK;
  session.cart = lines;
  session.cartFrom = undefined;
  const cart = fresh ? newCart() : (session.cartId = ACTIVE_CART);
  const what = lines.length === 1 ? `**${lines[0].qty}x ${shortName(lines[0])}**` : `**${lines.length} lines**, ${QTY} of each`;
  return {
    suggestions: [
      { label: "Proceed to checkout", prompt: "Proceed to checkout" },
      { label: "Change quantities" },
      { label: "Apply a discount" },
    ],
    skill: "add-to-cart",
    tools: [{ name: "dispatch_readonly", target: "buyer-cart-management" }],
    thinking: [
      { label: "Repricing on Morton's contract", delay: 1050 },
      { label: fresh ? "Creating a fresh cart for Morton" : "Opening Morton's active cart", delay: 900 },
    ],
    writes: [
      ...(fresh
        ? [
            {
              action: "Clear Morton's active cart",
              target: "buyer-cart-management",
              result: `${ACTIVE_CART} · deleted`,
              records: [{ op: "delete" as const, object: "WebCart", name: ACTIVE_CART, fields: "Status Active · 2 items from an earlier session" }],
            },
          ]
        : []),
      {
        action: fresh ? `Create a fresh cart with ${lineCount(lines)}` : `Add ${lineCount(lines)} to Morton's active cart`,
        target: "buyer-cart-management",
        result: `${cart} · ${usd(subtotal(lines))}${fresh ? "" : " added"}`,
        records: [
          ...(fresh
            ? [{ op: "insert" as const, object: "WebCart", name: cart, fields: "Account Morton Breitenberg · Store Alpine B2B · Status Active" }]
            : []),
          ...cartItems(lines),
        ],
      },
    ],
    response: [
      {
        type: "text",
        content: fresh
          ? `Done. Fresh cart created for **Morton** with ${what}, repriced on his contract. He saves **${usd(listSum(lines) - subtotal(lines))}** off list.`
          : `Done. Added ${what} to **Morton's** active cart, repriced on his contract. He saves **${usd(listSum(lines) - subtotal(lines))}** off list.`,
      },
      {
        type: "slot",
        mode: "inline-card",
        app: SF,
        footer: { meta: "Cart attributed to Morton Breitenberg", ...SF_LINK },
        view: {
          kind: "cart",
          heading: "Cart",
          lines: rows(lines),
          totals: cartTotals(lines),
          action: { label: "Proceed to checkout", sendPrompt: "Proceed to checkout" },
        },
      },
      {
        type: "text",
        content: "Checkout on this store is **PO number** payment only. Ready to proceed?",
      },
    ],
  };
}

/** Step 6 — start checkout, show Morton's shipping addresses. The one he
 *  ships to most carries a Frequently used pill. */
const addressBeat = (): ScriptedResponse => ({
  skill: "checkout",
  tools: [{ name: "dispatch_readonly", target: "buyer-profile-management" }],
  thinking: [
    { label: "Loading Morton's saved addresses", delay: 1000 },
    { label: "Starting a checkout session", delay: 800 },
  ],
  writes: [
    {
      action: "Start a checkout session for the cart",
      target: "buyer-checkout",
      result: `${checkoutId(session.cartId)} · started`,
      records: [{ op: "insert", object: "CartCheckoutSession", name: checkoutId(session.cartId), fields: `WebCart ${session.cartId} · State Start` }],
    },
  ],
  response: [
    {
      type: "text",
      content: "Checkout session is open. Which of Morton's **shipping addresses** should I use? He ships to **Shirley** most often.",
    },
    {
      type: "slot",
      mode: "inline-card",
      app: SF,
      view: {
        kind: "select",
        heading: "Shipping address",
        options: [
          { label: "Shirley", detail: "7052 Jayson Road, Norwalk, MS 68744", pill: { label: "Frequently used", tone: "info" }, prompt: "Ship to Shirley at 7052 Jayson Road" },
          { label: "Sylvan", detail: "418 Sylvan Avenue, Norwalk, MS 68744", prompt: "Ship to Sylvan at 418 Sylvan Avenue" },
          { label: "Billing address", detail: "7052 Jayson Road, Norwalk, MS 68744", prompt: "Ship to the billing address" },
        ],
      },
    },
  ],
});

/** Step 7 — checkout review for the open cart: address applied, delivery +
 *  payment inferred, "Place order" button. Works for the step-5 cart and for a
 *  reorder cart alike. */
function checkoutReview(p: string): ScriptedResponse {
  session.shipTo = p.includes("sylvan") ? ADDRESSES.sylvan : p.includes("billing") ? ADDRESSES.billing : ADDRESSES.shirley;
  const lines = session.cart ?? DEFAULT_PICK;
  session.cart = lines;
  const po = nextPo();
  return {
    suggestions: [
      { label: "Place the order", action: "place-order" },
      { label: "Change the PO number" },
      { label: "Pick faster shipping" },
    ],
    skill: "checkout",
    tools: [{ name: "dispatch_readonly", target: "buyer-checkout" }],
    thinking: [
      { label: "Comparing delivery methods", delay: 1050 },
      { label: "Applying the address, delivery and PO", delay: 900 },
    ],
    writes: [
      {
        action: "Set shipping, delivery and payment",
        target: "buyer-checkout",
        result: `${po} · ${usd(orderTotal(lines))}`,
        records: [
          { op: "update", object: "CartDeliveryGroup", name: session.shipTo.name, fields: `DeliverToStreet ${session.shipTo.street.split(",")[0]} · DeliveryMethod FedEx Delivery 1 (${usd(DELIVERY)})` },
          { op: "update", object: "CartCheckoutSession", name: checkoutId(session.cartId), fields: `PaymentMethod Purchase order · PoNumber ${po} · State Ready` },
        ],
      },
    ],
    response: [
      {
        type: "text",
        content: `Address applied. I auto-selected the cheapest delivery (**FedEx Delivery 1**, ${usd(DELIVERY)} of 3 options) and set **PO number** payment with **${po}**. Here's the order before I place it.`,
      },
      {
        type: "slot",
        mode: "inline-card",
        app: SF,
        view: {
          kind: "context",
          heading: session.cartFrom ? "Review reorder" : "Review order",
          fields: [
            { label: "Ship to", value: twoLine(session.shipTo) },
            { label: "Delivery", value: `FedEx Delivery 1 (${usd(DELIVERY)})` },
            { label: "Payment", value: `Purchase order ${po}` },
            { label: "Items", value: itemsSummary(lines) },
            ...(session.cartFrom ? [{ label: "Reorder of", value: session.cartFrom, mono: true }] : []),
            { label: "Order total", value: usd(orderTotal(lines)), strong: true },
          ],
          note: "Placing this submits the order as Morton Breitenberg on Alpine B2B.",
          action: { label: "Place order", actionKey: "place-order" },
        },
      },
    ],
  };
}

/** Step 8 — place the open cart as an order (in-app action, no user bubble).
 *  The order joins this week's successful orders. No open cart → no-op (the
 *  review card's button was already used). */
function placeOrder(): ScriptedResponse | undefined {
  const lines = session.cart;
  if (!lines) return undefined;
  const order: Order = {
    number: NEW_ORDER_NUMBERS[session.placed.length] ?? `ORD${String(session.placed.length).padStart(3, "0")}-NEW`,
    placed: "Today",
    status: { label: "Confirmed", tone: "success" },
    lines,
    shipTo: session.shipTo,
    po: nextPo(),
    shippingGroup: `#${String(151 + session.placed.length).padStart(8, "0")}`,
    reorderOf: session.cartFrom,
  };
  const cartId = session.cartId;
  session.placed = [order, ...session.placed];
  session.cart = null;
  session.cartFrom = undefined;
  return {
    suggestions: [
      { label: "Open this order", prompt: "Give me full details on the order just placed" },
      { label: "Email Morton the receipt" },
      { label: "Track the shipment" },
    ],
    skill: "checkout",
    tools: [{ name: "dispatch_readonly", target: "buyer-order-management" }],
    thinking: [{ label: "Submitting the order", delay: 1000 }],
    writes: [
      {
        action: `Place order ${order.number} for Morton`,
        target: "buyer-checkout",
        result: `${order.number.slice(0, 5)} · ${usd(orderTotal(lines))} · confirmed`,
        records: [
          { op: "insert", object: "Order", name: order.number.slice(0, 5), fields: `Account Morton Breitenberg · PoNumber ${order.po} · TotalAmount ${usd(orderTotal(lines))} · Status Confirmed` },
          ...lines.map((l): WriteRecord => ({ op: "insert", object: "OrderItem", name: shortName(l), fields: `Sku ${l.sku} · Quantity ${l.qty} · UnitPrice ${usd(l.price)}` })),
          { op: "update", object: "WebCart", name: cartId, fields: "Status Active → Closed" },
        ],
      },
    ],
    response: [
      {
        type: "text",
        content: order.reorderOf
          ? `Reorder placed on behalf of **Morton Breitenberg**. Order **${order.number}** repeats **${order.reorderOf}** and is attributed to his account.`
          : "Order placed on behalf of **Morton Breitenberg**. It's confirmed and attributed to his account.",
      },
      {
        type: "slot",
        mode: "inline-card",
        app: SF,
        footer: { ...SF_LINK },
        view: {
          kind: "order-confirm",
          heading: order.reorderOf ? "Reorder confirmed" : "Order confirmed",
          orderNumber: order.number,
          fields: [
            { label: "Buyer", value: "Morton Breitenberg" },
            // Placed by the rep from Alpine, on Morton's behalf.
            { label: "Ordered by", value: `${copy.shell.account.name} from Alpine (${copy.shell.account.email})\non behalf of Morton Breitenberg` },
            { label: "Store", value: "Alpine B2B" },
            { label: "Ship to", value: twoLine(order.shipTo) },
            { label: "Delivery", value: `FedEx Delivery 1 · arrives in ${ARRIVES}` },
            { label: "Purchase order", value: order.po },
            ...(order.reorderOf ? [{ label: "Reorder of", value: order.reorderOf, mono: true }] : []),
            { label: "Order total", value: usd(orderTotal(order.lines)), strong: true },
          ],
        },
      },
      {
        type: "text",
        content: order.reorderOf
          ? "It now shows in Morton's successful orders this week. Want the full details?"
          : "Want the full order details, or should I set up a reorder for Morton?",
      },
    ],
  };
}

/** Step 9 — detailed lookup of an order (one named in the prompt, else the
 *  last order placed). */
function orderDetail(o: Order): ScriptedResponse {
  return {
    suggestions: [
      { label: "See Morton's orders this week", prompt: "Show me Morton's successful orders this week" },
      { label: "Download the invoice" },
      { label: "Change the ship date" },
    ],
    tools: [{ name: "dispatch_readonly", target: "buyer-order-management" }],
    thinking: [
      { label: `Opening order ${o.number}`, delay: 1000 },
      { label: "Loading line items and totals", delay: 1000 },
    ],
    response: [
      { type: "text", content: `Here's the full detail on order **${o.number}**.` },
      {
        type: "slot",
        mode: "inline-card",
        app: SF,
        footer: { meta: `Shipping group ${o.shippingGroup}`, ...SF_LINK },
        exportAs: { id: `order:${o.number}`, title: `Order ${o.number}` },
        view: {
          kind: "order-detail",
          heading: `Order ${o.number}`,
          headingPill: o.status,
          subtitle: `Placed ${o.placed.toLowerCase()} · Morton Breitenberg on Alpine B2B`,
          kpis: orderKpis(o),
          // Orders placed in this chat were placed by the rep, on Morton's behalf.
          ...(session.placed.includes(o)
            ? { placedBy: { name: copy.shell.account.name, email: copy.shell.account.email, initial: copy.shell.account.initial, onBehalfOf: "Morton Breitenberg" } }
            : {}),
          fields: [
            { label: "Ship to", value: twoLine(o.shipTo) },
            { label: "Delivery", value: "FedEx Delivery 1" },
            ...(o.reorderOf ? [{ label: "Reorder of", value: o.reorderOf, mono: true }] : []),
          ],
          lines: rows(o.lines),
          totals: [
            { label: "Products", value: usd(subtotal(o.lines)) },
            { label: "Delivery", value: usd(DELIVERY) },
            { label: "Tax", value: "$0.00" },
            { label: "Order total", value: usd(orderTotal(o.lines)), emphasize: true },
          ],
        },
      },
      {
        type: "text",
        content: o.reorderOf
          ? "Anything else for Morton? I can pull up all his successful orders this week."
          : "Want me to reorder the same thing for Morton, or pull up his other orders from this week?",
      },
    ],
  };
}

/** Step 11b — Morton's successful orders this week (past + placed this
 *  session). Each row's Reorder button prefills `/reorder <number>` into the
 *  prompt box (the rep presses Enter). Bare `/reorder` asks which order. */
function ordersBeat(pick: boolean): ScriptedResponse {
  const orders = allOrders();
  const n = orders.length;
  const placedNote = session.placed.length
    ? session.placed.length === 1
      ? ", including the one we just placed"
      : `, including the ${session.placed.length} we placed today`
    : "";
  return {
    // "Which order?" asks in its card, so it ends with just the logo.
    suggestions: pick
      ? undefined
      : [
          { label: "Show cancelled orders" },
          { label: "Compare these orders" },
          { label: "Export this list" },
        ],
    skill: pick ? "reorder" : undefined,
    tools: [{ name: "dispatch_readonly", target: "buyer-order-management" }],
    thinking: [
      { label: "Pulling Morton's orders from this week", delay: 1050 },
      { label: "Filtering to successful orders", delay: 900 },
    ],
    response: [
      {
        type: "text",
        content: pick
          ? `Which order should I reorder for Morton? Here are his **${n} successful orders** this week. Hit **Reorder** on a row, or run **/reorder** with its order number.`
          : `Morton has **${n} successful orders** this week on **Alpine B2B**${placedNote}. Hit **Reorder** on any row, or run **/reorder** with an order number.`,
      },
      {
        type: "slot",
        mode: "inline-card",
        app: SF,
        footer: { ...SF_LINK },
        exportAs: { id: "orders", title: "Morton · Successful orders this week" },
        view: {
          kind: "order-list",
          heading: "Successful orders this week",
          subtitle: `Alpine B2B · ${n} orders, 1 cancelled one hidden`,
          rows: orders.map((o) => ({
            number: o.number,
            placed: o.placed,
            items: lineCount(o.lines),
            total: usd(orderTotal(o.lines)),
            status: o.status,
            reorderPrefill: `/reorder ${o.number}`,
          })),
        },
      },
    ],
  };
}

/** Step 11 — /reorder: every line on the source order lands in a fresh cart,
 *  linked to the source. The cart is then checked out (steps 6–8 again) so the
 *  reorder ends as a placed order. */
function reorder(o: Order): ScriptedResponse {
  session.cart = o.lines;
  session.cartFrom = o.number;
  const cart = newCart();
  const many = o.lines.length > 1;
  return {
    suggestions: [
      { label: "Proceed to checkout", prompt: "Proceed to checkout" },
      { label: "Change quantities" },
      { label: "Add a free sample" },
    ],
    skill: "reorder",
    tools: [
      { name: "dispatch_readonly", target: "buyer-order-management" },
      { name: "dispatch_readonly", target: "buyer-cart-management" },
    ],
    thinking: [
      { label: `Reading the lines on ${o.number}`, delay: 1050 },
      { label: "Creating a fresh cart for Morton", delay: 1000 },
      { label: "Repricing on his contract", delay: 950 },
    ],
    writes: [
      {
        action: `Create a reorder cart from ${o.number.slice(0, 5)}`,
        target: "buyer-cart-management",
        result: `${cart} · ${usd(subtotal(o.lines))}`,
        records: [
          { op: "insert", object: "WebCart", name: cart, fields: `Account Morton Breitenberg · ReorderOf ${o.number.slice(0, 5)} · Status Active` },
          ...cartItems(o.lines),
        ],
      },
    ],
    response: [
      {
        type: "text",
        content: `Fresh cart created for **Morton** with ${many ? `all **${o.lines.length} lines**` : "the same line"} from order **${o.number}**, repriced on his contract at **${usd(subtotal(o.lines))}** and linked to the source order.`,
      },
      {
        type: "slot",
        mode: "inline-card",
        app: SF,
        footer: { meta: `Reorder cart · linked to ${o.number}`, ...SF_LINK },
        view: {
          kind: "cart",
          heading: "Reorder cart",
          lines: rows(o.lines),
          totals: cartTotals(o.lines),
          action: { label: "Proceed to checkout", sendPrompt: "Proceed to checkout" },
        },
      },
      { type: "text", content: "Ready to check out? It'll go through on **PO number** payment like the last one." },
    ],
  };
}

/** Fallback — lists what's wired so an off-script prompt still lands usefully. */
const FALLBACK: ScriptedResponse = {
  suggestions: [
    { label: "Start an order for Morton", prompt: "I want to place an order on behalf of Morton Breitenberg on our Alpine B2B store." },
    { label: "What can you help with?" },
    { label: "Show Morton's account" },
  ],
  thinking: [{ label: "Working through the request", delay: 700 }],
  response: [
    {
      type: "text",
      content:
        "I can run an order on behalf of a buyer on **Alpine B2B**. Here's what I can do:\n" +
        "- Resolve a buyer's **store context** (try \"place an order on behalf of Morton Breitenberg\")\n" +
        "- Run **/entitlement-check** to see what the buyer can buy\n" +
        "- Add products to a **fresh cart** and reprice on contract\n" +
        "- Run **PO checkout** and place the order\n" +
        "- Pull **order details** or this week's **successful orders**\n" +
        "- **/reorder** any order number on a fresh cart\n" +
        "Where would you like to start?",
    },
  ],
};

/** Match the typed prompt (or a select-menu pick) to a beat. Specific picks are
 *  checked before the broad structural keywords they'd collide with. */
function getResponse(prompt: string): ScriptedResponse {
  const p = prompt.toLowerCase();
  const has = (...terms: string[]) => terms.some((t) => p.includes(t));
  const order = findOrder(p);

  // Slash commands win.
  if (has("/order-on-behalf")) return RESOLVE;
  if (has("/entitlement-check")) return ENTITLEMENT;
  if (has("/add-to-cart")) return cartAsk();
  if (has("/checkout")) return addressBeat();
  if (has("/reorder")) return order ? reorder(order) : ordersBeat(true);

  // Select-menu picks — unique tokens, checked before structural keywords.
  if (has("flavor:")) return pickFlavor(p);
  if (has("fresh cart") && !has("reorder")) return cartBeat(true);
  if (has("keep the existing cart")) return cartBeat(false);
  if (has("ship to")) return checkoutReview(p);

  // Reorder ("the same thing again" = the last order placed) before the generic
  // "order" keywords below.
  if (has("reorder") || (has("same thing") && has("again"))) return reorder(order ?? lastOrder());
  // Add products (the catalog picker's "Add to cart", or typed by name).
  if (has("add these to") || has(...CATALOG_LINES.map((c) => c.match))) return addPicked(p);

  // Order lookups — detail before the list ("details on the last successful order").
  if (has("full detail", "details on", "order detail", "line item")) return orderDetail(order ?? lastOrder());
  if (has("successful", "orders this week", "recent orders", "order history", "past orders", "all orders", "his orders", "other orders"))
    return ordersBeat(false);

  // Structural beats.
  if (has("proceed to checkout", "checkout", "place order", "pay")) return addressBeat();
  if (has("entitl", "eligible", "catalog", "what can", "products", "browse", "buy")) return ENTITLEMENT;
  if (has("on behalf", "place an order", "order for", "morton", "start")) return RESOLVE;

  return FALLBACK;
}

/** The one PDF page behind each exportable card: this week's orders, or one
 *  order's detail (`order:<number>`). */
function reportPage(id: string): ReportPage {
  const o = id.startsWith("order:") ? allOrders().find((x) => x.number === id.slice(6)) : undefined;
  if (o)
    return {
      title: `Order ${o.number}`,
      takeaway: `Placed ${o.placed.toLowerCase()} for Morton Breitenberg, shipping to ${o.shipTo.name}.`,
      sections: [
        { type: "kpis", items: orderKpis(o) },
        {
          type: "table",
          title: "Line items",
          columns: [{ label: "Product" }, { label: "Qty", align: "right" }, { label: "Total", align: "right" }],
          rows: o.lines.map((l) => [l.product, { text: String(l.qty), muted: true }, { text: usd(l.price * l.qty), strong: true }]),
        },
      ],
    };
  const orders = allOrders();
  return {
    title: "Successful orders this week",
    takeaway: `${orders.length} orders for Morton Breitenberg on Alpine B2B.`,
    sections: [
      {
        type: "table",
        columns: [{ label: "Order" }, { label: "Placed" }, { label: "Items" }, { label: "Total", align: "right" }],
        rows: orders.map((x) => [{ text: x.number, strong: true }, { text: x.placed, muted: true }, { text: lineCount(x.lines), muted: true }, usd(orderTotal(x.lines))]),
      },
    ],
  };
}

/** Beats triggered by an in-app button (no user bubble). */
function getAction(key: string): ScriptedResponse | undefined {
  const exp = parseExport(key);
  if (exp) return onePageExport(exp.title, reportPage(exp.id));
  switch (key.split("|")[0]) {
    case "place-order":
      return placeOrder();
    default:
      return undefined;
  }
}

/** The checkout-anywhere / order-on-behalf journey. */
export const checkout: Experience = {
  id: "checkout",
  title: copy.shell.experiences.checkout,
  getResponse,
  getAction,
  reset,
  dictations: [
    "I want to place an order on behalf of Morton Breitenberg on our Alpine B2B store.",
    "Give me full details on the order just placed",
    "Show me Morton's successful orders this week",
    // After the reorder, the list again (now with the reorder in it).
    "Show me Morton's successful orders this week",
  ],
};
