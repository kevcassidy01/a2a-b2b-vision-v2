# Checkout anywhere — order on behalf of a buyer (runbook)

Experience #3 of the Claudeforce Commerce merchant demo. A sales rep (persona **Aaron**)
places an order **on behalf of** buyer **Morton Breitenberg** on the **Alpine B2B**
store, then reorders one of his past orders. *(Steps 1–7 reworked 2026-10-08 from design
feedback: the entitlement check runs on its own, the catalog is a checkbox table, no phase step.)* Every cart and order attributes to Morton,
not the rep. The climax is the rep completing a **PO-based checkout on behalf** in chat
(no buyer handoff link).

Script: `src/chat/experiences/checkout.ts`. MCP: `project-codey` Headless 360 tools
(`discover`, `get_sor_detail`, `dispatch_readonly`, `dispatch`) over the commerce SORs,
shown as the tool-call timeline atop each response.

**Dictation (2026-10-16).** The mic beside send dictates the presenter's prompts (steps 1, 8 and 9; Reorder still prefills) in order, at a steady pace with no pauses, from the `dictations` list in the script. Prompts that are only a slash skill are still typed. See `docs/demo-scripts/`.

**Follow-up chips (2026-10-16).** Each beat's `suggestions` are the three chips under the latest reply, then the Claude logo on its own line; one chip is live (a prompt, an in-app action or expand), the others are inert. Beats that ask a question in their card have none. The demo script says which chip plays which step.

**Salesforce writes (2026-10-16).** Every write plays as a "Writing to Salesforce" timeline (`dispatch_write`, then its records landing one at a time; the header becomes "Wrote N records to Salesforce"), then a 2-second pause, then the reply. The fresh cart (DELETE the active WebCart, INSERT a WebCart and CartItems; keeping the cart INSERTs only the CartItems), Proceed to checkout (INSERT CartCheckoutSession), the address (UPDATE CartDeliveryGroup and CartCheckoutSession) and Place order (INSERT Order and OrderItems, UPDATE WebCart → Closed) need no extra OK: the pick or button is it. `/reorder` needs none either, since the prompt is the OK: it reads the order and writes the reorder cart in one turn (INSERT WebCart and CartItems).

## Before you start

- `npm run dev` → http://localhost:5173/
- Click **Checkout anywhere** in the sidenav to arm it. If it's already been run, its chat is
  as it was left; **New** restarts it (clean transcript, no open cart, no orders placed yet),
  and a page refresh restarts every journey.
- The Salesforce connector is always on; the `/` menu lists every Salesforce skill
  across all three journeys.

## Run sequence

| # | Do | Expect |
|---|---|---|
| 1 | Type: **I want to place an order on behalf of Morton Breitenberg on our Alpine B2B store.** | One turn, two parts. `/order-on-behalf` · 3 tools · "…Checking what he can buy next." · **Morton Breitenberg** context card (email, account, entitlement, price book, payment; store and account ids in the footer). Claude keeps going: 2 tools · `/entitlement-check` chip · **Entitled products** (what Morton can **buy**, at contract price; expandable), a checkbox table with an **Add to cart** button. Ends: "Tick what Morton needs… I'll add **2 of each**." |
| 2 | Tick the first 3 rows (**Alpine Energy Drink**, **Eco Pod**, **GoBrew Moca**) → **Add 3 to cart** | Posts "Add these to Morton's cart: …" as Aaron. The Energy Drink is the only one with flavors, so: `/find-products` · "Eco Pod and GoBrew Moca are ready to go in…" · **product tiles** filling the chat column (scaled up, same shape): Chai / Green Tea / Tart Cherry, $20.50 (list $24.99 struck) |
| 3 | Click **Choose** on **Chai** | `/add-to-cart` · **Morton has an active cart** → fresh or keep (these 3 lines) |
| 4 | Pick **Go ahead with a fresh cart** | **Cart**: Chai 2 × $20.50, Eco Pod 2 × $11.50, GoBrew 2 × $11.49; list $104.96 struck, –$17.98 contract, **$86.98**. PO-only payment note |
| 5 | Click **Proceed to checkout** | `/checkout` · **Shipping address** list; **Shirley** carries a **Frequently used** pill |
| 6 | Pick **Shirley** (7052 Jayson Road) | **Review order**: FedEx Delivery 1 $11.99 (cheapest, auto), PO **PO123**, 3 lines · 6 units, total **$98.97**, **Place order** button |
| 7 | Click **Place order** (in-app, no user bubble) | **Order confirmed**: **MIXOZ-FKSNI-ETRZN-OWHOH**, with buyer, **ordered by** (Aaron from Alpine, aaron@alpine.com, on behalf of Morton), store, ship to, delivery (FedEx Delivery 1 · arrives in 3–5 business days), PO and total |
| 8 | Type: **Give me full details on the order just placed** | **Order MIXOZ-…** detail: KPI tiles (total, units, PO), **Ordered by** (Aaron's avatar, name and email, "On behalf of Morton Breitenberg"), shipping, 3 lines (SKU, list, discount), products / delivery / tax / total. Header has Export and Share |
| 9 | Type: **Show me Morton's successful orders this week** | **Successful orders this week**: MIXOZ (today) + QJRTA (3 lines, 2 days ago) + ZPLKE (2 lines, 5 days ago), each with a **Reorder** button. Header has Export and Share |
| 10 | Click **Reorder** on **QJRTA…** *(or type `/reorder QJRTA-WMBKE-HXLDP-NAUVC`)* | The button **prefills** `/reorder QJRTA-WMBKE-HXLDP-NAUVC` in the prompt box (not sent). Press **Enter** |
| 11 | — | `/reorder` · **Reorder cart**: all 3 lines from QJRTA, repriced, **$121.47**, linked to the source order + **Proceed to checkout**. "Ready to check out?" |

**The demo ends at step 11**: the reorder is a cart that prompts checkout. At this
point the successful-orders list still shows **3** (a cart isn't an order).

### Optional: take the reorder through checkout

12. **Proceed to checkout** → pick an address → **Review reorder** (its own lines, PO124,
    "Reorder of QJRTA…", $133.46) → **Place order** → **Reorder confirmed**:
    **TQWEB-NLKRA-PVZXO-HUMDE**.
13. "Show me successful orders this week" now lists **4** (TQWEB on top).

## Variations that work

- `/reorder` with just the first segment: `/reorder ZPLKE` (2-line cart, $108.25).
- Bare `/reorder` → asks which order and shows the orders list.
- "Let's reorder the same thing for Morton again" → reorders the **last order placed**.
- "Full details on QJRTA" → that order's detail (the number in the prompt wins).
- Pick **Sylvan** or the billing address at step 6 → carries through to review + detail.
- Clicking an already-used **Place order** again does nothing.

## Known limitations

- Any mix of rows works; only the Energy Drink asks for a flavor (and any flavor works).
  Nothing ticked can't be sent. Typing product names ("add the GoBar and the GoGoo to his
  cart") works too.
- "Keep the existing cart" plays the same fresh-cart beat.
- Flavor tile shots live in `public/products/alpine-energy-drinks-product-images/` (640px WebP,
  ~30 KB each, from Somnath's originals). Each tile's `tint` shows behind its image.
- Off-script prompts get a fallback listing what the journey can do.

## Data

| Thing | Value |
|---|---|
| Store | Shown as **Alpine B2B** (the real org's B2B LWR Codecept, `0ZER00000004C9y`) |
| Buyer / account | Morton Breitenberg (`001SG00001xM4bT`), policy All Access, price book Morton Contract |
| Lines | 2 of each ticked row. Demo: Alpine Energy Drink Chai 0.5L PET – 6 pack (SKU 6010010, $24.99 → $20.50), Eco Pod 12-pack (6020014, $13.50 → $11.50), GoBrew Moca 6-pack (6030021, $13.99 → $11.49) |
| Delivery | FedEx Delivery 1, $11.99 (cheapest of 3, auto-selected) |
| Payment | PO number only; PO123, then PO124… per order placed |
| Past orders | QJRTA-WMBKE-HXLDP-NAUVC ($133.46, Shipped) · ZPLKE-RTNVA-CQOWM-BYDSF ($120.24, Fulfilled) |
| New order numbers | MIXOZ-FKSNI-ETRZN-OWHOH, then TQWEB-NLKRA-PVZXO-HUMDE, GHAVF-…, PUXEL-… |
