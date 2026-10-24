import { useEffect, useRef, useState } from "react";
import { Safari } from "../Safari";
import { Login } from "./Login";
import { Storefront } from "./Storefront";

type Page = "home" | "login";

/** How a page load plays out, in ms: the old page stays until the new one paints, then the progress finishes. */
const PAINT = 900;
const DONE = 1150;

/**
 * PartnerSite — Fizz Partners in Safari on John's phone: which page is open,
 * and going between them like a browser does (the bar comes up, the progress
 * line runs, the new page replaces the old one). Back returns to the store.
 */
export function PartnerSite() {
  const [page, setPage] = useState<Page>("login");
  const [loading, setLoading] = useState(false);
  const timers = useRef<number[]>([]);

  const go = (to: Page) => {
    if (loading || to === page) return;
    setLoading(true);
    timers.current = [
      window.setTimeout(() => setPage(to), PAINT),
      window.setTimeout(() => setLoading(false), DONE),
    ];
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <Safari pageKey={page} loading={loading} onBack={page === "home" ? undefined : () => go("home")}>
      {page === "home" ? <Storefront onLogIn={() => go("login")} /> : <Login />}
    </Safari>
  );
}
