# INTENT

The product intent behind this project: what we're building, for whom, and why.
Captured across a running discussion, so this grows in parts. Design/interaction
decisions still live in `DESIGN_DECISIONS.md`; this file is the *why* above them.

> Status: in-progress capture. Newer parts append below.

**Reference:** Claude's official building + MCP-app design guidance is captured in
[`docs/references/claude-mcp-guidance.md`](docs/references/claude-mcp-guidance.md)
(verified links + distilled rules + where our kit currently diverges).

---

## 1. What this is

We are building **Salesforce commerce experiences on top of the Claude shell** from
the experience kit (the chrome, chat flow, and MCP app slots are already built; see
`SESSION_CONTEXT.md`). The shell stays; the experiences are the new work.

### Program context

- Part of **Claudeforce** — a partnership between Claude (Anthropic) and Salesforce.
- This project's scope: **Commerce** experiences, **merchant side**, specifically
  **B2B commerce**.
- Audience: the **merchant / sales rep** (not the buyer).

### The problem we're solving

In B2B commerce today, a buyer requests a quote from their **LWR storefront**. To act
on it, the merchant / sales rep has to move through **multiple pages in the Salesforce
Commerce app** — pulling up details, approving the quote, adding to it, etc. It's a
multi-screen, multi-step slog.

### The bet

Bring that **entire experience into a Claude conversation**. Instead of navigating the
Commerce app page by page, the rep works the quote — reviews details, approves, edits,
adds items — through chat, with Salesforce commerce surfaces rendered inline as MCP app
slots.

---

## 2. The three experiences

We will build **three distinct experiences**, one at a time (not all at once). Each is
its own experience and gets its own thinking-through and build; they are not variants of
one thing.

1. **Merchant insights**
2. **Quote management / approval**
3. **Order on behalf** (of the buyer)

**All design rules from the experience kit (`DESIGN_DECISIONS.md`) still hold.** We will
layer additional decisions on top as we discuss them, but nothing settled there is
being relitigated.

### Status (2026-10-05)

- **Quote management / approval** — built (2026-10-01). Runbook: `docs/quote-management-flow.md`.
- **Checkout anywhere / order on behalf** — built (2026-10-01), playtest round 1 done (2026-10-05). Runbook: `docs/checkout-anywhere-flow.md`.
- **Merchant insights** — next; stub only.

## 3. Display modes — follow the kit, use judgment

**The experience kit is the source of truth, not the official guidance.** The kit's
MCP-app components were built from the **official MCP Apps for Claude Figma UI kit**
(same community file), then refined with deliberate thought. Where the kit and the
public guidance differ, **follow the kit** — the guidance is reference, not law.

Figma references (community file `MCP Apps for Claude`, `sLwotk5R8DBe1oogmwkTWX`):

- **Inline cards** — node `467-24635`
  https://www.figma.com/design/sLwotk5R8DBe1oogmwkTWX/MCP-Apps-for-Claude--Community-?node-id=467-24635
  (has good examples worth studying)
- **Inline carousels** — node `467-31023`
  https://www.figma.com/design/sLwotk5R8DBe1oogmwkTWX/MCP-Apps-for-Claude--Community-?node-id=467-31023
- **Full screen** — node `467-39705`
  https://www.figma.com/design/sLwotk5R8DBe1oogmwkTWX/MCP-Apps-for-Claude--Community-?node-id=467-39705
  (has good examples worth studying)
- **Typography scale for content inside slots** — node `467-21506` (keep this in mind
  for all slot content)
  https://www.figma.com/design/sLwotk5R8DBe1oogmwkTWX/MCP-Apps-for-Claude--Community-?node-id=467-21506

**Settled decisions:**

- **Mode choice is a judgment call.** Pick the mode that fits the data a given query
  response warrants. **Do not force-fit** any mode.
- For our commerce tasks, expect **mostly inline cards + full screen**; **carousels
  likely little used** (but not banned — use if the data genuinely warrants browsing
  comparable peers).
- **`floating` stays.** It is a deliberate part of the kit — a **floating variant of
  the inline card**. It is not in the public guidance, and that's fine.
- **No dark mode** for now.

## 4. Theming — Salesforce brand, but Claude stays native

Salesforce needs some brand presence on Claude (colors, identity), but we **do not
re-skin Claude into Salesforce**. The **native environment is still Claude** — the host
owns the frame (per the kit's "host owns the frame" decision). Salesforce brand shows
up in the constrained, permitted spots (app logo/identity, the link/primary-action
accent), not by repainting the whole shell.

**Settled (2026-10-01) — the SLDS mapping.** We looked at SLDS and take **only** these,
into **only** the permitted spots (values are SLDS tokens):

| Spot | Value | Notes |
|---|---|---|
| App **logo** + name in slot headers | `public/salesforce.svg` + "Salesforce Commerce" | The one brand mark |
| `--color-app-link` (mcp-app link / primary action) | SLDS `$brand-accessible` **#0176D3** | WCAG-safe on white; was Figma info blue |
| Status pills / approval stepper (app content only) | success **#2E844A**, warning **#8C4B02**, info #0176D3 (+ soft fills) | Never on host chrome |

Reserved / **not** used for text: SLDS `$brand-primary` **#1B96FF** (fills/rings only,
fails contrast). **Untouched (stay Claude):** canvas, surfaces, ink, borders, the clay
accent, danger red — no structural neutral comes from SLDS. Full rationale in
`DESIGN_DECISIONS.md` ("Salesforce theming — SLDS accents only").

## 5. Quote management — the reference flow (demo target)

An engineer built this on **Claude Code** against the **Salesforce headless 360 API**
(no Salesforce UI). Our job: reproduce the same flow on **Claude (the shell)** — and do
it **better**, using the liberty of a real UI (richer visuals, thinking states, MCP-app
slots). Target: a **demoable transcript + interactions** for PM and engineering
teammates to see **tomorrow** (demo ~2026-10-02).

### The base flow (high level)

1. Buyer requests a quote on the **LWR store**.
2. Merchant is notified (channel doesn't matter).
3. Merchant opens a session connected to **SF headless 360**.
4. **User:** "I'm looking for pending quotes from one of my buyer accounts, Morton. Can
   you please help?"
5. Claude pulls up the **merchant quote review workflow**, figures out available skills,
   and selects the top one: **B2B merchant quote management skill**.
6. Claude **resolves the Morton account ID**.
7. Claude **retrieves pending quotes** for that account → shown as a **table**.
8. **User** asks for **details of the first line item**.
9. Claude fetches **SOR steps + detailed info** for that first line item.
10. **User:** "Buyer wants a free item as part of their quote. What are they entitled to
    buy?"
11. Claude's skill works out **buyer groups, entitlement policies, eligible products**,
    etc., and returns a **list of eligible products**.
12. **User picks one**; Claude **adds it to the quote as a free giveaway**.
13. Claude **applies a 100% discount** so the item cost is **0**.
14. Claude **adds a note** about the free sample, asking the buyer to review and confirm.
15. **User approves the quote.**
16. Claude **updates the necessary fields/records** and runs the **quote approval
    workflow**.

### What we get to add (UI liberty over Claude Code)

Better visuals, richer thinking states, and the MCP-app display modes (inline card /
full screen / floating) to render tables, line-item detail, eligible-product lists, and
the approval confirmation — instead of plain terminal text.

## 6. Build approach — scripted, elaborated, demo-runbook driven

The reference flow (§5) is the **skeleton**. We build the **same example, more
elaborate**, as a full conversation. It is a **scripted experience** (per the kit's
`script.ts` model): during the demo Somnath types prompts and the app plays the matching
scripted response.

- **Somnath needs a demo runbook**: the exact prompts to type, in order, each paired
  with the response it triggers. Keep this handy and accurate so the live demo maps
  prompt → correct response every time.
- **Not everything is a table or an MCP-app slot.** Some steps are plain Claude
  conversation (text). Reserve card / full-screen / floating slots for content that
  genuinely warrants a rendered surface (tables, line-item detail, entitled-product
  lists, approval confirmation). Judgment call per step (see §3).

### Real data observed in the reference demo (use as our synthetic data)

- Storefront/brand: **Alpine Group** (LWR store). Buyer account: **Morton**
  (Morton Breitenberg; a B2B Business Account).
- Products in cart / quote:
  - **Alpine Energy Drink Chai Pre 0.5L PET - 6 pack** — SKU **6010010**, **$20.50**
  - **Alpine Energy Pre Eco Pod, Chai** — SKU **6010020**, **$11.50**
  - Cart total **$32.00** (shipping $0).
- Quote number **00000011**, status flow: Draft → Needs Review → In Review → Approved →
  Rejected → Presented → Accepted → Denied (merchant sets Draft…Rejected; buyer-column
  sets Presented/Accepted/Denied). Intended target: **Approved**.
- Free promo line **00000023** — Alpine Energy Drink Chai (6-pack), Qty 1, 100%
  discount, TotalPrice **$0.00**, description "Promotional item / complimentary."
- Reference stack shown: Claude Code, Opus 4.7 (1M) on Amazon Bedrock, skill
  `merchant-storefront-lifecycle-skill`, MCP server tools like `get_sor_detail`.
- Detailed verbatim transcript + all tables: see
  [`docs/references/claude-code-demo-transcript.md`](docs/references/claude-code-demo-transcript.md).

## 7. Skills for this project

The kit already has a slash-skill mechanism (`src/shell/skills.ts`, catalog gated by the
Salesforce Commerce connector). **We can add project-specific skills** as needed. A skill
can encapsulate a whole step — e.g. a final **`/approve-quote`** skill that runs the quote
approval workflow. Author more realistic ones in this vein as the flow needs them
(candidates: quote review, entitlement lookup, add-promo-line, etc. — to be decided).

## 8. Thinking states + sequencing

- **Thinking states must be fully contextual to the script.** The reference video shows
  only a few generic spinner words; ignore those. Every thinking phrase we author is
  specific to what that step is doing (e.g. "Resolving Morton's account", "Retrieving
  pending quotes", "Checking entitlement policies", "Applying 100% promo discount").
- **Sequencing (agreed):**
  1. Read the demo frames (in progress) → capture the flow + tables verbatim.
  2. Design the **entire quote approval flow + the full script** (prompts, responses,
     which steps are plain text vs. which display mode, thinking states, any new skills).
     Present it for review — **do not build yet.**
  3. Build only after Somnath confirms.

<!-- Next parts append here as the discussion continues. -->
