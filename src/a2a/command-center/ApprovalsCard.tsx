import { Inbox } from "lucide-react";
import { copy } from "../../copy/copy";
import { Switch } from "../../desktop/cowork/settings/parts";

const t = copy.a2a.commandCenter.approvals;

/**
 * ApprovalsCard — the storefront's quote requests waiting on the seller, full
 * width above the metrics, with the auto-approval switch at the right. Empty
 * for now: a grey banner saying nothing's waiting, fading down into the card.
 */
export function ApprovalsCard() {
  return (
    <section className="a2a-card flex flex-col gap-4 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="mr-auto flex flex-col gap-0.5">
          <h3 className="a2a-title text-[14px] font-semibold text-text">
            {t.title} <span className="tabular-nums text-text-muted">({t.count})</span>
          </h3>
          <p className="text-[13px] text-text-muted">{t.checked}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="text-[13px] text-text-muted">
            {t.autoApproval}
          </span>
          <Switch label={t.autoApproval} onClass="bg-success" />
        </div>
      </div>
      <div className="a2a-empty-fade flex items-center gap-2.5 rounded-t-md px-3.5 pb-8 pt-3.5 text-[13.5px] text-text">
        <Inbox className="size-4 shrink-0 text-text-muted" strokeWidth={1.75} />
        {t.empty}
      </div>
    </section>
  );
}
