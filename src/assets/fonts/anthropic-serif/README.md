# Anthropic Serif

Anthropic's proprietary brand serif — the primary display/serif typeface for
this kit. Two optical sizes:

- **Display** — large headings, the greeting, the sidenav wordmark.
- **Text** — reading / body serif.

## These files are NOT in version control

The `.otf` files are **gitignored** (see repo `.gitignore`) because Anthropic
Serif is proprietary and not redistributable. They exist only on machines that
have a licensed copy.

**Without these files** (e.g. a fresh fork), the app degrades gracefully:
`--font-display` / `--font-serif-text` fall through to **EB Garamond**
(`@fontsource-variable/eb-garamond`, bundled and open), then to system serifs.

## To enable Anthropic Serif locally

Drop the static `.otf` files into this folder. Roman weights 400/500/600/700
for both `Display` and `Text` are wired in `src/styles/fonts.css`; the folder
may also contain Light/Extrabold and italics for future use.

Expected filenames (examples):

```
AnthropicSerif-Display-Regular-Static.otf
AnthropicSerif-Display-Medium-Static.otf
AnthropicSerif-Display-Semibold-Static.otf
AnthropicSerif-Display-Bold-Static.otf
AnthropicSerif-Text-Regular-Static.otf
… (Text weights + italics)
```
