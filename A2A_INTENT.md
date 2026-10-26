# A2A_INTENT

The intent doc for the **agent-to-agent (A2A) B2B commerce prototype**. This is what we build from. If the
prototype and this doc disagree, this doc wins until we change it here.

Started 2026-10-23. The earlier intent docs (the browser chat and the Cowork desktop) are in
[docs/old-intent/](./docs/old-intent/). They are reference only: borrow components from them, not the story.

---

## 1. What this is and why

A clickable prototype that shows **a buyer's agent and a seller's agent negotiating a large B2B order end
to end**, with people stepping in only where policy says they must.

- **Source:** the "B2B Story Line" PDF (Fizz Drinks), plus the brainstorm in
  [b2b-agentic-commerce-vision-discussion.md](./b2b-agentic-commerce-vision-discussion.md).
- **Why the order happens at all (added 2026-10-26):** most of a big buyer's items and prices are negotiated
  for the year, so a large one-off order needs a reason. Here it's a **campaign**: Fizz's promotions agent
  emailed bottlers an Oktoberfest offer, Mike's agent started Isar's cart from it, and the order that closes
  the story is the campaign's conversion.
- **The point it makes:** B2B buying isn't one person clicking Buy. There's a buying team with approvals, a
  selling team with per-customer pricing and discount rules, big quantities and stock in several regions.
  Agents can do the back and forth on both sides, inside limits each company sets, and hand the people the
  few decisions that are theirs.
- **This is a new thing.** Cowork has very little to do with it. In the story Alex's Command Center lives
  inside Cowork, but on screen it sits in a **generic AI chat app shell** of our own, not Cowork or ChatGPT
  (§4). Everything is new, and we borrow existing components where they help (see §10).

## 2. What B2B means here (from the PDF)

- **A buying team, not a buyer.** Several people (John, Mike) buy for one company, with approvals.
- **A selling team.** Prices per customer, discounts, and Net-term approvals.
- **Outside systems.** PIM, contract management and revenue management feed the agents.
- **Large orders.** Thousands of units.
- **Stock in several regions.** Frankfurt and Munich.

The PDF's 7 steps, which our story walks through:

1. Requirements (what we need and why)
2. Agents talk to each other
3. They negotiate together
4. People govern (approvals at the limits)
5. The transaction runs
6. The order's lifecycle (fulfillment events)
7. More autonomy over time (saved templates, wider limits)

## 3. Who's in it

| Person | Role | Company | Where | On screen? |
|---|---|---|---|---|
| **John** | Procurement Director | **[Bottler]**, the buyer | Munich | Yes, the buyer side |
| **Mike** | Procurement Manager | [Bottler] | Frankfurt | **No.** Only in what John sees: his notification, his cart lines and "Mike sees it" |
| **Alex** | Sales Rep | **Fizz Drinks**, the seller ("Better Drinks. Brighter Tomorrow.") | New York | Yes, the seller side |
| **Margret Reyes** | Sales Director, Alex's manager | Fizz Drinks | | **No.** Only her agent is credited, on the Ginger Ale bundle it set up ("Suggested by Margret's agent", her photo with the agent's logo) |
| **Buyer agent** | John's agent | [Bottler] | | In a sheet on John's phone |
| **Seller agent** | Fizz's agent | Fizz Drinks | | In Alex's sidebar |

- The bottler is still a placeholder, **"[Bottler]"**, until it's named (open question, §12).
- The buyer agent belongs to the bottler, not to Fizz. In principle it works across vendors. In this story it
  only deals with Fizz.

## 4. The screen (settled 2026-10-23)

**One screen, split in two.** No tabs or toggle. Both sides are on screen the whole time, so the audience
sees each agent's move land on the other side.

| Left | Right |
|---|---|
| **Storefront, on a phone.** John on the Fizz Drinks B2B store, in a mobile screen | **Command Center.** Alex's dashboard in the AI chat shell |

**Left: John on the storefront, on an iPhone.**
- The latest iPhone's shell (check the current model before drawing it). Glass only where iOS has it: the
  phone's own shell and system menus, not the store.
- **What the store sells (settled 2026-10-24):** concentrate, since the buyer is a bottler: Fizz cola flavours and
  Pulp Orange and Lemonade by the unit (1 unit makes 1,000 L), then fountain syrups, cases only of new launches, and
  packaging and marketing. Before login the agent pill reads "Ask agent" and opens Fizz's helpful agent (no login
  wall); logged in, it's John's buyer agent ("New task").
- **The store isn't the main thing.** The real storefront is built from LWR components that don't look
  great, so for the demo we recreate a big drinks brand's mobile site (PepsiCo or Coca-Cola style) under
  another name.
- **The agent is the main thing.** John's agent can look more Salesforce, more futuristic and agentic, or
  like ChatGPT's mobile app (not unique, but not generic either). To be decided.
- How the agent opens on a phone (settled 2026-10-24): no cart page or sidebar. **Assign to your agent** on Mike's
  cart notice opens the agent as a bottom-sheet chat; it's also one tap away from a floating pill above Safari's bar (the
  blue sparkle and "New task", shrinking to the sparkle when the bar shrinks) and a card at the top of the menu. Assign is a handoff (settled 2026-10-24): John types
  nothing; the agent (**"Your agent"** on screen; "buyer agent" is only its role in these docs) reasons, shows a plan with its progress, and ends on Q-1042 v1. Its reasoning is a timeline of musings (what it reads from SAP, notices, wonders), one row at a time, folding to a chevron when done, and its plan steps name the systems they read or wrote; what it makes shows up as **knowledge cards** (see DESIGN_DECISIONS). Its chat follows shadcn
  AI Elements' patterns, sized like Google's mobile AI; the prompt box is one field with Add and Send. See DESIGN_DECISIONS.
- **v2 on the phone (added 2026-10-25, steps 8–9):** once Fizz sends v2, it lands in the same chat as a counter-offer card from **"Fizz's agent"** (its mark the same size as John's agent's), on the right like the other side's turns. John's agent weighs it (musings), says it'll take the quantities and hold out for 15%, runs a short plan, replies that there's nothing for John to do yet, and shows Q-1042 v2 "Waiting for Fizz to respond".

**Right: Alex in the Fizz Command Center.**
- **Quarter to date (2026-10-26, was "Last 6 months"):** the figures below Campaigns cover the quarter to date, compared with Q3 at the same point. The tiles lead with sales: Sales, Open pipeline, Quote win rate, Avg order value.
- **Campaigns (added 2026-10-26):** a section between Today and Quarter to date, with one card. The top part is the
  live campaign, **"Oktoberfest stock-up"**, run by **Fizz's promotions agent** and sent with Gmail (its mark
  is the agent's logo stacked with Gmail's; started Oct 2 by a flow, from last year's Oktoberfest orders). It
  shows the offer, which is **12% off 1,000+ units at Net30**, sent to 1,860 accounts, and the campaign's figures (Seen, Quotes,
  Converted, Attributed). Then four accounts, each with a **Seen → Quote → Converted** Lightning path
  (chevrons: done green with a check, current blue, not yet grey; the stage names head the column) and what the agent does next. None has
  converted before Isar; the furthest any other gets is Quote. Below that, **Recently ended**: two campaigns
  that have stopped, headed the same way. A footer offers **See all campaign details**. Isar's row follows the story
  (§5): seen at load, the quote in progress once Q-1042 lands, quoted once Isar takes v3a, and converted (green)
  once O-5531 is placed. The conversion event is the order placed.
- A sales dashboard (accounts, orders, revenue by region, a **"Task pipeline"** panel; named "Needs your approval" until 2026-10-25).
- In the story it lives inside Cowork. On screen it sits in **a shell of our own that reads as an AI chat
  based app**, not Cowork or ChatGPT specifically. Somnath will design that shell with Claude.
- **The shell:** a glass sidenav, thinner than Claude's but not too thin, with light bending a little at
  the curved corners. The main content area is a **white layer, slightly padded in from the shell**, so the
  glass surrounds the whole white layer and becomes the sidenav on the left.
- **The Command Center fills the white layer.** Today it opens in Cowork as a full-screen artifact (like
  Claude's full-screen MCP display mode: centered, with its own width and side padding). Our AI app only gets
  part of the viewport, so we cut the side padding down, maybe to nothing, and the Command Center takes the
  whole width of the main content area.
- **It opens on a welcome (added 2026-10-24):** "while you were away", not a login. App tiles and signal pills float around a headline and **Load Command Center**, which loads the dashboard (skeleton cards, a line sweeping along the bottom of the frame's bar). It follows the phone: on opening, the store loads as a skeleton under Safari's progress line, then the welcome's tiles and pills burst out.
- **Today (added 2026-10-24):** once John's agent sends Q-1042 v1, a "Today" section opens above "Last 6 months", holding the Task pipeline with the request, a short beat (0.6s) after the phone sends it. It arrives in place (2026-10-25): the card stays put, its heading turns into Today, Last 6 months opens beneath it, and the row lands with a pale blue wash. It shows who it's assigned to as a pill (the agent's avatar and "Agent responding"), with coloured typing dots while the agent works on it and none when it's idle. (2026-10-25: the dots became a CRED-style pulse, the same one that shows by an agent's avatar in the chats while it thinks.) **Superseded later on 2026-10-25:** Today is now the first section from load, a dashed frame with one row of cards (going out today, booked today, stock watch), and Q-1042 arrives as a task card at the front of that row; see DESIGN_DECISIONS.
- The **seller agent** is a docked right chat sidebar (not floating). So far it has no chat, only what surrounds one (2026-10-24): a header, an empty state with its limits and suggestions, and a prompt box as wide as the chat column. Clicking Q-1042 (added 2026-10-24) opens it on a chat: Isar's agent's request, then the seller agent taking it in (reading, pulling up the account, checking the rules, weighing a counter), holding at "Weighing the options", then (2026-10-25) folding, saying why 15% is over its limit, running its checks one at a time (stock, price book, policy, credit, drafting and sending v2) and showing the v2 counter-offer card, waiting on Isar. Its work visibly runs on Salesforce (2026-10-25): any musing or check that goes to Salesforce shows the call under it, as Cowork does ("Called `dispatch_readonly` merchant-catalog-management").
- **Shells come first:** the iPhone and the AI app shell get designed before anything inside them.

**In both agents' chats: the turns so far (added 2026-10-25).** Once a quote has gone back and forth, each
agent's turn ends, before its done mark, with a folded row: a clock, "N turns on Q-1042", a chevron. Opened,
it's a timeline of who did what, one brief line per turn by that agent's mark. It grows with each turn.

**Under both: the "who's acting" bar (added 2026-10-24).** A thin dark bar along the bottom of the stage,
four equal parts: **John · John's agent · Alex's agent · Alex**. The acting part lights up; the rest stay
dull. Each story step (§5) names who acts, and the bar follows. No status text. Wired 2026-10-24: each agent lights while it works, and a person lights for a moment when their side is tapped. Lit agents take their colour (2026-10-25): John's agent blue, Alex's agent gold, label and dot only.

*Superseded the same day:* a toggle with three views (Storefront, Command Center, and Both as two agent chat
feeds side by side).

## 5. The story: 15 steps

People step in **3 times**: **John starts it** (step 3), **Alex sends both offers** (step 11), **John approves**
(step 13). Agents do everything else.

| # | Buyer side (John) | Seller side (Alex) |
|---|---|---|
| 1 | John logs in. A moment later a notification arrives: **"Mike started a cart."** (the bell's dot, a notification tone, and Mike's cart card with Open cart and Assign). The card shows Mike's photo with his agent's mark stacked over it: **Mike's agent started it from Fizz's Oktoberfest offer**. | Alex goes about his day in the Command Center. Under Campaigns, Isar has **seen** the Oktoberfest offer. |
| 2 | John opens the cart **"Oktoberfest stock-up"**. It holds Mike's **5,000 lemonade concentrate** (Frankfurt), added by Mike's agent. | |
| 3 | John taps **Assign to your agent** on Mike's cart. No prompt: the buyer agent works out that Mike's cart covers Frankfurt and Munich isn't stocked yet, and plans to top it up and get Fizz's best price. *(person 1 of 3)* | |
| 4 | The agent reads the demand forecast (**Munich +40%**) and adds **10,000 orange concentrate** (Munich) to the **same cart**. Mike sees it. | |
| 5 | The agent turns the cart into quote request **Q-1042 v1**: 15,000 units, asking **15%** off, **Net30**. | Q-1042 lands in the **"Task pipeline"**, assigned to the **Fizz agent** (its avatar pill, dots while it works). On the campaign card, Isar's **Quote** stage starts: "Q-1042 · negotiating", and Quotes goes from 6 to 7. |
| 6 | | Alex clicks it. The seller agent's sidebar opens with its work already done. |
| 7 | | The seller agent checks stock, account pricing and the **Oktoberfest offer** the cart came from: **up to 12% at Net30**. |
| 8 | Counter-offer **v2** arrives. | The seller agent sends **v2**: **12,000 orange + 7,500 lemonade at 12%** (more volume, lower discount). |
| 9 | The buyer agent accepts the quantities and holds out for 15%. That's within John's limits, so **John isn't asked**. | |
| 10 | | The seller agent is out of room (15% is over its 12%) and hands Alex a decision card: two offers side by side, **v3a (15% · Net15)** and **v3b (15% with the Ginger Ale bundle, Net30)**, both picked to start; picking neither declines. |
| 11 | | Alex taps **Send both**. *(person 2 of 3)* **v3a** and **v3b** go to the buyer agent. |
| 12 | The buyer agent weighs v3a against v3b (the bundle, in its thinking), recommends **v3a**, says why not each of the others, and **asks John** (the terms change from Net30). John can pick v3a or v3b. | |
| 13 | John approves. *(person 3 of 3)* The quote is approved on both sides. | Q-1042 shows approved. |
| 14 | Order **O-5531** is placed: **19,500 units, 15%, Net15**. | The order arrives. The dashboard updates: the approval clears, **Orders +1**, the **Germany** bar grows, and on the campaign card Isar **converts**, its biggest order yet and the campaign's 62nd conversion (Converted 61 → 62, Attributed $412,300 → $481,915); confetti falls in three bursts and a conversion card comes in at the bottom right and stays. The Sales tile goes from $956K to $1.03M. A beat later, a macOS notification from **Gmail**: "Order confirmation sent", O-5531 to John Müller, Isar Bottling (2026-10-25). |
| 15 | The order is saved as the template **"Oktoberfest stock-up"** for next year. John's agent sees Oktoberfest is yearly (it checks 2027's dates on oktoberfest.de, in its thinking only), offers the template with a reminder on Aug 16, 2027, and **John taps Save template** (2026-10-25). The agent confirms with a "Recurring order saved" card. | |

**Built so far (2026-10-25): steps 1–15.** Fizz's agent receives the hold-out, hands Alex the decision card,
and sends v3a and v3b once he picks "Send both" (the only option scripted). On the phone, John's agent weighs the
two offers (always stacked on the phone, never side by side), recommends v3a and says why not the others, and John
approves it. The agent accepts v3a, places O-5531 and logs the PO; the Command Center gets the acceptance and the
order, and the dashboard updates (Orders 189, Germany 59, O-5531 in Recent activity). Step 15: on from the order, John's agent thinks ahead (Oktoberfest's 2027 dates, from oktoberfest.de), offers "Oktoberfest stock-up" as a template card (lines, last terms, reminder Aug 16, 2027; Save template or Not now), and John saves it. Only Save template plays on.

**The cross-sell: a bundle (settled 2026-10-24).** Upsell is the seller agent's v2 (more volume, lower
discount). Cross-sell is a **bundled offer: +1,000 Ginger Ale concentrate, keeping 15% at Net30**. It brings in
two parts of B2B commerce, bundles and cross-sell. Display only: nobody takes it and the order doesn't change.
- **Ginger Ale is new.** It isn't sold on its own in the store, and appears only inside the bundle.
- ~~**The storefront gets a Bundles row.**~~ Dropped 2026-10-25 (not needed): the bundle shows only in the offers.
- **John's agent sees the bundle and weighs it**, then recommends Net15 to John. It shows this in its thinking.
  Its reasons:
  1. Ginger Ale isn't on Isar's approved product list, so taking it is outside the agent's limits (§7). A new
     concentrate would also need quality sign-off first.
  2. There's no demand plan for it in SAP IBP. 1,000 units is about 1 million litres of a drink Isar has never
     sold, ordered just before Oktoberfest.
  3. The money: the bundle adds about $3,570 of unplanned stock. Net15 means paying 15 days early, which costs
     about $115 in cash (at 4% a year on $69,615).
- **Alex's choices change (settled 2026-10-24; card redone 2026-10-25):** the two offers side by side, v3a
  (15% · Net15) and v3b (the bundle), both picked to start; picking neither declines. The bundle was set up by
  **Margret Reyes's agent** (Margret is the Sales Director, Alex's manager), and the card says so. Alex sends both, so the buyer gets v3a (15% · Net15) and v3b (the bundle). John's agent
  recommends v3a, **and says why not each of the others** (why not the bundle, why not hold out at Net30), and John
  approves v3a. People still step in 3 times; the final order stays 19,500 units · 15% · Net15. Prices are dummy
  ($4.20 a unit).

**Assign (step 3)** is the one trigger for the buyer agent (settled 2026-10-24, replacing John's typed
prompt). Its reasoning sets up what follows: Mike's cart covers Frankfurt; Munich runs the same Oktoberfest
weeks and has nothing ordered, which leads to the forecast and the orange line (step 4); one order and "Fizz's
best price" lead to the quote and the negotiation (steps 5–9).

*Superseded:* John's prompt, "Oktoberfest is three weeks out. Top up our cart for Munich, then get Fizz's best
price."

**Why the agents stop where they do:**
- **Step 9 (no ask):** the buyer agent is inside John's spend and discount limits, so it doesn't bother him.
- **Step 10 (ask Alex):** 15% is over the seller agent's 12% limit. Only a person can trade Net30 for Net15
  to make 15% work.
- **Step 12 (ask John):** v3a is a new version with new terms. An approval belongs to one version, so a change
  means a new check.

## 6. Settled story changes (2026-10-23)

These override the PDF and any earlier brainstorm:

1. **No ABC Corp.** No second vendor, no comparing suppliers, no "the agent also shopped elsewhere". Only Fizz
   Drinks.
2. **One cart.** Mike and John use the **same** cart ("Oktoberfest stock-up"). Mike's agent added the
   lemonade; John's agent adds the orange to that cart. There are no two carts and no merge step.
3. **Mike isn't on screen.** He's present through the notification, his cart lines and "Mike sees it" in
   step 4.
4. **The PDF's flow is replaced by ours.** In the PDF the agent prods Mike, and the final cart is "15K,
   7.5K". Ours is the table in §5 (final: 12,000 orange + 7,500 lemonade = 19,500).

## 7. Agent rules (from the PDF)

**Each agent has limits its company sets.**

| Buyer agent (set by the bottler) | Seller agent (set by Fizz) |
|---|---|
| Which suppliers and products | Discount ceiling (12% at Net30) |
| Spend limits (apply across all of the bottler's agents) | Payment terms (Net30 default; Net15 needs a person) |
| Approval thresholds (when to ask John) | Credit |
| | Substitutions |
| | Delivery |

**Approvals:**
- **Seller approval ≠ buyer approval.** Each side runs its own checks. Alex approving doesn't approve it for
  John, and the other way round.
- **An approval belongs to one offer version.** Any change in price, quantity, spec, delivery or terms makes
  a new version, and a new check.
- **Check before ordering:** permissions, pricing, credit and availability, then place the order.

**How the parts connect (the PDF's diagram):**

```
Buying team + buyer policies                                   Selling team + seller policies
          │                                                                 │
     Buyer agent  ──── quote, versions, PO, acknowledgement ────  Seller agent
          │              and order lifecycle events                         │
Procurement + budget services                    Commerce, pricing, credit + fulfillment services
```

## 8. Offer versions and numbers

All numbers are dummy.

| Version | From | Orange (Munich) | Lemonade (Frankfurt) | Total | Discount | Terms | Result |
|---|---|---|---|---|---|---|---|
| **v1** | Buyer agent | 10,000 | 5,000 | 15,000 | 15% | Net30 | Over the seller's 12% limit |
| **v2** | Seller agent | 12,000 | 7,500 | 19,500 | 12% | Net30 | Buyer takes the quantities, holds out for 15% |
| **v3a** | Alex (via seller agent) | 12,000 | 7,500 | 19,500 | 15% | **Net15** | John approves |
| **v3b** | Alex (via seller agent) | 12,000 | 7,500 | 19,500 (+1,000 Ginger Ale) | 15% | Net30 | Shown, not taken |

- Quote: **Q-1042**. Order: **O-5531**. Template: **"Oktoberfest stock-up"**.
- Forecast: **Munich +40%** for Oktoberfest.
- Prices are dummy, in US dollars: $4.20 a unit, v3a from $69,615. The dashboard figures are as built.

## 9. Screens

Wireframes are in Figma: <https://www.figma.com/design/lWnasgbunlULMbH2GTkdy6/Untitled>.
The top is a swimlane user flow (frame `7:2`: Mike, John, buyer agent, seller agent, Alex across 9
columns). Below it, 1440×900 frames, with NEW tags marking what each step adds.

**v2 (added 2026-10-24), below everything above:** a new swimlane flow with the cross-sell (frame `36:3`) and
split-screen wireframes **W1–W10** (phone + Command Center + who's-acting bar; W1 is `38:5`, W2–W10 are
`39:4` … `39:765`). W7 shows Alex's three options, including the bundle (+1,000 Ginger Ale, keeps 15% at Net30),
shown but not taken. The older frames below are kept as they were.

**Buyer (John's storefront + agent sidebar)**

| Frame | Node | Shows | Steps |
|---|---|---|---|
| B1 | `8:2` | Home, "Mike started a cart" notification | 1 |
| B2 | `8:80` | The cart with Mike's 5,000 lemonade | 2 |
| B3 | `8:135` | Cart + agent sidebar, John asks | 3 |
| B4 | `8:214` | The agent adds 10,000 orange to the same cart | 4 |
| B5 | `8:300` | Quote request Q-1042 v1 sent | 5 |
| B6 | `8:397` | Counter v2 arrives, the agent holds at 15% (no ask) | 8–9 |
| — | `8:498` | Buyer waits (no new screen) | 10–11 |
| B7 | `8:501` | v3 needs John's approval | 12 |
| B8 | `8:605` | John approves, order O-5531 placed, template saved | 13–15 |

**Seller (Alex's Command Center + agent sidebar)**

| Frame | Node | Shows | Steps |
|---|---|---|---|
| S1 | `6:424` | Command Center, a normal day, nothing waiting | 1 (2–4: no action) |
| S2 | `6:530` | Q-1042 lands in "Needs your approval", "Agent handling" | 5 |
| S3 | `6:628` | Alex clicks; the sidebar shows the work done (checks, v2 sent, buyer pushed back) | 6–9 |
| S4 | `6:752` | Decision card: Net15 (recommended) or Decline; Alex picks Net15 | 10–11 |
| S5 | `6:876` | v3 sent, waiting on the buyer | 11–12 |
| S6 | `6:994` | Approved on both sides, order received, dashboard updated | 13–14 |

## 10. How it's built (2026-10-25)

- **Code:** `src/a2a/`, apart from `src/chat` and `src/desktop`. Page: `/#a2a`. Copy in `src/copy/copy.ts` (`copy.a2a`).
- **One screen:** John's iPhone with the storefront and his agent on the left, Alex's Command Center and
  the seller agent's drawer on the right, the "who's acting" bar below (§4).
- **Scripted, no live LLM.** One shared story state drives both sides, so a move on one side shows up on the other.
- **Presenter keys:** ` pauses and plays the whole demo (story clock, timers, animations); Shift+` restarts it; **C** opens a secret contents menu (top left, dark glass) to jump to any of the 15 steps, which restarts the story from where that step begins.
- **Sounds** (`src/a2a/sounds.ts`, Mixkit, free): a tone when Mike's notification reaches John after login,
  and a woosh with Gmail's "Order confirmation sent" notification on Alex's Mac after O-5531.

## 11. Out of scope

- ABC Corp or any second vendor; supplier comparison.
- More than one cart; merging carts.
- Mike on screen, or Mike approving anything.
- A live LLM, real Salesforce data, real login.
- The fulfillment lifecycle past "order received" (shipping events), unless we add it later.

## 12. Open questions

1. ~~**Surfaces**~~ Settled 2026-10-23: one split screen, the storefront on a phone on the left and the
   Command Center on the right (§4). Still open: how John's agent opens on the phone, and how wide each side is.
2. ~~**Branch**~~ Settled: built on `master`; features that need one get their own branch on Somnath's say (e.g. `a2a-pause-restart`).
3. ~~**Look:**~~ Settled: straight to a styled storefront and Command Center (built).
4. ~~**The bottler's name**~~ Settled: **Isar Bottling** (Munich and Frankfurt).
5. ~~**Does Mike approve anything?**~~ Settled 2026-10-25: no. John approves alone.
6. ~~**Real-feeling numbers:**~~ Settled: US dollars on both sides, $4.20 a unit, and the dashboard figures as built (§8).
7. ~~**Cowork frame**~~ Settled 2026-10-23: a generic AI chat app shell, not Cowork. Its design is as built.
8. ~~**Step 15**~~ Settled 2026-10-25: the agent offers the template; John saves it.
9. ~~**The cross-sell step**~~ Settled 2026-10-25: the cross-sell is the bundle (v3b, +1,000 Ginger Ale concentrate), §5.
10. ~~**The Figma wireframes**~~ Settled 2026-10-25: no need to redo them as phone frames.
