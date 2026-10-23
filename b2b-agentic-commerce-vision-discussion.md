# B2B agentic commerce vision: discussion record

Somnath Mallela with Claude, on the `user-flow` branch of cowork-storefront, 22–23 October 2026.
This is the brainstorm behind the FigJam board. No prototype code was changed.

FigJam board: file key `iAI8B2tPDO2l9Tl5IBJFtD`

---

## 1. Why this exists

- The work is a visionary B2B agentic commerce story for leadership: Patrick (CEO) and Marc Benioff. It answers a note from the company President.
- The President's note: *"If you were to leave SF today, and you were to build a business that comes after Commerce, especially B2B commerce, what would you build that totally disrupts the business and upsets Salesforce?"*
- Somnath wants to be the one to prototype the vision and bring it to the CEO.
- The demo has to be something Marc Benioff could present at Dreamforce.

## 2. Rules that came out of the feedback

**Story content**
- The story must be about **hope**, the future of agentic B2B commerce.
- **No edge cases.** That rules out discontinued parts, grounded planes, outages, shortages and price shocks. It also rules out "early" or "ahead of schedule" triggers.
- Use the plain everyday rhythm of the business: the next phase, the next quarter, the usual cycle.
- Keep it very simple. Cutting a story down to a demo takes a world of effort, so pick ones that survive the cut.
- It must be **really B2B.** Demand comes from production plans, schedules, capacity and contracts, not from consumers. Festivals, diners and patients felt B2C. Stores were also out.
- Don't restate Somnath's existing proto (see §5).
- It must show **complex B2B workflows** and **agent-to-agent (A2A) conversations**.
- Industries outside consumer goods are fine. Consumer goods was the starting point because everyone relates to it.

**The shape every story should have** (taken from the Coca-Cola story)
- Two or more companies, with ERPs and systems on **both** sides being watched and shared.
- A **swarm of agents** on the seller side, acting for reps, AEs, managers and VPs. They act proactively with bundles, promotions and subscriptions.
- Buyer-side agents take work off procurement, so nobody has to watch everything.
- **Regular carts and orders keep running** as standard operating procedure.
- Buyers stay on whatever surface they use: WhatsApp, ChatGPT, Claude, mobile, their own agents, or just an ERP.
- People only approve at the end.

**Board copy**
- One phrase per box, in plain English.
- No em dashes, colons or semicolons. Question marks are fine on diamonds.
- Say "agent", "CCEP agent" or "Coca-Cola agent". Never say "persona agent".
- Keep finance generic. There is no Finance ERP.
- No storefront in the agent flows. Agents do the quote and cart work that people used to do.
- Notifications go inside Claude or Cowork, not Slack.

## 3. The base story: Coca-Cola and CCEP at Oktoberfest

**Setting**
- **Seller:** Coca-Cola, selling concentrate. It uses Salesforce B2B Commerce, a pricing ERP and an inventory ERP.
- **Buyer:** CCEP, a bottler, with a warehouse ERP.
- **Trigger:** Oktoberfest demand.
- **Who does what:** the process is 99% agentic, and people only approve at the end.

**Sources.** The story was reconciled from Gemini's summary, two call transcripts, and Slack comments made after the calls.

**What it's for**
- CCEP stops building forecasts in spreadsheets, so procurement has less to do.
- Coca-Cola sells proactively, without more sales headcount, while its agents watch data all the time.
- The setting is the 2028–2030 workforce, with about as many agents as people.

### The flow in four levels (FigJam section "The story in four levels")

Each step has a mono tag showing the role the agent replaces, or the person who acts.

**1. Spot the need**
- The flow starts with "Oktoberfest demand rises".
- `REPLACES DEMAND PLANNER`: the CCEP agent spots a Coke Zero shortage. It reads the CCEP warehouse ERP (dashed data line).
- `REPLACES PROCUREMENT BUYER`: the CCEP agent keeps the urgent order separate from the monthly cart.
  - Side branch: the monthly cart carries on as usual.
- `REPLACES PROCUREMENT BUYER`: it asks the Coca-Cola agent for 12,000 units at 12% off.

**2. Negotiate**
- `POLICY SET BY CRO`: the Coca-Cola agent sees the ask is over the 10% policy. It reads the Coca-Cola pricing ERP.
- `REPLACES SUPPLY PLANNER`: it finds Fanta surplus close to expiry. It reads the Coca-Cola inventory ERP.
- `REPLACES SALES REP`: it counters with a Coke Zero and Fanta bundle at 12%.

**3. Approve the deal**
- `REPLACES PROCUREMENT BUYER`: the CCEP agent checks its forecast and accepts.
- Diamond: "Over the spend limit?"
  - Yes: `PERSON, PROCUREMENT MANAGER` approves in Claude. Somnath's handwritten note here says "complex buyer workflow fits here".
  - No: the accepted quote goes to Coca-Cola.
- `REPLACES ACCOUNT MANAGER`: the Coca-Cola agent turns the seasonal order into an order template and a subscription.

**4. Close**
- Diamond: "Inside the auto-approve policy?", tagged `POLICY SET BY SALES MANAGER`.
  - Yes: a WhatsApp confirmation goes to CCEP, then "Replenishment cycle is live".
  - No: `PERSON, SALES REP` sees one card in Cowork.
    - Rep approves: the WhatsApp confirmation goes out.
    - Rep rejects: the agents get the rejection.

**The "always on" rail** (no forecast spreadsheets, no extra sales reps)
1. The CCEP agent builds the forecast from warehouse ERP data.
2. The CCEP agent shares the forecast with Coca-Cola, through Data Cloud.
3. The Coca-Cola agent watches every bottler's forecast and sells ahead.
4. It spots CCEP's seasonal pattern, which feeds the subscription.
5. Every deal sharpens the next forecast.

**What people get back**

*Sales rep at Coca-Cola*
- Stops chasing quotes and building carts by hand.
- The agent watches demand and sells ahead.
- Steps in only for deals outside policy.
- Approves or rejects one card in Cowork.
- Covers more bottlers without more reps.

*Procurement manager at CCEP*
- Stops writing forecasts in sheets.
- The agent forecasts, orders and negotiates.
- Steps in only above the spend limit.
- Approves one deal in Claude, with the reasoning shown.
- Gets time back for supplier strategy.

### Check against the "B2B Commerce Engine" slide

The slide lists: Buyer Agent (SMS and WhatsApp checkout), Agent Recommended Orders, Complex Buyer Workflows, High Scale Performance, Round Trip Quoting, Negotiated Pricing, Order Templates, Multiple Payment Types, Multi-Cart, Cart Collaboration, Promotions, Split-Shipping, Shipping Extensibility, Extensible Cart and Checkout, Checkout Profiles, Recurring Orders.

Somnath chose to add only **multi-cart** (the urgent cart next to the monthly cart) and **order templates** (seasonal orders become templates). The other gaps were dropped.

## 4. Strategy conversations

### What business looks like in 2028–2030
- Somnath's ideas:
  - Send Cowork a video of a new store, and it analyses the space and suggests machines that fit.
  - Spatial computing. Somnath sees this as more B2C.
- The question was how complex workflows, order templates and multi-cart fit in.

### Persona agents
- The SVP talked about "persona agents". The idea: everyone in the Salesforce ecosystem has their own agent, and those agents work with each other instead of people. People handle exceptions.
- **Escalation example:** a procurement manager has an over-policy quote they think is good. It goes to the procurement VP's agent, which reviews it, writes a report, and recommends approve or counter. Legal approval runs at the same time.
- OpenAI's "Dots" was looked at for reference: always-on personal agents, rules for act alone, ask first or blocked, and available in ChatGPT, Slack and Teams.

### Branding
- The brand must be very short, easy to remember, and **separate from Agentforce**.
- 10 names were offered: +1, Wing, Nod, Ditto, Proxi, Vouch, Duet, Mira, Alter, Tandem.
- Somnath liked "Echo" for a while, then said: *"Let's not worry about Echo. Use Ditto if needed."*

### Story drafts that were set aside
- **"Nobody logged in"** (the Echo story):
  - A kiosk video produces three carts and a template.
  - The demand ripple travels up to Coca-Cola.
  - Three bottlers swap stock with each other.
  - An escalation goes from the procurement manager to the VP, with legal and finance working in parallel.
  - A carrier strike forces a re-plan.
  - It ends with a subscription and connected coolers.
  - Thesis: storefronts and seats disappear, and a neutral exchange charges per deal, moving from "system of record" to "system of agreement".
- **"One deal, many seats":** rejected because it only restated Somnath's own proto.

## 5. Somnath's existing proto (already shown to customers in London and Japan)

The prototype covers four moments:
1. **"Here's my messy day."** A rep says: "hey claude, I had a call just now with Acme, here are a few notes I took. Call is on Gong." Cowork reads email threads, new attachments, a WhatsApp or Slack voice note and the Gong recording. It then builds several carts and order templates.
2. **"Protect my revenue."** A long-running agent watches the rep's accounts for 60 days, finds the ones falling behind, and sends them a promotion with their regular cart already built.
3. **"Grow my revenue."** A long-running agent finds growth accounts this week and finds the rep $100k.
4. **Daily brief.** Everything comes together in one brief.

How it's built:
- **Salesforce is the harness:** data, actions, policy, identity and authority, trust, and the runtime.
- **Claude and Cowork are the model:** understanding, planning, judgement, writing, and the surface people use.
- The "long-running agents" feature doesn't exist in Cowork desktop. It is Cowork plus Claude Managed Agents plus Salesforce.

New stories must go **beyond** this proto, not restate it.

## 6. Story rounds

### Round 1: four "disruptive" ideas
Direction: stick to consumer goods.
1. **Intent is the new catalogue.** A hospital group equips ICU wings, and eight suppliers' agents compete with bundles.
2. **Coalition commerce.** 300 independent hardware stores pool their demand to get enterprise pricing.
3. **The contract is the store.** A signed contract sets up catalogues, prices and templates, with renewals using real usage data.
4. **Outcome commerce.** A customer buys forklift uptime instead of parts.

### Round 2: consumer goods, store-based
Direction: something that isn't a store, and more B2B.
- **"The shelf orders itself"** (recommended at the time):
  - A corner shop owner sends a WhatsApp shelf video.
  - Coca-Cola, PepsiCo and Mondelez agents compete for the gaps.
  - The order becomes a cart for each supplier, with different payment for each.
  - Promotion money is released automatically once a later video proves the display.
- Alternatives: Launch in a day, The promo that settles itself, Near-date rescue.
- Follow-up question: *how does the agent know what should be on the shelf?* The answer was that it combines three things:
  - the agreed shelf plan;
  - the shop's order history;
  - sales worked out as delivered stock minus what's left.

  The order then equals what the shelf needs, minus what's on the shelf, minus what's in the back room. A full-shelf baseline video is taken at onboarding, and the agent asks one WhatsApp question about back-room stock.

### Research: B2B agentic commerce today (October 2026)
- **Protocols:**
  - Google AP2: signed mandates proving who authorised a payment. Salesforce is a partner.
  - OpenAI and Stripe ACP, and Google UCP: checkout-centric.
  - A2A, under the Linux Foundation: agents talking to agents.
  - MCP: agents using tools.
  - x402: machine micropayments.
- **Visa, BILL and Billtrust pilot (20 Oct 2026):** a buyer's agent pays supplier invoices, and the supplier's platform verifies the agent through Visa's Trusted Agent Protocol. It's the first live case of one company trusting another company's agent, and it covers payment only.
- **Pactum:** autonomous negotiation for the buyer side only. Walmart uses it with tail suppliers.
- **HighRadius:** deduction agents on the seller's finance side. It cites a Coca-Cola bottler case of $33.4M recovered (vendor claim).
- **commercetools:** "Autonomous Commerce" and a B2B order agent.
- **Forrester Predictions 2027:** AI shifts control to buyers.
- **Unverified:** the Gartner claim that "90% of B2B buying will be agent-led by 2028". Don't quote it until it's checked.
- **Internal:**
  - Consumer Goods Cloud trade promotion management.
  - "Agentforce for Retail Execution".
  - A Slack channel for an "Agentic Commerce Vision" team, worth checking.
- **Gaps nobody fills yet:**
  - Agents negotiating on both sides.
  - A contract turning straight into orders.
  - Settlement and disputes between two companies' agents.
  - Agent identity and authority across companies.

### Round 3: non-store B2B, "The deal that runs itself"
Coca-Cola and PepsiCo agents bid for a 400-hotel beverage contract. The contract becomes 400 order templates, and rebates and disputes are settled by agents. **Direction: go bigger.**

### An earlier storyline
https://kevcassidy01.github.io/agentic-b2b-commerce/storyline.html

- **"The Conversational Storefront":** Jordan (Corner & Co.), Alex (Midtown Market) and a Coca-Cola agent team.
- **Three steel threads:**
  - Launch a new store.
  - Delegated buying with authority checks.
  - Purchase patterns to trusted autopilot.

### Round 4: five A2A blurbs
1. Price increase season: 300 negotiations in a week.
2. Ditto at the summit: the joint business plan is agreed by Dittos the night before.
3. The plant goes dark.
4. The cross-brand bundle: Coca-Cola, Mondelez and a coffee maker sell as one.
5. The Ditto that stays: account memory survives a staff change.

Somnath then explained the Coca-Cola story's shape again (see §2) and asked for more stories like it.

### Round 5: five stories in the Coca-Cola shape
World Cup beer rush (the US three-tier rule), cocoa price shock, the salon trend, school term menus, and coffee machines asking for more.

### Buyer surfaces (the selling angle)
Somnath's point: we can't force buyers onto Claude. They may stay on WhatsApp, may or may not have ChatGPT or Cowork, and may be on mobile.

Four kinds of buyer:
1. **No AI.** WhatsApp, SMS, email or phone. The seller's agent does the agent work for them inside WhatsApp, including replies by voice note.
2. **A general assistant.** ChatGPT, Claude, Gemini or Copilot. The seller publishes an app or connector (via MCP).
3. **Their own buying agents.** Coupa, SAP or agents they built. This is A2A with identity and authority limits.
4. **ERP only.** The seller's agent reads purchase orders and EDI and replies in kind.

In real life, one buyer company is all four at once.

Rules for the seller's system:
- One deal, many views, with the deal state kept in Salesforce.
- Pick up where the buyer left off, whichever window they use.
- Mobile-first approvals: one tap, and Face ID above a spend limit.
- Who is approving matters more than which app they use.
- Respect each channel's rules, such as WhatsApp's 24-hour template rule.
- Buyer agents are treated as first-class customers.

Demo idea: "Same deal, four screens".

**Direction:** more stories, using all of this context.

### Round 6: five more stories
Summer schedule (airline caterer), festival sale-or-return, the menu launch (franchisees), festival gift packs, flu season. **Direction: make it more B2B.**

### Round 7: B2B within consumer goods
The new can (can maker and bottler), sample to contract (sweetener supplier), overflow volume (co-packer tolling), the line is wearing out (bottling equipment), fill the container (exports). Somnath then said other industries are fine too.

### Round 8: outside consumer goods
1. Last chance to buy (chips through to carmakers).
2. **The job site moves (building-materials distributor and general contractor).** Liked.
3. Aircraft on the ground.
4. Planting season (crop inputs and a co-op).
5. **The AI data centre build (server maker and data-centre operator).** Liked.

Discontinued parts and urgency were set aside as edge cases.

### Round 9: keynote versions
"The hospital that opened early" and "The AI factory that came online early". **Direction: "early" is still an edge case. Make it a lot simpler.**

## 7. The current two stories (built on the FigJam board)

Both follow the same four steps: share, propose, keep the routine going, approve.

### Next floor, already ordered (construction)
A building-materials distributor and a general contractor, in a normal week on the build.

1. **Share the plan.** `REPLACES PROJECT COORDINATOR`: the contractor agent shares the build schedule. It reads the contractor project schedule. `REPLACES INSIDE SALES REP`: the distributor agent reads what the next floors need.
2. **Propose.** All three steps are on the distributor side.
   - `REPLACES INSIDE SALES REP`: builds the order for the next floors, using the distributor stock ERP.
   - `REPLACES ACCOUNT MANAGER`: offers a fixed price for the remaining floors, using the distributor pricing ERP.
   - `REPLACES LOGISTICS PLANNER`: bundles what can ship together.
3. **Keep the routine.**
   - `REPLACES PROCUREMENT BUYER`: the contractor agent checks the order against the budget, using the contractor cost ERP.
   - The weekly order carries on as usual.
   - `PERSON, SITE FOREMAN`: confirms it on WhatsApp with one tap.
4. **Approve.**
   - `PERSON, PROJECT MANAGER`: approves the bigger order in Claude.
   - `PERSON, ACCOUNT EXECUTIVE`: the distributor's account executive approves in Cowork.
   - The flow ends with "Next floors are ordered".

Line for the stage: *"Every floor is ordered before anyone asks."*

### Next quarter, already planned (AI data centre)
A server maker and a data-centre operator that adds capacity every quarter.

1. **Share the plan.** `REPLACES CAPACITY PLANNER`: the operator agent shares next quarter's capacity plan, from the operator capacity ERP. `REPLACES SALES REP`: the server maker agent reads what the quarter needs.
2. **Propose.** All four steps are on the server maker side.
   - `REPLACES SOLUTIONS ENGINEER`: configures the right racks, using the server maker configurator.
   - `REPLACES SUPPLY PLANNER`: holds stock for each rollout, using the inventory ERP.
   - `REPLACES SALES REP`: prices it at a better tier for a year, using the pricing ERP.
   - `REPLACES ACCOUNT MANAGER`: sends the year-long rollout plan.
3. **Review together.**
   - `REPLACES ENGINEERING REVIEWER`: the engineering agent checks power and cooling, using the operator facilities ERP.
   - `REPLACES FINANCE ANALYST`: the finance agent checks the budget, using the operator finance ERP.
   - The spare-parts order carries on as usual.
4. **Approve.**
   - `PERSON, VP OF INFRASTRUCTURE`: approves one card on their phone.
   - `PERSON, ACCOUNT EXECUTIVE`: the server maker's account executive approves in Cowork.
   - The flow ends with "Next quarter's racks are on the way".

Line for the stage: *"Growth that plans itself."*

## 8. FigJam board map

| Area | Node IDs |
|---|---|
| Early Coca-Cola, arbiter and CCEP sections | 3:8, 3:43, 3:86, 3:121, 3:164, 6:237 |
| Arbiter swimlane user flow | 6:281–6:300 |
| First simple flow | 17:323 |
| Gemini user flow (the call) | 22:419–22:437 |
| Somnath's own content (don't touch) | 20:413, 20:416, 20:422, 20:429 "Cowork - Merchant", 20:436 "WhatsApp - Buyer" |
| Coca-Cola "story in four levels" | 27:703 (now at x 0, y 10944) |
| Construction story | 50:704 (x 3500, y 10944) |
| AI data centre story | 50:859 (x 5900, y 10944) |

The two new flows don't yet have the "Always on" rail or the "What people get back" stickies. Either can be added.

## 9. Open threads

- Pick which story leads, construction or AI data centre, or run both as a pair.
- Optionally add an "always on" rail and "what people get back" stickies to the two new flows.
- Possibly add a buyer-surfaces layer (WhatsApp, ChatGPT, own agents, ERP) to a flow.
- Bring the older board flows in line with "no storefront".
- Confirm the role titles used in the mono tags.
- Check the Gartner figure, and the internal "Agentic Commerce Vision" Slack channel, before pitching.
