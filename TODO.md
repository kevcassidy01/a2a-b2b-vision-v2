# TODO

Running to-do list across sessions. Keep it current.

## How this list works

Items are sorted into three priority buckets:

1. **🔴 Urgent & Important** — do these first. Not necessarily finished in one go, but these are the ones to raise and discuss often.
2. **🟡 Important** — matters, but not on fire. Schedule it.
3. **🟢 Do at some point** — backlog / someday.

**Rule:** when Somnath asks to add items, Claude proposes which bucket each belongs in and confirms placement before adding.

Legend: `[ ]` open · `[~]` in progress · `[x]` done · **(S)** needs Somnath · **(C)** Claude can do

---

## 🔴 Urgent & Important

- [~] **(S/C, on instruction)** **Agent-to-agent B2B commerce prototype (Fizz Drinks).** Intent doc drafted 2026-10-23 (`A2A_INTENT.md`); wireframes in Figma. **Built through v24.3.0 (2026-10-25, `/#a2a`): all 15 story steps, success cards, the Gmail notification at the end (with sound), and the presenter keys (` pause/play, Shift+` restart). On `master` and pushed.** The shell and "who's acting" bar; John's phone (login, Mike's cart, Assign, the agent's reasoning and plan, Q-1042 v1, then v2 landing and the hold-out for 15%); the Command Center (welcome, dashboard, "Needs your approval", the seller agent's chat: Salesforce tool calls, checks, v2 sent); the turns timeline in both chats. **Story complete.** Next: Somnath records a video for teammates, then the demo script / run sheet.
  - [x] **(C)** A2A step 9, seller side: Fizz's agent receives the hold-out (v2's units at 15%), weighs it with Salesforce tool calls, finds 15% over its limit; Q-1042 shows it needs Alex; the timeline gets turn 3.
  - [x] **(C)** A2A step 10: Alex's decision card (Send both: Net15 or the bundle · Net15 only · Decline), the bundle shown.
  - [x] **(C)** A2A step 11: Alex sends both; v3a (15% · Net15) and v3b (the Ginger Ale bundle) go out.
  - [x] **(C)** A2A step 12: John's agent weighs v3a vs v3b (the bundle's three reasons), recommends v3a, says why not the others, asks John.
  - [x] **(C)** A2A step 13: John approves; Q-1042 approved on both sides.
  - [x] **(C)** A2A polish (v23.1.0): CRED-style pulse replaces typing dots; Geist Mono thinking sub-states; Decline on Alex's decision card; John picks v3a/v3b; agents always send a line with their cards.
  - [x] **(C)** A2A: the Today section on the Command Center: a framed row of cards from load, with the agent's task card joining it (2026-10-25).
  - [x] **(C)** A2A step 14: order O-5531 placed; the Command Center gets it, the dashboard updates (approval clears, Orders +1, Germany grows).
- [~] **(S/C, on instruction)** **Cowork desktop vision for PAC (Wednesday 2026-10-14).** A simulated Mac desktop with the Cowork window, in React on branch `cowork-desktop`. Aaron presents it. **Story settled** (`docs/old-intent/COWORK_INTENT.md` §4.5–4.7). **Built through v12.0.0 (2026-10-12):** the Mac desktop and menu bar, the Cowork window and sidenav (four sessions, Agents and Scheduled pages), the start state with dictation, Settings, the Slack banner (Ctrl+S), and the Delivery Watch chat. Flow charts in `docs/cowork-demo-flows.md`. **Growth Scout's win-back chat built in v13.0.0 (2026-10-12); report and 10% projection dashboards in v13.1.0.** **Morning Brief built in v14.0.0 (2026-10-12, decision 54)**: from the Scheduled page, read on Thu 15 Oct; Growth Scout has no day-7 jump. **Reworked per decision 55 (v15.0.0):** commerce-first brief, prompt template + answers table, focus list to Slack/Asana, three dictated instructions instead of Prep me. **Canary Wharf Workspaces (was Prestige) built (decisions 56–58, v16.0.0 + uncommitted):** files dragged in, Gong listening, a Gmail search for Tom's email and its attachments, a pinned plan (8 tasks on its own, incl. a Slack reminder, then 4 decisions one at a time, dictated and clicked, the price a one-click choice), receipt, then Priya's acceptance arrives on its own. **Run of show:** Canary Wharf (from New, with files), then the 2 agents (their "New session" rows), then the brief (from Scheduled); Canary Wharf and the brief add a row on top when they start (decision 57). **Growth Scout recommends products (decision 59, uncommitted):** a pick in every quote email, and Add and send / Send without it cards for the big quotes; the projection counts add-ons (~$1.07M). **The brief shows its Salesforce writes, and the one ask the agents held overnight as a one-click choice (decision 60, uncommitted).** Details in `docs/old-intent/COWORK_INTENT.md` §8.

- [~] **(C, on instruction)** **Quote management / approval experience** (first of the three, INTENT §2). **Built 2026-10-01:** scripted 6-beat flow (`script.ts`), real slot widgets (`SlotContent.tsx`), in-app actions (`store.runAction`), Salesforce logo headers, SLDS accent theming, 4 skills, connector defaults on. Flow/runbook: `docs/quote-management-flow.md`. **Remaining:** demo dress rehearsal with Somnath (verify prompts map to beats live); optional polish (buyer-note polish, catalog full-screen density).
- [~] **(C, on instruction)** **Checkout anywhere / order-on-behalf experience** (experience #3; branch `checkout-anywhere`). Rep places + reorders on behalf of buyer Morton Breitenberg on the Alpine B2B store (was B2B LWR Codecept; renamed 2026-10-16); cart/order attributed to the buyer. **Built 2026-10-01:** 11-beat scripted flow (`src/chat/experiences/checkout.ts`); per-journey registry under `src/chat/experiences/` (quote/checkout/insights) with `activeExperience` + `selectExperience` in the store; 3 fixed sidenav journey chats (new-chat FTUX chucked); exhaustive slash menu (11 SF skills across all flows); new pick-one `select` menu + `context`/`cart`/`order-confirm`/`order-detail` views; tool-call timeline wired throughout. **Playtest round 1 done 2026-10-05:** `/entitlement-check` step, flavor product tiles, successful-orders list + prefilled `/reorder <number>`, thinking-copy audit, tool-timeline collapse fix. Runbook: `docs/checkout-anywhere-flow.md` (2026-10-05). **Committed as v10.0.0 (2026-10-05).** **Remaining:** re-run the flow live with Somnath. Real flavor photos are in the tiles (done).
- [~] **(C, on instruction)** **Merchant insights experience** (experience #2; branch `merchant-insights`, cut 2026-10-05). **Built 2026-10-05:** all 17 beats per `docs/merchant-insights-plan.md`, new insight sections with hover annotations, full-screen in-place answers, file card + PDF side preview, promotions draft → edit → create → Make live. Runbook: `docs/merchant-insights-flow.md`. Committed v11.0.0 (type scale retrofitted into quote + checkout); hover dimming on all bar charts v11.2.0. **Remaining:** live run with Somnath (2026-10-16: improvements v16.4.1 adds Slack send, make all live, account reports, Things to do card, static PDF; Somnath testing all 3 journeys).
- [x] **(C, on instruction)** **Tool-call timeline widget** (shared). **Built 2026-10-01** (`src/chat/ToolTimeline.tsx`): vertical timeline above a response, skill-chunk styling + wrench glyph + connecting hairline; latest response expanded, earlier ones collapse behind a "Headless 360 MCP tools" chevron row; 1-3 realistic `project-codey` tools (discover / get_sor_detail / dispatch_readonly / dispatch) over commerce SORs. Used throughout checkout anywhere. **Retrofitted into quote management 2026-10-05** (v10.1.0, pushed 2026-10-05). Done.
- [~] **(C, on instruction)** **Build `mcp-apps` components** (branch `mcp-apps-slots`). The real driver — Salesforce experiences within Claude. **Done:** inline **card** (`InlineCard.tsx`), inline **carousel** (`InlineCarousel.tsx`, frameless, scroll-aware arrows, placeholder tiles), **floating** response (`Floating.tsx`), and **full-screen** (`FullScreenApp.tsx` — expanded view of an `expandable` card/floating block; scrolls behind a pinned prompt bar; transcript mounted underneath; prompts route back to the chat). Shared `CardHeader`/`CardShell`, host-owns-the-frame theming, `mode`-dispatched `Slot`, in-code mode-purpose docs. **Real widgets now render** for the quote experience via `SlotContent.tsx` (`view` payload on a slot); the dashed placeholder remains the fallback. Carousel body still a placeholder (no view yet).

## 🟡 Important

- [x] **(C)** A2A step 15: the agent offers "Oktoberfest stock-up" as a template (Oktoberfest is yearly; dates from oktoberfest.de in its thinking), John saves it (2026-10-25).
- [x] **(C)** A2A: pause/play (`) and restart (Shift+`) keys (2026-10-25, merged to `master`). Jump-to-step: not needed (Somnath, 2026-10-25).
- [x] **(S)** A2A: the storefront's Bundles row: not needed (Somnath, 2026-10-25).
- [~] **(C, on instruction)** **Lead-designer feedback** (branch `design-feedback`). **Done 2026-10-08:** quote approval recommends the free sample and checks margin at both steps, the confirm card is dropped, and the copy is renamed to "free sample". Also done: the `/entitlement-check Free sample` prompt, the why-recommended popover, the green Approved stage, and distinct margin copy at the two steps (v11.3.0). Checkout anywhere steps 1–7 reworked and flavor photos added (v11.4.0). Merchant insights segments: "How are buyers doing" prompt, See trends on every row (v11.5.0, merged to master). **Next:** card bookmark for "remember this" (proposed, deferred); checkout reorder-section feedback later. **Remaining:** more feedback as Somnath shares it; Figma re-capture dropped (Somnath, 2026-10-08: the eng team has the gist).
- [~] **(C, on instruction)** **Component reference images for engineering.** **Done 2026-10-07:** all three journeys in Figma ([Ref Images](https://www.figma.com/design/NtIhT8YZXbP1JRBVlDiTAx/Claudeforce-Commerce---Ref-Images): quote `0:1`, checkout `1:2`, insights `1:3`), flat images, no captions (Somnath annotates). **Remaining (last priority, on instruction):** a PNG folder in the repo (maybe a gallery page).
- [ ] **(C, on instruction)** **Buyer segments card is cramped at chat width:** segment names truncate ("OEM Part…") and the New Buyers note wraps into a tall narrow column (`viz/InsightView.tsx` ranked table, ~788px card). Found while capturing reference images 2026-10-07.
- [ ] **(S/C)** Define the full interaction inventory and order it into milestones. *Rough order agreed: shell frame → sidenav (toolbar → search → nav → recents → account) → main empty state (greeting → composer → control row) → ghost/polish.*
- [x] **(C)** Visual identity / palette **retuned to neutral near-white** — exact values measured from claude.ai, encoded in `src/styles/tokens.css` (`paper-*`/`ink-*`, `--color-sidenav`). — 2026-09-25
- [x] UI sans chosen (provisional): **Hanken Grotesk**. Geist/Inter uninstalled, dev FontSwitcher removed. — 2026-09-24
- [x] Serif chosen: **Anthropic Serif** primary (bundled/local) → **EB Garamond** open fallback. — 2026-09-24
- [x] **(C)** Install `lucide-react`. — 2026-09-24 (v1.47.0)
- [ ] **(C, on instruction)** Hand-make the clay sunburst/spark + ghost as custom SVGs in `src/shell/icons/`.

## 🟢 Do at some point

- [x] **(S)** A2A: roomier knowledge-card spacing on the other drawer cards (yes 2026-10-25; done: option and offer tiles, the quote table boxed).
- [x] **(S)** A2A: Figma updates to match what's built: not needed (Somnath, 2026-10-25).
- [ ] **(S/C)** A2A: demo script and run sheet in `docs/demo-scripts/`, after Somnath sends teammates a video (incl. the ` and Shift+` keys, where the sounds play).
- [x] **(S)** Fill in the "My standing instructions" slot in `CLAUDE.md` with durable rules (5 hard rules + change-log versioning). — 2026-10-01
- [x] **(S/C)** First commit + push to origin done; `mcp-apps-slots` branched and merged to `master`. — 2026-10-01
- [ ] **(C, optional polish)** Entrance animation for the full-screen overlay (currently appears instantly); use the motion tokens.

## ✅ Done

- [x] **(C)** Slash `/` skills in the prompt box — `contenteditable` editor (`PromptEditor`), `SkillMenu` (caret-tracked, capped/scroll), atomic grey/blue chunks, type-then-space auto-convert, default + connector-gated Salesforce catalog (`skills.ts`). — 2026-09-30
- [x] **(C)** Scaffold the project — Vite/React/TS/Tailwind v4 + **Zustand** (`useChat`) + **motion** now all in. — 2026-09-30
- [x] **(C)** Build the in-chat prompt box + full chat flow — `InChatComposer` (bottom-anchored, `openUp` menus, arrow send), `useChat` Zustand store, message/slot schema (light-red placeholders), forker-replaceable response `script.ts`, shared `useComposer()` hook, `ChatStage` (instant empty→chat swap + snappy thinking→response). — 2026-09-29
- [x] **(C)** Collapsible sidenav — animated 288px↔64px icon-only rail with tooltips. — 2026-09-29
- [x] **(C)** Build the sidenav shell (toggle · wordmark · Chat/Code toggle · search · nav group · recents · account footer). — 2026-09-25
- [x] **(C)** Build the main-stage empty state — greeting + **composer** (textarea + footer) + suggestion chips. — 2026-09-25
- [x] **(C)** Wire the composer menus — ModelMenu, AddMenu (Salesforce Commerce connector chip), AccountMenu; send button (Enter to send). — 2026-09-25
- [x] **(C)** New-chat interaction (FTUX, commit-on-send, loader, `NEW_CHAT` flag); active-row selected state. — 2026-09-25
- [x] **(C)** Chat title menu (chevron-only trigger) + Share button (28px small variant). — 2026-09-25
- [x] **(C)** Project README + preview images for GitHub. — 2026-09-25
- [x] Initialize repo + harness files (`CLAUDE.md`, `SESSION_CONTEXT.md`, `DESIGN_DECISIONS.md`, `CHANGE_LOG.md`). — 2026-09-24
- [x] Establish standing hard rules and change-log versioning scheme. — 2026-09-24
- [x] Add cross-session `TODO.md`. — 2026-09-24
- [x] Decide layout paradigm — **two-pane shell** (per claude.ai/new web target). — 2026-09-24
- [x] Anchor fidelity — reference captured: **claude.ai/new (web)** is the target. — 2026-09-24
- [x] Decide fidelity target — pixel-faithful to the **web** new-chat screen. — 2026-09-24
