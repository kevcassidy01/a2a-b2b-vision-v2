import { Check, ChevronRight, FileText, Users } from "lucide-react";
import mike from "../../assets/a2a/mike.png";
import type { ReactNode } from "react";
import { copy } from "../../copy/copy";
import { ProductPhoto } from "./Photo";
import { PHOTOS } from "./photos";
import { ICONS } from "./icons";
import { AgentMark, Footer, Header, OrderChecklist } from "./parts";
import { Rich } from "../Rich";
import { useSite } from "./site";
import { useStory } from "../story";
import "./storefront.css";

const t = copy.a2a.storefront.accountHome;

/** Visuals for the copy's lists, in the same order: orange, lemon, cola. */
const AGAIN_PHOTOS = [PHOTOS.orange, PHOTOS.lemonade, PHOTOS.colaSyrup];
const STATUS_DOT: Record<string, string> = {
  "In transit": "#2f8fd8",
  Delivered: "#2e8540",
  Confirmed: "#1d1d1f",
};

/**
 * AccountHome — Fizz Partners once John is logged in: the store becomes his
 * buying desk. In the store's language (grey page, white cards, pills), but
 * working rather than selling: a greeting, then, a moment after he logs in,
 * Mike's new cart (story step 1, started by Mike's agent from Fizz's
 * Oktoberfest offer: it arrives with the bell's dot and a ding,
 * with Open cart and Assign to your agent, which opens his agent's chat with
 * the cart), quick actions, his carts (the shared
 * one first), his account (credit, terms, next delivery), what he buys again,
 * and his recent orders. No prices yet.
 *
 * Behind the agent's sheet, it follows the story as Alex's dashboard does:
 * Mike's cart shows where it's got to, the cart grows as the agent tops it up,
 * Q-1042 is an open quote, and once O-5531 is placed the cart leaves the list,
 * the order heads Recent orders and the credit drops. Each change gets the wash.
 */
export function AccountHome() {
  return (
    <div className="sf-page isolate min-h-full">
      <Header signedIn />
      <section className="px-4 pt-6">
        <h1 className="sf-display text-[34px] leading-[1.04] text-text">{t.greeting}</h1>
        <p className="mt-1 text-[15px] text-text-muted">{t.company}</p>
        <Notice />
        <Quick />
      </section>
      <Carts />
      <Account />
      <BuyAgain />
      <Orders />
      <Footer />
    </div>
  );
}

/** Mike's new cart: not there when John logs in, it opens in when the
 *  notification arrives, its value large on a line of its own. Open it, or hand it to his agent;
 *  once it's handed over, a chip says where it's got to. Once O-5531 is placed it becomes the
 *  order: a green check, what was placed, its total, what's in and what's to come, and the way
 *  into the order and the purchase order. */
function Notice() {
  const n = t.notice;
  const o = copy.a2a.storefront.agent.order.card;
  const { openAgent, notified, assigned } = useSite();
  const { quoteSent, v3Sent, accepted, ordered } = useStory();
  const shown = ordered ? { ...n, ...n.placed } : n;
  const status = ordered
    ? { text: n.status.ordered, dot: "#2e8540" }
    : v3Sent && !accepted
      ? { text: n.status.needsYou, dot: "#c77700" }
      : quoteSent
        ? { text: n.status.quoted, dot: "#2f8fd8" }
        : assigned
          ? { text: n.status.assigned, dot: "#2f8fd8" }
          : null;
  return (
    <div className="sf-arrive" data-shown={notified || undefined} inert={!notified}>
      <div className="overflow-hidden">
        <div key={String(ordered)} className={`sf-arrive-card mt-5 rounded-2xl bg-white p-4 ${ordered ? "sf-rise" : ""}`}>
          <div className="flex gap-3">
            {ordered ? (
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e3f3e6]">
                <Check className="size-5 text-[#1f7a3d]" strokeWidth={2.75} />
              </span>
            ) : (
              /* Mike and his agent, together: his photo, his agent's mark stacked over its right edge. */
              <span role="img" aria-label={`${n.from} and ${n.agent}`} className="flex shrink-0 items-start">
                <img src={mike} alt="" className="size-10 rounded-full bg-[#f2f2f4] object-cover" />
                <AgentMark className="-ml-3 size-10 bg-white! shadow-[0_0_0_2px_#fff,0_0_0_3px_rgb(0_0_0/0.08)]" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2">
                <span className="text-[16px] font-bold tracking-[-0.01em] text-text">{shown.title}</span>
                {!assigned && <span aria-hidden className="size-2 rounded-full bg-[var(--fizz-red)]" />}
                <span className="ml-auto text-[13px] text-text-muted">{n.time}</span>
              </p>
              <p className="mt-0.5 text-[14px] leading-normal text-text-muted">
                <Rich text={shown.body} />
              </p>
              <p className="mt-2.5 flex items-baseline gap-2">
                <span className="text-[24px] font-bold tabular-nums tracking-[-0.02em] text-text">{shown.value}</span>
                <span className="text-[13px] text-text-muted">{shown.valueLabel}</span>
              </p>
              {status && (
                <span
                  key={status.text}
                  className="a2a-bump mt-2.5 inline-flex h-7 items-center gap-1.5 rounded-full! bg-[#eeeeee] px-2.5 text-[13px] font-semibold text-text"
                >
                  <span aria-hidden className="size-2 rounded-full" style={{ background: status.dot }} />
                  {status.text}
                </span>
              )}
            </div>
          </div>
          {ordered ? (
            <>
              <OrderChecklist className="mt-4 border-t border-black/[0.08] pt-4" />
              <button type="button" className="sf-pill sf-pill-dark mt-4 w-full">
                {o.details}
              </button>
              <button type="button" className="sf-pill sf-pill-outline mt-2 w-full gap-2">
                <FileText className="size-[18px]" strokeWidth={2.25} />
                {o.po}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="sf-pill sf-pill-dark mt-4 w-full">
                {n.cta}
              </button>
              <button type="button" onClick={() => openAgent(!assigned)} className="sf-pill sf-pill-outline mt-2 w-full gap-2">
                <AgentMark className="-ml-1 size-7 bg-transparent!" />
                {assigned ? n.openAgent : n.assign}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Four shortcuts, as small white tiles. */
function Quick() {
  return (
    <ul className="mt-3 grid grid-cols-4 gap-2">
      {t.quick.map((q) => {
        const Icon = ICONS[q.icon];
        return (
          <li key={q.label}>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex h-[84px] flex-col items-center justify-center gap-2 rounded-2xl bg-white text-text"
            >
              <Icon className="size-[22px]" strokeWidth={2} />
              <span className="text-[12.5px] font-semibold">{q.label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** A titled block: a bold heading, a "see all" link if there is one, then a white card. */
function Block({ title, all, children }: { title: string; all?: string; children: ReactNode }) {
  return (
    <section className="px-4 pt-10">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-[22px] font-bold tracking-[-0.02em] text-text">{title}</h2>
        {all && (
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-[15px] font-semibold text-text underline underline-offset-4"
          >
            {all}
          </a>
        )}
      </div>
      <div className="mt-3 rounded-2xl bg-white px-4">{children}</div>
    </section>
  );
}

const ROW = "[&:not(:last-child)]:border-b [&:not(:last-child)]:border-black/[0.08]";

function Carts() {
  const c = t.carts;
  const { quoteSent, heldOut, ordered } = useStory();
  // The Oktoberfest cart (the first) grows as the agent works it, and goes once it's an order.
  const lines = heldOut ? c.lines.countered : quoteSent ? c.lines.quoted : null;
  const items = ordered ? c.items.slice(1) : c.items;
  return (
    <Block title={c.title} all={c.all}>
      <ul>
        {items.map((cart, i) => (
          <li key={cart.name} className={ROW}>
            <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-3 py-4">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2">
                  <span className="truncate text-[16px] font-bold tracking-[-0.01em] text-text">{cart.name}</span>
                  {"shared" in cart && (
                    <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-[#eeeeee] px-2 text-[12px] font-semibold text-text">
                      <Users className="size-3.5" strokeWidth={2.25} />
                      {cart.shared}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[14px] text-text-muted">
                  {cart.meta} ·{" "}
                  {i === 0 && "shared" in cart && lines ? (
                    <span key={lines} className="a2a-bump">{lines}</span>
                  ) : (
                    cart.lines
                  )}
                </p>
              </div>
              <ChevronRight className="size-[18px] shrink-0 text-text-muted" strokeWidth={2.25} />
            </a>
          </li>
        ))}
      </ul>
    </Block>
  );
}

/** Credit first, the bar filled to the share still available, then the terms and what's next. */
function Account() {
  const a = t.account;
  const { quoteSent, ordered } = useStory();
  const credit = ordered ? { ...a.credit, ...a.creditAfter } : a.credit;
  const quoteOpen = quoteSent && !ordered;
  return (
    <Block title={a.title}>
      <div className="py-4">
        <p className="text-[14px] text-text-muted">{a.credit.label}</p>
        <p className="mt-0.5 flex items-baseline gap-1.5">
          <span key={credit.value} className={`text-[28px] font-bold tracking-[-0.025em] text-text ${ordered ? "a2a-bump" : ""}`}>
            {credit.value}
          </span>
          <span className="text-[14px] text-text-muted">{a.credit.of}</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eeeeee]" aria-hidden>
          <div className="h-full rounded-full bg-[#1d1d1f]" style={{ width: `${credit.share * 100}%` }} />
        </div>
      </div>
      <dl>
        {a.rows.map((r) => (
          <div
            key={r.label}
            className="flex h-12 items-center justify-between border-t border-black/[0.08] text-[15px]"
          >
            <dt className="text-text-muted">{r.label}</dt>
            {r.label === a.rows[2].label ? (
              <dd key={String(quoteOpen)} className={`font-semibold text-text ${quoteSent ? "a2a-bump" : ""}`}>
                {quoteOpen ? a.openQuote : r.value}
              </dd>
            ) : (
              <dd className="font-semibold text-text">{r.value}</dd>
            )}
          </div>
        ))}
      </dl>
    </Block>
  );
}

function BuyAgain() {
  const b = t.buyAgain;
  return (
    <Block title={b.title}>
      <ul>
        {b.items.map((p, i) => (
          <li key={p.name} className={`flex items-center gap-3 py-4 ${ROW}`}>
            <ProductPhoto photo={AGAIN_PHOTOS[i]} pad="3px" className="size-12 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-bold tracking-[-0.01em] text-text">{p.name}</p>
              <p className="text-[14px] text-text-muted">{p.pack}</p>
              <p className="text-[13px] text-text-muted">{p.last}</p>
            </div>
            <button type="button" className="sf-pill sf-pill-outline sf-pill-sm">
              {b.add}
            </button>
          </li>
        ))}
      </ul>
    </Block>
  );
}

function Orders() {
  const o = t.orders;
  const { ordered } = useStory();
  const items = ordered ? [o.placed, ...o.items] : o.items;
  return (
    <Block title={o.title} all={o.all}>
      <ul>
        {items.map((order) => (
          <li key={order.id} className={`${ROW} ${order === o.placed ? "a2a-bump" : ""}`}>
            <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-3 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-bold tracking-[-0.01em] text-text">{order.id}</p>
                <p className="mt-0.5 text-[14px] text-text-muted">
                  {order.date} · {order.total}
                </p>
              </div>
              <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#eeeeee] px-2.5 text-[13px] font-semibold text-text">
                <span aria-hidden className="size-2 rounded-full" style={{ background: STATUS_DOT[order.status] }} />
                {order.status}
              </span>
              <ChevronRight className="size-[18px] shrink-0 text-text-muted" strokeWidth={2.25} />
            </a>
          </li>
        ))}
      </ul>
    </Block>
  );
}
