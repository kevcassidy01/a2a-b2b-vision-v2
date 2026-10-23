import { Maximize2 } from "lucide-react";
import type { CardApp } from "./types";
import { ExportShareIcons } from "./ExportShare";

/**
 * AppLogo — the app's identity mark in a slot header. Shows the real logo image
 * when `app.logo` is set (the one permitted brand mark, e.g. Salesforce),
 * otherwise the 1–2 char monogram in a bordered chip. Shared by every mode.
 */
export function AppLogo({ app }: { app: CardApp }) {
  if (app.logo) {
    return <img src={app.logo} alt="" aria-hidden className="size-6 shrink-0 object-contain" />;
  }
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-md border border-border text-[13px] font-semibold text-text">
      {app.badge}
    </span>
  );
}

/**
 * CardHeader — the 52px app identity row (logo monogram + app name), shared by
 * every display mode.
 *
 * `bordered` adds the horizontal padding + bottom hairline used INSIDE a framed
 * card. The carousel is frameless, so it renders this header flush to the chat
 * column with no border. Pass `onExpand` to show the top-right **expand** button
 * that opens the app full-screen (the former `</>` inspect slot), and
 * `onExport` to show Export (PDF) + Share beside it.
 */
export function CardHeader({
  app,
  onExpand,
  onExport,
  bordered = false,
}: {
  app: CardApp;
  onExpand?: () => void;
  onExport?: () => void;
  bordered?: boolean;
}) {
  return (
    <div
      className={`flex h-[52px] items-center gap-2.5 ${
        bordered ? "border-b border-border px-4" : ""
      }`}
    >
      <AppLogo app={app} />
      <span className="text-[16px] font-medium text-text">{app.name}</span>
      {onExport && <ExportShareIcons onExport={onExport} className="ml-auto" />}
      {onExpand && (
        <button
          type="button"
          aria-label="Open full screen"
          onClick={onExpand}
          className={`${onExport ? "" : "ml-auto "}grid size-7 shrink-0 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text`}
        >
          <Maximize2 className="size-4" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

/**
 * CardShell — the host-owned FRAMED card: surface + hairline border (no shadow)
 * with a bordered header. Used by `inline-card`; the body (and footer) render as
 * `children`. The carousel is frameless and composes `CardHeader` directly.
 */
export function CardShell({
  app,
  onExpand,
  onExport,
  children,
}: {
  app: CardApp;
  onExpand?: () => void;
  onExport?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-prompt-border bg-surface">
      <CardHeader app={app} onExpand={onExpand} onExport={onExport} bordered />
      {children}
    </div>
  );
}
