# Demo Launcher Evidence

## Scope

- Entry: `/demo/`, or `/a2a-b2b-vision-v2/demo/` on repository-prefixed Pages.
- Added `public/demo/index.html`; no changes to Root, React story, relay, Vite config, or Pages workflow.
- On load and New Demo Pair, `crypto.randomUUID()` creates a fresh room shared by relative `../buyer/` and `../seller/` URLs. Incoming query/hash is not propagated.
- Native new-tab links use `rel="noopener noreferrer"`. Labeled read-only fields expose the full URLs. Copy success/failure is announced; clipboard failure focuses and selects the link for manual copying.
- Reset updates both links without navigating or closing existing tabs. Instructions explain one buyer/one seller, sharing the matching link across devices, and closing old tabs before using a new pair.
- No secrets, external requests, new dependencies, commits, pushes, or deployment performed.

## Verification

- `npm test`: PASS, 18 tests (11 existing relay/transport tests plus 7 launcher tests).
- Launcher tests execute the actual inline script in Node's VM with a minimal DOM fixture: root/Pages paths, UUID/shared room, reset/new load uniqueness, exact clipboard values, unavailable/rejected clipboard fallback, pending-copy/reset race, UUID failure recovery, and semantic markup checks.
- `npm run build -- --base=/a2a-b2b-vision-v2/`: PASS. Read back `dist/demo/index.html` to confirm Vite copied the static public entry into the Pages artifact.
- Workflow inspected: it builds with the repository base, copies root HTML to buyer/seller entries, and uploads all of `dist`. No special demo route copy is necessary.
- `git diff --check`: PASS before evidence addition.
- Build warnings: existing unresolved optional Anthropic Serif font references and application bundle over 500 kB. Launcher uses local/system font fallback and no application bundle.

## Accessibility Review

Used `accessibility-code-review`, including its keyboard and contrast references. Source-review violations by criterion:

- SC 1.3.1 (labels/structure): []
- SC 1.4.3 (text contrast): []
- SC 2.1.1 (keyboard): []
- SC 2.4.4 (link purpose): []
- SC 2.4.6 (headings/labels): []
- SC 3.3.2 (instructions): []
- SC 4.1.2 (name/role/value): []

Computed WCAG ratios with Node: white on blue `#0176d3` 4.63:1; muted `#52514f` on canvas `#fcfcfb` 7.72:1; `#30302e` on white 13.22:1. Input/button borders on canvas 3.50:1; focus blue on white 9.67:1. Native controls, visible focus outlines, polite atomic status, 48px action targets, and a one-column layout below 640px are provided. No animation.

Limitations: no real-browser desktop/mobile, screen-reader, clipboard-permission, or deployed two-device relay session was run. Node DOM fixtures validate behavior, not browser rendering. Live production pairing still requires the existing deployed relay configuration. Local Vite transport retains its existing unscoped broadcast behavior; launcher does not change that transport.
