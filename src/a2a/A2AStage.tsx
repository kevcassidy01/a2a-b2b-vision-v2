import type { CSSProperties } from "react";
import { ArtifactFrame } from "./ArtifactFrame";
import { CommandCenterShell } from "./CommandCenterShell";
import { CommandCenter } from "./command-center/CommandCenter";
import { IPhoneFrame } from "./IPhoneFrame";
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
      className="a2a-stage a2a-scene flex h-screen w-screen gap-6 overflow-hidden py-2.5 pl-6 pr-2.5"
      style={{ "--a2a-wallpaper": `url(${wallpaper})` } as CSSProperties}
    >
      <IPhoneFrame />
      <CommandCenterShell>
        <ArtifactFrame>
          <CommandCenter />
        </ArtifactFrame>
      </CommandCenterShell>
    </div>
  );
}
