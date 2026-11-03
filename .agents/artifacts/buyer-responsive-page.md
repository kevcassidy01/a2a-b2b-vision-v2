# Buyer Responsive Page

## Scope

- Only standalone buyer opts into the browser shell; root split retains IPhoneFrame and default Safari. Seller and relay source are unchanged.
- Removed simulated phone, time/signal/battery, Safari bottom bar and wallpaper from standalone at all widths.
- Retained mobile content and existing design language. Desktop uses a 1280px content cap, two-column hero, six brand columns, responsive product grid, two-column account blocks, horizontal footer links and bounded 600px chat.
- Dynamic viewport height, safe-area padding, internal page/thread/menu scrolling; phone-only header/menu spacers removed.
- Standalone overlays make background inert, focus an initial control, cycle Tab, close on Escape and restore prior focus. Search input gets an accessible name; standalone controls get visible focus outlines.

## Verification

- `npm test`: 25 tests pass, including three new buyer source regressions and existing seller/real-socket relay tests.
- `npm run build`: passes with existing unresolved Anthropic font and large-chunk warnings.
- `git diff --check`: passes.
- Temporary Playwright script outside repo (`../buyer-check.mjs`) against local Vite with Chrome Headless Shell. Installed browser cache outside repo after installed Chrome repeatedly closed externally; no package/dependency edits.
- 1440x900 public and account scroll widths both 1440; vertical scroll heights 5000/1482. Chat bounds (816,24,600,852); menu width 400.
- 390x900 public/account scroll widths both 390; vertical heights 4933/2247. Chat (0,8,390,892); menu width 331.5.
- 320x900 public/account scroll widths both 320; vertical heights 5062/2338. Chat (0,8,320,892); menu width 272.
- At each width exercised public login, autofill/sign-in, Delivered/Open order filters, agent open, Escape/focus restoration, menu open/Escape. At 500px viewport height chat stayed bounded (desktop height 452, narrow height 492).
- Root browser check confirms one phone body and Safari bar; seller check confirms seller shell and no buyer class. All standalone stage backgrounds are `none` and no phone/Safari elements render.

## Accessibility And Limits

- Loaded accessibility-code-review and reflow guidance. Targeted SC 1.4.10 reflow findings: [] after scoped fixes at tested widths. SC 2.1.1 keyboard findings for added overlay behavior: []. Search accessible-name issue fixed; focused controls have scoped outlines.
- Not a full WCAG audit or visual pixel comparison. Real iOS Safari/software keyboard, screen readers, full scripted quote/order negotiation states, and deployed paired-device relay were not tested. Existing inert/no-op prototype controls retain their behavior.
- No commit, push or deployment performed.

## Reviewer Fixes

- Standalone login now receives an optional home callback and renders an accessible Back to home button. It uses the existing page loader, preserves signed-out state and resets the page scroller; the split phone still uses Safari Back.
- Overlay cleanup restores prior focus only when connected and outside any inert ancestor. Otherwise it selects the page header menu (or FAB fallback), also guarded against inert ancestors. Closing chat after a drawer handoff no longer targets the hidden drawer control or leaves focus on body.
- Updated source regressions and temporary browser checks. At 1440/390/320px: login -> Back to home returns to public storefront with no account view; login works again; menu -> Coworker -> Escape restores focus to the visible, non-inert page menu button. Existing direct-FAB restoration, orders filters, short viewport, root and seller checks still pass.
- `npm test`: 26 passing. `npm run build`: passing with existing font/chunk warnings. `git diff --check`: passing. Same platform/whole-story accessibility limits above apply; no commit or push.
