# Demo script: Checkout anywhere

Aaron places an order **on behalf of** buyer Morton Breitenberg on the Alpine B2B store,
checks out with a PO in chat, then reorders a past order.

**Setup:** click **Checkout anywhere** in the sidenav.

**Mic:** rows marked 🎙 are dictated, not typed. Click the mic beside send; the line comes in by itself and the recording ends on its own. Press **Enter**. A prompt that's only a slash skill is still typed.

**Chips:** the latest reply ends with three follow-up chips, then the Claude logo on its own line (both go once anything follows). One chip is live: where a row says *or chip ↳ …*, clicking it on the reply before does that step. The other two do nothing. A reply that asks a question in its card (pick an address, a cart, a store) ends with just the logo.

**Salesforce writes:** every write plays as a **Writing to Salesforce** timeline. Its records land one at a time (INSERT/UPDATE/DELETE, the object, the record, the fields), the header turns to **Wrote N records to Salesforce**, then after a short pause the reply follows. A pick in a card or a button (fresh cart, Proceed to checkout, an address, Place order) is the OK for its write. `/reorder` is a prompt asking for the cart, so it writes too. Nothing asks to be allowed.


| # | Dictate 🎙 / type / click | You should see |
|---|---|---|
| 1 | 🎙 `I want to place an order on behalf of Morton Breitenberg on our Alpine B2B store.` | **Morton Breitenberg** context card, then in the same turn Claude runs the entitlement check: **Entitled products** with a checkbox on each row |
| 2 | Tick the first 3 rows → **Add 3 to cart** | Only the Energy Drink has flavors: tiles Chai / Green Tea / Tart Cherry, $20.50, filling the chat width |
| 3 | Click **Choose** on **Chai** | Morton already has a cart: fresh or keep? |
| 4 | Pick **Go ahead with a fresh cart** | **Wrote 5 records**: DELETE the old WebCart, INSERT the new WebCart and 3 CartItems. Then the cart: 3 lines, 2 of each, **$86.98** |
| 5 | Click **Proceed to checkout** · or chip ↳ **Proceed to checkout** | **Wrote 1 record**: INSERT CartCheckoutSession. Then the shipping address list, **Shirley** marked **Frequently used** |
| 6 | Pick **Shirley** | **Wrote 2 records**: UPDATE CartDeliveryGroup (Shirley, FedEx) and CartCheckoutSession (PO123). Then review order: FedEx $11.99, PO **PO123**, total **$98.97** |
| 7 | Click **Place order** · or chip ↳ **Place the order** | **Wrote 5 records**: INSERT Order MIXOZ and 3 OrderItems, UPDATE WebCart → Closed. Then order confirmed: **MIXOZ-FKSNI-ETRZN-OWHOH**, with **Ordered by** Aaron from Alpine (aaron@alpine.com) on behalf of Morton, ship to and delivery window |
| 8 | 🎙 `Give me full details on the order just placed` · or chip ↳ **Open this order** | Order detail: KPI tiles (total, units, PO), **Ordered by** Aaron (avatar, name, email) on behalf of Morton, shipping, line items, totals. Export and Share icons in the header |
| 9 | 🎙 `Show me Morton's successful orders this week` · or chip ↳ **See Morton's orders this week** | 3 orders (MIXOZ, QJRTA, ZPLKE), each with **Reorder**. Exportable |
| 10 | Click **Reorder** on **QJRTA…** | Prefills `/reorder QJRTA-WMBKE-HXLDP-NAUVC` in the prompt box. Press **Enter**. Claude reads the order's 3 lines, then **Wrote 4 records**: INSERT WebCart (ReorderOf QJRTA) and 3 CartItems. Then the reorder cart: 3 lines, **$121.47**, "Ready to check out?" |
| 11 | 🎙 `Show me Morton's successful orders this week` | The orders list again (the mic offers it after the reorder). **The demo ends here.** |

## Optional: finish the reorder

12. **Proceed to checkout** → pick an address → review (PO124, $133.46) → **Place order** →
    **TQWEB-NLKRA-PVZXO-HUMDE**.
13. Step 11's list now shows 4 (dictate it after placing the reorder instead).

## Extras

- `/reorder ZPLKE` → 2-line cart, $108.25.
- Bare `/reorder` → asks which order.
- `Let's reorder the same thing for Morton again` → reorders the last order placed.
- `Full details on QJRTA` → that order's detail.
- The **Export** icon on an order detail or the orders list makes a one-page PDF.

## Gotchas

- Tick any mix of rows; only the Energy Drink asks for a flavor.
- "Keep the existing cart" adds the lines to Morton's active cart instead (INSERT 3 CartItems, no new cart).
