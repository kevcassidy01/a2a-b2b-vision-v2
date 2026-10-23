# Merchant insights: build plan (built 2026-10-05)

> Status: **built** on branch `merchant-insights` (uncommitted as of 2026-10-05). Runbook:
> `docs/merchant-insights-flow.md`. References:
> `docs/references/merchant-insights-prd.md` (PRD transcript, reference only),
> `docs/references/claude-file-preview.md` (file card + side preview), and the project-codey
> skill `commerce-merchant-insights` (store-scope rule, draft→confirm promotions, inactive by default).

## Changes made during the build

The spec below is the plan as approved. Where the build differs, this list wins:

- **Prompts rewritten as standalone full sentences** (demo audiences won't remember the previous
  turn), e.g. "Which products are driving my growth the most, and are any of my top 10 slipping?".
  The runbook has the exact wording.
- **Beat 3 can be typed in the full-screen dashboard**, which closes. The answer lands in the
  chat as an expandable **Revenue by month** card with its own full page. Nothing is ever added to
  an open app.
- **Next best actions** (3 cards with CTAs) sit at the top of the full-screen dashboard.
- **Export + Share** on every insight card header and full screen. Export creates a one-page PDF
  of that view. File cards get Download + Share icons.
- **Premium Grinder numbers made consistent:** units to date are 38 / 31 / 20 (Jul / Aug / Sep) at
  $770 each, so Q3 revenue is **$69K** (the plan said $74K). The trend runs by week, with a
  "Competitor discount starts" marker at day 43.
- **Omega's KPI** is "Last machine order: 45 days (Aug 8)".
- **Make live** is remembered, so the exported report's Promotions page shows Live or Inactive per row.
- **Hover annotations** on every chart, in cards, full screen and the PDF preview.

## The story in one line

Aaron, the merchant, runs a health check on the coffee store, follows the numbers down to four
problems, has Claude remember them along the way, gets the list back, sets up promotions, and
exports a report with only the views that matter.

## Ground rules for this journey

- **One thread.** About 17 beats; no acts or section breaks in the chat.
- **Data:** the PRD's coffee equipment store, **named "Alpine"** (our usual demo-store name); the PRD numbers are reused as-is.
  Timeline: "today" is late September, Q3 to date, with September partial.
- **Merchant:** Aaron.
- **Buttons are only real Commerce actions:** drill-downs (they post a follow-up prompt as Aaron),
  writes (Create all 3, Edit promotions, Make live), and in-chart toggles. **No "flag" buttons.**
- **Remembering is Claude's job:** Aaron says "keep X in mind" in a prompt. The reply opens with a
  muted bookmark line, **Noted for later · X**.
- **Slash skills:** only `/store-health` (blue, Salesforce) and `/export-report` (grey, default).
- **Type scale:** group title 22 semibold · card/chart title 18 semibold · KPI 32–36 semibold ·
  body, cells and values 16 (15 floor) · labels, axis ticks, annotations and meta 14. Nothing is under 14.
  Headings make each card scannable, and **a subtitle never repeats the title**; it adds scope or
  time ("Alpine · Q3 to date").
- **Display modes:** mostly inline cards. **Floating** is for one standalone chart; **full screen**
  for the store dashboard, the Grinder deep-dive and the Omega profile; **side preview** for the report.
  The recap is **plain text**.

## Sequence

`›` = typed by Aaron · `[button]` = clicked in a card. Buttons that post a prompt add Aaron's bubble
like a typed message; write buttons run in place with no bubble.

| # | Aaron | Claude shows | Mode | Buttons / interactions |
|---|---|---|---|---|
| 1 | › `/store-health` How are we tracking this quarter? | "You have 3 live stores. Which should I check?" + a numbered store menu: **Alpine** (Coffee equipment · B2B), Barista Pro Online, Partner Wholesale, **All stores** | inline select | Click or type a number. Every option is clickable and continues with Alpine (the only scripted store; Som clicks Alpine). |
| 2 | [Alpine] | **Store health snapshot** card (below) | inline card, expandable | Open dashboard (expand) |
| 2a | (expand) | **Store dashboard**, full screen (below) | full screen | Close |
| 3 | › Break revenue down by month, and tell me if September is on track to beat August. | **Revenue by month** chart (below) | floating, expandable | Toggle Revenue / Orders |
| 4 | › Which products are driving that, and is anything in my top 10 slipping? | **Top products** ranked table (below) | inline card | Row button on Premium Grinder: **See trend** |
| 5 | [See trend] → posts "Show me the Premium Grinder trend and its current status." | **Premium Grinder** trend + status card (below) | inline card, expandable | Open details (expand) · toggle Units / Revenue |
| 5a | (expand) | **Grinder deep-dive**, full screen | full screen | Close |
| 6 | › Is the Testa Rossa in any bundle or promotion right now? | Short text + a compact **bundle card**: Barista Starter Kit, Active, its 3 components, "No active promotion" | inline card | none |
| 7 | › Keep the Premium Grinder in mind, I want to come back to it. Do we have inventory just sitting there not selling? | **Noted for later · Premium Grinder**, then the **Dead stock** card (below) | inline card | Card button: **Check returns** |
| 8 | [Check returns] → posts "How do our returns look for last quarter?" | **Returns** card (below) | inline card | none |
| 9 | › Remember the dead stock and the Travel Mug listing too. How are my buyer segments doing? | **Noted for later · Dead stock, Travel Mug listing**, then the **Segments** card | inline card | Row button on New Buyers: **See what they buy** |
| 10 | [See what they buy] → posts "What are New Buyers mostly buying?" | **Category mix** card: New Buyers vs store average | inline card | none |
| 11 | › Which accounts are at risk of churning? | **At-risk accounts** card (below) | inline card | Row button per account: **View profile** (only Omega scripted) |
| 12 | [View profile · Omega Inc] → posts "Tell me more about Omega Inc." | **Omega Inc** summary card | inline card, expandable | Open profile (expand) |
| 12a | (expand) | **Account profile**, full screen | full screen | Close |
| 13 | › Remember Omega too. Okay, pull up everything I asked you to remember and tell me what to do about each. | **Plain-text recap** "Things to do" (4 items) + the **Slack card** (display only) | text + inline card | Send to Slack: hover only, does nothing |
| 14 | › Set up the promotions you suggested. | **Promotions draft** card, 3 promotions | inline card | **Create all 3** · **Edit promotions** |
| 14e | [Edit promotions] | The same card in edit mode: each promotion's discount, audience and dates become editable. Scripted edit: set Grinder audience to **Loyal Customers only** | inline card (in place) | Save changes (back to the draft with the change marked "Updated") · Cancel |
| 15 | [Create all 3] | **Promotions created** card: 3 rows, each **Inactive** | inline card | **Make live** per row (flips that row to Live in place) |
| 16 | › `/export-report` | **Export picker** card (below) | inline card | Checkboxes · title field · **Create PDF** |
| 16t | (alternative) › `/export-report` just the revenue, top products and at-risk accounts | Skips the picker and goes straight to 17 with those views | | |
| 17 | [Create PDF] | Claude tool line "Ran 2 commands, created a file" + reply + **file card** | text + file card | Click card → **side preview** opens (chat narrows); Download (no-op) · Close / Esc |

Aaron can type the edit at 14 too ("Make the Grinder one Loyal Customers only") and get the
same updated draft. That's the PRD's line, and both paths lead to the same state.

## What each view shows

**2 · Store health snapshot** (title "Store health", subtitle "Alpine · Q3 to date")
- Four KPI tiles:
  - **Revenue $1.24M**, with a progress bar to the $1.5M goal, "83% to goal"
  - **Open pipeline $310K**, "128 orders"
  - **Last 24 hours: 12 orders**, "$2,140 avg. order"
  - **Against objectives:** AOV ▲6% (green pill) · Conversion flat (grey pill)
- Reply text: one line on what stands out, then "Want me to break this down by product, segment, or account?"

**2a · Store dashboard** (full screen; group titles at 22)
- *Revenue vs goal:* cumulative revenue line across the quarter, a dashed goal line, and a hatched
  projection to quarter end (~$1.37M) with the annotation "On pace for ~$1.37M, ~$130K short of goal".
- *Order pipeline:* a horizontal stacked bar by status (Draft · Approved · In fulfillment ·
  Shipped) with counts and $ per segment.
- *Recent orders:* a table of the last 12 orders (account, items, total, time).
- *Business objectives:* rows of objective · target · actual · progress bar.

**3 · Revenue by month** (floating)
- Bars: Jul $420K, Aug $455K, Sep $365K solid **plus a hatched projection** to ~$495K.
- Monthly goal line at $500K, labelled.
- Callout on September: "Pacing ahead of August".
- Toggle Revenue / Orders swaps the series. The expanded view adds the weekly series.

**4 · Top products** (title "Top products", subtitle "By revenue · Q3 vs Q2")
- Rows: rank · product · revenue bar · Δ pill · 3-month sparkline.
  Testa Rossa $180K ▲22%, Standard Filter (6-pack) $96K ▲8%, Premium Grinder $74K ▼4%, then
  2 more to give the list shape.
- The Grinder row is highlighted (red pill, sparkline in red); others are muted.
- Annotation: "Only top-10 product trending down".

**5 · Premium Grinder** (subtitle "Last 90 days")
- Line chart of units by month, 620 → 540 → 470, with a **vertical event marker** at August:
  "Competitor discount starts".
- A status strip of chips: Active · In stock · Published to Alpine · Not in a bundle or promotion.
- Full screen (5a) adds weekly units, revenue, and a "Who's buying it" split by segment.

**7 · Dead stock** (subtitle "No sales in 60+ days")
- Headline: **$28K tied up** across 3 products.
- Rows: product · units on hand · days since last sale, drawn as a bar on a 0–90 day axis with a
  **60-day threshold line** · value. Pour-Over 340u/74d, Travel Mug (Teal) 210u/68d, Descaling Kit 190u/61d.
- The Travel Mug row carries a small "High returns" tag (it connects to beat 8).

**8 · Returns** (subtitle "Last quarter")
- KPI: **3.1%** return rate, "down from 3.8%".
- Bars of return rate by product against a store-average line; the Travel Mug at **11%** is highlighted.
- Reason breakdown for the Travel Mug, led by "Color not as expected".
- Reply: it's in both dead stock and high returns, so review the listing before promoting it.

**9 · Segments** (subtitle "Q3 vs Q2")
- Rows: segment · revenue bar · AOV · growth pill.
  OEM Partners $520K / $4,100 / ▲14%; Loyal Customers $310K / $1,950 / ▲3%; New Buyers
  $88K / $640 / ▲41%.
- Annotation on New Buyers: "Fastest growing, lowest AOV".

**10 · Category mix:** two 100% stacked bars (New Buyers vs store average) by category:
Filters, Accessories, Grinders, Machines. Annotation: "Hardly any machines", which supports a
second-order incentive.

**11 · At-risk accounts** (headline "~$140K annual revenue at risk")
- Each row has the signal drawn as a small chart:
  - **TSV Distributors:** a gap bar, 47 days since last order vs a ~14-day usual cadence
  - **Omega Inc:** a revenue sparkline, ▼38%
  - **Bluewater Supply:** a category chip "Filters", struck through, "stopped ordering"
- Annual revenue per row; **View profile** button.

**12 · Omega Inc** (inline summary: revenue trend + 3 facts) → **12a account profile** (full screen)
- Header: Omega Inc · Loyal Customers · Primary contact last login 39 days ago.
- *Revenue by quarter:* Q1 $22K, Q2 $19K, Q3 $12K (partial, hatched).
- *Category mix over time:* Machines drops to zero while Filters holds, with an event marker
  "Competitor discount starts".
- *Recent orders* and *Contacts* sections.

**13 · Recap** (plain text, a heading + numbered list; no card)
1. **Premium Grinder:** units down 620 → 470 since the competitor discount → time-boxed promotion.
2. **Dead stock:** $28K across 3 products → clearance bundle.
3. **Travel Mug listing:** 11% returns, "color not as expected" → fix photos/description (needs a teammate).
4. **Omega Inc:** revenue ▼38%, stopped buying Machines → win-back offer.

Then the **Slack card**, shaped like the file card: Slack tile · "Alpine follow-ups" ·
"Slack message · 4 items" · outlined Send to Slack button (hover state only).

**14 · Promotions draft** (title "Promotions to create", subtitle "Draft · nothing is created yet")
- 3 rows, each with name, discount, what it applies to, audience and dates:
  - *Clearance – Coffee Accessories Bundle*: 20% off Pour-Over Set + Descaling Kit (~$19K) · all buyers · note "Travel Mug held back until its photos and description are updated" · through Sept 30
  - *Premium Grinder – 15% Off*: 30 days · all buyers → **Loyal Customers only** after the edit
  - *Welcome Back, Omega*: offer on Machines · Loyal Customers, excluding OEM Partners
- Footer: **Create all 3** (primary) · **Edit promotions** (secondary) · "Created as inactive".

**15 · Promotions created:** the 3 rows with an **Inactive** pill and **Make live** each. Clicking
flips that row to a green **Live** pill with no new message (a tool call shows in the timeline).

**16 · Export picker** (title "Export report")
- Title field, pre-filled "Alpine · Q3 review".
- Checklist of the views from this chat, grouped: *Store* (Health snapshot, Revenue by month),
  *Products* (Top products, Grinder trend, Dead stock, Returns), *Customers* (Segments, At-risk
  accounts, Omega profile), *Actions* (Promotions created).
- **Smart pre-checks:** the views tied to the 4 remembered items + the snapshot. Footer shows
  "6 of 10 selected" and **Create PDF**.

**17 · Report:** file card "Alpine · Q3 review", "Document · PDF". The side preview shows a
cover page (title, store, date range, KPI strip), then one section per picked view: group title,
the chart redrawn at page width with its annotations, and a one-line takeaway. Page pill
"Page 1 / 4".

## Tool timeline (Headless 360 MCP)

| Beat | Calls |
|---|---|
| 1 | discover "commerce insights" · get_sor_detail merchant-insights · dispatch_readonly merchant-insights (list stores) |
| 2 | dispatch_readonly merchant-insights (revenue, pipeline) · dispatch_readonly order-management (recent orders) · dispatch_readonly business-objectives |
| 3, 4, 7–11 | dispatch_readonly merchant-insights |
| 5, 6 | dispatch_readonly merchant-insights · dispatch_readonly catalog-management (status / bundle) |
| 12 | dispatch_readonly merchant-insights · dispatch_readonly order-management |
| 13 | none (Claude's own memory) |
| 14, 14e | get_sor_detail promotion-management (templates) |
| 15 | dispatch promotion-management ×3 · dispatch_readonly promotion-management |
| Make live | dispatch promotion-management |
| 16, 17 | none in the MCP timeline; 17 uses Claude's own tool line ("Ran 2 commands, created a file") |

## What gets built

**Shell (reusable, journey-agnostic)**
1. **Type-scale tokens** in styles (the five levels above), used by every new view.
2. **Text block headings**, so the recap can have a heading (the text renderer only does bold + lists today).
3. **"Noted for later" line**: a new lightweight block (bookmark icon + muted text).
4. **File card + side preview panel**, per `claude-file-preview.md`: chat narrows, ~47% panel,
   header "Title · PDF" + download + close (no expand), grey well + pages + page pill, selected
   card state, top-bar document icon, Esc to close.
5. **Slack card**: the file-card shape with a Slack tile; display-only.
6. **Skills:** `/store-health` replaces sales-summary + order-trends in the Salesforce insights
   group; `/export-report` is added to the grey default skills.

**Viz kit (hand-built SVG, no chart library)**
Bar chart (goal line, hatched partial/projection, highlight vs muted), line chart (event
markers, callouts), sparkline, horizontal bar with threshold line, 100% stacked bar, KPI tile
(with progress + delta pill), status chips. One annotation style everywhere: 14px label, thin
leader line, pinned to a data point.

**Insight views:** rather than one bespoke view per beat, a single `insight` view built from
**sections** (kpis, bar, line, ranked table, stacked bar, status strip, note). The same sections
render inline, full screen, and as report pages, so the export reuses what Aaron already saw.
Bespoke views only for the store menu (existing select), promotions draft/edit/created, export
picker, file card and Slack card.

**Script:** `src/chat/experiences/insights.ts` with the beats above (keyword routing + actions,
`reset` for promotion live states and export picks).

**Docs:** `docs/merchant-insights-flow.md` runbook (like the other two), DESIGN_DECISIONS entries
(type scale, insight sections, file preview, "Noted for later", Slack card), CHANGE_LOG.

**Build order:** type tokens + viz kit → insight views (beats 2–12) → recap / Noted / Slack →
promotions → export picker + file card + preview → runbook. I'll check in with you after the viz
kit and the first two views, before doing the rest.

**Later, separate pass:** raise quote management + checkout anywhere to the same type scale.

## Open items

1. ~~Store name~~ → **Alpine** (Som).
2. ~~Travel Mug in the clearance bundle~~ → **held back** until its photos/description are updated (Som).
3. ~~"Remind me in two weeks"~~ → **dropped** (Som).
4. ~~Other stores in the menu~~ → clickable; all continue with Alpine (Som).
