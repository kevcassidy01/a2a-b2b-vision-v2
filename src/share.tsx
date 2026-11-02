import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./setup";
import { A2AStage } from "./a2a/A2AStage";
import { sideFromUrl } from "./a2a/link";

/**
 * The shareable build's entry (`npm run build:share`): the A2A prototype on
 * its own, without the earlier demos, so it builds into one small HTML file
 * that opens from a double-click. #buyer and #seller open one side each; with
 * no server to link them, each plays the other side's moves itself.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <A2AStage side={sideFromUrl()} />
  </StrictMode>,
);
