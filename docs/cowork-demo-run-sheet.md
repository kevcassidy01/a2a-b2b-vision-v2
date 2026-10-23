# Claude Cowork × Salesforce: demo run sheet

**For:** Aaron · **Event:** PAC, London · **Demo day:** Wednesday 14 October 2026

Four flows, in this order:

1. **Canary Wharf Workspaces**: a multimodal chat that turns a customer call into an order.
2. **Delivery Watch**: an agent that keeps orders and carts moving.
3. **Growth Scout**: an agent that wins back lapsed buyers.
4. **Morning Brief**: a scheduled task that runs overnight and is read the next morning.

**How to read this sheet**

- **▶ YOU** is something you do: a click, a drag, the mic, or a line to say.
- **→** is what Claude does on its own. Let each **→** step finish before your next action.
- Everything is scripted, so nothing depends on the network or on live Salesforce data.

---

## 0. Before you start

▶ **YOU:** Hard-reload the demo page (⌘⇧R), so every flow starts fresh.
→ The Mac desktop shows three files on the right: *Canary Wharf call notes.txt*, *CanaryWharf_Floorplan_L1-L3.pdf* and *Comms room.jpg*.
→ The Claude window is open on **New**. The sidebar has two **New session** rows (the two agents).

---

## 1. Canary Wharf Workspaces (multimodal chat)

**The story:** you're just off a call with Canary Wharf Workspaces in Manchester. Priya Shah signs off and Tom Reilly runs IT. Claude reads everything, does 8 tasks itself, and brings you only the 4 decisions that need you.

### Start

▶ **YOU:** Click **New** in the sidebar.
▶ **YOU:** Drag **Canary Wharf call notes.txt** from the desktop onto the prompt box.
▶ **YOU:** Drag **CanaryWharf_Floorplan_L1-L3.pdf** onto the prompt box.
▶ **YOU:** Drag **Comms room.jpg** onto the prompt box.
→ Three file chips sit above the text.
▶ **YOU:** Click the **mic**.
→ Your prompt types itself in, then the recording stops on its own.
▶ **YOU:** Click **Send**.

### Claude reads everything

→ The sidebar row **"Canary Wharf Manchester quote"** appears at the top.
→ **Ran skill /account-360.**
→ It reads your files: 18 access point spots, 4 × SW-24 switches, no UPS.
→ It listens to the Gong call: a progress bar runs along the 41:12 recording, then it pulls out the key moments.
→ It searches Gmail and finds Tom's "Manchester requirements" email. The 2 attachments open one at a time.
→ It reads Slack: Jun has PoE capacity to spare.
→ It reads Salesforce: the cart, the partner agreement and stock.
→ **What I found:** the floor plan is out of date, so it needs 20 access points. The SW-24s can be reused (saving $4,600). There's no UPS in the photo. Another vendor offered $410 an access point.

### Claude does 8 tasks on its own

→ It pins its **plan** above the prompt box.
→ For each task, **Writing to Salesforce** shows the records landing one by one, and the task ticks off when done:
→ It updates the cart and quote Q-20511 (total $14,360).
→ It adds Jess and Marta as contacts.
→ It gives Jess access.
→ It sets the ship-to address.
→ It reserves 20 access points.
→ It runs **/reorder** for the room-kit list.
→ It creates the phase 2 quote Q-20514 ($12,800).
→ It sets a Slack reminder to chase Priya on Fri 16 Oct, and Slackbot's banner pops.
→ It shows the **"Done on my own"** table (17 records).

### The 4 decisions that need you, one at a time

**Decision 1: price**
→ A Gong tile shows Priya's words at 23:14.
▶ **YOU (optional):** Click the timestamp to play the clip.
▶ **YOU:** Click the **mic**. It says *"Match them on the access points."*
▶ **YOU:** Click **Send**.
→ The access points are priced at $410 (quote $14,160), and the quote approves itself.

**Decision 2: power**
→ It proposes a UPS and 2 surge power strips (+$1,130).
▶ **YOU:** Click the **mic**. It says *"Yes, add the UPS and the power strips."*
▶ **YOU:** Click **Send**.
→ The quote is now $15,290.

**Decision 3: terms**
→ Marta asks for a PO with net 30 terms.
▶ **YOU:** Click **Approve terms**.

**Decision 4: the email**
→ The email to Priya and Tom is drafted.
▶ **YOU:** Click **Send**.
→ The receipt: 9 sources, 10 records, **~6 minutes instead of ~3 hours plus ~3 days**.

### The customer orders

▶ **YOU:** Pause for about 5 seconds.
→ A Slack banner: *"Priya accepted Q-20511…"*
→ The order card **ORD-20977** lands: **"Canary Wharf has ordered."** The channel is told, the install is booked and Friday's reminder is cleared.

---

## 2. Delivery Watch (agent)

**The story:** an agent that watches every open order and cart for 60 days. It fixes what it can within policy and brings you the rest.

### Start

▶ **YOU:** Click the first **New session** row in the sidebar.
▶ **YOU:** Click the **mic**.
→ It types *"Watch every open order and cart for the next 60 days…"*, with one natural pause, and stops on its own.
▶ **YOU:** Click **Send**.

### Claude sets up the agent

→ The sidebar row's title becomes **Delivery Watch**.
→ *"…so I'll set up an agent."* **Ran skill /agents.**
→ The integrations steps fill in: 6 Salesforce calls, then Slack, then Gmail.
→ KPI tiles: **Open orders 38 · Active carts 21 · Order lines traced 214 · Warehouses 5.**
→ *"By hand that's most of a day…"*
→ **12 orders and carts at risk, $258,700.** 9 it can fix, 3 need you.
→ The agent card appears.

### The agent goes live

▶ **YOU:** Click **Start agent**.
→ The card folds to **"Created agent: Delivery Watch"**.
→ About 5s later: a card says it **split-shipped Brandt Bau**, with a Slack banner.
→ About 10s: it **held stock for Kessler**, with a Slack banner.
→ About 15s: it **woke on a Vantage delay**, with a Slack banner.
→ Four chips appear.

### The report

▶ **YOU:** Click **"Give me a Delivery Watch report"**.
→ The dashboard: **$160K saved · on-time 91% → 98% · at risk 12 → 4.** It's saved under **Artifacts** in the right panel.
▶ **YOU (optional):** Click the expand button to show the full page, then close it.
▶ **YOU:** Say *"It's working."* Move on; the agent keeps running in the background.

---

## 3. Growth Scout (agent)

**The story:** an agent that sends each lapsed account an approved quote with 5% off, plus one product they're likely to add. It runs daily for a week.

### Start

▶ **YOU:** Click the other **New session** row in the sidebar.
▶ **YOU:** Click the **mic**.
→ It types *"For any account that hasn't ordered in 30 days, send them an approved quote… 5% off… Run this daily for a week…"*
▶ **YOU:** Click **Send**.

### Claude sets up the agent

→ The sidebar row's title becomes **Growth Scout**.
→ *"…so I'll set up an agent."* **Ran skill /agents.**
→ The integrations steps fill in, Salesforce first, including one more product picked for each account.
→ KPI tiles: **Lapsed accounts 614 · Order lines read 18,240 · Products picked for them 614 · Quotes $2.88M.**
→ **"Win-back quotes, ready to send"**: a 12-row table with an "Also picked" column.
→ A sample email to Tavistock: the quote, plus *"Also picked for you: AP-7 licence renewal."*
→ The agent card appears.

### The agent goes live

▶ **YOU:** Click **Start agent**.
→ The **Win-back dashboard** lands under **Artifacts**.
→ About 5s later: the first result card arrives with a Slack banner, and the dashboard ticks up.
→ About 10s: the second result card, with a Slack banner.
→ About 15s: the third result card. **Tavistock ordered and added the renewal**: $18,528, of which $5,760 is the add-on.
→ Chips appear.

### The 3 quotes that need you

▶ **YOU:** Click **"Show me tasks that need my input"**.
→ The **Corran Logistics** card: recommended add-on of 36 SFP+ optics, $19,665 → $23,085, with *"Why I picked this"* and its sources.
▶ **YOU:** Click **Add and send**.
→ **Writing to Salesforce**: the quote line, the quote and the email land.
→ The **Mistral Hotels** card: 4 RT-5 guest routers, $15,960 → $18,520.
▶ **YOU:** Click **Add and send**.
→ **Writing to Salesforce**: the records land.
→ **Brockley Labs** is held for a credit hold, with nothing suggested. Then *"That's the 3: 2 sent…"*

### Change the discount

▶ **YOU:** Click the **mic**. It says *"Change the discount to 10%… for the rest of the week."*
▶ **YOU:** Click **Send**.
→ *"Done: 10% off from tomorrow's 7 AM run…"*
→ The dashboard is posted again with the rest of the week projected (hatched bars): **~251 orders, ~$1.07M**, of which ~$105K is add-ons.
▶ **YOU:** Move on.

---

## 4. Morning Brief (scheduled task)

**The story:** set up on Wednesday, it runs overnight and is ready Thursday morning. It covers your accounts, your store, your inbox and Slack, and both agents' work.

### Set it up (Wednesday)

▶ **YOU:** Click **Scheduled** in the sidebar.
▶ **YOU:** Click the **Daily briefing** template.
→ **Ran skill /schedule.**
→ *"How scheduled tasks work in Cowork"*: what they are, when they run, and where the results land.
→ *"A few questions to set up your daily brief"*: How often · Go through · Ready by · Give me.
▶ **YOU:** Click the **mic**.
→ It types *"Every weekday morning. Go through my accounts, my store, my inbox and Slack, and what both my agents did overnight. Have it ready by 9 AM…"*
▶ **YOU:** Click **Send**.
→ **"Here's what I've got"**: a table of your 4 answers.
→ The integrations steps fill in: Salesforce, Calendar, Gmail, Slack.
→ *"Your first meeting most days is at 10:00 AM, so I'll run it at 8:30."*
→ The **Schedule task** card appears.
▶ **YOU:** Click the **mic**. It says *"And Slack me when it's ready."*
▶ **YOU:** Click **Send**.
→ The old card folds to "Updated below". The new card adds step 6, *"DM Aaron on Slack when it's ready"*.
▶ **YOU:** Click **Schedule**.
→ **"Created scheduled task: Morning Brief."**
→ *"Your first one is ready tomorrow, Thursday 15 October, by 9 AM."*

### Jump to Thursday morning

▶ **YOU:** Say *"It's Thursday morning now."*
▶ **YOU:** Press **Ctrl+S**.
→ The menu-bar clock jumps to **Thu 15 Oct, 8:52 AM**.
→ A Slack banner from Claude: *"Your daily brief is ready."*
▶ **YOU:** Close the banner. It's Slack's, so clicking it doesn't open Cowork.
▶ **YOU:** Click **Scheduled** in the sidebar.
▶ **YOU:** Click the **Morning Brief** card.

### Read the brief

→ It opens full screen and loads section by section, in about 3 seconds:
→ **Summary**, with tiles: Focus today 6 · At risk 4 · Store fixes 4 · Handled 836.
→ **Today's focus**: 6 items, each with an owner and a source.
→ **Accounts at risk**: 4 accounts.
→ **Store health, what to fix**: 4 issues.
→ **Your Slack reminders for today.**
→ **Handled without you.**
→ **Next best actions.**
▶ **YOU:** Scroll to **Store health**.
▶ **YOU:** Click **Fix issue** on the payments row.
→ **Writing to Salesforce**, then **"Wrote 8 records"**.
▶ **YOU:** Close the brief (✕).

### The one ask the agents held overnight

→ *"**One ask waited for you.** Your agents handled 836 things overnight on their own; Delivery Watch held this one, because it adds freight."*
→ A choice card: *Whitcombe Schools: 8 SW-24 switches are backordered until Tuesday, and their term starts Monday. Ship in two?*
▶ **YOU:** Click **Ship the 60 access points now** (Recommended).
→ **Writing to Salesforce**: 2 fulfillment orders, the order summary and the email, then **"Wrote 4 records"**.
→ *"**Delivery Watch has it from here**… without coming back to you."*

### Act on the brief, in your own words

▶ **YOU:** Click the **mic**.
→ It types *"Approve Hartwell's quote with a 5% promo. Put AP-7 back in stock on the store from Leeds. And hold Halden & Rook's cart price till Friday, and nudge their buyer."*
▶ **YOU:** Click **Send**.
→ *"On it: three changes in Salesforce."*
→ **Writing to Salesforce** for Hartwell's quote: the quote, the promo and the email.
→ **Writing to Salesforce** for AP-7 at Leeds: the location, the stock and the availability.
→ **Writing to Salesforce** for the Halden & Rook cart: the cart and the buyer reminder.
→ Card: **Hartwell's quote approved**, $210,000 → $199,500, valid until Fri 16 Oct.
→ Card: **AP-7 back in stock**, 40 shipping from Leeds.
→ Card: **CART-3381 held** at $31,500 until Friday, buyer nudged.
→ *"3 of today's 6 focus items are cleared."*

### Hand it to the team

▶ **YOU:** Click **"Send the focus list to my team on Slack"**.
→ It's posted to **#ohana-sales-team** with the owners tagged.
▶ **YOU (optional):** Click **"Push the focus list to Asana"**.
→ **6 tasks** are created in Ohana Sales, due today.

---

## Tips

- **Mic, then Send.** Every mic line types itself and stops on its own. Then click **Send**; pressing Enter works too.
- **Let Claude finish.** Wait for each step's spinner to settle before you click; the next button appears when it's time.
- **The two agents keep working.** Their cards and banners keep arriving while you're in another flow, and their results feed Thursday's brief.
- **Artifacts.** Every dashboard is saved under **Artifacts** in the right panel and can be reopened at any point.
- **If anything looks off,** hard-reload (⌘⇧R) and restart that flow. Each flow stands on its own.
