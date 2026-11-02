import {
  ArrowRight,
  BadgePercent,
  CalendarClock,
  ChevronRight,
  CircleDot,
  Droplet,
  Lock,
  Palette,
  ReceiptText,
  Store,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { copy } from "../../copy/copy";
import plantsPhoto from "../../assets/a2a/products/feature-plants-pouches.jpg";
import { Can, Drum, TONES, type Tone } from "./Can";
import { Hero } from "./Hero";
import { ProductPhoto } from "./Photo";
import { PHOTOS, type Photo } from "./photos";
import { Footer, Header } from "./parts";
import "./storefront.css";

const t = copy.a2a.storefront;

/** Visuals for the copy's lists, in the same order. */
const BRAND_TONES: Tone[] = ["fizz", "zero", "bubbl", "zing", "pulp", "brew"];
const PRODUCT_TONES: Tone[] = ["fizz", "zero", "cherry", "vanilla", "lime", "pulp", "lemon"];
/** Photos where we have them (every concentrate; the cola syrup), drawn otherwise. */
const PRODUCT_PHOTOS: (Photo | undefined)[] = [
  PHOTOS.original,
  PHOTOS.zero,
  PHOTOS.cherry,
  PHOTOS.vanilla,
  PHOTOS.lime,
  PHOTOS.orange,
  PHOTOS.lemonade,
];
const SYRUP_TONES: Tone[] = ["fizz", "zero", "lemon", "brew"];
const SYRUP_PHOTOS: (Photo | undefined)[] = [PHOTOS.colaSyrup];
const LAUNCH_TONES: Tone[] = ["zing", "brew"];
const LAUNCH_PHOTOS: (Photo | undefined)[] = [PHOTOS.zingMango, PHOTOS.brewPeach];
const MARKETING_ICONS: Record<string, LucideIcon> = { kit: Store, artwork: Palette, closure: CircleDot };
const PERK_ICONS: LucideIcon[] = [BadgePercent, ReceiptText, CalendarClock];

/**
 * Storefront — Fizz Partners, Fizz Drinks' B2B store, on John's phone, before he logs in (after, it's AccountHome). In
 * Coca-Cola's design language: a light grey page, white cards with big radii,
 * bold centred headings, black pill buttons. Its buyers are bottlers, so it
 * sells what they make drinks from: concentrates first, then fountain syrups,
 * cases only of new launches they can't make yet, and packaging and
 * marketing. Drawn drums and cans stand in for photos.
 * Safari (the chrome around it) does the scrolling.
 */
export function Storefront({ onLogIn }: { onLogIn: () => void }) {
  return (
    <div className="sf-page isolate min-h-full">
      <Header onLogIn={onLogIn} />
      <Hero onLogIn={onLogIn} />
      <Brands />
      <Products />
      <Feature />
      <Launches />
      <Syrups />
      <Marketing />
      <Perks />
      <Cta onLogIn={onLogIn} />
      <Footer />
    </div>
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
      <h2 className="sf-display text-center text-[32px] text-text">
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
              <span className="grid aspect-square w-full place-items-center rounded-[24px] bg-white shadow-[inset_0_0_0_1px_#e4e4e7]">
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

/** Concentrates: a row of product cards, each a drum, that scrolls sideways. Prices are behind the login. */
function Products() {
  return (
    <Section title={t.products.title} subtitle={t.products.subtitle}>
      <ProductRow
        items={t.products.items}
        shot={(i) => {
          const photo = PRODUCT_PHOTOS[i];
          return photo ? (
            <ProductPhoto photo={photo} pad="10px" className="size-full" />
          ) : (
            <Drum tone={PRODUCT_TONES[i]} size={130} />
          );
        }}
      />
    </Section>
  );
}

/** New launches: the only finished drinks, by the case, in the same cards with a can. */
function Launches() {
  return (
    <Section title={t.launches.title} subtitle={t.launches.subtitle}>
      <ProductRow
        items={t.launches.items}
        shot={(i) => {
          const photo = LAUNCH_PHOTOS[i];
          return photo ? (
            <ProductPhoto photo={photo} pad="10px" className="size-full" />
          ) : (
            <Can tone={LAUNCH_TONES[i]} size={140} />
          );
        }}
      />
    </Section>
  );
}

function ProductRow({
  items,
  shot,
}: {
  items: readonly { name: string; pack: string; moq: string }[];
  shot: (i: number) => ReactNode;
}) {
  return (
    <ul className="sf-no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4">
      {items.map((p, i) => (
        <li key={p.name} className="flex w-[220px] shrink-0 snap-start flex-col overflow-hidden rounded-[24px] bg-[#f4f4f5]">
          <div className="sf-product-shot grid h-[200px] place-items-center">{shot(i)}</div>
          <div className="flex flex-1 flex-col p-5">
            <h3 className="text-[18px] font-bold leading-snug tracking-[-0.015em] text-text">{p.name}</h3>
            <p className="mt-1 text-[14px] text-text-muted">{p.pack}</p>
            <p className="text-[14px] text-text-muted">{p.moq}</p>
            <p className="mt-4 flex items-center gap-1.5 text-[13px] font-semibold text-text">
              <Lock className="size-3.5" strokeWidth={2.25} />
              {t.products.priceGate}
            </p>
            <button type="button" className="sf-btn sf-btn-outline mt-4 self-start">
              {t.products.view}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** A white card of rows: a leading mark, a name and a line, a chevron. */
function RowList({ rows }: { rows: { key: string; mark: ReactNode; name: string; detail: string }[] }) {
  return (
    <ul className="flex flex-col rounded-[24px] bg-[#f4f4f5] px-5">
      {rows.map((r) => (
        <li key={r.key} className="[&:not(:last-child)]:border-b [&:not(:last-child)]:border-black/[0.08]">
          <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-4 py-4">
            {r.mark}
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-bold leading-snug text-text">{r.name}</span>
              <span className="block text-[14px] text-text-muted">{r.detail}</span>
            </span>
            <ChevronRight className="size-[18px] shrink-0 text-text-muted" strokeWidth={2.25} />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Fountain syrups: rows, each with its brand's colour. */
function Syrups() {
  return (
    <Section title={t.syrups.title} subtitle={t.syrups.subtitle}>
      <RowList
        rows={t.syrups.items.map((p, i) => ({
          key: p.name,
          name: p.name,
          detail: p.pack,
          mark: SYRUP_PHOTOS[i] ? (
            <ProductPhoto photo={SYRUP_PHOTOS[i]} pad="3px" className="size-12 shrink-0 rounded-xl" />
          ) : (
            <span
              aria-hidden
              className="grid size-12 shrink-0 place-items-center rounded-xl"
              style={{ background: TONES[SYRUP_TONES[i]].can, color: TONES[SYRUP_TONES[i]].label }}
            >
              <Droplet className="size-5" strokeWidth={2.25} fill="currentColor" />
            </span>
          ),
        }))}
      />
    </Section>
  );
}

/** Packaging and marketing: rows, each with an icon. */
function Marketing() {
  return (
    <Section title={t.marketing.title}>
      <RowList
        rows={t.marketing.items.map((p) => {
          const Icon = MARKETING_ICONS[p.icon];
          return {
            key: p.name,
            name: p.name,
            detail: p.detail,
            mark: (
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white text-text">
                <Icon className="size-5" strokeWidth={2} />
              </span>
            ),
          };
        })}
      />
    </Section>
  );
}

/** Coca-Cola's overlap: a big coloured picture (Somnath's photo of three pouches, on the floor's red below it), with a white text card riding up over its bottom. */
function Feature() {
  return (
    <section className="px-4 pt-14">
      <div className="overflow-hidden rounded-[32px] bg-[#e40f30] pb-12">
        <img src={plantsPhoto} alt="" className="block w-full" />
      </div>
      <div className="relative mx-4 -mt-16 rounded-[24px] bg-[#f4f4f5] p-6">
        <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-text-muted">
          {t.feature.eyebrow}
        </p>
        <h2 className="mt-2 text-[24px] font-bold leading-[1.04] tracking-[-0.02em] text-text">
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
      <ul className="flex flex-col rounded-[24px] bg-[#f4f4f5] px-5">
        {t.perks.items.map((p, i) => {
          const Icon = PERK_ICONS[i];
          return (
            <li
              key={p.title}
              className="flex gap-4 py-5 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-black/[0.08]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-white text-text">
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
function Cta({ onLogIn }: { onLogIn: () => void }) {
  return (
    <section className="px-4 pt-14">
      <div className="flex flex-col items-center rounded-[24px] bg-[#f4f4f5] px-6 py-10 text-center">
        <h2 className="sf-display text-[32px] text-text">
          {t.cta.title}
        </h2>
        <p className="mt-2 max-w-[280px] text-[16px] leading-normal text-text-muted">
          {t.cta.body}
        </p>
        <button type="button" onClick={onLogIn} className="sf-btn sf-btn-dark mt-6 w-full">
          {t.logIn}
        </button>
        <button type="button" className="sf-btn sf-btn-outline mt-3 w-full">
          {t.cta.request}
        </button>
      </div>
    </section>
  );
}
