import {
  Check,
  ChevronDown,
  Circle,
  CircleCheck,
  CircleDot,
  Database,
  ExternalLink,
  Eye,
  FileSearch,
  FileText,
  History,
  Lightbulb,
  ListChecks,
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
import margret from "../../assets/a2a/margret.png";
import buyerAgent from "../../assets/a2a/agent-sparkle.png";
import { copy } from "../../copy/copy";
import { Rich } from "../Rich";
import { useStory } from "../story";
import { CardAction, CardStatus, KnowledgeCard } from "./KnowledgeCard";

const q = copy.a2a.commandCenter.agent.quote;
const MUSINGS = q.musings;
const STEPS = q.plan.steps;
const H = q.heldOut;
const D = q.decision;
const V3 = q.v3;
const A = q.accepted;
const OR = q.order;

type Musing = { kind: string; label: string; text: string; tool?: Tool };
type Tool = { name: string; target: string };
type Step = { doing: string; done: string; detail: string; kind: string; source: string; tool?: Tool };
type PlanCopy = { title: string; of: string; done: string; toggle: string; steps: readonly Step[] };
/** Everything on the agent's side runs the same width: its messages, its checks, its cards. */
const AGENT_COL = "w-full max-w-[560px]";

/** How long each musing runs before the next, in ms. Slower than the phone's:
 *  the seller agent takes its time over the ask. Lookups take longest. */
const MUSE: Record<string, number> = { read: 1100, fetch: 1700, notice: 1100, wonder: 1600 };
/** How long each check runs, in ms: going out to a system takes longest. */
const STEP: Record<string, number> = { fetch: 1500, read: 1000, write: 1200 };

/**
 * The thread's timeline, in ms after it opens: the agent's turn starts; its
 * musings run one after another; it stays at "Weighing the options" a while,
 * then folds; the lead line, then the checks one after another; once the last
 * (sending v2) is done, the counter-offer, the reply and the done mark.
 */
const T = (() => {
  const start = 700;
  const muse = MUSINGS.map((_, i) => start + 400 + MUSINGS.slice(0, i).reduce((n, m) => n + MUSE[m.kind], 0));
  const hold = muse[muse.length - 1] + MUSE[MUSINGS[MUSINGS.length - 1].kind];
  const folded = hold + 2000;
  const lead = folded + 300;
  const plan = lead + 900;
  // When check i is done.
  const step = STEPS.map((_, i) => plan + 600 + STEPS.slice(0, i + 1).reduce((n, s) => n + STEP[s.kind], 0));
  const sent = step[step.length - 1];
  return { start, muse, hold, folded, weighedFor: folded - start, lead, plan, step, sent, card: sent + 400, reply: sent + 900, turns: sent + 1300, end: sent + 1500 };
})();

/** When each musing shows, when the header holds, and when it folds, for musings starting at `start`. */
function weigh(musings: readonly Musing[], start: number, holdFor: number) {
  const muse = musings.map((_, i) => start + 400 + musings.slice(0, i).reduce((n, m) => n + MUSE[m.kind], 0));
  const hold = muse[muse.length - 1] + MUSE[musings[musings.length - 1].kind];
  const folded = hold + holdFor;
  return { muse, hold, folded, weighedFor: folded - start };
}

/**
 * Isar's agent holds out (story step 9), in ms from its reply landing: the
 * reply; the agent reads it (short) and says what it heard; then, straight
 * on, weighs what it can do, holds, folds; the lead line, then Alex's
 * decision card (step 10, the agent hands it over), the turns so far and the done mark.
 */
const T2 = (() => {
  const reply = 300;
  const start = 1500;
  const read = weigh(H.understand.musings, start, 500);
  const heard = read.folded + 300;
  const weighed = weigh(H.musings, heard + 900, 1800);
  const lead = weighed.folded + 300;
  const decision = lead + 900;
  return { reply, start, read, heard, weighed, lead, decision, turns: decision + 400, end: decision + 600 };
})();

/**
 * Alex sends both (story step 11), in ms from his pick: his turn; the agent's,
 * drafting v3a and v3b and sending them one step at a time; the two offers as
 * one card, the reply, the turns so far and the done mark.
 */
const T3 = (() => {
  const start = 700;
  const plan = start + 300;
  const step = V3.plan.steps.map((_, i) => plan + 600 + V3.plan.steps.slice(0, i + 1).reduce((n, s) => n + STEP[s.kind], 0));
  const sent = step[step.length - 1];
  return { start, plan, step, sent, card: sent + 400, reply: sent + 900, turns: sent + 1300, end: sent + 1500 };
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
    }, 100);
    return () => clearInterval(id);
  }, [started, end]);
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
  const { sendCounter, heldOut, askAlex, sendV3, accepted, ordered, setWorking } = useStory();
  const t = useClock(true, T.end) ?? 0;
  const t2 = useClock(heldOut && t >= T.end, T2.end);
  const [chosen, setChosen] = useState(false);
  const t3 = useClock(chosen, T3.end);
  const shown = T.muse.filter((at) => t >= at).length;
  const done = T.step.filter((at) => t >= at).length;
  const sent = t >= T.sent;
  const read2 = t2 === null ? 0 : T2.read.muse.filter((at) => t2 >= at).length;
  const shown2 = t2 === null ? 0 : T2.weighed.muse.filter((at) => t2 >= at).length;
  const asked = t2 !== null && t2 >= T2.decision;
  const done3 = t3 === null ? 0 : T3.step.filter((at) => t3 >= at).length;
  const sent3 = t3 !== null && t3 >= T3.sent;
  const t4 = useClock(accepted && t3 !== null && t3 >= T3.end, T4.end);
  const t5 = useClock(ordered && t4 !== null && t4 >= T4.end, T5.end);

  useEffect(() => {
    if (sent) sendCounter();
  }, [sent, sendCounter]);
  useEffect(() => {
    if (asked) askAlex();
  }, [asked, askAlex]);
  useEffect(() => {
    if (sent3) sendV3();
  }, [sent3, sendV3]);
  const choose = () => {
    setChosen(true);
    setWorking("alexAgent", true);
  };

  // Keep the newest thing in view, above the prompt box, as each one comes in.
  const at = (clock: number | null, xs: number[]) => (clock === null ? 0 : xs.filter((x) => clock >= x).length);
  const beat =
    at(t, [T.start, T.folded, T.lead, T.plan, T.card, T.reply, T.turns, T.end]) +
    at(t2, [T2.reply, T2.start, T2.read.folded, T2.heard, T2.weighed.muse[0], T2.weighed.folded, T2.lead, T2.decision, T2.turns, T2.end]) +
    at(t3, [0, T3.start, T3.plan, T3.card, T3.reply, T3.turns, T3.end]) +
    at(t4, [T4.card, T4.start, T4.said, T4.end]) +
    at(t5, [T5.start, T5.card, T5.said, T5.turns, T5.end]);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scroller = ref.current?.closest<HTMLElement>(".overflow-y-auto");
    scroller?.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
  }, [shown, done, read2, shown2, done3, beat]);

  return (
    <div ref={ref} className="flex flex-col py-8">
      <Request />
      {t >= T.start && (
        <div className="mt-7">
          <Mark />
          <Weighing t={t} shown={shown} musings={MUSINGS} at={T} />
          {t >= T.lead && <AgentSays className="mt-3"><Rich text={q.lead} /></AgentSays>}
          {t >= T.plan && <Checks plan={q.plan} done={done} />}
          {t >= T.card && <Counter />}
          {t >= T.reply && <AgentSays className="mt-4"><Rich text={q.reply} /></AgentSays>}
          {t >= T.turns && <Turns n={2} />}
          {t >= T.end && <Mark className="mt-4" />}
        </div>
      )}
      {t2 !== null && t2 >= T2.reply && <Request card={H.reply} from={H.from} time={H.time} className="mt-8" />}
      {t2 !== null && t2 >= T2.start && (
        <div className="mt-7">
          <Mark />
          <Weighing t={t2} shown={read2} musings={H.understand.musings} at={T2.read} hold={H.understand.hold} done={H.understand.done} />
          {t2 >= T2.heard && <AgentSays className="mt-3"><Rich text={H.understand.said} /></AgentSays>}
          {t2 >= T2.weighed.muse[0] - 400 && <Weighing t={t2} shown={shown2} musings={H.musings} at={T2.weighed} />}
          {t2 >= T2.lead && <AgentSays className="mt-3"><Rich text={H.lead} /></AgentSays>}
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
          <Mark />
          {t3 >= T3.plan && <Checks plan={V3.plan} done={done3} />}
          {t3 >= T3.card && <Offers took={t4 !== null} />}
          {t3 >= T3.reply && <AgentSays className="mt-4"><Rich text={V3.reply} /></AgentSays>}
          {t3 >= T3.turns && <Turns n={4} />}
          {t3 >= T3.end && <Mark className="mt-4" />}
        </div>
      )}
      {t4 !== null && t4 >= T4.card && <Request card={A.card} from={A.from} time={A.time} done className="mt-8" />}
      {t4 !== null && t4 >= T4.start && (
        <div className="mt-7">
          <Mark />
          {t4 >= T4.said && <AgentSays className="mt-3"><Rich text={A.said} /></AgentSays>}
          {t5 !== null && t5 >= T5.card && <Order />}
          {t5 !== null && t5 >= T5.said && <AgentSays className="mt-4"><Rich text={OR.said} /></AgentSays>}
          {t5 !== null && t5 >= T5.turns && <Turns n={5} />}
          {t5 !== null && t5 >= T5.end && <Mark className="mt-4" />}
        </div>
      )}
    </div>
  );
}

/** The seller agent's logo in a circle: at the head of its turn, and on a line of its own when it's done. */
function Mark({ className = "" }: { className?: string }) {
  return (
    <span className={`a2a-load-in grid size-10 place-items-center rounded-full bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.08)] ${className}`}>
      <img src={agentLogo} alt="" className="size-[22px]" />
    </span>
  );
}

/**
 * Taking the request in: the header names what it's doing now (shimmering,
 * by a pulsing dot), over the musings so far. Past the last it stays at
 * "Weighing the options", then folds to a check and how long it took; a click
 * opens or folds it.
 */
function Weighing({
  t,
  shown,
  musings,
  at,
  hold = q.hold,
  done = q.weighed,
}: {
  t: number;
  shown: number;
  musings: readonly Musing[];
  /** When it holds at "Weighing the options", when it folds, and how long it took. */
  at: { hold: number; folded: number; weighedFor: number };
  /** What the header says while it holds, and once it's folded. */
  hold?: string;
  done?: (s: number) => string;
}) {
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const weighing = t < at.folded;
  const open = userOpen ?? weighing;
  const label = weighing
    ? t >= at.hold
      ? hold
      : musings[Math.max(0, shown - 1)].label
    : done(Math.round(at.weighedFor / 1000));
  return (
    <div className="a2a-load-in mt-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setUserOpen(!open)}
        disabled={weighing}
        className="flex min-h-8 items-center gap-2 text-left text-[14px] font-medium text-text-muted enabled:hover:text-text"
      >
        <span className="grid size-4 shrink-0 place-items-center">
          {weighing ? (
            <span aria-hidden className="a2a-pulse size-2 rounded-full bg-[#7f56d9]" />
          ) : (
            <CircleCheck className="size-4" strokeWidth={2.25} />
          )}
        </span>
        <span key={label} className="a2a-load-in">
          <span className={weighing ? "a2a-shimmer" : undefined}>{label}</span>
        </span>
        <ChevronDown className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2.25} />
      </button>
      {open && (
        <ol aria-live="polite">
          {musings.slice(0, weighing ? shown : musings.length).map((m, i) => (
            <Row key={m.text} icon={KIND[m.kind]} tool={m.tool} current={weighing && t < at.hold && i === shown - 1}>
              {m.text}
            </Row>
          ))}
        </ol>
      )}
    </div>
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

/** A message from the agent: a soft grey bubble, square at the bottom left (the side it comes from). */
function AgentSays({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <p
      className={`a2a-load-in ${AGENT_COL} rounded-2xl rounded-bl-none bg-[#f3f3f5] px-4 py-3 text-[14px] leading-[1.55] text-text ${className}`}
    >
      {children}
    </p>
  );
}

/**
 * Fizz's checks before an offer goes out: the title and how many are done,
 * then each check pending, running (shimmering, present tense) or done
 * (checked, past tense, with what it found and the system it touched). Open
 * while it runs, folded once it's done; a click on the header opens or folds it.
 */
function Checks({ plan: p, done }: { plan: PlanCopy; done: number }) {
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const STEPS = p.steps;
  const open = userOpen ?? done < STEPS.length;
  return (
    <div className={`a2a-load-in mt-4 ${AGENT_COL} rounded-xl bg-[#f7f7f8] px-4 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.05)]`}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={p.toggle}
        onClick={() => setUserOpen(!open)}
        className="flex h-12 w-full items-center gap-2.5 text-left"
      >
        <ListChecks className="size-4 shrink-0 text-text" strokeWidth={2} />
        <span className="mr-auto text-[13.5px] font-semibold text-text">{p.title}</span>
        <span className="text-[12.5px] tabular-nums text-text-muted">
          {done} {p.of} {STEPS.length} {p.done}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2.25}
        />
      </button>
      {open && (
        <ol className="pb-3">
          {STEPS.map((s, i) => {
            const state = i < done ? "done" : i === done ? "running" : "pending";
            return (
              <li key={s.done} className="relative flex gap-2.5 py-2">
                {i < STEPS.length - 1 && (
                  <span aria-hidden className="absolute -bottom-2 left-[7.5px] top-[30px] w-px bg-black/10" />
                )}
                {state === "done" ? (
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-text" strokeWidth={2.25} />
                ) : state === "running" ? (
                  <CircleDot className="mt-0.5 size-4 shrink-0 text-[#7f56d9]" strokeWidth={2.25} />
                ) : (
                  <Circle className="mt-0.5 size-4 shrink-0 text-black/20" strokeWidth={2.25} />
                )}
                <div className="min-w-0">
                  <p
                    className={`text-[13.5px] font-medium ${
                      state === "running" ? "a2a-shimmer" : state === "pending" ? "text-text-muted" : "text-text"
                    }`}
                  >
                    {state === "done" ? s.done : s.doing}
                  </p>
                  {s.tool && state !== "pending" && <ToolCall tool={s.tool} />}
                  {state === "done" && (
                    <p className="a2a-load-in mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] leading-snug text-text-muted">
                      <span><Rich text={s.detail} /></span>
                      {!s.tool && <Source kind={s.kind} source={s.source} />}
                    </p>
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

/** A Salesforce tool call behind a musing or a check, as Cowork shows it: the
 *  logo (unless the row already wears it), "Called", the MCP tool as a mono
 *  chunk and the SOR it went to. */
function ToolCall({ tool, logo = true }: { tool: Tool; logo?: boolean }) {
  return (
    <p className="a2a-load-in mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-text-muted">
      {logo && <img src="/salesforce.svg" alt="Salesforce" className="h-3 w-[18px] shrink-0 object-contain" />}
      {q.called}
      <code className="rounded bg-black/[0.05] px-1 py-px font-mono text-[11px] text-text">{tool.name}</code>
      <span className="font-mono text-[11px]">{tool.target}</span>
    </p>
  );
}

/** A non-Salesforce system a check touched, and how: read, fetch or write. */
function Source({ kind, source }: { kind: string; source: string }) {
  const Icon = KIND[kind];
  return (
    <span className="inline-flex h-5 items-center gap-1 rounded-md bg-white px-1.5 text-[11.5px] font-medium text-text shadow-[0_0_0_1px_rgb(0_0_0/0.07)]">
      <Icon className="size-3 shrink-0" strokeWidth={2.25} />
      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-text-muted">{kind}</span>
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
};

/**
 * Isar's agent's turn, on the right like a person's: who sent it (the buyer
 * agent's sparkle and name), the request (or its reply to v2) as a knowledge
 * card, and when, small, under the card.
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
  /** An acceptance rather than an ask: its status in green. */
  done?: boolean;
  className?: string;
}) {
  return (
    <div className={`a2a-load-in flex flex-col items-end ${className}`}>
      <p className="mb-2 flex items-center gap-2 pr-1 text-[13px] font-medium text-text">
        <span className="grid size-10 place-items-center rounded-full bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.08)]">
          <img src={buyerAgent} alt="" className="size-[22px]" />
        </span>
        {from}
      </p>
      <KnowledgeCard
        icon={FileText}
        title={r.title}
        id={r.id}
        subtitle={r.from}
        status={<CardStatus color={done ? "#2e844a" : "#0176d3"}>{r.status}</CardStatus>}
        className="w-full max-w-[520px]"
        footer={<Via text={r.via} />}
      >
        <QuoteBody lines={r.lines} terms={r.terms} />
      </KnowledgeCard>
      <p className="mt-1.5 pr-1 text-[11px] text-text-muted">{time}</p>
    </div>
  );
}

/** The counter-offer the agent sent, on its side: what changed marked on each line, waiting on Isar. */
function Counter() {
  const c = q.counter;
  return (
    <div className={`a2a-load-in mt-4 flex ${AGENT_COL} flex-col`}>
      <KnowledgeCard
        icon={FileText}
        title={c.title}
        id={c.id}
        subtitle={c.for}
        status={<CardStatus color="#f5b500">{c.status}</CardStatus>}
        footer={<Via text={c.via} />}
      >
        <QuoteBody lines={c.lines} terms={c.terms} />
      </KnowledgeCard>
      <p className="mt-1.5 pl-1 text-[11px] text-text-muted">{q.time}</p>
    </div>
  );
}

/**
 * Alex's call (story step 10), like picking between two answers: the two ways
 * to 15% side by side, each with what Isar gets and why, and both picked to
 * start. The bundle says what's in it and that Margret's agent set it up (Margret is Alex's sales director).
 * Send says what goes (Send both offers, or Send v3a or v3b); Decline sits beside it. Only
 * "Send both offers" plays on in the demo. Once sent, the card keeps the picks.
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
  const label = count === "one" ? D.send.one([...picked][0]) : D.send[count];
  return (
    <div className={`a2a-load-in mt-4 flex ${AGENT_COL} flex-col`}>
      <KnowledgeCard
        icon={Scale}
        title={D.title}
        subtitle={D.for}
        status={<CardStatus color={chosen ? "#2e844a" : "#f5b500"}>{chosen ? D.sent : D.status}</CardStatus>}
        footer={
          <>
            {!chosen && (
              <>
                <CardAction kind="primary" icon={Send} disabled={count !== "both"} title={count === "one" ? D.notScripted : undefined} onClick={onSend}>
                  {label}
                </CardAction>
                <CardAction icon={X} title={D.notScripted}>{D.decline}</CardAction>
              </>
            )}
            <span className="truncate text-[12px] text-text-muted">{chosen ? D.sentNote : D.note[count]}</span>
          </>
        }
      >
        <p className="mb-4 text-[13.5px] font-medium text-text">{D.ask}</p>
        <div className="grid grid-cols-2 gap-3">
          {D.options.map((o) => {
            const on = picked.has(o.id);
            return (
              <button
                key={o.id}
                type="button"
                role="checkbox"
                aria-checked={on}
                aria-label={`${D.pick} ${o.id}: ${o.name}`}
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
                  <span className="text-[12px] text-text-muted">{o.id}</span>
                  {"tag" in o && (
                    <span className="rounded-lg bg-[#efe9fd] px-2 text-[11.5px] leading-5 font-medium text-[#5b3fc4]">{o.tag}</span>
                  )}
                </span>
                <span className="a2a-title mt-2 text-[16px] font-semibold leading-snug text-text">{o.name}</span>
                <dl className="mt-4 flex flex-col gap-2.5 text-[13.5px] tabular-nums">
                  {o.rows.map(([k, val]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <dt className="text-text-muted">{k}</dt>
                      <dd className="font-medium text-text">{val}</dd>
                    </div>
                  ))}
                </dl>
                <span className="mt-4 text-[12.5px] leading-normal text-text-muted">
                  <Rich text={o.why} />
                </span>
                {"bundle" in o && (
                  <span className="mt-3 block rounded-lg bg-black/[0.04] px-3 py-3 text-[12.5px] leading-snug tabular-nums">
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
                  <span className="mt-4 flex items-center gap-2.5 border-t border-black/[0.06] pt-4 text-[12px] leading-snug">
                    <AgentOf photo={margret} />
                    <span className="min-w-0">
                      <span className="block text-text-muted">
                        {o.suggested.label} <span className="font-medium text-text">{o.suggested.name}</span>
                      </span>
                      <span className="block text-text-muted">{o.suggested.role}</span>
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

/**
 * Someone's agent, as an avatar group: their photo, with the agent's logo
 * stacked over its right edge, so it reads as "Margret's agent".
 */
function AgentOf({ photo }: { photo: string }) {
  return (
    <span aria-hidden className="flex shrink-0 items-center">
      <img src={photo} alt="" className="size-10 rounded-full bg-[#fde7dc] object-cover" />
      <span className="relative -ml-3 grid size-10 place-items-center rounded-full bg-white shadow-[0_0_0_2px_#fff,0_0_0_3px_rgb(0_0_0/0.08)]">
        <img src={agentLogo} alt="" className="size-[22px]" />
      </span>
    </span>
  );
}

/** The two offers the agent sent (story step 11), side by side as tiles in one card, waiting on Isar; once Isar takes v3a, it says so. */
function Offers({ took }: { took: boolean }) {
  const o = V3.offers;
  return (
    <div className={`a2a-load-in mt-4 flex ${AGENT_COL} flex-col`}>
      <KnowledgeCard
        icon={FileText}
        title={o.title}
        id={o.id}
        subtitle={o.for}
        status={<CardStatus color={took ? "#2e844a" : "#f5b500"}>{took ? A.took : o.status}</CardStatus>}
        footer={<Via text={o.via} />}
      >
        <div className="grid grid-cols-2 gap-3">
          {o.list.map((v) => (
            <div key={v.id} className="rounded-xl bg-[#f7f7f8] p-4">
              <p className="text-[12px] text-text-muted">{v.id}</p>
              <p className="a2a-title mt-1 text-[16px] font-semibold leading-snug text-text">{v.name}</p>
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

/** One musing: a line up to the row above, its icon, and what it did (shimmering while it's the one at work). Matches the phone agent's timeline.
 *  A musing that went to Salesforce wears its logo for an icon, with the call under it. */
function Row({
  icon: Icon,
  mark,
  tool,
  current,
  children,
}: {
  icon?: LucideIcon;
  mark?: ReactNode;
  tool?: Tool;
  current: boolean;
  children: ReactNode;
}) {
  return (
    <li className="group/row a2a-load-in relative flex gap-2 pt-2.5 text-[13px] leading-snug text-text-muted">
      <span aria-hidden className="absolute -top-1.5 left-[7.5px] h-[14px] w-px bg-[#dcdce0]" />
      <span aria-hidden className="absolute bottom-0 left-[7.5px] top-[29px] w-px bg-[#dcdce0] group-last/row:hidden" />
      <span className="grid h-[18px] w-4 shrink-0 place-items-center">
        {mark ??
          (tool ? (
            <img src="/salesforce.svg" alt="Salesforce" className="h-3 w-4 object-contain" />
          ) : (
            Icon && <Icon className={`size-3.5 ${current ? "text-text" : ""}`} strokeWidth={2} />
          ))}
      </span>
      <div className="min-w-0">
        <span className={current ? "a2a-shimmer" : undefined}>{children}</span>
        {tool && <ToolCall tool={tool} logo={false} />}
      </div>
    </li>
  );
}
