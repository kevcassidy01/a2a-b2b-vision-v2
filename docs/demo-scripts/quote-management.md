# Demo script: Quote approval

Aaron (sales rep) reviews Morton's pending quotes, adds the free sample the buyer asked for (Claude recommends it and checks margin),
leaves a note and approves the quote.

**Setup:** click **Quote approval** in the sidenav.

**Mic:** rows marked 🎙 are dictated, not typed. Click the mic beside send; the line comes in by itself and the recording ends on its own. Press **Enter**. A prompt that's only a slash skill is still typed.

**Chips:** the latest reply ends with three follow-up chips, then the Claude logo on its own line (both go once anything follows). One chip is live: where a row says *or chip ↳ …*, clicking it on the reply before does that step. The other two do nothing. A reply that asks a question in its card (pick an address, a cart, a store) ends with just the logo.

**Salesforce writes:** every write plays as a **Writing to Salesforce** timeline. Its records land one at a time (INSERT/UPDATE, the object, the record, the fields), the header turns to **Wrote N records to Salesforce**, then after a short pause the reply follows. Nothing here asks to be allowed: asking for the write is the OK.


| # | Dictate 🎙 / type / click | You should see |
|---|---|---|
| 1 | 🎙 `Pull up all the pending quotes for the Morton account.` | **Pending quotes**: 3 Drafts across Morton's buyer accounts (Riverside, Midtown, Eastgate), $52,855. Export and Share icons in the header |
| 2 | 🎙 `Show me the details of the first pending quote, and list every line item on it.` | Quote **00000011** (Morton – Riverside): KPI tiles (Grand total $24,660, Units 1,440, Expires Aug 21), the buyer's note, 2 line items |
| 3 | *(optional)* `How much has Morton ordered from us this year?` | **Spend this year**: KPI tiles ($412.9K, 37 orders, ~9-day cadence, $28.1K largest) plus spend by buyer account (expandable). Hover a bar for its share, orders and last order |
| 4 | 🎙 `Which free samples is Morton entitled to?` (Claude runs `/entitlement-check` itself) · or chip ↳ **Check entitlement for free sample** | Claude recommends the **Chai Post 6-pack** and gives a one-line margin check: the list holds only samples that barely touch margin (≤ ~2%), and the Chai Post is ~$187, under 1%. **Eligible free samples** card with the Chai Post row on top, **Recommended**: hover the pill for why Claude picked it. Expand for the full catalog |
| 5 | Click **Add free sample** on the recommended **Chai Post** row · or chip ↳ **Add the Chai Post** | Posts "Add the … as a free sample." for you. Claude rechecks the margin against the live quote ("nothing has changed… stays under 1%… Adding it now"), then **Wrote 2 records**: INSERT QuoteLineItem 00000023, UPDATE Quote 00000011. Then **Free sample added**: line 00000023, 24 units at 100% off, total stays $24,660.00 |
| 6 | `/add-note Added a free sample as per your request.` (typed) | **Wrote 1 record**: INSERT Note. "Attached…", the note titled **Your free sample** as Morton will see it, then asks whether to approve |
| 7 | `/approve-quote` · or chip ↳ **Approve the quote** | **Wrote 1 record**: UPDATE Quote, Status Draft → Approved. Then the Draft → Approved stepper, all green, with the grand total, line items (3, 1 free) and approver |

## Extras

- `/find-products <term>` at step 4–5 searches the entitled catalog instead.
- At step 5 you can type the add request yourself. Another product works too and gets its own margin numbers.
- `What's the margin impact of that sample?` still answers if asked, but the margin check is already built into steps 4–5.
- The **Export** (download) icon on the pending quotes, quote detail or spend card makes a one-page PDF of that view.

## Gotchas

- The approval-policy question ("Do I need approval to add a free item?") is muted for this
  demo. Don't ask it.
