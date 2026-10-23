import { useEffect, useState } from "react";
import App from "./App";
import { Desktop } from "./desktop/Desktop";
import { ViewToggle, type View } from "./shell/ViewToggle";

const viewFromHash = (): View => (window.location.hash === "#desktop" ? "desktop" : "browser");

/**
 * Root — picks the browser chat app or the Cowork desktop, with the floating
 * toggle above both. The view lives in the URL hash (`#desktop`) so a reload
 * or a shared link opens the same view.
 */
export default function Root() {
  const [view, setView] = useState<View>(viewFromHash);

  // Back/forward and hand-edited URLs change the hash; follow them.
  useEffect(() => {
    const onHash = () => setView(viewFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const changeView = (v: View) => {
    window.location.hash = v === "desktop" ? "desktop" : "";
    setView(v);
  };

  return (
    <>
      {view === "desktop" ? <Desktop /> : <App />}
      <ViewToggle view={view} onChange={changeView} />
    </>
  );
}
