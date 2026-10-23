# Claude x Salesforce B2B Commerce - Browser Chat Demo Guide

| | |
|---|---|
| Prepared for | Sreeni |
| Maintained by | Somnath Mallela, Amoolya S Kumar |
| Event | _TBD_ |
| Event date | _TBD_ |

---

## Introduction

**The demo uses a fictional merchant called Alpine.** Alpine sells coffee equipment (machines, grinders, travel mugs, filter refills) and energy drinks to business buyers through its **Alpine B2B** store.

**You are Aaron (aaron@alpine.com) at Alpine.** You use Claude in the browser, connected to Salesforce Commerce, to work your accounts and your store.

The demo shows Claude doing the legwork across quotes, orders and store insights, writing back to Salesforce as it goes.

**The buyer at the center of Acts I and II is Morton Breitenberg.** Act III zooms out to the whole Alpine store.

Three journeys in this order -
1. Quote approval: review Morton's pending quotes, add a free sample, approve
2. Checkout anywhere: place an order on Morton's behalf, then reorder a past order
3. Merchant insights: check store health, find four problems, set up promotions, export a report

**OPEN http://localhost:5173/ (NOT /#desktop). THE BROWSER CHAT IS THE DEFAULT VIEW. IF YOU SEE THE MAC DESKTOP, SWITCH WITH THE TOGGLE AT THE BOTTOM RIGHT**

---

## Reading this guide

- **You** is something you do - a click, a mic click, a typed prompt
- **Claude** does stuff after that. Let each step finish before your next action
- **Mic 🎙** - click the mic beside send. The right line comes in by itself and stops on its own. Then click send (or press Enter)
- **Chip** - the latest reply ends with follow-up chips. Only the one named in this guide does anything
- Every Salesforce write shows as a **Writing to Salesforce** timeline, records landing one at a time, before Claude replies
- Everything is scripted, so nothing depends on live Salesforce data for this demo

---

## Act I - Quote approval

_Morton's buyer accounts have quotes waiting. Morton asked for a free sample. You get it added within margin, leave him a note and approve, without opening Salesforce._

1. **You** click **Quote approval** in the sidebar nav
2. **You** click the mic, then send: "Pull up all the pending quotes for the Morton account."
3. **Claude** shows **Pending quotes**: 3 drafts across Riverside, Midtown and Eastgate, $52,855
4. **You** click the mic, then send: "Show me the details of the first pending quote…"
5. **Claude** shows quote **00000011** for Riverside: totals, Morton's note asking for a sample, 2 line items
6. **You** click the mic, then send: "Which free samples is Morton entitled to?" (or click the **Check entitlement for free sample** chip)
7. **Claude** runs the entitlement check and recommends the **Chai Post 6-pack**, under 1% of margin
8. Hover the **Recommended** pill to show why Claude picked it
9. **You** click **Add free sample** on the Chai Post row
10. **Claude** rechecks the margin, writes 2 records to Salesforce and shows **Free sample added**
11. **You** type `/add-note Added a free sample as per your request.` and send it
12. **Claude** writes the note and shows it as Morton will see it, then asks whether to approve
13. **You** type `/approve-quote` and send it (or click the **Approve the quote** chip)
14. **Claude** updates the quote and shows the Draft → Approved stepper, all green

**At this mark -** the **Quote approval** chat stays as you left it. You can come back to it any time.

---

## Act II - Checkout anywhere

_Morton needs a restock. You place the order on his behalf in the chat, check out with a PO, then reorder one of his past orders._

1. **You** click **Checkout anywhere** in the sidebar nav
2. **You** click the mic, then send: "I want to place an order on behalf of Morton Breitenberg on our Alpine B2B store."
3. **Claude** shows Morton's context card, then the **Entitled products** he can buy, each with a checkbox
4. **You** tick the first 3 rows and click **Add 3 to cart**
5. **Claude** shows the Energy Drink flavors as photo tiles (Chai, Green Tea, Tart Cherry)
6. **You** click **Choose** on **Chai**
7. **Claude** sees Morton already has a cart and asks: fresh or keep?
8. **You** pick **Go ahead with a fresh cart**
9. **Claude** writes the new cart to Salesforce and shows it: 3 lines, $86.98
10. **You** click **Proceed to checkout**
11. **Claude** shows the shipping addresses, **Shirley** marked **Frequently used**
12. **You** pick **Shirley**
13. **Claude** shows the order review: FedEx, PO123, $98.97
14. **You** click **Place order**
15. **Claude** writes the order and shows the confirmation, **Ordered by** Aaron from Alpine on behalf of Morton
16. **You** click the mic, then send: "Give me full details on the order just placed" (or click the **Open this order** chip)
17. **Claude** shows the order detail with totals, shipping and line items
18. **You** click the mic, then send: "Show me Morton's successful orders this week" (or click the **See Morton's orders this week** chip)
19. **Claude** shows 3 orders, each with a **Reorder** button
20. **You** click **Reorder** on **QJRTA…**. The prompt box fills in with `/reorder QJRTA-…`
21. **You** click send
22. **Claude** reads that order's 3 lines, writes a reorder cart and asks "Ready to check out?"

**At this mark -** you have placed one order and built one reorder cart for Morton. The demo of this act ends here (you can optionally check out the reorder the same way as steps 10-14).

---

## Act III - Merchant insights

_Zoom out to the whole Alpine store. Claude checks its health, you follow the numbers to four problems, ask Claude to remember each, then turn them into promotions, a Slack post and a PDF report._

1. **You** click **Merchant insights** in the sidebar nav
2. **You** click the mic, then send: "/store-health How's my store doing this quarter?"
3. **Claude** asks which store. **You** pick **Alpine**
4. **Claude** shows **Store health**: $1.24M, 83% of the $1.5M goal
5. **You** click **Expand** on the card (or click the **Open the full dashboard** chip)
6. **Claude** opens the full dashboard. Scroll through it: Next best actions, Health by area, Revenue, Orders, Accounts
7. **You** click the mic in the full-screen prompt bar, then send: "Break my Q3 revenue down by month…"
8. **Claude** closes full screen and shows **Revenue by month**
9. **You** click the mic, then send: "Which products are driving my growth the most…" (or click the **What's selling best?** chip)
10. **Claude** shows **Top products** with the Premium Grinder flagged. **You** click **See trend**
11. **Claude** shows the Grinder's units falling since a competitor's discount
12. **You** click the mic, then send: "Is the Testa Rossa Coffee Machine in a bundle or a promotion right now?"
13. **Claude** shows it's in a bundle but has no promotion
14. **You** click the mic, then send: "Keep the Premium Grinder in mind… Do we have any stock that isn't selling?"
15. **Claude** notes the Grinder for later and shows **Dead stock**. **You** click **Check returns**
16. **Claude** shows the Travel Mug returning at 11% against a 3.1% average
17. **You** click the mic, then send: "Remember the dead stock and the Travel Mug listing too. How are buyers doing this quarter?"
18. **Claude** notes them and shows **Segments**. **You** click **See trends** on **New Buyers**
19. **Claude** shows New Buyers hardly buy machines
20. **You** click the mic, then send: "Which of my accounts might we be losing this quarter?" (or click the **Accounts at risk** chip)
21. **Claude** shows 3 at-risk accounts, each with a spend sparkline. **You** click **View profile** on **Omega Inc**
22. **Claude** shows Omega's account report: down 38% on Q2, no machine order in 45 days
23. **You** click the mic, then send: "Remember Omega too. Now pull up everything I asked you to remember…"
24. **Claude** shows **Things to do** (its own checklist of 4 items, Found and Do) and an **Alpine follow-ups** Slack card
25. **You** click **Send to Slack** on the card
26. **Claude** connects to Slack and posts to **#alpine-merchandising**, tagging 2 teammates
27. **You** click the mic, then send: "Set up the three promotions you suggested."
28. **Claude** shows a **Promotions** draft card with 3 promotions
29. **You** click the mic, then send: "Make the Premium Grinder promotion Loyal Customers only."
30. **Claude** updates the Grinder's audience, still a draft
31. **You** click **Create all 3**
32. **Claude** writes 3 promotions to Salesforce and shows them, all **Inactive**
33. **You** click **Make all 3 live** at the end of the card (or dictate "Make all three promotions live.")
34. **Claude** updates them and shows every row **Live**
35. **You** type `/export-report` and send it
36. **Claude** shows the export picker with 6 views checked. **You** click **Create PDF**
37. **You** click the file card. The PDF report opens on the side. Scroll through it

**At this mark -** all three journeys sit in the sidebar nav as you left them: **Quote approval**, **Checkout anywhere**, **Merchant insights**.

---

**NOTE -**

- Each journey's chat persists when you switch between them. **New** restarts only the journey you're on. A page refresh restarts all three
- Don't forget to close full screens before prompting again or going to the next step (step 7 of Act III is the one prompt sent from full screen)
- If you type a step in your own words instead of using the mic, it still works and the mic moves on to the next line
- Prompts that are only a slash skill (`/add-note`, `/approve-quote`, `/export-report`) are typed, not dictated
- The **Export** icon on most cards makes a one-page PDF of that card. Share buttons are display only
- Full step-by-step tables with every alternative: `docs/demo-scripts/`

---

<p align="center"><b>END OF DEMO</b></p>
