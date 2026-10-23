import { Fragment, useState } from "react";
import { ArrowRight, Check, CircleCheckBig, FileText, Gift, LoaderCircle, MessageSquareText, Pencil, Repeat, ShoppingCart } from "lucide-react";
import { useBusy, useChat, useFired } from "./store";
import { useMessageId } from "./MessageId";
import { InsightView, KpiTiles } from "./viz/InsightView";
import { InsightPill } from "./viz/Pills";
import { ChartTooltip } from "./viz/ChartTooltip";
import { useWidth } from "./viz/useWidth";
import type {
  AccountStat,
  ChartBar,
  ChartReport,
  DeltaRow,
  ExportItem,
  Field,
  Kpi,
  LineRow,
  OrderRow,
  Pill,
  ProductRow,
  PromoRow,
  QuoteRow,
  SelectOption,
  SlotView,
  SummaryRow,
  Tone,
} from "./types";

/**
 * SlotContent — renders the real widget inside an MCP app slot, dispatching on
 * the view's `kind`. This is the app's own content region; the host (Claude)
 * still owns the surrounding frame (surface, border, header, footer).
 *
 * Everything here follows the slot type scale (heading / body / caption, two
 * weights) and the host tokens. The one brand liberty is the app-link accent
 * (Salesforce blue) on primary actions + links, and the status tokens on pills
 * and the approval stepper. Buttons fire an in-app action (`store.runAction`),
 * which plays the next scripted beat — keeping the app-vs-chat split.
 *
 * `fullscreen` renders the expanded view (used by `FullScreenApp`): the
 * entitlement catalog drops its inline truncation and shows every product.
 */
export function SlotContent({ view, fullscreen = false }: { view: SlotView; fullscreen?: boolean }) {
  // Insight views own their heading (title + subtitle on the insight type scale).
  if (view.kind === "insight") return <InsightView view={view} fullscreen={fullscreen} />;
  return (
    <div className="space-y-5">
      {view.heading && <ViewHeading heading={view.heading} pill={view.headingPill} subtitle={view.subtitle} />}
      <ViewBody view={view} fullscreen={fullscreen} />
    </div>
  );
}

/** The card body's own title + optional status pill, with an optional quiet
 *  subtitle (scope or time) under it, as on the insight cards. Distinct from
 *  the host-owned card header. */
function ViewHeading({ heading, pill, subtitle }: { heading: string; pill?: Pill; subtitle?: string }) {
  return (
    <header className="space-y-1">
      <div className="flex flex-wrap items-center gap-2.5">
        <h3 className="text-title font-semibold text-text">{heading}</h3>
        {pill && <InsightPill pill={pill} />}
      </div>
      {subtitle && <p className="text-label text-text-muted">{subtitle}</p>}
    </header>
  );
}

function ViewBody({ view, fullscreen }: { view: SlotView; fullscreen: boolean }) {
  switch (view.kind) {
    case "quote-list":
      return <QuoteList rows={view.rows} />;
    case "quote-detail":
      return (
        <QuoteDetail
          kpis={view.kpis}
          lines={view.lines}
          steps={view.steps}
          current={view.current}
          buyerNote={view.buyerNote}
        />
      );
    case "entitlement":
      return <Entitlement view={view} fullscreen={fullscreen} />;
    case "sample-result":
      return <SampleResult line={view.line} deltas={view.deltas} />;
    case "note":
      return <NoteCard title={view.title} body={view.body} mergeLabel={view.mergeLabel} />;
    case "approval":
      return <Approval steps={view.steps} current={view.current} facts={view.facts} />;
    case "context":
      return <ContextCard fields={view.fields} note={view.note} action={view.action} />;
    case "select":
      return <SelectMenu intro={view.intro} options={view.options} />;
    case "cart":
      return <CartView lines={view.lines} totals={view.totals} action={view.action} />;
    case "order-confirm":
      return <OrderConfirm orderNumber={view.orderNumber} fields={view.fields} />;
    case "order-list":
      return <OrderList rows={view.rows} reorderLabel={view.reorderLabel} />;
    case "order-detail":
      return <OrderDetail kpis={view.kpis} placedBy={view.placedBy} fields={view.fields} lines={view.lines} totals={view.totals} />;
    case "chart":
      return <ChartView view={view} fullscreen={fullscreen} />;
    case "insight":
      return <InsightView view={view} fullscreen={fullscreen} />;
    case "promotions":
      return <Promotions view={view} />;
    case "export":
      return <ExportPicker view={view} />;
  }
}

/* ── Merchant-insights views ──────────────────────────────────────────────
 * The promotions Claude drafts (edit in-card, create all, make each live) and
 * the export picker (which views go in the report). Same SLDS-flavored
 * buttons as the other journeys; type on the insight scale (16px body, 14px
 * labels). */

/** One promotion as a definition list: name (+ pills) over its terms. */
function PromoCard({
  row,
  audienceSlot,
  status,
}: {
  row: PromoRow;
  audienceSlot?: React.ReactNode;
  status?: React.ReactNode;
}) {
  const terms: [string, React.ReactNode][] = [
    ["Discount", row.discount],
    ["Applies to", row.appliesTo],
    ["Audience", audienceSlot ?? row.audience],
    ["Runs", row.dates],
  ];
  return (
    <div className="space-y-3 px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-body font-semibold text-text">{row.name}</span>
        {row.updated && <InsightPill pill={{ label: "Updated", tone: "info" }} />}
        {status && <span className="ml-auto">{status}</span>}
      </div>
      <dl className="grid grid-cols-[96px_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-body">
        {terms.map(([k, v]) => (
          <Fragment key={k}>
            <dt className="text-label leading-6 text-text-muted">{k}</dt>
            <dd className="text-text">{v}</dd>
          </Fragment>
        ))}
      </dl>
      {row.note && <p className="text-label text-text-muted">{row.note}</p>}
    </div>
  );
}

/** Make live: plays the write (the reply shows it, then the card again with
 *  the promotion Live); a spinner here until that reply is in, then a Live
 *  pill. A row already live shows just the pill. */
function MakeLive({ id, live }: { id: string; live?: boolean }) {
  const runAction = useChat((s) => s.runAction);
  const busy = useBusy();
  const [clicked, setClicked] = useState(false);
  const state = live || (clicked && !busy) ? "live" : clicked ? "working" : "inactive";
  if (state === "live") return <InsightPill pill={{ label: "Live", tone: "success" }} />;
  return (
    <span className="flex items-center gap-2">
      {state === "inactive" && <InsightPill pill={{ label: "Inactive", tone: "neutral" }} />}
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setClicked(true);
          runAction(`promo-live|${id}`);
        }}
        className="whitespace-nowrap inline-flex h-8 items-center gap-1.5 rounded-full border border-app-link/50 px-3 text-label font-medium text-app-link transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-info-soft disabled:opacity-70"
      >
        {state === "working" && <LoaderCircle className="size-4 animate-spin" strokeWidth={2} />}
        {state === "working" ? "Turning on" : "Make live"}
      </button>
    </span>
  );
}

function Promotions({ view }: { view: Extract<SlotView, { kind: "promotions" }> }) {
  const [rows, setRows] = useState(view.rows);
  const [editing, setEditing] = useState<string[] | null>(null);
  const runAction = useChat((s) => s.runAction);
  const busy = useBusy();
  const [clicked, setCreated] = useState(false);
  const msg = useMessageId();
  // Created from the chip under the reply counts too.
  const created = useFired(msg, view.createActionKey) || clicked;
  const [allClicked, setAllClicked] = useState(false);
  const allFired = useFired(msg, view.liveAllActionKey) || allClicked;
  const inactive = rows.filter((r) => !r.live).length;

  const save = () => {
    if (!editing) return;
    setRows(rows.map((r, i) => (editing[i] !== r.audience ? { ...r, audience: editing[i], updated: true } : r)));
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="divide-y divide-border rounded-lg border border-border">
        {rows.map((r, i) => (
          <PromoCard
            key={r.id}
            row={r}
            status={view.stage === "created" ? <MakeLive id={r.id} live={r.live} /> : undefined}
            audienceSlot={
              editing && view.audiences ? (
                <select
                  value={editing[i]}
                  onChange={(e) => setEditing(editing.map((a, j) => (j === i ? e.target.value : a)))}
                  className="h-9 w-full max-w-[360px] rounded-md border border-prompt-border bg-surface px-2.5 text-body text-text"
                >
                  {[...new Set([r.audience, ...view.audiences])].map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              ) : undefined
            }
          />
        ))}
      </div>
      {view.stage === "draft" && (
        <div className="flex flex-wrap items-center gap-2">
          {editing ? (
            <>
              <ActionChip primary onClick={save} label="Save changes" />
              <ActionChip onClick={() => setEditing(null)} label="Cancel" />
            </>
          ) : (
            <>
              <ActionChip
                primary
                disabled={busy || created}
                onClick={() => {
                  setCreated(true);
                  runAction([view.createActionKey, ...rows.map((r) => r.audience)].join("|"));
                }}
                label={`Create all ${rows.length}`}
              />
              <ActionChip
                disabled={busy || created}
                icon={Pencil}
                onClick={() => setEditing(rows.map((r) => r.audience))}
                label="Edit promotions"
              />
            </>
          )}
          {view.footnote && <span className="ml-auto text-label text-text-muted">{view.footnote}</span>}
        </div>
      )}
      {/* Created: turn every inactive one on at once (each row's Make live stays). */}
      {view.stage === "created" && view.liveAllActionKey && inactive > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <ActionChip
            primary
            disabled={busy || allFired}
            onClick={() => {
              setAllClicked(true);
              runAction(view.liveAllActionKey!);
            }}
            label={
              inactive === rows.length ? `Make all ${rows.length} live` : inactive === 1 ? "Make the last one live" : `Make the other ${inactive} live`
            }
          />
        </div>
      )}
    </div>
  );
}

/** The insight-scale button (16px label, pill radius, SLDS brand colors). */
function ActionChip({
  label,
  onClick,
  primary = false,
  disabled = false,
  icon: Icon,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
  icon?: typeof Gift;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`whitespace-nowrap inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-body font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] disabled:opacity-50 ${
        primary ? "bg-app-link text-white hover:brightness-95" : "border border-app-link/50 text-app-link hover:bg-info-soft"
      }`}
    >
      {Icon && <Icon className="size-4" strokeWidth={2} />}
      {label}
    </button>
  );
}

/** Pick which views go in the report: an editable title, grouped checkboxes
 *  (pre-checked to what the conversation dwelt on), Create PDF. */
function ExportPicker({ view }: { view: Extract<SlotView, { kind: "export" }> }) {
  const [title, setTitle] = useState(view.defaultTitle);
  const [checked, setChecked] = useState(() => new Set(view.items.filter((i) => i.checked).map((i) => i.id)));
  const [done, setDone] = useState(false);
  const runAction = useChat((s) => s.runAction);
  const busy = useBusy();
  const groups = [...new Set(view.items.map((i) => i.group))];
  const toggle = (id: string) =>
    setChecked((c) => {
      const n = new Set(c);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="space-y-5">
      <label className="block space-y-1.5">
        <span className="text-label font-medium text-text-muted">Report title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-10 w-full rounded-md border border-prompt-border bg-surface px-3 text-body text-text outline-none focus:border-app-link"
        />
      </label>
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {groups.map((g) => (
          <div key={g} className="space-y-2">
            <div className="text-label font-semibold text-text">{g}</div>
            {view.items
              .filter((i: ExportItem) => i.group === g)
              .map((i) => {
                const on = checked.has(i.id);
                return (
                  <button
                    key={i.id}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggle(i.id)}
                    className="flex w-full items-center gap-2.5 rounded-md py-1 text-left text-body text-text"
                  >
                    <CheckSquare on={on} />
                    {i.label}
                  </button>
                );
              })}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <ActionChip
          primary
          icon={FileText}
          disabled={busy || done || checked.size === 0}
          onClick={() => {
            setDone(true);
            const ids = view.items.filter((i) => checked.has(i.id)).map((i) => i.id);
            runAction(`${view.actionKey}|${title}|${ids.join(",")}`);
          }}
          label="Create PDF"
        />
        <span className="text-label text-text-muted">
          {checked.size} of {view.items.length} views selected
        </span>
      </div>
    </div>
  );
}

/* ── Checkout-anywhere views ──────────────────────────────────────────────
 * The order-on-behalf journey. A resolved-context card, a numbered pick-one
 * `select` menu (the new interaction vs quote mgmt's typed-prompt + confirm),
 * a cart summary with totals, and the order confirmation + detail. */

/** A totals block (cart / order): right-aligned label + value rows, the final
 *  (emphasized) row ruled off above. Values can be struck through (list price). */
function TotalsBlock({ rows }: { rows: SummaryRow[] }) {
  return (
    <div className="ml-auto w-full max-w-[360px] space-y-2">
      {rows.map((r) => (
        <div
          key={r.label}
          className={`flex items-center justify-between text-body ${r.emphasize ? "mt-3 border-t border-border pt-3" : ""}`}
        >
          <span className={r.emphasize ? "font-semibold text-text" : "text-text-muted"}>{r.label}</span>
          <span
            className={`tabular-nums ${
              r.emphasize ? "font-semibold text-text" : r.strike ? "text-text-subtle line-through" : "text-text"
            }`}
          >
            {r.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/** A resolved-context / checkout-review card: the facts as a definition list,
 *  an optional quiet note, and an optional primary action (e.g. "Place order"). */
function ContextCard({
  fields,
  note,
  action,
}: {
  fields: Field[];
  note?: string;
  action?: { label: string; actionKey: string };
}) {
  return (
    <div className="space-y-4">
      <FactList fields={fields} />
      {note && <p className="text-label text-text-muted">{note}</p>}
      {action && (
        <div className="flex justify-end border-t border-border pt-4">
          <ActionButton label={action.label} actionKey={action.actionKey} />
        </div>
      )}
    </div>
  );
}

/** A numbered pick-one menu — the checkout-anywhere selection interaction.
 *  Each option is a clickable row (number badge + label + optional detail /
 *  meta); picking it posts a user message, so the choice reads as the rep's ask. */
function SelectMenu({ intro, options }: { intro?: string; options: SelectOption[] }) {
  const send = useChat((s) => s.send);
  const busy = useBusy();
  return (
    <div className="space-y-3">
      {intro && <p className="text-body text-text-muted">{intro}</p>}
      <ol className="space-y-2">
        {options.map((o, i) => (
          <li key={o.label}>
            <button
              type="button"
              disabled={busy}
              onClick={() => send(o.prompt)}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-bg px-4 py-3 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:border-app-link/50 hover:bg-info-soft disabled:opacity-50"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-elevated text-label font-semibold tabular-nums text-text-muted">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-body font-medium text-text">{o.label}</span>
                  {o.pill && <InsightPill pill={o.pill} />}
                </span>
                {o.detail && <span className="mt-0.5 block truncate text-label text-text-muted">{o.detail}</span>}
              </span>
              {o.meta && <span className="shrink-0 text-body font-medium tabular-nums text-text-muted">{o.meta}</span>}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** A cart summary: the line items + a totals block, with an optional primary
 *  action (e.g. "Proceed to checkout") that posts the rep's next ask. */
function CartView({
  lines,
  totals,
  action,
}: {
  lines: LineRow[];
  totals: SummaryRow[];
  action?: { label: string; sendPrompt: string };
}) {
  return (
    <div className="space-y-5">
      <LineTable lines={lines} />
      <TotalsBlock rows={totals} />
      {action && (
        <div className="flex justify-end border-t border-border pt-4">
          <ActionButton label={action.label} sendPrompt={action.sendPrompt} />
        </div>
      )}
    </div>
  );
}

/** The order-placed confirmation: the order number on a success band, then
 *  the key order facts. The heading already says it's confirmed. */
function OrderConfirm({ orderNumber, fields }: { orderNumber: string; fields: Field[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success-soft px-4 py-3.5">
        <CircleCheckBig className="size-5 shrink-0 text-success" strokeWidth={2.25} />
        <div className="min-w-0">
          <div className="text-label font-medium text-success">Order number</div>
          <div className="font-mono text-title font-semibold tracking-tight text-text">{orderNumber}</div>
        </div>
      </div>
      <FactList fields={fields} />
    </div>
  );
}

/** Past orders (e.g. Morton's successful orders this week). Each row can carry a
 *  Reorder button that PREFILLS the prompt box with `/reorder <number>` rather
 *  than sending it, so the rep sees the skill + order number, then hits Enter. */
function OrderList({ rows, reorderLabel = "Reorder" }: { rows: OrderRow[]; reorderLabel?: string }) {
  const prefill = useChat((s) => s.prefill);
  const busy = useBusy();
  const hasReorder = rows.some((r) => r.reorderPrefill);
  return (
    <TableFrame>
      <thead>
        <tr>
          <th className={`${TH} text-left`}>Order</th>
          <th className={`${TH} text-left`}>Items</th>
          <th className={`${TH} text-right`}>Total</th>
          <th className={`${TH} text-right`}>Status</th>
          {hasReorder && <th className={`${TH} text-right`} />}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.number} className="border-t border-border align-middle">
            <td className="py-3">
              <div className="font-mono text-label text-app-link">{r.number}</div>
              <div className="text-label text-text-muted">{r.placed}</div>
            </td>
            <td className="py-3 text-text-muted">{r.items}</td>
            <td className="py-3 text-right font-medium tabular-nums text-text">{r.total}</td>
            <td className="py-3 text-right">
              <InsightPill pill={r.status} />
            </td>
            {hasReorder && (
              <td className="py-3 pl-2 text-right">
                {r.reorderPrefill && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => prefill(r.reorderPrefill!)}
                    className="whitespace-nowrap inline-flex h-8 items-center gap-1.5 rounded-full border border-app-link/50 px-3 text-label font-medium text-app-link transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-info-soft disabled:opacity-50"
                  >
                    <Repeat className="size-4" strokeWidth={2} />
                    {reorderLabel}
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </TableFrame>
  );
}

/** The detailed order lookup: headline figures, where and how it ships, then
 *  the line items with the totals breakdown under them. */
function OrderDetail({
  kpis,
  placedBy,
  fields,
  lines,
  totals,
}: {
  kpis: Kpi[];
  placedBy?: { name: string; email: string; initial: string; onBehalfOf: string };
  fields: Field[];
  lines: LineRow[];
  totals: SummaryRow[];
}) {
  return (
    <div className="space-y-6">
      <KpiTiles items={kpis} />
      {placedBy && (
        <div>
          <SectionLabel>Ordered by</SectionLabel>
          <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-avatar text-[15px] font-medium text-text">
              {placedBy.initial}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-body font-medium text-text">{placedBy.name}</div>
              <div className="truncate text-label text-text-muted">{placedBy.email}</div>
            </div>
            <InsightPill pill={{ label: `On behalf of ${placedBy.onBehalfOf}`, tone: "info" }} />
          </div>
        </div>
      )}
      <div>
        <SectionLabel>Shipping</SectionLabel>
        <FactList fields={fields} />
      </div>
      <div className="space-y-5">
        <div>
          <SectionLabel>Line items</SectionLabel>
          <LineTable lines={lines} />
        </div>
        <TotalsBlock rows={totals} />
      </div>
    </div>
  );
}

/* ── Shared primitives ────────────────────────────────────────────────────
 * On the insight type scale: 18px titles, 16px rows and values, 14px labels
 * (the floor), pills via `InsightPill`. */

/** A section label inside a card, one step under the card title. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h4 className="mb-3 text-body font-semibold text-text">{children}</h4>;
}

/** Shared column-header cell classes — sentence-case, medium-grey, on the grey
 *  header band (see `TableFrame`), matching the Salesforce list-view header. */
const TH = "bg-elevated py-2.5 text-label font-medium text-text-muted";

/**
 * TableFrame — a Salesforce-style data table shell: a hairline-bordered,
 * rounded container with a grey header band (the `thead` cells carry
 * `bg-elevated`) and consistent cell padding. Row dividers come from the body
 * rows' `border-t`. Wrap any slot table in this for the SF list-view look.
 */
function TableFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full border-collapse text-body [&_td]:px-4 [&_th]:px-4">{children}</table>
    </div>
  );
}

/** Facts as a definition list: a muted label column, the value beside it.
 *  Values wrap (a two-line address, a long email) rather than truncate. */
function FactList({ fields }: { fields: Field[] }) {
  return (
    <dl className="divide-y divide-border rounded-lg border border-border">
      {fields.map((f) => (
        <div key={f.label} className="grid grid-cols-[148px_minmax(0,1fr)] gap-4 px-4 py-3">
          <dt className="text-label leading-6 text-text-muted">{f.label}</dt>
          <dd
            className={`min-w-0 whitespace-pre-line break-words text-text ${
              f.mono ? "font-mono text-label leading-6" : "text-body"
            } ${f.strong ? "font-semibold" : ""}`}
          >
            {f.pill ? <InsightPill pill={f.pill} /> : f.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** A short row of facts side by side (label over value), one cell each. */
function FactStrip({ fields }: { fields: Field[] }) {
  return (
    <div
      className="grid gap-px overflow-hidden rounded-lg border border-border bg-border"
      style={{ gridTemplateColumns: `repeat(${fields.length}, minmax(0, 1fr))` }}
    >
      {fields.map((f) => (
        <div key={f.label} className="space-y-1 bg-surface px-4 py-3">
          <div className="text-label text-text-muted">{f.label}</div>
          {f.pill ? <InsightPill pill={f.pill} /> : <div className="text-body font-medium text-text">{f.value}</div>}
        </div>
      ))}
    </div>
  );
}

/**
 * A primary (brand-accent) or secondary (neutral) action button inside a slot.
 *
 * Two click behaviors, by the app-vs-chat split:
 *   - `sendPrompt` → posts a **user message** (as if the merchant typed it), so
 *     the request reads as the merchant asking Claude. Used by the per-row "Add
 *     free sample" button: the merchant is asking to add that item.
 *   - `actionKey` → plays a scripted beat with **no user bubble** (`runAction`),
 *     for confirming/executing a prepared action in the app (e.g. "Make
 *     live" — the app does the thing, it's not a chat request).
 */
function ActionButton({
  label,
  actionKey,
  sendPrompt,
  variant = "primary",
  icon: Icon,
  size = "md",
  disabled = false,
  onDone,
}: {
  label: string;
  actionKey?: string;
  sendPrompt?: string;
  variant?: "primary" | "secondary";
  icon?: typeof Gift;
  size?: "sm" | "md";
  disabled?: boolean;
  /** Called after the click is handled (e.g. to lock a one-shot picker). */
  onDone?: () => void;
}) {
  const runAction = useChat((s) => s.runAction);
  const send = useChat((s) => s.send);
  const busy = useBusy();
  // Done already if a chip fired this button's action for this message.
  const fired = useFired(useMessageId(), actionKey?.split("|")[0]);
  const onClick = () => {
    if (sendPrompt) send(sendPrompt);
    else if (actionKey) runAction(actionKey);
    onDone?.();
  };
  // SLDS brand colors on the insight button shape: a solid brand-blue primary
  // (darker on hover) and an outline-brand secondary for per-row Add actions.
  const base =
    "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] disabled:opacity-50";
  const sizing = size === "sm" ? "h-8 px-3 text-label" : "h-9 px-4 text-body";
  const skin =
    variant === "primary"
      ? "bg-app-link text-white hover:brightness-95"
      : "border border-app-link/50 text-app-link hover:bg-info-soft";
  return (
    <button type="button" disabled={busy || disabled || fired} onClick={onClick} className={`${base} ${sizing} ${skin}`}>
      {Icon && <Icon className="size-4" strokeWidth={2} />}
      {label}
    </button>
  );
}

/* ── Views ────────────────────────────────────────────────────────────── */

/** Step 1 — pending quotes. */
function QuoteList({ rows }: { rows: QuoteRow[] }) {
  return (
    <TableFrame>
      <thead>
        <tr>
          <th className={`${TH} text-left`}>Quote</th>
          <th className={`${TH} text-left`}>Buyer account</th>
          <th className={`${TH} text-left`}>Expires</th>
          <th className={`${TH} text-right`}>Total</th>
          <th className={`${TH} text-right`}>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.number} className="border-t border-border">
            <td className="py-3 font-medium tabular-nums text-app-link">{r.number}</td>
            <td className="py-3 text-text">{r.buyer}</td>
            <td className="py-3 text-text-muted">{r.expires}</td>
            <td className="py-3 text-right font-medium tabular-nums text-text">{r.total}</td>
            <td className="py-3 text-right">
              <InsightPill pill={r.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </TableFrame>
  );
}

/** A product name with its quiet second line (SKU or family) and any pill. */
function ProductCell({ name, detail, pill }: { name: string; detail?: string; pill?: Pill }) {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-text">{name}</span>
        {pill && <InsightPill pill={pill} />}
      </div>
      {detail && <div className="text-label text-text-muted">{detail}</div>}
    </div>
  );
}

/** A line-item table (quote, cart, order). */
function LineTable({ lines }: { lines: LineRow[] }) {
  const hasDiscount = lines.some((l) => l.discount);
  return (
    <TableFrame>
      <thead>
        <tr>
          <th className={`${TH} text-left`}>Product</th>
          <th className={`${TH} text-right`}>Qty</th>
          <th className={`${TH} text-right`}>List</th>
          {hasDiscount && <th className={`${TH} text-right`}>Discount</th>}
          <th className={`${TH} text-right`}>Total</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((l) => (
          <tr key={l.id} className="border-t border-border align-top">
            <td className="py-3">
              <ProductCell name={l.product} detail={l.detail} pill={l.free ? { label: "Free", tone: "success" } : undefined} />
            </td>
            <td className="py-3 text-right tabular-nums text-text-muted">{l.qty}</td>
            <td className="py-3 text-right tabular-nums text-text-muted">{l.list}</td>
            {hasDiscount && <td className="py-3 text-right tabular-nums text-text-muted">{l.discount ?? "–"}</td>}
            <td className="py-3 text-right font-medium tabular-nums text-text">{l.total}</td>
          </tr>
        ))}
      </tbody>
    </TableFrame>
  );
}

/** Step 2 — quote detail: where it sits in its lifecycle, the headline
 *  figures, the buyer's note, then the line items. */
function QuoteDetail({
  kpis,
  lines,
  steps,
  current,
  buyerNote,
}: {
  kpis: Kpi[];
  lines: LineRow[];
  steps?: string[];
  current?: string;
  buyerNote?: { author: string; body: string };
}) {
  return (
    <div className="space-y-6">
      {steps && current && <PathBar steps={steps} currentIdx={steps.indexOf(current)} />}
      <KpiTiles items={kpis} />
      {buyerNote && <BuyerNote author={buyerNote.author} body={buyerNote.body} />}
      <div>
        <SectionLabel>Line items</SectionLabel>
        <LineTable lines={lines} />
      </div>
    </div>
  );
}

/** A note the buyer attached to the quote for the merchant (incoming). Rendered
 *  as a quiet callout with a message glyph, the body, and the buyer attribution
 *  underneath — reads as "the buyer said this," not a merchant-authored field. */
function BuyerNote({ author, body }: { author: string; body: string }) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-elevated px-4 py-3.5">
      <div className="flex items-center gap-1.5 text-label font-semibold text-text-muted">
        <MessageSquareText className="size-4" strokeWidth={2} />
        Note from buyer
      </div>
      <p className="text-body text-text">{body}</p>
      <div className="text-label text-text-muted">{author}</div>
    </div>
  );
}

/** Step 3 — entitled products (expandable to the full catalog). The scope
 *  (account, policy, price book) sits in the card subtitle. */
function Entitlement({
  view,
  fullscreen,
}: {
  view: Extract<SlotView, { kind: "entitlement" }>;
  fullscreen: boolean;
}) {
  const { products, inlineCount, addLabel, cartPicker } = view;
  const shown = fullscreen || inlineCount == null ? products : products.slice(0, inlineCount);
  const [picked, setPicked] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const toggle = (name: string) =>
    setPicked((ps) => (ps.includes(name) ? ps.filter((n) => n !== name) : [...ps, name]));
  // In catalog order, joined as "A, B and C".
  const names = products.map((p) => p.product).filter((n) => picked.includes(n));
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0];
  return (
    <div className="space-y-3">
      {/* Inline, the count is in the card footer; only the full catalog says it here. */}
      {fullscreen && <p className="text-label text-text-muted">{products.length} of 100+ entitled products</p>}
      <TableFrame>
        <thead>
          <tr>
            {cartPicker && <th className={`${TH} w-8`} />}
            <th className={`${TH} text-left`}>Product</th>
            <th className={`${TH} text-right`}>Price</th>
            {addLabel && <th className={`${TH} text-right`} />}
          </tr>
        </thead>
        <tbody>
          {shown.map((p, i) => (
            <ProductRowView
              key={p.id ?? `${p.product}-${i}`}
              product={p}
              addLabel={addLabel}
              pick={cartPicker && { on: picked.includes(p.product), toggle: () => !sent && toggle(p.product) }}
            />
          ))}
        </tbody>
      </TableFrame>
      {cartPicker && (
        <div className="flex items-center justify-end gap-3 pt-1">
          <span className="text-label text-text-muted">
            {picked.length ? `${picked.length} selected` : "Select the products to add"}
          </span>
          <ActionButton
            label={picked.length ? `Add ${picked.length} to cart` : "Add to cart"}
            icon={ShoppingCart}
            sendPrompt={`${cartPicker.prompt} ${list}.`}
            disabled={!picked.length || sent}
            onDone={() => setSent(true)}
          />
        </div>
      )}
    </div>
  );
}

/** A checkbox square, ticked in brand blue (same as the export picker). */
function CheckSquare({ on }: { on: boolean }) {
  return (
    <span
      className={`grid size-[18px] shrink-0 place-items-center rounded border transition-colors duration-[var(--dur-fast)] ${
        on ? "border-app-link bg-app-link text-white" : "border-prompt-border bg-surface"
      }`}
    >
      {on && <Check className="size-3.5" strokeWidth={3} />}
    </span>
  );
}

function ProductRowView({
  product,
  addLabel,
  pick,
}: {
  product: ProductRow;
  addLabel?: string;
  /** Cart picker: the row is a checkbox (click anywhere on it to toggle). */
  pick?: { on: boolean; toggle: () => void };
}) {
  // The "Add free sample" button posts a user message naming this product, so
  // it reads as the merchant asking Claude to add it (not a silent app action);
  // Claude checks the margin, then adds it. Claude's pick carries a
  // Recommended pill, its reason under the name, and the primary button.
  const addPrompt = `Add the ${product.product} as a free sample.`;
  return (
    <tr
      className={`border-t border-border align-middle ${pick ? "cursor-pointer transition-colors duration-[var(--dur-fast)] hover:bg-elevated/60" : ""}`}
      onClick={pick?.toggle}
      role={pick ? "checkbox" : undefined}
      aria-checked={pick?.on}
    >
      {pick && (
        <td className="py-3 pl-1 pr-2">
          <CheckSquare on={pick.on} />
        </td>
      )}
      <td className="py-3">
        {product.recommended ? (
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-text">{product.product}</span>
              <RecommendedPill why={product.recommended.why} />
            </div>
            <div className="text-label text-text-muted">{product.recommended.reason}</div>
          </div>
        ) : (
          <ProductCell name={product.product} detail={product.family} />
        )}
      </td>
      <td className="whitespace-nowrap py-3 text-right tabular-nums">
        {product.listPrice && <span className="mr-2 text-label text-text-subtle line-through">{product.listPrice}</span>}
        <span className="text-text">{product.price}</span>
      </td>
      {addLabel && (
        <td className="py-3 pl-2 text-right">
          {product.onQuote ? (
            <InsightPill pill={{ label: "On quote", tone: "neutral" }} />
          ) : (
            <ActionButton
              label={addLabel}
              sendPrompt={addPrompt}
              variant={product.recommended ? "primary" : "secondary"}
              size="sm"
              icon={Gift}
            />
          )}
        </td>
      )}
    </tr>
  );
}

/** The Recommended pill on Claude's pick. Hover (or focus) opens a light
 *  popover below it with Claude's reasons, one per line. */
function RecommendedPill({ why }: { why: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex cursor-default"
      tabIndex={0}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <InsightPill pill={{ label: "Recommended", tone: "info" }} />
      {open && (
        <div
          role="tooltip"
          className="absolute left-0 top-full z-20 mt-2 w-[300px] rounded-lg border border-border bg-surface px-3.5 py-3 shadow-md"
        >
          <div className="mb-1.5 text-label font-semibold text-text">Why Claude recommends it</div>
          <ul className="space-y-1">
            {why.map((w) => (
              <li key={w} className="flex gap-2 text-label text-text-muted">
                <Check className="mt-0.5 size-3.5 shrink-0 text-success" strokeWidth={3} />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </span>
  );
}

/** What changed: one row per figure, "before → after" when it moved (the new
 *  value emphasized) and "No change" beside the value when it held. */
function ChangeRows({ deltas }: { deltas: DeltaRow[] }) {
  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {deltas.map((d) => (
        <li key={d.label} className="flex items-center justify-between gap-4 px-4 py-3 text-body">
          <span className={d.emphasize ? "font-semibold text-text" : "text-text-muted"}>{d.label}</span>
          <span className="flex items-center gap-2 tabular-nums">
            {d.before !== d.after ? (
              <>
                <span className="text-text-muted">{d.before}</span>
                <ArrowRight className="size-4 text-text-subtle" strokeWidth={2} aria-label="to" />
                <span className="font-semibold text-text">{d.after}</span>
              </>
            ) : (
              <>
                <span className="text-label text-text-muted">No change</span>
                <span className={`text-text ${d.emphasize ? "font-semibold" : ""}`}>{d.after}</span>
              </>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The committed free sample line + how the quote's figures moved. */
function SampleResult({ line, deltas }: { line: LineRow; deltas: DeltaRow[] }) {
  return (
    <div className="space-y-6">
      <LineTable lines={[line]} />
      <div>
        <SectionLabel>Quote totals</SectionLabel>
        <ChangeRows deltas={deltas} />
      </div>
    </div>
  );
}

/** A merge-field chunk — a dynamic value that resolves at send time (here, the
 *  buyer's first name). Styled like the composer's skill chunks so it reads as a
 *  token, not literal text. */
function MergeField({ label }: { label: string }) {
  return (
    <span className="mx-0.5 inline-flex items-center rounded bg-skill-chunk px-1.5 py-0.5 align-baseline font-mono text-label text-text-muted">
      {label}
    </span>
  );
}

/** Step 5 — a buyer-visible note, shown as the buyer sees it on the storefront.
 *  The "Buyer note" title and the "Visible to buyer" pill live in the card
 *  heading (via `heading` / `headingPill`), so the body is just the preview. A
 *  `{name}` token in the body renders as a merge-field chunk (the buyer's first
 *  name), so the merchant sees it will be personalized at send time. */
function NoteCard({ title, body, mergeLabel }: { title: string; body: string; mergeLabel?: string }) {
  const segments = body.split("{name}");
  return (
    <div className="space-y-2 rounded-lg border border-border bg-bg px-4 py-4">
      <div className="text-body font-semibold text-text">{title}</div>
      <p className="whitespace-pre-line text-body text-text-muted">
        {segments.map((seg, i) => (
          <Fragment key={i}>
            {seg}
            {i < segments.length - 1 && <MergeField label={mergeLabel ?? "First name"} />}
          </Fragment>
        ))}
      </p>
    </div>
  );
}

/** Step 6 — the approval path (SLDS-style chevrons) + the approved quote's
 *  key facts. Nothing changed on approval, so there's no before/after.
 *
 * The status indicator echoes the Salesforce Lightning **Path** component: a row
 * of interlocking chevrons where completed stages fill SF green, the current
 * stage fills SF blue (green once it's the final stage, e.g. Approved), and
 * upcoming stages sit muted. This is one of the permitted brand liberties
 * (status accents inside app content). */
function Approval({ steps, current, facts }: { steps: string[]; current: string; facts: Field[] }) {
  return (
    <div className="space-y-5">
      <PathBar steps={steps} currentIdx={steps.indexOf(current)} />
      <FactStrip fields={facts} />
    </div>
  );
}

/** SLDS Path — interlocking chevron stages. */
function PathBar({ steps, currentIdx }: { steps: string[]; currentIdx: number }) {
  // Chevron geometry: a right-pointing arrow with a matching left notch so the
  // stages tessellate. First stage has a flat left edge; last, a flat right edge.
  const clipFor = (i: number, last: boolean) => {
    // Right edge: a chevron point (non-last) or a flat edge (last).
    const rightTop = last ? "100% 0" : "calc(100% - 13px) 0";
    const rightDown = last ? "100% 100%" : "100% 50%, calc(100% - 13px) 100%";
    // Left edge: a notch on every stage but the first.
    const notch = i === 0 ? "" : ", 13px 50%";
    return `polygon(0 0, ${rightTop}, ${rightDown}, 0 100%${notch})`;
  };

  return (
    <div className="flex items-stretch text-label font-medium">
      {steps.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const last = i === steps.length - 1;
        // Reaching the final stage completes the path, so it fills green too.
        const skin = active && !last
          ? "bg-app-link text-white"
          : done || active
            ? "bg-success text-white"
            : "bg-elevated text-text-muted";
        return (
          <div
            key={step}
            // -10px overlap (vs the 13px chevron depth) leaves a ~3px diagonal
            // sliver of background between stages, so two greens stay distinct.
            style={{ clipPath: clipFor(i, last), marginLeft: i ? -10 : 0 }}
            className={`flex flex-1 items-center gap-1.5 py-2 pr-3 ${i ? "pl-7" : "pl-3.5"} ${skin}`}
          >
            {(done || active) && <Check className="size-4 shrink-0" strokeWidth={3} />}
            <span className="truncate">{step}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Bar-fill colors by tone — the app-link (Salesforce blue) is the default. */
const BAR_FILL: Record<Tone, string> = {
  neutral: "bg-text-subtle",
  success: "bg-success",
  info: "bg-app-link",
  warning: "bg-warning",
  danger: "bg-danger",
};

/**
 * ChartView — the `chart` floating view. Inline (in the transcript) it's the
 * headline figures over one bar chart; expanded to full screen it becomes the
 * richer account-360 **report** (adds the account table + spend-by-family),
 * when the view carries a `report`.
 */
function ChartView({
  view,
  fullscreen,
}: {
  view: Extract<SlotView, { kind: "chart" }>;
  fullscreen: boolean;
}) {
  if (fullscreen && view.report) return <ChartReportView view={view} report={view.report} />;
  return (
    <div className="space-y-6">
      {view.kpis && <KpiTiles items={view.kpis} />}
      <BarChart bars={view.bars} caption={view.caption} meta={view.meta} />
    </div>
  );
}

/** The bar rows of a chart — a left-aligned label, a proportional bar, and the
 *  formatted value at the bar's end. Reused by the inline chart and the report. */
function BarChartBars({ bars }: { bars: ChartBar[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...bars.map((b) => b.value), 1);
  // Floor at 3% so a tiny value still shows a sliver of bar.
  const share = (b: ChartBar) => Math.max((b.value / max) * 0.85, 0.03);
  return (
    <div className="space-y-3">
      {bars.map((b, i) => (
        <div
          key={b.label}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          className="grid grid-cols-[148px_1fr] items-center gap-4"
        >
          <div className="truncate text-body text-text-muted">{b.label}</div>
          <div className="relative flex items-center gap-3">
            <div
              // Dim the other bars so the hovered one holds the focus.
              className={`h-5 rounded-sm ${BAR_FILL[b.tone ?? "info"]} transition-opacity duration-[var(--dur-fast)] ${hover != null && hover !== i ? "opacity-35" : ""}`}
              style={{ width: `${share(b) * 100}%` }}
            />
            <span className="shrink-0 text-body font-semibold tabular-nums text-text">{b.display}</span>
            {hover === i && b.hover && <BarHoverTip lines={b.hover} at={share(b)} />}
          </div>
        </div>
      ))}
    </div>
  );
}

/** A bar's hover annotation, anchored above the end of the bar. */
function BarHoverTip({ lines, at }: { lines: string[]; at: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0">
      {width > 0 && <ChartTooltip x={at * width} y={0} width={width} lines={lines} />}
    </div>
  );
}

/** A simple horizontal bar chart (label + bars + optional meta line) — the
 *  inline/compact form of a `chart` view. No axes or gridlines, by design. */
function BarChart({ bars, caption, meta }: { bars: ChartBar[]; caption?: string; meta?: string }) {
  return (
    <div>
      {caption && <SectionLabel>{caption}</SectionLabel>}
      <BarChartBars bars={bars} />
      {meta && <p className="mt-3 text-label text-text-muted">{meta}</p>}
    </div>
  );
}

/** The per-buyer-account breakdown table (SF list-view style, grey header). */
function AccountTable({ rows }: { rows: AccountStat[] }) {
  return (
    <TableFrame>
      <thead>
        <tr>
          <th className={`${TH} text-left`}>Buyer account</th>
          <th className={`${TH} text-right`}>Orders</th>
          <th className={`${TH} text-right`}>Spend</th>
          <th className={`${TH} text-right`}>Share</th>
          <th className={`${TH} text-right`}>Last order</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.account} className="border-t border-border">
            <td className="py-3 text-text">{r.account}</td>
            <td className="py-3 text-right tabular-nums text-text-muted">{r.orders}</td>
            <td className="py-3 text-right font-medium tabular-nums text-text">{r.spend}</td>
            <td className="py-3 text-right tabular-nums text-text-muted">{r.share}</td>
            <td className="py-3 text-right text-text-muted">{r.lastOrder}</td>
          </tr>
        ))}
      </tbody>
    </TableFrame>
  );
}

/**
 * ChartReportView — the full-screen account-360 report: the headline figures,
 * the spend-by-buyer-account chart, a per-account breakdown table, and a
 * spend-by-family chart. Shown only when the floating chart is expanded.
 */
function ChartReportView({
  view,
  report,
}: {
  view: Extract<SlotView, { kind: "chart" }>;
  report: ChartReport;
}) {
  return (
    <div className="space-y-8">
      {view.kpis && <KpiTiles items={view.kpis} />}
      <BarChart bars={view.bars} caption={view.caption} meta={view.meta} />
      {report.accounts && report.accounts.length > 0 && (
        <div>
          <SectionLabel>Account breakdown</SectionLabel>
          <AccountTable rows={report.accounts} />
        </div>
      )}
      {report.families && report.families.length > 0 && (
        <BarChart bars={report.families} caption={report.familiesCaption ?? "Spend by product family"} />
      )}
    </div>
  );
}
