import { ChevronRight, LogOut, Search, X } from "lucide-react";
import type { CSSProperties } from "react";
import john from "../../assets/a2a/john.png";
import { copy } from "../../copy/copy";
import { ICONS } from "./icons";
import { AgentMark, Logo } from "./parts";

const t = copy.a2a.storefront;
const n = t.nav;

/** Each block's place in the drawer's stagger. */
const at = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Menu — the site menu, a drawer from the right, 85% of the screen wide, over
 * a scrim that closes it (as does its X). It slides in on iOS's ease, its
 * blocks following a beat apart, and goes out quicker. Full height: under the
 * status bar at the top (it scrolls behind an opaque strip there, never under
 * the time or the island), under Safari's bar at the foot. Logged in: John, then
 * his buyer agent as the first thing to tap, a search, then what a B2B buyer
 * comes back for in groups (carts with a count, quotes, orders, invoices,
 * delivery sites, the team, his agent's limits, support and his Fizz rep),
 * then Log out. Logged out: the shop, help, and Log in or apply. Rows are big
 * and tappable, an icon, a label and a chevron, with a hairline between them.
 */
export function Menu({
  open,
  signedIn,
  onClose,
  onAgent,
  onLogIn,
  onLogOut,
}: {
  open: boolean;
  signedIn: boolean;
  onClose: () => void;
  onAgent: () => void;
  onLogIn: () => void;
  onLogOut: () => void;
}) {
  const groups = signedIn ? n.signedIn : n.signedOut;
  const lead = signedIn ? 2 : 1;
  return (
    <div className="sf-drawer absolute inset-0 z-[5]" data-open={open || undefined} inert={!open}>
      <button type="button" aria-label={t.closeMenu} tabIndex={-1} onClick={onClose} className="sf-scrim absolute inset-0" />
      <nav
        aria-label={n.label}
        className="sf-drawer-panel sf-no-scrollbar absolute inset-y-0 right-0 w-[85%] overflow-y-auto bg-white px-4 pb-32"
      >
        {/* The status bar's own strip, opaque, so the menu scrolls behind the time, the island and the battery (as iOS does). */}
        <div aria-hidden className="sticky top-0 z-10 -mx-4 h-[54px] bg-white" />
        <div className="sf-drawer-item flex h-14 items-center gap-3" style={at(0)}>
          {signedIn ? (
            <>
              <img src={john} alt="" className="size-10 rounded-full bg-white object-cover" />
              <div className="mr-auto min-w-0">
                <p className="text-[16px] font-bold leading-snug tracking-[-0.015em] text-text">{t.account.fullName}</p>
                <p className="truncate text-[13px] text-text-muted">{t.account.company}</p>
              </div>
            </>
          ) : (
            <span className="mr-auto">
              <Logo />
            </span>
          )}
          <button
            type="button"
            aria-label={t.closeMenu}
            onClick={onClose}
            className="-mr-1 grid size-10 shrink-0 place-items-center rounded-[12px] bg-black/[0.05] text-text"
          >
            <X className="size-5" strokeWidth={2.25} />
          </button>
        </div>

        {signedIn && (
          <button
            type="button"
            onClick={onAgent}
            className="sf-drawer-item mt-3 flex w-full items-center gap-3 rounded-[24px] bg-[#1d1d1f] p-4 text-left text-white"
            style={at(1)}
          >
            <AgentMark onDark className="size-11" />
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-bold tracking-[-0.01em]">{t.agent.card.title}</span>
              <span className="block truncate text-[13.5px] text-white/65">{t.agent.card.status}</span>
            </span>
            <ChevronRight className="size-[18px] shrink-0 text-white/60" strokeWidth={2.25} />
          </button>
        )}

        <label className="sf-field sf-drawer-item mt-3 gap-2 px-4" style={at(lead)}>
          <Search className="size-[18px] shrink-0 text-text-muted" strokeWidth={2.25} />
          <input
            type="search"
            placeholder={n.search}
            readOnly
            className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-text outline-none placeholder:text-text-muted"
          />
        </label>

        {groups.map((g, i) => (
          <section key={g.title} className="sf-drawer-item mt-6" style={at(lead + 1 + i)}>
            <h2 className="px-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-text-muted">{g.title}</h2>
            <ul className="mt-2 rounded-[24px] bg-[#f4f4f5] px-4">
              {g.items.map((item) => {
                const Icon = ICONS[item.icon];
                return (
                  <li key={item.label} className="[&:not(:last-child)]:border-b [&:not(:last-child)]:border-black/[0.08]">
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="flex h-14 items-center gap-3.5 text-text"
                    >
                      <Icon className="size-5 shrink-0" strokeWidth={2} />
                      <span className="mr-auto truncate text-[16px] font-semibold tracking-[-0.01em]">{item.label}</span>
                      {"detail" in item && <span className="truncate text-[14px] text-text-muted">{item.detail}</span>}
                      {"count" in item && (
                        <span className="grid h-6 min-w-6 place-items-center rounded-[8px] bg-[var(--fizz-red)] px-2 text-[13px] font-bold text-white">
                          {item.count}
                        </span>
                      )}
                      <ChevronRight className="size-[18px] shrink-0 text-text-muted" strokeWidth={2.25} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <div className="sf-drawer-item" style={at(lead + 1 + groups.length)}>
          {signedIn ? (
            <button type="button" onClick={onLogOut} className="sf-btn sf-btn-outline mt-8 w-full gap-2">
              <LogOut className="size-[18px]" strokeWidth={2.25} />
              {n.logOut}
            </button>
          ) : (
            <div className="mt-8 flex flex-col gap-3">
              <button type="button" onClick={onLogIn} className="sf-btn sf-btn-dark w-full">
                {t.logIn}
              </button>
              <button type="button" className="sf-btn sf-btn-outline w-full">
                {t.cta.request}
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
