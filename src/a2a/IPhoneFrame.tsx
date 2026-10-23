import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { copy } from "../copy/copy";

/** A current Pro iPhone in points: the screen, plus the bezel and band around it (drawn as one black body). */
const SCREEN = { w: 402, h: 874, radius: 55 };
const BEZEL = 8;
const BAND = 2;
const BODY_RADIUS = SCREEN.radius + BEZEL + BAND;
const OUTER = {
  w: SCREEN.w + 2 * (BEZEL + BAND),
  h: SCREEN.h + 2 * (BEZEL + BAND),
};

/**
 * IPhoneFrame — the left half: a generic latest-Pro iPhone (thin even bezels,
 * Dynamic Island, side buttons), drawn at its real size in points and scaled
 * down to fit the stage's height. Never scales up. The body is black glass that
 * fades out toward the bottom, so it reads as the phone without being a slab.
 */
export function IPhoneFrame({ children }: { children?: ReactNode }) {
  const slot = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = slot.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientHeight / OUTER.h));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={slot}
      className="relative z-10 flex h-full shrink-0 items-center"
      style={{ width: OUTER.w * scale }}
    >
      {/* A box the scaled size, so the layout reserves what's drawn (a transform alone doesn't). */}
      <div
        className="relative shrink-0"
        style={{ width: OUTER.w * scale, height: OUTER.h * scale }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: OUTER.w,
            height: OUTER.h,
            transform: `scale(${scale})`,
          }}
        >
          <SideButtons />
          {/* The body: glass underneath, black on top fading out toward the bottom
              (most at bottom-left). Flat: no highlight rim. */}
          <div
            className="a2a-phone-glass absolute inset-0"
            style={{ borderRadius: BODY_RADIUS }}
          />
          <div
            className="a2a-phone-body absolute inset-0"
            style={{ borderRadius: BODY_RADIUS }}
          />
          <div
            className="a2a-content absolute overflow-hidden bg-white"
            style={{ inset: BEZEL + BAND, borderRadius: SCREEN.radius }}
          >
            <StatusBar />
            {children ?? (
              <div className="grid h-full place-items-center text-sm text-text-subtle">
                {copy.a2a.phone.placeholder}
              </div>
            )}
            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-black" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Time on the left, signal / wifi / battery on the right, the Dynamic Island between. */
function StatusBar() {
  return (
    <div className="absolute inset-x-0 top-0 z-10 flex h-[54px] items-center justify-between px-[34px] pt-1 text-text">
      <span className="w-[54px] text-center text-[17px] font-semibold tracking-tight">
        {copy.a2a.phone.time}
      </span>
      <div className="absolute left-1/2 top-[12px] h-[33px] w-[112px] -translate-x-1/2 rounded-full bg-black" />
      <div className="flex items-center gap-[6px]">
        <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={i * 5}
              y={9 - i * 3}
              width="3"
              height={3 + i * 3}
              rx="1"
              fill="currentColor"
            />
          ))}
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden>
          <path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0z" fill="currentColor" />
          <path
            d="M3.8 7.2a6 6 0 0 1 8.4 0l-1.2 1.2a4.3 4.3 0 0 0-6 0z"
            fill="currentColor"
          />
          <path
            d="M1.4 4.8a9.4 9.4 0 0 1 13.2 0l-1.2 1.2a7.7 7.7 0 0 0-10.8 0z"
            fill="currentColor"
          />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden>
          <rect
            x="0.5"
            y="0.5"
            width="23"
            height="12"
            rx="3.8"
            fill="none"
            stroke="currentColor"
            opacity="0.4"
          />
          <rect
            x="2"
            y="2"
            width="20"
            height="9"
            rx="2.5"
            fill="currentColor"
          />
          <path
            d="M25 4.5v4a2 2 0 0 0 0-4z"
            fill="currentColor"
            opacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
}

/** Action button + volume on the left edge, side button + camera control on the right. */
function SideButtons() {
  const btn = "a2a-phone-button absolute w-[4px]";
  return (
    <>
      <div className={`${btn} -left-[3px] top-[176px] h-[34px] rounded-l`} />
      <div className={`${btn} -left-[3px] top-[236px] h-[62px] rounded-l`} />
      <div className={`${btn} -left-[3px] top-[312px] h-[62px] rounded-l`} />
      <div className={`${btn} -right-[3px] top-[262px] h-[96px] rounded-r`} />
      <div className={`${btn} -right-[3px] top-[560px] h-[58px] rounded-r`} />
    </>
  );
}
