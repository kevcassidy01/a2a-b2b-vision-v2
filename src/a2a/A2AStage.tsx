import type { CSSProperties } from "react";
import { ArtifactFrame } from "./ArtifactFrame";
import { CommandCenterShell } from "./CommandCenterShell";
import { CommandCenter } from "./command-center/CommandCenter";
import { IPhoneFrame } from "./IPhoneFrame";
import { PartnerSite } from "./storefront/PartnerSite";
import wallpaper from "../assets/a2a/wallpaper.jpg";
import "./a2a.css";

/**
 * A2AStage — the one split screen (A2A_INTENT §4): John's storefront on an
 * iPhone on the left, Alex's Command Center in the glass AI app shell on the
 * right. The backdrop is a dusk mountain range (John Towner, Unsplash) under a
 * light dark wash, so the chrome floats on depth and shadow (Linear's scene).
 */
export function A2AStage() {
  return (
    <div
      className="a2a-stage a2a-scene flex h-screen w-screen overflow-hidden py-2.5 pl-6 pr-2.5"
      style={
        {
          "--a2a-wallpaper": `url(${wallpaper})`,
          // Wide screens (office demos): the gap grows a little, from 24px at
          // 1440 to at most 56px.
          gap: "clamp(24px, calc(24px + (100vw - 1440px) * 0.06), 56px)",
        } as CSSProperties
      }
    >
      <IPhoneFrame>
        <PartnerSite />
      </IPhoneFrame>
      <CommandCenterShell>
        <ArtifactFrame>
          <CommandCenter />
        </ArtifactFrame>
      </CommandCenterShell>
    </div>
  );
}
