# Claude file card + side preview (reference, captured 2026-10-05)

Screens Som captured from claude.ai (web) showing a PDF Claude created. They're in
`docs/references/file-preview/`:

- `pdf-card-default.png`: the response with the file card, preview closed.
- `pdf-preview-open.png`: the file card clicked, preview panel open on the right.
- `pdf-card-with-drive.png`: a variant of the card with a Google Drive button beside Download.

Measurements are approximate, read from 2× retina screenshots of a 1728px-wide CSS viewport.

## Response, preview closed

1. **Tool summary line** (muted grey, ~15px): "Ran 2 commands, read a file, and 2 more tools ›".
   It's a single collapsed line with a chevron. These are Claude's own tools, not MCP.
2. **Reply text** (serif response body), e.g. "Here's the PDF, with …".
3. **File card** (~520 × 70 CSS px, white, hairline border, ~12px radius):
   - Left: a page **thumbnail** (~56px, light grey tile with a file glyph, slightly
     offset or "tilted" in the Drive variant).
   - **Title** (~16px, primary ink) above **"Document · PDF"** (~14px, muted).
   - Right: an outlined **Download** button. The Drive variant also has a square Google Drive
     icon button to its left.
4. Action row (copy / voice / 👍 / 👎 / retry). On hover it also shows "just now".
5. Top bar: when the chat has files, a **document icon button** appears left of **Share**.

## Preview open (click the card)

- The **chat column narrows to the left** (sidenav unchanged). The chat stays fully live,
  and the composer narrows with it.
- **Preview panel on the right**, about 47% of the main area (~710 CSS px at a 1728 viewport).
  It's inset a few px from the window edge and runs the full height, starting at the top-bar
  row, with a hairline border and rounded corners.
  - **Header** (~52px): "Hanken grotesk font notes **· PDF**" (title in ink, "· PDF" muted),
    then icons on the right: **download**, ~~expand~~, **close X**.
    **Som: we drop the expand icon.**
  - **Body**: a light grey well with a white **page** (letter ratio, soft edge) and scrolling
    pages. The PDF content renders in its own document styling (sans headings, code blocks,
    bullets).
  - A **"Page 1 / 1"** pill (dark grey, white text) in the bottom-right of the page.
- The **file card shows a selected state** while its preview is open (light grey fill).
- In the top bar, the **Share** button moves out of view in the narrowed layout (the title
  stays at the top left).
- Close: X (and Escape, our convention).

## How we use it

Merchant insights ends with `/export-report` (a grey default skill, not Salesforce). The
merchant picks the views to include (a checklist card, or the scope typed in the prompt), and
Claude responds with the tool summary line, the reply, and the file card. Clicking the card
opens this preview with the report pages (each picked chart or table as a section, with
annotations and a one-line takeaway). It's built as a reusable **shell** feature (any journey
could open a file beside the chat). The "PDF" is page-styled HTML in the panel. A real PDF
download is optional, later.
