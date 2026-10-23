# CLAUDE.md

Instructions for Claude Code working in this repo.

## Running the prototype

If asked to run the server or show the prototype: `npm install` (first time), then `npm run dev`
(run it in the background; it doesn't exit). The Cowork desktop demo is at
**http://localhost:5173/#desktop** (Vite moves to the next port if 5173 is busy and prints it);
`http://localhost:5173/` alone is the browser chat. Needs Node 20.19+ or 22.12+. The demo's run
sheet is [docs/cowork-demo-run-sheet.md](./docs/cowork-demo-run-sheet.md).

## The harness — read these first, every session

1. **[SESSION_CONTEXT.md](./SESSION_CONTEXT.md)** — what this project is, why it exists, current state, open questions.
2. **[DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md)** — durable design & interaction decisions with rationale. Don't relitigate what's settled here.
3. **[CHANGE_LOG.md](./CHANGE_LOG.md)** — chronological record of changes. Newest at top.
4. **[TODO.md](./TODO.md)** — running to-do list across sessions. Check it at the start of every session and keep it current.
5. **[COWORK_INTENT.md](./COWORK_INTENT.md)** — the Cowork-on-a-Mac-desktop vision work for the VP of Product (from 2026-10-08): what's agreed and what's still open.

## How to maintain the harness

- When context shifts (goals, state, who's using it) → update **SESSION_CONTEXT.md**.
- When a design or interaction choice is settled → add an entry to **DESIGN_DECISIONS.md**. Supersede, don't delete.
- After any meaningful change → add a bullet to **CHANGE_LOG.md**.
- When a journey's prompts, buttons or flow change → update its script in **docs/demo-scripts/** (and the matching `docs/*-flow.md` runbook).
- As tasks arise or complete → update **TODO.md**. It has three priority buckets: **🔴 Urgent & Important**, **🟡 Important**, **🟢 Do at some point**. Always deal with 🔴 first and raise those often. When Somnath asks to add items, **propose which bucket each belongs in and confirm placement before adding.**

## Working agreements

- **Plan before building.** Don't scaffold or write feature code until the approach is agreed.
- Keep the shell (chrome) and the experiences (content/scripts) cleanly separated.
- Match the surrounding code's style; keep components small and composable.
- Commit / push only when asked.

## My standing instructions

These are hard rules. Follow them exactly. Suggesting is always fine; acting on any of the below without explicit confirmation is not.

1. **Never build anything without my instruction.** Always feel free to suggest or propose — but do not scaffold, write, or change application code on your own initiative. Wait for my go-ahead.
2. **Always ask before committing anything.**
3. **Never push to `origin` without me saying so — ever.** When I do say push, push the **current state of the whole project**: `master` and every local branch (`git push origin --all`), not just the checked-out one.
4. **Never create, delete, merge, or delete-after-merge branches unless I explicitly confirm.** Feature branches stay on the remote permanently (useful for future contributors) — never delete them, and never merge them into `master` ("main") unless I ask.
5. **Keep `CHANGE_LOG.md` current — but only version at commit/push.** Between commits, log changes under a single **`## Unreleased`** heading at the top (plain bullets, no version). **The version number advances only when we commit or push:** at that point, rename `Unreleased` to the new `MAJOR.MINOR.PATCH` + date/time, and start a fresh `Unreleased` for subsequent work. This keeps versions meaningful instead of ticking into the hundreds on every small tweak. Semantic version scheme:
   - **MAJOR** (`X.0.0`) — large feature.
   - **MINOR** (`0.X.0`) — small addition.
   - **PATCH** (`0.0.X`) — bug fix / copy fix.
   Still update the log **before session cutoff and before any commit or push.** Every versioned entry must include **date, time, kind of change,** and any other major details.
