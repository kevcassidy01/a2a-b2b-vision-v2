import { useCallback, useEffect, useRef, useState } from "react";
import { ACTORS, ActorBar, type Actor } from "./ActorBar";
import { ArtifactFrame } from "./ArtifactFrame";
import { CommandCenterShell } from "./CommandCenterShell";
import { CommandCenter } from "./command-center/CommandCenter";
import { Contents } from "./Contents";
import { isTyping, setPaused, usePaused } from "./demoClock";
import { IPhoneFrame } from "./IPhoneFrame";
import { MailNotification } from "./MailNotification";
import { PartnerSite } from "./storefront/PartnerSite";
import { StoryProvider, useStory } from "./story";
import { Relay, StandIn, useLink, type Side } from "./link";
import { BUYER_CUES } from "./storefront/AgentChat";
import { SELLER_CUES } from "./command-center/QuoteThread";
import "./a2a.css";

/**
 * A2AStage — the prototype. With no `side`, the split screen (A2A_INTENT §4):
 * John's storefront on an iPhone on the left, Alex's Command Center in the
 * glass AI app shell on the right, and under both the bar showing who is
 * acting. With a `side`, one of them alone in the middle of the screen, for
 * its own device (/buyer, /seller; link.tsx). The backdrop is a dusk
 * mountain range (John Towner, Unsplash) under a light dark wash, so the chrome
 * floats on depth and shadow (Linear's scene).
 */
export function A2AStage({ side }: { side?: Side }) {
  const { run, from, jump, peer } = useDemoKeys(side);
  return (
    <>
      <StoryProvider key={run} from={from}>
        {side ? <OneSide side={side} peer={peer} /> : <Stage />}
      </StoryProvider>
      <Contents at={from} onJump={jump} />
    </>
  );
}

/**
 * The presenter's keys: ` pauses and plays the demo (its clocks, timers and
 * animations, demoClock); Shift+` (~) restarts it from the top, playing. They
 * do nothing while typing in a field. Returns the run, a key that remounts
 * the whole story on restart, the step it starts from, a jump to a step
 * (the contents, Contents), which restarts it from there, playing, and on a
 * one-side page whether the other side's linked. There, each of these
 * reaches the other side's page too.
 */
function useDemoKeys(side?: Side) {
  const [run, setRun] = useState(0);
  const [from, setFrom] = useState(1);
  const paused = usePaused();
  const jumpHere = useCallback((step: number) => {
    setPaused(false);
    setFrom(step);
    setRun((r) => r + 1);
  }, []);
  const link = useLink(side, jumpHere, setPaused);
  const jump = (step: number) => {
    jumpHere(step);
    link.jump(step);
  };
  const pause = (p: boolean) => {
    setPaused(p);
    link.pause(p);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Backquote" || e.ctrlKey || e.metaKey || e.altKey || e.repeat || isTyping(e)) return;
      e.preventDefault();
      if (e.shiftKey) jump(1);
      else pause(!paused);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  return { run, from, jump, peer: link.peer };
}

/**
 * One side alone, in the middle of the screen (no split screen, no
 * who's-acting bar): John's phone, or Alex's Command Center with Gmail's
 * notification. It sends its moves to the other side's page and makes that
 * side's as they arrive; with no other side linked, it plays them itself.
 */
function OneSide({ side, peer }: { side: Side; peer: boolean }) {
  const { from, ordered } = useStory();
  const paused = usePaused();
  return (
    <div
      className={`a2a-stage a2a-scene relative flex h-screen w-screen items-center justify-center overflow-hidden p-2.5 ${side === "buyer" ? "a2a-scene-blur" : ""}`}
      data-paused={paused || undefined}
    >
      {side === "buyer" ? (
        <IPhoneFrame>
          <PartnerSite />
        </IPhoneFrame>
      ) : (
        <>
          {/* A desktop app's window, centred on the wallpaper rather than filling the screen. */}
          <div className="flex h-[min(96vh,1120px)] w-[min(92vw,1680px)]">
            <CommandCenterShell window>
              <ArtifactFrame>
                <CommandCenter />
              </ArtifactFrame>
            </CommandCenterShell>
          </div>
          <MailNotification ordered={ordered && from < 15} />
        </>
      )}
      <Relay side={side} />
      {!peer && <StandIn cues={side === "buyer" ? SELLER_CUES : BUYER_CUES} />}
    </div>
  );
}

/**
 * The stage itself. The bar lights whoever's acting: an agent while it works
 * and a person while a decision waits on them (each side reports these), a
 * person for a moment whenever their side is touched
 * (John on the phone, Alex in the Command Center), and the demo hotkeys on top.
 */
function Stage() {
  const hotkeys = useActorHotkeys();
  const { from, working, ordered } = useStory();
  const paused = usePaused();
  const john = useTouched();
  const alex = useTouched();
  const active = new Set<Actor>([...hotkeys, ...[...working].map((w) => w.split(":")[0] as Actor)]);
  if (john.on) active.add("john");
  if (alex.on) active.add("alex");
  return (
    <div
      className="a2a-stage a2a-scene relative flex h-screen w-screen flex-col gap-2.5 overflow-hidden py-2.5 pl-6 pr-2.5"
      data-paused={paused || undefined}
    >
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
      <MailNotification ordered={ordered && from < 15} />
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
