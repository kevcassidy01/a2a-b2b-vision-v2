# Demo scripts

Presenter cheat sheets: what to type and click, in order, for each journey, and what should
appear. Keep this open beside the demo. For a presenter who hasn't run it before, the short
act-by-act guide (all three journeys in one run) is [../browser-chat-demo-guide.md](../browser-chat-demo-guide.md).

| Journey | Sidenav chat | Script |
|---|---|---|
| 1. Quote approval | **Quote approval** | [quote-management.md](./quote-management.md) |
| 2. Merchant insights | **Merchant insights** | [merchant-insights.md](./merchant-insights.md) |
| 3. Checkout anywhere | **Checkout anywhere** | [checkout-anywhere.md](./checkout-anywhere.md) |

## Before any demo

- `npm run dev` → http://localhost:5173/
- Click the journey's chat in the sidenav to arm it. A journey you've already run keeps its chat
  as you left it, so you can switch back and scroll through the steps; **New** restarts the armed
  journey from scratch, and a page refresh restarts all three.
- The Salesforce connector is always on. Slash skills turn into blue chips as you type.
- Prompts marked 🎙 are dictated: click the mic beside send and the right line comes in by itself, no
  pauses, then press Enter. The mic always offers the journey's next line. Typing still works: a step typed in your own words counts, and the mic moves on to the line after it.
  Prompts that are only a slash skill, and quote's `/add-note`, are still typed.
- The latest reply ends with three follow-up chips and the Claude logo on its own line; one chip
  plays the next step (the scripts say which). Both go once anything follows.
- Prompts match on keywords, so small rewording is safe. Anything off-script gets a fallback
  reply. Stick to the lines below when presenting.

These scripts are the short version. The full runbooks (data, variations, limitations) are
`docs/quote-management-flow.md`, `docs/merchant-insights-flow.md` and
`docs/checkout-anywhere-flow.md`. **When a journey changes, update its script here too.**
