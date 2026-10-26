import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Safari } from "../Safari";
import { AccountHome } from "./AccountHome";
import { AgentChat } from "./AgentChat";
import { ding } from "../sounds";
import { Login } from "./Login";
import { SiteSkeleton } from "./SiteSkeleton";
import { Menu } from "./Menu";
import { AgentFab } from "./parts";
import { SiteContext, type Site } from "./site";
import { Storefront } from "./Storefront";
import { demoTimeout } from "../demoClock";
import { useStory } from "../story";

type Page = "home" | "login";

/** How a page load plays out, in ms: the old page stays until the new one paints, then the progress finishes. */
const PAINT = 900;
const DONE = 1150;
/** The first load, when the phone opens: the skeleton shows this long, in ms, then the store. */
const BOOT = 1300;
/** How long after John's home appears Mike's cart notification arrives. */
const NOTIFY = 1600;

/**
 * PartnerSite — Fizz Partners in Safari on John's phone: which page is open
 * (first, as the phone opens, the store loading as a skeleton),
 * and going between them like a browser does (the bar comes up, the progress
 * line runs, the new page replaces the old one). Back returns to the store.
 * Logging in loads the home again as John's (AccountHome), quiet at first;
 * a moment later Mike's cart notification arrives (the bell's dot, the card,
 * a ding). Log out, in the menu, loads the public store. Over the page, under Safari's bar: John's
 * agent's floating pill (not on the login page), the menu drawer, and his
 * agent's sheet, which keeps its chat while he's logged in (logged out, it's
 * Fizz's helpful agent instead).
 */
export function PartnerSite() {
  // On a jump past step 1, John's already logged in with Mike's cart in; past step 3, his agent has it, its sheet up.
  const { from } = useStory();
  const [page, setPage] = useState<Page>("home");
  const [signedIn, setSignedIn] = useState(from >= 2);
  const [booted, setBooted] = useState(from >= 2);
  const [loading, setLoading] = useState(from < 2);
  const [menuOpen, setMenuOpen] = useState(false);
  const [agent, setAgent] = useState<{ assign: boolean } | null>(from >= 4 ? { assign: true } : null);
  const [notified, setNotified] = useState(from >= 2);
  const [assigned, setAssigned] = useState(from >= 4);
  const markAssigned = useCallback(() => setAssigned(true), []);
  const timers = useRef<(() => void)[]>([]);

  /** Loads `to`, logged in or out as `signed`, once the old page has had its moment. */
  const load = useCallback((to: Page, signed: boolean) => {
    setLoading(true);
    timers.current = [
      demoTimeout(() => {
        setPage(to);
        setSignedIn(signed);
      }, PAINT),
      demoTimeout(() => setLoading(false), DONE),
    ];
  }, []);
  useEffect(() => () => timers.current.forEach((cancel) => cancel()), []);

  // The phone opens on the store loading: its skeleton under Safari's progress line, then the store.
  useEffect(() => {
    return demoTimeout(() => {
      setBooted(true);
      setLoading(false);
    }, BOOT);
  }, []);

  // Once a session: Mike's notification, a moment after John's home first shows.
  const home = signedIn && page === "home";
  useEffect(() => {
    if (!signedIn) return setNotified(false);
    if (!home || notified) return;
    return demoTimeout(() => {
      setNotified(true);
      ding();
    }, NOTIFY);
  }, [signedIn, home, notified]);

  const go = (to: Page) => {
    if (!loading && to !== page) load(to, signedIn);
  };
  const onSignedIn = useCallback(() => load("home", true), [load]);

  const site = useMemo<Site>(
    () => ({
      menuOpen,
      notified,
      assigned,
      markAssigned,
      openMenu: () => setMenuOpen(true),
      openAgent: (assign = false) => setAgent({ assign }),
    }),
    [menuOpen, notified, assigned, markAssigned],
  );

  return (
    <SiteContext.Provider value={site}>
      <Safari
        pageKey={`${page}-${signedIn}-${booted}`}
        loading={loading}
        onBack={page === "home" ? undefined : () => go("home")}
        compact={agent !== null}
        float={!booted || page === "login" ? undefined : <AgentFab signedIn={signedIn} />}
        overlay={
          <>
            <Menu
              open={menuOpen}
              signedIn={signedIn}
              onClose={() => setMenuOpen(false)}
              onAgent={() => {
                setMenuOpen(false);
                setAgent({ assign: false });
              }}
              onLogIn={() => {
                setMenuOpen(false);
                go("login");
              }}
              onLogOut={() => {
                setMenuOpen(false);
                load("home", false);
              }}
            />
            <AgentChat
              key={String(signedIn)}
              open={agent !== null}
              assign={agent?.assign ?? false}
              signedIn={signedIn}
              onClose={() => setAgent(null)}
            />
          </>
        }
      >
        {!booted ? (
          <SiteSkeleton />
        ) : page === "login" ? (
          <Login onSignedIn={onSignedIn} />
        ) : signedIn ? (
          <AccountHome />
        ) : (
          <Storefront onLogIn={() => go("login")} />
        )}
      </Safari>
    </SiteContext.Provider>
  );
}
