# COWORK_INTENT

Vision work for the VP of Product: **Claude Cowork on a simulated Mac desktop**, alongside
Claudeforce (Claude in the browser). Started 2026-10-08, about 3 days of work. **Building started
2026-10-11; where the build stands is in §8 (read it first in a new session).** This doc is the single place for the Cowork intent. Somnath adds thoughts as they come, and
Claude sorts them into the sections below.

**Contents:** 1. What it is · 2. Agreed so far · 3. Research · 4. The story · 5. Switching browser ↔
desktop · 6. Open questions · 7. Not doing · 8. Build progress (handoff)

---

## 1. What it is

A full simulated macOS desktop in the browser:

- **Wallpaper**, a **Mac menu bar** across the top and a **Dock** at the bottom.
- **A window with the Cowork app open** (traffic lights, title bar).
- **Desktop objects** (files, folders) that can be **dragged and dropped into Cowork**.
- "All sorts of interactions", so it stays in React (see §2).

### 1.1 The overall picture (Somnath, 2026-10-11)

- **The Mac desktop** fills the page, with the **menu bar** across the top.
- **It's a sales rep's MacBook.** The whole environment simulates a real MacBook desktop that
  belongs to a sales rep: their files, their apps, their wallpaper.
- **The Cowork window sits in the center**, *not* full screen or zoomed. It takes up **about 75%
  of the screen**. **One column of desktop items** stays visible beside it, and **some
  wallpaper** shows around it, so it really feels like a desktop app.
- **Random files and objects** on the visible desktop can be **interacted with** (selected,
  opened, dragged into Cowork).
- **The Dock is secondary.** It's nice to have, built after the window and the desktop.
- **The window must look realistically like macOS:** real corner radii, the three traffic-light
  buttons, layered window shadows, hairline borders and materials, per Apple's latest HIG. The
  values are in §3.4.

---

## 2. Agreed so far

1. **Same repo, its own branch.** The repo is small (about 10K lines of source, a 1 MB git
   pack), so the desktop won't make it heavy. It reuses the shell: composer, scripted thinking,
   MCP cards, tool timeline, file cards and preview. The desktop lives in its own folder
   (`src/desktop/`) so the three journeys at `/` stay untouched. The branch is
   **`cowork-desktop`**, cut from `master` (v11.5.1) on 2026-10-11. It isn't pushed yet.
2. **React, not vanilla HTML/JS.** The interactions inside the window (scripted chat,
   composer, cards, drag and drop) would take far longer by hand.
3. **Hosting comes later.** For now people clone the repo and run the dev server.
   - Pages works on our GHE (`git.soma.salesforce.com`). Somnath's test deploy loaded a blank
     page because Pages served the raw source (`/src/main.tsx`), not a build.
   - To fix that later: set Vite `base` to `/pages/somnath-mallela/claudeforce-commerce/`, make
     the root-absolute asset paths use `import.meta.env.BASE_URL` (about 15 in `src/`), publish
     `dist/` to a `gh-pages` branch, and use a hash route for the desktop. Each step needs
     Somnath's go-ahead.
4. **A new end-to-end story** (2026-10-11). It doesn't reuse the three browser journeys. It's
   a new merchant scenario built around what Cowork adds: local files, several steps, and
   output that leaves Claude. See §4.
5. **Cowork looks very much like the browser app, with a few differences** (Somnath,
   2026-10-11). We borrow most of the colors, tokens and patterns from our claude.ai shell:
   palette, type, composer, cards, timeline and file cards. Somnath will name the differences one
   at a time as we build the app's look. Don't invent them up front. Until he does, the research
   in §3.1–3.2 (the Progress, Artifacts and Context panels, the integrations timeline, the
   schedule card) lists candidates, not specs.
   *This supersedes the earlier note (same day) that the layout should look "clearly different
   from the browser view".*
6. **A separate conversation** (2026-10-11). Cowork and the browser chat each keep their own
   state. Switching views never disturbs a demo in progress.
7. **No browser window on the desktop** (2026-10-11). The floating toggle already switches to the
   browser view, so the desktop stays uncluttered.
8. **A sales rep's MacBook** (2026-10-11). The desktop is a real-feeling MacBook belonging to a
   sales rep, and the story is told from that rep's point of view.
9. **Window size** (2026-10-11): the Cowork window takes up about 75% of the screen, centered.
   One column of desktop items stays visible, with wallpaper showing around the window.
10. **Realistic macOS assets** (2026-10-11). File icons by type (PDF, XLSX, CSV, DOCX, images),
    blue macOS folder icons, file colors and tags all match real macOS, so the desktop looks real.
    **Somnath supplies the wallpaper and other assets when we need them. Ask him at that point;
    don't source or invent stand-ins.**
11. **Light mode only** (2026-10-11), for the macOS chrome (menu bar, window, glass, Dock, menus)
    and the Cowork app alike, matching the browser shell. Ignore the dark-mode values in §3.4.
    **Superseded in part (Somnath, 2026-10-11):** the **macOS chrome is dark mode** (the menu bar,
    and later the Dock, menus and other Mac-native items), shown as dark-tinted glass. There won't
    be many elaborate menus or other apps. **The Cowork app itself stays light mode.** The
    dark-mode values in §3.4 now apply to the Mac chrome.

---

## 3. Research

### 3.1 Patterns from Somnath's references (2026-10-11)

Screenshots are in [`docs/references/cowork/`](docs/references/cowork/). They come from an
Anthropic Cowork demo video (an account exec, Maya, preparing an Acme QBR).

**A. Long, complex prompts** ([long-prompt.png](docs/references/cowork/long-prompt.png))

> My Acme QBR is tomorrow at 11am and the renewal is shaky. Pull everything: the email threads,
> #acct-acme in Slack, the last two meeting transcripts, their recent news. Build my prep doc
> with talking points and flag anything that feels off. Draft the renewal email but don't send
> it. Run the prep at 8am tomorrow so it picks up anything that comes in overnight. After the
> meeting, give me the recap and action items.

- One prompt has **many sources** (email, Slack, transcripts, the web), **several outputs**
  (prep doc, flags, draft email), **guardrails** ("don't send it"), and **timing** (run at 8am,
  again after the meeting). The user describes the outcome, not the steps.
- **Prompt box anatomy:** large white rounded card, prompt in big type that wraps over many
  lines. Footer row: **＋** · a **Chat | Cowork** segmented toggle (Cowork selected) · model
  picker (**Opus 4.8 · High ⌄**) · mic · clay send button. A grey tray **under** the card has
  **Work in a project or folder ⌄** (folder icon) and **Ask ⌄** (hand icon, a permission mode).
- The video highlights part of the prompt (a clay wash on "After the meeting, give me the recap
  and action items.") to call out the part that turns into a scheduled task. It's a presenter
  device worth borrowing.

**B. The integrations timeline** ([integrations-timeline.png](docs/references/cowork/integrations-timeline.png))

- Heading: **"Used 4 integrations ›"** (muted, with a chevron to collapse or expand).
- Under it, a **vertical timeline**: each step has the **integration's brand icon** (Slack,
  Gmail, Google Calendar, Google Drive), a plain-language action ("Confirm #acct-acme is
  reachable", "Verify Gmail access", "Find the 11am QBR on Monday", "Verify Drive access"), and a
  small monospace **Result** chip under it. A thin grey line joins the icons.
- This is close to our tool timeline (`ToolTimeline.tsx`), with three differences: **brand
  icons instead of the wrench**, **human-readable step labels instead of tool names**, and **a
  Result chip per step**. The count heading replaces our "Headless 360 MCP tools" row.

**C. Scheduled tasks with long prompts** ([scheduled-task.png](docs/references/cowork/scheduled-task.png))

- Once it's created, a task collapses to a one-line row: clock icon · **"Created scheduled task:
  Acme QBR — Pre-meeting research & prep doc"** · right-aligned **"Once — Jul 6 at 8:00 AM ›"**.
- A pending one is a **confirm card**: clock icon · **Schedule task · <title>**, a cloud icon with
  **"Once — Jul 6 at 1:00 PM"** (the cloud means it runs remotely), a **Details ⌄** disclosure
  with the **full prompt Claude wrote for its future self**, an **"Also changes:
  create_new_session_on_fire, notifications"** disclosure, then **Schedule ⏎** (black) and
  **Cancel Esc**.
- The scheduled prompt is long and structured. It sets context ("Maya just finished… The renewal
  was shaky going in."), gives the job, and lists numbered steps: search Gmail and Slack from the
  last 4 hours; **ask Maya how it went and wait**; then produce a Meeting Recap, Action Items
  (owner and due date), Renewal Status (green/yellow/red) and Next Steps.
- So **one user prompt becomes several scheduled tasks** (pre-meeting at 8am, post-meeting at
  1pm). A scheduled task can **pause to ask the user a question**, and the user **approves each
  schedule** before it's set.

### 3.2 What Cowork is, and what people do with it

Researched 2026-10-11 from public web sources only: Anthropic's site and help center, Simon
Willison, Hacker News, Zvi's roundups, Lenny's Newsletter, and security writeups. Reddit, X and
YouTube couldn't be fetched directly, so those items are second-hand. None of this was checked
in the live product. The UI changes fast, so check what the current app shows before matching it.

**What it is.** Cowork is Claude Code's agent harness packaged for non-coding work, not a separate
model. You describe the outcome. Claude plans it, splits it into subtasks (parallel sub-agents),
and returns finished files: docs, spreadsheets, decks and organized folders.
([getting started](https://support.claude.com/en/articles/13345190-getting-started-with-cowork),
[product page](https://claude.com/product/cowork))

**Timeline, 2026** ([release notes](https://support.claude.com/en/articles/12138966-release-notes)):

| Date | What shipped |
|---|---|
| Jan 12 | Research preview on the Mac desktop app (Max only). Runs locally in an isolated VM. ([launch](https://claude.com/blog/cowork-research-preview)) |
| Jan 16 | Opened to Pro |
| Jan 30 | **Plugins**: skills, connectors, slash commands and sub-agents bundled together. 11 open-source plugins, including sales, finance, data, legal and support. ([blog](https://claude.com/blog/cowork-plugins)) |
| ~Feb 10 | Windows |
| Feb 24 | Admin controls and private plugin marketplaces (Team/Enterprise) |
| Feb 25 | **Scheduled tasks** (recurring and on demand), plus the Customize section |
| Mar 11 | Excel and PowerPoint add-ins share context |
| Mar 17 | **Dispatch**: message the desktop agent from your phone (now limited beta) |
| Mar 23 | Computer use preview (only after connectors and the browser fail; asks permission per app) |
| Apr 9 | **General availability** on Mac and Windows, with enterprise controls ([blog](https://claude.com/blog/cowork-for-enterprise)) |
| Apr 21 | **Live Artifacts** that refresh from connected services |
| Jul 7 | Web and mobile beta; sessions run in the cloud ([blog](https://claude.com/blog/cowork-web-mobile)) |
| Aug 25–26 | Memory shared across chat and Cowork; a built-in browser in a side panel |
| **Sep 16** | **"Cowork and chat are now one Claude"**: no mode picker; Claude decides what the task needs ([blog](https://claude.com/blog/cowork-is-now-claude)) |
| Oct 6 | New Pro/Max tasks run in the cloud; the local-only setting is removed |
| Oct 8 | Docs, Slides and Design out of beta; Dashboards and Motion in beta |

> **Resolved (§3.3):** Somnath's live app (Oct 11) still has a **Chat | Cowork** toggle in the
> prompt box, even after the Sep 16 merge. We show it.

**UI anatomy** (from [Willison's launch walkthrough](https://simonwillison.net/2026/Jan/12/claude-cowork/)
plus the current help docs). This is the most detailed public description we have to recreate:

- **Left sidebar:** the task list, a **Scheduled** entry, **Customize** (connectors, plugins,
  skills) and Dispatch.
- **Center:** the conversation, with Claude's step-by-step narration, tool calls (files opened,
  searches run), inline questions to the user, and the prompt box. The prompt box has a **＋** menu
  (connectors, memory) and a **folder picker** ("Work in a project or folder").
- **Right sidebar, three stacked sections:**
  - **Progress:** a checklist of steps that ticks off as the task runs.
  - **Artifacts:** the files produced, with an inline preview and download.
  - **Context:** connected folders, active connectors and the files in use.
- **Later additions:** a built-in browser side panel; a Scheduled list view; shareable links for
  Docs and Slides; a check-in control ("ask before acting" vs "keep working, check in only when
  needed").
- **Permission modes:** Manual (asks before acting, the default) and Auto (Claude screens each
  action for risk). Permanent file deletion always needs approval. Each connector can be set to
  Always allow, Needs approval or Blocked.
- **Under the hood** ([writeup](https://pvieito.com/2026/01/inside-claude-cowork)): Claude Code
  running in a Linux VM. Chosen Mac folders are mounted in and shown as `~/Downloads` and similar.
  Network access goes through an allowlist.

**Prompts and scheduling in practice**

- Anthropic's guidance: *"point Claude at a folder, thread or unfinished deck and describe what
  done looks like."* Prompts give a goal, the inputs and the output, not a list of steps.
- Willison: "find drafts begun in the last three months, check whether each was published, and
  propose the ones nearest to ready". Cowork read 46 files and ran 44 searches to rank them.
- Ethan Mollick pointed it at 107 class documents (PPT, Word, Excel) and got a full business case
  in one pass ([via Zvi](https://thezvi.wordpress.com/2026/03/09/claude-code-claude-cowork-and-codex-5/)).
- **Scheduled tasks** ([help](https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-claude-cowork)):
  - Three ways to create one: describe it in any conversation and Claude proposes the name,
    schedule and instructions, then you click **Schedule** (as in §3.1 C); go to Sidebar →
    Scheduled → New task → "Create with Claude"; or set it up manually.
  - Manual fields: name, prompt, approval mode, frequency (hourly, daily, weekdays, weekly or
    manual), model, folder. `/schedule` works inside a task.
  - Each run is its own session and runs in the cloud, so the laptop can be asleep. Tasks can be
    paused, edited, run now or deleted.
  - Anthropic's own example: a 6am Monday client briefing that **drafts but doesn't send** a
    follow-up email.

**What people use it for**

Anthropic's study of 1.2M sessions (late May 2026): **business processes 33.4%**, content
creation 16.4%, software only 8.7%.

- *Finance and ops:* reconciling regional exports against budgets with variances flagged
  ([Anthropic](https://claude.com/product/cowork)); a contracts-to-renewals tracker with risks
  flagged ([blog](https://claude.com/blog/cowork-web-mobile)); VAT expense classification
  ([HN](https://news.ycombinator.com/item?id=46593022)); a Ramp customer's client dashboard,
  started on a laptop and continued on a phone.
- *Sales and marketing:* objections and deal status from a quarter of call notes; a weekly
  marketing readout deck from Amplitude plus Drive, scheduled; outbound lead-gen skills with
  human-approved replies ([GitHub](https://github.com/skyzer/skills)).
- *Knowledge work:* a business case from 107 files (Mollick); proposal revisions; first-pass
  contract review against a legal playbook.
- *Surprising ones* (Felix Rieseberg, Cowork's creator, on
  [Lenny's Newsletter](https://www.lennysnewsletter.com/p/how-i-ai-how-the-engineer-behind)):
  - A 2D house plan turned into an interactive 3D model, with furniture taken from emailed receipts.
  - Email receipts turned into an inventory database.
  - A live dashboard fed by Gmail, Calendar, Spotify and Notion.
  - A Reddit user says Cowork found them a London flat in 5 days.
- *Market signals:* open-source clones within days; Microsoft's
  [Copilot Cowork](https://www.microsoft.com/en-us/microsoft-365/blog/2026/03/09/copilot-cowork-a-new-way-of-getting-work-done/)
  is built on the same tech; the "SaaSpocalypse" stock narrative
  ([Rest of World](https://restofworld.org/2026/indian-it-ai-stock-crash-claude-cowork/)).
- **Gap:** we found no public Salesforce or B2B commerce Cowork example. This demo would be the
  first.

**Limits and complaints**

- **Data loss:** asked to tidy a desktop, Cowork permanently deleted a folder of 15 years of
  photos (via the terminal, so nothing went to Trash, and iCloud synced the change). Another video
  reports 11 GB of files deleted.
- **Security:** a PromptArmor demo showed a .docx with hidden text making Cowork upload files
  ([PromptArmor](https://www.promptarmor.com/resources/claude-cowork-exfiltrates-files)), and
  there are published sandbox escapes.
- **Reliability:** at launch, VM hangs, connector errors and Gmail problems.
- **Cost:** usage is hard to see; one long task can use up a plan's limit.
- **Quality:** decks often need formatting fixes, and some find it weak at spreadsheets.
- **Product limits:** sessions can't be shared (artifacts can); local files need the desktop app
  open; local CLIs and open network access are blocked.

**Ideas for our demo, drawn from the above** (to discuss, not decided):

1. **From mess to structure, with a live Progress panel.** Drop a folder of distributor POs (PDF,
   .eml, Excel) from the desktop. Progress ticks off steps while an order-intake sheet and Commerce
   orders appear in Artifacts.
2. **A B2B Commerce plugin on screen.** Its slash commands, skills (pricing rules, credit policy)
   and the Salesforce Commerce connector show in Context, next to Slack, Gmail and Drive.
3. **A scheduled Monday briefing:** stale quotes, low stock and at-risk accounts. It drafts
   follow-ups but doesn't send them.
4. **An approval gate on a write:** a price-book change or order-on-behalf waits for **Allow**.
   This answers "agents are scary".
5. **A variance memo plus deck:** a regional sales Excel checked against Commerce orders. This is
   almost Anthropic's own example, so it will feel native.
6. **A live artifact dashboard** that refreshes from the Commerce connector.
7. **A mid-task steer** ("leave out the Canadian accounts") and a dry run before writes, to show
   we know the limits.
8. *(Stretch)* **Phone handoff:** approve a step from mobile or Dispatch.

### 3.3 The real Cowork app (Somnath's screenshots, 2026-10-11)

These are the **primary reference** for the look. They outrank §3.2 and the estimates in §3.4.

#### A. The live app on Somnath's office Mac ([cowork-app-real.png](docs/references/cowork/cowork-app-real.png))

This is the current Claude desktop app's home screen on macOS Tahoe. Ignore the green "Sandbox for
Claude" banner, which is internal to Salesforce.

- **Window:** a plain title bar with **no toolbar**. The traffic lights sit alone in a strip about
  40px tall. They're **grey because the window isn't focused** in this shot, which is the HIG's
  inactive state. The corner radius is modest, and the window nearly fills the screen with a
  thin margin.
- **Sidebar, almost the same as ours:**
  - Top row: sidebar toggle, search, back, forward.
  - **Home | Code** segmented control. *Ours says Chat | Code; the live app says Home.*
  - New (washed, active), Projects, Artifacts, **Scheduled**, Customize.
  - A **Pinned** group: "Ask Salesforce".
  - **Chats and tasks** (filter icon), with starter rows marked by blue **Try** pills: "Customize
    Claude for you", "Get a morning brief".
  - Footer: avatar initials "SM", **"Som · Salesforce Sandbox"**, a chevron, and a small icon
    button on the right.
- **Home:**
  - The spark and a serif greeting, **"What shall we think through?"**
  - The prompt box: "How can I help you today?", ＋, a **Chat | Cowork** toggle (Cowork selected),
    **"Sonnet 5.5 Medium"**, mic, and a chevron.
  - Under it, plain text controls with no card: **"Project or folder"** and **"Manual"** (the
    permission mode).
  - A **connector nudge card:** Salesforce cloud tile, "Finish setting up Sales Cloud in Claude —
    Dreamforce 2026", "Your admin added the Sales Cloud in Claude — Dreamforce 2026 plugin. Sign in
    to start using it.", a black **Sign in** button and ✕.
  - **"Ideas for you"**, three rows with line illustrations: "Send me a daily briefing", "Organize
    my inbox", "Customize Cowork for me".
- **Desktop:**
  - **Wallpaper:** a blue-to-violet gradient.
  - **Menu bar:** transparent, white text: Apple logo · **Claude** (bold) · File · Edit · View ·
    Go · Window · Help. On the right are many menu bar extras, then Wi-Fi, battery, Spotlight,
    Control Center, and **"Sun Oct 11 1:43 AM"**.
  - **Desktop icons:** in a right-hand column, **partly hidden behind the window** (a second
    column peeks out). They're real Finder icons: blue folders, a PDF page thumbnail, a
    screen-recording thumbnail, the Screenshots folder. Labels are white, bold, two lines, with
    the middle of long names cut ("alpine-energy-drinks-p…t-images", "Screen Recording
    2026-0…58.42 PM").
  - **Dock:** a glass capsule: Finder, Slack, Chrome, Drive, Salesforce, Numbers, Claude,
    Terminal, Music, Safari and others, a divider, then Downloads and Trash, with running dots.

#### B. Cowork during a task ([cowork-app-small.png](docs/references/cowork/cowork-app-small.png))

This is from an earlier build (Opus 4.6), but it's the clearest look at a task running.

- **Unified toolbar:** traffic lights, sidebar toggle, back and forward, a **Chat | Cowork | Code**
  segmented control **centered** in the toolbar, and a **right-panel toggle** at the far right.
- **Left sidebar collapsed to an icon rail:** ＋, search, recents (clock), a clipboard/tasks icon,
  ideas (bulb), customize (briefcase). At the bottom, downloads (with a blue dot) and an avatar.
- **Center:**
  - The task title with a chevron: **"Audit MacBook for unnecessary files ⌄"**.
  - Replies in **serif**.
  - Each tool step collapses to a **muted one-line row with ›**: "Attempted to mount home
    directory, request denied ›", "Mounted Caches directory for file access ›".
  - **Permission card:** folder icon, "Claude would like to **Cowork** in `~/Applications`",
    **Deny Esc** and a black **Allow ⏎**.
  - A **"Working on it…"** dotted spinner while it runs.
  - **Prompt box during a task:** "Reply…", ＋, model ⌄, a stop button, and a clay **↳ Queue**
    button, so you can line up the next message while Claude works. A disclaimer sits underneath.
- **Right panel, three collapsible cards, each with a chevron:**
  - **Progress:** step circles joined by short lines, ticked as each step finishes. Empty state:
    "See task progress for longer tasks."
  - **Working folders:** a tree of the folders Cowork can use (Downloads ▸ "Instructions ·
    CLAUDE.md", Desktop, Documents, Caches).
  - **Context:** an illustration of stacked files. Empty state: "Track tools and referenced files
    used in this task." It fills with the tools and files the task used.

#### What this means for our build

- **Most of the shell can be reused** (decision 5): sidebar, palette, greeting, composer, serif
  replies. The real app confirms they match.
- **Differences we can already see** (for Somnath to confirm one at a time):
  1. Home | Code instead of Chat | Code.
  2. Scheduled in the nav, a Pinned group, and Try pills on the starter rows.
  3. A Chat | Cowork toggle in the prompt box.
  4. The "Project or folder" and "Manual" line under the prompt box.
  5. "Ideas for you" and a connector nudge card on the home screen.
  6. While a task runs: the right Progress, Working folders and Context panels, a permission card,
     collapsed step rows, Queue, and a "Working on it…" spinner.
- **The model label** follows the live app (Sonnet 5.5 Medium style), not the older "Opus 4.8"
  from the video.
- **The Salesforce nudge card** ("Sales Cloud in Claude — Dreamforce 2026") is a real pattern we
  could use as the story's way in: the rep's admin installed the Commerce plugin, and the rep
  signs in.
- **Desktop icons partly hidden behind the window** is a realistic detail. It fits our 75% window
  with one column of icons visible.

### 3.4 macOS window and desktop realism (Apple HIG)

Researched 2026-10-11. Each value has a source tag:

- **HIG**: read on Apple's HIG pages ([Windows](https://developer.apple.com/design/human-interface-guidelines/windows),
  [Materials](https://developer.apple.com/design/human-interface-guidelines/materials),
  [The menu bar](https://developer.apple.com/design/human-interface-guidelines/the-menu-bar)).
- **Community**: measured by designers or developers.
- **Estimate**: our own approximation.

The HIG describes behavior and gives almost no pixel values. Everything not tagged HIG is
unverified and has to be checked against real screenshots (see "How we lock the numbers" below).

**Which macOS.** Somnath's Mac runs **macOS 26 Tahoe** (Darwin 25), which brought Liquid Glass.
Wikipedia lists **macOS 27 "Golden Gate"** (public on 2026-09-14) as a refinement of it: glossier,
Aqua-like traffic lights, consistent window corners again, no icons in menus by default, and new
wallpapers. This is unverified. **Proposal: match Tahoe**, the macOS on the Mac we'll present
from, and measure it directly.

#### What the HIG says (official)

- **Anatomy:** a window has a **frame** (window controls plus an optional toolbar) and a **body**.
  You drag the frame to move it and the edges to resize it. Avoid a bottom bar; put details in
  an inspector on the trailing side.
- **Active vs inactive:** only one **key** (active) window takes input. *"The key window uses
  color in the close, minimize, and zoom controls"*. Inactive windows use **grey** controls and
  *"don't use vibrancy, so they appear subdued and seem visually farther away."* This gives us a
  real moment: clicking a desktop file makes Cowork inactive (grey lights, lighter shadow), and
  clicking back makes it active again.
- **"Avoid creating custom window UI.** Replicating system frames imperfectly can make your app
  feel broken." This is why the details below matter.
- **Liquid Glass:** a separate **functional layer for controls and navigation (toolbars,
  sidebars) that floats above the content layer**. Content scrolls and peeks through underneath.
  Never use glass in the content itself. **Regular** glass (blurred, adjusted for legibility)
  goes on sidebars, popovers and text-heavy parts. **Clear** glass goes only over rich media,
  with a **35% dark dimming layer** over bright content.
- **Menu bar:** **24pt tall**. The order is Apple menu, the app name **in bold**, File, Edit,
  Format, View, app menus, Window, Help. Menu bar extras (icons) sit on the trailing side. In
  menus, use the system's standard icons.

#### Window chrome (Tahoe)

| Property | Value | Source |
|---|---|---|
| Corner radius, window with a toolbar | ~26px | Community |
| Corner radius, title bar only | ~16px (Sequoia and earlier: ~10px) | Community |
| Title bar | 28px | HIG/AppKit |
| Unified toolbar | ~52px tall; compact ~38px | Community/Estimate |
| Floating glass sidebar | inset ~8px, radius ~18px (concentric: outer minus inset), 220–260px wide | Estimate |
| Outer hairline | 0.5px rgba(0,0,0,.25) | Estimate |
| Inner highlight | 1px inset rgba(255,255,255,.35) | Estimate |
| Content background | #ECECEC light / #1E1E1E dark (for Cowork we use Claude's own surfaces) | Community |

Shadows (Estimate). Active windows get a big, soft shadow offset downward. Inactive windows get
a lighter, tighter one, with a ~150ms change on focus.

```css
.win          { border-radius: 26px; box-shadow:
  0 0 0 .5px rgba(0,0,0,.28), inset 0 0 0 1px rgba(255,255,255,.35),
  0 22px 70px 4px rgba(0,0,0,.35), 0 8px 24px rgba(0,0,0,.22), 0 2px 6px rgba(0,0,0,.18); }
.win.inactive { box-shadow:
  0 0 0 .5px rgba(0,0,0,.22), inset 0 0 0 1px rgba(255,255,255,.25),
  0 10px 32px rgba(0,0,0,.18), 0 2px 6px rgba(0,0,0,.12); }
```

#### Traffic lights (Community)

| | Value |
|---|---|
| Size and spacing | 12px circles, 8px gap (20px center to center) |
| Position | ~14px from the left; vertically centered in the title bar or toolbar (centered at ~26px in a 52px toolbar) |
| Close | #FF5F57, stroke #E0443E |
| Minimize | #FEBC2E, stroke #DEA123 |
| Zoom | #28C840, stroke #1AAB29 |
| Inactive | grey, #CECECE or rgba(0,0,0,.12), 0.5px rgba(0,0,0,.1) stroke |
| Hover | hovering the **group** shows all three glyphs in dark rgba(0,0,0,.55): ×, −, and the two diagonal full-screen arrows (+ with ⌥) |

#### Menu bar (Tahoe)

- 24pt (HIG). In Tahoe it's **transparent** over the wallpaper by default, with the text turning
  white or black to suit the wallpaper (Community).
- SF Pro 13px. The app name is bold (HIG). It reads: **Apple logo · Claude · File · Edit · View ·
  Window · Help**.
- On the right: Wi-Fi, battery, Spotlight, Control Center, then the date and time ("Sat Oct 11
  9:41 AM").
- The Apple glyph (U+F8FF) only renders on Apple devices, so ship an SVG.
- Menus are glass panels with a ~10px radius and a blue (#007AFF) highlighted row with a ~6px
  radius (Estimate).

#### Desktop icons and drag and drop (Community/Estimate)

- **Icons:** 64×64 by default, on a grid of about 100×110px that starts at the **top right** and
  fills downward, then leftward.
- **Labels:** SF 12px, white, with a soft shadow (0 1px 3px rgba(0,0,0,.6)). Up to 2 lines, center
  aligned, with long names truncated in the middle.
- **Selected:** a translucent rounded backing behind the icon (rgba(255,255,255,.2), ~6px radius),
  and the label becomes a blue pill with white text.
- **Dragging:** a ghost of the icon at ~60% opacity follows the cursor, with a count badge for
  several files. When it's over a target that accepts it, the target highlights and the cursor
  shows a **green ＋** badge. This is the core Cowork drop moment.

#### Dock (secondary)

- A floating Liquid Glass capsule, ~6px above the bottom of the screen, with a ~24–28px radius.
- Icons 48–64px, with a 4px dot under running apps. Magnification is off by default.
- A divider sits before the folders and Trash.

#### Wallpaper, fonts, motion

- **Wallpaper:** Tahoe's default is a blue and teal mountain lake scene. **Somnath provides the
  wallpaper** (§2.10). Ask him when the build needs it.
- **Fonts:** `-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui`. This gives real SF on
  Macs. Apple's license doesn't allow self-hosting SF, so **Inter** is the fallback elsewhere. The
  Cowork app inside the window keeps Claude's fonts (Hanken Grotesk and Anthropic Serif).
- **Motion** (Estimate):
  - Window open: scale 0.96→1 with a fade, ~220ms, cubic-bezier(.2,.8,.2,1).
  - Close: scale to 0.95 with a fade, ~150ms.
  - Minimize: an approximate genie effect toward the Dock, ~450ms.
  - Dock launch: 2–3 bounces.
  - Focus change: ~150ms.

#### How we lock the numbers

Take real 2x screenshots on Somnath's Mac and measure them: a focused and an unfocused window
(the Claude desktop app itself is ideal), the traffic lights hovered and not, the menu bar, a
selected desktop icon, a file being dragged, and the Dock. Values in this section are replaced
with measured ones before the build is called done.

### 3.5 Long-running agents, multimodal, and Salesforce

Researched 2026-10-11 from Anthropic's help center and blog
([release notes](https://support.claude.com/en/articles/12138966-release-notes),
[scheduled tasks](https://support.claude.com/en/articles/13854387),
[Dispatch](https://support.claude.com/en/articles/13947068),
[web/desktop/mobile](https://support.claude.com/en/articles/15520349),
[Cowork is now Claude](https://claude.com/blog/cowork-is-now-claude),
[Dashboards and Motion](https://claude.com/blog/dashboards-and-motion)) and from Salesforce
([Claudeforce press release](https://www.salesforce.com/news/press-releases/2026/08/26/salesforce-and-anthropic-announce-claudeforce/),
[Claudeforce page](https://www.salesforce.com/claudeforce/)). The quotes are paraphrased. Gaps
are marked **not documented**; we don't guess.

#### Long-running agents

| Topic | How it works |
|---|---|
| **Where it runs** | Since **Oct 6** new Pro/Max tasks run **in the cloud**, and the local-only setting is gone. *"Close your laptop, it keeps going."* Tasks that need local files, the browser or computer use need the desktop app open; local files are fetched one at a time and deleted with the session. |
| **Sub-agents** | Claude splits large work into **parallel subtasks run by several sub-agents** and coordinates them. This uses more of the plan's limit. Plugins can bundle their own sub-agents. How many can run at once: **not documented**. |
| **Progress** | Steps with a status each, a visible plan, and **steering mid-task** (redirect it and it continues the new way). The help docs don't name a "Progress panel", but Somnath's screenshot (§3.3 B) shows one. |
| **Queue** | **Not documented**, but visible in Somnath's screenshot: a **↳ Queue** button lines up the next message while a task runs. |
| **Approval modes** | **Manual** (the default) pauses before each action. **Auto** has Claude check each action, block unsafe ones and ask when unsure (uses more of the limit). **Skip** has no checks. Permanent deletion always asks. Admins can turn off Auto. The Sep 16 post: let it work and *"check in only when something needs a closer look"*. |
| **Pausing for input** | When only the user can decide, Claude **asks and waits**, and the question can go to the phone. *Nothing ships until you approve.* The scheduled QBR recap in §3.1 C does this ("Ask Maya how it went… then wait"). |
| **Scheduled tasks** | Hourly, daily, weekdays, weekly or manual. Created in a conversation (a Schedule card) or from **Scheduled** in the sidebar. Each run is its own cloud session, so no device needs to be on unless the task uses local files. Pause, resume, edit, **Run now**. **Event or connector triggers aren't documented**, so assume schedules are time-based only. |
| **Dispatch** | One ongoing thread between phone and desktop. The phone sends a task, the Mac runs it with local files, connectors and computer use, and a **push notification** arrives when it's done or needs approval. Limited beta, closed to new users; the Mac must stay awake. |
| **Notifications** | Push notifications when a task finishes or needs input (Dispatch, mobile). The QBR schedule card's "Also changes: … notifications" (§3.1 C) suggests per-task notification settings. |
| **Memory** | Shared across chat and Cowork since Aug 25, with Topics you can edit. It's the closest thing to a persistent agent; "routines" or monitors: **not documented**. |
| **Limits** | Multi-step work uses up the plan's limit faster. Limits on tasks running at once: **not documented**. |

#### Multimodal: inputs, outputs, interactions

**Inputs**

| Input | Status |
|---|---|
| Word, PDF, text, Markdown, HTML, JSON, CSV, **Excel**, **PowerPoint**, **images**, YAML/XML, notebooks, code | Documented |
| Local folders and files | Documented (desktop app) |
| Connectors, websites (browsing and filling in forms), transcripts, receipts | Documented |
| **Computer use** | Beta (Pro/Max). The order is **connectors first, then the browser, then the screen as a last resort**. |
| Chrome side panel | Reads your current tab, no desktop app needed |
| Voice and dictation, audio, video, dragging from Finder, email files | **Not documented** (the live app does show a mic in the prompt box, §3.3 A) |

**Outputs**

| Output | Notes |
|---|---|
| **Excel** | Working formulas; variances flagged |
| **Slides** (out of beta on all plans, **Oct 8**) | Edit in Claude, **present from Claude**, export to PowerPoint or PDF, or send to Google Slides |
| **Docs** | Co-authored. The draft opens **beside the chat**, where you **highlight text and ask for an edit in place** |
| **Design** | Now inside conversations (the standalone Design app closes Dec 14) |
| **Dashboards** (beta, paid plans, Oct 8) | Built from plain-English questions over warehouses and connectors, **Salesforce included**. They refresh, and **each chart shows its query and last-refreshed time** |
| **Motion** (beta, Team/Enterprise) | Animation built in code, exported as **MP4** |
| **Live Artifacts** | Refresh from connected services (desktop and web) |
| Charts, PDF and HTML artifacts | Charts and shareable artifacts; PDF by export |

**Ways to interact with outputs:** one **shareable link** per Doc, Slide or Design (opens on a
phone); **move elements yourself or ask Claude**; **leave comments for Claude** to act on;
**co-edit with teammates**; the **Excel and PowerPoint add-ins** share the conversation's context;
Cowork in the **Chrome side panel**.

#### Salesforce-related

- **Claudeforce** (announced **Aug 26, 2026**): Salesforce is Anthropic's preferred CRM and Slack
  its preferred internal collaboration platform. Salesforce is rolling out Claude Code and Claude
  Enterprise internally.
- **Salesforce in Claude**: a plugin with **37 sales skills** (daily briefing, pipeline review,
  deal health, call and meeting prep, deal planning, account growth, CRM hygiene).
  - Onboarding reads Salesforce, Slack and other connectors, then builds a **personal dashboard of
    accounts and pipeline**.
  - The admin connects once and every seller gets access. Actions run with the **rep's own
    Salesforce permissions**, and the admin sets how freely Claude can write to the CRM.
  - Beta on paid plans since Sep 15. **Sales is the only team supported at launch; Service,
    Marketing and Commerce are "coming soon".** *So our Commerce-in-Cowork demo shows what's
    next.*
  - Naming: the public pages say "Salesforce in Claude". Somnath's live app shows **"Sales Cloud in
    Claude — Dreamforce 2026"** (§3.3 A). It's probably the same product under an event name.
- **Headless 360** (which our browser journeys already use, `project-codey`) exposes Salesforce data
  and workflows over **MCP**. "AIforce" is named as the harness that opens them to any agent
  (MCP, APIs, CLI).
- **Claude inside Salesforce:** a reasoning model for Agentforce's Atlas engine, the default for
  Agentforce Vibes and Coworker, and pickable in Agent Builder (via Bedrock, inside the Trust
  Boundary). Claude is also the **default model for Slackbot** and Claude Tag.
- **Dreamforce 2026** (Sep 15–17): attendees saw Salesforce in Claude live. What the keynote
  announced: **not verified**.

#### Ideas this opens up for the demo (to discuss, not decided)

1. **Close the lid:** schedule "Monday 6am pipeline and orders briefing". It runs in the cloud and
   the result is waiting on the Mac or phone.
2. **A long task with sub-agents:** one long prompt fans out across Commerce, Slack, Gmail and
   files. The Progress panel ticks off while the rep **queues** a follow-up.
3. **Pause for the human:** the agent stops at a decision (a price exception, an order over the
   credit limit) and asks. A notification pulls the rep back, they answer, and it carries on.
4. **Drop anything in:** a PDF purchase order, a photo of a whiteboard or shelf, a CSV price
   list. Cowork reads each one and acts in Commerce.
5. **A rich output, then refine it:** a QBR deck in Slides where the rep comments on a slide and
   Claude revises it, presents from Claude, and shares the link.
6. **A live Commerce dashboard** (Salesforce connector) that shows the query behind each chart.
   "Why did reorders drop?" is answered right there.
7. **An Allow gate on writes:** a cart or order placed on a buyer's behalf, or a price-book change,
   in Manual mode.
8. **Onboarding:** the "Sign in" nudge (§3.3 A) leads to the plugin building the rep's
   personalized accounts and pipeline dashboard.

---

### 3.6 Lindy (lindy.ai), a reference Somnath shared (2026-10-11)

**What it is:** an "AI teammate", positioned as *"Hire Lindy, get it done."* It lives in Slack,
iMessage and email, uses 1,500+ integrations plus MCP, and requires approval before anything
irreversible.

What's useful for us:

- **Agents come from a sentence, not a builder.** *"+ New routine: a sentence is all it takes."*
  There's no canvas and no node editor; Lindy picks its own skills and tools ("it picks the right
  one on its own"). This supports §4.5 decision 21.
- **Every reply has the same anatomy:**
  1. a status line
  2. a checklist of steps with tool logos and ticks
  3. a summary like **"3 steps · done in 21s"**
  4. a **bold headline finding**
  5. a rich card (a chart, an exceptions table, a diff, a file)
  6. **action buttons** named for the outcome ("Pause the campaign", "Ship the fix")

  This is very close to our keynote grammar (one hero line, the timeline as proof, one click).
- **The hero animations follow one formula:** a big scan, then one root cause, then one-button fix.
  For example: *"Read 1,340 tickets → 23 of 31 escalations are one export timeout → Linear issue
  filed."* Each one has a big number, a single insight and a named action.
- **Routine posts carry a label** such as *"Routine · daily, 8:00 AM"*, so you always know which
  agent is speaking.
- **Memory and skills are plain, editable files** in a workspace file browser ("Its memory is yours
  to edit"). In Cowork this maps naturally to the **working folder**: an agent's rules and what it
  has learned can be visible `.md` files.
- **Skills are learned once and shared with the team.** "Show it once", then it's saved for
  everyone.
- **The copy works in teammate terms:** "Connected to everything", "Shows up on schedule", "Learns
  your skills".

What doesn't carry over: Slack as the main surface (ours is Cowork), and the general
productivity use cases.

### 3.7 Slack "Today" daily briefing, a reference Somnath shared (2026-10-11)

Source: [Introducing Today](https://slack.com/intl/en-in/blog/news/today-daily-briefing) (Slack
blog, 6 May 2026; announcement copy only, no UI spec). It's for reference only; we're not building
it as Slack does. Slack is a Salesforce company, which suits our story.

- **Sections:**
  1. **Suggested focus areas:** AI priorities drawn from your activity
  2. **Your agenda:** today's calendar, with **one-click "prep me"** for any meeting
  3. **Highlights:** important messages so they don't get buried
  4. **To-dos:** added manually or by AI, and checked off
- **The framing:** people open Today "to get their bearings", and they're really asking *"did I miss
  anything?"*. The problem is uncertainty, not volume.
- **The suggested rhythm:** orient (Today), then triage, then act (with Slackbot).
- **The copy:** *"You supply the coffee, and we'll supply the clarity."*

### 3.8 Agentic interaction patterns from other products (research agent, 2026-10-11)

**Caveat:** this came from product and marketing pages only (no search, no keynote footage).
Patterns aren't verified at the screenshot level, and dates such as Linear Loops (Jul 2026) are
from changelog text. Confirm before relying on any detail.

| Product | Pattern | Source |
|---|---|---|
| **Linear** | Agents as teammates, "never in the dark". **Loops**: plain-language recurring jobs, a schedule or event trigger, each run inspectable and continuable as a conversation. Agent edits highlighted with attribution. Asks post a receipt back into the original thread. | linear.app/agents, /changelog, /asks |
| **Vercel** (AI SDK 5) | Tool calls as typed parts (input-streaming, then output-available). **A loading card becomes the result card in place.** | vercel.com/blog/ai-sdk-5 |
| **Loom** (Atlassian) | Native Mac recorder, **"AI-ready video prompts"**: talk and show instead of writing a spec | atlassian.com/blog/loom |
| **Asana** | AI Teammates as **role cards**: role, a one-line outcome, skills, integration icons, **3 example tasks** | asana.com/product/ai/ai-teammates |
| **Granola** | **Briefs**: context ready when you open a meeting note; chat with inline citations; a Claude MCP connector | granola.ai/blog |
| **Raycast** | Approvals that explain impact, with **"Always allow" for similar actions**; background notifications | raycast.com/changelog |
| **Cluely** | A floating overlay with a "Viewed screen" receipt | cluely.com |

**Candidates for us (Claude's shortlist, not yet decided):**

1. **Result cards that grow in place in the integrations timeline** (Vercel). A grounding row
   streams, then becomes a tiny result in place (*"1,214 order lines"* turns into a mini table).
   Steps 1, 2 and 4. Realistic in Cowork. This makes the "wide integrations" feel alive.
2. **The agent card shows "3 things I'll do"** (Asana role card). On Go live, the spec card shows
   three concrete example actions. Steps 1–3. Realistic. It teaches what the agent is (FTUX).
3. **Source chips on every brief line** (Granola citations), e.g. *Salesforce · Gong · Calendar*.
   Step 3. Realistic. It builds trust in what happened overnight.
4. **"Always allow quotes under €X"** on the permission card (Raycast). Step 4. Realistic
   (Claude already offers always-allow). It shows the trust model growing, which is a teaching
   beat.
5. **Attribution on the Salesforce side** (Linear): the quote shows *"Drafted by Claude for
   Aaron"*, with Claude's line edits marked. Step 4. Visionary, on the Salesforce side.

Already in our plan, now confirmed by others: each agent run opens as a chat you can continue
(Linear Loops, decisions 36–39); the receipt back in Slack (Linear Asks, step 4's Priya reply).
Rejected: Cluely-style overlays and coaching, mascots, a kanban of agents, frecency @-menus, design
mode.

## 4. The story

A new end-to-end story told from a **sales rep's** MacBook (decided 2026-10-11).

### 4.1 The intent (Somnath, 2026-10-11)

**Who presents, to whom:** **Aaron, VP of PM**, presents this demo to a room of **VPs and
Directors**.

**What they should walk away feeling:** drawn to the idea that **Salesforce MCP in any AI tool is a
superpower for their sales reps.** Cowork is the AI tool in this demo, but the point is bigger
than Cowork.

> **This isn't a Claude marketing demo.** It's about what reps can do with Commerce when an AI
> tool can reach it.
>
> **Claude = the reasoning engine. Salesforce Commerce / Headless 360 = the harness.**
> Together they let sales reps do their job in the best way possible.

What this means for every beat:

- **Claude reasons, and Commerce acts.** Claude interprets, plans, weighs trade-offs and asks
  when it should. Every real read and write (catalog, entitlements, carts, orders, quotes, prices,
  promotions) goes through the Commerce harness (Headless 360 MCP), and that shows in the tool
  steps. The Salesforce MCP should feel like the thing that makes it possible.
- **The rep is the expert.** The rep knows Salesforce and their accounts. Cowork lets them hand off
  the legwork without giving up judgment, with approvals on anything that writes.

### 4.1a Interaction principles (Somnath, 2026-10-11)

There will be a lot of interaction refinement, **a little different from the browser chat
journeys**. Two inputs drive it:

1. **Much less typing.** Internal audiences said the three browser journeys have a lot of
   typing. Chat is a typing interface, but the Cowork demo should ask for far less of it. Ways in
   (to refine together): files dropped from the desktop, voice notes and the mic, buttons and
   picks inside Claude's replies, suggested next steps, Allow/Schedule cards, prefilled prompts.
2. **Think through the FTUX: user education and easing in.** This is the design team's feedback,
   and it's where designers add value; engineering won't think about teaching people how to use
   this or showing the value. It's a **capability demo, not an onboarding demo**, but where
   possible we teach and ease people into each interaction:
   - inside Claude's replies (a line that explains what just happened or what's possible next)
   - shortcut buttons
   - placeholder text that hints at what to say or drop
   - starter "Ideas for you" and Try pills (as in the live app, §3.3 A)

### 4.2 The storyline, v1 (Somnath, 2026-10-11)

Source: [PAC Demo Storyline (PDF)](docs/references/cowork/pac-demo-storyline-v1.pdf), Somnath's
draft. **It's not complete.** The PM has suggested improvements, and Somnath will share her
comments next (§4.3). Claude's earlier candidate jobs are dropped now that this exists.

**The core story:**

> *What could a sales rep achieve in the future if Salesforce Commerce kept working on their behalf
> even when they aren't actively working?*

**Persona:** **Aaron plays the seller.** The presenter (VP of PM, §4.1) is also the rep in the
demo, starting in Cowork. *(Open question: is the Mac "his", with his name in the account row and
menu bar?)*

**Two acts, played back to back as tasks the seller completes:**

| Act | What happens | Shows |
|---|---|---|
| **I** | Aaron sets up **three long-running agents**, each a different kind of long-horizon work | Commerce keeps working when the rep isn't |
| **II** | In a fresh chat, Aaron drops **messy customer context** (voice note, photo, deck, spreadsheet) and Claude turns it into **Commerce objects and outcomes** | A rep who knows Salesforce can do far more, far faster |

> **A leeway we're taking:** Cowork's docs only describe **time-based** schedules today (§3.5).
> Threshold and goal agents go past that, and Headless 360 is what makes them believable: Commerce
> supplies the signals and the actions. They should look native, using the same Schedule-style
> confirm card, the **Scheduled** list in the sidebar and the Progress panel.

#### Act I · Agent 1: event or threshold-driven

*The question it answers:* what should the agent watch for, what triggers it, what can it do on its
own, and when should it bring in the seller?

> **Superseded 2026-10-12 (decision 50).** The built prompt is now commerce-led: *"Watch every open
> order and cart for the next 60 days. If an order is going to ship late, stock runs short at a
> warehouse, or a cart stalls before checkout, investigate it using Salesforce data and fix what you
> can within our existing policies. If a fix affects pricing, margins, or requires an exception,
> bring it to me with your recommendation and the evidence behind it."* The v1 prompt was:
>
> *"Keep an eye on my strategic accounts for the next 60 days. If you detect a meaningful change in
> buying behavior, order activity, inventory availability, or another signal that could put revenue
> at risk, investigate it using Salesforce data. Take any low-risk actions you can within our
> existing policies. If the actions affect pricing, margins, or require an exception, bring it to me
> with your recommendation and the evidence behind it."*

Flow:
1. Aaron types the prompt.
2. Claude confirms what it will monitor and the guardrails.
3. The agent becomes active.
4. Time passes.
5. A Salesforce threshold signal wakes the agent.
6. The agent investigates with Commerce data and tools.
7. It acts or escalates.
8. Aaron later sees what happened while he was away.

#### Act I · Agent 2: goal-based

*The question it answers:* what commercial outcome should the agent pursue over time, and which
Salesforce capabilities help it get there?

> **Superseded 2026-10-12 (decision 50):** Growth Scout becomes Aaron's win-back agent (accounts
> with no order in 30 days get an approved quote; see decision 50 for the prompt and flow). The
> v1 prompt below, and the $500K goal wherever it appears in §4 (goal-progress.md, $310K, $86K), are
> out once Growth Scout is built.
>
> *"Help me generate an additional $500K in credible revenue from my top 20 accounts before the end
> of the quarter. Look for reorder, expansion, cross-sell, or upsell opportunities using Commerce
> activity and account context. Keep working toward the target as new signals appear. Stay within
> our pricing and margin policies, and ask me before making any commitment that requires seller
> approval."*

Flow:
1. Aaron gives Claude the outcome.
2. Claude proposes how it will pursue it.
3. Aaron adjusts the guardrails if needed.
4. The agent starts working toward the goal.
5. New Salesforce signals create new opportunities over time.
6. Claude investigates and moves them forward.
7. Aaron sees progress against the target when he returns.

#### Act I · Agent 3: time or cadence-based

*The question it answers:* which repeated part of the seller's job should Claude take over, and
what should it deliver each time?

> *"Every weekday for the next 30 days, review my active accounts before I start work. Look for
> Commerce activity that needs attention, investigate anything unusual, and handle whatever can be
> resolved within policy. By 9AM, give me only opportunities, risks, or decisions that genuinely
> need me, with the relevant Salesforce context already pulled together."*

Flow:
1. Aaron defines the recurring responsibility.
2. Claude confirms frequency, duration and scope.
3. The work runs repeatedly.
4. Routine issues are handled without the seller.
5. Important decisions pile up for Aaron.
6. Aaron starts the day with a prepared brief instead of doing the investigation himself.

#### Act II: turn messy customer context into Commerce objects and outcomes

Aaron opens a **fresh Cowork chat** and adds a **voice note, a photo, a presentation and a
spreadsheet**.

> *"I just got back from a meeting with this customer. Here are my voice notes, the deck they
> shared, a photo I took, and the spreadsheet they sent me. Go through everything here and help me
> turn it into the best next commercial step."*

The beats (text in `[brackets]` is a placeholder still to be filled in):

1. **Claude reads the material:** "They appear to be planning `[customer objective]` with an
   initial requirement of `[requested products / quantities / categories]`."
2. **Claude checks what Commerce already knows.** The visible tool activity covers: the
   customer profile and order history, previous purchases, catalog and product entitlements,
   customer-specific pricing, inventory and availability, current carts and open orders, and the
   relevant commercial policies.
3. **Three things worth knowing before following up:**
   - They asked for **A**, and Claude found the matching catalog item.
   - In the **voice note** they described a need for **B**, which never appeared in their
     spreadsheet. Claude recommends adding B.
   - Item **X** isn't available in this region. The closest compatible item we sell is **Y**,
     which meets their requirements.
4. *"Why are you recommending Y?"* Claude: in the recording they said `[customer requirement]`.
   Y meets it, is available in the quantity they need, and fits their setup because they've
   bought `[related product]` before.
5. *"How does this compare with what they normally buy from us?"* Claude: their last three orders
   were mostly `[order data]`. This one is different because of `[meaningful change in buying
   behavior]`, so it looks like `[expansion / new site / replenishment / new project]` rather than
   a routine order.
6. *"What would you recommend we offer them?"* Claude proposes `[recommended assortment / type]`.
   It covers what they asked for, substitutes Y for the unavailable item, and adds **Z** because of
   `[inferred customer need]`.
7. **One decision for Aaron:** `[commercial issue]`, with Option A and Option B. Claude recommends
   B because of `[reason]`.
8. Aaron **selects B**.
9. Claude: "I've prepared the cart `[cart ID]` with the order template `[template]` and the other
   artifacts the customer needs."
10. *"Go ahead and place the order. It is approved."* Claude **completes the order fulfillment
    workflow**.

### 4.3 The PM's inputs (2026-10-11)

None of this is final. Somnath and the PM each wrote realistic scenarios that could be prototyped.

**Her note:** *"Very interesting, pretty sure we're thinking in a very similar direction. I did take
a stab at detailing out your Act II (Aaron's Use Case 1). I've tried to be very specific about the
skills that would be invoked, and honestly this is very much doable in a single release if we
invest in Salesforce Personalisation."*

**A. [Use Case 1: AI Powered Daily Wrap Up & Intelligent Cart Creation](docs/references/cowork/pm-use-case-1.pdf)**,
her detailed take on Act II:

1. The rep clicks a suggested skill, **`/draft-quote`**: *"Draft a quote for Morton based on our
   discussions over the last couple of days."*
2. `/draft-quote` orchestrates:
   - `/summarise-product-requests`: product mentions and intent from **Slack, Gmail and Salesforce**
     conversations with Morton contacts
   - `/cart-management`: what's in Morton's active cart(s)
   - `/personalised-recommendations`: the recommender, using browse, search and order history
3. An **interactive product list widget** (pick SKUs and quantities). The rep adds 3 × Alpine Supply
   Slim-line Smart Dispenser and 10 × GoBrew French Roast Whole Bean 16 oz.
4. *"Suggest a few complementary products."* Then `/quote-initiation` shows the quote's state and
   `/complementary-product-recommendations` runs per cart item. The rep adds 10 × Alpine Supply
   CO2 Cartridges.
5. *"Add a 5% discount to the cartridges."* `/quote-initiation` updates the line item.
6. **Voice:** *"Create the quote. Also, text these buyers letting them know I set this up based on
   our chat today, and include the direct link."*
7. Claude sends the quote and shows a **preview of the Slack messages** sent to the contacts.

**B. [Claude Cowork Use Cases for PAC](docs/references/cowork/pac-cowork-use-cases.pdf)**, the
source doc both of those build on. It sets the frame: **two use cases for strategic customers at
PAC in London, 15 minutes to present.** The goal is customer feedback on AI adoption, on giving reps
tools like Claude, and on which features would grow revenue most.

- **UC1 · Daily Wrap-Up & Intelligent Cart Creation.** It's 4:30 PM and the rep has talked to 10+
  clients over calls, email and Meet. *"Run Daily Wrap-Up for today's customer conversations."*
  Claude scans the channels ("Need now" vs "Products discussed") and shows a per-client summary:
  **Active Carts** (needed now) and **Order Templates** (future), with up to 5 **"AI Suggested"**
  lookalike items (*"75% of similar Mid-Market Manufacturing clients buy these alongside…"*). The
  rep approves everything at once, then types or speaks: *"Create these carts and templates. Also,
  text these buyers…"* Claude confirms the records and shows the **SMS** status.
- **UC2 · Autonomous Retention Agent & Dynamic Dashboarding.** From an "At-Risk Accounts" list:
  *"For any account on this list that hasn't ordered in 30 days, engage them with an approved quote
  for their most ordered product, historical average quantity, 5% discount. Run this daily. Build
  me a dashboard of quotes sent vs resulting orders. Run for 1 week, then send me a summary."*
  Claude shows an **Agent Configuration Card** (Trigger / Action / Duration) and the rep clicks
  **Deploy Agent**. A dashboard appears. *Fast-forward 7 days:* a proactive notification with *"872
  quotes sent, 370 won back (42%), $X revenue. Extend, raise the discount, or try something new for
  the 502 still at risk?"*, plus quick replies (Extend 30 days · Change discount to 10% · Stop
  agent).

**How the three line up:**

| | Somnath v1 (§4.2) | PM Use Case 1 | PAC doc |
|---|---|---|---|
| Long-running | 3 agents: threshold, goal, cadence | n/a | UC2: retention agent (threshold + daily + 7-day duration) |
| Messy context → Commerce | Act II: voice, photo, deck, sheet → cart → order | Slack, Gmail, SF threads → quote | UC1: 10+ clients → carts + order templates |
| Output object | Cart, then order | **Quote** with a line discount | Carts + Order Templates |
| Recommendations | B (from voice), X→Y substitute, Z (inferred) | Personalised + complementary | "AI Suggested" lookalikes |
| Send to buyer | n/a | Slack messages | SMS |
| Strength | Range of agent types; multimodal; judgment | Concrete skills, SKUs, Morton/Alpine | Real customer framing; config card; fast-forward payoff |

### 4.4 Unified storyline, v2 (Claude's draft, 2026-10-11, for Somnath to edit)

**The rule we're applying (Somnath, 2026-10-11):**

> **Salesforce side: be visionary.** Features Salesforce hasn't built, or may never build, are
> fine. If the panel's interest is strong, the team can be pushed to build Headless 360 features.
> **Cowork side: stay realistic.** Use only interactions Claude has today or will plausibly have
> soon, because we can't push Anthropic to build anything for us.

**The spine is one day in Aaron's life.** He's a seller at a breakroom and beverage supplier
(Alpine Supply and GoBrew products), and Morton is one of his accounts. That reuses the PM's world
and the browser journeys' world. The day has three acts and a closing beat, at about 15 minutes in
total:

| Act | When | What Aaron does | Typing |
|---|---|---|---|
| **I · Delegate** | Morning, ~4 min | Sets up three always-on agents | One prompt, then a pill, then a button |
| **II · Return** | Next week, ~3 min | Sees what Commerce did while he was away | Clicks only |
| **III · Wrap up** | 4:30 PM, ~6 min | Turns the day's messy conversations into a quote and carts | One voice note, picks, one spoken command |
| **Close** | ~1 min | Makes the wrap-up a daily agent too | One click |

#### The key move: all three agents are real Cowork scheduled tasks

This removes the "leeway" from §4.2. Cowork today runs **scheduled tasks** with long prompts, and
each run writes into the **Scheduled** list. Each kind of agent can be a scheduled task underneath:

| Agent | What Cowork does (realistic) | What Salesforce makes possible (visionary) |
|---|---|---|
| **Threshold** (retention, from PAC UC2 and v1 Agent 1) | Runs **hourly**. Most runs end with "Nothing crossed the line." | Headless 360 **signals**: order-gap, demand-drop and stock-out detection; at-risk scoring; policy-safe win-back quotes |
| **Goal** ($500K, v1 Agent 2) | Runs **daily**. Keeps a `goal-progress.md` in the working folder and picks up from it each run. | Pipeline from Commerce activity: reorder windows, lookalike expansion, cross-sell via **Personalisation** |
| **Cadence** (9 AM brief, v1 Agent 3) | Runs **weekdays at 8 AM**, which is plain Cowork today | One call that pulls carts, orders, quotes and exceptions across every account |

So the **Cowork side is ordinary**: the Schedule card, the Scheduled list, run history and the
Progress panel. **The magic is the Salesforce side**: what Commerce can detect, decide within
policy, and do. That is exactly the message for the panel.

#### Act I · Delegate (morning)

Each agent needs **less typing than the one before**, and that progression is how the FTUX teaches.

1. **Agent 1, typed once (or picked from "Ideas for you").** Aaron has the **At-Risk Accounts**
   list view, exported or shared from Salesforce, and drops it from the desktop. *"For any account
   here that hasn't ordered in 30 days, send an approved win-back quote for their most-ordered
   product at their usual quantity, 5% off. Check every hour. Bring me anything that needs a pricing
   exception. Report back in a week."*
   - The integrations timeline: Salesforce Commerce reads the list, order history and the
     discount policy.
   - Claude's reply is a **Schedule card** that is also the PAC doc's Agent Configuration Card:
     *Trigger · Action · Guardrail · Runs hourly for 7 days*, with **Schedule** and **Edit**
     buttons. Aaron clicks **Schedule**.
   - The teaching line: *"I'll check hourly and stay quiet unless something crosses your line.
     You'll find it under Scheduled."*
2. **Agent 2, from a pill.** Claude's reply ends with suggestions. Aaron clicks *"Chase a revenue
   goal"*, which prefills *"Help me find $500K in credible revenue from my top 20 accounts this
   quarter…"*. He changes one number and sends it. Claude proposes a plan (reorders, expansion,
   cross-sell) and shows a Schedule card. **Schedule.**
3. **Agent 3, from a button.** Claude: *"Want a 9 AM brief that rolls these up with anything
   else that needs you?"* Aaron clicks **Yes, weekdays**. The Schedule card appears. **Schedule.**
4. The sidebar's **Scheduled** list now shows three agents. The beat ends with the Mac lid
   "closing" (a fade).

#### Act II · Return (a week later)

The time jump uses the **menu-bar clock and date** plus a fade. When the desktop comes back, there's
a **macOS notification banner** from Claude (top right): *"Retention agent finished its 7-day
run."* That's realistic, it uses the desktop, and it's something the browser can't do.

1. **The 9 AM brief** opens as the newest run under Scheduled. It shows only what needs Aaron:
   - **Retention (agent 1):** *"Sent 872 quotes and won back 370 accounts (42%), $1.2M. 502 are
     still at risk."* Quick replies: **Extend 30 days · Try 10% · Stop**. Aaron clicks **Extend 30
     days**.
   - **One escalation:** *"Bergstrom asked for 12% on a 40-case reorder. That's below the margin
     floor. I'd offer 8% plus free freight; it nets more."* Buttons: **Approve my offer · Let me
     decide**. A **permission card** (Allow ⏎) appears because it writes a quote.
   - **Goal (agent 2):** **$310K of $500K**. The Progress panel shows the steps: 6 reorders
     nudged, 2 expansions found, 1 waiting on him.
   - **The hand-off to Act III:** *"Morton came up in Slack and Gmail twice this week, and you met
     them today. Want me to draft their quote at wrap-up?"*
2. The teaching line: *"Everything I did is in each run's history. Nothing priced below policy went
   out without you."*

#### Act III · Wrap up (4:30 PM): this is the PM's Use Case 1, fed by Somnath's Act II

1. **Starting it takes one click.** Under the composer, the **Ideas for you** row shows
   **`/daily-wrap-up`** and **`/draft-quote`** as skill shortcuts. The placeholder text teaches:
   *"Drop files from your desktop, or hold the mic to talk."*
2. **Aaron drags in three things from the desktop:** the voice memo from today's Morton visit
   (`Morton visit.m4a`), a photo of their breakroom, and Morton's spreadsheet. Then he clicks
   **`/draft-quote`** *(or speaks: "Draft Morton's quote from all of this and our threads this
   week")*.
3. **The integrations timeline** (the PM's skills appear as steps): **Slack, Gmail** →
   `/summarise-product-requests` → **Salesforce Commerce**: `/cart-management`,
   `/personalised-recommendations`, entitlements, pricing, inventory.
4. **Three things worth knowing** (v1 beat 3, filled in with the PM's SKUs):
   - **A:** the sheet asks for **Slim-line Smart Dispensers**. Found, entitled, in stock.
   - **B:** in the **voice memo** they said *"and we keep running out of CO2"*. The sheet doesn't
     mention it. Claude suggests **CO2 Cartridges** (that's the PM's complementary step).
   - **X → Y:** the **photo** shows a competitor's 5 lb dark roast that **we don't stock in their
     region**. The closest item we sell is **GoBrew French Roast 16 oz**.
5. **An interactive product widget** shows A, B, Y and one **"AI Suggested"** item, Z (*"72% of
   similar mid-market offices add filters with these dispensers"*), with quantity steppers. Aaron
   sets 3 dispensers, 10 cartridges and 10 coffee, and skips Z. **That's clicks, not typing.**
6. **Optionally, a question** (v1 beat 4): **"Why Y?"** appears as a follow-up chip. Claude answers
   with the quote from the recording and their past purchases.
7. **One decision** (v1 beat 7 merged with the PM's discount): Aaron says *"5% off the
   cartridges."* Claude: *"Option A: 5% on cartridges, which is inside policy. Option B: 5% on the
   whole quote, which needs your manager's approval. I'd do A."* Aaron picks **A**.
8. **The spoken command** (the PM's beat 6, verbatim): *"Create the quote. Also, text these buyers
   letting them know I set this up based on our chat today, and include the direct link."* A
   **permission card** names the quote write and the two messages. **Allow.**
9. **The result:** a **quote card** (the quote number, lines, the discount and a link) plus a
   **preview of the two messages** sent to Morton's buyers.
10. **The breadth moment** (from PAC UC1): *"You also talked to 9 other customers today. I've
    drafted 6 carts and 3 order templates the same way."* A per-client summary appears, and Aaron
    clicks **Approve all**.

#### Close (one click)

Claude: *"Want me to run this wrap-up every weekday at 4:30 and have it ready when you are?"* A
**Schedule card** appears. **Schedule.** The day ends with **four** agents in the sidebar. The story
comes back to where it started: the rep does the judgment, and Commerce does the rest.

#### Where it's visionary, and where it stays real

| Visionary (Salesforce · Headless 360 asks the panel can back) | Real (Cowork as it is, or close) |
|---|---|
| Commerce signals and at-risk scoring that an hourly agent can poll | Scheduled tasks with long prompts, run history, the Scheduled list |
| Policy-aware actions: margin floors, discount bands, approval routing | Permission cards (Allow / Deny) before every write |
| Personalisation: lookalike and complementary recommendations | Skills invoked by `/name` or a suggestion button |
| Quote, cart and order-template creation over MCP | MCP App widgets inside replies (product picker, quote card) |
| Buyer messaging (SMS or Slack) from Salesforce | The integrations timeline across Slack, Gmail and Commerce |
| Win-back campaign summary and dashboard data | Local files dragged in, the mic, macOS notifications |

#### What makes it more powerful (Claude's suggestions)

1. **Connect the acts.** Agents find Morton, the brief hands Morton off, and the wrap-up closes
   Morton. That makes one story, not three demos.
2. **Make the typing ladder visible.** Agent 1 is typed, Agent 2 starts from a pill, Agent 3 is a
   button, Act III is voice plus picks, and the close is one click. The room should notice the
   typing disappearing. That answers the feedback directly.
3. **The desktop earns its place.** Files come off the desktop, the notification banner is a real
   macOS notification, and the menu-bar clock moves time forward. None of that works in a browser.
4. **One moment where Claude pushes back** (Bergstrom's 12% versus the margin floor). It shows
   reasoning plus guardrails, which is what VPs worry about.
5. **End on numbers.** A final "today" card: *1 quote, 6 carts, 3 templates, $X pipeline, 872
   win-back quotes, 0 forms filled.* It makes the commerce outcome concrete.

### 4.5 Story planning decisions (Somnath, 2026-10-11, supersedes §4.4 where they differ)

§4.4 was Claude's first draft. Somnath wants the story told **from Aaron's point of view, as he
presents it**, built one agent at a time and ending with the multimodal chat. Decided so far:

1. **When:** PAC is Wednesday (strategic customers, about 15 minutes).
2. **The industry is networking hardware, Cisco-like.** Aaron's company sells Wi-Fi access points,
   network gateways, switches, routers, cabling and much more. It doesn't have to be Morton.
3. **The setup sequence matters most (the "wow").** Setting up an agent shows real on-screen
   process:
   - understanding the request
   - finding the right tools and integrations
   - grounding in the right Salesforce data
   - deploying the agent
   - one confirmation click to go live

   **The trigger is Salesforce data.**
4. **Each agent runs at a different time or cadence.** No setup needs to be long.
5. **Time passing is spoken.** Aaron tells the audience, *"I slept, woke up, and now I want to…"*,
   then opens a chat. There's no on-screen time machine.
6. **The daily brief is generic and connected to Salesforce.** It covers more than the agents'
   reports. The agents' work follows the brief. The kind of report depends on the agent: a
   week-long time-based agent gives a progress or check-in report, and the others need richer
   reports.
7. **Multimodal is its own chat.** Aaron says something like *"I visited a customer, they shared
   some things, here are my notes"*, or there was a Gong call. The client sends more later. Every
   file sits on the desktop and is dragged onto the prompt bar.
8. **Integrations go as wide as the story needs, and no wider.** Don't force-fit every possible
   integration.
9. **Keep the PM's good parts** (§4.3): the named skills, the product widget with quantities,
   complementary recommendations, the line discount, the spoken "create it and text the buyers",
   the message preview, the config card, the 7-day check-in with quick replies.

10. **The brand is "Ohana Networks".** It must be a **one-place change to Cisco**: the company name,
    logo and product names all live in a single brand config the build reads from.
11. **The hero customer is a commercial fit-out builder** with a simple, believable foreign brand
    name (pick pending).
12. **Agent 1 = Protect (threshold), trigger 1A:** supply risk on open carts, quotes and orders. It
    watches **every** account and **pulls strategic ones to the top**.
13. **The backtest is on the back burner.** The main flow comes first.
14. **There must be wow moments throughout.** Nothing should make the audience think "we can already
    do that in Cowork ourselves".
15. **The bar is a keynote.** The whole demo should feel like something MCB shows at Atlassian TEAM,
    Marc at Dreamforce, or Tim Cook at an Apple event. It's fine to inflate what's possible and go
    visionary. But wow moments must be **shown simply**: easy for the audience to understand, and
    never overwhelming.
16. **"Ohana" stays.** The Salesforce nod is intentional. Ohana Networks is the Salesforce customer,
    and the demo shows how **Ohana's sales reps** do their job better with Cowork + Salesforce.
17. **Ohana needs many customer accounts.** Reports, agent results and lists need several believable
    buyer names to swipe through. Brandt Bau (pending) is just the hero. The full list comes later.
18. **Agents live in Cowork**, because that's where their work is. They aren't "created and governed
    in Salesforce".
19. **Agents have semantic names.** "Delivery Guard" is in the right direction but not quite there.
20. **The live first sweep happens once**, during Agent 1's setup. It proves the agent works.
21. **Each agent starts in its own new chat.** Agent 2 doesn't come from a pill at the end of Agent
    1. **Claude recognizes when a request needs a long-running agent.** That's not the user's job:
    Aaron states the need, and Claude decides it needs ongoing work and proposes the agent.
22. **Prompts can be long and complex.** They describe an **outcome**. Cowork turns that into a
    long-running agent and **infers what needs to be done** for the seller to succeed.
23. **Happy path only.** There's no "this isn't something I can answer once" line. Claude simply
    sets up the agent.
24. **No real voice input.** It's too complex to build, so the typed → spoken → clicked idea is dropped.
    *Superseded in part by decision 31:* the multimodal chat **simulates** dictation once.
25. **The home screen is semi-dynamic** (Somnath will spec it). It's preloaded with dummy chats and
    projects, so Aaron looks like a regular Cowork user. Every new chat or agent gets added to it.
    Long-running tasks may get their own icon, perhaps a time-related one with a "Long-running
    task" tooltip (to decide).
26. **Agents 1 (Protect) and 2 (Grow) are fine as framed.**
27. **Agent 3 is the daily brief** (cadence, from Somnath's v1). Aaron sets it up himself. It covers
    his whole Salesforce book and rolls up what the other agents did overnight. The PM's 7-day
    win-back agent is dropped as an agent. Its check-in pattern and quick replies (Extend · Change
    discount · Stop) can live in Agent 2's morning update.
    - **Its wow moment is that it plans around Aaron's day.** It reads his calendar, chooses a start
      time so the brief is ready by 9, and puts meeting prep at the top.
28. **Long-running tasks get a clock icon**, a tooltip saying when the task runs, and a faint pulsing
    dot while it runs. The tooltips name **realistic Salesforce objects and fields** the agent wakes
    on, and can list several.
29. **The multimodal chat is completely separate.** No agent leads into it. It's built around **the
    PM's storyline** (§4.3 A), with ideas added, so the result feels like a team effort.
30. **The follow-up call comes through the Gong integration**, not a file on the desktop. It's a big
    deal for this audience. Claude pulls the call from Gong as one of the integrations, and the
    desktop files are the site notes, the floor plan and the photo.
31. **The multimodal prompt is "spoken" (simulated).** After the files are attached, Aaron clicks the
    mic and the words appear one by one, as if dictated. He talks naturally; the exact words don't
    have to match. Nothing is really recognized. **After that, no typing at all:** Claude's
    buttons, chips and questions carry every remaining step.
32. **The run of show is four steps.**
    1. Set up Agent 1, Delivery Watch.
    2. Set up Agent 2, Growth Scout.
    3. Set up Agent 3, Morning Brief. Aaron says "I slept, woke up…", and **the last agent delivers
       the daily brief.**
    4. A **new chat** for the multimodal flow (§4.6).
33. **The daily brief carries "Needs your attention".** It mixes items from each agent and from
    Aaron's general Salesforce book.
34. **Agent 1 needs a new name.** "On-Time Keeper" is out. "Growth Scout" and "Morning Brief" are
    fine.
35. **The brief's "Your day" becomes a "Today's meetings" list.** It has several meetings with
    light detail each, not one heavy prep card. Slack's Today briefing (§3.7) is a reference only.
36. **Agent 1 is named "Delivery Watch".** The three agents are Delivery Watch, Growth Scout and
    Morning Brief.
37. **Resolving the "Needs your attention" items is parked for later.** No counter and no
    "all caught up" yet.
38. **The daily brief stays available all day as an artifact.** It sits in Cowork's right-hand panel
    (and the sidebar's **Artifacts**), so Aaron can open it any time. The real app supports this
    (§3.3): the sidebar has **Artifacts** and **Scheduled**, the in-task right panel has Progress,
    Working folders and Context, and the live home screen already offers **"Get a morning brief"**
    and **"Send me a daily briefing"**. So a morning-brief agent is native Cowork.
    *Refined:* the brief lives in **Artifacts** (Somnath, 2026-10-11), not in the right panel.
39. **Agent 3 is set up from Aaron's prompt, not from an "Ideas for you" button.** Setting it up
    **builds what the brief needs**: the sections, the Salesforce sources, the calendar hook and the
    rules for what "needs Aaron". It ends by creating the **Morning Brief entry in Artifacts**. Only
    after that is there a button: the next morning Aaron clicks **Morning Brief** in Artifacts, and
    it opens the brief the agent produced.
40. **Every first, long setup prompt is "spoken"** (simulated dictation, as in decision 31). That's
    one per step: Delivery Watch, Growth Scout, Morning Brief and the Prestige quote. Only those
    opening prompts use the mic; everything after them is buttons, chips and Claude's questions.
    This extends decisions 24 and 31.
41. **Four interaction patterns are in** (§3.8, 1–4): result cards that grow in place in the
    integrations timeline; "3 things I'll do" on the agent card; **source chips**; "Always allow
    quotes under €X" on the permission card. Salesforce-side attribution (#5) is out.
    - **The source chip is Somnath's favorite.** It makes "Salesforce is the harness" visible.
42. **Minimal human intervention for connected sources.** Only **local desktop files** are dragged
    in by Aaron. Email, Slack, Gong, Calendar and Salesforce are reached **by Cowork itself**
    through its integrations. Aaron never attaches, forwards or pastes them.
43. **The brief has one home, the Morning Brief chat, with two doors** (Somnath, 2026-10-11; refines
    38–39). Morning Brief stays a long-running agent, set up by voice like the others. Each
    morning's run lands in its chat with the brief (the brief can still be an artifact, opened in
    the chat's right panel). The next morning, a **"Read today's brief"** quick start under the
    prompt box opens that chat; it's the stage trigger. The sidebar's Morning Brief row opens it
    too. **Artifacts is no longer a route to the brief.** *Still open:* does the quick start show
    only after the time jump, or always?
44. **The agents' home is an "Agents" nav item** (Somnath, 2026-10-11), in the live app's
    Scheduled slot, replacing Code (which lives in Home | Code). Not "Scheduled": Delivery Watch
    wakes on a Salesforce signal, not a clock, and the story calls them agents. Not a new
    "Workflows" section either; a right panel belongs to one chat. Icon: `ClockFading`, echoing
    the clock on each agent's row. It will list the three agents (name, when it runs, last run).
45. **Both Agents and Scheduled are in the nav** (Somnath, 2026-10-11; refines 44 and 43).
    - **Agents** uses the `Waypoints` icon (was `ClockFading`); Scheduled keeps the live clock.
    - **Delivery Watch and Growth Scout** start as a prompt in a new session, and **Claude chooses
      to create an agent** (decision 21).
    - **The brief is built from the Scheduled page's "Daily briefing" template**, the live app's
      own pattern (`docs/references/cowork/live-briefing-*.png`). We build on top of it: it's
      grounded in Salesforce data and the other agents' results, so it feels far more powerful
      because Salesforce, Gmail, Calendar and Claude work together.
    - **The brief is a scheduled task, not an agent.** The run of show is now **2 agents, 1
      scheduled task, 1 multimodal chat**. The brief's row gets the clock and lives on Scheduled.
    - **Agent sessions get one shared agent icon** in the sidenav once their prompt is sent. The
      Agents page shows the same agents with the same icon, so each agent's chat has **two doors**:
      the sidenav row and the Agents page.
46. **Tools always show in two groups** (Somnath, 2026-10-11). Wherever Claude finds or uses
    tools (agent setup, the brief, Prestige's timeline), the **Salesforce tools** are one step
    and the **other connectors** (Gmail, Calendar, Slack, Gong…) are a separate one, so the
    audience sees a powerful ecosystem working together, not one blob of "tools".
47. **The brief's Slack edit and Slack notification** (Somnath, 2026-10-12; replaces the spoken
    "I slept…" time jump).
    - After Claude shows the plan and the Schedule card, Aaron **types** "Send me a Slack when
      the brief is prepped" (or close to it). Claude thinks, rewrites the task's instructions
      and shows a **new Schedule card**; Aaron schedules that one.
    - Then Aaron opens a **new chat**. Under its prompt box is a **Daily brief quick action**
      (dropped by decision 54: the banner opens the brief).
    - **Ctrl+S** (the presenter's hotkey, no timer) pops a **macOS banner from Slack**, top
      right: Claude saying the daily brief is ready. Only Slack notifies; Claude doesn't.
    - Aaron: "Ahh, so my daily brief is ready." He clicks the quick action: Claude builds the
      brief, then shows it in Cowork.
48. **The brief is a proper report** (Somnath, 2026-10-12; supersedes §4.7's "3 things" headline).
    - Not a short "3 things to do today". It's a full brief: **metrics, a chart or two, tables**
      (pipeline, orders, today's meetings, what changed overnight, the agents' reports).
    - **A to-do list is one part of it**, not the whole thing.
    - **Aaron then acts on the to-do list** (pick for the demo, open):
      - save it **locally on his laptop** (Reminders, Notes or Tasks), or
      - **email it to his team**: Cowork finds his team's address and an **ongoing thread** it
        can reply on, rather than starting a new one.
    - §4.7's sections need redrafting to this shape before the brief is built.
    - **Build order:** the agents (or Prestige) first, the brief after the agents, so ideas from
      the agents' workflows can feed it (Somnath, 2026-10-12).
49. **A live agent shows its work as result cards, not a busy table** (Somnath, 2026-10-12).
    - The first sweep's table has no "what happens" column. Tables sit in the browser chat's
      Salesforce **MCP card** (borrowing from browser chat is fine): top rows inline, the
      expand / "View all" opens it **full screen** with every row and more columns.
    - Once started, the agent posts **3 result cards** on its own, **5s apart** (both agents; Aaron has little time to wait):
      enough for Aaron to say "it's working" and move to the next flow. Each is an MCP-style card
      whose › opens a key-value details table; talking to the agent is left to the end chips.
    - Each card pops a **Slack banner from Salesforce**, automatically (Aaron gets Claude's
      brief on Slack and Salesforce's updates there too). Only the brief's banner is Ctrl+S.
    - Buttons are 8px (`rounded-md`; `rounded-lg` is 16px in this theme); end buttons are outlined.
50. **Both agents lean commerce, and they're independent** (Somnath, 2026-10-12, after Aaron's
    prototype notes). The outcomes are orders, carts and quote-to-order conversion, not pipeline
    or "revenue at risk" on accounts. The two agents share no data, rows or hand-offs; each stands
    alone.
    - **Delivery Watch (built 2026-10-12): order to delivery.** Prompt: *"Watch every open order and
      cart for the next 60 days. If an order is going to ship late, stock runs short at a
      warehouse, or a cart stalls before checkout, investigate it using Salesforce data and fix
      what you can within our existing policies. | If a fix affects pricing, margins, or requires
      an exception, bring it to me with your recommendation and the evidence behind it."* Wakes on
      order, fulfillment and cart changes. The sweep lists **12 orders and carts** (ORD-/CART- ids,
      account, issue, value; $258,700). The sources are Order, FulfillmentOrder, ProductItem and
      WebCart. 9 fixes (split-ships, stock holds, reroutes, address fixes, checkout nudges); 3 need
      Aaron (an 8% cart discount, a competitor match on a cart, an order on credit hold). Report:
      $160K of orders saved, 5 orders back on time, 3 carts checked out, on-time 91% → 98%.
    - **Growth Scout (built 2026-10-12): win-back, quotes that become orders.** From Aaron's notes. Prompt
      (draft): *"For any account that hasn't ordered in 30 days, send them an approved quote for
      their most-ordered product. Set the quantity from their average order and apply 5% off. Run
      this daily for a week. Also build me a dashboard of quotes sent vs. orders they turned into.
      Then send me a summary so we can keep going or pivot."*
      - The agent card is his "Agent Configuration Card": **Trigger** (no order in 30 days, checks
        daily), **Action** (approved quote: most-ordered item, average quantity, 5% off),
        **Duration** (7 days), then Start agent (his "Deploy Agent").
      - Once live: a **dashboard card** with two KPIs, *Win-back quotes sent* and *Orders converted
        from quotes*, plus result cards with Salesforce's Slack banners (Flow 1's pattern).
      - **The one-week check-in** (dropped by decision 54: no day-7 jump): the demo fast-forwards 7 days. Claude posts the campaign
        summary: *"Your 7-day win-back agent has finished. We sent 872 quotes and won back 370
        accounts (42%), totalling $X. Extend it, raise the discount, or try something new for
        the 502 still at risk?"* Then quick replies: **Extend for 30 days** · **Change discount to
        10%** · **Stop agent**.
      - It replaces the $500K / top-20 / Opportunity goal. The brief's Growth Scout lines (23
        refresh quotes, $86K of $500K) need redoing to match when the brief is built.
    - **Aaron's other idea, "Daily Wrap-Up"** (today's emails and calls become active carts and
      order templates, with up to 5 "AI Suggested" add-ons; approve all, then text the buyers a
      link). **Noted only, not in the demo for now.** The scheduled task stays the daily brief,
      built from the Scheduled page as agreed (decisions 43, 47, 48); this doesn't replace it.
51. **Live agents' chat polish** (Somnath, 2026-10-12, after the Growth Scout build):
    - **No live dot on agent icons**, anywhere. "Live" is a "✓ Live" chip instead. On the right
      panel it sits beside the "Long-running agent" chip; on the Agents page it's on each built
      agent's bordered card, which stands apart from the template rows.
    - **Dashboards don't get lost in the chat**: the right panel's Dashboard section keeps the
      latest one, a click from full screen.
    - **Every dashboard has a full-screen page with real depth**, not just metric tiles: funnel,
      breakdowns, trends and account tables, using the browser chat's insight page.
    - **Each live agent ends its replies with 3–4 chips**, and each reply offers the others.
    - **The prompt bar teaches once an agent is live**: its placeholder cycles through short tips
      (what to ask it, how to change a rule).
52. **Agent replies that change the numbers show them on a dashboard** (Somnath, 2026-10-12):
    - Delivery Watch's report is a Salesforce dashboard card, not stats and a table: KPIs, at-risk
      orders through the day, and a full page (results, fixes by kind and warehouse, every
      action, what waits on Aaron). It's pinned in the right panel like Growth Scout's.
    - Changing Growth Scout's discount posts the win-back dashboard again with week 2 projected
      at 10% off (hatched bars, expected orders and value, price-against-floor guardrails). The
      panel always pins the latest dashboard.
    - The discount change is Aaron's own prompt, typed or dictated, not a chip: a chip offering
      "10%" would mean Claude already knew the number Aaron wanted. Extend and Stop stay chips.

53. **Artifacts panel, next best actions, KPI tiles** (Somnath, 2026-10-12, design feedback):
    - The right panel's first section is always **Artifacts** (as Claude calls it), in every
      session. In an agent's chat it groups into "From this agent" and "Other artifacts"; in a
      session with none of its own it lists them all, with the agent's name on each row. One row
      per dashboard (its latest version). Clicking one opens that agent's chat with the
      dashboard full screen, and an open full page refreshes as the agent posts a new version.
    - Every dashboard full page ends with a "Next best actions" row: 2–3 cards (icon, title,
      why, one CTA). A CTA closes the page and sends its prompt to the agent's chat.
    - The first sweep's stats use the browser chat's KPI tiles, not the plain stats strip.
    - Footers don't claim live updates where there are none ("so far today", "starts tomorrow").
    - Jump in rows: the hover corner is the tile's 8px plus the 4px inset (12px).

54. **The Morning Brief, as built; no day-7 jump** (Somnath, 2026-10-12; supersedes parts of 47,
    48 and 50, and §4.7's contents):
    - **No day-7 jump for Growth Scout.** It stays on day 1. Aaron's discount prompt ("change the
      discount to 10%") projects *this week* at 10% from tomorrow (~251 orders, ~$966K, against
      ~$774K at 5%). The "Jump ahead to day 7" chip, the Monday divider and the 872/370 check-in
      are gone. Extend and Stop stay available.
    - **Dates:** the demo is **Wednesday 14 October**, so day 1 of both agents is Wed 14 (Growth
      Scout until 20 Oct, Delivery Watch until 13 Dec). The brief is read the next morning,
      **Thursday 15 October**: it should feel like Aaron opening it the next day.
    - **The brief starts on the Scheduled page** (the native feature), not New session + mic and
      not a quick action in a new chat (replaces that part of 47). Daily briefing template →
      Claude runs `/schedule`, explains how scheduled tasks work (onboarding for the room) and
      asks 4 setup questions. Aaron answers with the in-chat mic, in one go.
    - Claude reads Salesforce first, then Calendar and Gmail, picks **8:30 AM** (first meeting is
      10) and proposes the Schedule card. Aaron's second dictation, "And Slack me when it's ready",
      updates it (the old card folds to "Updated below"; the new one adds the Slack step). Schedule
      ↵ creates it and lists it on the Scheduled page.
    - **One day, not split:** Ctrl+S runs it (the clock jumps to Thu 15 Oct, 8:52 AM), Claude's
      Slack banner pops, and a click opens the brief full screen. Contents: Today (needs you 7,
      won back yesterday, handled overnight, order value saved, orders by day), Needs you (7,
      tagged Delivery Watch / Growth Scout / Your book), Your meetings (4, with Salesforce
      context), Handled without you, then Next best actions.
    - **The to-do action (48's open pick):** email it to the team as a reply on their ongoing
      "daily standup" thread (Dana Whitfield, Marcus Webb, Jun Park), with Send. The other two
      actions: Prep me for Prestige at 11 (leads into Flow 4) and extend Hartwell's quote.
    - Run of show: the brief comes before Prestige.

55. **The Morning Brief, commerce-first; three instructions** (Somnath, 2026-10-12; supersedes the
    setup questions, the banner click, the contents and the actions in 54):
    - **Setup:** "A few questions to set up your daily brief:" is a **prompt template**, one line
      per answer (How often · Go through · Ready by · Give me, with greyed hints). It's never filled
      in. Aaron dictates the whole answer; Claude's next step is a **key-value table** of what it
      heard (as in the agents' flow), then the setup carries on (now also reading the B2B store's
      health and Slack reminders).
    - **Opening:** clicking the Slack banner doesn't open Cowork (it's Slack's). Aaron closes the
      banner, opens **Scheduled** and clicks the **Morning Brief** card, which opens the brief full
      screen once it has run.
    - **Contents, commerce-first:** a focused **Summary** (4 lines + KPIs); **Today's focus**, a
      6-item checklist with owners (2 for Aaron, 4 for the team) and source pills; **Accounts at
      risk** (4, $1.34M a year); **Store health: what to fix** (4 issues, ~$38K a week); **Your Slack
      reminders for today** (3); Handled without you and orders by day.
    - **The to-do list goes to the team** via Slack (#ohana-sales-team, owners tagged) or is pushed
      to **Asana** (Ohana Sales project, due today): next best actions and chips.
    - **"Prep me for Prestige" is gone** (too thin), and so are Email my team and Extend. Instead
      Aaron dictates **three instructions** from the brief's data: approve Hartwell's quote with a
      5% promo; put AP-7 back in stock on the store from Leeds; hold Halden & Rook's cart price
      till Friday and nudge their buyer. **Claude just does them** (no confirm card): 3 writes,
      3 action cards, "3 of today's 6 focus items are cleared". Flow 4 starts on its own.
    - **Follow-ups (same day):** Push to Asana / Open Slack buttons on those groups; store-health
      areas link to Salesforce, with a Fix issue button per row; every reply ends with suggestions,
      and a chip once used doesn't come back; after the run, New's Jump in list gets a Daily brief
      row on top (above a hairline) that opens the brief.
56. **Prestige: Claude builds the cart; some things by itself, some with Aaron's OK** (Somnath,
    2026-10-12; supersedes §4.6's widget, discount fork and permission card). Wed 14 Oct, just off
    a call: Aaron's notes, the floor plan and a photo on the desktop, Tom's emailed requirements,
    the call on Gong. Starts from New (decision 57); Aaron drags files onto the prompt box.
    Claude reads every source, then works three ways: **done from your sources** (cart rebuilt to
    the floor plan, ship-to address, draft quote); **needs your OK**, as approval cards (2 more APs
    that unlock free pre-configuration; buyer access with PO terms); **done as you asked**, by
    short back-to-back dictations (match the other vendor and send; add 2 buyers; a reorder list;
    the phase 2 quote). Receipt: ~6 min against ~3 hours + ~3 days. Then "Did Prestige accept?"
    leads to the order. Prices in $, to match the other flows. **Run of show (Aaron):** brief
    first, then Prestige, then the agents.
    **Revised 2026-10-13 (Somnath; supersedes the three ways above):** a slightly longer prompt
    (move-in 3 Dec, quote to Priya today). Claude pauses on Gong (a progress bar with reading
    states, then 5 moments) and Tom's email shows 2 attachments, a newer floor plan (rev B, so
    20 APs) and a requirements sheet. Claude then pins a collapsible plan above the prompt bar:
    8 tasks it does on its own (cart + quote, contacts, access, address, stock, reorder list,
    phase 2 quote, a Slack reminder for Fri 16 Oct, set via the Slack integration, with Slackbot's banner straight away), then 4 that need Aaron, one at a time, dictated and clicked (price match,
    UPS, Marta's PO terms, send the quote). New file chips with a page illustration. The right
    panel's progress groups them as Claude's tasks, then Your decisions.
57. **Where each session starts; the run of show** (Somnath, 2026-10-13; supersedes the
    four fixed rows of §8 item 8, and Aaron's brief-first order in 56). Agents don't start
    from the Agents page: the wow is Aaron writing a goal and Claude working out on its own
    that it needs a long-running agent. So the sidenav opens with just the 2 agents'
    "New session" rows, and each row's mic dictates only its own goal (no surprise prompt).
    Prestige starts from New (files dropped in) and the brief from Scheduled; each gets a
    named row on top of the chat list, newest first. Run of show: Prestige, Delivery
    Watch, Growth Scout, then the brief. Prestige is dated Wed 14 Oct (the demo day); its
    Slack reminder is for Fri 16 Oct, set through the Slack integration (a Slack action
    card), and Slackbot's banner confirms it straight away.
58. **Prestige becomes Canary Wharf Workspaces; four touches** (Somnath, 2026-10-13). A famous
    London name for a London audience: **Canary Wharf Workspaces** (not the real Canary Wharf
    Group), "Canary Wharf" for short, #canarywharf-manchester, "Canary Wharf call notes.txt".
    The session id stays `prestige`. (1) Claude searches Gmail for Tom's email (labels in
    turn), reads it, then the 2 attachments land one at a time before Slack. (2) After the
    quote email, Priya accepts on her own a few seconds later: Salesforce's Slack banner, then
    the order card (no "Did … accept?" chip). (3) "What would 5% off the licences come to?" ends
    on a one-click choice (new ChoiceCard): match $410 ($14,160, recommended) or 5% off the
    licences ($14,180); either leads to the UPS card, and saying "Match them…" answers it too.
    Later replies, the email and the order no longer quote a total, so every path reads right.
    (4) The cart table ends on a Total row ($14,360). (5) Under the price ask, a Gong tile
    quotes Priya's words at 23:14; the timestamp plays the clip. The receipt's tiles go 2 a row.
    (6) Every Salesforce write is shown: "Writing to Salesforce" timelines (the cart and quote,
    Claude's 6 tasks, each decision) whose records land one at a time with object, record and
    fields, 42 records in all.
59. **Growth Scout recommends products, in two tiers** (Somnath, 2026-10-13, from the PM: "intelligent
    recommendations of products they might like" to grow revenue). The chat isn't long-running,
    so recommendations ride on the commerce outcome. (1) **In every quote email:** one more
    product the account is likely to add ("Also picked for you"), from renewals, bought-together
    and end of support. It's in the email, never on the quote and never discounted, so it needs
    no OK; a sample email shows it, the table has an "Also picked" column, and Tavistock adds its
    licence renewal live. (2) **For the quotes that need Aaron:** one at a time, a recommendation
    card with an info note on why (a line each, with its source) and **Add and send** or **Send
    without it**; either writes to Salesforce and moves on. Corran: SFP+ optics; Mistral: RT-5
    guest routers; Brockley stays held with nothing suggested. (3) The dashboard and the 10%
    projection count add-ons: ~$1.07M (~$105K from add-ons).
60. **The brief shows its writes; one ask from overnight, one click** (Somnath, 2026-10-13, from the
    Canary Wharf patterns). The agents' job is to work while Aaron is away, so the brief must not
    turn back into a chat. (1) Every change Claude makes from the brief (the three dictated
    instructions, the Fix issue buttons) plays as a "Writing to Salesforce" timeline with its
    records. (2) The one-click choice isn't Claude asking back: it's the one decision the agents
    held overnight (Delivery Watch: split Whitcombe Schools' shipment, +$85 freight). One click,
    the records land, and the agent takes it from there without coming back to Aaron.

### 4.6 The multimodal chat, flow v2 (Claude's draft, 2026-10-11, built on the PM's story)

Beat labels: **[PM]** is the PM's Use Case 1 (kept in her order, with her skill names and her
lines). **[S]** is Somnath's v1 Act II. **[new]** is added in planning. Numbers are illustrative;
we'll lock them at build. The customer is **Prestige Workspaces**: a coworking operator
opening a 3-floor site in Manchester. The buyers are **Priya** and **Tom**.

**Aaron to the room:** *"Yesterday I walked Prestige's new Manchester office. We had a follow-up
call, and they've sent me a floor plan since. Normally, turning that into a quote is my evening."*

1. **[S] Drop the context.** In a new chat, Aaron drags three desktop files onto the prompt bar:
   `Site visit notes.txt`, `Prestige_Floorplan_L1-L3.pdf` and `Comms room.jpg`.
2. **[PM + new] The spoken prompt (simulated dictation).** Aaron clicks the **mic** in the prompt
   box. It turns into a live recording state, and the words **appear one by one** as if dictated.
   Aaron talks freely on stage; the screen shows the scripted text, roughly:
   > *"Okay, I just got back from Prestige's new Manchester site. Here are my notes, their floor
   > plan and a photo of the comms room. We also had a call on Gong on Tuesday. Draft a quote for
   > Prestige based on our discussions over the last couple of days, and get it ready for them to
   > approve."*

   He clicks send. Claude picks the PM's **`/draft-quote`** skill itself, and that's the first step
   in the timeline.
3. **[PM + new] The integrations timeline.** `/draft-quote` orchestrates:
   - **`/summarise-product-requests`** across the **3 files**, **Gong** (1 call, Tue, 38 min, read
     with Gong's trackers), **Slack** (#prestige-manchester), **Gmail** (3 threads) and Salesforce
     activity
   - **`/cart-management`**: Priya already has **12 × AP-7** in a cart on Ohana's B2B store
   - **`/personalised-recommendations`**: Prestige's browse, search and order history, plus
     lookalike accounts
   - plus Commerce reads: installed base, the contract, price book, inventory

   It ends with *"Used 6 integrations · 27 steps."*
4. **[S + new] "What I found."** One headline, then three lines (floor plan, Gong, photo), each with a tiny visual:
   - **Floor plan:** *"2,400 m² across 3 open floors needs **18 access points**. The cart has 12."*
     (a mini floor plan with access-point dots)
   - **Gong:** *"At **14:32** Priya mentioned **40 security cameras in phase 2**. That isn't in any
     email or sheet, so I've sized the switches to power them."* **▶ Play this moment in Gong**
   - **Photo + installed base:** *"Their comms room already has **4 × SW-24** switches, bought
     through a reseller, so they aren't in their order history. Reusing them saves Prestige
     **€18K**."* (the photo with the labels highlighted). **Kept** (Somnath, 2026-10-11). Keep the
     beat fast: one line plus the photo.
5. **[PM] The product list widget, already filled in by Claude.** Every row has a quantity stepper
   and a source tag: *From floor plan · From Gong · In cart · **AI Suggested***. The AI Suggested
   items come from Personalisation, e.g. *"Coworking operators with 3+ sites add a guest Wi-Fi
   licence."* Aaron tweaks one quantity, skips one suggestion, and clicks **Add to quote**.
6. **[PM] Complementary products** (a chip with her line): *"Suggest a few complementary products
   that can be added to the quote."*
   - **`/quote-initiation`** shows the quote's state.
   - **`/complementary-product-recommendations`** suggests **Ohana Cloud licences** (one per access
     point), **mounting kits** and **SFP+ optics**.
   - Aaron adds the licences and the kits.
7. **★ [new] The contract threshold, the Salesforce-only wow.** `/quote-initiation` notices:
   *"€49.1K. Prestige's **Partner Agreement** gives orders over **€50K** free staging and
   pre-configuration (worth €3.6K). The two corner meeting rooms on L2 are thin on coverage
   anyway. Add **2 × AP-7 (+€926)** and they qualify."* Aaron clicks **Add 2 and qualify**.
8. **[PM + S + new] The discount: Claude asks instead of Aaron typing.** Claude uses Gong's
   competitor tracker: *"Prestige said a competitor quoted €410 per access point. Want to sharpen
   it?"* It offers buttons:
   - **5% off the licences** (within policy; beats their quote, and it's the PM's discount)
   - **5% off the whole quote** (needs manager approval)
   - **No discount**

   It marks the first as recommended. Aaron clicks it, and `/quote-initiation` updates the line.
9. **[new] The delivery promise.** *"Move-in is 3 Dec (from your notes). 14 units ship from
   Manchester and 6 from Rotterdam. **Everything arrives by 24 Nov, pre-configured.**"*
10. **[PM] Create and send, as one button.** Claude: *"Ready. Should I create the quote and let
    Priya and Tom know?"* The button carries the PM's intent: **Create the quote and text the buyers
    with the direct link**. It comes with a draft of the message (*"set this up based on our chat
    today…"*) that Aaron can tweak inline. Clicking it opens a **permission card** listing *create
    the Quote in Salesforce* and *send 2 Slack messages*. **Allow.**
11. **[PM] The result.** A **quote card** (the number, the lines, the discount, staging, delivery
    and a link to the store), plus **previews of the Slack messages** to Priya and Tom.
12. **[S + new] Close the loop.** Aaron to the room: *"A few minutes later…"* He clicks the chip
    **"Did Prestige respond?"**. Claude checks Slack and Commerce: *"Priya replied 'Perfect,
    approving now' and accepted the quote on the store. It's now **Order #00041872**, delivery
    24 Nov."*
13. **[new] The receipt.** *"Done in 4 min · usually about 2½ hours."* A summary card shows: 3 files,
    1 Gong call, 4 channels → 1 quote → 1 order, €47.6K, staging included, on time for move-in.

**How it answers the four tests:**
- **Wow moments:** one per source: the floor plan, Gong, the photo with the installed base, and the
  Salesforce contract.
- **Hours of manual work:** made visible by the receipt.
- **A commerce action:** the quote is created, accepted, and becomes an order.
- **Not doable with GPT alone:** the cart, installed base, contract, price policy, inventory, and
  the quote and order writes all come from Salesforce.

### 4.7 The Morning Brief, contents v1 (Claude's draft, 2026-10-11)

> **Superseded by decisions 48 and 54:** the brief is built as a full report (Today, Needs you,
> Your meetings, Handled without you, Next best actions), read on Thursday 15 October. See
> `src/desktop/cowork/chat/scripts/brief.ts` and docs/cowork-demo-flows.md Flow 3. Kept below as
> the v1 draft.

This is the payoff of step 3, after Aaron tells the room he went home, slept and came back at
9 AM. In the sidebar's **Artifacts**, the **Morning Brief** entry the agent created during setup
(decision 39) shows *Ready · 8:31 AM*. Aaron clicks it. Order of sections
(draft):

1. **The headline:** *"Good morning, Aaron. **3 things need your attention.** 19 handled
   overnight."*
2. **Today's meetings** (Calendar plus Salesforce, decision 35): a light list. Each row has the
   time, the account, **one line of Salesforce context**, and a **Prep me** button that expands a
   short prep.
   - 10:00 Brandt Bau · *access-point delivery fixed overnight*
   - 11:30 Forecast call with manager · *$86K of the $500K goal committed*
   - 14:00 Northgate University · *optics on allocation, decision below*
   - 16:00 Hartwell Hospital · *€210K quote expires Friday*
3. **Needs your attention (3).** A mix, with outcome-named buttons and a label saying where each
   came from:
   - **Delivery Watch:** Northgate University's optics are on allocation. **Split the shipment**
     (recommended) · **Upgrade the optic (+4%)**
   - **Growth Scout:** 23 refresh quotes drafted. **Approve all 23** · **Review**
   - **Your book:** Hartwell Hospital's €210K quote expires Friday, and the buyer viewed it 4 times
     yesterday. **Extend 14 days** · **Nudge the buyer**

   *(Resolving these is parked, decision 37.)*
4. **Handled overnight (19)**, collapsed: quotes extended within policy, stalled carts nudged, POs
   chased, deliveries fixed, a renewal flagged.
5. **Agent reports**, one labeled section each (the Lindy reply shape, §3.6):
   - *Delivery Watch · woke 3× overnight* (first at 2:14 AM, on a FulfillmentOrder change): what
     it did.
   - *Growth Scout · day 1:* the goal bar goes from $520K confident to **$86K committed**, and
     the overnight surprise: *"Brandt Bau won the **Leeds** HQ tender last night (in the news, not
     yet in Salesforce). I've drafted a kit from their last 3 fit-outs: $118K."* **Open draft**
   - Clicking an agent's label opens that agent's own chat with its run history.

**General patterns to carry (from §3.1):**

- **One long, outcome-first prompt** with many sources, several outputs, a guardrail and timing.
- **Several integrations in one task**, shown on the integrations timeline. Salesforce Commerce
  is one of them, next to things like Slack, Gmail, Calendar and Drive.
- **Local files** dragged from the desktop into Cowork, and outputs written to the working folder.
- **A scheduled follow-up** with its own long prompt, approved through a Schedule card.

---

## 5. Switching browser ↔ desktop: a floating toggle

Somnath's call (2026-10-08): a **floating toggle**, not an in-story control. **Built 2026-10-11**
as an icon-only, *vertical* pill (globe over laptop) with labels in tooltips. **Moved
2026-10-11 to the bottom-right corner** (16px up, its bottom aligned with the Cowork window's; 8px from the right) (empty in the browser chat, below the
icons column on the desktop), superseding the placement below. It uses the `#desktop` hash. Shortcut, hide and crossfade are not built. Original proposal:

- **Placement:** fixed at the bottom-left, a bit above the sidenav footer (about 16px from the
  left, 72px from the bottom), so the account row in the browser view stays visible. It stays in
  the same spot in the desktop view, where the Dock is centered and leaves the corner free.
- **Look:** a small segmented pill, **Browser** (globe) | **Desktop** (laptop), with the active
  side filled. Translucent glass, about 32px tall. It reads as a demo control above both views.
- **Behavior:**
  - A keyboard shortcut (for example ⌃⌥D) for presenting.
  - The view is kept in the URL (`#desktop`), so a reload or a shared link opens the same view.
  - A way to hide the toggle for clean screenshots.
  - About a 400ms zoom-and-crossfade between views.
- **Watch:** a long recent-chats list could slide under the toggle. If so, pad the list's bottom.

---

## 6. Open questions

- **The unified storyline v2** (§4.4) needs Somnath's edit. Decisions inside it:
  - **Audience.** The PAC doc says strategic customers in London, 15 minutes. The Wednesday panel
    is VPs and Directors. Is it the same demo for both?
  - **Morton's object:** a quote (the PM) or a cart and then an order (v1)? v2 uses a quote for
    Morton and carts plus templates for the other clients.
  - **Buyer messages:** SMS (PAC) or Slack (the PM)? v2 suggests sending from Salesforce, so it
    counts as a harness action.
  - Is the deck from v1's Act II dropped? v2 uses a voice memo, a photo and a spreadsheet.
- **The story** (§4). Still open from v1:
  - Is Aaron the seller on screen (name in the account row, his Mac)?
  - Aaron's company, what it sells, and which strategic or top-20 accounts. Alpine / Morton
    again, or new?
  - Act II's placeholders: the customer, objective, items A, B, X, Y and Z, and the decision.
  - The Act II files: what's in each one, and how the voice note comes in (dropped as a file, or
    recorded with the mic).
  - How "time passes" in Act I is shown, so the agents can be seen firing.
  - Whether the acts connect (for example, Act II's customer is one the agents flagged).
- **How Cowork differs from the browser app.** Somnath will name these as we build. Candidates
  from the research: the right-hand Progress, Artifacts and Context panels, the "Work in a project
  or folder" and "Ask" tray under the prompt box, the integrations timeline with brand icons, and
  schedule cards.
- **Desktop contents.**
  - The wallpaper and the file and folder icons. Somnath supplies these; ask when the build
    needs them.
  - The menu bar items.
  - The apps in the Dock (the Dock is secondary).
  - Which files and objects sit on the desktop. What clicking, double-clicking and dropping
    each one into Cowork does.
- **The rep.** Name, company, what they sell, and whether they're the same person as Aaron from the
  browser journeys. This decides the desktop files, the wallpaper and the Dock apps.
- **Window behavior.** Can the window be dragged or resized, or is it fixed at 75%? Do the
  traffic lights do anything (for example, minimize to the Dock)?

---

## 7. Not doing

- Pure HTML/CSS/vanilla JS.
- A new repo, unless the vision later needs its own handoff or URL.
- Pages deployment, for now.
- A browser window on the desktop (§2.7).
- Dark mode **for the Cowork app** (§2.11). The macOS chrome (menu bar, menus) *is* dark mode.

---

## 8. Build progress (handoff)

**Read this first in a fresh session.** Branch `cowork-desktop`. **PAC demo is Wednesday
(2026-10-14).** **v14.0.0** (2026-10-12) is committed on `cowork-desktop`: the Artifacts panel and next best actions (decision 53), and the **Morning Brief** built end to end with Growth Scout's day-7 jump removed (decision 54). **v15.0.0** (2026-10-12) reworks the brief per decision 55 (template + answers table, commerce contents, Slack/Asana hand-off, Fix issue, three dictated instructions, Jump in entry; the banner no longer opens it). **Prestige is built per decision 56, revised 2026-10-13 (uncommitted, Unreleased):** file drag-drop with new file chips, Gong listening, Tom's attachments, the pinned plan (8 tasks on its own incl. a Slack reminder, 4 decisions one at a time), approval cards, receipt. Not merged or pushed. v11.9.0 is on `master` and origin. Flow charts of every demo flow: `docs/cowork-demo-flows.md`. Ask before committing; never push unasked.

**How Somnath works on the build:** one piece at a time, only on instruction ("don't just go on
building everything"). Somnath sources images and icons on request; Claude puts them in the right
`src/assets/desktop/` folder and renames them. Verify visually with a headless Chrome screenshot
(the browser MCP can't open localhost):

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --force-device-scale-factor=2 --window-size=1512,982 \
  --virtual-time-budget=3000 --screenshot=/tmp/mb/x.png "http://localhost:5173/#desktop"
```

(Dev server: `npm run dev -- --port 5173`. No lint script; check with `npx tsc -b --noEmit` and
`npx vite build`. To capture an open menu, temporarily flip `menuOpen`'s initial state to `true`,
screenshot, then flip it back. Headless shots freeze the window's open animation (it looks
translucent pink): strip `animate-window-open` from `CoworkWindow` for the shot, then restore it.
For interactions, back up `index.html` to /tmp, inject a `/*TMPAUTO*/` auto-click `<script>`
before `</body>`, screenshot with a longer `--virtual-time-budget` (and query params if needed),
then restore it and check `grep -c TMPAUTO index.html` is 0. CDP over a node WebSocket hangs, so
don't use it. `animationiteration` doesn't fire under virtual time; drive animation from timers.)

### 8.1 Built so far (2026-10-12, v11.9.0)

1. **Browser ↔ Desktop toggle.** `src/Root.tsx` switches between `App` (browser chat) and
   `src/desktop/Desktop.tsx` using the `#desktop` hash. `src/shell/ViewToggle.tsx` is the
   floating vertical icon-only pill, bottom-left (§5).
2. **Wallpaper.** `src/assets/desktop/wallpaper.jpg` (Somnath's Big Sur image, 3456px wide).
3. **macOS menu bar** (`src/desktop/MenuBar.tsx`, glyphs in `menubarGlyphs.tsx`). **Dark-mode
   glass** (black/32% + blur + saturate; Somnath: "love what you've built"), 32px, SF font stack,
   medium-weight labels and clock, bold "Claude". Left: Apple · **Claude** · File Edit View Go
   Window Help. Right: **Agentforce** (Somnath's real mascot PNG, full color; **commented out for now**) · **Salesforce** (the
   real cloud logo PNG, full color; both in `src/assets/desktop/menubar/`) · Wi-Fi · battery · Spotlight · Control Center ·
   live clock. **Every item has a hover pill** (white/15) and does nothing on click.
4. **The Claude app menu** (`src/desktop/AppMenu.tsx`). The only menu that opens: click
   "Claude" to toggle; click away or Esc closes it. Matches Somnath's screenshots: About Claude |
   Settings… ⌘, · Check for Updates… | Services › | Hide Claude ⌘H · Hide Others ⌥⌘H · Show
   All | Quit Claude ⌘Q. Neutral dark panel (#2f2f31 at 93% + blur), hairline separators, dimmed
   shortcuts, macOS-blue hover (#3d7bd9). Items are inert. Copy is in
   `copy.desktop.menuBar.appMenu`.

5. **Cowork window frame** (`CoworkWindow.tsx`, `TrafficLights.tsx`): nearly full screen (16px margins, icons column clear), 24px radius, 40px title strip,
   active/inactive lights and shadows, hover glyphs, open animation. Body empty.
6. **Desktop icons column** (`DesktopIcons.tsx`): the 3 step-4 files as Finder-style previews; select,
   deselect, focus hand-off, draggable. The photo is a stand-in.

7. **The Cowork app, rebuilt for the window** (Somnath: not the browser app resized; reuse its
   components, icons, colors and states unless he says something differs). So far: a hairline under
   the title strip and the sidenav (`src/desktop/cowork/CoworkSidebar.tsx`), matching the browser's.
   Main stage empty. **Differences named so far:** the header is collapse · search · back · forward,
   then Home | Code (no wordmark, no search field); the footer is "Aaron · email" at 13px with no
   download button; UI text runs **13–14px** (the `--text-ui` token is 14px inside the window); sidebar rows are 28px (`--spacing-row`).
8. **The four sessions in the sidenav** (Somnath, 2026-10-11). The run of show's four steps (Delivery
   Watch, Growth Scout, Morning Brief, the Prestige chat) are fixed rows on top of "Chats and
   tasks", above the dummy past chats, as the browser does with its journeys. Each reads **"New
   session"** until its prompt is sent, then retitles like a fresh chat (a spinner, then the title
   types in). Then each gets its kind's icon with a when-it-runs tooltip (decisions 28, 45):
   Waypoints for the two agents, a clock for the brief (a scheduled task); the Prestige one stays a plain chat, "Prestige Manchester site quote". Sending from New starts the
   next session in order.
9. **Dictation, as in the live desktop app** (Somnath's screenshots, 2026-10-11). The mic ("Dictate"
   tooltip below) opens the recording state: a waveform that **streams right to left like a recording** (dots when quiet, bars while
   speaking) and bordered **Cancel ✕ / Done ✓** in place of model · mic · send. No "Listening…" state, just a
   short beat before the first words. Unlike the live app, the scripted words **stream into the
   box while recording, as ordinary prompt text**, a word or a few at a time, with a breath after
   each sentence and **one longer hesitation** per prompt, where someone would go "umm… and
   also". **Done** keeps the text and send turns orange; Cancel clears it. (2026-10-12: the recording now ends by itself after the last word, as if Done were clicked, so no click is needed.) The scripts are the
   §4.2 agent prompts and the §4.6 Prestige prompt (decision 40).

10. **Settings modal** (`src/desktop/cowork/settings/`): General, Skills and Connectors panes, from
    the account menu's Settings. **Start state** (`CoworkHome.tsx`): greeting, prompt box with
    Chat | Cowork, the Salesforce banner (Explore is inert), and four "Jump in" quick starts.
11. **Agents and Scheduled in the nav** (decision 45). Agents uses `Waypoints`; each opens its page. Session rows show their kind's icon once started: Waypoints for the agents, a clock for the brief.
12. **The Scheduled page** (`ScheduledPage.tsx`): serif title, `/schedule` hint, search field, black
    New task, then the six templates (hover wash, ＋, a tilted preview card). The wavy divider waits
    behind `HAS_TASKS` for the first created task. Inert.
13. **The Agents page** (`AgentsPage.tsx`): the same frame, lighter: `/agents` hint, search, New agent
    and four generic quick starts (hover wash only). Created agents get listed above them later.
    Rows and search are shared (`TemplateRow.tsx`, `PageSearch.tsx`).
14. **"Claude" in the window title bar**, SF Pro semibold, next to the traffic lights.
15. **The Slack banner** (`SlackBanner.tsx`, decision 47): dark-glass macOS notification, top right,
    "Good morning, Aaron ☀️ / Your daily brief is ready." The presenter pops it with **Ctrl+S** (no
    timer); a ✕ on hover closes it. Not yet tied to the brief being scheduled.

16. **The Delivery Watch chat** (v12.0.0, `src/desktop/cowork/chat/`, decision 49): Cowork's own
    store and blocks; the agent statement, `/agents`, the Headless 360 integrations timeline, the
    stats "wow", the at-risk table in a Salesforce MCP card (full screen), bold fix/needs-you
    lines, one agent card (Start ↵ / Cancel Esc) that folds to an expandable "Created agent" facts
    table, the right panel (Live agent chip; Progress, Working folder, Context with Sources first),
    three timed result cards with Slack-from-Salesforce banners, and two scripted chips (report,
    tasks that need my input). Since 2026-10-12 (after v12.0.0) the story is commerce-led (orders and carts, decision 50). Dictation auto-finishes; every prompt box defaults to Opus 5.5.
    Screenshot hacks (`?auto&go&ff&fs`) are described in the 12.0.0 session; always restore them.

### 8.2 Likely next pieces (Somnath picks; don't start unasked)

Order agreed 2026-10-12: **the agents (or Prestige) first, the brief after the agents** (ideas from
the agents' workflows feed the brief).

- ~~**Growth Scout's chat**~~ (built in v13.0.0, 2026-10-12): the win-back agent in decision 50.
  It lives in `scripts/growth.ts`, with `DashboardCard` added. The 7-day fast-forward is a "Jump ahead to day 7"
  chip plus a divider.
- **Prestige**, the multimodal chat (§4.6).
- ~~**The brief**~~ (built 2026-10-12 in v14.0.0, decision 54; reworked per decision 55 in v15.0.0):
  `scripts/brief.ts`, ScheduleCard, TemplateCard, AnswersCard (QuestionsCard is gone), the in-chat mic (`dictations`), the Scheduled page's task card, the
  Ctrl+S run (`runTask`) and the Thursday 15 October clock.
- A pulsing running dot on the agent rows.
- Maybe revise the Delivery Watch prompt (still the generic "strategic accounts" v1).
- Secondary: the Dock; toggle extras from §5 (a ⌃⌥D shortcut, a hide option, the crossfade).

### 8.3 Assets Claude asked Somnath for

- ~~The real **Agentforce** mark~~ (received 2026-10-11, plus the Salesforce logo). Still open: a
  **Claude** menu-bar icon (monochrome) → `src/assets/desktop/menubar/`.
- Real SF-Symbol Wi-Fi, battery and Control Center glyphs (optional) → same folder.
- The **Comms room photo** (a real comms-room/rack shot) → `src/assets/desktop/icons/`. The .txt and
  .pdf icons are drawn as Finder previews, so file-type icons are only needed if Somnath prefers them.
- Dock app icons (Finder, Claude, Slack, Chrome, Mail, Calendar) → `src/assets/desktop/dock/`.

### 8.4 Open threads from the story planning

- Source chips everywhere (spec cards, found lines, quote lines)?
- ~~Step 4: should "Did Prestige respond?" become Claude reporting the reply on its own
  (decision 42)?~~ Yes: Priya's acceptance now arrives on its own (decision 58).
- Later: Ohana's customer list; lock the Prestige numbers; verify the Salesforce field names in
  the wake tooltips; a "one more thing" finale.

### 8.5 The live app's scheduled tasks (Somnath's screenshots, 2026-10-11, evening)

Screenshots: `docs/references/cowork/live-scheduled-01.png` to `-07.png`. The eighth (Edit scheduled
task) expired before it could be saved and is described below.

- **Scheduled page:** serif title with a `/schedule` hint, search, "Sort by Next run", and a
  **New task** menu (Create with Claude / Set up manually). Empty state: a stopwatch, a wavy
  divider, and a grid of 6 templates. Hovering a template shows ＋ and a preview card (Daily
  briefing previews **"Today's brief"**, which backs our quick-start wording).
- **Creation chat:** "Loaded tools, loaded a skill" → an explanation → a question form → "Ran a
  command" → "Creating scheduled task…" → the **Schedule task card**: clock · title, a one-liner,
  timing plus a location chip, **Details** (the full instructions), and **Schedule ⏎ / Cancel Esc**.
  Once scheduled it collapses to "Created scheduled task: …". The right panel shows Progress,
  Working folder and Context.
- **After creation:** the sidebar gains a **Scheduled** caption section (with a New badge, later
  "One-time") above **Pinned**, then **Chats and tasks**. The row's icon is on the **left**; a blue
  dot marks unread, a hollow grey dot idle. The page's task card has a green schedule chip and an
  amber **"Only on this computer"** chip, plus the banner "Tasks set to run on your computer only
  run while it's awake and online" with a Keep awake toggle.
- **Task detail page:** edit (pencil), delete, and a black **▶ Run now**.
- **Edit scheduled task modal:**
  - Fields: Name\*, Description\*, Instructions\*. The Instructions box has a footer: "Work in a folder" · "Default model ▾".
  - **Frequency:** Daily ▾ + 09:00 AM. Time-based only, with no event triggers.
  - **Permissions:** "Automatically approve ▾", with the note "Claude will work and use connectors
    without pausing for approval. See safe use tips".
  - **Run at exact time:** a toggle, off by default (runs start at a random time a few minutes off schedule).
  - **Only on this computer** (Advanced): a toggle, with the note "Where a task runs can't be changed after it's created".
  - Footer: Cancel / **Save** (black).

**What Claude proposed (not decided):** Name / Description / Instructions map to our title /
schedule one-liner / dictated prompt, so the card's Details needs no invented content. Agents run
in the cloud (the default; "Only on this computer" is opt-in), which keeps the overnight story
consistent. Showing "Automatically approve" makes the agents' autonomy visible, alongside the
prompt's own escalation line. "Run now" on the Morning Brief page could replace the time jump. The
Edit modal isn't needed unless we want to open an agent's settings on stage.

**Open questions for Somnath** (asked 2026-10-11, unanswered):
1. Add both an Agents nav page and an "Agents" sidebar section above Recents (it appears when the
   first agent is scheduled, with a New badge)?
2. Put the clock on the **left** of the agent rows, as in the live app?
3. Cloud-run agents, so no "Only on this computer" chip?
4. On the Agents page, keep the template grid under our three agents, or show only ours?
5. Delivery Watch's "Wakes on FulfillmentOrder status changes" isn't a native frequency: keep the
   event trigger as our addition, or change it to Hourly?
6. Should the Schedule card's Details show the Permissions line ("Automatically approve" plus the note)?
7. The brief's way in: **Run now** on the Morning Brief page, or the "Read today's brief" quick start
   (shown always, or only after the time jump; see decision 43)?
