import { useState } from "react";
import wallpaper from "../assets/desktop/wallpaper.jpg";
import { CoworkWindow } from "./CoworkWindow";
import { DesktopIcons } from "./DesktopIcons";
import { MenuBar } from "./MenuBar";
import { SalesforceNotice } from "./SalesforceNotice";
import { SlackBanner } from "./SlackBanner";

/**
 * Desktop — the simulated Mac desktop with the Cowork window (COWORK_INTENT).
 *
 * The wallpaper (Somnath's pick, resized to 3456px wide — the MacBook Pro's
 * native width), the menu bar, the desktop-icons column on the right and the
 * Cowork window. Ctrl+S pops a Slack banner (SlackBanner); a live agent
 * acting pops a Salesforce one (SalesforceNotice). The Dock comes later.
 *
 * Focus: the window starts key. Clicking the wallpaper or a desktop icon hands
 * focus to the desktop (the window goes inactive); clicking the window takes it
 * back. Clicking bare wallpaper also clears the icon selection.
 */
export function Desktop() {
  const [windowActive, setWindowActive] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${wallpaper})` }}
      onPointerDown={(e) => {
        if (e.target !== e.currentTarget) return;
        setWindowActive(false);
        setSelected(null);
      }}
    >
      <MenuBar />
      <DesktopIcons
        selected={selected}
        desktopFocused={!windowActive}
        onSelect={(name) => {
          setSelected(name);
          setWindowActive(false);
        }}
      />
      <CoworkWindow active={windowActive} onActivate={() => setWindowActive(true)} />
      <SlackBanner />
      <SalesforceNotice />
    </div>
  );
}
