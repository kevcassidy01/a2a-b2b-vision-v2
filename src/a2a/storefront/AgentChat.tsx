import {
  AlignLeft,
  ArrowUp,
  Check,
  ChevronDown,
  Circle,
  CircleCheck,
  CircleDot,
  Database,
  Eye,
  FileSearch,
  FileText,
  History,
  Lightbulb,
  Package,
  PencilLine,
  Plus,
  Route,
  ShoppingCart,
  Square,
  X,
} from "lucide-react";
import { Rich } from "../Rich";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import john from "../../assets/a2a/john.png";
import agentLogo from "../../assets/a2a/agent-logo.png";
import { copy } from "../../copy/copy";
import { ProductPhoto } from "./Photo";
import { PHOTOS } from "./photos";
import { useStory } from "../story";
import { AgentMark } from "./parts";
import { Pulse } from "../Pulse";

const a = copy.a2a.storefront.agent;
const STEPS = a.plan.steps;
const WORDS = a.reasoning.split(" ");
const WORD = 35;
const MUSINGS = a.musings;
/** How long each musing runs before the next, in ms: fetches from SAP take
 *  longer, so the demo shows the agent going out to a system and waiting. */
const MUSE = { fetch: 1600, other: 800 };
const museFor = (kind: string) => (kind === "fetch" ? MUSE.fetch : MUSE.other);

/** What a musing or a step did, as an icon: read, fetched, wrote, noticed, wondered. */
const KIND: Record<string, LucideIcon> = {
  read: FileSearch,
  fetch: Database,
  write: PencilLine,
  notice: Eye,
  wonder: Lightbulb,
};

/**
 * The handoff's timeline, in ms from Assign: the reasoning, a timeline of
 * musings one after another, then the paragraph streaming in a word at a
 * time, then it folds away; the lead line, then the plan, whose steps run one
 * after another; then the cart it built, the reply, the quote and suggestions.
 */
const T = (() => {
  const think = 700;
  // When each musing starts, then the paragraph after the last.
  const muse = MUSINGS.map((_, i) => think + MUSINGS.slice(0, i).reduce((n, m) => n + museFor(m.kind), 0));
  const para = think + MUSINGS.reduce((n, m) => n + museFor(m.kind), 0);
  const thinkFor = para - think + WORDS.length * WORD + 300;
  const thought = think + thinkFor + 300;
  const plan = thought + 700;
  const step = (i: number) => plan + 700 + i * 1400; // when step i is done
  const done = step(STEPS.length - 1) + 500;
  return { think, muse, para, thinkFor, thought, plan, step, done, end: done + 1200 };
})();

const C = a.counter;
/**
 * The counter's timeline, in ms from v2 landing: Fizz's offer comes in; the
 * agent weighs it (musings one after another, no paragraph), folds; the lead
 * line, then its reply plan step by step; then the reply and where the quote stands.
 */
const T2 = (() => {
  const offer = 600;
  const think = offer + 1400;
  const muse = C.musings.map((_, i) => think + C.musings.slice(0, i).reduce((n, m) => n + museFor(m.kind), 0));
  const thought = think + C.musings.reduce((n, m) => n + museFor(m.kind), 0) + 900;
  const plan = thought + 700;
  const step = (i: number) => plan + 700 + i * 1400;
  const done = step(C.plan.steps.length - 1) + 500;
  return { offer, think, muse, thinkFor: thought - think, thought, plan, step, done, end: done + 1200 };
})();
const V = a.v3;
/**
 * The two offers' timeline (story step 12), in ms from v3a and v3b landing:
 * Fizz's two offers come in; the agent weighs them (the bundle in its
 * musings), folds; the lead line, then the approval it puts to John.
 */
const T3 = (() => {
  const offers = 600;
  const think = offers + 1600;
  const muse = V.musings.map((_, i) => think + V.musings.slice(0, i).reduce((n, m) => n + museFor(m.kind), 0));
  const thought = think + V.musings.reduce((n, m) => n + museFor(m.kind), 0) + 900;
  const ask = thought + 900;
  return { offers, think, muse, thinkFor: thought - think, thought, ask, end: ask + 400 };
})();

const O = a.order;
/**
 * The order's timeline (story steps 13–14), in ms from John's Approve: his
 * turn; the agent's plan step by step (accept v3a, place O-5531, log the PO);
 * then the order, the reply, the turns so far and the done mark.
 */
const T4 = (() => {
  const start = 700;
  const plan = start + 300;
  const step = (i: number) => plan + 700 + i * 1400;
  const done = step(O.plan.steps.length - 1) + 500;
  return { start, plan, step, done, end: done + 1200 };
})();
const TICK = 50;

/** Ms since a turn began (the handoff, or v2 landing), ticking until it's done; null before it. */
function useClock(started: boolean, end: number) {
  const [t, setT] = useState<number | null>(null);
  useEffect(() => {
    if (!started) return;
    const t0 = performance.now();
    setT(0);
    const id = window.setInterval(() => {
      const now = performance.now() - t0;
      setT(now);
      if (now > end) clearInterval(id);
    }, TICK);
    return () => clearInterval(id);
  }, [started, end]);
  return t;
}

/**
 * AgentChat — John's buyer agent on the phone, a sheet that slides up over the
 * page, stopping short of the status bar so the store shows dimmed above it.
 * The agent's sparkle and name at the top, the thread, and one prompt field at
 * the foot (Add, the field, Send), just above Safari's bar, which stays down to
 * its capsule while the sheet is up.
 *
 * Assign to your agent is a handoff: John types nothing. His turn is the cart
 * he handed over. The agent's turn, in shadcn AI Elements' patterns: its
 * Reasoning runs as a timeline of musings, one row at a time joined by a line, and folds to "Mulled it over for 8s"; a lead line says what it
 * will do; a Plan lists the steps with how many are done, each pending, running
 * (shimmering, in the present tense) or done (checked, past tense), with the
 * system each touched (read, fetch or write); then the cart as it now stands, the reply, the quote
 * waiting for Fizz, and Suggestions; then its sparkle on a line of its own,
 * to say it's done. Its messages are grey bubbles square at the bottom left;
 * John's would be dark, square at the bottom right. Cards keep all corners. Opened before anything's assigned, it
 * offers the handoff as a suggestion. It stays where it got to when closed.
 * Before John logs in there's no wall: it's Fizz's agent, helpful with the
 * store's questions (suggestions, display only). Delegating work is for his
 * own buyer agent, once he's logged in.
 */
export function AgentChat({
  open,
  assign,
  signedIn,
  onClose,
}: {
  open: boolean;
  assign: boolean;
  signedIn: boolean;
  onClose: () => void;
}) {
  const [started, setStarted] = useState(false);
  const t = useClock(started, T.end);
  const thread = useRef<HTMLDivElement>(null);
  const { sendQuote, counterSent, holdOut, v3Sent, accept, placeOrder, setWorking } = useStory();
  // Fizz has the request the moment the reply says so, not once the quote card is drawn.
  const quoted = t !== null && t >= T.done + 300;
  // Fizz's v2 lands in the thread once its agent sends it.
  const t2 = useClock(counterSent, T2.end);
  const held = t2 !== null && t2 >= T2.done + 300;
  // Fizz's v3a and v3b land once Alex sends both; John approves v3a from the card.
  const t3 = useClock(v3Sent, T3.end);
  const [approved, setApproved] = useState(false);
  const t4 = useClock(approved, T4.end);
  // Fizz has the acceptance once the first step's done, and the order once the second is.
  const accepted = t4 !== null && t4 >= T4.step(0);
  const ordered = t4 !== null && t4 >= T4.step(1);

  useEffect(() => {
    if (open && assign && signedIn) setStarted(true);
  }, [open, assign, signedIn]);

  const done = STEPS.filter((_, i) => t !== null && t >= T.step(i)).length;
  const done2 = C.plan.steps.filter((_, i) => t2 !== null && t2 >= T2.step(i)).length;
  const muse2 = t2 === null ? 0 : T2.muse.filter((x) => t2 >= x).length;
  const working2 = t2 !== null && t2 >= T2.think && t2 < T2.done;
  const muse3 = t3 === null ? 0 : T3.muse.filter((x) => t3 >= x).length;
  const done4 = O.plan.steps.filter((_, i) => t4 !== null && t4 >= T4.step(i)).length;
  const working3 = t3 !== null && t3 >= T3.think && t3 < T3.ask;
  const working4 = t4 !== null && t4 < T4.done;
  const working = (t !== null && t < T.done) || working2 || working3 || working4;
  const words = t === null ? 0 : Math.max(0, Math.min(WORDS.length, Math.floor((t - T.para) / WORD)));
  // How many musings have started.
  const muse = t === null ? 0 : T.muse.filter((x) => t >= x).length;
  // What's on screen changes in beats, not every tick: scroll on those.
  const beat =
    (t === null ? -1 : [T.think, T.thought, T.plan, T.done, T.done + 300, T.done + 600, T.done + 900].filter((x) => t >= x).length) +
    (t2 === null ? 0 : [T2.offer, T2.think, T2.thought, T2.plan, T2.done, T2.done + 300, T2.done + 600, T2.done + 900, T2.done + 1100].filter((x) => t2 >= x).length) +
    (t3 === null ? 0 : [T3.offers, T3.think, T3.thought, T3.ask].filter((x) => t3 >= x).length) +
    (t4 === null ? 0 : [0, T4.start, T4.plan, T4.done, T4.done + 300, T4.done + 600, T4.done + 900].filter((x) => t4 >= x).length);

  // The who's-acting bar lights John's agent while it works.
  useEffect(() => {
    setWorking("johnAgent", working);
  }, [working, setWorking]);

  // The quote's out: Fizz's side sees it land.
  useEffect(() => {
    if (quoted) sendQuote();
  }, [quoted, sendQuote]);

  // The reply's out: Fizz's side sees Isar holding out for 15%.
  useEffect(() => {
    if (held) holdOut();
  }, [held, holdOut]);

  // John's approved: Fizz's side sees v3a accepted, then the order.
  useEffect(() => {
    if (accepted) accept();
  }, [accepted, accept]);
  useEffect(() => {
    if (ordered) placeOrder();
  }, [ordered, placeOrder]);

  useEffect(() => {
    const el = thread.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [beat, done, words, muse, done2, muse2, muse3, done4]);

  // Suggestions once the agent's done and nothing's waiting on John: the order's, once it's placed.
  const suggestions =
    t4 !== null
      ? t4 >= T4.done + 900 && O.suggestions
      : t3 === null && t !== null && t >= T.done + 900 && (t2 === null || t2 >= T2.done + 1100) && a.suggestions;

  return (
    <div className="sf-sheet absolute inset-0 z-[5]" data-open={open || undefined} inert={!open}>
      <button type="button" aria-label={a.close} tabIndex={-1} onClick={onClose} className="sf-scrim absolute inset-0" />
      <section
        role="dialog"
        aria-label={signedIn ? a.name : a.signedOut.name}
        className="sf-sheet-panel absolute inset-x-0 bottom-0 top-[62px] flex flex-col overflow-hidden rounded-t-[28px] bg-white"
      >
        <div aria-hidden className="mx-auto mt-2 h-[5px] w-9 shrink-0 rounded-full bg-black/15" />
        <header className="flex shrink-0 items-center gap-3 px-5 pb-3 pt-2">
          <AgentMark className="size-10" />
          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-bold tracking-[-0.015em] text-text">{signedIn ? a.name : a.signedOut.name}</p>
            <p className="truncate text-[13.5px] text-text-muted">
              {!signedIn ? a.signedOut.owner : working ? a.working : a.owner}
            </p>
          </div>
          <button
            type="button"
            aria-label={a.close}
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full bg-black/[0.06] text-text"
          >
            <X className="size-5" strokeWidth={2.25} />
          </button>
        </header>

        <div ref={thread} className="sf-no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-6 pt-3">
          {!signedIn ? (
            <Empty title={a.signedOut.title} body={a.signedOut.body}>
              <div className="mt-7 flex w-full flex-col gap-2.5">
                {a.signedOut.suggestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="flex h-12 items-center justify-center rounded-full px-5 text-[15px] font-semibold text-text shadow-[inset_0_0_0_1px_rgb(0_0_0/0.14)]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </Empty>
          ) : t === null ? (
            <Empty title={a.intro.title} body={a.intro.body}>
              <button
                type="button"
                onClick={() => setStarted(true)}
                className="mt-7 flex h-12 items-center gap-2 rounded-full px-5 text-[15px] font-semibold text-text shadow-[inset_0_0_0_1px_rgb(0_0_0/0.14)]"
              >
                <ShoppingCart className="size-[18px]" strokeWidth={2.25} />
                {a.suggestion}
              </button>
            </Empty>
          ) : (
            <>
              <Thread t={t} words={words} muse={muse} done={done} />
              {t2 !== null && <CounterTurn t={t2} muse={muse2} done={done2} />}
              {t3 !== null && <OffersTurn t={t3} muse={muse3} approved={approved} onApprove={() => setApproved(true)} />}
              {t4 !== null && <OrderTurn t={t4} done={done4} />}
            </>
          )}
        </div>

        <Composer
          working={working}
          suggestions={suggestions || null}
          placeholder={signedIn ? a.placeholder : a.signedOut.placeholder}
        />
      </section>
    </div>
  );
}

/** Nothing in the thread yet: the sparkle, a title, a line, and what to do. */
function Empty({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <div className="my-auto flex flex-col items-center px-4 text-center">
      <AgentMark className="size-[72px]" />
      <h2 className="mt-6 text-[24px] font-bold leading-tight tracking-[-0.025em] text-text">{title}</h2>
      <p className="mt-2 text-[16px] leading-normal text-text-muted">{body}</p>
      {children}
    </div>
  );
}

/** John's turn (the cart he handed over), then the agent's, as far as it's got. */
function Thread({ t, words, muse, done }: { t: number; words: number; muse: number; done: number }) {
  return (
    <>
      <div className="sf-rise flex flex-col items-end">
        <p className="mb-2 flex items-center gap-2 pr-1 text-[13px] text-text-muted">
          <img src={john} alt="" className="size-9 rounded-full bg-white object-cover" />
          {a.handoff.label} · {a.handoff.time}
        </p>
        <div className="flex items-center gap-3 rounded-[22px] rounded-br-none bg-[#fdebe1] p-3 pr-5">
          <span className="grid size-11 place-items-center rounded-2xl bg-white">
            <ShoppingCart className="size-5 text-text" strokeWidth={2} />
          </span>
          <span>
            <span className="block text-[16px] font-bold tracking-[-0.01em] text-text">{a.cart.name}</span>
            <span className="block text-[13px] text-text-muted">{a.cart.meta}</span>
          </span>
        </div>
      </div>

      {t >= T.think && (
        <div className="mt-7">
          <Head typing={t < T.done + 900} />
          <Reasoning
            thinking={t < T.thought}
            musings={MUSINGS}
            muse={muse}
            mulling={a.mulling}
            thought={a.thought(Math.round(T.thinkFor / 1000))}
            paragraph={WORDS.slice(0, t < T.thought ? words : WORDS.length).join(" ")}
          />
          {t >= T.thought && <AgentSays className="mt-3"><Rich text={a.lead} /></AgentSays>}
          {t >= T.plan && <Plan plan={a.plan} done={done} />}
          {t >= T.done && <Result />}
          {t >= T.done + 300 && <AgentSays className="mt-5"><Rich text={a.reply} /></AgentSays>}
          {t >= T.done + 600 && <Quote q={a.quote} />}
          {t >= T.done + 900 && <AgentMark className="sf-rise mt-5 size-9" />}
        </div>
      )}
    </>
  );
}

/**
 * Story steps 8–9: Fizz's turn, its counter-offer v2 on the right (the other
 * side, as John's own turns are); then the agent's: it weighs v2, takes the
 * extra volume, holds out for 15% at Net30 (inside John's limits, so it doesn't
 * ask him), and says where the quote stands.
 */
function CounterTurn({ t, muse, done }: { t: number; muse: number; done: number }) {
  return (
    <>
      {t >= T2.offer && <Offer />}
      {t >= T2.think && (
        <div className="mt-7">
          <Head typing={t < T2.done + 1100} />
          <Reasoning
            thinking={t < T2.thought}
            musings={C.musings}
            muse={muse}
            mulling={C.mulling}
            thought={C.thought(Math.round(T2.thinkFor / 1000))}
          />
          {t >= T2.thought && <AgentSays className="mt-3"><Rich text={C.lead} /></AgentSays>}
          {t >= T2.plan && <Plan plan={C.plan} done={done} />}
          {t >= T2.done + 300 && <AgentSays className="mt-5"><Rich text={C.reply} /></AgentSays>}
          {t >= T2.done + 600 && <Quote q={C.quote} />}
          {t >= T2.done + 900 && <Turns turns={C.turns} n={3} />}
          {t >= T2.done + 1100 && <AgentMark className="sf-rise mt-5 size-9" />}
        </div>
      )}
    </>
  );
}

/** John's agent's mark at the head of its turn; while the turn is at work, the pulse runs beside it, as if it's typing. */
function Head({ typing }: { typing: boolean }) {
  return (
    <span className="sf-rise flex items-center gap-3">
      <AgentMark className="size-9" />
      {typing && <Pulse scale={1.25} className="sf-rise" />}
    </span>
  );
}

/** Fizz's agent's mark, the same size as John's agent's wherever they sit side by side. */
function FizzMark({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-full bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.1)] ${className}`}>
      <img src={agentLogo} alt="" className="size-[58%]" />
    </span>
  );
}

/**
 * The back and forth on the quote so far, once there's been more than one
 * turn: a clock, how many turns, a chevron, folded until tapped; open, a
 * timeline of who did what, each by its agent's mark. Sits before the done mark.
 */
function Turns({ turns: all, n }: { turns: { title: (n: number) => string; list: readonly { by: string; text: string }[] }; n: number }) {
  const [open, setOpen] = useState(false);
  const turns = { ...all, list: all.list.slice(0, n) };
  return (
    <div className="sf-rise mt-5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex min-h-8 items-center gap-2 text-left text-[14px] font-medium text-text-muted"
      >
        <History className="size-4 shrink-0" strokeWidth={2.25} />
        {turns.title(turns.list.length)}
        <ChevronDown className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2.25} />
      </button>
      {open && (
        <ol>
          {turns.list.map((x) => (
            <TimelineRow
              key={x.text}
              mark={x.by === "seller" ? <FizzMark className="size-4" /> : <AgentMark className="size-4" />}
            >
              <Rich text={x.text} />
            </TimelineRow>
          ))}
        </ol>
      )}
    </div>
  );
}

/** Fizz's counter-offer as it lands: who sent it (Fizz's agent's mark and name), what it says, the offer as a card (what changed in green), and when. */
function Offer() {
  const o = C.offer;
  return (
    <div className="sf-rise mt-8 flex flex-col items-end">
      <p className="mb-2 flex items-center gap-2 pr-1 text-[13px] text-text-muted">
        <FizzMark className="size-9" />
        {C.from}
      </p>
      <p className="mb-2 max-w-[92%] rounded-[22px] rounded-br-none bg-[#f2f2f4] px-4 py-3 text-[15px] leading-[1.45] text-text">
        <Rich text={C.said} />
      </p>
      <div className="w-[92%] rounded-[24px] bg-white p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.1)]">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f2f2f4]">
            <FileText className="size-5 text-text" strokeWidth={2} />
          </span>
          <span className="min-w-0">
            <span className="block text-[16px] font-bold tracking-[-0.01em] text-text">{o.title}</span>
            <span className="block text-[13px] text-text-muted">{o.id}</span>
          </span>
        </div>
        <ul className="mt-3">
          {o.lines.map((l) => (
            <li key={l.name} className="flex items-start gap-3 border-t border-black/[0.07] py-3 tabular-nums">
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold tracking-[-0.01em] text-text">{l.name}</span>
                <span className="block text-[13px] text-text-muted">{l.site}</span>
              </span>
              <span className="text-right">
                <span className="block text-[15px] font-semibold text-text">{l.qty}</span>
                <span className="block text-[13px] font-semibold text-[#1f7a3d]">{l.change}</span>
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-1 grid grid-cols-3 gap-2">
          {o.terms.map((f) => (
            <div key={f.label} className="rounded-2xl bg-[#f6f6f8] px-3 py-2.5">
              <dt className="text-[12px] text-text-muted">{f.label}</dt>
              <dd className="mt-0.5 text-[17px] font-bold tabular-nums tracking-[-0.01em] text-text">{f.value}</dd>
              {"note" in f && f.note && <dd className="text-[11.5px] leading-snug text-text-muted">{f.note}</dd>}
            </div>
          ))}
        </dl>
      </div>
      <p className="mt-1.5 pr-1 text-[12px] text-text-muted">{C.time}</p>
    </div>
  );
}

/**
 * Story step 12: Fizz's turn, its two offers in one card, v3a above v3b (the
 * phone's too narrow for side by side); then the agent's: it weighs both,
 * the bundle in its thinking, recommends v3a and asks John, since Net15
 * changes the terms he set.
 */
function OffersTurn({ t, muse, approved, onApprove }: { t: number; muse: number; approved: boolean; onApprove: () => void }) {
  return (
    <>
      {t >= T3.offers && <Offers />}
      {t >= T3.think && (
        <div className="mt-7">
          <Head typing={t < T3.ask} />
          <Reasoning
            thinking={t < T3.thought}
            musings={V.musings}
            muse={muse}
            mulling={V.mulling}
            thought={V.thought(Math.round(T3.thinkFor / 1000))}
          />
          {t >= T3.thought && <AgentSays className="mt-3"><Rich text={V.lead} /></AgentSays>}
          {t >= T3.ask && <Approval approved={approved} onApprove={onApprove} />}
        </div>
      )}
      {approved && (
        <div className="sf-rise mt-8 flex flex-col items-end">
          <p className="mb-2 flex items-center gap-2 pr-1 text-[13px] text-text-muted">
            <img src={john} alt="" className="size-9 rounded-full bg-white object-cover" />
            {V.you.label} · {V.you.time}
          </p>
          <p className="rounded-[22px] rounded-br-none bg-[#fdebe1] px-4 py-3 text-text">
            <span className="block text-[16px] font-semibold">{V.you.text}</span>
            <span className="block text-[14px] text-text/70">{V.you.detail}</span>
          </p>
        </div>
      )}
    </>
  );
}

/** Story steps 13–14: the agent accepts v3a, places O-5531 and logs the PO; then the order, the reply and the turns so far. */
function OrderTurn({ t, done }: { t: number; done: number }) {
  if (t < T4.start) return null;
  return (
    <div className="mt-7">
      <Head typing={t < T4.done + 900} />
      {t >= T4.plan && <Plan plan={O.plan} done={done} />}
      {t >= T4.done && <Order />}
      {t >= T4.done + 300 && <AgentSays className="mt-5"><Rich text={O.reply} /></AgentSays>}
      {t >= T4.done + 600 && <Turns turns={C.turns} n={5} />}
      {t >= T4.done + 900 && <AgentMark className="sf-rise mt-5 size-9" />}
    </div>
  );
}

/** An offer's figures as four small columns, so a whole offer fits the phone's width. */
function Figures({ rows, notes = {} }: { rows: readonly (readonly string[])[]; notes?: Record<string, string> }) {
  return (
    <dl className="mt-3 grid grid-cols-4 gap-2">
      {rows.map(([k, val]) => (
        <div key={k} className="min-w-0">
          <dt className="text-[12px] text-text-muted">{k}</dt>
          <dd className="mt-0.5 text-[15px] font-bold tabular-nums tracking-[-0.01em] text-text">{val}</dd>
          {notes[k] && <dd className="text-[11.5px] font-semibold leading-snug text-[#a15c00]">{notes[k]}</dd>}
        </div>
      ))}
    </dl>
  );
}

/** Fizz's two offers as they land, from its agent: a line on what they are, then one card, v3a above v3b, each a tile of its own. */
function Offers() {
  const o = V.offers;
  return (
    <div className="sf-rise mt-8 flex flex-col items-end">
      <p className="mb-2 flex items-center gap-2 pr-1 text-[13px] text-text-muted">
        <FizzMark className="size-9" />
        {V.from}
      </p>
      <p className="mb-2 max-w-[92%] rounded-[22px] rounded-br-none bg-[#f2f2f4] px-4 py-3 text-[15px] leading-[1.45] text-text">
        <Rich text={V.said} />
      </p>
      <div className="w-[92%] rounded-[24px] bg-white p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.1)]">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f2f2f4]">
            <FileText className="size-5 text-text" strokeWidth={2} />
          </span>
          <span className="min-w-0">
            <span className="block text-[16px] font-bold tracking-[-0.01em] text-text">{o.title}</span>
            <span className="block text-[13px] text-text-muted">{o.id}</span>
          </span>
        </div>
        <ul className="mt-4 flex flex-col gap-2.5">
          {o.list.map((v) => (
            <li key={v.id} className="rounded-2xl bg-[#f6f6f8] px-3.5 py-3">
              <p className="text-[12px] text-text-muted">{v.id}</p>
              <p className="text-[15px] font-bold tracking-[-0.01em] text-text">{v.name}</p>
              <Figures rows={v.rows} />
              {"note" in v && <p className="mt-2.5 text-[13px] font-semibold text-[#1f7a3d]">{v.note}</p>}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-1.5 pr-1 text-[12px] text-text-muted">{V.time}</p>
    </div>
  );
}

/**
 * What the agent puts to John: v3a and v3b stacked, to pick one, v3a picked to
 * start and tagged as the one it recommends, with what changed from his terms;
 * why not the others; and Approve, which names the pick. Only v3a plays on in
 * the demo. Once he taps it, the pick locks and the button gives way to the
 * approval's status.
 */
function Approval({ approved, onApprove }: { approved: boolean; onApprove: () => void }) {
  const p = V.approval;
  const [pick, setPick] = useState<string>(p.options[0].id);
  const scripted = pick === p.options[0].id;
  return (
    <div className="sf-rise mt-4 rounded-[24px] p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.1)]">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f2f2f4]">
          <FileText className="size-5 text-text" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-bold tracking-[-0.01em] text-text">{p.title}</span>
          <span className="block text-[13px] text-text-muted">{p.id}</span>
        </span>
      </div>
      <div role="radiogroup" aria-label={p.title} className="mt-4 flex flex-col gap-2.5">
        {p.options.map((o, i) => {
          const on = pick === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={approved}
              onClick={() => setPick(o.id)}
              className={`rounded-2xl px-3.5 py-3 text-left transition-[background-color,box-shadow] ${
                on ? "bg-white shadow-[0_0_0_2px_#1d1d1f]" : "bg-[#f6f6f8] shadow-[0_0_0_1px_rgb(0_0_0/0.04)]"
              } ${approved && !on ? "opacity-50" : ""}`}
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={`grid size-[18px] shrink-0 place-items-center rounded-full ${on ? "bg-[#1d1d1f]" : "bg-white shadow-[inset_0_0_0_1.5px_rgb(0_0_0/0.25)]"}`}
                >
                  {on && <span className="size-1.5 rounded-full bg-white" />}
                </span>
                <span className="text-[12px] text-text-muted">{o.id}</span>
                {i === 0 && <span className="ml-auto rounded-full bg-[#e3f3fc] px-2 py-0.5 text-[11.5px] font-bold text-[#0b6aa6]">{p.tag}</span>}
              </span>
              <span className="mt-1 block text-[15px] font-bold tracking-[-0.01em] text-text">{o.name}</span>
              <Figures rows={o.rows} notes={"changed" in o ? { Terms: o.changed } : {}} />
              {"note" in o && <span className="mt-2.5 block text-[13px] font-semibold text-[#1f7a3d]">{o.note}</span>}
            </button>
          );
        })}
      </div>
      <div className="mt-4 border-t border-black/[0.07] pt-3.5">
        <p className="text-[13px] font-semibold text-text-muted">{p.whyNot.title}</p>
        <ul className="mt-1">
          {p.whyNot.list.map((w) => (
            <li key={w.name} className="py-1.5">
              <p className="text-[14.5px] font-semibold tracking-[-0.01em] text-text">{w.name}</p>
              <p className="mt-0.5 text-[13.5px] leading-snug text-text-muted"><Rich text={w.text} /></p>
            </li>
          ))}
        </ul>
      </div>
      {approved ? (
        <span className="sf-rise mt-3 inline-flex h-7 items-center gap-1.5 rounded-full bg-[#f2f2f4] px-2.5 text-[12.5px] font-semibold text-text">
          <span aria-hidden className="size-2 rounded-full bg-[#1f9d55]" />
          {p.approved}
        </span>
      ) : (
        <>
          <button
            type="button"
            onClick={onApprove}
            disabled={!scripted}
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1f] text-[15px] font-semibold text-white active:bg-black disabled:bg-[#c7c7cc]"
          >
            <Check className="size-[18px]" strokeWidth={2.5} />
            {p.approve(pick)}
          </button>
          {!scripted && <p className="mt-2 text-center text-[12.5px] text-text-muted">{p.notScripted}</p>}
        </>
      )}
    </div>
  );
}

/** The order as placed: its id and status, the lines (photo, units, site), and the total. */
function Order() {
  const o = O.card;
  return (
    <div className="sf-rise mt-4 rounded-[24px] p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.1)]">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f2f2f4]">
          <Package className="size-5 text-text" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-bold tracking-[-0.01em] text-text">{o.title}</span>
          <span className="block text-[13px] text-text-muted">{o.meta}</span>
        </span>
        <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-[#f2f2f4] px-2.5 text-[12.5px] font-semibold text-text">
          <span aria-hidden className="size-2 rounded-full bg-[#1f9d55]" />
          {o.status}
        </span>
      </div>
      <ul className="mt-3">
        {o.lines.map((l, i) => (
          <li key={l.name} className="flex items-center gap-3 border-t border-black/[0.07] py-3">
            <ProductPhoto photo={i === 0 ? PHOTOS.orange : PHOTOS.lemonade} pad="3px" className="size-11 shrink-0 rounded-xl" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold tracking-[-0.01em] text-text">{l.name}</span>
              <span className="block text-[13px] text-text-muted">
                {l.qty} · {l.site}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-baseline justify-between border-t border-black/[0.07] pt-3">
        <span className="text-[13px] text-text-muted">
          {o.total.label} · {o.total.note}
        </span>
        <span className="text-[17px] font-bold tabular-nums tracking-[-0.01em] text-text">{o.total.value}</span>
      </div>
    </div>
  );
}

/** A message from the agent: a soft grey bubble, square at the bottom left (the
 *  side it comes from), the full width of the thread. Cards keep all their corners. */
function AgentSays({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <p className={`sf-rise rounded-[20px] rounded-bl-none bg-[#f2f2f4] px-4 py-3 text-[16px] leading-[1.5] text-text ${className}`}>
      {children}
    </p>
  );
}

/**
 * The agent's reasoning, as a timeline: a header row, then one row per musing
 * (what it's reading, fetching, noticing or wondering, each with its icon),
 * joined by a line and arriving one at a time, the current one shimmering;
 * then the paragraph, small and quiet, streaming in as the last row. Once it's
 * done it folds to a chevron and how long it took; a tap opens or folds it.
 */
function Reasoning({
  thinking,
  musings,
  muse,
  mulling,
  thought,
  paragraph,
}: {
  thinking: boolean;
  musings: readonly { kind: string; text: string }[];
  muse: number;
  mulling: string;
  thought: string;
  /** The paragraph so far, streamed in after the musings; none on later turns. */
  paragraph?: string;
}) {
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const open = userOpen ?? thinking;
  const shown = thinking ? musings.slice(0, muse) : musings;
  const para = paragraph !== undefined && (!thinking || muse === musings.length);
  const last = paragraph === undefined ? thinking && muse > 0 : thinking && !para;
  return (
    <div className="sf-rise mt-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setUserOpen(!open)}
        className="relative flex min-h-8 items-center gap-2 text-left text-[14px] font-medium text-text-muted"
      >
        <span className="grid size-4 shrink-0 place-items-center">
          {thinking ? (
            <span aria-hidden className="sf-pulse size-2 rounded-full bg-[#0b84d0]" />
          ) : (
            <CircleCheck className="size-4" strokeWidth={2.25} />
          )}
        </span>
        <span className={thinking ? "sf-shimmer" : undefined}>
          {thinking ? mulling : thought}
        </span>
        <ChevronDown className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2.25} />
      </button>
      {open && (
        <ol>
          {shown.map((m, i) => (
            <TimelineRow
              key={m.text}
              icon={KIND[m.kind]}
              mono
              current={last && i === muse - 1}
            >
              {m.text}
            </TimelineRow>
          ))}
          {para && (
            <TimelineRow icon={AlignLeft}>
              <span className="text-text-muted/80">{paragraph}</span>
            </TimelineRow>
          )}
        </ol>
      )}
    </div>
  );
}

/** One row of the reasoning's timeline: a line up to the row above, its icon (or an agent's mark), and what it did (shimmering while it's the one running). */
function TimelineRow({
  icon: Icon,
  mark,
  current = false,
  mono = false,
  children,
}: {
  icon?: LucideIcon;
  mark?: ReactNode;
  current?: boolean;
  /** A musing (what it's thinking through) rather than prose or a turn: set in mono. */
  mono?: boolean;
  children: ReactNode;
}) {
  // The line runs from the row above (or the header) to this icon, and on below it to the foot of the row,
  // so it joins up however many lines a row wraps to; it's solid, so where segments meet they don't darken.
  return (
    <li className="group/row sf-rise relative flex gap-2 pt-2.5 text-[12.5px] leading-snug text-text-muted">
      <span aria-hidden className="absolute -top-1.5 left-[7.5px] h-[14px] w-px bg-[#dcdce0]" />
      <span aria-hidden className="absolute bottom-0 left-[7.5px] top-[29px] w-px bg-[#dcdce0] group-last/row:hidden" />
      <span className="grid h-[17px] w-4 shrink-0 place-items-center">
        {mark ?? (Icon && <Icon className={`size-3.5 ${current ? "text-text" : ""}`} strokeWidth={2} />)}
      </span>
      <span className={`${mono ? "a2a-mono" : ""} ${current ? "sf-shimmer" : ""}`}>{children}</span>
    </li>
  );
}

/** The plan: its goal and how many steps are done, then each step pending, running or done. Open while it runs, folded once it's done; a tap on the header opens or folds it. */
type PlanCopy = {
  title: string;
  of: string;
  done: string;
  toggle: string;
  steps: readonly { doing: string; done: string; detail: string; kind: string; source: string }[];
};

function Plan({ plan: p, done }: { plan: PlanCopy; done: number }) {
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const STEPS = p.steps;
  const open = userOpen ?? done < STEPS.length;
  return (
    <div className="sf-rise mt-4 rounded-[24px] bg-[#f6f6f8] px-4 py-1">
      <button
        type="button"
        aria-expanded={open}
        aria-label={p.toggle}
        onClick={() => setUserOpen(!open)}
        className="flex h-14 w-full items-center gap-3 text-left"
      >
        <Route className="size-5 shrink-0 text-text" strokeWidth={2} />
        <span className="min-w-0 flex-1">
          <span className="block text-[15.5px] font-bold tracking-[-0.01em] text-text">{p.title}</span>
          <span className="block text-[13px] text-text-muted">
            {done} {p.of} {STEPS.length} {p.done}
          </span>
        </span>
        <ChevronDown
          className={`size-5 shrink-0 text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2.25}
        />
      </button>
      {open && (
        <ol className="pb-3">
          {STEPS.map((s, i) => {
            const state = i < done ? "done" : i === done ? "running" : "pending";
            return (
              <li key={s.done} className="relative flex gap-3 py-2.5">
                {i < STEPS.length - 1 && (
                  <span aria-hidden className="absolute -bottom-2.5 left-[9.5px] top-[34px] w-px bg-black/10" />
                )}
                {state === "done" ? (
                  <CircleCheck className="mt-px size-5 shrink-0 text-text" strokeWidth={2.25} />
                ) : state === "running" ? (
                  <CircleDot className="mt-px size-5 shrink-0 text-[#0b84d0]" strokeWidth={2.25} />
                ) : (
                  <Circle className="mt-px size-5 shrink-0 text-black/20" strokeWidth={2.25} />
                )}
                <div className="min-w-0">
                  <p
                    className={`text-[15px] font-semibold tracking-[-0.01em] ${
                      state === "running" ? "sf-shimmer" : state === "pending" ? "text-text-muted" : "text-text"
                    }`}
                  >
                    {state === "done" ? s.done : s.doing}
                  </p>
                  {state !== "pending" && <p className="mt-0.5 text-[13.5px] leading-snug text-text-muted"><Rich text={s.detail} /></p>}
                  {state === "done" && (
                    <StepSource kind={s.kind} source={s.source} />
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

/** What a done step touched: how (read, fetch, write, in small capitals) and which system. */
function StepSource({ kind, source }: { kind: string; source: string }) {
  const Icon = KIND[kind];
  return (
    <span className="mt-2 inline-flex h-7 items-center gap-1.5 rounded-full bg-white px-2.5 text-[12.5px] font-medium text-text shadow-[0_0_0_1px_rgb(0_0_0/0.06)]">
      <Icon className="size-3.5 shrink-0" strokeWidth={2.25} />
      <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-text-muted">{kind}</span>
      {source}
    </span>
  );
}

/** The cart as the agent left it: Mike's line, then the one it added, marked new. */
function Result() {
  const r = a.result;
  return (
    <div className="sf-rise mt-4 rounded-[24px] p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.1)]">
      <div className="flex items-center gap-2.5">
        <ShoppingCart className="size-5 text-text" strokeWidth={2} />
        <span className="mr-auto text-[16px] font-bold tracking-[-0.01em] text-text">{r.name}</span>
        <span className="text-[13px] text-text-muted">{r.meta}</span>
      </div>
      <ul className="mt-3">
        {r.lines.map((l) => {
          const added = "added" in l && l.added;
          return (
            <li key={l.name} className="flex items-center gap-3 border-t border-black/[0.07] py-3 last:pb-0">
              <ProductPhoto photo={added ? PHOTOS.orange : PHOTOS.lemonade} pad="3px" className="size-11 shrink-0 rounded-xl" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[15px] font-semibold tracking-[-0.01em] text-text">{l.name}</span>
                  {added && (
                    <span className="rounded-full bg-[#e3f3fc] px-2 py-0.5 text-[11.5px] font-bold text-[#0b6aa6]">{r.isNew}</span>
                  )}
                </span>
                <span className="block text-[13px] text-text-muted">
                  {l.qty} · {l.site} · {l.by}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** The quote request, waiting on Fizz: white and outlined like the cart, its status at the foot. */
function Quote({ q }: { q: { id: string; status: string; meta: string } }) {
  return (
    <div className="sf-rise mt-4 rounded-[24px] p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.1)]">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f2f2f4]">
          <FileText className="size-5 text-text" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-bold tracking-[-0.01em] text-text">{q.id}</span>
          <span className="mt-0.5 block text-[13px] text-text-muted">{q.meta}</span>
        </span>
      </div>
      <span className="mt-4 inline-flex h-7 items-center gap-1.5 rounded-full bg-[#f2f2f4] px-2.5 text-[12.5px] font-semibold text-text">
        <span aria-hidden className="sf-pulse size-2 rounded-full bg-[#f5b500]" />
        {q.status}
      </span>
    </div>
  );
}

/** Suggestions once the agent's done, then one field: Add, the field, and Send (Stop while it works). */
function Composer({
  working,
  suggestions,
  placeholder,
}: {
  working: boolean;
  suggestions: readonly string[] | null;
  placeholder: string;
}) {
  return (
    <div className="shrink-0 px-4 pb-[60px] pt-2">
      {suggestions && (
        <div className="sf-rise sf-no-scrollbar -mx-4 mb-2.5 flex gap-2 overflow-x-auto px-4">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="h-10 shrink-0 rounded-full px-4 text-[14.5px] font-semibold text-text shadow-[inset_0_0_0_1px_rgb(0_0_0/0.14)]"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="flex h-[54px] items-center gap-1 rounded-full bg-[#f2f2f4] px-[7px]">
        <button type="button" aria-label={a.add} className="grid size-10 shrink-0 place-items-center rounded-full text-text">
          <Plus className="size-[22px]" strokeWidth={2} />
        </button>
        <input
          type="text"
          readOnly
          aria-label={placeholder}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent px-1 text-[16px] text-text outline-none placeholder:text-text-muted"
        />
        <button
          type="button"
          aria-label={working ? a.stop : a.send}
          disabled={!working}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-[#1d1d1f] text-white disabled:opacity-20"
        >
          {working ? <Square className="size-3.5" strokeWidth={0} fill="currentColor" /> : <ArrowUp className="size-5" strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
}
