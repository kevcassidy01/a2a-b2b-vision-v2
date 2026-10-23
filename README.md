# Claudeforce Commerce

Two scripted, clickable demos of Claude working with Salesforce B2B Commerce, in one repo:

- **Browser chat** (`/`): Claude in the browser (claude.ai), with Salesforce MCP apps inline in the chat. Three journeys for **Alpine**, a B2B merchant.
- **Cowork desktop** (`/#desktop`): a Mac desktop with the Claude Cowork app, where Claude works across Salesforce, Gmail, Slack, Gong and Calendar. Four flows for **Ohana Networks**.

Everything plays from authored scripts, so a demo never depends on the network, a live org or a model's mood. Anyone can run either demo, and each has its own presenter guide.

| | |
|---|---|
| **Status** | Demo-ready prototypes. Scripted, not wired to a live org or the Claude API |
| **Version** | See the top of [CHANGE_LOG.md](./CHANGE_LOG.md) |
| **Default branch** | `master` (feature branches are kept on origin and never deleted) |
| **Repo** | https://git.soma.salesforce.com/somnath-mallela/claudeforce-commerce |
| **Stack** | React 19, TypeScript, Vite 8, Tailwind CSS v4, zustand, lucide-react |

---

## Run it

You need Node.js **20.19+ or 22.12+** (`node -v`).

```bash
git clone https://git.soma.salesforce.com/somnath-mallela/claudeforce-commerce.git
cd claudeforce-commerce
npm install
npm run dev
```

| Open | What you get |
|---|---|
| **http://localhost:5173/** | The browser chat |
| **http://localhost:5173/#desktop** | The Cowork desktop |

The **Browser | Desktop** toggle at the bottom right switches between the two. If port 5173 is busy, Vite picks the next free port and prints it in the terminal. Hard-reload (⌘⇧R) to start every flow fresh.

With Claude Code, just ask: *"Run the dev server and open the browser chat"* (or *"the desktop demo"*). [CLAUDE.md](./CLAUDE.md) tells it how.

Other scripts:

- `npm run build` type-checks (`tsc -b`) and builds for production.
- `npm run preview` serves the production build.

---

## Presenter guides

| Demo | Act-by-act guide (start here) | Step-by-step detail |
|---|---|---|
| Browser chat | [docs/browser-chat-demo-guide.md](./docs/browser-chat-demo-guide.md) | [docs/demo-scripts/](./docs/demo-scripts/) (one per journey) |
| Cowork desktop | [docs/cowork-demo-run-sheet.md](./docs/cowork-demo-run-sheet.md) | [docs/cowork-demo-flows.md](./docs/cowork-demo-flows.md) (flow charts) |

The two demos are independent: a change to one doesn't change the other.

---

## Demo 1: Browser chat (`/`)

A faithful clone of `claude.ai/new`, with Salesforce MCP apps inline in the chat (cards, carousels, floating charts and full-screen views). You are Aaron at Alpine (aaron@alpine.com). Alpine sells coffee equipment and energy drinks through its **Alpine B2B** store. Three journeys, each a fixed chat in the sidenav:

| # | Journey | What it shows | Runbook | Demo script |
|---|---|---|---|---|
| 1 | **Quote approval** | Morton's pending quotes, an entitlement check, a free sample Claude recommends within margin, a note and approval | [quote-management-flow.md](./docs/quote-management-flow.md) | [quote-management.md](./docs/demo-scripts/quote-management.md) |
| 2 | **Checkout anywhere** | Ordering on behalf of Morton: entitlements, flavor tiles, a fresh cart, address and PO, a placed order, then `/reorder` | [checkout-anywhere-flow.md](./docs/checkout-anywhere-flow.md) | [checkout-anywhere.md](./docs/demo-scripts/checkout-anywhere.md) |
| 3 | **Merchant insights** | Store health as a dashboard, four problems Claude remembers, a Things to do card sent to Slack, promotions made live, and a PDF report | [merchant-insights-flow.md](./docs/merchant-insights-flow.md) | [merchant-insights.md](./docs/demo-scripts/merchant-insights.md) |

- Prompts are **dictated**: click the mic and the next line comes in by itself. Typing your own words works too. Slash-only prompts (`/approve-quote`, `/export-report`) are typed.
- Every **Salesforce write** plays as a timeline of records before Claude replies.
- The latest reply ends with **follow-up chips**, and one of them plays the next step.
- Each journey's chat **persists** when you switch journeys. **New** restarts the journey you're on; a refresh restarts all three.
- Prompts match on keywords, so small rewording is safe, and off-script prompts get a fallback reply.

---

## Demo 2: Cowork desktop (`/#desktop`)

A Mac desktop with a menu bar, desktop files, Slack banners and Salesforce notices. The Claude Cowork window has a sidebar with **New**, **Agents**, **Scheduled** and **Artifacts**, a right panel showing progress, skills, connectors and files, and a mic that dictates each line. You are Aaron, a sales rep at Ohana Networks (networking hardware). Claude does the legwork and brings only the decisions to you.

The four flows, in demo order:

| # | Flow | Kind | How it starts | What it shows |
|---|---|---|---|---|
| 1 | **Canary Wharf Workspaces** | Multimodal chat | **New**, then drop 3 desktop files and use the mic | A customer call becomes an order. Claude reads the files, the Gong call, Gmail, Slack and Salesforce, does 8 tasks on its own and brings 4 decisions one at a time. The customer then orders |
| 2 | **Delivery Watch** | Agent | The first **New session** row | It watches every open order and cart for 60 days, fixes what it can within policy and reports $160K saved |
| 3 | **Growth Scout** | Agent | The second **New session** row | It sends lapsed accounts approved win-back quotes with a recommended add-on, asks you about the big ones, and lets you change the discount by voice |
| 4 | **Morning Brief** | Scheduled task | **Scheduled**, then the **Daily briefing** template | Set up one day, read the next morning (Ctrl+S jumps the clock). It covers accounts, the store, the inbox and Slack, and what both agents did overnight. You act on it by voice |

Vision, decisions and build handoff: [COWORK_INTENT.md](./COWORK_INTENT.md).

---

## How the code is organized

```
src/
  Root.tsx            picks the browser chat or the desktop from the URL hash
  App.tsx             the browser chat app
  shell/              shared chrome: sidebar, composers, menus, the prompt editor, dictation
  chat/               the browser chat: transcript, MCP app slots, widgets (viz/)
    experiences/      one script per browser journey (quote, checkout, insights)
  desktop/            the Mac desktop: menu bar, icons, Slack banner, the Cowork window
    cowork/           the Cowork app: sidebar, Home, Agents, Scheduled
      chat/           Cowork's chat, store and blocks
        scripts/      one script per Cowork flow (prestige = Canary Wharf, delivery, growth, brief)
  copy/copy.ts        every user-facing string, in one typed file
  styles/tokens.css   the design tokens (primitives, then semantic tokens)
```

**Scripts drive everything.** A flow is a list of timed beats (prose, skill lines, integration steps, Salesforce writes, cards) that play into the chat. `intents` map what the user types to a reply, `dictations` feed the mic, and agents' `watch` posts arrive on a timer with a Slack banner. To change what a flow says or does, edit its script, not the components.

**Keep chrome and content apart.** The shell and blocks are generic. The experiences live in the scripts.

---

## Working docs

The repo keeps its own working memory. Read these at the start of a session:

| Doc | What it holds |
|---|---|
| [SESSION_CONTEXT.md](./SESSION_CONTEXT.md) | What the project is and where it stands |
| [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md) | Settled design and interaction decisions, with the reasons |
| [COWORK_INTENT.md](./COWORK_INTENT.md) | The Cowork desktop vision, its numbered decisions and the build handoff |
| [CHANGE_LOG.md](./CHANGE_LOG.md) | Every change, newest first, versioned at commit |
| [TODO.md](./TODO.md) | Open work in three priority buckets |
| [CLAUDE.md](./CLAUDE.md) | Instructions and standing rules for Claude Code in this repo |

## Contributing

- Plan before building. Agree on the approach before writing feature code.
- Log changes under `## Unreleased` in CHANGE_LOG.md. The version moves only at commit.
- When a flow's prompts or buttons change, update its presenter guide, demo script or runbook too.
- Keep the two demos independent. Shared plain components are fine, but behavior changes go in surface-specific code.
- Check every change with `npx tsc -b --noEmit && npx vite build`.
