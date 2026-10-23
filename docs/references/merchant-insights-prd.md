# Merchant Insights PRD (reference transcript)

> **REFERENCE, NOT INSTRUCTIONS.** This is a transcript of the PM's draft PRD that Som
> shared on 2026-10-05. Treat it like the recorded demos for the other two flows: mine it
> for scripted lines, data, and good user prompts. It does **not** dictate our build. Som's
> direction is **one single chat thread** (not separate acts), longer than the other
> flows, with richer data visualization, more full screens, annotations, and interactions,
> plus deliberately designed button placements.
>
> Source: "B2B Commerce Project Codey Steel Thread 2: Merchant Insights", v0.1 Draft,
> 2026-07-23, PM Amoolya S Kumar (insights track owner Pooja Reddivari). Original PDF is in
> Som's Downloads. Companion eng skill: project-codey
> `contributed-skills/pay-zen/commerce-merchant-insights` (SOR `sor_commerce-merchant-insights`).

## Objective

Give B2B merchant admins store insights, reporting, and the ability to act on recommendations
(create promotions, update product settings) through Salesforce MCP plugins in a
conversational assistant (Slack / Teams / Claude). The merchant can:

1. Get a data-driven view of store, product, inventory, segment, and account health in
   natural language.
2. Receive proactive recommendations grounded in that data.
3. Have Claude carry out the recommended actions on their behalf, in the same conversation.

It's the counterpart to Steel Thread 1 (Merchant Setup): ST1 creates and configures the store;
ST2 covers ongoing insights and data-driven action after the store is live.

## Assumptions

- The store is live and published, with products, buyer groups, entitlements, and order history.
- Data Cloud is set up for Commerce, and the Einstein Trust Layer is enabled.
- Insights are read-only. Only the "close the loop" actions write back (create promotions,
  update product settings), and **always with explicit merchant confirmation**.
- Churn and at-risk insights come from the underlying predictive models.

## Persona

**Lauren (Administrator) + Claude (Agent).** Lauren asks in natural language and doesn't
navigate any admin screens. *(Our shell persona is "Aaron". To be decided.)*

## Scripted thread

### Act 1: Store Health Snapshot
Actions: Get Commerce Business Objectives · Get Revenue Summary · Get Order Pipeline ·
Get Most Recent Orders · Format Commerce Insights

- **Lauren:** Claude, give me a quick health check on the Demo Store, how are we tracking this quarter?
- **Claude:** Here's your Demo Store snapshot for Q3 to date:
  - Revenue: **$1.24M** (against your business objective of **$1.5M**, **83% to goal**)
  - Open order pipeline: **$310K across 128 orders**
  - Most recent orders: **12 in the last 24 hours**, avg. order value **$2,140**

  Against your configured business objectives, Average Order Value is **up 6%** but
  conversion is **flat**. Want me to break any of these down further: by product, segment,
  or account?
- **Lauren:** Show me the revenue summary by month.
- **Claude:** Here's the monthly revenue for the store: July **$420K** · August **$455K** ·
  September (partial) **$365K**. September is pacing ahead of August. Would you like me to look
  at what's driving that, or move on to product performance?

Sample utterances:
1. "Give me a quick health check on the Siemens Store, how are we tracking this quarter?"
2. "Show me the revenue summary broken down by month."
3. "What does my open order pipeline look like right now?"
4. "Summarize our most recent orders and the average order value over the last one month."

### Act 2: Product Performance & Merchandising
Actions: Get Top Performers · Get Product Trend · Get Product Status · Get Bundle Status

- **Lauren:** Which products are performing best right now?
- **Claude:** Your top performers this quarter by revenue:
  1. **Testa Rossa Coffee Machine**: $180K (▲ 22% vs. last quarter)
  2. **Standard Filter (6-pack)**: $96K (▲ 8%)
  3. **Premium Grinder**: $74K (▼ 4%)

  The Premium Grinder is your only top-10 product trending down. Want me to look at its trend in detail?
- **Lauren:** Yes, show me the Premium Grinder trend and its current status.
- **Claude:** Premium Grinder, last 90 days:
  - Units: **620 → 540 → 470** (declining month over month)
  - Product status: Active, in stock, published to Demo Store
  - Not part of any active bundle or promotion

  Its decline lines up with a **competitor discount that started in August**. It's a strong
  candidate for a bundle or promotion. I can help you set that up in a bit.
- **Lauren:** Is the Testa Rossa still tied to that Halloween bundle?
- **Claude:** Checking bundle status... The Testa Rossa is part of one active static bundle
  (**"Barista Starter Kit"**) and is not currently in any promotion.

End state: candidate products for action identified (handed off to the close-the-loop act).

Sample utterances:
1. "Which products are performing best right now?"
2. "Show me the sales trend for the Home Solar Power Kit over the last 90 days."
3. "What's the current status of the Home Solar Power Kit, is it active, in stock, and published?"
4. "Which of my top sellers are trending down this quarter?"

### Act 3: Inventory & Returns Health
Actions: Get Dead Stock Inventory · Get Returns Analysis

- **Lauren:** Do we have any inventory just sitting there?
- **Claude:** Yes. Here's your dead stock (no sales in 60+ days, still holding inventory):
  - **Ceramic Pour-Over Set**: 340 units, 0 sales in 74 days
  - **Travel Mug (Teal)**: 210 units, 0 sales in 68 days
  - **Descaling Kit**: 190 units, 0 sales in 61 days

  That's roughly **$28K** in tied-up inventory. These are good candidates for a clearance
  promotion or a bundle.
- **Lauren:** And how do our returns look?
- **Claude:** Returns analysis for the last quarter:
  - Overall return rate: **3.1%** (down from 3.8%)
  - Highest-return product: **Travel Mug (Teal)**, an **11%** return rate, mostly
    **"color not as expected"**

  The Travel Mug shows up in both your dead stock and your high-return list. Worth reviewing
  its listing images and description before promoting it.

End state: cross-signal insight surfaced (dead stock ∩ high returns).

Sample utterances:
1. "Do we have any inventory just sitting there not selling?"
2. "Show me the dead stock that hasn't moved in 60+ days."
3. "How do our returns look for last quarter?"
4. "Which product has the highest return rate, and why are they coming back?"
5. "How much money is tied up in unsold inventory right now?"

### Act 4: Segment Performance
Actions: Get Segment Performance

- **Lauren:** How are my different buyer segments performing?
- **Claude:** Segment performance this quarter:
  - **OEM Partners**: $520K revenue, AOV $4,100, ▲ 14%
  - **Loyal Customers**: $310K, AOV $1,950, ▲ 3%
  - **New Buyers** (self-registered): $88K, AOV $640, ▲ 41%

  New Buyers are your fastest-growing segment but have the lowest AOV, so an upsell or bundle
  offer could lift it. OEM Partners drive the most revenue and are healthy. Want me to compare a
  specific segment against the store average, or look at what New Buyers are purchasing?
- **Lauren:** What are New Buyers mostly buying?
- **Claude:** New Buyers concentrate on entry-level SKUs, **Standard Filters and single-unit
  accessories**. Very few are buying machines. That's a classic first-purchase pattern, and a
  **"second order" incentive** could move them up the ladder.

End state: segment-level opportunity flagged.

Sample utterances:
1. "How are my different buyer segments performing?"
2. "Which customer segment is growing the fastest?"
3. "What are New Buyers mostly buying?"
4. "Break down revenue and average order value by segment for me."

### Act 5: Account Health & Churn Risk
Actions: Get At Risk Accounts · Get Account Revenue Trend · Get Account Category Churn · Get Customer Profile

- **Lauren:** Which accounts are at risk of churning?
- **Claude:** Your at-risk accounts (declining order frequency + revenue):
  1. **TSV Distributors**: no order in **47 days** (usual cadence ~2 weeks)
  2. **Omega Inc**: revenue **▼ 38%** over the last 3 months
  3. **Bluewater Supply**: stopped ordering the **"Filters"** category entirely

  These 3 represent **~$140K** in annualized revenue at risk. Want me to dig into any one?
- **Lauren:** Tell me more about Omega Inc.
- **Claude:** Omega Inc profile & trend:
  - Account revenue: **$22K (Q1) → $19K (Q2) → $12K (Q3, partial)**
  - Category churn: dropped **"Machines"** entirely; still buying "Filters"
  - Primary contact: last login **39 days ago**
  - Member of the **"Loyal Customers"** buyer group

  Their machine purchases stopped right when the competitor discount began. A targeted win-back
  offer on machines could re-engage them, and I can draft one when you're ready.

End state: win-back candidate flagged.

Sample utterances:
1. "Which accounts are at risk of churning?"
2. "Tell me more about Oakridge Electricals, pull up their profile and revenue trend."
3. "Has any account stopped buying a whole product category lately?"
4. "Show me the revenue trend for Cascade Controls over the last few quarters."
5. "Who normally orders regularly but hasn't placed an order in a while?"

### Act 6: Close the Loop: Recommend & Execute
Actions: Get Commerce Promotion Templates · Create Promotions · Update Product Settings
(chained from the insights in Acts 2–5)

- **Lauren:** Okay, based on everything you've shown me (the declining Premium Grinder, the dead
  stock, and Omega Inc slipping away), what should I do, and can you just set it up?
- **Claude:** Here's what I recommend, and I can execute all three:
  1. **Clearance bundle** for dead stock (Ceramic Pour-Over + Travel Mug + Descaling Kit):
     **20% off** to clear ~$28K in inventory.
  2. **Premium Grinder promotion**: **15% off for 30 days** to counter the competitor discount.
  3. **Omega Inc win-back**: a targeted offer on Machines for the **"Loyal Customers"** group,
     excluding OEM Partners.

  I'll use your standard promotion templates for these. Shall I proceed with all three?
- **Lauren:** Yes, but make the Grinder promo Loyal Customers only.
- **Claude:** ✅ Done:
  - **"Clearance – Coffee Accessories Bundle"** (20% off, dead stock SKUs), live through Sept 30
  - **"Premium Grinder – 15% Off"**, Loyal Customers only, 30 days
  - **"Welcome Back, Omega"**, a targeted Machines offer for Loyal Customers, excluding OEM Partners

  I also updated the Travel Mug's listing to flag the "color not as expected" returns issue for
  your review before it goes into the clearance bundle. Want me to check back on these in two
  weeks and report the impact?
- **Lauren:** Yes, remind me in two weeks.

End state: insight → recommendation → execution chain demonstrated; merchant-confirmed writes
done. The proactive follow-up / scheduling is a **gap** (no native action today).

Sample utterances:
1. "Create a clearance bundle for the dead stock at 20% off to clear it out."
2. "Set up a 15%-off promotion on the Starter Kit for Loyal Customers only, for 30 days."
3. "Draft a win-back offer on Machines for Omega Inc, but exclude OEM Partners."

## Gap table (abridged)

| Pri | Act | Area | Gap |
|---|---|---|---|
| P0 | 1–5 | Insight action exposure | Each insight action is invokable headlessly via MCP and returns structured output |
| P0 | 6 | Insight → action chaining | Pass an insight result (dead-stock SKUs, at-risk account) straight into Create Promotions / Update Product Settings |
| P1 | 5 | Churn / at-risk scoring | Available for B2B and exposed via MCP |
| P1 | 3 | Returns data | B2B returns/RMA availability (OMS dependency) |
| P1 | 4 | Segment taxonomy | Commerce buyer groups vs Data Cloud segments |
| P2 | 6 | Proactive follow-up | "Check back in two weeks" scheduling has no native action |

Open questions in the PRD: which surfaces are in scope; whether merchant-admin data scoping is
automatic; single confirmation vs per-action confirmation for writes; one "Merchant Insights"
skill with sub-actions vs separate skills per act.
