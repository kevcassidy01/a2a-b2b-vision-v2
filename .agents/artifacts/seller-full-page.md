# Seller Full Page

## Scope

- Standalone `/seller` uses a full-page opaque shell; no wallpaper class, Mac traffic lights, GlassPanel, outer inset, radius or shadow.
- Sidebar and artifact toolbar remain application chrome. Dashboard and drawer keep internal scrolling.
- Buyer and root split retain their existing shell path. Relay, pairing, stand-in, presenter keys and story logic are unchanged.
- Seller-only mobile CSS wraps toolbar/dashboard controls, stacks Today and campaign rows, uses two metric columns, constrains card children and wraps the welcome title.
- Harness updated: changelog, session context, design decision and intent. No commit or push.

## Verification

- `npm test`: 21 passing tests, including two minimal layout-source regressions and existing real-socket relay/lifecycle coverage.
- `npm run build`: passed; existing unresolved Anthropic font and large-chunk warnings remain.
- `git diff --check`: passed.
- Headless installed Chrome via temporary Playwright outside the repository, local Vite: seller measured at 1440x900, 390x900 and 320x900. Stage bounds exactly `(0,0,width,900)`, background image `none`, main margin/radius `0px`, main shadow `none`, no glass layer.
- Dashboard client/scroll widths matched: 1384/1384, 334/334, 264/264. Internal vertical content exceeded canvas height at every size (3959/856, 5218/799, 5511/776), preserving internal scrolling. Activity table retains its own bounded horizontal scroller, appropriate for tabular data.
- Empty drawer client/scroll widths matched at desktop and mobile: 960/960, 334/334 and 264/264. Escape exercised.

## Accessibility And Limits

- Loaded accessibility-code-review and reflow guidance. SC 1.4.10: fixed welcome nowrap and dashboard fixed-track/control overflow for standalone seller. Remaining out-of-viewport table cells are inside the existing local table scroller, not page overflow.
- No accessible names or semantic main/nav regions were removed; decorative Mac lights were not interactive controls.
- This is a targeted layout review, not a full WCAG audit. Full quote-thread states, screen readers, real mobile Safari/keyboard dynamic viewport and deployed two-device relay were not tested.
- Temporary Chrome runs intermittently terminated externally; successful measurements above were collected across reruns. Buyer/root preservation is supported by unchanged branch markup and scoped selectors, not a completed visual browser comparison.
- Retained artifact toolbar and internal card radii/shadows intentionally; only outer demo framing is removed.

## Funnel Review Fix

- Review identified that the Sankey layout subtracts 198px from plot width, collapsing columns in the seller's 200px mobile card content.
- Added a seller-scoped 720px minimum plot inside a bounded horizontal scroller. ResizeObserver still measures the plot, not the viewport. Other layouts retain their original widths. The scroller has a named region and keyboard focus for keyboard scrolling.
- Temporary Playwright/Chrome assertions at 320x900 and 390x900 passed: scroller client widths 200/270px, plot/scroll width 720px, maximum horizontal scroll 520/450px; document widths remained 320/390px.
- Node columns were 0, 174, 348, 522px. Pairwise SVG label bounding boxes did not overlap, including Checkout started, Order placed, Pending approval and Activated. All labels end within the plot (rightmost about 691px).
- Added one minimal layout-source regression. `npm test`: 22 passed. `npm run build` and `git diff --check`: passed. Existing font/chunk warnings unchanged. No commit or publishing.
