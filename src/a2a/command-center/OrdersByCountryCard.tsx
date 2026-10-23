import { Download, MessageSquareText, type LucideIcon } from "lucide-react";
import { copy } from "../../copy/copy";
import { Segmented } from "../../shell/Segmented";

const t = copy.a2a.commandCenter.ordersByCountry;

/**
 * OrdersByCountryCard — the wide card under the metrics: its title, with Ask
 * about this and Export CSV at the right, then the metric to break down by
 * country (a segmented control that scrolls sideways if the card is narrow).
 * No body yet, so the card fades out, border and all, as it runs off the
 * bottom of the page. The fade sits on a
 * wrapper 16px bigger all round, so it doesn't clip the hairline and shadow,
 * which are drawn outside the card.
 */
export function OrdersByCountryCard() {
  return (
    <div className="a2a-fade-out -mx-4 -mt-4 px-4 pt-4">
      <section className="a2a-card h-64 rounded-t-xl p-5">
        <div className="flex items-center gap-2">
          <h3 className="mr-auto text-[14px] font-semibold text-text">{t.title}</h3>
          <ActionButton icon={MessageSquareText} label={t.ask} />
          <ActionButton icon={Download} label={t.export} />
        </div>
        <div className="a2a-no-scrollbar -mx-5 mt-4 flex overflow-x-auto px-5">
          <Segmented options={t.metric.options} label={t.metric.label} reserveCheck={false} />
        </div>
      </section>
    </div>
  );
}

/** Icon + label, with a little less padding on the icon's side so the pair looks centred. */
function ActionButton({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button
      type="button"
      className="a2a-control flex h-8 items-center gap-1.5 rounded-md pl-2.5 pr-3 text-[13.5px] font-medium text-text"
    >
      <Icon className="size-4 text-text-muted" strokeWidth={2} />
      {label}
    </button>
  );
}
