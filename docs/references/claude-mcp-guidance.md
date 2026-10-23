# Claude — building & MCP-app design guidance (reference)

Verified links to Claude's official guidance, plus the parts that bear on what we
build here. Fetched and distilled 2026-10-01. When in doubt, open the source.

## Source links

- **MCP Apps design guidelines** — https://claude.com/docs/connectors/building/mcp-apps/design-guidelines
- **Build for Claude (overview)** — https://claude.com/docs/build/overview
- **MCP Apps Figma UI kit** (official components/patterns) —
  https://www.figma.com/community/file/1597641111449594397/mcp-apps-for-claude
- **Transparent theming** (apply host style vars, transparent bg) —
  https://claude.com/docs/connectors/building/mcp-apps/transparent-theming
- **Anthropic brand typography** (Anthropic Sans/Serif download) —
  https://brand.anthropic.com/typography

## How the pieces fit (Build for Claude)

You ship a **plugin**: any combination of an **MCP connector** (reaches your
product/data via an MCP server you host), **skills** (teach Claude your workflows),
an optional **MCP App** (interactive UI in the conversation), and commands/agents.
Publish to the directory at claude.ai/directory. For us the relevant piece is the
**MCP App** — the interactive commerce surfaces inside the chat.

## MCP-app design guidelines — the load-bearing rules

**Design for the conversation.** The app is an extension of the dialogue, not a
separate app beside it. Conversational, contextual, integrated (inherits host
styling), adaptive (variable sizing, mobile, a11y).

**Build as an MCP app when** the task finishes inside the conversation, has a clear
start/end (booking, ordering, approving), and is immediately actionable. **Avoid**
long-form/static content, complex multi-step workflows beyond the mode's scope, deep
navigation (drill-ins, breadcrumbs, multiple views), nested scrolling, menus/popovers
(they clip / z-index-conflict — use visible controls), and chat-like inputs that
duplicate Claude.

### Display modes (there are three official ones)

- **Inline card** — compact, embedded. Status/confirmations, simple data or
  selection, brief summaries with optional expansion, quick actions.
  Constraints: **height auto-fits, no nested scroll; ≤2 actions at the bottom;
  ≤4–5 data points; no drill-ins/multiple views; no menus/popovers.**
  Mobile: full-width, ≥44pt tap targets, no horizontal scroll.
- **Inline carousel** — side-by-side items to browse. Products, search results,
  options. Constraints: **3–8 items; each card = image + title + ≤3 lines meta +
  ≤1 optional CTA; consistent dimensions & hierarchy.** Mobile: horizontal swipe,
  let the next card peek.
- **Full screen** — immersive; the composer stays visible. Dashboards, analysis,
  document editing, rich tasks. Constraints: **app provides its own fullscreen
  button; host shows a close button; composer always visible (design around it);
  no floating panels (use collapsible sidebars / tabs / pagination).**

### Interaction split — app vs chat

- **In the app:** direct manipulation (sliders, toggles, selections), filter/sort of
  shown data, expand/collapse, **confirming/executing a prepared action** ("Approve",
  "Send", "Save"), interacting with visualizations.
- **Push to chat:** text entry / freeform input, follow-ups & clarification, requests
  to modify/refine/redo, navigation to other contexts, anything needing Claude's
  interpretation.
- Rule of thumb: language-understanding → chat; direct UI action on content the app
  already controls → app.

### Visual & other rules

- **Use host style tokens** for all structural color (bg, text, border, icon).
  Brand color is allowed only for **accents/identity**. Never hardcode colors.
- **Dark mode is mandatory** — both themes must work; host tokens adapt automatically.
- **Typography:** three sizes (heading / body / caption), two weights (regular /
  emphasized). Font is **Anthropic Sans** (host provides at runtime).
- **Icons:** monochromatic, outlined, matching host icon color; supportive not
  essential.
- **Loading:** skeleton screens matching final layout; **avoid spinners** for inline.
- **Borders/radii:** limited set. Prefer visible controls (segmented buttons, toggle
  chips, inline tabs) over menus/dropdowns.
- **Safe areas:** honor `hostContext.safeAreaInsets`; the composer can overlay the
  bottom even on web/desktop, so never place controls flush to an edge.

### Host style tokens (the real contract)

Structural colors come from CSS custom properties the host injects, e.g.
`--color-background-primary/secondary/tertiary/inverse`, `--color-text-*`,
`--color-border-*`, plus semantic `info / danger / success / warning`. Type tokens
`--font-text-*` / `--font-heading-*`, radii `--border-radius-xs…full` (4/6/8/10/12px,
full), `--border-width-regular: 0.5px`, and `--shadow-hairline…lg`. Full tables are in
the design-guidelines page. Blend via the transparent-theming guide (keep bg
transparent, reference the vars).

## The kit is the source of truth; this guidance is reference

**Settled (Somnath, 2026-10-01): follow the experience kit, not this doc, wherever they
differ.** The kit's MCP-app components were built from the **same official Figma UI kit**
linked above (community file `sLwotk5R8DBe1oogmwkTWX`; nodes `467-24635` inline card,
`467-31023` carousel, `467-39705` full screen, `467-21506` slot typography) and then
refined deliberately. So these are **considered choices on top of the guidance**, not
accidental drift:

1. **`floating` mode** — a deliberate kit addition, a **floating variant of the inline
   card**. Not in the public guidance; intended, keep it.
2. **Full-screen framing** — the kit models full-screen as the *expanded view* of an
   `expandable` card/floating block. Keep the kit's model.
3. **Theming tokens** — the kit uses its own token names/values and a near-white
   palette; our shell *is* the host. Keep the kit's tokens; Salesforce brand appears
   only in the permitted accent spots (see INTENT §4).
4. **Dark mode** — **not needed for now** (kit is light-only). Official requires it; we
   don't, for now.
5. **Inline-card constraints** (≤2 actions, ≤4–5 data points, height auto-fits, no
   nested scroll, no menus/popovers) — still a **useful discipline** for our commerce
   cards; honor the spirit unless the kit's pattern says otherwise.
6. **Skeletons over spinners** — kit already does this. ✔ aligned.

**Still broadly worth heeding from the guidance:** the app-vs-chat interaction split
(confirm/execute prepared actions in the app; freeform / modify / refine / navigate in
chat), and the slot typography scale (`467-21506`).
