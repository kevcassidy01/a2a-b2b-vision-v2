# Quote Management — flow & script design (BUILT 2026-10-01)

The scripted quote-approval experience for the Claude shell. **Built** —
see `src/chat/experiences/quote.ts` (beats), `src/chat/SlotContent.tsx` (widgets), and the demo
runbook below. It elaborates the reference Claude Code demo
(`docs/references/claude-code-demo-transcript.md`) into a richer, UI-native conversation.

Confirmed build decisions: enhancements #1 (interactive entitled-products card), #2
(status stepper), #3 (full-screen catalog), #4 (buyer-note preview) are in; #5, #6 are
out. Skills: `/entitlement-check`, `/find-products`, `/add-note`, `/approve-quote`.
Persona "Aaron". Realistic (shortened) SF-style ids. SLDS accents per INTENT §4.

**Dictation (2026-10-16).** The mic beside send dictates the presenter's prompts (steps 1, 2 and 4, step 4 as plain English, "Which free samples is Morton entitled to?", with Claude running `/entitlement-check` itself; `/add-note` and `/approve-quote` stay typed) in order, at a steady pace with no pauses, from the `dictations` list in the script. Prompts that are only a slash skill are still typed. See `docs/demo-scripts/`.

**Follow-up chips (2026-10-16).** Each beat's `suggestions` are the three chips under the latest reply, then the Claude logo on its own line; one chip is live (a prompt, an in-app action or expand), the others are inert. Beats that ask a question in their card have none. The demo script says which chip plays which step.

**Salesforce writes (2026-10-16).** Every write plays as a "Writing to Salesforce" timeline (`dispatch_write`, then its records landing one at a time; the header becomes "Wrote N records to Salesforce"), then a 2-second pause, then the reply. None of the three writes asks to be allowed, since the prompt asking for it is the OK: step 4 rechecks the margin, then adds the line in the same turn (INSERT QuoteLineItem, UPDATE Quote); step 5 attaches the note (INSERT Note); step 6 approves (UPDATE Quote, Draft → Approved).

**Tool-call timeline (2026-10-05).** Each beat shows the Headless 360 MCP
(`project-codey`) calls that produced it, above the skill chip (latest expanded, earlier
folded):

| Beat | Tools |
|---|---|
| Pending quotes | `discover` commerce SORs · `get_sor_detail` / `dispatch_readonly` b2b-merchant-quote-management |
| Quote detail | `dispatch_readonly` b2b-merchant-quote-management |
| Order history | `get_sor_detail` / `dispatch_readonly` merchant-order-management |
| `/entitlement-check` | `dispatch_readonly` merchant-catalog-management · `dispatch_readonly` b2b-merchant-quote-management · `get_sor_detail` promotion-management (margin on the candidates) |
| `/find-products` | `dispatch_readonly` merchant-catalog-management |
| Add free sample: margin check | `get_sor_detail` promotion-management · `dispatch_readonly` b2b-merchant-quote-management |
| Add free sample: add the line (same turn) | `dispatch` + `dispatch_readonly` b2b-merchant-quote-management (insert, then verify) |
| `/add-note` | `dispatch` + `dispatch_readonly` b2b-merchant-quote-management |
| `/approve-quote` | `get_sor_detail` + `dispatch` b2b-merchant-quote-management |
| Margin / policy / fallback | none (Claude reasons directly) |

Follows: INTENT §5–§8, the kit's `DESIGN_DECISIONS.md`, and the MCP-app guidance in
`docs/references/claude-mcp-guidance.md` (kit wins where they differ).

---

## Personas & setup

- **Merchant / sales rep (the user):** "Aaron" — the shell's existing greeting persona.
- **Buyer org:** Morton, a B2B business account (org) on the **Alpine Group** LWR
  storefront, with multiple **buyer accounts** under it (Riverside, Midtown, Eastgate).
  The merchant reviews pending quotes across all of them, then opens one (00000011 /
  Morton – Riverside).
- **Connector:** Salesforce Commerce is **already connected** — it stays on at all
  times and across new chats. Connecting it is a one-time setup step on another
  screen, so the demo has no explicit "turn it on" beat (per PM). The composer shows a
  static chip beside "+" reading just **"Salesforce"** (logo + word, no border, no
  disconnect ×); the Salesforce slash-skills and app identity are available from the
  start. Aaron just types the first prompt.

### App identity for MCP-app slots (IMPORTANT)

Every slot's header shows the **Salesforce logo** + the app name **"Salesforce
Commerce"** — NOT "Commerce Cloud", and NOT a letter monogram. The kit's `CardApp`
currently uses a 1–2 char `badge`; for this experience the header renders the Salesforce
cloud logo (`public/salesforce.svg`, already in the repo) as the logo. Host still owns
the whole frame; Salesforce brand shows only in the logo + link/primary-action accent
(the kit's "host owns the frame" rule).

## Canonical synthetic data (cleaned, single source for the script)

Numbers are B2B-realistic (round 2). Single source of truth is `src/chat/script.ts`.

- **Morton is the org (a business account).** It has multiple **buyer accounts** under it;
  the merchant pulls *all* pending quotes across them, then picks which to open.
- **3 pending quotes across Morton's buyer accounts, all Draft:**
  - **00000011** — **Morton – Riverside** — expires 2026-08-21, GrandTotal **$24,660.00**
  - 00000010 — Morton – Midtown — expires 2026-08-20, GrandTotal $18,320.00
  - 00000009 — Morton – Eastgate — expires 2026-08-20, GrandTotal $9,875.00
- **Quote 00000011 (Morton – Riverside) line items:**
  - 00000021 — Alpine Energy Drink Chai Pre 0.5L PET – 6 pack — Qty 900 — $20.50 — $18,450.00
  - 00000022 — Alpine Energy Pre Eco Pod, Chai — Qty 540 — $11.50 — $6,210.00
  - Subtotal / Total **$24,660.00**
- **Free sample line added:** 00000023 — Alpine Energy Drink Chai Post 0.5L PET –
  6 pack — **Qty 24** — list $492.00 — **100% discount** — **$0.00**
- **Rollup after the free sample:** line count 2 → **3**; list subtotal $24,660.00 → **$25,152.00**;
  promotional discount $0.00 → **−$492.00**; GrandTotal **$24,660.00 unchanged** (promo billed $0).
- **Account 360 (conversational beat):** ~$412,900 across 37 orders YTD; Alpine Energy top
  family at $268,400; reorder cadence ~9 days; largest order $28,140 in March. Spend splits by
  buyer account: **Riverside $214,500 / Midtown $121,700 / Eastgate $76,700** — rendered as a
  simple horizontal **bar chart** in a `floating`, expandable slot (new `chart` SlotView kind).
  **Expanding the chart opens a full account-360 report** (not just the enlarged chart): KPI tiles
  (total spend / orders / reorder cadence / largest order), the spend-by-account chart, a
  per-account breakdown table (orders / spend / share / last order — Riverside 18 orders / 52% /
  last Sep 24, Midtown 12 / 29% / Sep 18, Eastgate 7 / 19% / Sep 2), and a spend-by-family chart
  (Alpine Energy $268,400 / Alpine Blends $92,600 / Alpine Accessories $51,900).
- **Margin of the sample (conversational beat):** unit cost ~$7.80, 24 units ≈ $187 COGS,
  <1% of the quote total.
- **Approval policy (conversational beat — MUTED for this demo, see `POLICY_MUTED`):** role
  can apply 100% promo discounts up to $1,000 list; $492 sample is within limit; the quote
  still needs normal quote approval. *(Turned off: no real checkable seller-modify-quote
  policy exists, per PM. Beat kept in code, flip the flag to restore.)*
- **Buyer note:** title "Your free sample", body "Hi {name}, / Added a free sample as per your request. / Best, Aaron | Team Alpine",
  **visible to buyer**.
- **Approval:** Status **Draft → Approved**. Direct field update, no Salesforce Approval
  Process invoked, line items not locked, rollback to Draft available.
- Long Salesforce record IDs (e.g. `0Q0SG000001yTxp0AE`) appear only where a detail view
  wants them, as small monospace "record id" captions — never crowding an inline card.

> Data note: the reference frames showed a stray quote #00000009 with different line
> items in the Salesforce backend. We standardize on **00000011** with the two lines
> above and ignore that discrepancy.

---

## Display-mode plan (per step — judgment call, not force-fit)

| # | Step | Mode | Why |
|---|---|---|---|
| 1 | Pending quotes for Morton | **Inline card** (compact 3-row table) | Small, bounded result; done in place |
| 2 | Quote 00000011 detail + line items | **Inline card** | 12 fields + 2 lines fit inline; no full-screen needed |
| 3 | What Morton is entitled to buy | **Inline card (curated) → expandable full screen** | Short relevant set inline; full 100+ catalog earns full screen |
| 4 | Add free sample line | **Claude text (margin check), then an inline card**, one turn | Low-risk write: Claude checks margin and adds it, no confirm step |
| 5 | Attach buyer-visible note | **Plain Claude text** (optional tiny note chip) | Not everything needs a slot |
| 6 | Approve the quote (`/approve-quote`) | **Inline card** (Draft → Approved, status stepper) | A skill that runs the approval workflow directly |

Deliberately **no carousel** (consistent with "rarely used"). No status-picklist step —
approval is a direct skill action (per Somnath).

Interaction split (per guidance): freeform asks go through **chat**; committing a
prepared action ("Make live", "Approve") is an **in-app button** or a **skill**.

---

## The scripted flow

Each step: **[prompt Aaron types]** → *contextual thinking states* → **response** (text +
any slot). Thinking phrases are specific to the work being done. All slot headers show
the **Salesforce logo + "Salesforce Commerce"**.

### Step 1 — Review pending quotes
**Prompt:** "I'm a B2B merchant and I need to review pending quotes for one of my buyer
accounts, Morton. Can you help me?"
**Thinking:** "Opening the merchant quote workflow" → "Resolving Morton's account" →
"Retrieving pending quotes"
**Response (text):** "Morton has 3 pending quotes, all in Draft. Here they are — quote
00000011 is the most recent, created today."
**Slot — inline card**, compact table:

| Quote | Created | Expires | Total | Status |
|---|---|---|---|---|
| 00000011 | Jul 29 | Aug 21 | $32.00 | Draft |
| 00000010 | Jul 29 | Aug 20 | $32.00 | Draft |
| 00000009 | Jul 29 | Aug 20 | $32.00 | Draft |

Footer: "3 pending quotes · Morton Breitenberg". **Closing text:** "Want me to open one?
Tell me which quote number."

### Step 2 — Quote detail + line items
**Prompt:** "Show me the details of the first pending quote, and list every line item on
it."
**Thinking:** "Opening quote 00000011" → "Loading line items"
**Response (text):** "Quote 00000011 for Morton, still in Draft, expires Aug 21. Two line
items, $32.00 total."
**Slot — inline card** (no full-screen). Card shows the SLDS **Path stepper** (Draft →
Needs Review → Approved, Draft active) above the key facts, a **"Note from buyer" callout**
(incoming, buyer → merchant: Dana Morales at Morton – Riverside asks for a free Chai Post
sample — this motivates the free sample in steps 3–6), and a 2-row line-item table, so the
quote's lifecycle stage reads from the moment it's opened (not only at approval):

| Line | Product | Qty | Unit | Total |
|---|---|---|---|---|
| 00000021 | Alpine Energy Drink Chai Pre 0.5L PET – 6 pack | 1 | $20.50 | $20.50 |
| 00000022 | Alpine Energy Pre Eco Pod, Chai | 1 | $11.50 | $11.50 |

**Closing text:** "From here you can adjust a price or discount, add a free promo item
from Morton's entitled catalog, or attach a buyer-visible note. What next?"

### Step 3 — Entitlement walk, with a recommended free sample
*(Reworked 2026-10-08 from design feedback: Claude recommends the sample and checks its margin.)*
**Prompt:** `/entitlement-check Free sample` (the argument tells Claude what the buyer asked for)
**Thinking:** "Reading Riverside's entitlement policy" → "Finding products eligible as a free sample" →
"Checking margin on each candidate" → "Keeping the ones that barely touch margin" → "Matching them to the lines on quote 00000011"
**Response (text, two short paragraphs):** the recommendation ("I'd add the **Chai Post 6-pack** as
the free sample: Morton asked for it in his note, and it pairs with the Chai Pre already on quote
00000011.") and a one-line margin check that explains the list ("Margin check: I've listed only the samples that
barely touch your margin, about **2%** of the quote total or less. The Chai Post costs you about
**$187**, under **1%**.").
**Slot — inline card "Eligible free samples" (5 inline), expandable → full catalog.** The Chai Post
row sits first with a **Recommended** pill, its reason under the name ("Requested by Morton · pairs
with Chai Pre on the quote") and the primary **Add free sample** button; other rows use the
secondary button. Footer: "Showing 5 of 100+ entitled products".
**Closing text:** "Add the recommended sample right from the list, pick another, or tell me which
product you had in mind."

### Step 4 — Add free sample: margin recheck, then add (one turn)
**Trigger:** click **Add free sample** on a row (posts "Add the … as a free sample." as Aaron) or type it.
**Part 1:** tools (`get_sor_detail` promotion-management, `dispatch_readonly` quote) + thinking
"Re-reading quote 00000011 as it stands now" → "Rechecking margin on the live totals", then one
line. It's a recheck, so it doesn't repeat step 3's numbers. For the recommended sample: "Rechecked
against the live quote: nothing has changed, Morton still pays **$24,660.00**, and the sample stays
under **1%** of the total. Adding it now." For any other pick, which step 3 didn't price by name,
it gives that product's cost: "Rechecked against the live quote: 24 units of this one cost you about
**$506**, about **2%** of the total, and Morton still pays **$24,660.00**. Low risk, so I'm adding it now."
**Part 2 (same message, a `then` follow-on):** tools (`dispatch` + `dispatch_readonly` quote) +
thinking "Adding the free line to the quote" → "Recalculating totals", then "Done…" and the
**Free sample added** card: line 00000023, 24 units, list $492.00, 100% off, $0.00, plus the
before/after rollup (line items 2 → 3, list subtotal → $25,152.00, promotional discount →
−$492.00, grand total $24,660.00 unchanged). No confirm card: the margin check replaces it.
Picking a different product gets that product's numbers (24 units, cost ≈ 38% of list).

### Step 5 — Buyer-visible note (inline card)
**Prompt:** `/add-note Added a free sample as per your request.`
**Thinking:** "Attaching a buyer-visible note"
**Response (text):** "Attached. The note is on quote 00000011, and Morton – Riverside will
see it on the storefront."
**Slot — inline card** ("Buyer note", "Visible to buyer" pill): a storefront preview of the
note, titled "Your free sample". The skill wraps the rep's one line in a first-name
greeting and a sign-off, like an automated company message:

> Hi [First name],
>
> Added a free sample as per your request.
>
> Best,
> Aaron | Team Alpine

`[First name]` is the `{name}` merge-field chunk (filled with the buyer's first name at
send time). Kept short since approval follows immediately.

### Step 6 — Approve (skill, direct)
**Prompt:** `/approve-quote` (the skill runs the approval workflow directly — no status
picklist step).
**Thinking:** "Running the approval workflow" → "Updating the quote record"
**Response (text):** "Quote 00000011 is approved."
**Slot — inline card** with a **status stepper** (Draft → Approved) + before/after:

| | Before | After |
|---|---|---|
| Status | Draft | **Approved ✅** |
| Line items | 3 | 3 |
| Grand total | $32.00 | $32.00 |

**Closing text:** "Approval landed. No Salesforce approval process was triggered and it's
reversible if needed. Morton's other two quotes (00000010, 00000009) are still pending —
want to work those next?"

---

## New skills to add (Salesforce group, connector-gated)

Add to `src/shell/skills.ts` (blue Salesforce chunks, only when Commerce connector on):

- **`/approve-quote`** — run the quote approval workflow directly (step 6). Confirmed.
- *(Candidates)* **`/add-promo-line`** — add a free/discounted promo item (step 4);
  **`/entitlement-lookup`** — list what a buyer can buy (step 3); **`/quote-review`** —
  pull a buyer account's pending quotes (step 1).

---

## Experience enhancements (proposals — pick what we want)

Ideas to make the demo genuinely impressive, all consistent with "host owns the frame /
Claude-native / mode by judgment":

1. **Interactive entitled-products card (step 3→4 merge).** Put an **"Add free
   sample"** button on each product row in the entitled-products card. Aaron clicks the
   Chai Post 6-pack row → it flows straight into the step-4 commit. Turns a static list
   into a live commerce surface and shows the app-vs-chat action split beautifully. Aaron
   can still type the prompt instead. *(Strongest addition.)*
2. **Status stepper in the approval card.** A visual Draft → Needs Review → Approved
   progress bar (echoing Salesforce's own quote stage bar) inside the step-6 card.
   Recognizable, on-brand, reads as "real Salesforce".
3. **Full-screen entitled catalog.** Use full screen for the one genuinely large dataset
   (100+ entitled products), reachable by expanding the step-3 card. This is where the
   full-screen mode earns its place (instead of forcing it at step 2).
4. **Buyer-view preview of the note (step 5).** A small "this is what Morton sees" chip
   showing the note as it appears on the buyer storefront — nice polish, reinforces the
   buyer↔merchant loop. Optional.
5. **Granular, named thinking sequences.** Especially the entitlement walk: show the
   sub-steps ("buyer group → entitlement policy → eligible products") so it reads like
   real work, not a spinner. Cheap, high perceived value.
6. **Opening context beat (optional).** A brief "a new quote request from Morton just
   came in" framing before step 1, to set the buyer→merchant handoff. Skip if it adds
   demo risk.

---

## Demo runbook (the prompts Aaron types, in order)

**The connector is already on** (a static "Salesforce" chip sits beside "+", and the
Salesforce slash-skills are unlocked from the start — connecting it is a one-time setup
step on another screen, not a demo beat). Just work the prompts below. Slash skills
convert to blue chunks as you type them. Prompts map to beats by slash-command / keyword,
so minor rephrasing is safe.

1. `Pull up all the pending quotes for the Morton account.`  *(Morton is the org; the list spans its buyer accounts — Riverside, Midtown, Eastgate — so you can pick one.)*
2. `Show me the details of the first pending quote, and list every line item on it.`  *(opens 00000011 / Morton – Riverside)*
3. *(optional colour)* `How much has Morton ordered from us this year?` → **Spend this year**: KPI tiles (total, orders, cadence, largest order) and a **spend-by-buyer-account bar chart** (floating, expandable; hover a bar for its share, orders and last order).
4. `/entitlement-check Free sample`  *(the buyer wants a free sample — this returns Morton's entitlement + entitled catalog with Claude's pick on top; hover **Recommended** for why; expand the card for the full catalog)*
5. Click **Add free sample** on the recommended *Alpine Energy Drink Chai Post* row — this **posts a user bubble** ("Add the … as a free sample.") on your behalf. Claude rechecks the margin against the live quote in one line, then keeps going in the same turn and adds the line (**Free sample added** card). *(Or type the add request yourself.)*
6. `/add-note Added a free sample as per your request.`
7. `/approve-quote`

> **Muted:** the approval-policy prompt (`Do I need approval to add a free item?`) is turned
> **off** for this demo — per the PM, there's no real checkable policy for a seller modifying
> a quote, so we don't imply one. The beat is kept in code behind `POLICY_MUTED` (flip to
> `false` to restore). Flow goes straight from order history to `/entitlement-check`.

Export: the pending quotes, quote detail and spend cards carry **Export** and **Share** icons. Export makes a one-page PDF of that view; Share is display only.

Optional: `/find-products <term>` at step 4/5 to search the entitled catalog instead. The
two "colour" prompts are optional conversational beats to lengthen the demo and show the
skill-chip transparency (account-360 runs a skill; margin does not).

---

## Open decisions to confirm before building

1. **Merchant persona/greeting** — keep "Aaron" and the time-based greeting?
2. **Entitled products (step 3)** — curated card + expandable full screen (recommended)?
3. **Enhancements** — which of the 6 above to include? (Recommend at least #1, #2, #3, #5.)
4. **Skills** — just `/approve-quote`, or also `/add-promo-line` / `/entitlement-lookup`
   / `/quote-review`?
5. **IDs** — keep realistic long Salesforce IDs in detail views, or simplify?
