// Serifs, in fallback order. Anthropic Serif (proprietary; @font-face files
// gitignored) is primary; EB Garamond (open, bundled) is the fork fallback.
// Both consumed via --font-display / --font-serif-text.
import "@fontsource-variable/eb-garamond";
import "./styles/fonts.css";
// UI sans (provisional): Hanken Grotesk — consumed via --font-ui.
import "@fontsource-variable/hanken-grotesk";
// The A2A stage's sans: Inter — consumed via .a2a-stage's --font-sans.
import "@fontsource-variable/inter";
// What A2A agents are thinking through, row by row: Geist Mono — via .a2a-mono.
import "@fontsource-variable/geist-mono";
// The storefront's hero headlines: Anton (one weight) — via .sf-display.
import "@fontsource/anton/latin-400.css";
import "./index.css";
import { copy } from "./copy/copy";

/** What every entry needs before it renders: the fonts, the styles, and the tab title (from the single copy source). */
document.title = copy.app.documentTitle;
