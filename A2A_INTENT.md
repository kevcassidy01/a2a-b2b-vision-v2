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
| **Buyer agent** | John's agent | [Bottler] | | In John's sidebar |
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
- **The store isn't the main thing.** The real storefront is built from LWR components that don't look
  great, so for the demo we recreate a big drinks brand's mobile site (PepsiCo or Coca-Cola style) under
  another name.
- **The agent is the main thing.** John's agent can look more Salesforce, more futuristic and agentic, or
  like ChatGPT's mobile app (not unique, but not generic either). To be decided.
- How the agent opens on a phone is still to be designed; the desktop wireframes show a docked right sidebar.

**Right: Alex in the Fizz Command Center.**
- A sales dashboard (accounts, orders, revenue by region, a **"Needs your approval"** panel).
- In the story it lives inside Cowork. On screen it sits in **a shell of our own that reads as an AI chat
  based app**, not Cowork or ChatGPT specifically. Somnath will design that shell with Claude.
- **The shell:** a glass sidenav, thinner than Claude's but not too thin, with light bending a little at
  the curved corners. The main content area is a **white layer, slightly padded in from the shell**, so the
  glass surrounds the whole white layer and becomes the sidenav on the left.
- **The Command Center fills the white layer.** Today it opens in Cowork as a full-screen artifact (like
  Claude's full-screen MCP display mode: centered, with its own width and side padding). Our AI app only gets
  part of the viewport, so we cut the side padding down, maybe to nothing, and the Command Center takes the
  whole width of the main content area.
- The **seller agent** is a docked right chat sidebar (not floating).
- **Shells come first:** the iPhone and the AI app shell get designed before anything inside them.

**Under both: the "who's acting" bar (added 2026-10-24).** A thin dark bar along the bottom of the stage,
four equal parts: **John · John's agent · Alex's agent · Alex**. The acting part lights up; the rest stay
dull. Each story step (§5) names who acts, and the bar follows. No status text.

*Superseded the same day:* a toggle with three views (Storefront, Command Center, and Both as two agent chat
feeds side by side).

## 5. The story: 15 steps

People step in **3 times**: **John starts it** (step 3), **Alex picks Net15** (step 11), **John approves**
(step 13). Agents do everything else.

| # | Buyer side (John) | Seller side (Alex) |
|---|---|---|
| 1 | John logs in. A notification: **"Mike started a cart."** | Alex goes about his day in the Command Center. |
| 2 | John opens the cart **"Oktoberfest stock-up"**. It holds Mike's **5,000 lemonade concentrate** (Frankfurt), added by Mike's agent. | |
| 3 | John opens the agent sidebar: **"Oktoberfest is three weeks out. Top up our cart for Munich, then get Fizz's best price."** *(person 1 of 3)* | |
| 4 | The agent reads the demand forecast (**Munich +40%**) and adds **10,000 orange concentrate** (Munich) to the **same cart**. Mike sees it. | |
| 5 | The agent turns the cart into quote request **Q-1042 v1**: 15,000 units, asking **15%** off, **Net30**. | Q-1042 lands in **"Needs your approval"**, tagged **"Agent handling"**. |
| 6 | | Alex clicks it. The seller agent's sidebar opens with its work already done. |
| 7 | | The seller agent checks stock, account pricing and discount policy: **up to 12% at Net30**. |
| 8 | Counter-offer **v2** arrives. | The seller agent sends **v2**: **12,000 orange + 7,500 lemonade at 12%** (more volume, lower discount). |
| 9 | The buyer agent accepts the quantities and holds out for 15%. That's within John's limits, so **John isn't asked**. | |
| 10 | | The seller agent is out of room and hands Alex two choices: **"Offer 15% · Net15 (recommended)"** or **"Decline"**. |
| 11 | | Alex picks **Net15**. *(person 2 of 3)* **v3** (15%, Net15) goes back. |
| 12 | The terms changed (Net30 → Net15), so the buyer agent **asks John to approve v3**. | |
| 13 | John approves. *(person 3 of 3)* The quote is approved on both sides. | Q-1042 shows approved. |
| 14 | Order **O-5531** is placed: **19,500 units, 15%, Net15**. | The order arrives. The dashboard updates: the approval clears, **Orders +1**, the **Germany** bar grows. |
| 15 | The order is saved as the template **"Oktoberfest stock-up"** for next year. | |

**A cross-sell step is coming (added 2026-10-23).** The story gets one more step that shows a cross-sell.
It's display only: the buyer doesn't take it, so nothing about the order changes. Where it goes and what it
shows are to come from Somnath; the step numbers above stay as they are until then.

**John's prompt (step 3)** is the one trigger for the buyer agent. Each part sets up what follows:
"three weeks out" sets the deadline, "our cart" means Mike's cart, "for Munich" leads to the orange line
(step 4), and "Fizz's best price" leads to the quote and the negotiation (steps 5–9). The prompt stays
simple: John doesn't mention the forecast; the agent reads it on its own.

**Why the agents stop where they do:**
- **Step 9 (no ask):** the buyer agent is inside John's spend and discount limits, so it doesn't bother him.
- **Step 10 (ask Alex):** 15% is over the seller agent's 12% limit. Only a person can trade Net30 for Net15
  to make 15% work.
- **Step 12 (ask John):** v3 is a new version with new terms. An approval belongs to one version, so a change
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
| **v3** | Alex (via seller agent) | 12,000 | 7,500 | 19,500 | 15% | **Net15** | John approves |

- Quote: **Q-1042**. Order: **O-5531**. Template: **"Oktoberfest stock-up"**.
- Forecast: **Munich +40%** for Oktoberfest.
- Unit prices, totals in currency and the dashboard figures are still to be set (§12).

## 9. Screens

Wireframes are in Figma: <https://www.figma.com/design/lWnasgbunlULMbH2GTkdy6/Untitled>.
The top is a swimlane user flow (frame `7:2`: Mike, John, buyer agent, seller agent, Alex across 9
columns). Below it, 1440×900 frames, with NEW tags marking what each step adds.

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

## 10. How we'd build it (proposed, not agreed)

- **Code:** a new `src/a2a/` folder, apart from `src/chat` and `src/desktop`.
- **One screen:** a phone frame with the storefront on the left, the Command Center on the right (§4).
- **Scripted, no live LLM.** One shared state machine drives both sides, so a move on one side shows up on
  the other. A reset key starts over.
- **Borrowed pieces:**
  - From `src/chat`: ToolTimeline, ThinkingIndicator, MessageBubble, PermissionCard, the script pattern and
    the `viz` charts (the dashboard).
  - From `src/shell`: the composer, dictation, PromptEditor.
  - From `src/desktop/cowork`: maybe parts of the chat chrome for the seller shell (it isn't Cowork, so only
    what fits).
- **Nothing is built until this doc is agreed.**

## 11. Out of scope

- ABC Corp or any second vendor; supplier comparison.
- More than one cart; merging carts.
- Mike on screen, or Mike approving anything.
- A live LLM, real Salesforce data, real login.
- The fulfillment lifecycle past "order received" (shipping events), unless we add it later.

## 12. Open questions

1. ~~**Surfaces**~~ Settled 2026-10-23: one split screen, the storefront on a phone on the left and the
   Command Center on the right (§4). Still open: how John's agent opens on the phone, and how wide each side is.
2. **Branch:** build on `master`, or a new branch (e.g. `a2a-prototype`)? Needs Somnath's go-ahead either way.
3. **Look:** start from the wireframe, or go straight to a styled storefront and Command Center?
4. **The bottler's name** (and its logo).
5. **Does Mike approve anything?** Currently no; John approves alone.
6. **Real-feeling numbers:** unit prices, currency (€?), order total, and the dashboard's figures.
7. ~~**Cowork frame**~~ Settled 2026-10-23: a generic AI chat app shell, not Cowork. Still open: its design
   (Somnath to design it with Claude).
8. **Step 15:** does John save the template himself, or does the agent offer it?
9. **The cross-sell step** (§5): where it goes and what it shows. Somnath will share the details.
10. **The Figma wireframes** are desktop storefront frames. Redo the buyer side as phone frames?
