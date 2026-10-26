import thumbsUp from "../../assets/a2a/thumbs-up.png";
import { copy } from "../../copy/copy";
import { Rich } from "../Rich";

const t = copy.a2a.commandCenter.converted;

/**
 * Converted — the end state's notification, bottom right, over everything but
 * the confetti: the campaign's first conversion. It comes in from the bottom
 * right with the confetti once O-5531 is placed, and stays. White, hairline
 * border and a soft shadow, roomy like a card: the thumbs-up mascot on the
 * left, the title and one line on the right.
 */
export function Converted({ on }: { on: boolean }) {
  if (!on) return null;
  return (
    <div
      role="status"
      className="a2a-converted absolute bottom-6 right-6 z-[35] flex w-[420px] max-w-[calc(100%-48px)] items-center gap-5 rounded-2xl border border-black/[0.08] bg-white p-6 shadow-[0_20px_48px_-16px_rgb(0_0_0/0.24),0_2px_6px_rgb(0_0_0/0.05)]"
    >
      <img src={thumbsUp} alt="" className="h-20 w-auto shrink-0" />
      <div className="min-w-0">
        <p className="a2a-title text-[16px] font-semibold leading-snug tracking-[-0.01em] text-text">{t.title}</p>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-muted">
          <Rich text={t.body} />
        </p>
      </div>
    </div>
  );
}
