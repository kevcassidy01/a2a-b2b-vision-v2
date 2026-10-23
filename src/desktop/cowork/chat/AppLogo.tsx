import type { AppId } from "./types";

const SRC: Record<AppId, string> = {
  salesforce: "/salesforce.svg",
  slack: "/connectors/slack.svg",
  gmail: "/connectors/gmail.svg",
  calendar: "/connectors/google-calendar.svg",
  asana: "/connectors/asana.svg",
  gong: "/connectors/gong.png",
  // Aaron's own files, dropped in from the desktop.
  files: "/connectors/files.svg",
};

/** An app's logo, sized by the caller. Salesforce's cloud is wide, so it's contained. */
export function AppLogo({ app, className = "size-5" }: { app: AppId; className?: string }) {
  return <img src={SRC[app]} alt="" aria-hidden className={`${className} shrink-0 object-contain`} />;
}
