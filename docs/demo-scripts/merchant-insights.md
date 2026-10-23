# Demo script: Merchant insights

Aaron checks the Alpine store's health, follows the numbers to four problems (Premium Grinder
slipping, dead stock, Travel Mug returns, Omega going quiet), asks Claude to remember each,
sets up promotions and exports a PDF report.

**Setup:** click **Merchant insights** in the sidenav. "Today" is Sep 22, Q3 to date.

**Mic:** rows marked 🎙 are dictated, not typed. Click the mic beside send; the line comes in by itself and the recording ends on its own. Press **Enter**. A prompt that's only a slash skill is still typed.

**Chips:** the latest reply ends with two or three follow-up chips (it varies by reply), then the Claude logo on its own line (both go once anything follows). One chip is live: where a row says *or chip ↳ …*, clicking it on the reply before does that step. The others do nothing. The "remember" steps (8, 10, 14) have no chip for themselves: dictate them. A reply that asks a question in its card (pick an address, a cart, a store) ends with just the logo.

**Salesforce writes:** only the promotions write. Nothing is written while they're a draft (the audience edit included); **Create all 3**, **Make live** and **Make all 3 live** are the OK. Each plays a **Writing to Salesforce** timeline whose records land one at a time, the header turns to **Wrote N records to Salesforce**, then after a short pause the reply follows.


| # | Dictate 🎙 / type / click | You should see |
|---|---|---|
| 1 | 🎙 `/store-health How's my store doing this quarter?` | "Which store?" picker |
| 2 | Pick **Alpine** | **Store health** card: $1.24M (83% of $1.5M goal). Export, Share, Expand in the header |
| 3 | Click **Expand** on the card · or chip ↳ **Open the full dashboard** | Full-screen dashboard. **Next best actions** on top, then Health by area, Revenue, Orders, Accounts, Business objectives; **Share** and **Export report** in the header |
| 4 | 🎙 In the full-screen prompt bar: `Break my Q3 revenue down by month. Is September on track to beat August?` | Full screen closes; a **Revenue by month** card lands in the chat (expandable) |
| 5 | 🎙 `Which products are driving my growth the most, and are any of my top 10 slipping?` · or chip ↳ **What's selling best?** | **Top products**, Premium Grinder highlighted |
| 6 | Click **See trend** · or chip ↳ **See the Grinder trend** | Premium Grinder units falling since a competitor's discount |
| 7 | 🎙 `Is the Testa Rossa Coffee Machine in a bundle or a promotion right now?` · or chip ↳ **Check the bestseller's deals** | Barista Starter Kit bundle ($3,150), no promotion |
| 8 | 🎙 `Keep the Premium Grinder in mind, I'll come back to it. Do we have any stock that isn't selling?` | "Noted for later · Premium Grinder", then **Dead stock** |
| 9 | Click **Check returns** · or chip ↳ **Check returns** | **Returns**: Travel Mug 11.0% vs 3.1% average |
| 10 | 🎙 `Remember the dead stock and the Travel Mug listing too. How are buyers doing this quarter?` | "Noted for later", then **Segments** |
| 11 | Click **See trends** on New Buyers · or chip ↳ **New Buyers' trends** | New Buyers mix: hardly any machines. *(Every row has **See trends**: OEM Partners lean on machines, Loyal Customers on filter refills.)* |
| 12 | 🎙 `Which of my accounts might we be losing this quarter?` · or chip ↳ **Accounts at risk** (on the segments reply, or after step 11) | **At-risk accounts**: TSV, Omega, Bluewater, each with a spend sparkline over Q1 to Q3 |
| 13 | Click **View profile** on **Omega Inc** · or chip ↳ **Omega's profile** | Omega: down 38% on Q2, last machine order 45 days ago |
| 14 | 🎙 `Remember Omega too. Now pull up everything I asked you to remember, and what I should do about each.` | **Things to do**, Claude's own card (no Salesforce header): 4 numbered items, each a pill (Promotion or Merchandising) and two lines, **Found** and **Do**; plus an **Alpine follow-ups** Slack card |
| 14a | Click **Send to Slack** on the card *(optional)* · or chip ↳ **Share it on Slack** | Thinking: "Connecting to Slack", "Finding #alpine-merchandising". **Using Slack**: Post Alpine follow-ups to #alpine-merchandising → `4 items · 2 teammates tagged`. Then "Posted to #alpine-merchandising…"; the card shows **✓ Sent to #alpine-merchandising** |
| 15 | 🎙 `Set up the three promotions you suggested.` · or chip ↳ **Go ahead with those** | **Promotions** draft card (3 promotions) |
| 16 | 🎙 `Make the Premium Grinder promotion Loyal Customers only.` *(or **Edit promotions** in the card)* · or chip ↳ **Narrow the Grinder's audience** | Grinder row shows the new audience, marked **Updated**. Still a draft: nothing written yet |
| 17 | Click **Create all 3** · or chip ↳ **Create all 3** | **Wrote 3 records**: INSERT Promotion ×3, each with its audience (Grinder: **Loyal Customers only**), IsActive false. Then **Promotions created**, all **Inactive** |
| 17a | Click **Make live** on the Grinder *(optional, any row)* | **Wrote 1 record**: UPDATE Promotion, IsActive false → true. Then "…is live for Loyal Customers only" and the card again, Grinder **Live**, the rest **Inactive**; the card's button reads **Make the other 2 live** |
| 17b | 🎙 `Make all three promotions live.` · or **Make all 3 live** at the card's end · or chip ↳ **Make all 3 live** | **Wrote 3 records** (fewer if some were live): UPDATE Promotion, IsActive false → true. Then "All 3 promotions are live" and the card, every row **Live** |
| 18 | `/export-report` → Enter · or chip ↳ **Export a report** | Export picker, 6 views pre-checked |
| 19 | Click **Create PDF**, then click the **file card** | Side preview, a static PDF (no hover): cover with KPIs and an **In this report** contents list; each page has a running header, a numbered title, the takeaway, 2–3 key points, the charts, and a "Page n of m" footer. Promotions page shows which are Live |

## Extras

- Step 4: click **Export report** in the Revenue by month full screen for a one-page PDF.
- The **Export** (download) icon on any insight card makes a one-page PDF of that view.
- Step 13: **View profile** on TSV or Bluewater opens the same account report, with that account's numbers (expandable, exportable; both are in the export picker, unchecked).
- On the dashboard, **See top products** and **See at-risk accounts** jump to steps 5 and 12.
- Step 18 with a scope skips the picker: `/export-report just the revenue, top products and
  at-risk accounts`.

## Gotchas

- Any store picked at step 2 continues as Alpine.
- Card edits at step 16 only change the audience.
- Download on file cards, every Share button and **Open approvals** are display only. The
  Slack card's **Send to Slack** posts (once).
