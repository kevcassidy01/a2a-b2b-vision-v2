import {
  ArrowRight,
  BadgePercent,
  CalendarClock,
  Lock,
  Menu,
  ReceiptText,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { copy } from "../../copy/copy";
import { Can, CanGroup, TONES, type Tone } from "./Can";
import { Hero } from "./Hero";
import "./storefront.css";

const t = copy.a2a.storefront;

/** Visuals for the copy's lists, in the same order. */
const BRAND_TONES: Tone[] = ["fizz", "zero", "bubbl", "zing", "pulp", "brew"];
const PRODUCT_TONES: Tone[] = ["fizz", "lime", "bubbl", "zing"];
const PERK_ICONS: LucideIcon[] = [BadgePercent, ReceiptText, CalendarClock];

/**
 * Storefront — Fizz Drinks' B2B store on John's phone, before he logs in. In
 * Coca-Cola's design language: a light grey page, white cards with big radii,
 * bold centred headings, black pill buttons. Drawn cans stand in for photos.
 */
export function Storefront() {
  return (
    <div className="sf-page sf-no-scrollbar absolute inset-0 isolate overflow-y-auto">
      <Header />
      <Hero />
      <Brands />
      <Products />
      <Feature />
      <Perks />
      <Cta />
      <Footer />
    </div>
  );
}

/** White, thin and sticky, under the status bar: the logo, Log in, the menu. */
function Header() {
  return (
    <header className="sticky top-0 z-20 bg-white pt-[54px]">
      <div className="flex h-14 items-center gap-2 px-4">
        <a href="#" aria-label={t.home} onClick={(e) => e.preventDefault()} className="mr-auto">
          <Logo />
        </a>
        <button type="button" className="sf-pill sf-pill-outline sf-pill-sm">
          {t.logIn}
        </button>
        <button
          type="button"
          aria-label={t.menu}
          className="grid size-10 place-items-center rounded-full text-text"
        >
          <Menu className="size-[22px]" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="sf-logo text-[28px]">{t.brand}</span>
      <span className="rounded-[4px] bg-text px-1 py-px text-[10px] font-bold tracking-[0.04em] text-white">
        {t.brandTag}
      </span>
    </span>
  );
}

/** A section with a bold, centred heading (and optional line under it). */
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="px-4 pt-14">
      <h2 className="text-center text-[28px] font-bold leading-tight tracking-[-0.025em] text-text">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-2 max-w-[300px] text-center text-[16px] leading-normal text-text-muted">
          {subtitle}
        </p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** A grid of white brand tiles: each one its wordmark, and the kind of drink under it. */
function Brands() {
  return (
    <Section title={t.brands.title}>
      <ul className="grid grid-cols-3 gap-3">
        {t.brands.items.map((b, i) => (
          <li key={b.name}>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex flex-col items-center gap-2"
            >
              <span className="grid aspect-square w-full place-items-center rounded-2xl bg-white">
                <span
                  className="sf-logo text-[22px]"
                  style={{ color: TONES[BRAND_TONES[i]].can }}
                >
                  {b.name}
                </span>
              </span>
              <span className="text-[13px] text-text-muted">{b.kind}</span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Best sellers: a row of product cards that scrolls sideways. Prices are behind the login. */
function Products() {
  return (
    <Section title={t.products.title} subtitle={t.products.subtitle}>
      <ul className="sf-no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4">
        {t.products.items.map((p, i) => (
          <li
            key={p.name}
            className="flex w-[220px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-white"
          >
            <div className="sf-product-shot grid h-[200px] place-items-center">
              <Can tone={PRODUCT_TONES[i]} size={140} />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-[18px] font-bold leading-snug tracking-[-0.015em] text-text">
                {p.name}
              </h3>
              <p className="mt-1 text-[14px] text-text-muted">{p.pack}</p>
              <p className="text-[14px] text-text-muted">{p.moq}</p>
              <p className="mt-4 flex items-center gap-1.5 text-[13px] font-semibold text-text">
                <Lock className="size-3.5" strokeWidth={2.25} />
                {t.products.priceGate}
              </p>
              <button type="button" className="sf-pill sf-pill-outline mt-4 self-start">
                {t.products.view}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Coca-Cola's overlap: a big coloured picture, with a white text card riding up over its bottom. */
function Feature() {
  return (
    <section className="px-4 pt-14">
      <div className="sf-feature-shot grid h-[300px] place-items-center rounded-[32px] pb-14">
        <CanGroup tones={["fizz", "zero", "lime"]} size={140} />
      </div>
      <div className="relative mx-4 -mt-16 rounded-2xl bg-white p-6">
        <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-text-muted">
          {t.feature.eyebrow}
        </p>
        <h2 className="mt-2 text-[24px] font-bold leading-tight tracking-[-0.02em] text-text">
          {t.feature.title}
        </h2>
        <p className="mt-2 text-[16px] leading-normal text-text-muted">{t.feature.body}</p>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="mt-4 inline-flex items-center gap-1.5 text-[16px] font-bold text-text underline decoration-2 underline-offset-4"
        >
          {t.feature.link}
          <ArrowRight className="size-4" strokeWidth={2.5} />
        </a>
      </div>
    </section>
  );
}

/** Why buy direct: one white card, a row per perk. */
function Perks() {
  return (
    <Section title={t.perks.title}>
      <ul className="flex flex-col rounded-2xl bg-white px-5">
        {t.perks.items.map((p, i) => {
          const Icon = PERK_ICONS[i];
          return (
            <li
              key={p.title}
              className="flex gap-4 py-5 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-black/[0.08]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#eeeeee] text-text">
                <Icon className="size-5" strokeWidth={2} />
              </span>
              <div>
                <h3 className="text-[16px] font-bold leading-snug text-text">{p.title}</h3>
                <p className="mt-0.5 text-[14px] leading-normal text-text-muted">{p.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

/** The ask: log in, or apply for an account. */
function Cta() {
  return (
    <section className="px-4 pt-14">
      <div className="flex flex-col items-center rounded-[32px] bg-white px-6 py-10 text-center">
        <h2 className="text-[28px] font-bold leading-tight tracking-[-0.025em] text-text">
          {t.cta.title}
        </h2>
        <p className="mt-2 max-w-[280px] text-[16px] leading-normal text-text-muted">
          {t.cta.body}
        </p>
        <button type="button" className="sf-pill sf-pill-dark mt-6 w-full">
          {t.logIn}
        </button>
        <button type="button" className="sf-pill sf-pill-outline mt-3 w-full">
          {t.cta.request}
        </button>
      </div>
    </section>
  );
}

/** Dense and quiet, as Coca-Cola's: the logo, links, then uppercase legal lines. */
function Footer() {
  return (
    <footer className="mt-14 bg-white px-6 pb-12 pt-10">
      <Logo />
      <ul className="mt-6 flex flex-col gap-3">
        {t.footer.links.map((l) => (
          <li key={l}>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-[16px] font-semibold text-text">
              {l}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-8 h-px bg-black/[0.08]" aria-hidden />
      <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
        {t.footer.legal.map((l) => (
          <li key={l}>
            <a href="#" onClick={(e) => e.preventDefault()}>
              {l}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[11px] uppercase tracking-[0.06em] text-text-muted">
        {t.footer.copyright}
      </p>
    </footer>
  );
}
