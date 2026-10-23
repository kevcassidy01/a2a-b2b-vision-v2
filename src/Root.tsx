import { useEffect, useState } from "react";
import App from "./App";
import { A2AStage } from "./a2a/A2AStage";
import { Desktop } from "./desktop/Desktop";
import { ViewToggle, type View } from "./shell/ViewToggle";

const viewFromHash = (): View => (window.location.hash === "#desktop" ? "desktop" : "browser");

/**
 * Root — picks the browser chat app or the Cowork desktop, with the floating
 * toggle above both. The view lives in the URL hash (`#desktop`) so a reload
 * or a shared link opens the same view. `#a2a` opens the agent-to-agent
 * prototype instead, without the toggle (A2A_INTENT).
 */
export default function Root() {
  const [view, setView] = useState<View>(viewFromHash);

  const [a2a, setA2a] = useState(() => window.location.hash === "#a2a");

  // Back/forward and hand-edited URLs change the hash; follow them.
  useEffect(() => {
    const onHash = () => {
      setView(viewFromHash());
      setA2a(window.location.hash === "#a2a");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const changeView = (v: View) => {
    window.location.hash = v === "desktop" ? "desktop" : "";
    setView(v);
  };

  // The A2A prototype is its own screen, outside the browser/desktop toggle.
  if (a2a) return <A2AStage />;

  return (
    <>
      {view === "desktop" ? <Desktop /> : <App />}
      <ViewToggle view={view} onChange={changeView} />
    </>
  );
}
