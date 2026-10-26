import { useEffect, useRef, useState } from "react";
import { copy } from "../copy/copy";
import { isTyping } from "./demoClock";

const t = copy.a2a.contents;

/**
 * Contents — the presenter's secret menu: C opens it at the top left of the
 * stage, over everything, and C or Escape (or a click anywhere else) shuts
 * it. Dark glass, thin like a sidenav, the story's 15 steps in one column
 * with no scroll. Picking one restarts the story from where that step
 * begins, playing; the step it last started from is marked.
 */
export function Contents({ at, onJump }: { at: number; onJump: (step: number) => void }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") return setOpen(false);
      if (e.code !== "KeyC" || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.repeat || isTyping(e)) return;
      e.preventDefault();
      setOpen((o) => !o);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("[aria-current]")?.focus({ preventScroll: true });
    const onDown = (e: PointerEvent) => {
      if (!panel.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onDown, true);
    return () => window.removeEventListener("pointerdown", onDown, true);
  }, [open]);
  if (!open) return null;
  return (
    <nav ref={panel} aria-label={t.title} className="a2a-contents absolute left-3 top-3 z-[70] flex w-[272px] flex-col rounded-2xl p-1.5">
      <p className="flex items-center justify-between px-2.5 pb-1.5 pt-1 text-[12px] font-medium text-white/50">
        {t.title}
        <kbd className="grid h-5 min-w-5 place-items-center rounded-[5px] bg-white/10 px-1 font-sans text-[11px] text-white/70">{t.key}</kbd>
      </p>
      <ol>
        {t.steps.map((label, i) => {
          const step = i + 1;
          const current = step === at;
          return (
            <li key={label}>
              <button
                type="button"
                aria-current={current ? "step" : undefined}
                onClick={() => {
                  setOpen(false);
                  onJump(step);
                }}
                className={`a2a-nav-btn flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] outline-none focus-visible:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.3)] ${
                  current ? "a2a-nav-active text-white" : "text-white/80"
                }`}
              >
                <span className={`w-4 shrink-0 text-right text-[12px] tabular-nums ${current ? "text-white/70" : "text-white/35"}`}>{step}</span>
                <span className="truncate">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
