import { useState } from "react";
import { X } from "lucide-react";
import { copy } from "../../copy/copy";
import { PRIMARY_BTN } from "./settings/parts";

/**
 * SalesforceBanner — the smaller card under the start state's prompt box.
 *
 * Same build as the live app's "Finish setting up Sales Cloud" nudge (logo
 * tile, title, two-line body, black button, ×), but Salesforce is already
 * connected, so it's about learning what Claude can do with it. A borderless
 * grey card (the Skills callout's grey) with the logo on a white, bordered tile.
 * × hides it for the session; the button doesn't act yet.
 */
export function SalesforceBanner() {
  const t = copy.desktop.cowork.salesforceBanner;
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="mt-4 flex items-center gap-4 rounded-lg bg-callout py-3.5 pl-4 pr-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-md border border-prompt-border bg-surface">
        <img src="/salesforce.svg" alt="" aria-hidden className="h-5 w-auto" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-ui font-medium text-text">{t.title}</div>
        <p className="mt-0.5 text-[13px] leading-snug text-text-muted">{t.body}</p>
      </div>
      <button type="button" className={PRIMARY_BTN}>
        {t.cta}
      </button>
      <button
        type="button"
        aria-label={t.dismiss}
        onClick={() => setOpen(false)}
        className="grid size-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text"
      >
        <X className="size-[18px]" strokeWidth={2} />
      </button>
    </div>
  );
}
