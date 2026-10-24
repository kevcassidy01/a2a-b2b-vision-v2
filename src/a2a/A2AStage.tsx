import { useEffect, useState, type CSSProperties } from "react";
import { ACTORS, ActorBar, type Actor } from "./ActorBar";
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
 * right, and under both the bar showing who is acting. The backdrop is a dusk
 * mountain range (John Towner, Unsplash) under a light dark wash, so the chrome
 * floats on depth and shadow (Linear's scene).
 */
export function A2AStage() {
  const active = useActorHotkeys();
  return (
    <div
      className="a2a-stage a2a-scene flex h-screen w-screen flex-col gap-2.5 overflow-hidden py-2.5 pl-6 pr-2.5"
      style={{ "--a2a-wallpaper": `url(${wallpaper})` } as CSSProperties}
    >
      <div
        className="flex min-h-0 flex-1"
        style={{
          // Wide screens (office demos): the gap grows a little, from 24px at
          // 1440 to at most 56px.
          gap: "clamp(24px, calc(24px + (100vw - 1440px) * 0.06), 56px)",
        }}
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
      <ActorBar active={active} />
    </div>
  );
}

/**
 * Demo hotkeys until the scripted story drives the bar: Ctrl+1–4 lights or
 * dims John, John's agent, Alex's agent, Alex; Ctrl+0 dims all.
 */
function useActorHotkeys() {
  const [active, setActive] = useState<ReadonlySet<Actor>>(new Set());
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.repeat) return;
      const n = /^Digit([0-4])$/.exec(e.code)?.[1];
      if (n === undefined) return;
      e.preventDefault();
      if (n === "0") return setActive(new Set());
      const a = ACTORS[Number(n) - 1];
      setActive((s) => {
        const next = new Set(s);
        if (!next.delete(a)) next.add(a);
        return next;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return active;
}
