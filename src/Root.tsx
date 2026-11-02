import { useEffect, useState } from "react";
import App from "./App";
import { A2AStage } from "./a2a/A2AStage";
import { sideFromUrl } from "./a2a/link";
import { Desktop } from "./desktop/Desktop";
import { ViewToggle, type View } from "./shell/ViewToggle";

/** What the hash opens: the A2A prototype by default; `#chat` and `#desktop` the earlier demos. */
type Route = "a2a" | View;
const routeFromHash = (): Route =>
  window.location.hash === "#desktop" ? "desktop" : window.location.hash === "#chat" ? "browser" : "a2a";

/**
 * Root — the agent-to-agent prototype (A2A_INTENT) at `/`, so a fresh clone
 * opens on it. The earlier demos stay behind the hash, with the floating
 * toggle between them: `#chat`, the browser chat; `#desktop`, the Cowork
 * desktop. The route lives in the URL so a reload or a shared link opens the
 * same screen. (`#a2a`, the old link, still opens the prototype.) /buyer and
 * /seller open one side each, for its own device (link.tsx).
 */
export default function Root() {
  const [route, setRoute] = useState<Route>(routeFromHash);

  // Back/forward and hand-edited URLs change the hash; follow them.
  useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const changeView = (v: View) => {
    window.location.hash = v === "desktop" ? "desktop" : "chat";
    setRoute(v);
  };

  if (route === "a2a") return <A2AStage side={sideFromUrl()} />;

  return (
    <>
      {route === "desktop" ? <Desktop /> : <App />}
      <ViewToggle view={route} onChange={changeView} />
    </>
  );
}
