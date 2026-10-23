# Merchant insights — store health to promotions to report (runbook)

Experience #2 of the Claudeforce Commerce merchant demo. The merchant (persona **Aaron**)
runs a health check on the **Alpine** coffee equipment store and follows the numbers to four
problems: the Premium Grinder slipping, dead stock, the Travel Mug listing and Omega Inc
going quiet. Along the way Claude remembers each one. Aaron then gets the list back, sets up
promotions (created **inactive**) and exports a PDF report with only the views they want.

Script: `src/chat/experiences/insights.ts`. Plan and per-view spec:
`docs/merchant-insights-plan.md`. "Today" is **Sep 22**, Q3 to date.

**Dictation (2026-10-16).** The mic beside send dictates the presenter's prompts (steps 1, 4, 5, 7, 8, 10, 12, 14, 15, 16 and make all live; `/export-report` stays typed) in order, at a steady pace with no pauses, from the `dictations` list in the script. A step typed in other words still counts, and the mic moves on. Prompts that are only a slash skill are still typed. See `docs/demo-scripts/`.

**Follow-up chips (2026-10-16).** Each beat's `suggestions` are the two or three chips under the latest reply (insights varies the count by reply), then the Claude logo on its own line; one chip is live (a prompt, an in-app action or expand), the others are inert. Beats that ask a question in their card have none. The demo script says which chip plays which step. The "remember" steps have no chip of their own (the chip only repeated the line); the segments reply leads to step 11 with **Accounts at risk** (live) and **New accounts at risk**.

**Salesforce writes (2026-10-16).** Only the promotions write, and only once confirmed: the draft and its audience edit write nothing. **Create all 3** INSERTs the 3 Promotions, inactive, each with its audience (the Grinder's Loyal Customers only); **Make live** on a row UPDATEs it (IsActive false → true) and the card comes back with that row Live; **Make all 3 live** (the card's end, its chip, or dictated "Make all three promotions live.") UPDATEs every inactive one in one step. Each plays as a "Writing to Salesforce" timeline (`dispatch_write`, records landing one at a time, then "Wrote N records to Salesforce"), a 2-second pause, then the reply. The button is the OK, so neither asks first.

## Before you start

- `npm run dev` → http://localhost:5173/
- Click **Merchant insights** in the sidenav to arm it. If it's already been run, its chat is
  as it was left; **New** restarts it (no month breakdown on the dashboard, no promotion
  edits, nothing live), and a page refresh restarts every journey.
- Only two slash skills belong to this journey: `/store-health` (blue, Salesforce) and
  `/export-report` (grey, default).

## Run sequence

Every typed prompt is a full sentence that makes sense on its own, so the audience can
follow without remembering the previous turn.

| # | Do | Expect |
|---|---|---|
| 1 | Type **`/store-health`** + **How's my store doing this quarter?** | "Which store?" picker: Alpine, Barista Pro Online, Partner Wholesale, All stores |
| 2 | Pick **Alpine** | **Store health** card: $1.24M (83% of $1.5M goal), KPIs. Header: Export, Share, Expand |
| 2a | **Expand** the card | Full-screen dashboard with **Share** and **Export report** in the header. On top, **Next best actions**: Close the ~$130K gap (**See top products**), Win back quiet accounts (**See at-risk accounts**), Approve 22 waiting orders (**Open approvals**, goes to Commerce, display only). Then **Health by area** (6 areas, healthy at 75+; Inventory health and Account retention flagged), Revenue, Orders, **Accounts** (4 KPIs + at-risk list), Business objectives |
| 3 | In the full-screen prompt bar, type: **Break my Q3 revenue down by month. Is September on track to beat August?** | Full screen closes; the answer lands in the chat: a **Revenue by month** card (hover a bar for the tooltip; Revenue / Orders toggle). Expand it for its own page (by month, by week) |
| 3a | *(optional)* In that full screen, click **Export report** | Full screen closes; "Ran skill export-report", then a one-page **Alpine · Revenue by month** PDF file card |
| 4 | Type: **Which products are driving my growth the most, and are any of my top 10 slipping?** | **Top products** table; the Premium Grinder row is highlighted with **See trend** |
| 5 | Click **See trend** | **Premium Grinder** card: units falling since the competitor discount. Expandable to a full page; Units / Revenue toggle |
| 6 | Type: **Is the Testa Rossa Coffee Machine in a bundle or a promotion right now?** | One bundle, the **Barista Starter Kit** ($3,150, saves $278), and no promotion |
| 7 | Type: **Keep the Premium Grinder in mind, I'll come back to it. Do we have any stock that isn't selling?** | **Noted for later · Premium Grinder**, then **Dead stock** (days without a sale, 60-day line). Button **Check returns** |
| 8 | Click **Check returns** | **Returns**: KPIs, return rate by product (Travel Mug 11.0% vs 3.1% average), why Travel Mugs come back |
| 9 | Type: **Remember the dead stock and the Travel Mug listing too. How are buyers doing this quarter?** | **Noted for later · Dead stock, Travel Mug listing**, then the **Segments** table. Each row has a **See trends** button |
| 10 | Click **See trends** on New Buyers | **New Buyers** mix: hardly any machines. OEM Partners and Loyal Customers open their own mix against the store average |
| 11 | Type: **Which of my accounts might we be losing this quarter?** | **At-risk accounts**: TSV, Omega, Bluewater, each with a spend sparkline (Q1 to Q3) and its signal underneath, and **View profile** |
| 12 | Click **View profile** on **Omega Inc** | **Omega Inc** card: down 38% on Q2, last machine order 45 days ago (Aug 8). Expandable to a full page with orders and contacts |
| 13 | Type: **Remember Omega too. Now pull up everything I asked you to remember, and what I should do about each.** | **Things to do**, Claude's own card (no Salesforce header or footer): 4 numbered items, each with a pill and two key-value lines (**Found**, **Do**), plus an **Alpine follow-ups** Slack card |
| 13a | *(optional)* Click **Send to Slack** on the card, or the **Share it on Slack** chip | Thinking "Connecting to Slack", "Finding #alpine-merchandising"; then **Using Slack → Used Slack**: Post Alpine follow-ups to #alpine-merchandising, `4 items · 2 teammates tagged`. Then "Posted to **#alpine-merchandising** as a checklist of 4…" and the card shows **✓ Sent to #alpine-merchandising** (no user bubble; posts once) |
| 14 | Type: **Set up the three promotions you suggested.** | **Promotions** draft card (3 promotions). Buttons: **Create all 3** and **Edit promotions** |
| 15 | Either click **Edit promotions**, set the Grinder's audience to **Loyal Customers only** and **Save**, or type **Make the Premium Grinder promotion Loyal Customers only.** | The Grinder row shows the new audience, marked **Updated** |
| 16 | Click **Create all 3**, then **Make live** on one or more | Created, all **Inactive**. Make live shows "Turning on" briefly, then a **Live** pill. The card ends with **Make all 3 live** (then **Make the other 2 live**, **Make the last one live**) |
| 16a | Dictate **Make all three promotions live.** (or click **Make all 3 live**) | **Wrote N records**: UPDATE Promotion for each inactive one. "All 3 promotions are live", then the card, every row **Live** |
| 17 | Type **`/export-report`** → Enter | **Export** picker: report title plus grouped checkboxes (6 views pre-checked) |
| 18 | Click **Create PDF**, then click the **file card** | "Ran 2 commands, created a file", then the file card (with Download and Share icons). The side preview opens, static like a printed PDF (charts don't hover): a cover with KPIs and an "In this report" contents list, then one page per view with a running header, numbered title, takeaway, key points, charts and a page footer. The Promotions page shows which ones are Live. Esc or X closes it; the Files icon in the header reopens it |

## Variations that work

- Step 3 typed in the normal chat gives the same answer.
- **Export** (the download icon) on any insight card, or **Export report** in its full screen,
  creates a one-page PDF of just that view.
- The dashboard's **See top products** and **See at-risk accounts** jump straight to steps 4
  and 11 (without the "Noted for later" lines).
- Step 17 with a typed scope: `/export-report just the revenue, top products and at-risk
  accounts` → skips the picker and goes straight to the file.
- Any store picked at step 2 continues as Alpine.

## Known limitations

- The script follows one fixed story. Wording can vary, but the keywords need to match, and
  anything unmatched gets a generic fallback reply.
- Edits made in the card (step 15) only change the audience. Discount and dates are fixed.
- **Download** on file cards and the preview, every **Share** button and **Open approvals** do nothing.
