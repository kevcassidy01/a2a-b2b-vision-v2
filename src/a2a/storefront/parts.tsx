import { Bell, Check, Menu as MenuIcon } from "lucide-react";
import sparkle from "../../assets/a2a/agent-sparkle.png";
import john from "../../assets/a2a/john.png";
import { copy } from "../../copy/copy";
import { useSite } from "./site";

const t = copy.a2a.storefront;

/** What follows O-5531, as a tiny checklist: what's in (a green check), what's still to come (an empty ring).
 *  On the order card in John's agent chat, and on the order card the store's home shows behind it. */
export function OrderChecklist({ className = "" }: { className?: string }) {
  const o = t.agent.order.card;
  return (
    <ul className={`flex flex-col gap-2 ${className}`}>
      {o.checklist.map((c) => (
        <li key={c.label} className="flex items-center gap-2 text-[13px]">
          {c.done ? (
            <span role="img" aria-label={o.state.done} className="grid size-4 shrink-0 place-items-center rounded-full bg-[#1f7a3d] text-white">
              <Check className="size-2.5" strokeWidth={3.5} />
            </span>
          ) : (
            <span role="img" aria-label={o.state.todo} className="size-4 shrink-0 rounded-full shadow-[inset_0_0_0_1.5px_#c9c9ce]" />
          )}
          <span className="font-semibold text-text">{c.label}</span>
          <span className="truncate text-text-muted">{c.detail}</span>
        </li>
      ))}
    </ul>
  );
}

/* The site's frame, shared by every page of Fizz Partners. */

/** White, thin and sticky, under the status bar: the logo, Log in (before
 *  logging in, and not on the login page itself) or, once logged in, the
 *  notifications bell and John's pill; then the menu button, which opens the drawer. John's agent floats
 *  over the page instead (AgentFab). */
export function Header({ onLogIn, signedIn = false }: { onLogIn?: () => void; signedIn?: boolean }) {
  const { menuOpen, openMenu } = useSite();
  return (
    <header className="sticky top-0 z-20 bg-white pt-[54px]">
      <div className="flex h-14 items-center gap-2 px-4">
        <a href="#" aria-label={t.home} onClick={(e) => e.preventDefault()} className="mr-auto">
          <Logo />
        </a>
        {signedIn ? (
          <>
            <NotificationBell />
            <AccountPill />
          </>
        ) : (
          onLogIn && (
            <button type="button" onClick={onLogIn} className="sf-pill sf-pill-outline sf-pill-sm">
              {t.logIn}
            </button>
          )
        )}
        <button
          type="button"
          aria-label={t.menu}
          aria-expanded={menuOpen}
          onClick={openMenu}
          className="-mr-1 grid size-10 place-items-center rounded-full text-text"
        >
          <MenuIcon className="size-[22px]" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}

/** A bell in an outlined circle, as tall as John's pill. Quiet when John logs
 *  in; when Mike's cart notification arrives it rings and gets a red dot. */
function NotificationBell() {
  const { notified } = useSite();
  return (
    <button
      type="button"
      aria-label={notified ? t.notifications.unread : t.notifications.label}
      className="relative grid size-9 place-items-center rounded-full text-text shadow-[inset_0_0_0_1px_rgb(0_0_0/0.16)]"
    >
      <Bell key={String(notified)} className={`size-[18px] ${notified ? "sf-ring" : ""}`} strokeWidth={2} />
      {notified && (
        <span
          aria-hidden
          className="sf-pop absolute right-[5px] top-[5px] size-2.5 rounded-full bg-[var(--fizz-red)] shadow-[0_0_0_2px_#fff]"
        />
      )}
    </button>
  );
}

/** John's avatar in a circle, then his name, in a fully rounded pill as tall
 *  as Log in, the circle 3px in from the pill's edge. */
function AccountPill() {
  return (
    <button
      type="button"
      aria-label={t.account.label}
      className="flex h-9 items-center gap-2 rounded-full bg-black/[0.05] p-[3px] pr-3.5"
    >
      <img src={john} alt="" className="size-[30px] rounded-full bg-white object-cover" />
      <span className="text-[14px] font-bold tracking-[-0.01em] text-text">{t.account.name}</span>
    </button>
  );
}

/** John's agent, floating bottom centre over every page but the login, just
 *  above Safari's bar: a darker glass pill with the sparkle and "New task"
 *  ("Ask agent" before login, when it's Fizz's helpful agent), shrinking to
 *  the sparkle in a circle when the bar shrinks (Safari's `float`). */
export function AgentFab({ signedIn }: { signedIn: boolean }) {
  const { openAgent } = useSite();
  return (
    <button type="button" aria-label={signedIn ? t.agent.open : t.agent.signedOut.fab} onClick={() => openAgent()} className="sf-fab a2a-liquid-glass">
      <AgentMark className="size-8 bg-transparent!" />
      <span className="sf-fab-label">{signedIn ? t.agent.fab : t.agent.signedOut.fab}</span>
    </button>
  );
}

/** John's agent's mark: the blue sparkle in a circle, quiet grey as John's
 *  pill (or a white tint, `onDark`). */
export function AgentMark({ className = "", onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full ${onDark ? "bg-white/[0.12]" : "bg-black/[0.05]"} ${className}`}
    >
      <img src={sparkle} alt="" className="size-[74%]" />
    </span>
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
