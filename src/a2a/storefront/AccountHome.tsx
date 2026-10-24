import { ChevronRight, Users } from "lucide-react";
import mike from "../../assets/a2a/mike.png";
import type { ReactNode } from "react";
import { copy } from "../../copy/copy";
import { ProductPhoto } from "./Photo";
import { PHOTOS } from "./photos";
import { ICONS } from "./icons";
import { AgentMark, Footer, Header } from "./parts";
import { useSite } from "./site";
import "./storefront.css";

const t = copy.a2a.storefront.accountHome;

/** Visuals for the copy's lists, in the same order: orange, lemon, cola. */
const AGAIN_PHOTOS = [PHOTOS.orange, PHOTOS.lemonade, PHOTOS.colaSyrup];
const STATUS_DOT: Record<string, string> = {
  "In transit": "#2f8fd8",
  Delivered: "#2e8540",
};

/**
 * AccountHome — Fizz Partners once John is logged in: the store becomes his
 * buying desk. In the store's language (grey page, white cards, pills), but
 * working rather than selling: a greeting, then, a moment after he logs in,
 * Mike's new cart (story step 1: it arrives with the bell's dot and a ding,
 * with Open cart and Assign to your agent, which opens his agent's chat with
 * the cart), quick actions, his carts (the shared
 * one first), his account (credit, terms, next delivery), what he buys again,
 * and his recent orders. No prices yet.
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
 *  notification arrives, its value large on a line of its own. Open it, or hand it to his agent. */
function Notice() {
  const n = t.notice;
  const { openAgent, notified } = useSite();
  return (
    <div className="sf-arrive" data-shown={notified || undefined} inert={!notified}>
      <div className="overflow-hidden">
        <div className="sf-arrive-card mt-5 rounded-2xl bg-white p-4">
          <div className="flex gap-3">
            <img src={mike} alt={n.from} className="size-10 shrink-0 rounded-full bg-[#f2f2f4] object-cover" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2">
                <span className="text-[16px] font-bold tracking-[-0.01em] text-text">{n.title}</span>
                <span aria-hidden className="size-2 rounded-full bg-[var(--fizz-red)]" />
                <span className="ml-auto text-[13px] text-text-muted">{n.time}</span>
              </p>
              <p className="mt-0.5 text-[14px] leading-normal text-text-muted">{n.body}</p>
              <p className="mt-2.5 flex items-baseline gap-2">
                <span className="text-[24px] font-bold tabular-nums tracking-[-0.02em] text-text">{n.value}</span>
                <span className="text-[13px] text-text-muted">{n.valueLabel}</span>
              </p>
            </div>
          </div>
          <button type="button" className="sf-pill sf-pill-dark mt-4 w-full">
            {n.cta}
          </button>
          <button type="button" onClick={() => openAgent(true)} className="sf-pill sf-pill-outline mt-2 w-full gap-2">
            <AgentMark className="-ml-1 size-7 bg-transparent!" />
            {n.assign}
          </button>
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
  return (
    <Block title={c.title} all={c.all}>
      <ul>
        {c.items.map((cart) => (
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
                  {cart.meta} · {cart.lines}
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
  return (
    <Block title={a.title}>
      <div className="py-4">
        <p className="text-[14px] text-text-muted">{a.credit.label}</p>
        <p className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-[28px] font-bold tracking-[-0.025em] text-text">{a.credit.value}</span>
          <span className="text-[14px] text-text-muted">{a.credit.of}</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eeeeee]" aria-hidden>
          <div className="h-full rounded-full bg-[#1d1d1f]" style={{ width: `${a.credit.share * 100}%` }} />
        </div>
      </div>
      <dl>
        {a.rows.map((r) => (
          <div
            key={r.label}
            className="flex h-12 items-center justify-between border-t border-black/[0.08] text-[15px]"
          >
            <dt className="text-text-muted">{r.label}</dt>
            <dd className="font-semibold text-text">{r.value}</dd>
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
  return (
    <Block title={o.title} all={o.all}>
      <ul>
        {o.items.map((order) => (
          <li key={order.id} className={ROW}>
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
