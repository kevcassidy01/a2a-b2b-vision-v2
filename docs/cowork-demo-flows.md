# Cowork demo flows (PAC, Wed 2026-10-14)

Flow charts for the Cowork-on-a-Mac-desktop demo, drawn for a terminal. Written 2026-10-11.
Persona: **Aaron**, a Salesforce Commerce seller at Ohana Networks (networking hardware).
Sources: `COWORK_INTENT.md` (§4.5 decisions 21-45, §4.6, §4.7, §8, §8.5), `src/copy/copy.ts`
(`copy.desktop.cowork`), `src/desktop/CoworkWindow.tsx`, `src/desktop/cowork/*`.
**Update this file whenever a flow changes.**

## Legend

```
┌──────────┐  box = a screen or state          ──▶  Aaron's action (click/type/speak)
│  screen  │                                    ··▶  Claude's response / automatic step
└──────────┘                                    ◆ x?  a real branch (choice)

[built]    exists in the prototype today (v11.8.0)
(to build) decided, not built yet
(open)     not decided; chart shows the current best guess

Tools are always shown in two groups: Salesforce tools first, then the other
connectors (Gmail, Calendar, Slack, Gong...). The ecosystem working together is the point.
```

Run of show (Somnath, 2026-10-13): Canary Wharf (New + files) > Delivery Watch > Growth
Scout (the 2 "New session" rows) > Daily briefing (Scheduled). The sidenav opens with only
the 2 agents' "New session" rows; each row's mic dictates only its own agent's goal, and
Claude works out on its own that the goal needs an agent. Canary Wharf and the brief get a
row on top (newest first) when they start. The flows below keep their numbering.
Flow order isn't enforced: the brief can still go first if Aaron prefers. Both agents are commerce-led and
independent of each other (decision 50). Agent rows get a Waypoints icon, the task
gets a clock, Canary Wharf stays a plain chat.

---

## 1. Delivery Watch (agent)

Commerce outcome: orders and carts kept moving from checkout to delivery (decision 50).
Aaron speaks a prompt ("Watch every open order and cart for the next 60 days…") in a New
session. Claude decides this needs a long-running agent and proposes one. Trigger: a
Salesforce signal (order, fulfillment and cart changes), not a clock.

```
 ┌─────────────────────────────┐
 │ New session  [built]        │  sidenav row reads "New session"
 │ greeting, prompt box, banner│
 └──────────────┬──────────────┘
                │ Aaron clicks the mic (Dictate): words stream in,
                │ one hesitation, ends by itself > Send       [built]
                ▼
 ┌─────────────────────────────┐
 │ Sidenav row starts [built]  │  spinner, title types in "Delivery Watch",
 │                             │  Waypoints icon, tooltip:
 │                             │  "Wakes on order, fulfillment and cart changes"
 └──────────────┬──────────────┘
                ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Chat view after send  [built]     right panel: Artifacts · Progress ·    │
 │                                   Working folder · Context               │
 │  ··▶ "…so I'll set up an agent" + Ran skill /agents                      │
 │  ··▶ Used 3 integrations, one step at a time: 6 Salesforce Headless 360  │
 │      calls (discover, dispatch_readonly x4, get_sor_detail), Slack, Gmail│
 │  ··▶ the wow, as KPI tiles: Open orders 38 · Active carts 21 ·           │
 │      Order lines traced 214 · Warehouses 5, then "By hand that's most    │
 │      of a day…"                                                          │
 │  ··▶ 12 orders and carts at risk, $258,700 (Salesforce MCP card, top 5,  │
 │      "View all 12 →" full screen); 9 I can fix · 3 need you              │
 │  ··▶ agent card: Create agent · trigger · Details · Start agent ↵        │
 └──────────────┬───────────────────────────────────────────────────────────┘
                │ Aaron clicks Start agent (or ↵)                  [built]
                ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Agent is live  [built]   card folds to "Created agent: Delivery Watch ›" │
 │                          panel chip "Live agent", listed on Agents       │
 │  ··▶ +5s / +10s / +15s action cards  (split-ship Brandt Bau, held stock  │
 │      for Kessler, woke on a Vantage delay), each with a Slack banner     │
 │      from Salesforce that slides out at 6s                               │
 │  ··▶ chips (each reply offers the others):                               │
 │       ◆ "Give me a Delivery Watch report"                                │
 │       ◆ "Show me tasks that need my input"                               │
 │       ◆ "Which warehouse is slowing orders down?"                        │
 │       ◆ "Which orders could slip this week?"                             │
 └──────────────┬───────────────────────────────────────────────────────────┘
                │ Aaron clicks "Give me a Delivery Watch report"   [built]
                ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Delivery Watch dashboard  [built]  (Salesforce MCP card)                 │
 │  $160K saved · on-time 91% → 98% · 12 at risk → 4 (chart, 7 AM → now)    │
 │  "It's saved in your panel's Artifacts."                                 │
 │  ──▶ expand (or click it under Artifacts) = full page, refreshes live:   │
 │      Results · What it fixed · Actions · Waiting on you ·                │
 │      Next best actions:                                                  │
 │       ◆ Decide on 3 asks        → posts "Show me tasks that need…"       │
 │       ◆ Unblock Rotterdam       → posts "Which warehouse is slowing…"    │
 │       ◆ Get ahead of this week  → posts "Which orders could slip…"       │
 │      (a CTA closes the full page and sends its prompt to the chat)       │
 └──────────────────────────────────────────────────────────────────────────┘
 Aaron says "it's working" and moves on to Flow 2; the cards keep landing.
 Later (spoken, "I slept..."): wakes overnight, results feed the brief (see 3)
```

Status (2026-10-12): all built. Commerce-led (decision 50). The first sweep's stats are the
browser chat's KPI tiles, the report is a dashboard (decision 52), and every dashboard sits in
the right panel's Artifacts section, which is shown in every session (decision 53).

---

## 2. Growth Scout (agent)

Commerce outcome: lapsed buyers win back with quotes that turn into orders (decision 50,
from Aaron's own prototype notes, 2026-10-12). Independent of Delivery Watch: its own
prompt, data and results, and no hand-offs between the two. Daily at 7 AM, for 1 week.

```
 ┌─────────────────────────────┐
 │ New session  [built]        │  (the 2nd agent row; its mic holds this prompt)
 └──────────────┬──────────────┘
                │ mic > words stream > Send                [built]
                │ "For any account that hasn't ordered in 30 days, send them
                │  an approved quote for their most-ordered product… 5% off.
                │  Run this daily for a week. Also build me a dashboard…"
                ▼
 ┌─────────────────────────────┐
 │ Sidenav row starts [built]  │  title "Growth Scout", Waypoints icon,
 │                             │  tooltip: "Runs daily at 7 AM for 1 week"
 └──────────────┬──────────────┘
                ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Chat view after send  [built]     right panel: Artifacts · Progress ·    │
 │                                   Working folder · Context               │
 │  ··▶ "…so I'll set up an agent" + Ran skill /agents                      │
 │  ··▶ integrations: Salesforce first (Order, OrderItem, a product picked  │
 │      for each account, buyer, Pricebook, Quote), then Gmail / Slack      │
 │  ··▶ the wow, as KPI tiles: Lapsed accounts 614 · Order lines read       │
 │      18,240 · Products picked for them 614 · Quotes $2.88M               │
 │  ··▶ "Win-back quotes, ready to send" (MCP card, 12 rows, full screen,   │
 │      with an "Also picked" column)                                       │
 │  ··▶ sample email (Tavistock): the quote + "Also picked for you: AP-7    │
 │      licence renewal" · in the email, never on the quote, no OK needed   │
 │  ··▶ agent card: trigger (no order in 30 days, daily) · action (quote,   │
 │      top product, average qty, 5% off) · 7 days · Start agent ↵          │
 └──────────────┬───────────────────────────────────────────────────────────┘
                │ Aaron clicks Start agent                         [built]
                ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Agent is live, day 1  [built]                                            │
 │  ··▶ Win-back dashboard (into Artifacts): quotes sent · orders · value   │
 │      (add-ons included) · added the pick, ticking up with 3 result cards │
 │      (5s apart) + Slack banners; Tavistock adds the renewal              │
 │      ($18,528, $5,760 from the add-on)                                   │
 │      full page ends with Next best actions:                              │
 │       ◆ Approve 3 waiting quotes · Nudge the unopened · Back your best   │
 │         converter (each posts its chip's prompt)                         │
 │  ··▶ chips (each reply offers the others):                               │
 │       ◆ "Show me tasks that need my input"                               │
 │       ◆ "Who hasn't opened their quote yet?"                             │
 │       ◆ "Which products are winning back the most?"                      │
 │  ──▶ or Aaron types or dictates the change:                              │
 │       "Change the discount to 10%" · "Increase discount" ·               │
 │       "Increase discount to 10% for lapsed" (any discount or %)          │
 └──────────────┬───────────────────────────────────────────────────────────┘
                │ "Show me tasks that need my input"               [built]
                ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ The 3 that need Aaron, one at a time  [built]  (decision 59)             │
 │  ··▶ Corran: Recommended add-on card, "Why I picked this" note (3 lines, │
 │      each with its source) · 36 SFP+ optics, $19,665 → $23,085           │
 │       ◆ Add and send  ◆ Send without it   → Salesforce writes, then:     │
 │  ··▶ Mistral: same card · 4 RT-5 guest routers, $15,960 → $18,520        │
 │       ◆ Add and send  ◆ Send without it   → writes, then:                │
 │  ··▶ Brockley held (credit hold, nothing suggested) · "2 sent" · chips   │
 └──────────────┬───────────────────────────────────────────────────────────┘
                │ mic: "Change the discount to 10% for the rest of the     [built]
                │ week" (or typed, any discount or %)
                ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ This week projected at 10%  [built]  (still day 1, no time jump)         │
 │  ··▶ "From tomorrow, Thursday 15 October, at 7 AM…" text reply           │
 │  ··▶ win-back dashboard posted again: 14–20 October, Wed actual, Thu–Tue │
 │      hatched; ~251 orders, ~$1.07M (~$966K quotes + ~$105K add-ons),   │
 │      609 quotes moving; Artifacts row updates (an open full page refreshes)         │
 │      full page: Projection · Where the lift comes from (5% against 10%,  │
 │      by recency) · Guardrails (all four products above floor) · Next     │
 │      best actions: Keep it going past this week · Approve the big ones · │
 │      Watch the 10% quotes land                                           │
 │  ··▶ chips: ◆ "Show me tasks that need my input"  ◆ "Extend for 30 days" │
 │  ──▶ "Stop" in any words stops the agent (off the live list)             │
 └──────────────────────────────────────────────────────────────────────────┘
```

Status (2026-10-12): all built. Day 1 is Wednesday 14 October (the demo day); the agent runs
7 days, until 20 October. Numbers: first sweep 614 lapsed accounts, $2.88M in quotes; day 1
611 sent within policy, 3 need Aaron; at 10% this week ~251 orders, ~$966K, extra discount
~$54K (3.5× back), plus ~$105K from add-ons (~$1.07M in all). Recommendations (decision 59):
each quote email suggests one product, never discounted; the 2 big quotes come as Add and
send / Send without it cards with a "Why I picked this" note. The discount is Aaron's own prompt, not a chip (decision 52). No day-7
jump (decision 54): the projection is the payoff.

---

### Artifacts (both agents, right panel)  [built]

```
 ┌───────────────────────────────┐   in an agent's own chat:
 │ Artifacts ⌄                   │     From this agent  · its dashboards
 │  From this agent              │     Other artifacts  · everyone else's
 │   ▣ Win-back dashboard     ⤢  │   in a session with none of its own:
 │  Other artifacts              │     the whole list, ungrouped, with the
 │   ▣ Delivery Watch dash…   ⤢  │     agent's name on each row
 ├───────────────────────────────┤   one row per dashboard (latest version);
 │ Progress · Working folder ·   │   click ──▶ that agent's chat, dashboard
 │ Context                       │   full screen
 └───────────────────────────────┘
```

---

## 3. Morning Brief (scheduled task)

Starts where the feature lives in Cowork: the Scheduled page's "Daily briefing" template
(decision 54). Grounded in Salesforce first, then Calendar, Gmail and both agents' results.
Not an agent: clock icon, lives on Scheduled. One day only: set up on Wed 14 October (the
demo), the brief is read on **Thursday 15 October** morning.

```
 ┌───────────────────────────────┐
 │ Scheduled page  [built]       │  6 templates, hover preview
 └──────────────┬────────────────┘
                │ Aaron clicks "Daily briefing"                   [built]
                ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ New session "Set up a daily briefing"  [built]                           │
 │  ··▶ Ran skill /schedule                                                 │
 │  ··▶ "How scheduled tasks work in Cowork" (what, when, fresh start,      │
 │      app must be open, results): the room learns the feature             │
 │  ··▶ "A few questions to set up your daily brief:" a prompt template,    │
 │      one line per answer: How often: · Go through: · Ready by: ·         │
 │      Give me: (greyed hints; never filled in)                            │
 └──────────────┬───────────────────────────────────────────────────────────┘
                │ in-chat mic > words stream > Done > Send        [built]
                │ "Every weekday morning. Go through my accounts, my store,
                │  my inbox and Slack, and what both my agents did overnight.
                │  Have it ready by 9 AM. Give me a short summary, a focus
                │  list for today, the accounts at risk and what to fix on
                │  my store."
                ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Claude sets it up  [built]                                               │
 │  ··▶ ✓ Here's what I've got: key-value table of the 4 answers            │
 │  ··▶ integrations: Salesforce (accounts; B2B store health; both agents), │
 │      Calendar (first meeting 10 AM), Gmail, Slack (reminders)            │
 │  ··▶ "…so I'll run it at 8:30: ready by 9"                               │
 │  ··▶ Schedule task · Morning Brief: summary, Weekdays at 8:30 AM,        │
 │      Ready by 9 AM, Only on this computer, Details (5 steps)             │
 └──────────────┬───────────────────────────────────────────────────────────┘
                │ mic again: "And Slack me when it's ready"       [built]
                ▼
 ┌───────────────────────────────┐
 │ Card updates  [built]         │  old card folds to "Updated below";
 │                               │  new card: + step 6 "DM Aaron on Slack",
 │                               │  "Also changes: notifications"
 └──────────────┬────────────────┘
                │ Schedule ↵ (Cancel = Esc)                       [built]
                ▼
 ┌───────────────────────────────┐        ┌───────────────────────────────┐
 │ "Created scheduled task:      │  ··▶   │ Scheduled page: Morning Brief │
 │  Morning Brief" + facts       │        │ task card above the templates │
 │ panel chip "Scheduled task"   │        │ (Weekdays at 8:30 AM, next    │
 │ "first one tomorrow, Thu 15"  │        │ run Thu 15 Oct)               │
 └──────────────┬────────────────┘        └───────────────────────────────┘
                │ (Aaron: "It's Thursday morning now.")
                │ presenter taps Ctrl+S                           [built]
                ▼
 ┌───────────────────────────────┐
 │ Slack banner from Claude:     │  menu-bar clock jumps to Thu 15 Oct
 │ "Your daily brief is ready"   │  8:52 AM; the run lands in the chat
 └──────────────┬────────────────┘  (── Thursday 15 October · 8:30 AM ──)
                │ Aaron closes the banner (it's Slack's: clicking it
                │ doesn't open Cowork) > Scheduled > Morning Brief card,
                │ or New > Jump in > Daily brief (top row, above a hairline)
                ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Morning Brief, full screen  [built]  loads section by section, ~3s       │
 │  Summary: 4 bold-led lines (Hartwell first · 4 at risk, $1.34M ·         │
 │           store losing ~$38K/wk, AP-7 · best day, 836 handled)           │
 │           + Focus today 6 · At risk 4 · Store fixes 4 · Handled 836      │
 │  Today's focus (6): checklist, owner, source pill   [Push to Asana]     │
 │      Hartwell $210K (You) · AP-7 stock (Jun) · Halden & Rook cart        │
 │      (Marcus) · 3 Growth Scout quotes (You) · checkout 18% (Jun) ·       │
 │      Brandt Bau PO (Dana)                                                │
 │  Accounts at risk (4): Hartwell · Halden & Rook · Mistral · Brockley     │
 │  Store health, what to fix (4): area links to Salesforce · what's       │
 │      wrong · lost a week · [Fix issue] ──▶ Claude fixes it, action card  │
 │  Your Slack reminders for today: Slackbot 9:00 · 11:00 · 2:00 [Slack]    │
 │  Handled without you (4) + orders by day                                 │
 │  Next best actions: Send on Slack · Push to Asana · Open in Salesforce   │
 └──────────────┬───────────────────────────────────────────────────────────┘
                │ ✕: under the brief, the one ask the agents held   [built]
                ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ One ask waited for you  [built]  (decision 60)                           │
 │  ··▶ "836 things handled overnight; Delivery Watch held this one"        │
 │  ··▶ one-click choice: Whitcombe Schools, 8 SW-24 backordered to Tue,    │
 │      term starts Mon: ◆ Ship the 60 access points now (Recommended,      │
 │      +$85 freight)  ◆ Hold it, ship all 68 on Tuesday                    │
 │  ──▶ pick ──▶ Writing to Salesforce (FulfillmentOrder ×2, OrderSummary,  │
 │      EmailMessage) ──▶ "Delivery Watch has it from here… without coming  │
 │      back to you"                                                        │
 └──────────────┬───────────────────────────────────────────────────────────┘
                │ mic: three instructions from the brief          [built]
                │ "Approve Hartwell's quote with a 5% promo. Put AP-7 back
                │  in stock on the store from Leeds. And hold Halden & Rook's
                │  cart price till Friday, and nudge their buyer."
                ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ Claude just does them  [built]                                           │
 │  ··▶ Writing to Salesforce: 3 dispatch_write steps, each record landing  │
 │      (Quote, PromotionQualifier, EmailMessage · LocationGroupAssignment, │
 │      ProductItem, Product2 · WebCart, EmailMessage); Fix issue the same  │
 │  ··▶ 3 action cards from Claude: Hartwell $210,000 → $199,500, valid to  │
 │      Fri 16 Oct, buyer emailed · AP-7 40 in stock from Leeds ·           │
 │      CART-3381 $31,500 held to Fri, buyer nudged                         │
 │  ··▶ "3 of today's 6 focus items are cleared"                            │
 │  chips: Send the focus list to my team on Slack ──▶ #ohana-sales-team,   │
 │         owners tagged · Push the focus list to Asana ──▶ 6 tasks in      │
 │         Ohana Sales, due today · + generic suggestions; each chip is     │
 │         used once, and every reply ends with some                        │
 └──────────────────────────────────────────────────────────────────────────┘
```

Status (2026-10-13): all built (decision 54, as reworked 2026-10-12; decision 60). The brief is one
morning, not split across days. "Prep me for Canary Wharf" is gone; Flow 4 starts on its own.

---

## 4. Canary Wharf (multimodal chat)  [built, decision 56, revised 2026-10-13]

Fully separate chat. Wed 14 Oct (demo day): Aaron is just off a call with Canary Wharf Workspaces (Manchester;
Priya Shah signs off, Tom Reilly is IT). Starts from New; its row lands on top. Claude reads
everything, pins a plan above the prompt bar, does 8 tasks on its own, then brings Aaron the 4
that need them, one at a time (dictated and clicked).

```
 Sidenav: New ──▶ start state (the mic holds the Canary Wharf prompt)
                │ drag Canary Wharf call notes.txt, the floor plan PDF, Comms room.jpg onto the box
                │ (file chips above the text, ✕ removes) ──▶ mic ──▶ Send
                ▼
 /account-360 ──▶ timeline: Files (18 AP spots · 4 × SW-24 · no UPS)
   · Gong: progress bar along 41:12 (transcript → who said what → needs → competitors)
       then 03:40 move-in 3 Dec · 23:14 $410/AP · 31:02 40 cameras · 33:30 reorder · 36:50 power cut
   · Gmail: searches the inbox for Tom → found "Manchester requirements" → reads it → opens
       2 attachments, landing one at a time (Floorplan_rev-B.pdf, Manchester_requirements.xlsx)
   · Slack (Jun: PoE to spare) · Salesforce: cart 12 × AP-7 · partner agreement · stock 14 + 6
                ▼
 What I found: floor plan out of date → 20 APs → free pre-config, matches stock · reuse SW-24s
   ($4,600) · no UPS in the photo · other vendor at $410
                ▼
 PLAN pinned above the prompt bar (collapsible, "n of 11 done")
   "Writing to Salesforce": dispatch_write steps, records landing one by one (INSERT/UPDATE ·
     object · record · fields): CartItem ×6 + WebCart, Quote + 6 QuoteLineItems + Opportunity
   CLAUDE DOES (ticks each, each a write step): cart to rev B + Q-20511 (table ends on Total $14,360) · Jess + Marta contacts · Jess's
   access · ship-to · reserve 20 APs · /reorder room-kit list · phase 2 quote Q-20514 ($12,800)
   · Slack reminder for Fri 16 Oct to chase Priya: a Slack card (set through the integration),
     then Slackbot's banner pops right away
   ──▶ "Done on my own" table (17 records) · each decision below writes too (42 in all)
                ▼
 NEEDS YOU, ONE AT A TIME
   1 Price: Gong tile under the ask: Priya's words at 23:14 (click the timestamp: the clip plays)
       mic "Match them on the access points." ──▶ $14,160, approved itself
       or chip "What would 5% off the licences come to?" ──▶ one-click choice card:
       [Match $410 on the access points · $14,160 · Recommended] / [Take 5% off the licences · $14,180]
   2 ◆ UPS + 2 surge PDUs (+$1,130): mic "Yes, add the UPS and the power strips." (or Add them ↵)
       ──▶ $15,290 ($15,310 on the licences path)
   3 ◆ Marta on PO, net 30 ──▶ click Approve terms ↵
   4 Email to Priya and Tom ──▶ click Send
       ──▶ receipt: 9 sources · 10 records · ~6 min vs ~3 h + ~3 days
                ▼
 on its own, ~5 s later: Slack banner "Priya accepted Q-20511…" ──▶ order card ORD-20977
   ──▶ "Canary Wharf has ordered" (channel told, install booked, Friday's reminder cleared)
 Generic chips (each once): delivery plan · what else came up on the call · who's who
```

---

## The whole demo

**Run-of-show order (Aaron, 2026-10-12):** open with the Morning Brief (a messy day made
organized), then Canary Wharf (work done on Aaron's behalf), then the two agents. The build doesn't
change; the chart below is in build order.

```
 ┌───────────────────────────┐
 │ Mac desktop [built]       │  wallpaper, dark menu bar, 3 file icons
 │ ViewToggle: browser/desk  │
 └─────────────┬─────────────┘
               │ open the Claude window                       [built]
               ▼
 ┌───────────────────────────┐
 │ Cowork window, New [built]│  Home | Code, Agents, Scheduled in nav
 └─────────────┬─────────────┘
               │
 ═══ 1. DELIVERY WATCH ═══════════════════════════════════════════════════════
               │ mic > Send (sidenav: Waypoints, "Delivery Watch")
               ▼
        ··▶ Claude proposes an agent ··▶ first sweep ··▶ confirm click ··▶ live
               │
 ═══ 2. GROWTH SCOUT ═══════════════════════════════════════════════════════
               │ new session: mic > Send (Waypoints, "Growth Scout")
               ▼
        ··▶ Claude proposes an agent ··▶ goal plan ··▶ confirm click ··▶ live
        ··▶ Aaron dictates "change the discount to 10%" ··▶ this week projected
               │                                      Agents page lists both
               │
 ═══ 3. MORNING BRIEF (scheduled task) ═══════════════════════════════════════
               │ Scheduled page > "Daily briefing" template
               ▼
        ··▶ /schedule explainer + prompt template ··▶ mic answer ··▶ answers
            table ··▶ Schedule card
        ··▶ mic "And Slack me when it's ready" ··▶ card updates ··▶ Schedule ↵
               │
               │  Ctrl+S: Slack banner, clock jumps to Thu 15 Oct 8:52 AM
               │  close the banner > Scheduled > Morning Brief card
               ▼
  ┌────────────────────────────────────────────────────────────┐
  │ THE BRIEF  [built]  (opens full screen)                    │
  │   Salesforce accounts ───┐                                 │
  │   B2B store health ──────┤    Summary, Today's focus (6),  │
  │   Gmail, Calendar ───────┼──▶ Accounts at risk (4), Store  │
  │   Slack reminders ───────┤    fixes (4), Slack reminders,  │
  │   Both agents' results ──┘    Handled without you          │
  └──────────────────────────────┬─────────────────────────────┘
               │ mic: 3 instructions (Hartwell 5% · AP-7 from Leeds ·
               │ hold Halden & Rook's cart) ··▶ Claude does them
               │ ··▶ focus list to Slack / Asana
               │
 ═══ 4. CANARY WHARF (multimodal chat) ═══════════════════════════════════════════
               │ New: drag desktop files, mic > Send (row "Canary Wharf Manchester quote" on top)
               ▼
        ··▶ timeline (files, Gong listen, Gmail + attachments, Slack, Salesforce)
        ··▶ What I found ··▶ plan pinned: Claude's 8 tasks tick off (Slackbot reminder)
        ··▶ yours, one at a time: mic price · mic/◆ UPS · ◆ Marta's terms · Send email
        ··▶ receipt: ~6 min vs ~3 h + ~3 days ··▶ Slack banner: accepted ··▶ order
               │
               ▼
 ┌───────────────────────────┐
 │ Close  (open)             │  decision 4.4 had "one click"; 4.5 has no
 │ "one more thing"? finale  │  finale yet (8.4)
 └───────────────────────────┘

 Hand-offs: Flows 1+2 run in the background ─▶ their results appear in the brief (3).
 Flow 4 is independent. Each started session stays in the sidenav; agents are also
 reachable from the Agents page (two doors).
```

---

## Open questions

- Agents page and an "Agents" sidebar section (§8.5 Q1, Q4): add both? template grid under
  our agents, or only ours?
- Clock/icon on the left of agent rows (§8.5 Q2)?
- Cloud-run agents with no "Only on this computer" chip (§8.5 Q3)?
- Delivery Watch's "wakes on FulfillmentOrder change" is an event trigger, not a native
  frequency: keep it or change to Hourly (§8.5 Q5)? Also revise its generic prompt?
- Does Aaron adjust Growth Scout's guardrails on stage?
- Resolving the brief's "Needs you" items beyond the three next best actions (parked,
  decision 37).
- Canary Wharf: "Did Canary Wharf respond?" as a chip or Claude reporting on its own; numbers to
  lock; source chips everywhere.
- Ending: any "one more thing" finale, or just close?
- Ohana's customer list and Salesforce field names for the wake tooltips still to confirm.
