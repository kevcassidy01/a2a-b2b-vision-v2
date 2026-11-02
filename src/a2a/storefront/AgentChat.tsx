import {
  AlignLeft,
  ArrowLeftRight,
  ArrowUp,
  BadgePercent,
  BookmarkPlus,
  CalendarClock,
  Check,
  ChevronDown,
  CircleCheck,
  Database,
  Eye,
  FileSearch,
  FileText,
  Hash,
  History,
  Lightbulb,
  Package,
  PencilLine,
  Plus,
  ShoppingCart,
  Square,
  X,
} from "lucide-react";
import { Rich } from "../Rich";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import john from "../../assets/a2a/john.png";
import mike from "../../assets/a2a/mike.png";
import agentLogo from "../../assets/a2a/agent-logo.png";
import { copy } from "../../copy/copy";
import { ProductPhoto } from "./Photo";
import { PHOTOS } from "./photos";
import { skipTo, useStory } from "../story";
import { useSite } from "./site";
import { AgentMark, OrderChecklist } from "./parts";
import { Pulse } from "../Pulse";
import { demoNow } from "../demoClock";
import type { Cue } from "../link";

const a = copy.a2a.storefront.agent;
const STEPS = a.plan.steps;
const MUSINGS = a.musings;
/**
 * How long a turn thinks, by how hard it is: `shown`, at most how many lines run
 * (spread across its steps; opened, the thinking lists them all); `open`, how long
 * the opener shows; `line`, how long a line holds, in ms (long enough to read 6–10
 * words). Lines vary a little around it (VARY), so the thinking doesn't tick.
 */
const PACE = {
  quick: { shown: 2, open: 600, line: 1700 },
  steady: { shown: 3, open: 800, line: 1800 },
  hard: { shown: 4, open: 1000, line: 2000 },
} as const;
type Pace = (typeof PACE)[keyof typeof PACE];
const VARY = [1, 0.9, 1.1, 0.95];

/** One line of the agent's thinking: a musing (no `done`) or a plan step. */
type Item = { kind: string; doing: string; done?: string; detail?: string; source?: string };
const fromMusings = (ms: readonly { kind: string; text: string }[]): Item[] => ms.map((m) => ({ kind: m.kind, doing: m.text }));

/**
 * The lines a turn shows while it thinks, starting at `start`, at its `pace`: up to
 * `pace.shown` of its items, spread evenly and always ending on the last. `shown[k]`
 * is the item line k shows, from `lines[k]`. `line(i)` is when the line covering item
 * i starts, and `step(i)` when it's done (an item between shown lines is done with the next one).
 */
function think(items: readonly Item[], start: number, pace: Pace) {
  const n = Math.min(items.length, pace.shown);
  const shown = Array.from({ length: n }, (_, k) => (n === 1 ? items.length - 1 : Math.round((k * (items.length - 1)) / (n - 1))));
  // When each line starts, then when the last one ends.
  const at = [start + pace.open];
  for (let k = 0; k < n; k++) at.push(at[k] + Math.round(pace.line * VARY[k % VARY.length]));
  const lines = at.slice(0, n);
  const folded = at[n] + 300;
  const cover = (i: number) => shown.findIndex((s) => s >= i);
  return { lines, shown, folded, line: (i: number) => at[cover(i)], step: (i: number) => at[cover(i) + 1] };
}

/** What a musing or a step did, as an icon: read, fetched, wrote, noticed, wondered. */
const KIND: Record<string, LucideIcon> = {
  read: FileSearch,
  fetch: Database,
  write: PencilLine,
  notice: Eye,
  wonder: Lightbulb,
};

/** The handoff's thinking: its musings, then its plan's steps. */
const I1 = [...fromMusings(MUSINGS), ...STEPS];
/**
 * The handoff's timeline, in ms from Assign: the thinking, a line at a time,
 * folds; the lead line, then the cart it built, the reply, the quote and suggestions.
 */
const T = (() => {
  const start = 700;
  const k = think(I1, start, PACE.hard);
  const lead = k.folded + 300;
  const done = lead + 900;
  // When plan step i is done.
  return { think: start, ...k, step: (i: number) => k.step(MUSINGS.length + i), lead, done, end: done + 1200 };
})();

const C = a.counter;
const I2 = [...fromMusings(C.musings), ...C.plan.steps];
/**
 * The counter's timeline, in ms from Fizz's counter landing: the offer comes
 * in; the agent thinks it through, a line at a time, and folds; then the reply
 * and where the quote stands.
 */
const T2 = (() => {
  const offer = 600;
  const start = offer + 1400;
  const k = think(I2, start, PACE.steady);
  const done = k.folded;
  return { offer, think: start, ...k, done, end: done + 1200 };
})();
const V = a.v3;
const I3 = fromMusings(V.musings);
/**
 * The two offers' timeline (story step 12), in ms from them landing: Fizz's
 * two offers come in; the agent thinks them through (the bundle in its
 * thinking), folds; the lead line, then the approval it puts to John.
 */
const T3 = (() => {
  const offers = 600;
  const start = offers + 1600;
  const k = think(I3, start, PACE.hard);
  const thought = k.folded;
  const ask = thought + 900;
  return { offers, think: start, ...k, thought, ask, end: ask + 400 };
})();

const O = a.order;
const I4: readonly Item[] = O.plan.steps;
/**
 * The order's timeline (story steps 13–14), in ms from John's Approve: his
 * turn; the agent's thinking, a line a step (accept, place the order, log the
 * PO); then the order, the reply, the turns so far and the done mark.
 */
const T4 = (() => {
  const start = 700;
  const k = think(I4, start + 300, PACE.quick);
  const done = k.folded;
  return { start, ...k, done, end: done + 1200 };
})();
const M = a.template;
const I5 = fromMusings(M.musings);
/**
 * Step 15's timeline, in ms from the order turn settling: the agent, still on
 * its turn, thinks ahead (Oktoberfest's dates, looked up on oktoberfest.de),
 * folds, says the festival comes round every year, and offers the template.
 */
const T5 = (() => {
  const k = think(I5, 600, PACE.quick);
  const thought = k.folded;
  const ask = thought + 900;
  return { think: 600, ...k, thought, ask, end: ask + 400 };
})();
/** Once John saves it, in ms from his tap: his turn, then the agent's reply with the saved card, and its done mark. */
const T6 = { reply: 1400, card: 1800, done: 2200, end: 2400 };
const TICK = 50;

/** How long John takes over his two moves when his side's stood in for, in ms: assigning Mike's cart once he's in, then approving v3a. */
const JOHN_ASSIGNS = 8000;
const JOHN_APPROVES = 4000;
/**
 * John's side played on its own, for the Command Center's page when no phone
 * is linked (link.tsx): each of his side's moves, as long after what it
 * answers as the phone takes to make it.
 */
export const BUYER_CUES: readonly Cue[] = [
  { beat: "quoteSent", after: null, ms: JOHN_ASSIGNS + T.done + 300 },
  { beat: "heldOut", after: "counterSent", ms: T2.done + 300 },
  { beat: "accepted", after: "v3Sent", ms: T3.ask + JOHN_APPROVES + T4.step(0) },
  { beat: "ordered", after: "accepted", ms: T4.step(1) - T4.step(0) },
];

/** Ms since a turn began (the handoff, or v2 landing), ticking until it's done; null before it. On a jump, it can start `from` partway in. */
function useClock(started: boolean, end: number, from = 0) {
  const [t, setT] = useState<number | null>(null);
  useEffect(() => {
    if (!started) return;
    const t0 = demoNow() - from;
    setT(from);
    const id = window.setInterval(() => {
      const now = demoNow() - t0;
      setT(now);
      if (now > end) clearInterval(id);
    }, TICK);
    return () => clearInterval(id);
  }, [started, end, from]);
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
  const { from, sendQuote, counterSent, holdOut, v3Sent, accept, placeOrder, setWorking } = useStory();
  // On a jump, each turn starts where the step begins: the handoff at step 4 (or its last steps at 5), v2 at 9, the order at 14.
  const [started, setStarted] = useState(from >= 4);
  const t = useClock(started, T.end, skipTo(from, T.end, 6, { 5: T.step(STEPS.length - 2) }));
  const thread = useRef<HTMLDivElement>(null);
  // Fizz has the request the moment the reply says so, not once the quote card is drawn.
  const quoted = t !== null && t >= T.done + 300;
  // Fizz's v2 lands in the thread once its agent sends it.
  const t2 = useClock(counterSent, T2.end, skipTo(from, T2.end, 10, { 9: T2.think }));
  const held = t2 !== null && t2 >= T2.done + 300;
  // Fizz's v3a and v3b land once Alex sends both; John approves v3a from the card.
  const t3 = useClock(v3Sent, T3.end, skipTo(from, T3.end, 13));
  const [approved, setApproved] = useState(from >= 14);
  const t4 = useClock(approved, T4.end, skipTo(from, T4.end, 15, { 14: T4.step(0) }));
  // Fizz has the acceptance once the first step's done, and the order once the second is.
  const accepted = t4 !== null && t4 >= T4.step(0);
  const ordered = t4 !== null && t4 >= T4.step(1);
  // Once the order turn's settled, the agent thinks ahead to next year's Oktoberfest; John saves the template.
  const t5 = useClock(t4 !== null && t4 >= T4.end, T5.end);
  const [saved, setSaved] = useState(false);
  const t6 = useClock(saved, T6.end);

  useEffect(() => {
    if (open && assign && signedIn) setStarted(true);
  }, [open, assign, signedIn]);
  // The store behind the sheet shows Mike's cart as with the agent from here on.
  const { markAssigned } = useSite();
  useEffect(() => {
    if (started) markAssigned();
  }, [started, markAssigned]);

  // Each turn lights John's agent from when something lands for it until its pulse stops.
  const working2 = t2 !== null && t2 >= T2.offer && t2 < T2.done + 1100;
  const working3 = t3 !== null && t3 >= T3.offers && t3 < T3.ask;
  const working4 = t4 !== null && t4 < T4.done + 600;
  const working5 = t5 !== null && t5 >= T5.think && t5 < T5.ask;
  const working6 = t6 !== null && t6 < T6.done;
  const working = (t !== null && t < T.done + 900) || working2 || working3 || working4 || working5 || working6;
  // What's on screen changes in beats, not every tick: scroll on those.
  const beat =
    (t === null ? -1 : [T.think, T.folded, T.lead, T.done, T.done + 300, T.done + 600, T.done + 900].filter((x) => t >= x).length) +
    (t2 === null ? 0 : [T2.offer, T2.think, T2.done, T2.done + 300, T2.done + 600, T2.done + 900, T2.done + 1100].filter((x) => t2 >= x).length) +
    (t3 === null ? 0 : [T3.offers, T3.think, T3.thought, T3.ask].filter((x) => t3 >= x).length) +
    (t4 === null ? 0 : [0, T4.start, T4.done, T4.done + 300, T4.done + 600].filter((x) => t4 >= x).length) +
    (t5 === null ? 0 : [T5.think, T5.thought, T5.ask].filter((x) => t5 >= x).length) +
    (t6 === null ? 0 : [0, T6.reply, T6.card, T6.done].filter((x) => t6 >= x).length);

  // The who's-acting bar lights John's agent while it works, and John while a decision waits on him:
  // which offer to approve (step 12), then whether to save the template (step 15).
  const johnsTurn = (t3 !== null && t3 >= T3.ask && !approved) || (t5 !== null && t5 >= T5.ask && t6 === null);
  useEffect(() => {
    setWorking("johnAgent", working);
  }, [working, setWorking]);
  useEffect(() => {
    setWorking("john", johnsTurn);
  }, [johnsTurn, setWorking]);

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
  }, [beat]);

  // The turns on Q-1042 so far, as each side's lands: v1, v2, the hold-out, v3a and v3b, the order.
  const turns = [quoted, t2 !== null && t2 >= T2.offer, held, t3 !== null && t3 >= T3.offers, ordered].filter(Boolean).length;

  // Suggestions once the agent's done and nothing's waiting on John: once the template's saved, the order's and the template's.
  const suggestions =
    t4 !== null
      ? t6 !== null && t6 >= T6.done && M.suggestions
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
            className="grid size-10 place-items-center rounded-[12px] bg-black/[0.05] text-text"
          >
            <X className="size-5" strokeWidth={2.25} />
          </button>
        </header>
        {signedIn && t !== null && <TaskBar fizz={quoted} turns={turns} />}

        <div ref={thread} className="sf-no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-6 pt-3">
          {!signedIn ? (
            <Empty title={a.signedOut.title} body={a.signedOut.body}>
              <div className="mt-7 flex w-full flex-col gap-2.5">
                {a.signedOut.suggestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="flex h-12 items-center justify-center rounded-[16px] px-5 text-[15px] font-semibold text-text shadow-[inset_0_0_0_1px_rgb(0_0_0/0.14)]"
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
                className="mt-7 flex h-12 items-center gap-2 rounded-[16px] px-5 text-[15px] font-semibold text-text shadow-[inset_0_0_0_1px_rgb(0_0_0/0.14)]"
              >
                <ShoppingCart className="size-[18px]" strokeWidth={2.25} />
                {a.suggestion}
              </button>
            </Empty>
          ) : (
            <>
              <Thread t={t} />
              {t2 !== null && <CounterTurn t={t2} />}
              {t3 !== null && <OffersTurn t={t3} approved={approved} onApprove={() => setApproved(true)} />}
              {t4 !== null && <OrderTurn t={t4} typing={t4 < T4.done + 600 || working5} />}
              {t5 !== null && <TemplateTurn t={t5} t6={t6} onSave={() => setSaved(true)} />}
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

/**
 * Under the header once the task's under way, stuck there while the thread
 * scrolls: who's in on it, as a stack (John, Mike, John's agent, then Fizz's
 * agent once the quote's out), and the turns on Q-1042 in a pill, from the first.
 */
function TaskBar({ fizz, turns }: { fizz: boolean; turns: number }) {
  const p = a.task.people;
  const people = [p.john, p.mike, p.agent, ...(fizz ? [p.fizz] : [])];
  const ring = "size-7 rounded-full shadow-[0_0_0_2px_#fff,0_0_0_3px_rgb(0_0_0/0.08)]!";
  return (
    <div className="sf-rise flex shrink-0 items-center justify-between border-b border-black/[0.06] px-5 pb-3">
      <span role="img" aria-label={`${people.slice(0, -1).join(", ")} and ${people.at(-1)}`} className="flex items-center">
        <img src={john} alt="" className={`${ring} bg-white object-cover`} />
        <img src={mike} alt="" className={`${ring} -ml-2 bg-[#f2f2f4] object-cover`} />
        <AgentMark className={`${ring} -ml-2 bg-white!`} />
        {fizz && <FizzMark className={`${ring} sf-rise -ml-2`} />}
      </span>
      {turns > 0 && (
        <span
          key={turns}
          role="img"
          aria-label={a.task.turns(turns)}
          className="a2a-bump flex h-7 items-center gap-1.5 rounded-[8px]! bg-black/[0.05] px-2.5 text-[13px] font-semibold tabular-nums text-text"
        >
          <ArrowLeftRight aria-hidden className="size-3.5 text-text-muted" strokeWidth={2.25} />
          {turns}
        </span>
      )}
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
function Thread({ t }: { t: number }) {
  return (
    <>
      <div className="sf-rise flex flex-col items-end">
        <p className="mb-2 flex items-center gap-2 pr-1 text-[13px] text-text-muted">
          <img src={john} alt="" className="size-9 rounded-full bg-white object-cover" />
          {a.handoff.label} · {a.handoff.time}
        </p>
        <div className="flex items-center gap-3 rounded-[24px] rounded-br-none bg-[#fdebe1] p-3 pr-5">
          <span className="grid size-11 place-items-center rounded-[12px] bg-white">
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
          <Thinking t={t} items={I1} at={T} opener={a.opener} summary={a.summary} paragraph={a.reasoning} />
          {t >= T.lead && <AgentSays className="mt-3"><Rich text={a.lead} /></AgentSays>}
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
function CounterTurn({ t }: { t: number }) {
  return (
    <>
      {t >= T2.offer && <Offer />}
      {t >= T2.think && (
        <div className="mt-7">
          <Head typing={t < T2.done + 1100} />
          <Thinking t={t} items={I2} at={T2} opener={C.opener} summary={C.summary} />
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
      <p className="mb-2 max-w-[92%] rounded-[24px] rounded-br-none bg-[#f2f2f4] px-4 py-3 text-[15px] leading-[1.45] text-text">
        <Rich text={C.said} />
      </p>
      <div className="w-full rounded-[24px] bg-white p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.1)]">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-[#f2f2f4]">
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
            <div key={f.label} className="rounded-[16px] bg-[#f6f6f8] px-3 py-2.5">
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
function OffersTurn({ t, approved, onApprove }: { t: number; approved: boolean; onApprove: () => void }) {
  return (
    <>
      {t >= T3.offers && <Offers />}
      {t >= T3.think && (
        <div className="mt-7">
          <Head typing={t < T3.ask} />
          <Thinking t={t} items={I3} at={T3} opener={V.opener} summary={V.summary} />
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
          <p className="rounded-[24px] rounded-br-none bg-[#fdebe1] px-4 py-3 text-text">
            <span className="block text-[16px] font-semibold">{V.you.text}</span>
            <span className="block text-[14px] text-text/70">{V.you.detail}</span>
          </p>
        </div>
      )}
    </>
  );
}

/** Story steps 13–14: the agent accepts v3a, places O-5531 and logs the PO; then the order, the reply and the turns so far. Its turn runs on into step 15. */
function OrderTurn({ t, typing }: { t: number; typing: boolean }) {
  if (t < T4.start) return null;
  return (
    <div className="mt-7">
      <Head typing={typing} />
      {t >= T4.start + 300 && <Thinking t={t} items={I4} at={T4} opener={O.opener} summary={O.summary} />}
      {t >= T4.done && <Order />}
      {t >= T4.done + 300 && <AgentSays className="mt-5"><Rich text={O.reply} /></AgentSays>}
      {t >= T4.done + 600 && <Turns turns={C.turns} n={5} />}
    </div>
  );
}

/**
 * Story step 15, on from the order in the same turn: the agent thinks ahead
 * (Oktoberfest's dates, from oktoberfest.de; the page is only in its thinking),
 * folds, says the festival comes round every year with the template attached,
 * and John picks Save template or Not now. Once he saves, his turn, the
 * agent's reply with the success card (the recurring order, saved), and its
 * mark to say it's done.
 */
function TemplateTurn({ t, t6, onSave }: { t: number; t6: number | null; onSave: () => void }) {
  if (t < T5.think) return null;
  const saved = t6 !== null;
  return (
    <>
      <Thinking t={t} items={I5} at={T5} opener={M.opener} summary={M.summary} />
      {t >= T5.thought && <AgentSays className="mt-3"><Rich text={M.said} /></AgentSays>}
      {t >= T5.ask && <Template saved={saved} onSave={onSave} />}
      {saved && (
        <div className="sf-rise mt-8 flex flex-col items-end">
          <p className="mb-2 flex items-center gap-2 pr-1 text-[13px] text-text-muted">
            <img src={john} alt="" className="size-9 rounded-full bg-white object-cover" />
            {M.you.label} · {M.you.time}
          </p>
          <p className="rounded-[24px] rounded-br-none bg-[#fdebe1] px-4 py-3 text-[16px] font-semibold text-text">{M.you.text}</p>
        </div>
      )}
      {t6 !== null && t6 >= T6.reply && (
        <div className="mt-7">
          <Head typing={false} />
          <AgentSays className="mt-3"><Rich text={M.reply} /></AgentSays>
          {t6 >= T6.card && <Saved />}
        </div>
      )}
      {t6 !== null && t6 >= T6.done && <AgentMark className="sf-rise mt-5 size-9" />}
    </>
  );
}

/** The order template the agent offers: its name, what it's from, the lines, the last terms and the reminder, then Save template or Not now (gone once he's saved; the saved card below says so). */
function Template({ saved, onSave }: { saved: boolean; onSave: () => void }) {
  const c = M.card;
  return (
    <div className="sf-rise mt-4 rounded-[24px] p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.1)]">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-[#f2f2f4]">
          <BookmarkPlus className="size-5 text-text" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-bold tracking-[-0.01em] text-text">{c.title}</span>
          <span className="block text-[13px] text-text-muted">{c.meta}</span>
        </span>
      </div>
      <ul className="mt-3">
        {c.lines.map((l, i) => (
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
      <dl className="grid grid-cols-2 gap-3 border-t border-black/[0.07] pt-3">
        {c.facts.map((f) => (
          <div key={f.label}>
            <dt className="text-[13px] text-text-muted">{f.label}</dt>
            <dd className="text-[15px] font-semibold tracking-[-0.01em] text-text">{f.value}</dd>
          </div>
        ))}
      </dl>
      {!saved && (
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={onSave}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[16px] sf-btn-dark text-[15px] font-semibold"
          >
            <Check className="size-[18px]" strokeWidth={2.5} />
            {c.save}
          </button>
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center rounded-[16px] text-[15px] font-semibold text-text shadow-[inset_0_0_0_1px_rgb(0_0_0/0.14)]"
          >
            {c.notNow}
          </button>
        </div>
      )}
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
      <p className="mb-2 max-w-[92%] rounded-[24px] rounded-br-none bg-[#f2f2f4] px-4 py-3 text-[15px] leading-[1.45] text-text">
        <Rich text={V.said} />
      </p>
      <div className="w-full rounded-[24px] bg-white p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.1)]">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-[#f2f2f4]">
            <FileText className="size-5 text-text" strokeWidth={2} />
          </span>
          <span className="min-w-0">
            <span className="block text-[16px] font-bold tracking-[-0.01em] text-text">{o.title}</span>
            <span className="block text-[13px] text-text-muted">{o.id}</span>
          </span>
        </div>
        <ul className="mt-4 flex flex-col gap-2.5">
          {o.list.map((v) => (
            <li key={v.id} className="rounded-[16px] bg-[#f6f6f8] px-3.5 py-3">
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
 * what each really costs (the line that decides it), and the checks the bundle
 * failed, each with the system checked; why not hold out; and Approve, which names the pick. Approve works for
 * either, but the story plays on as v3a (the presenter picks v3a). Once he taps it, the pick locks and the button gives way to the
 * approval's status.
 */
function Approval({ approved, onApprove }: { approved: boolean; onApprove: () => void }) {
  const p = V.approval;
  const [pick, setPick] = useState<string>(p.options[0].id);
  return (
    <div className="sf-rise -mx-2 mt-4 rounded-[24px] p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.1)]">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-[#f2f2f4]">
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
              className={`rounded-[16px] px-3.5 py-3 text-left transition-[background-color,box-shadow] ${
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
                {i === 0 && <span className="ml-auto rounded-[8px] bg-[#e3f3fc] px-2 py-0.5 text-[11.5px] font-bold text-[#0b6aa6]">{p.tag}</span>}
              </span>
              <span className="mt-1 block text-[15px] font-bold tracking-[-0.01em] text-text">{o.name}</span>
              <Figures rows={o.rows} notes={"changed" in o ? { Terms: o.changed } : {}} />
              {"note" in o && <span className="mt-2 block text-[13px] text-text-muted">{o.note}</span>}
              {/* What it really costs: the line that decides it. */}
              <span className="mt-3 flex items-baseline gap-1.5 border-t border-black/[0.07] pt-2.5 text-[13px] text-text-muted">
                {p.costLabel}
                <span className="text-[15px] font-bold tabular-nums tracking-[-0.01em] text-text">{o.cost.value}</span>
                {o.cost.why}
              </span>
              {"failed" in o && (
                <span className="mt-2 flex flex-col gap-1.5">
                  <span className="sr-only">{p.failedLabel}</span>
                  {o.failed.map((f) => (
                    <span key={f.label} className="flex items-center gap-2 text-[13px]">
                      <span aria-hidden className="grid size-4 shrink-0 place-items-center rounded-full bg-[#e8695f] text-white">
                        <X className="size-2.5" strokeWidth={3.5} />
                      </span>
                      <span className="min-w-0 flex-1 font-semibold text-text">{f.label}</span>
                      <span className="shrink-0 text-[12px] text-text-muted">{f.source}</span>
                    </span>
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-4 border-t border-black/[0.07] pt-3.5">
        <p className="text-[14.5px] font-semibold tracking-[-0.01em] text-text">{p.whyNot.title}</p>
        <p className="mt-0.5 text-[13.5px] leading-snug text-text-muted"><Rich text={p.whyNot.text} /></p>
      </div>
      {approved ? (
        <span className="sf-rise mt-3 inline-flex h-7 items-center gap-1.5 rounded-[8px] bg-[#f2f2f4] px-2.5 text-[12.5px] font-semibold text-text">
          <span aria-hidden className="size-2 rounded-full bg-[#1f9d55]" />
          {p.approved}
        </span>
      ) : (
        <button
          type="button"
          onClick={onApprove}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-[16px] sf-btn-dark text-[15px] font-semibold"
        >
          <Check className="size-[18px]" strokeWidth={2.5} />
          {p.approve}
        </button>
      )}
    </div>
  );
}

/** The order as placed: its status, its facts as chips (id, units, discount, terms), the lines (photo, units, site), and the total. */
function Order() {
  const o = O.card;
  return (
    <div className="sf-rise mt-4 rounded-[24px] p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.1)]">
      <div className="flex items-center gap-3">
        <SuccessTile />
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-bold tracking-[-0.01em] text-text">{o.title}</span>
        </span>
        <Status>{o.status}</Status>
      </div>
      <Facts meta={o.meta} className="mt-3" />
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
      {/* What follows the order: what's in, what's still to come. */}
      <OrderChecklist className="mt-3 border-t border-black/[0.07] pt-3" />
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center rounded-[16px] sf-btn-dark text-[15px] font-semibold"
        >
          {o.details}
        </button>
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[16px] text-[15px] font-semibold text-text shadow-[inset_0_0_0_1px_rgb(0_0_0/0.14)]"
        >
          <FileText className="size-[18px]" strokeWidth={2.25} />
          {o.po}
        </button>
      </div>
    </div>
  );
}

/** A success card's tile (an order placed, a recurring order saved): pale green, with a green check in place of the object's icon. */
function SuccessTile() {
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-[#e3f3e6]">
      <Check className="size-[22px] text-[#1f7a3d]" strokeWidth={2.75} />
    </span>
  );
}

/** A card's facts as chips (units, discount, terms, its id), each with an icon
 *  for what it is, split from the copy's "·"-separated meta line. */
function Facts({ meta, className = "" }: { meta: string; className?: string }) {
  const icon = (f: string): LucideIcon =>
    /units/.test(f) ? Package : /%/.test(f) ? BadgePercent : /^Net/.test(f) ? CalendarClock : Hash;
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {meta.split(" · ").map((f) => {
        const Icon = icon(f);
        return (
          <li key={f} className="inline-flex h-7 items-center gap-1.5 rounded-[8px] bg-[#f2f2f4] px-2.5 text-[12.5px] font-semibold tabular-nums text-text">
            <Icon aria-hidden className="size-3.5 shrink-0 text-text-muted" strokeWidth={2.25} />
            {f}
          </li>
        );
      })}
    </ul>
  );
}

/** A status chip at a phone card's right: a dot (green, a success) and a word. */
function Status({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-[8px] bg-[#f2f2f4] px-2.5 text-[12.5px] font-semibold text-text">
      <span aria-hidden className="size-2 rounded-full bg-[#1f9d55]" />
      {children}
    </span>
  );
}

/** The recurring order, saved (story step 15's success): what it is and where it lives, how often it repeats and the next reminder, and a way to open it. */
function Saved() {
  const c = M.savedCard;
  return (
    <div className="sf-rise mt-4 rounded-[24px] p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.1)]">
      <div className="flex items-center gap-3">
        <SuccessTile />
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-bold tracking-[-0.01em] text-text">{c.title}</span>
          <span className="block text-[13px] text-text-muted">{c.meta}</span>
        </span>
        <Status>{c.status}</Status>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-black/[0.07] pt-3">
        {c.facts.map((f) => (
          <div key={f.label}>
            <dt className="text-[13px] text-text-muted">{f.label}</dt>
            <dd className="text-[15px] font-semibold tracking-[-0.01em] text-text">{f.value}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        className="mt-4 flex h-12 w-full items-center justify-center rounded-[16px] text-[15px] font-semibold text-text shadow-[inset_0_0_0_1px_rgb(0_0_0/0.14)]"
      >
        {c.open}
      </button>
    </div>
  );
}

/** A message from the agent: a soft grey bubble, square at the bottom left (the
 *  side it comes from), the full width of the thread. Cards keep all their corners. */
function AgentSays({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <p className={`sf-rise rounded-[24px] rounded-bl-none bg-[#f2f2f4] px-4 py-3 text-[16px] leading-[1.5] text-text ${className}`}>
      {children}
    </p>
  );
}

/**
 * The agent's thinking, as one line that changes in place: a calm opener, then
 * what it's doing now, a line at a time (shimmering, by a pulsing dot), so it
 * never reads as a log. Once it's done it folds to what it came to, with a
 * chevron; opened, every step it took (and on the first turn, its reasoning).
 */
function Thinking({
  t,
  items,
  at,
  opener,
  summary,
  paragraph,
}: {
  t: number;
  items: readonly Item[];
  at: { lines: readonly number[]; shown: readonly number[]; folded: number };
  opener: string;
  summary: string;
  paragraph?: string;
}) {
  const [open, setOpen] = useState(false);
  const thinking = t < at.folded;
  const n = at.lines.filter((x) => t >= x).length;
  const line = thinking ? (n === 0 ? opener : items[at.shown[n - 1]].doing) : summary;
  return (
    <div className="sf-rise mt-3">
      <button
        type="button"
        aria-expanded={thinking ? undefined : open}
        onClick={() => setOpen(!open)}
        disabled={thinking}
        className="relative flex min-h-8 items-start gap-2 py-1 text-left text-[14px] font-medium leading-snug text-text-muted"
      >
        <span className="grid h-5 w-4 shrink-0 place-items-center">
          {thinking ? (
            <span aria-hidden className="sf-pulse size-2 rounded-full bg-[#0b84d0]" />
          ) : (
            <CircleCheck className="size-4" strokeWidth={2.25} />
          )}
        </span>
        <span aria-live="polite">
          <span key={line} className={`sf-rise inline-block ${thinking ? "sf-shimmer" : ""}`}>
            {line}
          </span>
        </span>
        {!thinking && (
          <ChevronDown className={`mt-0.5 size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2.25} />
        )}
      </button>
      {!thinking && open && (
        <ol>
          {items.map((it) => (
            <TimelineRow key={it.doing} icon={KIND[it.kind]}>
              {it.done ? (
                <>
                  <span className="block font-semibold text-text">{it.done}</span>
                  {it.detail && (
                    <span className="mt-0.5 block">
                      <Rich text={it.detail} />
                    </span>
                  )}
                  {it.source && (
                    <span className="block">
                      <StepSource kind={it.kind} source={it.source} />
                    </span>
                  )}
                </>
              ) : (
                it.doing
              )}
            </TimelineRow>
          ))}
          {paragraph && (
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
  children,
}: {
  icon?: LucideIcon;
  mark?: ReactNode;
  current?: boolean;
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
      <span className={current ? "sf-shimmer" : undefined}>{children}</span>
    </li>
  );
}

/** What a done step touched: how (read, fetch or write, as an icon) and which system. */
function StepSource({ kind, source }: { kind: string; source: string }) {
  const Icon = KIND[kind];
  return (
    <span className="mt-2 inline-flex h-7 items-center gap-1.5 rounded-[8px] bg-white px-2.5 text-[12.5px] font-medium text-text shadow-[0_0_0_1px_rgb(0_0_0/0.06)]">
      <Icon className="size-3.5 shrink-0" strokeWidth={2.25} />
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
                    <span className="rounded-[8px] bg-[#e3f3fc] px-2 py-0.5 text-[11.5px] font-bold text-[#0b6aa6]">{r.isNew}</span>
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

/** The quote request, waiting on Fizz: white and outlined like the cart, its facts as chips, its status at the foot. */
function Quote({ q }: { q: { id: string; status: string; meta: string } }) {
  return (
    <div className="sf-rise mt-4 rounded-[24px] p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.1)]">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-[#f2f2f4]">
          <FileText className="size-5 text-text" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-bold tracking-[-0.01em] text-text">{q.id}</span>
        </span>
      </div>
      <Facts meta={q.meta} className="mt-3" />
      <span className="mt-4 inline-flex h-7 items-center gap-1.5 rounded-[8px] bg-[#f2f2f4] px-2.5 text-[12.5px] font-semibold text-text">
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
              className="h-10 shrink-0 rounded-[12px] px-4 text-[14.5px] font-semibold text-text shadow-[inset_0_0_0_1px_rgb(0_0_0/0.14)]"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="flex h-[54px] items-center gap-1 rounded-[16px] bg-[#f2f2f4] px-[7px]">
        <button type="button" aria-label={a.add} className="grid size-10 shrink-0 place-items-center rounded-[12px] text-text">
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
          className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-[#1d1d1f] text-white disabled:opacity-20"
        >
          {working ? <Square className="size-3.5" strokeWidth={0} fill="currentColor" /> : <ArrowUp className="size-5" strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
}
