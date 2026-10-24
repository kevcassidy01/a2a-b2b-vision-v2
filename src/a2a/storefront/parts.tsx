import { Menu } from "lucide-react";
import { copy } from "../../copy/copy";

const t = copy.a2a.storefront;

/* The site's frame, shared by every page of Fizz Partners. */

/** White, thin and sticky, under the status bar: the logo, Log in (before
 *  logging in, and not on the login page itself), the menu. */
export function Header({ onLogIn }: { onLogIn?: () => void }) {
  return (
    <header className="sticky top-0 z-20 bg-white pt-[54px]">
      <div className="flex h-14 items-center gap-2 px-4">
        <a href="#" aria-label={t.home} onClick={(e) => e.preventDefault()} className="mr-auto">
          <Logo />
        </a>
        {onLogIn && (
          <button type="button" onClick={onLogIn} className="sf-pill sf-pill-outline sf-pill-sm">
            {t.logIn}
          </button>
        )}
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

export function Logo() {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="sf-logo text-[28px]">{t.brand}</span>
      <span className="rounded-[4px] bg-text px-1 py-px text-[10px] font-bold uppercase tracking-[0.04em] text-white">
        {t.brandTag}
      </span>
    </span>
  );
}

/** Dense and quiet, as Coca-Cola's: the logo, links, then uppercase legal lines. */
export function Footer() {
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
