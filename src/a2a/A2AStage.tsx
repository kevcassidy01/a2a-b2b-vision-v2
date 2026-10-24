import { useEffect, useRef, useState } from "react";
import { ACTORS, ActorBar, type Actor } from "./ActorBar";
import { ArtifactFrame } from "./ArtifactFrame";
import { CommandCenterShell } from "./CommandCenterShell";
import { CommandCenter } from "./command-center/CommandCenter";
import { IPhoneFrame } from "./IPhoneFrame";
import { PartnerSite } from "./storefront/PartnerSite";
import { StoryProvider, useStory } from "./story";
import "./a2a.css";

/**
 * A2AStage — the one split screen (A2A_INTENT §4): John's storefront on an
 * iPhone on the left, Alex's Command Center in the glass AI app shell on the
 * right, and under both the bar showing who is acting. The backdrop is a dusk
 * mountain range (John Towner, Unsplash) under a light dark wash, so the chrome
 * floats on depth and shadow (Linear's scene).
 */
export function A2AStage() {
  return (
    <StoryProvider>
      <Stage />
    </StoryProvider>
  );
}

/**
 * The stage itself. The bar lights whoever's acting: an agent while it works
 * (each reports itself), a person for a moment whenever their side is touched
 * (John on the phone, Alex in the Command Center), and the demo hotkeys on top.
 */
function Stage() {
  const hotkeys = useActorHotkeys();
  const { working } = useStory();
  const john = useTouched();
  const alex = useTouched();
  const active = new Set<Actor>([...hotkeys, ...working]);
  if (john.on) active.add("john");
  if (alex.on) active.add("alex");
  return (
    <div className="a2a-stage a2a-scene flex h-screen w-screen flex-col gap-2.5 overflow-hidden py-2.5 pl-6 pr-2.5">
      <div
        className="flex min-h-0 flex-1"
        style={{
          // Wide screens (office demos): the gap grows a little, from 24px at
          // 1440 to at most 56px.
          gap: "clamp(24px, calc(24px + (100vw - 1440px) * 0.06), 56px)",
        }}
      >
        <div className="contents" onPointerDownCapture={john.touch}>
          <IPhoneFrame>
            <PartnerSite />
          </IPhoneFrame>
        </div>
        <div className="contents" onPointerDownCapture={alex.touch}>
          <CommandCenterShell>
            <ArtifactFrame>
              <CommandCenter />
            </ArtifactFrame>
          </CommandCenterShell>
        </div>
      </div>
      <ActorBar active={active} />
    </div>
  );
}

/** How long a person stays lit after touching their side, in ms. */
const TOUCH_HOLD = 1500;

/** Whether a person has just touched their side: on at each tap, off TOUCH_HOLD after the last. */
function useTouched() {
  const [on, setOn] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const touch = () => {
    setOn(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOn(false), TOUCH_HOLD);
  };
  return { on, touch };
}

/**
 * Demo hotkeys, on top of what the story lights: Ctrl+1–4 lights or
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
