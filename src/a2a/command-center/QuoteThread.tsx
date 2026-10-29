import {
  Check,
  ChevronDown,
  CircleCheck,
  Database,
  ExternalLink,
  Eye,
  FileSearch,
  FileText,
  History,
  Lightbulb,
  Package,
  PencilLine,
  Scale,
  Send,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import agentLogo from "../../assets/a2a/agent-logo.png";
import alex from "../../assets/a2a/alex.png";
import john from "../../assets/a2a/john.png";
import margret from "../../assets/a2a/margret.png";
import buyerAgent from "../../assets/a2a/agent-sparkle.png";
import salesforce from "../../assets/a2a/logos/salesforce.svg";
import { copy } from "../../copy/copy";
import { Rich } from "../Rich";
import { skipTo, useStory } from "../story";
import { CardAction, CardStatus, KnowledgeCard } from "./KnowledgeCard";
import { Pulse } from "../Pulse";
import { demoNow } from "../demoClock";

const q = copy.a2a.commandCenter.agent.quote;
const MUSINGS = q.musings;
const STEPS = q.plan.steps;
const H = q.heldOut;
const D = q.decision;
const V3 = q.v3;
const A = q.accepted;
const OR = q.order;

/** `source`: the Salesforce area a musing looked in. */
type Musing = { kind: string; text: string; source?: string };
/** One line of the agent's thinking: a musing (no `done`) or a check. `sf`: its source is in Salesforce, so its chip wears the logo. */
type Item = { kind: string; doing: string; done?: string; detail?: string; source?: string; sf?: boolean };
const fromMusings = (ms: readonly Musing[]): Item[] => ms.map((m) => ({ kind: m.kind, doing: m.text, source: m.source, sf: !!m.source }));
/** Everything on the agent's side runs the same width: its messages, its checks, its cards. */
const AGENT_COL = "w-full max-w-[560px]";

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

/** Turn 1's thinking: what it mused, then its checks, drafting and sending the counter. */
const I1 = [...fromMusings(MUSINGS), ...STEPS];
/**
 * The thread's timeline, in ms after it opens: the agent's turn starts; its
 * thinking runs a line at a time and folds once the counter's sent; then the
 * counter-offer, the reply and the done mark.
 */
const T = (() => {
  const start = 700;
  const k = think(I1, start, PACE.hard);
  const sent = k.folded;
  return { start, ...k, sent, card: sent + 400, reply: sent + 900, turns: sent + 1300, end: sent + 1500 };
})();

/** Turn 2's thinking: reading Isar's reply, then finding a way to 15%. */
const I2 = fromMusings(H.musings);
/**
 * Isar's agent holds out (story step 9), in ms from its reply landing: the
 * reply; the agent thinks it through and folds; the lead line, it turns to
 * Alex, then his decision card (step 10), the turns so far and the done mark.
 */
const T2 = (() => {
  const reply = 300;
  const start = 1500;
  const k = think(I2, start, PACE.hard);
  const lead = k.folded + 300;
  const handoff = lead + 900;
  const decision = handoff + 500;
  return { reply, start, ...k, lead, handoff, decision, turns: decision + 400, end: decision + 600 };
})();

/** Turn 3's thinking: drafting both offers and sending them. */
const I3: readonly Item[] = V3.plan.steps;
/**
 * Alex sends both (story step 11), in ms from his pick: his turn; the agent's,
 * its thinking drafting and sending both offers; the two offers as one card,
 * the reply, the turns so far and the done mark.
 */
const T3 = (() => {
  const start = 700;
  const k = think(I3, start, PACE.quick);
  const sent = k.folded;
  return { start, ...k, sent, card: sent + 400, reply: sent + 900, turns: sent + 1300, end: sent + 1500 };
})();

/** Isar's agent accepts v3a (story step 13), in ms from it landing: the acceptance, then the agent's word on it. */
const T4 = (() => {
  const card = 300;
  const start = 1300;
  return { card, start, said: start + 400, end: start + 600 };
})();

/** O-5531 arrives (story step 14), in ms from it being placed: the order, the agent's word, the turns so far and the done mark. */
const T5 = { start: 300, card: 400, said: 900, turns: 1300, end: 1500 };

/** What a musing or a check did, as an icon: read, looked up, wrote, noticed, wondered. */
const KIND: Record<string, LucideIcon> = { read: FileSearch, fetch: Database, write: PencilLine, notice: Eye, wonder: Lightbulb };

/** Ms since a turn began (the thread opening, Isar's reply landing, Alex's pick), ticking until it's over; null before it. */
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
    }, 100);
    return () => clearInterval(id);
  }, [started, end, from]);
  return t;
}

/**
 * QuoteThread — the seller agent's chat about Q-1042, opened when Alex clicks
 * the request. Isar's agent's turn is the quote request it sent (right, like
 * a person's turn). Then Fizz's agent's turn:
 * - it takes the request in, a timeline of musings one at a time, slower than
 *   the phone's (reading the request, pulling up the account, checking Fizz's
 *   rules, weighing it up); it stays at "Weighing the options" a while, then
 *   folds to how long it took;
 * - a lead line: 15% is over its limit, so it'll check before countering;
 * - its checks, one after another, each naming the system it read or wrote
 *   (stock, price book, policy, credit), then drafting and sending v2;
 * - the counter-offer as a knowledge card, waiting on Isar; the reply; its
 *   logo on a line of its own, to say it's done.
 * Once v2 is out, the story knows (the phone's agent gets it; the agent stops
 * working and waits on the buyer).
 *
 * When Isar's agent holds out for 15% (step 9), its reply lands and the agent
 * weighs it again, finds it can't get there, and hands Alex a decision card
 * (step 10). Alex picks; his turn, then the agent drafts and sends v3a and v3b
 * (step 11). Once John approves v3a, Isar's acceptance lands (step 13), then
 * order O-5531 (step 14).
 */
export function QuoteThread() {
  const { from, sendCounter, heldOut, askAlex, sendV3, accepted, ordered, setWorking } = useStory();
  // On a jump, each turn starts where the step begins: the checks at step 7, sending the counter at 8, the thinking at 10.
  const t = useClock(true, T.end, skipTo(from, T.end, 9, { 7: T.line(MUSINGS.length), 8: T.line(I1.length - 1) })) ?? 0;
  const t2 = useClock(heldOut && t >= T.end, T2.end, skipTo(from, T2.end, 11, { 10: T2.start }));
  const [chosen, setChosen] = useState(from >= 12);
  const t3 = useClock(chosen, T3.end, skipTo(from, T3.end, 12));
  const sent = t >= T.sent;
  const asked = t2 !== null && t2 >= T2.decision;
  const sent3 = t3 !== null && t3 >= T3.sent;
  const t4 = useClock(accepted && t3 !== null && t3 >= T3.end, T4.end, skipTo(from, T4.end, 15));
  const t5 = useClock(ordered && t4 !== null && t4 >= T4.end, T5.end, skipTo(from, T5.end, 15));

  useEffect(() => {
    if (sent) sendCounter();
  }, [sent, sendCounter]);
  useEffect(() => {
    if (asked) askAlex();
  }, [asked, askAlex]);
  useEffect(() => {
    if (sent3) sendV3();
  }, [sent3, sendV3]);
  const choose = () => setChosen(true);
  // The who's-acting bar: the seller agent from when something lands for it until its pulse stops, each
  // turn; Alex while the decision card waits on him (step 10).
  const working =
    t < T.end ||
    (t2 !== null && t2 >= T2.reply && t2 < T2.decision) ||
    (t3 !== null && t3 < T3.end) ||
    (t4 !== null && t4 >= T4.card && t4 < T4.said) ||
    (t5 !== null && t5 < T5.end);
  const alexsTurn = asked && !chosen;
  useEffect(() => {
    setWorking("alexAgent", working);
  }, [working, setWorking]);
  useEffect(() => {
    setWorking("alex", alexsTurn);
  }, [alexsTurn, setWorking]);

  // Keep the newest thing in view, above the prompt box, as each one comes in.
  const at = (clock: number | null, xs: number[]) => (clock === null ? 0 : xs.filter((x) => clock >= x).length);
  const beat =
    at(t, [T.start, T.folded, T.card, T.reply, T.turns, T.end]) +
    at(t2, [T2.reply, T2.start, T2.folded, T2.lead, T2.handoff, T2.decision, T2.turns, T2.end]) +
    at(t3, [0, T3.start, T3.folded, T3.card, T3.reply, T3.turns, T3.end]) +
    at(t4, [T4.card, T4.start, T4.said, T4.end]) +
    at(t5, [T5.start, T5.card, T5.said, T5.turns, T5.end]);
  // What Alex might ask next, under the latest turn once it's settled, and only while nothing new is landing.
  const followUps =
    t5 !== null
      ? t5 >= T5.end && OR.followUps
      : t4 !== null
        ? null
        : t3 !== null
          ? t3 >= T3.end && V3.followUps
          : t2 !== null
            ? t2 >= T2.end && !chosen && H.followUps
            : t >= T.end && !heldOut && q.followUps;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scroller = ref.current?.closest<HTMLElement>(".overflow-y-auto");
    scroller?.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
  }, [beat, followUps]);

  return (
    <div ref={ref} className="flex flex-col py-8">
      <Request />
      {t >= T.start && (
        <div className="mt-7">
          <Mark typing={t < T.end} outcome={q.outcome} />
          <Thinking t={t} items={I1} at={T} opener={q.opener} summary={q.summary} />
          {t >= T.card && <Counter />}
          {t >= T.reply && <AgentSays className="mt-4" sources={q.sources}><Rich text={q.reply} /></AgentSays>}
          {t >= T.turns && <Turns n={2} />}
          {t >= T.end && <Mark className="mt-4" />}
        </div>
      )}
      {t2 !== null && t2 >= T2.reply && <Request card={H.reply} from={H.from} time={H.time} className="mt-8" />}
      {t2 !== null && t2 >= T2.start && (
        <div className="mt-7">
          <Mark typing={t2 < T2.decision} outcome={H.outcome} />
          <Thinking t={t2} items={I2} at={T2} opener={H.opener} summary={H.summary} />
          {t2 >= T2.lead && <AgentSays className="mt-3" sources={H.sources}><Rich text={H.lead} /></AgentSays>}
          {t2 >= T2.handoff && <Handoff />}
          {t2 >= T2.decision && <Decision chosen={chosen} onSend={choose} />}
          {t2 >= T2.turns && <Turns n={3} />}
          {t2 >= T2.end && <Mark className="mt-4" />}
        </div>
      )}
      {t3 !== null && (
        <div className="a2a-load-in mt-8 flex flex-col items-end">
          <p className="mb-2 flex items-center gap-2 pr-1 text-[13px] font-medium text-text">
            <img src={alex} alt="" className="size-10 rounded-full bg-[#e3effc] object-cover" />
            {V3.you}
          </p>
          <p className="max-w-[440px] rounded-2xl rounded-br-none bg-[#e3effc] px-4 py-3 text-[14px] leading-[1.55] text-text">
            {V3.said}
          </p>
        </div>
      )}
      {t3 !== null && t3 >= T3.start && (
        <div className="mt-7">
          <Mark typing={t3 < T3.end} outcome={V3.outcome} />
          <Thinking t={t3} items={I3} at={T3} opener={V3.opener} summary={V3.summary} />
          {t3 >= T3.card && <Offers took={t4 !== null} />}
          {t3 >= T3.reply && <AgentSays className="mt-4" sources={V3.sources}><Rich text={V3.reply} /></AgentSays>}
          {t3 >= T3.turns && <Turns n={4} />}
          {t3 >= T3.end && <Mark className="mt-4" />}
        </div>
      )}
      {t4 !== null && t4 >= T4.card && <Request card={A.card} from={A.from} time={A.time} done className="mt-8" />}
      {t4 !== null && t4 >= T4.start && (
        <div className="mt-7">
          <Mark typing={t4 < T4.said || (t5 !== null && t5 < T5.end)} outcome={t5 !== null ? OR.outcome : undefined} />
          {t4 >= T4.said && <AgentSays className="mt-3"><Rich text={A.said} /></AgentSays>}
          {t5 !== null && t5 >= T5.card && <Order />}
          {t5 !== null && t5 >= T5.said && <AgentSays className="mt-4" sources={OR.sources}><Rich text={OR.said} /></AgentSays>}
          {t5 !== null && t5 >= T5.turns && <Turns n={5} />}
          {t5 !== null && t5 >= T5.end && <Mark className="mt-4" />}
        </div>
      )}
      {followUps && <FollowUps prompts={followUps} />}
    </div>
  );
}

/**
 * The seller agent's logo in a circle: at the head of its turn, and on a line of its own when it's done.
 * While the turn is at work, the pulse runs beside it, as if it's typing. Once it's done, the head
 * says what the turn came to for the business, in a line, ahead of how it got there.
 */
function Mark({ typing = false, outcome, className = "" }: { typing?: boolean; outcome?: string; className?: string }) {
  const mark = (
    <span className={`a2a-load-in grid size-10 shrink-0 place-items-center rounded-full bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.08)] ${typing || outcome ? "" : className}`}>
      <img src={agentLogo} alt="" className="size-[22px]" />
    </span>
  );
  if (!typing && outcome)
    return (
      <span className={`flex items-center gap-3 ${className}`}>
        {mark}
        <span className="a2a-load-in text-[15px] font-semibold leading-snug text-text">{outcome}</span>
      </span>
    );
  if (!typing) return mark;
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      {mark}
      <Pulse scale={1.25} className="a2a-load-in" />
    </span>
  );
}

/**
 * The agent's thinking, as one line that changes in place: a calm opener, then
 * what it's doing now, a line at a time (shimmering, by a pulsing dot), so it
 * never reads as a log. Once it's done it folds to what it came to, with a
 * chevron; opened, every step it took, each with where it looked.
 */
function Thinking({
  t,
  items,
  at,
  opener,
  summary,
}: {
  t: number;
  items: readonly Item[];
  at: { lines: readonly number[]; shown: readonly number[]; folded: number };
  opener: string;
  summary: string;
}) {
  const [open, setOpen] = useState(false);
  const thinking = t < at.folded;
  const n = at.lines.filter((x) => t >= x).length;
  const line = thinking ? (n === 0 ? opener : items[at.shown[n - 1]].doing) : summary;
  return (
    <div className={`a2a-load-in mt-3 ${AGENT_COL}`}>
      <button
        type="button"
        aria-expanded={thinking ? undefined : open}
        onClick={() => setOpen(!open)}
        disabled={thinking}
        className="flex min-h-8 items-start gap-2 py-1.5 text-left text-[14px] font-medium leading-snug text-text-muted enabled:hover:text-text"
      >
        <span className="grid h-5 w-4 shrink-0 place-items-center">
          {thinking ? (
            <span aria-hidden className="a2a-pulse size-2 rounded-full bg-[#7f56d9]" />
          ) : (
            <CircleCheck className="size-4" strokeWidth={2.25} />
          )}
        </span>
        <span aria-live="polite" className="max-w-[440px]">
          <span key={line} className={`a2a-load-in inline-block ${thinking ? "a2a-shimmer" : ""}`}>
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
            <Row
              key={it.doing}
              icon={KIND[it.kind]}
              current={false}
              chip={it.source && <Source kind={it.kind} source={it.source} sf={it.sf} />}
            >
              {it.done ? (
                <>
                  <span className="font-medium text-text">{it.done}</span>
                  {it.detail && (
                    <span className="mt-0.5 block">
                      <Rich text={it.detail} />
                    </span>
                  )}
                </>
              ) : (
                it.doing
              )}
            </Row>
          ))}
        </ol>
      )}
    </div>
  );
}

/** The agent turning to Alex before it hands him the call, as a colleague would: his photo, a mention, and a line to him. */
function Handoff() {
  return (
    <p className="a2a-load-in mt-4 flex items-center gap-2 text-[14px] text-text">
      <img src={alex} alt="" className="size-7 rounded-full bg-[#e3effc] object-cover" />
      <span className="rounded-md bg-[#e3effc] px-1.5 font-medium text-[#0b5cab]">{H.handoff.to}</span>
      {H.handoff.text}
    </p>
  );
}

/** What Alex might ask next, as prompt chips under the latest turn (display only). */
function FollowUps({ prompts }: { prompts: readonly string[] }) {
  return (
    <ul className="a2a-load-in mt-6 flex flex-wrap gap-2">
      {prompts.map((s) => (
        <li key={s}>
          <button
            type="button"
            className="flex h-9 items-center rounded-[10px] bg-white px-3.5 text-[13.5px] font-medium text-text shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_2px_rgb(0_0_0/0.05)] transition-[background-color,box-shadow] hover:bg-[#f7f7f8] hover:shadow-[0_0_0_1px_rgb(0_0_0/0.16),0_1px_2px_rgb(0_0_0/0.05)] active:bg-[#f0f0f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0176d3]"
          >
            {s}
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * The back and forth on Q-1042 so far (there's been more than one turn once v2
 * is out): a clock, how many turns, a chevron, folded until clicked; open, a
 * timeline of who did what, each by its agent's mark. Sits before the done mark.
 */
function Turns({ n }: { n: number }) {
  const [open, setOpen] = useState(false);
  const turns = { ...q.turns, list: q.turns.list.slice(0, n) };
  return (
    <div className="a2a-load-in mt-4">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex min-h-8 items-center gap-2 text-left text-[14px] font-medium text-text-muted hover:text-text"
      >
        <History className="size-4 shrink-0" strokeWidth={2.25} />
        {turns.title(turns.list.length)}
        <ChevronDown className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2.25} />
      </button>
      {open && (
        <ol>
          {turns.list.map((x) => (
            <Row key={x.text} mark={<img src={x.by === "seller" ? agentLogo : buyerAgent} alt="" className="size-3.5" />} current={false}>
              <Rich text={x.text} />
            </Row>
          ))}
        </ol>
      )}
    </div>
  );
}

/** A message from the agent: a soft grey bubble, square at the bottom left (the side it comes from).
 *  With `sources`, the Salesforce areas its facts came from stack under it as chips. */
function AgentSays({ className = "", sources, children }: { className?: string; sources?: readonly string[]; children: ReactNode }) {
  return (
    <div
      className={`a2a-load-in ${AGENT_COL} rounded-2xl rounded-bl-none bg-[#f3f3f5] px-4 py-3 text-[14px] leading-[1.55] text-text ${className}`}
    >
      <p>{children}</p>
      {sources && (
        <p className="mt-2.5 flex flex-wrap gap-1">
          {sources.map((x) => (
            <Source key={x} source={x} sf large />
          ))}
        </p>
      )}
    </div>
  );
}

/** Where a check or a musing looked, as a chip: the Salesforce logo and the area for Salesforce, else what it did as an icon. */
function Source({ kind, source, sf = false, large = false }: { kind?: string; source: string; sf?: boolean; large?: boolean }) {
  const Icon = kind ? KIND[kind] : undefined;
  return (
    <span
      className={`inline-flex items-center rounded-md bg-white font-medium text-text shadow-[0_0_0_1px_rgb(0_0_0/0.07)] ${
        large ? "h-6 gap-1 px-2 text-[12px]" : "h-5 gap-1 px-1.5 text-[11.5px]"
      }`}
    >
      {sf ? (
        <img src={salesforce} alt="Salesforce" className={`shrink-0 object-contain ${large ? "h-3 w-[18px]" : "h-2.5 w-[15px]"}`} />
      ) : (
        Icon && <Icon className="size-3 shrink-0" strokeWidth={2.25} />
      )}
      {source}
    </span>
  );
}

type QuoteCard = {
  title: string;
  id: string;
  from: string;
  status: string;
  lines: readonly Line[];
  terms: readonly Term[];
  via: string;
  said: string;
};

/**
 * One agent-to-agent message: the line it said, then what came with it. An
 * agent never sends an attachment alone, as a person wouldn't send a file with
 * no note. Attachments are knowledge cards today; a file would take the same slot.
 * `side` is where the sender sits: Isar's agent on the right, Fizz's on the left,
 * its line marked as going to Isar so it doesn't read as said to Alex.
 */
function Message({ said, side, children }: { said: string; side: "in" | "out"; children: ReactNode }) {
  const out = side === "out";
  return (
    <div className={`flex w-full flex-col ${out ? "items-start" : "items-end"}`}>
      {out && <p className="mb-1.5 pl-1 text-[11.5px] text-text-muted">{q.toIsar}</p>}
      <p
        className={`mb-2 max-w-[440px] rounded-2xl bg-[#f3f3f5] px-4 py-3 text-[14px] leading-[1.55] text-text ${out ? "rounded-bl-none" : "rounded-br-none"}`}
      >
        <Rich text={said} />
      </p>
      {children}
    </div>
  );
}

/**
 * Isar's agent's turn, on the right like a person's: who sent it (the buyer
 * agent's sparkle and name), what it said, the request (or its reply to v2) as a knowledge
 * card attached, and when, small, under the card.
 */
function Request({
  card: r = q.request,
  from = q.from,
  time = q.time,
  done = false,
  className = "",
}: {
  card?: QuoteCard;
  from?: string;
  time?: string;
  /** An acceptance rather than an ask: a success (green check tile, green status). */
  done?: boolean;
  className?: string;
}) {
  return (
    <div className={`a2a-load-in flex flex-col items-end ${className}`}>
      <p className="mb-2 flex items-center gap-2 pr-1 text-[13px] font-medium text-text">
        <AgentOf photo={john} logo={buyerAgent} />
        {from}
      </p>
      <Message said={r.said} side="in">
        <KnowledgeCard
          icon={FileText}
          title={r.title}
          id={r.id}
          subtitle={r.from}
          status={<CardStatus color={done ? "#2e844a" : "#0176d3"}>{r.status}</CardStatus>}
          success={done}
          className="w-full max-w-[520px]"
          footer={<Via text={r.via} />}
        >
          <QuoteBody lines={r.lines} terms={r.terms} />
        </KnowledgeCard>
      </Message>
      <p className="mt-1.5 pr-1 text-[11px] text-text-muted">{time}</p>
    </div>
  );
}

/** The counter-offer the agent sent, on its side, with its line to Isar: what changed marked on each line, waiting on Isar. */
function Counter() {
  const c = q.counter;
  return (
    <div className={`a2a-load-in mt-4 flex ${AGENT_COL} flex-col`}>
      <Message said={c.said} side="out">
        <KnowledgeCard
          icon={FileText}
          title={c.title}
          id={c.id}
          subtitle={c.for}
          status={<CardStatus color="#f5b500">{c.status}</CardStatus>}
          className="w-full"
          footer={<Via text={c.via} />}
        >
          <QuoteBody lines={c.lines} terms={c.terms} />
        </KnowledgeCard>
      </Message>
      <p className="mt-1.5 pl-1 text-[11px] text-text-muted">{q.time}</p>
    </div>
  );
}

/**
 * Alex's call (story step 10), as a trade-off: the agent's recommendation up top
 * (its reasons fold under Why), then the two ways to 15% side by side, each led
 * by what Fizz gets, and both picked to start. The bundle says what's in it and that Margret's agent set it up (Margret is Alex's sales director).
 * Send says what goes (Send both offers, or Send counter-offer with one picked); Decline sits
 * beside it. Only "Send both offers" plays on in the demo; the others do nothing. Once sent, the card keeps the picks.
 * The card runs a little wider than the column, into its right padding, so the
 * credit under the bundle fits on one line.
 */
function Decision({ chosen, onSend }: { chosen: boolean; onSend: () => void }) {
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set(D.options.map((o) => o.id)));
  const toggle = (id: string) =>
    setPicked((s) => {
      const next = new Set(s);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const count = picked.size === D.options.length ? "both" : picked.size ? "one" : "none";
  return (
    <div className="a2a-load-in -mr-7 mt-4 flex w-[calc(100%+28px)] max-w-[600px] flex-col">
      <KnowledgeCard
        icon={Scale}
        title={D.title}
        subtitle={D.for}
        status={<CardStatus color={chosen ? "#2e844a" : "#f5b500"}>{chosen ? D.sent : D.status}</CardStatus>}
        footer={
          <>
            {!chosen && (
              <>
                <CardAction kind="primary" icon={Send} disabled={count === "none"} onClick={count === "both" ? onSend : undefined}>
                  {D.send[count]}
                </CardAction>
                <CardAction icon={X}>{D.decline}</CardAction>
              </>
            )}
            <span className="truncate text-[12px] text-text-muted">{chosen ? D.sentNote : D.note[count]}</span>
          </>
        }
      >
        <Recommend />
        <div className="grid grid-cols-2 gap-3">
          {D.options.map((o) => {
            const on = picked.has(o.id);
            return (
              <button
                key={o.id}
                type="button"
                role="checkbox"
                aria-checked={on}
                aria-label={`${D.pick} ${o.name}`}
                disabled={chosen}
                onClick={() => toggle(o.id)}
                className={`flex flex-col rounded-xl p-4 text-left transition-[background-color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0176d3] disabled:cursor-default ${
                  on ? "bg-white shadow-[0_0_0_1.5px_#0176d3]" : "bg-[#f7f7f8] shadow-[0_0_0_1px_rgb(0_0_0/0.04)] enabled:hover:bg-[#f0f0f2]"
                } ${chosen && !on ? "opacity-50" : ""}`}
              >
                <span className="flex h-5 items-center gap-2">
                  <span
                    aria-hidden
                    className={`grid size-4 shrink-0 place-items-center rounded-[5px] ${on ? "bg-[#0176d3]" : "bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.2)]"}`}
                  >
                    {on && <Check className="size-3 text-white" strokeWidth={3} />}
                  </span>
                  <span className="a2a-title text-[16px] font-semibold leading-snug text-text">{o.name}</span>
                </span>
                <span className="mt-4 text-[12px] text-text-muted">{D.impactLabel}</span>
                <span className="a2a-title mt-0.5 text-[22px] font-semibold leading-tight tabular-nums text-text">{o.impact.value}</span>
                <span className="mt-1 text-[13px] leading-snug text-[#1f7a3d]">
                  <Rich text={o.impact.note} />
                </span>
                <dl className="mt-4 flex flex-col gap-2.5 text-[13.5px] tabular-nums">
                  {o.rows.map(([k, val]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <dt className="text-text-muted">{k}</dt>
                      <dd className="font-medium text-text">{val}</dd>
                    </div>
                  ))}
                </dl>
                {"bundle" in o && (
                  <span className="mt-3 block rounded-lg bg-black/[0.04] px-3 py-3 text-[14px] leading-snug tabular-nums">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-medium text-text">
                        <span className="text-[#1f7a3d]">{o.bundle.qty}</span> {o.bundle.name}
                      </span>
                      <span className="shrink-0 text-text-muted">{o.bundle.amount}</span>
                    </span>
                    <span className="mt-1 block text-text-muted">{o.bundle.note}</span>
                  </span>
                )}
                {"suggested" in o && (
                  <span className="mt-4 flex items-center gap-2 border-t border-black/[0.06] pt-4 leading-snug">
                    <AgentOf photo={margret} />
                    <span className="min-w-0">
                      <span className="block whitespace-nowrap text-[13.5px] text-text">
                        {o.suggested.label} <span className="font-semibold">{o.suggested.name}</span>
                      </span>
                      <span className="mt-0.5 block text-[12.5px] text-text-muted">{o.suggested.role}</span>
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </KnowledgeCard>
    </div>
  );
}

/** The agent's pick, tagged, and what it means for Fizz; Why opens its reasons. */
function Recommend() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 rounded-xl bg-[#f4f1fe] px-4 py-3">
      <p className="text-[14px] leading-normal text-text">
        <span className="mr-2 rounded-lg bg-[#e4dcfc] px-2 py-0.5 text-[11.5px] font-medium text-[#5b3fc4]">{D.recommend.tag}</span>
        <Rich text={D.recommend.text} />
      </p>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="mt-2 flex min-h-6 items-center gap-1 text-[13px] font-medium text-[#5b3fc4] hover:text-[#432c9e]"
      >
        {D.why.label}
        <ChevronDown className={`size-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2.25} />
      </button>
      {open && (
        <ul className="a2a-load-in mt-1 flex list-disc flex-col gap-1 pl-5 text-[13px] leading-snug text-text-muted">
          {D.why.reasons.map((r) => (
            <li key={r}>
              <Rich text={r} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Someone's agent, as an avatar group: their photo, with the agent's logo
 * stacked over its right edge, so it reads as "Margret's agent" or "John's agent".
 */
function AgentOf({ photo, logo = agentLogo }: { photo: string; logo?: string }) {
  return (
    <span aria-hidden className="flex shrink-0 items-center">
      <img src={photo} alt="" className="size-10 rounded-full bg-[#fde7dc] object-cover" />
      <span className="relative -ml-3 grid size-10 place-items-center rounded-full bg-white shadow-[0_0_0_2px_#fff,0_0_0_3px_rgb(0_0_0/0.08)]">
        <img src={logo} alt="" className="size-[22px]" />
      </span>
    </span>
  );
}

/** The two offers the agent sent (story step 11) with its line to Isar, side by side as tiles in one card, waiting on Isar; once Isar takes v3a, it says so. */
function Offers({ took }: { took: boolean }) {
  const o = V3.offers;
  return (
    <div className={`a2a-load-in mt-4 flex ${AGENT_COL} flex-col`}>
      <Message said={o.said} side="out">
        <KnowledgeCard
          icon={FileText}
          title={o.title}
          id={o.id}
          subtitle={o.for}
          status={<CardStatus color={took ? "#2e844a" : "#f5b500"}>{took ? A.took : o.status}</CardStatus>}
          className="w-full"
          footer={<Via text={o.via} />}
        >
          <div className="grid grid-cols-2 gap-3">
            {o.list.map((v) => (
              <div key={v.id} className="rounded-xl bg-[#f7f7f8] p-4">
                <p className="a2a-title text-[16px] font-semibold leading-snug text-text">{v.name}</p>
                <dl className="mt-4 flex flex-col gap-2.5 text-[13.5px] tabular-nums">
                  {v.rows.map(([k, val]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <dt className="text-text-muted">{k}</dt>
                      <dd className="font-medium text-text">{val}</dd>
                    </div>
                  ))}
                </dl>
                {"note" in v && <p className="mt-4 text-[12.5px] font-medium text-[#1f7a3d]">{v.note}</p>}
              </div>
            ))}
          </div>
        </KnowledgeCard>
      </Message>
      <p className="mt-1.5 pl-1 text-[11px] text-text-muted">{q.time}</p>
    </div>
  );
}

/** O-5531 as it arrives (story step 14): what Isar ordered, from v3a, placed. */
function Order() {
  return (
    <div className={`a2a-load-in mt-4 flex ${AGENT_COL} flex-col`}>
      <KnowledgeCard
        icon={Package}
        success
        title={OR.title}
        id={OR.id}
        subtitle={OR.for}
        status={<CardStatus color="#2e844a">{OR.status}</CardStatus>}
        footer={<Via text={OR.via} />}
      >
        <QuoteBody lines={OR.lines} terms={OR.terms} />
      </KnowledgeCard>
      <p className="mt-1.5 pl-1 text-[11px] text-text-muted">{q.time}</p>
    </div>
  );
}

/** A quote card's footer: where it came from, signed, and Open in Salesforce. */
function Via({ text }: { text: string }) {
  return (
    <>
      <CardAction icon={ExternalLink}>{q.request.open}</CardAction>
      <ShieldCheck className="ml-auto size-3.5 shrink-0 text-text-muted" strokeWidth={2} />
      <span className="truncate text-[12px] text-text-muted">{text}</span>
    </>
  );
}

type Line = { name: string; site: string; qty: string; amount: string; change?: string };
type Term = { label: string; value: string; note?: string };

/**
 * A quote's body, spaced to be read rather than scanned: each line its own
 * row (the product, its site under it; units, with what changed under them;
 * the list price) in a hairline box with rounded corners and a faint grey
 * header, then the terms as three tiles of their own.
 */
function QuoteBody({ lines, terms }: { lines: readonly Line[]; terms: readonly Term[] }) {
  const cols = q.request.columns;
  return (
    <>
      <div className="overflow-hidden rounded-xl shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-[#fafafb] text-left text-[12px] text-text-muted">
              <th className="py-2.5 pl-4 font-medium">{cols.name}</th>
              <th className="py-2.5 text-right font-medium">{cols.qty}</th>
              <th className="py-2.5 pl-6 pr-4 text-right font-medium">{cols.amount}</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {lines.map((l) => (
              <tr key={l.name} className="border-t border-black/[0.06] align-top">
                <td className="py-3.5 pl-4 pr-4">
                  <p className="font-medium text-text">{l.name}</p>
                  <p className="mt-0.5 text-[12.5px] text-text-muted">{l.site}</p>
                </td>
                <td className="py-3.5 text-right">
                  <p className="font-medium text-text">{l.qty}</p>
                  {l.change && <p className="mt-0.5 text-[12.5px] font-medium text-[#1f7a3d]">{l.change}</p>}
                </td>
                <td className="py-3.5 pl-6 pr-4 text-right text-text-muted">{l.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3">
        {terms.map((f) => (
          <div key={f.label} className="rounded-xl bg-[#f7f7f8] px-4 py-3.5">
            <dt className="text-[12px] text-text-muted">{f.label}</dt>
            <dd className="a2a-title mt-1 text-[18px] font-semibold tabular-nums text-text">{f.value}</dd>
            {f.note && <dd className="mt-1 text-[12px] leading-snug tabular-nums text-text-muted">{f.note}</dd>}
          </div>
        ))}
      </dl>
    </>
  );
}

/** One step of the agent's thinking, or one turn: a line up to the row above, its icon, and what it did. Matches the phone agent's timeline.
 *  A step that looked somewhere has where as a chip under it. */
function Row({
  icon: Icon,
  mark,
  chip,
  current,
  children,
}: {
  icon?: LucideIcon;
  mark?: ReactNode;
  chip?: ReactNode;
  current: boolean;
  children: ReactNode;
}) {
  return (
    <li className="group/row a2a-load-in relative flex gap-2 pt-2.5 text-[13px] leading-snug text-text-muted">
      <span aria-hidden className="absolute -top-1.5 left-[7.5px] h-[14px] w-px bg-[#dcdce0]" />
      <span aria-hidden className="absolute bottom-0 left-[7.5px] top-[29px] w-px bg-[#dcdce0] group-last/row:hidden" />
      <span className="grid h-[18px] w-4 shrink-0 place-items-center">
        {mark ?? (Icon && <Icon className={`size-3.5 ${current ? "text-text" : ""}`} strokeWidth={2} />)}
      </span>
      <div className="min-w-0">
        <span className={current ? "a2a-shimmer" : undefined}>{children}</span>
        {chip && <span className="mt-1.5 flex">{chip}</span>}
      </div>
    </li>
  );
}
