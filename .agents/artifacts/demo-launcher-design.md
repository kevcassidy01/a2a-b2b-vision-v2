# Demo Launcher Design Verification

This supersedes the initial-state and build-path details in `demo-launcher.md`.

- Source entry: `demo/index.html`; output remains `dist/demo/index.html` at `/demo/` (including repository-prefixed Pages).
- The wallpaper module imports `src/assets/a2a/wallpaper.jpg`, the same image referenced by `src/a2a/a2a.css`. Vite emits a shared hashed asset; no source binary copy or deployment-only copy step is required.
- Initial state: unchanged header text and Generate Demo button. Pair, instructions, and footer are hidden; status is empty; no UUID is requested on load.
- Clicking Generate Demo creates one room for buyer and seller, enables copy actions, reveals the two sections, and updates `aria-expanded` and live feedback. Further clicks create fresh pairs. Reload returns to the initial state.
- Clipboard success, manual-copy fallback, generation failure, and stale asynchronous clipboard feedback retain regression coverage.

## Evidence

- `npm test`: PASS, 19 tests (11 relay/transport plus 8 launcher).
- `npm run build -- --base=/a2a-b2b-vision-v2/`: PASS. Existing unresolved Anthropic font and large-chunk warnings remain outside this change.
- Built-artifact assertion: `dist/demo/index.html` retains the hidden pair; its module references `/a2a-b2b-vision-v2/assets/wallpaper-Bo3pDzbm.jpg`, which exists and is also referenced by the main prototype CSS.
- Accessibility source review: SC 2.1.1 violations: []; SC 1.4.3 violations: [] (computed conservative text contrast against a white image pixel under the minimum 68% black overlay, and button text against its solid fill). Native controls, visible focus rings, labeled copy fields, hidden unrevealed controls, and live status retained.

## Limitations

No real-browser visual, mobile, screen-reader, or clipboard-permission session was executed. Responsive styles use a single card column and wrapping copy controls below 640px. Live two-device production pairing still requires the existing deployed relay. No commit, push, or deployment performed.
