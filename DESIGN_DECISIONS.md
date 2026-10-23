# DESIGN_DECISIONS

Durable design and interaction decisions. Each entry is a decision we've committed to, with a short rationale so we don't relitigate it. Add a new entry when something is settled; supersede (don't delete) when we change our minds.

Format: `### [date] Title` → Decision, Rationale, (optional) Supersedes.

---

### 2026-10-08 Merchant insights: every segment row has See trends
The segments prompt is "How are buyers doing this quarter?" and the row button reads **See trends** on all three rows, not just New Buyers. Each opens that segment's spend by category against the store average, so any row can be drilled into the same way. "Remember this" ideas (a bookmark on each card that fills and shows "Noted", plus an end-of-demo recall) are deferred until after the demo.

### 2026-10-08 Checkout anywhere: Claude checks entitlement unprompted; pick from the catalog

**Decision:** Asking to order on behalf of a buyer shows the buyer context card as an intermediary step, then Claude runs the entitlement check in the same turn. The rep never types `/entitlement-check`. The entitled catalog is the picker: checkbox rows and one **Add N to cart** button. There's no separate pick list. Only a product with variants (the Energy Drink's flavors) gets the carousel. The phase step is gone, so the flavor goes straight to fresh-or-keep cart. Address options can carry a pill. Morton's most-used address is **Frequently used**, which is deliberately not "Recommended". The order confirmation adds ship to and the delivery window, and nothing more.
**Rationale:** Per lead-designer feedback, finding out what the buyer can buy is the point of ordering on their behalf, so Claude should do it. A table that already lists the products shouldn't hand off to a second picker.

### 2026-10-08 Claude recommends the free sample and checks margin before adding it

**Decision:** In quote approval, `/entitlement-check` names the best free sample (the Chai Post 6-pack: the buyer asked for it, and it pairs with a line on the quote). It also gives a one-line margin check, and marks that row in the card with a **Recommended** pill, its reason and the primary button. Clicking **Add free sample** plays one Claude turn: a one-line margin check ("passed… low risk, so I'm adding it now"), more tool calls and thinking, then the **Free sample added** card. The confirm card is gone; the margin check replaces it. "Free giveaway" is renamed **free sample** everywhere, matching the buyer's own words.
**Rationale:** Lead-designer feedback asked for a more prescriptive Claude. It should check the risk itself, show the merchant that check at both steps, and act when the risk is low, instead of asking for a confirmation that adds nothing.
**Round 2 (same day):** the step is typed `/entitlement-check Free sample`, so the request says what the buyer wants. Hovering the Recommended pill opens a light popover listing why Claude picked the product. In the approval stepper, a final stage that has been reached is green, not the active blue.
**Round 3:** the two margin checks say different things. The first explains the list: it holds only the samples that barely touch margin, and the pick is priced. The second is a recheck against the live quote that confirms nothing changed, so it isn't redundant. A pick other than the recommended one gets its own numbers there.
**Mechanism:** a scripted beat can carry a `then` follow-on part (`ScriptedResponse.then`). It plays in the same message, its tools appear mid-message as a `tools` block, and the action row waits until the last part lands.

### 2026-10-06 Hover annotations on every chart, in every journey

**Decision:** Every chart shows the shared `ChartTooltip` on hover, quote approval's spend bars included (`ChartBar.hover`). The first line says what the bar is, the second gives the figure that matters, and any further lines are quiet detail. The tooltip anchors at the bar's end, and the other bars dim to 35% so the hovered one holds the focus. This includes merchant insights' horizontal bars (Health by area, dead stock, returns) and the mix bars, where every other segment dims across all rows. Tables, fact lists and KPI tiles don't get tooltips, and no new charts were added for this.

**Rationale:** Per Som, annotations mean the small hover tooltip from merchant insights, applied to the charts that already exist.

### 2026-10-05 Quote and checkout cards use the insight design system

**Decision:** Record cards in quote management and checkout anywhere follow the merchant insights hierarchy. Each has an 18px title, an optional pill and a muted 14px subtitle that carries the context (account, store, date), so that context isn't repeated in the body or the footer. Headline numbers are **KPI tiles** (quote detail, spend history, order detail). Key/value data is a hairline **FactList**, and a short approval summary is a **FactStrip**. Changes read "before → after" (**ChangeRows**). Product cells show a muted second line (SKU or product family), and contract prices show the list price struck through. 14px is the type floor. Pills are InsightPill.

**Rationale:** Per Som, the insights flow set the bar for hierarchy and spacing, and the other two journeys should match it. The goal is no repeated words, a clear reading order, and one primary number per view.

### 2026-10-05 Export on record cards that are pure data

**Decision:** In quote and checkout, only read-only data views carry `exportAs`: pending quotes, a quote's detail, spend this year, an order's detail and the orders list. Pickers, confirmations, carts and approval steps don't. Export gives a one-page PDF through the shared `onePageExport` (`experiences/export.ts`). Merchant insights keeps its multi-page `exportFile`.

**Rationale:** Per Som, download and share belong where a view is a record worth taking out of the chat, not on steps of a flow.

### 2026-10-05 Health by area and Accounts on the store dashboard

**Decision:** The store dashboard runs Next best actions → **Health by area** → Revenue → Orders → **Accounts** → Business objectives. Health by area is a horizontal bar per area (0–100, healthy at 75+), each with a one-line reason. Areas under 75 are highlighted. Accounts pairs 4 KPI tiles with the at-risk list. For an active store, catalog and pricing score high (2 products missing images). There's no overall health score and no "needs attention" or "what to do next" block, because Next best actions covers those. The header stays as it is.

**Rationale:** These were taken from a teammate's store-health screen at Som's direction: capability only, not its visual language.

### 2026-10-05 Full-screen prompts return to the chat (supersedes "Full-screen apps answer in place")

**Decision:** A prompt typed in a full-screen app's prompt bar always closes the overlay and is answered in the chat. New data never appears inside an open app, so there is no "Just added" state. When the answer deserves a large view, it comes as a new **expandable card** with its own full-screen page. Example: "Break my Q3 revenue down by month" gives a Revenue by month card that expands to a page with by-month and by-week groups. The in-place machinery (`ScriptedResponse.fullscreen`, store `focus`, `InsightGroup.fresh`, the in-app thinking pill) is removed.

**Rationale:** Per Som, the chat stays the record of the conversation, and each answer is its own artifact you can expand, export and share.

### 2026-10-05 Export and Share on every insight card and full screen

**Decision:** A slot opts in with `exportAs: {id, title}`. Its card header (or a floating block's top-right cluster) then shows **Export** (download icon, "Export as PDF") and **Share** icons beside Expand, and its full-screen header shows labeled **Share** and **Export report** buttons. Export plays the experience action `export|title|id`, which runs `export-report` and drops a one-page PDF file card in the chat (closing full screen). File cards carry **Download** and **Share** icons, and so does the preview header. Share and Download are display only.

**Rationale:** Per Som, every view should be easy to take out of the chat. Reusing the export beat means a single-view PDF looks exactly like the full report's page for that view.

### 2026-10-05 Next best actions atop the store dashboard

**Decision:** The full-screen store dashboard opens with a **Next best actions** group of 3 cards. Each card has an icon, a short what-to-do title, a one-line why with the numbers, and one CTA. A CTA either posts a full standalone prompt (See top products, See at-risk accounts) or goes to Commerce (Open approvals, display only). It's a reusable `next` insight section.

**Rationale:** Per Som, the dashboard should say what to do, not just report. The prompt CTAs are also shortcuts into the story's later beats.

### 2026-10-05 Typed prompts stand on their own

**Decision:** Every scripted prompt (typed or posted by a button) is a full sentence that makes sense without the previous turn: "Which products are driving my growth the most, and are any of my top 10 slipping?" rather than "Which products are driving it?". The "Noted for later" line appears only when the prompt asks Claude to remember something, so a beat reached from a dashboard CTA doesn't claim a note Aaron never asked for.

**Rationale:** Per Som, the audience at a demo won't remember the previous message.

### 2026-10-05 Insight type scale and viz palette

**Decision:** Insight views use one type scale (tokens in `tokens.css`): page 28, group 22, card/chart title 18, KPI 34, body 16, label 14. **Nothing goes below 14px**, so insight views use `InsightPill` (14px) instead of the 12px `StatusPill`. Charts draw from a four-step blue ramp (`viz-1..4`) plus one alert red. Red is used only for the thing being called out.

**Rationale:** Som asked for visuals and annotations that are much better than the first pass. A fixed scale keeps dense dashboards readable on a projector, and keeping red for one item makes the problem obvious.

### 2026-10-05 Insight views are composed from sections

**Decision:** Every insight card, full-screen page and report page is a list of typed sections (`kpis`, `line`, `columns`, `ranked`, `hbars`, `mix`, `facts`, `risk`, `toggle`, `actions`, `table`, `objectives`) rendered by `InsightView`'s `Section`. Every chart has a hover annotation (a tooltip with the exact figure and a one-line note). Drill-down buttons post a follow-up prompt as Aaron; there are no "flag" buttons.

**Rationale:** One set of sections means the chat card, the full-screen dashboard and the PDF pages always match, and a new beat is data, not new UI.

### 2026-10-05 Full-screen apps answer in place (SUPERSEDED same day — see "Full-screen prompts return to the chat")

**Decision:** A prompt sent from the full-screen app's prompt bar can be answered **inside the app**: the beat returns `fullscreen: {block, focus}`, the overlay stays open, shows a thinking pill above the bar, swaps in the new content (new groups marked "Just added") and scrolls to `[data-group=focus]`. Beats without `fullscreen` still close the overlay and answer in the chat.

**Rationale:** Per Som, "break revenue down by month" should happen inside the Alpine dashboard. Closing the app to answer a question about the app breaks the flow.

### 2026-10-05 Created files open in a side preview

**Decision:** A created file shows as a **file card** in the chat (doc tile, title, "Document · PDF"). Clicking it opens a **side preview panel** (47% wide, min 480px) and the chat narrows beside it. The preview shows letter-ratio pages on a grey stage, a "Page N / M" pill, Download (no-op) and Close; Esc closes it. While a file exists, a Files button in the chat header reopens it. Report pages reuse the insight sections, with action buttons removed.

**Rationale:** Matches claude.ai's artifact panel (`docs/references/claude-file-preview.md`). The report has to look like the views Aaron picked, so it uses the same sections.

### 2026-10-05 Remembering is Claude's job: "Noted for later"

**Decision:** Aaron asks Claude to remember something in a prompt ("keep the Grinder in mind"). The reply opens with a muted bookmark line, **Noted for later · X**. There are no flag or bookmark buttons on cards, and no "remind me in two weeks". Asking for "everything I asked you to remember" returns a numbered **Things to do** list.

**Rationale:** Remembering is something Claude does from a plain request; buttons for it would make it look like an app feature.

### 2026-10-05 Promotions: drafted, created inactive, made live per row

**Decision:** Promotions are drafted first (nothing created), can be edited in the card (audience per row; changed rows are marked **Updated**) or by a typed prompt, then **Create all N** creates them **inactive**. Each row has **Make live**, which shows a brief "Turning on" spinner, then a Live pill, and plays no chat message. The experience is told through `notify` → `Experience.onEvent`, so the exported report shows which promotions are live.

**Rationale:** Follows the commerce-merchant-insights skill (draft → confirm, inactive by default). Making a promotion live is an in-app write, not a conversation turn.

### 2026-10-05 Slack share card is display only

**Decision:** The recap ends with a Slack share card shaped like the file card (Slack logo, title, meta, Share button). The button has a hover state and does nothing.

**Rationale:** It suggests the next step without building a Slack flow the demo doesn't need.

### 2026-10-05 In-chat composer grows when text wraps

**Decision:** When the text in the in-chat prompt box wraps, the box switches to a stacked layout: the text starts at the box's left edge, "+" and the Salesforce chip move to a bottom row, and the height fits the content. Single-line input keeps the one-row layout.

**Rationale:** Per Som's screenshot, wrapped text squeezed beside the chip was hard to read. This is how claude.ai's box behaves.

### 2026-10-05 Reorder = a cart that prompts checkout (optionally completes end to end)

**Decision:** In checkout anywhere, `/reorder <order number>` (typed, or prefilled by a row's **Reorder** button on the successful-orders list) puts **every line on that order** into a fresh cart, repriced on contract, linked to the source order, with a **Proceed to checkout** prompt. The demo ends there. If the rep proceeds, the reorder runs the same address → review → place-order beats and becomes a new placed order, which then shows in the successful-orders list. "Reorder the same thing again" means the **last order placed**. Bare `/reorder` asks which order.

**Rationale:** Matches Salesforce semantics (a reorder is a cart until checked out) and Somnath's call. Keeping checkout working after a reorder means a curious click never dead-ends.

### 2026-10-05 Scripted journeys may keep light session state

**Decision:** A journey script may hold module-level `session` state across beats when the flow needs memory (checkout anywhere: open cart, chosen address, orders placed this session). The `Experience` interface gained an optional `reset()`, called by the store from `selectExperience` and `reset`, so restarting a journey from the sidenav always starts clean. Beat values (cart, review, confirmation, detail, list) derive from numeric line data so totals stay consistent.

**Rationale:** Pure keyword matching can't express "the order we just placed" or "4 orders now". A tiny, resettable state object is the least machinery that keeps the demo truthful, and it stays inside the experience module (the shell is unaware).

### 2026-10-05 In-app buttons may PREFILL the prompt box instead of sending

**Decision:** Besides `sendPrompt` (posts a user message) and `actionKey` (in-app beat, no bubble), a view can **prefill** the composer via `store.prefill(text)`. The mounted composer writes it in (a leading `/skill` becomes a chunk), focuses, parks the caret at the end, and the rep presses Enter. Used by the **Reorder** row buttons (`/reorder <number>`).

**Rationale:** Order numbers are too long to type live, but the audience should still *see* the skill + argument being run. Prefill shows the command without sending it on the rep's behalf.

### 2026-10-05 Carousel tiles are product cards; images optional

**Decision:** `inline-carousel` slots can carry real `tiles` (`ProductTile`: image, name, detail, contract price with list struck through, a pick button that posts `prompt`). Without `image`, the tile shows a tinted placeholder. Used for the flavor pick (Chai / Green Tea / Tart Cherry). The phase pick stays a numbered `select` list (same product, no visual difference worth a card).

**Rationale:** Images help where the options differ visually; the carousel is the kit's mode for comparable peers. Real product shots drop in later via `image`.

### 2026-10-05 Same skill, journey-specific meaning; thinking copy is beat-specific

**Decision:** A skill id shared across journeys (e.g. `/entitlement-check`) returns that **journey's** answer: in quote management it surfaces **free-giveaway** candidates for the quote; in checkout anywhere it lists what the buyer can **buy** at contract price. Thinking labels describe **only that beat's work**; never re-run context already resolved in an earlier step (no "resolving the org/buyer" after step 1).

**Rationale:** The slash menu is exhaustive across journeys, so the skill must make sense in each. Repeating step-1 lookups in later thinking states reads as fake and was caught in playtest.

### 2026-10-01 Three fixed journey chats replace the new-chat FTUX (supersedes 2026-09-25 New-chat interaction)

**Decision:** The sidenav holds exactly three fixed chats, **Quote approval · Checkout anywhere · Merchant insights**, which are the journey selector. Clicking one arms that experience (`activeExperience`) and starts it from scratch; "New" restarts the current journey. The NEW_CHAT FTUX (commit-on-send loader, random titles, "New chat" prepend) is removed. Scripts live one per journey under `src/chat/experiences/` behind a registry. The `/` menu is **exhaustive**: Salesforce skills from all three journeys, whichever chat is selected.

**Rationale:** The project demos three distinct journeys; fixed chats make switching and replaying instant and obvious. An exhaustive skill menu mirrors a real connector's catalog instead of a per-demo subset.

### 2026-10-01 Tool-call timeline atop responses

**Decision:** Responses show the Headless 360 MCP (`project-codey`) tool calls that produced them as a vertical timeline above the skill chip: wrench glyph, mono tool name, quiet SOR target, joined by a hairline. 1–3 per response. The **latest** response's tools are always expanded; **earlier** responses fold into a "Headless 360 MCP tools" row with a chevron (and fold automatically once a newer response lands).

**Rationale:** Makes the agent's work legible the way the Claude app does, with realistic tools; collapsing history keeps the transcript calm.

### 2026-10-01 Numbered pick-one menus for drill-downs

**Decision:** Checkout anywhere uses a numbered `select` view for choices (product line, phase, cart choice, address). Picking posts the option's `prompt` as a user message (the choice reads as the rep's ask in chat).

**Rationale:** Matches the recorded demo's numbered choices and keeps choices in chat, per the app-vs-chat split.

### 2026-10-01 Salesforce theming — SLDS accents only; Claude owns the frame

**Decision:** Salesforce brand appears **only** in the permitted accent spots, using SLDS token values: (1) the app **logo** (`public/salesforce.svg`) + name "Salesforce Commerce" in slot headers; (2) the mcp-app **link / primary-action accent** `--color-app-link`, now SLDS `$brand-accessible` **#0176D3** (WCAG-safe on white; was Figma info blue); (3) **status pills / the approval stepper** inside app content, via scoped tokens `--color-success` **#2E844A**, `--color-warning` **#8C4B02**, `--color-info` #0176D3 (+ soft fills). The bright SLDS `$brand-primary` **#1B96FF** is reserved for fills/rings, never text (fails contrast). **Everything else stays Claude** — canvas, surfaces, ink, borders, the clay accent, danger red. No structural neutral is taken from SLDS.

**Rationale:** "Native environment is still Claude" (INTENT §4). The host owns the frame; a connected app tints only logo + accent. SLDS gives Salesforce a real, recognizable identity in exactly those spots while keeping every app native to Claude and accessible. Using `$brand-accessible` (not `$brand-primary`) for anything text-bearing keeps contrast safe on the near-white canvas.

### 2026-10-01 Slot bodies render real `view` widgets; in-app actions play scripted beats

**Decision:** A slot block may carry a `view` (a `SlotView` discriminated union: quote-list, quote-detail, entitlement, giveaway-confirm/result, note, approval). `SlotContent.tsx` dispatches on `kind` and renders real widgets (tables, field grids, pills, status stepper, delta tables) in place of the old dashed placeholder; the placeholder remains the fallback when a slot has no `view`. Buttons inside a view fire an **in-app action** via `store.runAction(key)`, which plays the next scripted beat as an assistant message **with no user bubble**. Freeform asks still go through chat (`send`), confirming/executing a prepared action happens in the app — the guidance's app-vs-chat split.

**Rationale:** The experiences need real commerce surfaces, not placeholders. Keeping the data declarative in `script.ts` (the one file that fakes Claude) and rendering via a typed union keeps the transcript renderer unchanged as views are added, and preserves forkability. Routing button clicks through `runAction` (not a fake chat message) matches how a real MCP app commits a prepared action.

### 2026-10-01 Full-screen is an expanded view, not a slot mode; display-mode purposes are strong suggestions

**Decision:** `fullscreen` is **not** a `SlotMode`. It's the **expanded view** of an `expandable` `inline-card` or `floating` block, tracked in the store (`expanded`) and painted by `FullScreenApp`. It **takes over the main stage** (12px-inset surface, 64px app header with a close **X**, prompt bar pinned at the bottom in a safe inset), while the **transcript stays mounted underneath**; closing returns to the same scroll position. The body **scrolls behind the pinned prompt bar** — the safe area is never overrun. A prompt sent from full-screen **posts to the same chat and closes the overlay** *(briefly superseded on 2026-10-05 by "Full-screen apps answer in place", then restored; see "Full-screen prompts return to the chat")*. The **invoker** is a `Maximize2` icon top-right (the former `</>` inspect slot), shown on cards + floating responses when `expandable`; **carousels are never expandable**. Alongside this, `types.ts` documents **what each of the four modes is for** (`inline-card`, `inline-carousel`, `floating`, `fullscreen`) as **strong suggestions, not rules** — a fork may invent its own uses.

**Rationale:** Matches the Figma reference (`467-39705`) and keeps the model honest: nothing is "a full-screen thing" in isolation, it's a card/floating object that can be blown up. Reusing the transcript's non-scrolling positioning layer means the pinned prompt bar behaves identically to the chat, and the safe inset holds for arbitrarily tall content. Documenting mode intent as guidance (not law) fits the repo's forkability goal, where teammates will find uses we didn't anticipate.

### 2026-10-01 Inline carousel is frameless; arrows follow scroll position

**Decision:** The `inline-carousel` display mode has **no card frame**. Its header (logo monogram + name; no icon — see the 2026-10-01 full-screen entry, carousels are never expandable) and its row of 220×355 tiles float directly on the chat column, with no surface, border, or divider, and no footer. This is deliberately unlike the framed `inline-card`. Navigation arrows are driven by scroll position: forward-only at the start, both directions once scrolled, back-only at the end, and none when the tiles already fit.

**Rationale:** Matches the Figma reference (`467-31023`) and the product. A frame around a horizontally scrolling row reads as heavy and boxes in content that is meant to bleed toward the edge. Position-driven arrows avoid dead affordances (no forward arrow at the end, no back arrow at the start).

### 2026-10-01 Response content house-style

**Decision:** Claude-side response copy authored in scripts follows a fixed style: **no em dashes**; no AI filler openers ("Here is…", "As an AI…"); confident, concise enterprise sales/commerce tone; realistic synthetic data (named accounts, currencies, dates, percentages); short paragraphs (2–3 sentences); and framing around an action or decision rather than passive info delivery. This governs the response `content`, not the app-slot chrome.

**Rationale:** The kit demos enterprise Salesforce commerce experiences, so the copy has to read like a fast, decisive assistant, not a generic chatbot. Encoded in `script.ts` and in the author's memory so it holds across sessions and forks.

### 2026-10-01 MCP app cards: host owns the frame

**Decision:** When a connected MCP app renders inside the transcript, **Claude (the host) paints the entire frame** — surface, hairline border (no shadow), dividers, and all chrome text (header app name, footer status/link). A connected app supplies only its **identity** (logo monogram + name) and may tint exactly **two** spots to its brand: the logo, and the footer link / primary-action accent (token `--color-app-link`). Nothing else recolours. Cards come in **display modes** (`inline-card` shipped; `inline-carousel` / `fullscreen` to follow) dispatched by `Slot.tsx` on a `mode` field, so the transcript renderer never changes as modes are added. `inline-card` shows a skeleton for `CARD_SKELETON_MS` then reveals content + optional footer.

**Rationale:** Every app must read as native to Claude, not as an embedded iframe with its own look. Constraining brand tint to two accents keeps visual consistency across arbitrary third-party apps while still letting each be recognisably itself. The `mode` dispatch keeps the schema open for richer display modes without churning the renderer.

**Supersedes:** the light-red dashed "App Contents" placeholder slots (`chat` / `fullscreen` variants) from the 2026-09-29 chat-flow build.

### 2026-09-24 Tech stack

**Decision:** React + Vite + TypeScript, Tailwind CSS v4, `motion` (Framer Motion) for animation, Zustand for state.

**Rationale:** Fast to fork, minimal config, TypeScript for team maintainability. `motion` is the standard for buttery React animation (a hard requirement). Zustand is tiny and easy to reason about.

### 2026-09-24 Scripted-first, API-ready

**Decision:** Interactions are driven by authored scripts ("experiences") by default. A provider seam (`ChatProvider` interface) abstracts the response source so a real Claude API can be plugged in later without touching the UI.

**Rationale:** Zero API keys needed to fork and demo; deterministic for design work; keeps the door open for live model responses.

### 2026-09-24 Shell / experience separation

**Decision:** The UI "shell" (chrome) and the "experiences" (content/scripts) are cleanly separated. Teammates author a new experience as data, never editing the chrome.

**Rationale:** This separation is what makes the repo reusable and forkable.

### 2026-09-24 Design tokens: two-layer model in Tailwind v4 `@theme`

**Decision:** Tokens live in `src/styles/tokens.css` as CSS custom properties. Two layers: raw **primitives** in `:root` (brand palette, rarely touched) and **semantic** tokens in `@theme` (`--color-bg`, `--color-surface`, `--color-text`, `--color-accent`, `--color-border`, radii, type scale, motion) that reference primitives. Components use only semantic tokens; forkers reskin by overriding semantics (or swapping primitives) without touching components.

**Rationale:** Tailwind v4's `@theme` is the native token mechanism — one file is the single source of truth *and* generates the utilities, so nothing drifts out of sync. The primitive→semantic split is what makes re-theming a fork trivial.

### 2026-09-24 Copy: one typed dictionary

**Decision:** All user-facing text lives in `src/copy/copy.ts` as a typed `as const` object, referenced by key. Split by `shell` vs. per-experience blocks. No hard-coded strings in components.

**Rationale:** Change copy in one place; typed keys give autocomplete and compile-time errors on typos/removals; shape is i18n-ready for later.

### 2026-09-24 Theme scope: light only (for now)

**Decision:** Ship the warm "paper" light theme first. Dark mode deferred, not designed yet.

**Rationale:** Fewer decisions now; the semantic-token layer means dark can be added later as a theme override without touching components.

### 2026-09-24 Fonts: deferred, behind swap variables

**Decision:** Typefaces are undecided. Token file uses `--font-ui` / `--font-display` placeholders (system fallbacks today) as the single swap point. Note: licensed Anthropic fonts (Styrene/Tiempos) can't ship in a forkable repo — the eventual pick will be open substitutes or system fonts.

**Rationale:** Unblocks the token foundation without committing to type; the swap point keeps the later decision cheap.

### 2026-09-24 Fidelity target: claude.ai/new (web)

**Decision:** We build toward the **web** Claude new-chat screen (`claude.ai/new`), not the desktop app. Layout is a **two-pane shell** (sidenav ~284px + main canvas). The "Claude" serif wordmark stays at the top-left of the sidenav (web keeps it; desktop app omits it). Palette is **neutral near-white**, not cream: sidenav ~`#F9F8F6`, main ~`#FDFDFC`, hairline ~`#EDECE8`.

**Rationale:** The web app is the closest match to what this kit reproduces and what forkers will demo. Settles the layout-paradigm open question and corrects the initial cream palette (seeded from a different screenshot). **Supersedes** the "warm paper/cream" default from the light-theme decision for the *main canvas* — cream `#F5F4EF` is now a candidate for the sidenav surface instead.

### 2026-09-24 Icon pack: Lucide

**Decision:** Standardize the shell on **Lucide** (`lucide-react`, ISC license), tree-shaken per-icon. Two exceptions get hand-made custom SVGs kept in `src/shell/icons/`: the **clay sunburst/spark** (Anthropic brand mark — not in any open pack) and the **ghost** top-right glyph if no close Lucide match exists.

**Rationale:** Lucide is the maintained fork of Feather — same thin/rounded-cap aesthetic as the Claude app's icons, but 1000+ icons and a first-class React package. Feather itself is too small (~287) and lightly maintained. Safe to bundle in a fork.

### 2026-09-24 UI sans: Hanken Grotesk (provisional)

**Decision:** The UI sans (`--font-ui`) is **Hanken Grotesk** (`@fontsource-variable/hanken-grotesk`, bundled/open). Chosen after A/B/C-ing Hanken · Geist · Inter live — Hanken read closest to Anthropic Sans. **Provisional** ("until Somnath decides otherwise"); Geist/Inter uninstalled and the dev `FontSwitcher` removed.

**Rationale:** Warm, slightly-rounded humanist grotesque — closest of the open candidates to Anthropic's warm-geometric UI sans. Open (OFL), safe to bundle. This completes the type system: **Hanken (sans) + Anthropic Serif / EB Garamond (serif)**.

### 2026-09-24 Serif: Anthropic Serif primary, EB Garamond fallback

**Decision:** The primary serif is **Anthropic Serif** (Anthropic's proprietary brand serif), in two optical sizes — **Display** (`--font-display`: headings, greeting, wordmark) and **Text** (`--font-serif-text`: body serif). `@font-face` lives in `src/styles/fonts.css`; static OTFs live in `src/assets/fonts/anthropic-serif/`. **EB Garamond remains the open fallback** in every serif stack.

**Licensing / forkability:** Anthropic Serif is proprietary and **not redistributable**, so the OTFs are **gitignored** — present locally, never committed/pushed. A fork without them degrades automatically to EB Garamond (bundled, open). This is why we keep EB Garamond installed rather than removing it. **Supersedes** "Display serif: EB Garamond" (EB Garamond is now the fallback, not the primary).

### 2026-09-24 Display serif: EB Garamond (superseded — now the fallback)

**Decision:** The display/serif typeface is **EB Garamond**, self-hosted via `@fontsource-variable/eb-garamond` (variable weight 400–800), registered in `main.tsx` and consumed through the `--font-display` token. UI sans (`--font-ui`) is still undecided.

**Rationale:** Open (SIL OFL) so it's safe to bundle in a forkable repo; a warm humanist serif that fits the Claude editorial feel. Self-hosted = no runtime CDN, deterministic for demos. **Supersedes** the display half of "Fonts: deferred, behind swap variables" (the swap-var mechanism stays; the serif is now chosen).

### 2026-09-24 Product name & tab title

**Decision:** The product name is **"Claude XKit"** (capital X; "XKit" = experience kit), and the browser tab / document title is always that string. Single source of truth: `copy.app` in `src/copy/copy.ts`; `index.html` carries it as the pre-JS fallback and `main.tsx` sets `document.title` from the copy source.

**Rationale:** Standing instruction from Somnath. Centralizing it in the copy dictionary keeps the "change copy in one place" rule intact. **Updated 2026-09-24** from the earlier "Claude Cowork XKit" (dropped "Cowork" to match the repo rename; Somnath chose capital X over xKit).

### 2026-09-25 Radius pattern — 8px is the default; nothing is fully rounded

**Decision:** **8px (`--radius-md`, `rounded-md`) is the default corner for every rectangular control** — nav rows, search field, segmented-control track, icon buttons, the model-menu trigger and its rows, **and the suggestion chips under the composer**. Nested elements step down to `--radius-sm` (6px, `rounded-sm`) — e.g. the segment thumb inside the 8px track (concentric with the 2px inset). The composer card is the one deliberate step **up** to `--radius-lg` (16px). **`rounded-full` is reserved for genuinely circular things only — the account avatar.** Pill-shaped chips are NOT fully rounded; they use 8px like everything else. No arbitrary `rounded-[Npx]` in shell components — always go through the token.

**Rationale:** One radius rule keeps the chrome from looking "fuzzy" (mismatched corners). `--radius-md` moved 10px → 8px to make this the standard. Concentric nesting (8 outer / 6 inner) reads as intentional. Calling out the `rounded-full` exception explicitly because it's an easy default to reach for on chips/pills — it's wrong here (repeated slip: chips were built fully-rounded twice before being corrected to 8px).

### 2026-09-25 Palette values — neutral near-white (locked, measured from claude.ai)

**Decision:** The neutral palette is now concrete, measured from the live app: main canvas `#FCFCFB` (`--color-bg`), sidebar `#FBFBF9` (`--color-sidenav`), hover/selected wash + hairline `#EDECE8` (`--color-elevated` / `--color-border`), white surfaces `#FFFFFF` (`--color-surface`). Text: primary/active `#0B0B0B` (`--color-text`), resting labels + all icons `#52514F` (`--color-text-muted`). Staged for the not-yet-built prompt bar: bg `#FFFFFF`, near-black focus stroke `#0B0B0B` (`--color-stroke-strong`). Primitives were reorganized into a neutral `paper-*` scale + simplified `ink-*`.

**Rationale:** Replaces the proposed/approximate values with exact measurements, completing the cream→near-white retune. **Supersedes** the approximate palette in "Fidelity target: claude.ai/new (web)" (`#F9F8F6` / `#FDFDFC` → the measured values above).

### 2026-09-25 Dummy interactions & tooltips for feel

**Decision:** To reproduce the Claude app's *feel* while building, the shell may include **presentational, non-wired affordances** — tooltips, labels, menu options — some of which are intentionally dummies (no behavior behind them). First primitive: `src/shell/Tooltip.tsx` (dark tooltip, `--color-tooltip` #30302E / white, hover+focus reveal, 4 sides, motion from shared tokens).

**Rationale:** Fidelity to the real app's texture matters for demos and for the fork target; wiring every affordance up front would slow the visual build. Dummies are clearly marked in code so they're easy to make real later.

### 2026-09-25 Icon-button hit box — 32px is the norm

**Decision:** Standalone **icon-only buttons carry a 32px (`size-8`) hit box**, `rounded-md`, with the standard `hover:bg-elevated hover:text-text` wash — matching the sidebar collapse toggle (the reference). Icon glyph inside is `size-[18px]`. The **only** exception is the recents **preferences (sliders) button** next to the section heading, which stays a tiny `size-6` box. Icons that live *inside* a larger button (e.g. the chevron within the account button) are not their own buttons and get no box.

**Rationale:** Consistent, comfortable tap targets read as intentional; a patchwork of box sizes looks accidental. The one small exception is deliberate — a secondary, in-caption affordance that shouldn't compete with the row.

### 2026-09-25 Two prompt boxes; menu open-direction follows position

**Decision:** There are **two prompt-box variants**. (1) The **"new chat" / greeting prompt box** — the centered, full-size card on the empty main stage (`src/shell/Composer.tsx`). (2) A future **"in-chat prompt box"** — a minimal version that shifts to the **bottom** of the page once a chat begins. Because the new-chat box is centered with room below, **its menus (model, "+") open downward**; the bottom-anchored in-chat box will open them **upward**. Direction is a single `openUp` prop on `ModelMenu` / `AddMenu` (default `false` = down); no menu markup is duplicated between variants.

**Rationale:** Open-direction should follow available space, not be hardcoded. One prop keeps both prompt boxes sharing the same menu components. Naming the two boxes explicitly avoids ambiguity in later work ("in-chat" vs "new chat").

### 2026-09-25 New-chat interaction — commit on send, one flag to disable (SUPERSEDED — see 2026-10-01 three fixed journey chats)

**Decision:** Clicking **New** and starting chats follows claude.ai's FTUX, driven by minimal state lifted into `App.tsx` (no store yet): a `chats` list, `activeId`, `activeSent`, and a composer remount `key`. On load the greeting shows with **no** recents entry. The **first send** (Enter / send button) prepends a chat row that **spins a loader ~1s** then resolves to a **random title** (`copy.shell.draftNames`); further sends stay in the same chat. **New** prepends a **"New chat"** placeholder row and resets the greeting box, but is a **no-op when the current chat is still fresh/unsent**. The active chat's row carries the selected wash (`bg-elevated`); no cross-chat navigation yet. The whole interaction sits behind a single `NEW_CHAT` flag in `App.tsx` — flip to `false` and "New" reverts to a presentational active row.

**Rationale:** Keep it faithful but cheap and reversible (Somnath asked to be told if it got complex and to keep it switch-offable). Lifting a little state into `App` beat introducing Zustand for this scope. The post-Enter transcript view is deliberately deferred (see the chat-slot TODO), so after sending the greeting box stays put while the titled chat appears in the sidebar.

### 2026-09-25 Chat title menu + small (28px) button variant

**Decision:** Once a chat has a resolved title, it shows in the **top-left of the main stage** (`src/shell/ChatTitleMenu.tsx`). The **title text is plain; only the trailing chevron is the trigger** — unlike the composer menus where the whole label is clickable. The menu (Pin / Rename / Add to project / Share chat / Delete) is presentational. Alongside it, top-right, is a **"Share" button** using a new **28px small button variant** (`h-7`, bordered) that sits below the 32px icon-button norm. While this chat top bar is shown it **replaces the empty-state incognito button** (they share the top-right corner); incognito returns on the fresh greeting state. Destructive actions use a new **`--color-danger`** token (primitive `--red-500` #C0392B).

**Rationale:** Chevron-only trigger matches the reference and keeps the title readable as a label, not a button. The 28px variant is a deliberate second size for lighter chrome (title bar) vs. the 32px norm. Swapping incognito for the title bar avoids a top-right collision and matches the documented empty→chat transition (incognito disappears once a chat begins).

### 2026-09-29 In-chat prompt box — a distinct thinner variant, built from screenshots

**Decision:** The in-chat prompt box (`src/shell/InChatComposer.tsx`) is a **genuinely different design**, not a resized `Composer`: a **single-row** box (same `rounded-lg` radius as the new-chat box) — **＋** add-menu · single-line textarea (**"Write a message…"**) · a **↵ return send** (lucide `CornerDownLeft`) that is **dimmed while empty and dark ink once there's text** (explicitly *not* the clay send circle; per Somnath the active state is ink, not accent). Its menus open **upward** (`openUp`) and reuse `AddMenu` / `ModelMenu` (no markup duplicated). Below the box, a **meta row** — disclaimer left + `ModelMenu` right (clicking it opens the picker, same as the new-chat box) — both **14px**, **10px** below the box. The **model label reads just the model name** (e.g. "Sonnet 5"), no effort suffix. Because the two boxes share all their guts but differ in layout, the intended structure is a shared `useComposer()` hook + two thin layout components (built next); for now `InChatComposer` holds its own local state and is presentational (no send wiring).

**Focus/typing border, both boxes:** the border firms to a new **`--color-prompt-border-focus`** token (**#C2C1BC**, primitive `--paper-350`) on focus, via `focus-within` + a fast eased transition. One token drives both prompt boxes.

**Rationale:** The screenshots show a materially different (thinner, single-row) box, so treating it as its own component beats a `variant` prop branching one file. Ink (not clay) for the active send matches the reference. A dedicated focus token keeps the darkening tunable in one place without hardcoding a hex in components.

### 2026-09-29 Empty→chat transition is an instant swap, not an animated glide

**Decision:** On first send the UI **instantly swaps** from the empty/greeting state to the chat state — the new-chat box disappears, the **in-chat box appears bottom-anchored** (in its safe-area inset), the typed text lands as a **right-aligned user bubble**, and the **thinking/loading state** begins. There is **no** center→bottom travel animation for the composer (this **supersedes** the earlier "composer animates from center to the bottom" note). The **thinking → response** transition is **snappy** (thinking dots + contextual phrases → response appears crisply); **no opacity fade** on the response. Response content renders into **slots** (chat-width and full-screen "App Contents" per the safe-area guideline); slots show as **light-red placeholders** for now and later host mcp-apps widgets/carousels. The message schema carries slots from the start so mcp-apps plug in without a refactor.

**Rationale:** Somnath specified an instant swap and a snappy response reveal — fades on AI responses read as sluggish. Designing the slot/message schema now (even rendered as placeholders) means the future mcp-apps branch drops in without reworking the transcript.

### 2026-09-29 Icons: real Claude set as an inline React library, lucide as fallback (SUPERSEDED — reverted to lucide, see below)

**Decision:** Icons come from the **Claude desktop icon set** (community Figma export, 166 glyphs). Source SVGs live in `src/icons/svg/`; `scripts/gen-icons.mjs` generates one typed inline React component per icon into `src/icons/*.tsx` (+ barrel `index.ts`), rewriting the hardcoded `#141413` ink to **`currentColor`** so glyphs inherit `text-*`/hover and size via `className`. These are **solid-filled** glyphs — the authentic claude.ai look, replacing lucide's outlines app-wide. **lucide-react stays** as the fallback for glyphs with no faithful match in the set: the **chevrons** (`ChevronDown`/`ChevronRight` — the folder's triangular "Caret" was explicitly declined), the `Loader2` spinner, and `CornerDownLeft, Shapes, Palette, Pin, Plug, Scroll, History, HardDrive, Mail, SlidersVertical`. Briefcase maps to **Tool**. Regenerate with `node scripts/gen-icons.mjs` after changing the SVGs; don't hand-edit generated files.

**Rationale:** The real set is what makes the shell pixel-faithful and is needed for the mcp-apps work. Inline components (vs `<img>`) are the only way to inherit color for hover/muted states; a generator keeps 166 components consistent and reproducible. Keeping lucide for the dozen gaps avoids shipping wrong-metaphor glyphs; the caret/chevron call was Somnath's.

### 2026-09-29 Icons: reverted to Lucide (supersedes the community-set decision)

**Decision:** Back to **lucide-react** app-wide (the 2026-09-24 "Icon pack: Lucide" decision stands). The community "Claude desktop" icon set (166 solid-filled glyphs) was tried and **declined** — Somnath didn't like the folder glyphs. Custom hand-made SVGs in `src/shell/icons/` (the clay spark, `IncognitoIcon`) remain the only exceptions, as before. The generator experiment (`scripts/gen-icons.mjs` + `src/icons/`) is parked untracked on disk, not committed; remove it if it's not wanted.

**Rationale:** The solid-filled folder glyphs read wrong against the rest of the shell; lucide's thin outlines are the closer, already-agreed aesthetic and don't need a generator. **Supersedes** "Icons: real Claude set as an inline React library, lucide as fallback."

### 2026-09-29 In-chat send button: the same arrow button as the new-chat box (supersedes the ↵ treatment)

**Decision:** The in-chat prompt box (`InChatComposer`) uses the **same arrow send button** as the new-chat `Composer` — `ArrowUp`, **grey (`bg-pressed`) while empty → clay (`bg-accent`) once there's text**, identical disabled→active interaction. This replaces the earlier **↵ return-key glyph** (`CornerDownLeft`, dimmed→dark-ink) called out in the "In-chat prompt box — a distinct thinner variant" decision.

**Rationale:** Per Somnath — one consistent send affordance across both prompt boxes reads cleaner than two different treatments. **Supersedes** the send-button half of the 2026-09-29 "In-chat prompt box — a distinct thinner variant" decision (the rest of that decision — single-row layout, upward menus, meta row — still holds).

### 2026-09-29 Collapsible sidenav — icon-only rail

**Decision:** The sidebar collapse toggle collapses the sidenav to a **64px icon-only rail** (animated `width` 288px ↔ 64px, base duration/ease). Collapsed shows **icons only**: the wordmark, Chat/Code toggle, search, recents caption + list, and the footer download button hide; nav items and the account button become centered icon buttons that surface their label via a **right-side tooltip** (account opens the same upward popover). It's **pure presentational chrome** — no store/data change; `App` owns `navCollapsed`, and `NavItem` / `AccountMenu` take a `collapsed` prop. The width-grow `overflow-hidden` is scoped to an inner wrapper around only the top flow section and active only when expanded, with the account footer left **outside** it — so collapsed-rail tooltips and the account popover are never clipped at the rail edge.

**Rationale:** Matches claude.ai's collapse behavior (icons only, tooltips for labels) and reclaims horizontal space for the main stage. Scoping the clip to an expanded-only inner wrapper resolves the conflict between the width animation (which wants `overflow-hidden`) and the collapsed overlays (which must escape the 64px rail).

### 2026-09-30 Thinking state: the Claude spark pulses (snapping, not smooth)

**Decision:** The loading/thinking state (`ThinkingIndicator`) is the **Claude clay spark itself pulsing** — no separate dots. It **snaps** between full size and shrunk (`scale(1) ↔ scale(0.72)`) on a ~1.1s loop, with the scripted phrase beside it. The animation lives in one token, `--animate-thinking-pulse` (keyframes + `step-end` timing), in `tokens.css`. **Supersedes** the earlier three-pulsing-dots thinking indicator.

**Rationale:** Matches the real product, where the mark itself is the loader. `step-end` (a hard snap between the two sizes) reads as a deliberate beat — Somnath explicitly wanted it *not* smooth-eased. One motion token keeps depth/speed tunable in a single place.

### 2026-09-30 Prompt input is a contenteditable editor, not a textarea

**Decision:** Both prompt boxes share one input — a **`contenteditable`** surface (`src/shell/PromptEditor.tsx`, wired by `useComposer`), replacing the previous `<textarea>`. Sent text serializes chunk elements as `/id` inline with the free text; the empty-state placeholder is a CSS `:empty::before`; the field grows with content natively (the textarea auto-grow `useLayoutEffect` is gone).

**Rationale:** Slash-skill **chunks** are styled inline pills that must delete atomically — impossible in a flat `<textarea>`. Contenteditable is what the real Claude uses. Keeping it in one shared component means the new-chat and in-chat boxes can't drift. **Supersedes** the `<textarea>` + `textareaRef` auto-grow half of the earlier composer decisions (layout/menu decisions still hold).

### 2026-09-30 Slash skills — atomic chunks from a caret-tracked menu

**Decision:** Typing `/` at the start or after a space opens the **`SkillMenu`** above the box; the query after `/` filters it, ↑/↓ + Enter or a click inserts the skill as an **atomic chunk** (leading `/`, lowercase, hyphenated, monospace), and backspace deletes the whole chunk. Typing a full available skill name + **space** auto-converts it too. The catalog (`src/shell/skills.ts`, ids in `copy.ts`) has two kinds: **default** (always available, **grey** chunk) and **salesforce** (only when the Commerce connector is on, **light-blue** chunk, `ask`+`report` first). Menu order: default section → separator → Salesforce section. The menu opens `bottom-full`, its left **tracks the slash caret** (clamped to the box), and its height is **capped with internal scroll** so a long list never runs off the viewport.

**Rationale:** Mirrors claude.ai — skills are shorthand for long prompts, and connectors bring their own. Chunks (vs plain text) make a skill a first-class, unambiguous token; the type-then-space convert matches how people actually type a command before their prompt. Gating Salesforce skills on the connector keeps the default list minimal and makes the connector's value legible. The colour split (grey vs blue) signals default vs connector-provided at a glance.

---

### 2026-10-12 Pills never wrap; full screen covers the right panel

**Decision:** Pills and chips (status, delta, meta chips, source chips, action chips) are always one line (`whitespace-nowrap`); the column or row makes room, never the pill. In Cowork, a full-screen table or dashboard covers the whole main area, the right panel included; closing it brings the chat and panel back.

**Rationale:** Somnath's feedback (2026-10-12): a two-line "Needs you" or "Awaiting reply" pill reads as broken. Full screen is for reading one widget; the panel can wait until it's closed.

---

### 2026-10-16 Browser chat: prompts are dictated, with no pauses

**Decision:** In the browser chat, every prompt the presenter used to type is dictated: the mic beside send (greeting box, in-chat box and the full-screen prompt bar) plays the journey's next line, from a `dictations` list in each experience, a word or a few at a time with no hesitations or breaths, and the recording ends by itself; Enter sends. The mic offers the line after the last one sent. A dictated `/skill` shows as its chunk. Prompts that are only a slash skill (`/approve-quote`, `/export-report`) are still typed, and typing still works everywhere. The browser has its own dictation hook (`src/chat/useChatDictation.ts`); desktop Cowork keeps `shell/useDictation.ts` and its pacing unchanged, and the shared composers only take the browser path when given `chatDictation`.

**Rationale:** A senior director mistyped prompts in a demo; typing invites that, dictation removes it. The browser prompts are short, so pauses only slow them down. Browser and desktop evolve independently: one's changes must not affect the other (Somnath, 2026-10-16).

---

### 2026-10-16 Browser chat: the latest reply ends with chips, then the logo

**Decision:** In the browser chat, only the reply that ends the chat (the last message, nothing generating) closes with three follow-up chips (stacked, ↳ icon) and then the Claude logo on its own line. Both go as soon as anything follows: a send, a chip, a card button. Every finished reply keeps its copy / like / retry row. Of the three chips one is live and plays a beat (a prompt, an in-app action, or opening the card full screen); the bubble shows the chip's short label while the reply comes from the full prompt behind it, and the mic counts that step as done. The other two are inert. A reply that asks a question in its card (entitled products, flavor, fresh or existing cart, address, which order, which store, the export picker) has no chips, just the logo. Nothing ends in full screen. Where a step can also be dictated, the chip is generic and never the dictated line. When a chip does a card button's job (Place order, Create all 3), the card shows itself done. Quote step 4 is now dictated in plain English ("Which free samples is Morton entitled to?", Claude runs `/entitlement-check` itself) and `/add-note` is typed. Browser only: desktop Cowork's follow-ups are untouched.

**Rationale:** Somnath's direction (2026-10-16): the chat should read as a chat, with only its end marked, and a live chip gives the presenter a no-typing path through each step without echoing the dictation.

---

### 2026-10-16 Browser chat: every Salesforce write is shown, and prompted writes ask first

**Decision:** In the browser chat, every write to Salesforce plays as a "Writing to Salesforce" timeline atop the reply (browser-only `src/chat/WriteTimeline.tsx`, modeled on desktop Cowork's): the Salesforce logo, a plain-language action, "Called `dispatch_write` <SOR>", the records landing one at a time (INSERT / UPDATE / DELETE, the object, the record, the fields), then a result chip. The header becomes "Wrote N records to Salesforce". After the records, a 2-second pause with the pulsing spark, then the rest of the reply. Reads stay `dispatch_readonly` / `get_sor_detail` in the tool timeline; `dispatch` is gone from the browser scripts. A write asked for in a prompt asks first with a permission card ("Claude wants to write to Salesforce", what changes, Deny Esc / Allow ↵): the free sample, `/add-note`, `/approve-quote`, `/reorder`. A pick in a card (fresh or existing cart, address) or a button that names the write (Proceed to checkout, Place order, Create all 3, Make live) is already the OK, so it writes without one. Promotions write only once confirmed: the draft and its audience edit write nothing; Create all 3 inserts them with their audiences (the Grinder's Loyal Customers only). Make live now plays a reply: the update, then the promotions card again with that row Live. This supersedes the quote journey's "low risk, so no confirm step" for the free sample, and Make live's silent in-card switch.

**Rationale:** Somnath's direction (2026-10-16), after desktop Cowork's write timelines: show where the browser reads and writes Salesforce. Allow / Deny only where it means something, a real write, not a selection. Browser and desktop stay separate.

---

### 2026-10-16 Browser chat: quote approval writes without asking (supersedes the quote part of "every Salesforce write is shown, and prompted writes ask first")

**Decision:** In the quote journey, the free sample, `/add-note` and `/approve-quote` write straight away, as before 16.3.0, keeping only the "Writing to Salesforce" timeline: step 4 rechecks the margin ("Adding it now"), then adds the line in the same turn; the note and the approval write and show their cards. No permission cards in this journey. The note reads "Added a free sample as per your request." Step 2's reply no longer has a live chip (step 3 is dictated), just three inert ones; the entitlement chip is "Check entitlement for free sample".

Same for checkout's `/reorder`: it reads the order and writes the reorder cart in one turn. No permission cards remain in the browser journeys (the `PermissionCard` component and `permit` stay, unused).

**Rationale:** Somnath (2026-10-16): the user shouldn't be asked to allow Claude every time; saying "add note" or "approve the quote" is already the instruction. The Allow steps were a deviation from the original flow.

---

### 2026-10-16 Browser chat: checkout tiles fill the column, orders show who placed them

**Decision:** The inline carousel's product tiles grow to fill the chat column, keeping their 220×355 shape (image 220×188), so they scale up in width and height; when more tiles than fit, they stay 220 wide and scroll. An order placed in the chat shows **Ordered by** in its detail: the rep's avatar, name and email, with an "On behalf of Morton Breitenberg" pill (past orders, placed by Morton, don't). The orders list's live chip "Reorder QJRTA" is now inert ("Show cancelled orders"); the Reorder button does that step. After the reorder, the mic offers "Show me Morton's successful orders this week" again (a line listed twice in `dictations` is offered twice).

**Rationale:** Somnath's run-through (2026-10-16): narrow tiles left the column half-empty; on-behalf orders should say who placed them; the reorder is a button, not a chip.

---

### 2026-10-16 Browser chat: each journey's chat persists until refresh (supersedes "starts it from scratch" in 2026-10-01 Three fixed journey chats)

**Decision:** In the browser chat, switching journeys in the sidenav keeps each one's chat exactly as it was left: same messages, cards as clicked, permission cards as decided, timelines without replay, scroll where it was. A journey not yet run shows the greeting. A reply still generating when you switch away finishes into its own chat. **New** restarts only the armed journey; a page refresh restarts all three (memory only, nothing saved). Implementation: the store keeps a chat per journey (`chats`), and every started journey's `ChatStage` stays mounted, hidden (`invisible`) while another is shown; only the shown one has a prompt box. Switching closes the full-screen app and file preview. Desktop Cowork is untouched.

**Rationale:** The director of PM ran order-on-behalf, then checkout anywhere, and found the first chat gone. At the end of a demo he wants to go back and scroll through the steps taken to explain them (Somnath, 2026-10-16). The flow is over, so it stays as is.

---

### 2026-10-16 Merchant insights: 2 or 3 chips, Slack sends, make all live, one at-risk chart (supersedes "three follow-up chips" for insights in 2026-10-16 The latest reply ends with chips, then the logo)

**Decision:** Insights replies end with **two or three** chips, the count written per reply (not random at runtime, so every run plays the same); quote and checkout keep three. The "Remember…" chips are gone: they only repeated the dictated line, so those steps are dictated and their replies keep only generic inert chips. The segments reply leads to the at-risk step with **Accounts at risk** (live, plays it) and **New accounts at risk** (inert). The **At-risk accounts** card draws one chart for every row, a spend sparkline over Q1 to Q3, with each account's own signal as the caption. The **Alpine follow-ups** card's **Send to Slack** is a real in-app button (no user bubble), as is the reply's **Share it on Slack** chip: thinking shows Claude connecting to Slack and finding **#alpine-merchandising**, then a browser-only **Using Slack → Used Slack** step (Slack logo, "Post Alpine follow-ups to #alpine-merchandising", result `4 items · 2 teammates tagged`, the look of desktop's integrations timeline, kept separate from it), then the reply says where it went and who was tagged; the card shows **✓ Sent to #alpine-merchandising** and posts once. Promotions can go live all at once: dictated "Make all three promotions live.", a **Make all 3 live** button at the end of the created card (**Make the other 2 live** / **Make the last one live** once some are on), or the chip of that name; one write UPDATEs every inactive row. Each row's **Make live** stays.

**Rationale:** Somnath's run-through (2026-10-16): chips that are the dictation line add nothing; a fixed three per reply reads as templated; the follow-ups should actually reach Slack the way desktop's brief does; the at-risk rows read better side by side with one chart; going live one by one is slow when the presenter wants all three.

---

### 2026-10-16 Merchant insights: every at-risk profile gets the report, Things to do is a card, the PDF is static (supersedes the text-only TSV and Bluewater answers and the markdown "Things to do" list)

- **Decision:** View profile on any at-risk account (Omega, TSV, Bluewater) opens the same account report with that account's numbers. The recap's Things to do is a card of numbered tasks, each a pill and at most two key-value pairs (Found, Do), not a table. The PDF preview is static, with no hover, and laid out like a printed report: contents on the cover, a running header, numbered sections, the takeaway as a lead line, key points, and a page footer.
- **Why:** Somnath: a click on anything other than Omega should still show a report; Things to do should be more structured, but "key value pairs max"; a PDF doesn't hover, and the report should read with clearer structure.

### 2026-10-16 Things to do is Claude's card, not Salesforce's (supersedes the Salesforce-framed card in "every at-risk profile gets the report, Things to do is a card")

- **Decision:** The recap's Things to do renders as Claude's own card (the file card's look: icon tile, title, meta), with no Salesforce Commerce header or footer. Its rows stay numbered tasks with a pill and Found / Do pairs.
- **Why:** Somnath: pulling up everything to do is a Claude feature, not a Salesforce one, so it can be a card, but not from Salesforce Commerce.

## Undecided (to resolve in planning)

- Interaction inventory + milestone ordering (rough order agreed; per-piece detail TBD).
- Dark theme (deferred).

*(Resolved: layout paradigm → two-pane; fidelity target → `claude.ai/new` web. See decisions above.)*
