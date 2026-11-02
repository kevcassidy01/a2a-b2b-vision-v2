# A2A B2B Commerce Vision (v2)

A scripted, clickable prototype of **agent-to-agent B2B commerce**. A buyer's agent and a seller's agent negotiate a large order end to end, and people step in only where policy says they must.

**The story:** Fizz Drinks runs an Oktoberfest offer. At Isar Bottling, Mike's agent starts a cart from it. John (Procurement Director, Munich) hands the cart to his Coworker. The Coworker tops it up for Munich and asks Fizz for a quote. Fizz's agent counters, and Alex (Fizz sales rep, New York) sends two final offers. John approves one, and order **O-5531** is placed: 19,500 units at 15% off, Net15. In all 15 steps, people act three times. The agents do the rest.

Everything plays from authored scripts, so a demo never depends on the network, a live org or a model's mood.

| | |
|---|---|
| **Status** | Demo-ready prototype. Scripted, not wired to a live org or an LLM |
| **Version** | See the top of [CHANGE_LOG.md](./CHANGE_LOG.md) |
| **Default branch** | `master` (feature branches are kept on origin and never deleted) |
| **Repo** | https://git.soma.salesforce.com/somnath-mallela/a2a-b2b-vision-v2 |
| **Stack** | React 19, TypeScript, Vite 8, Tailwind CSS v4, lucide-react |

---

## Run it

You need Node.js **20.19+ or 22.12+** (`node -v`).

```bash
git clone https://git.soma.salesforce.com/somnath-mallela/a2a-b2b-vision-v2.git
cd a2a-b2b-vision-v2
npm install
npm run dev
```

| Open | What you get |
|---|---|
| **http://localhost:5173/** | Both sides on one screen: John's iPhone on the left, Alex's Command Center on the right, and a bar showing who's acting |
| **http://localhost:5173/buyer** | John's phone alone: the Fizz storefront and his Coworker |
| **http://localhost:5173/seller** | Alex's Command Center alone, as a desktop app window |

If port 5173 is busy, Vite picks the next free port and prints it.

### Two devices

Run `npm run demo` (the dev server, open to your network). Open `http://<laptop-ip>:<port>/buyer` on one device and `/seller` on another, on the same Wi-Fi. Each side's moves reach the other live through the dev server. A page with no partner plays the other side by itself, so either page also works alone.

### Presenter keys

- **`** pauses and plays the whole demo.
- **Shift + `** restarts it.
- **C** opens the contents menu, where you can jump to any of the 15 steps.

On two devices, these keys control both pages.

### Share it as one file

`npm run build:share` builds the prototype into **one HTML file**, `dist-share/share.html`. It opens with a double-click and needs no server or network. Use `#buyer` or `#seller` on its URL for one side.

Other scripts:

- `npm run build` type-checks (`tsc -b`) and builds for production.
- `npm run preview` serves the production build.

---

## How the code is organized

```
src/
  a2a/                the prototype
    A2AStage.tsx      the stage: both sides, or one (/buyer, /seller)
    story.tsx         the shared story state both sides play from
    link.tsx          the live link between /buyer and /seller
    storefront/       John's side: the Fizz storefront on the iPhone, and his Coworker's chat
    command-center/   Alex's side: the Command Center, Fizz's agent and the quote thread
  copy/copy.ts        every user-facing string, in one typed file (copy.a2a)
```

**Scripts drive everything.** The story is a sequence of beats, and each side fires and reacts to them. To change what someone says, edit `copy.ts`, not the components.

---

## Working docs

The repo keeps its own working memory. Read these at the start of a session.

| Doc | What it holds |
|---|---|
| [A2A_INTENT.md](./A2A_INTENT.md) | The prototype: storyline, the 15 steps, agent rules, screens, open questions. **Build from this** |
| [SESSION_CONTEXT.md](./SESSION_CONTEXT.md) | What the project is and where it stands |
| [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md) | Settled design and interaction decisions, with the reasons |
| [CHANGE_LOG.md](./CHANGE_LOG.md) | Every change, newest first, versioned at commit |
| [TODO.md](./TODO.md) | Open work in three priority buckets |
| [CLAUDE.md](./CLAUDE.md) | Instructions and standing rules for Claude Code in this repo |

---

## Earlier demos

This repo started as a Claude app experience kit, and the two earlier demos still run behind the URL hash. They're reference only, and independent of the A2A prototype.

| Open | Demo | Guide |
|---|---|---|
| `/#chat` | Browser chat: claude.ai with Salesforce MCP apps inline, three journeys for Alpine | [browser-chat-demo-guide.md](./docs/browser-chat-demo-guide.md) |
| `/#desktop` | Cowork desktop: Claude working across Salesforce, Gmail, Slack and Gong for Ohana Networks | [cowork-demo-run-sheet.md](./docs/cowork-demo-run-sheet.md) |

Their intent docs are in [docs/old-intent/](./docs/old-intent/).

---

## Contributing

- Plan before building. Agree on the approach before writing feature code.
- Log changes under `## Unreleased` in CHANGE_LOG.md. The version moves only at commit.
- Keep the chrome (shells, frames) apart from the experience (story, copy).
- Check every change with `npx tsc -b && npx vite build`.
