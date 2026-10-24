import {
  ChevronDown,
  Circle,
  CircleCheck,
  CircleDot,
  Database,
  ExternalLink,
  Eye,
  FileSearch,
  FileText,
  Lightbulb,
  ListChecks,
  PencilLine,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import agentLogo from "../../assets/a2a/agent-logo.png";
import buyerAgent from "../../assets/a2a/agent-sparkle.png";
import { copy } from "../../copy/copy";
import { Rich } from "../Rich";
import { useStory } from "../story";
import { CardAction, CardStatus, KnowledgeCard } from "./KnowledgeCard";

const q = copy.a2a.commandCenter.agent.quote;
const MUSINGS = q.musings;
const STEPS = q.plan.steps;
/** Everything on the agent's side runs the same width: its messages, its checks, its cards. */
const AGENT_COL = "w-full max-w-[560px]";

/** How long each musing runs before the next, in ms. Slower than the phone's:
 *  the seller agent takes its time over the ask. Lookups take longest. */
const MUSE: Record<string, number> = { read: 1500, fetch: 2300, notice: 1600, wonder: 2200 };
/** How long each check runs, in ms: going out to a system takes longest. */
const STEP: Record<string, number> = { fetch: 2000, read: 1400, write: 1600 };

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
  const folded = hold + 3000;
  const lead = folded + 300;
  const plan = lead + 900;
  // When check i is done.
  const step = STEPS.map((_, i) => plan + 600 + STEPS.slice(0, i + 1).reduce((n, s) => n + STEP[s.kind], 0));
  const sent = step[step.length - 1];
  return { start, muse, hold, folded, weighedFor: folded - start, lead, plan, step, sent, card: sent + 400, reply: sent + 900, end: sent + 1300 };
})();

/** What a musing or a check did, as an icon: read, looked up, wrote, noticed, wondered. */
const KIND: Record<string, LucideIcon> = { read: FileSearch, fetch: Database, write: PencilLine, notice: Eye, wonder: Lightbulb };

/** Ms since the thread opened, ticking until the agent's turn is over. */
function useClock() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now() - t0;
      setT(now);
      if (now > T.end) clearInterval(id);
    }, 100);
    return () => clearInterval(id);
  }, []);
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
 */
export function QuoteThread() {
  const t = useClock();
  const { sendCounter } = useStory();
  const shown = T.muse.filter((at) => t >= at).length;
  const done = T.step.filter((at) => t >= at).length;
  const sent = t >= T.sent;

  useEffect(() => {
    if (sent) sendCounter();
  }, [sent, sendCounter]);

  // Keep the newest thing in view, above the prompt box, as each one comes in.
  const beat = [T.start, T.folded, T.lead, T.plan, T.card, T.reply, T.end].filter((x) => t >= x).length;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scroller = ref.current?.closest<HTMLElement>(".overflow-y-auto");
    scroller?.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
  }, [shown, done, beat]);

  return (
    <div ref={ref} className="flex flex-col py-8">
      <Request />
      {t >= T.start && (
        <div className="mt-7">
          <span className="a2a-load-in grid size-7 place-items-center rounded-full bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.08)]">
            <img src={agentLogo} alt="" className="size-4" />
          </span>
          <Weighing t={t} shown={shown} />
          {t >= T.lead && <AgentSays className="mt-3"><Rich text={q.lead} /></AgentSays>}
          {t >= T.plan && <Checks done={done} />}
          {t >= T.card && <Counter />}
          {t >= T.reply && <AgentSays className="mt-4"><Rich text={q.reply} /></AgentSays>}
          {t >= T.end && (
            <span className="a2a-load-in mt-4 grid size-7 place-items-center rounded-full bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.08)]">
              <img src={agentLogo} alt="" className="size-4" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Taking the request in: the header names what it's doing now (shimmering,
 * by a pulsing dot), over the musings so far. Past the last it stays at
 * "Weighing the options", then folds to a check and how long it took; a click
 * opens or folds it.
 */
function Weighing({ t, shown }: { t: number; shown: number }) {
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const weighing = t < T.folded;
  const open = userOpen ?? weighing;
  const label = weighing
    ? t >= T.hold
      ? q.hold
      : MUSINGS[Math.max(0, shown - 1)].label
    : q.weighed(Math.round(T.weighedFor / 1000));
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
          {MUSINGS.slice(0, weighing ? shown : MUSINGS.length).map((m, i) => (
            <Row key={m.text} icon={KIND[m.kind]} current={weighing && t < T.hold && i === shown - 1}>
              {m.text}
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
function Checks({ done }: { done: number }) {
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const open = userOpen ?? done < STEPS.length;
  const p = q.plan;
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
                  {state === "done" && (
                    <p className="a2a-load-in mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] leading-snug text-text-muted">
                      <span><Rich text={s.detail} /></span>
                      <Source kind={s.kind} source={s.source} />
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

/** The system a check touched, and how: read, fetch or write. */
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

/**
 * Isar's agent's turn, on the right like a person's: who sent it (the buyer
 * agent's sparkle and name), the request as a knowledge card, and when, small,
 * under the card.
 */
function Request() {
  const r = q.request;
  return (
    <div className="a2a-load-in flex flex-col items-end">
      <p className="mb-2 flex items-center gap-1.5 pr-1 text-[12.5px] font-medium text-text">
        <span className="grid size-5 place-items-center rounded-full bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.08)]">
          <img src={buyerAgent} alt="" className="size-3.5" />
        </span>
        {q.from}
      </p>
      <KnowledgeCard
        icon={FileText}
        title={r.title}
        id={r.id}
        subtitle={r.from}
        status={<CardStatus color="#0176d3">{r.status}</CardStatus>}
        className="w-full max-w-[520px]"
        footer={<Via text={r.via} />}
      >
        <QuoteBody lines={r.lines} terms={r.terms} />
      </KnowledgeCard>
      <p className="mt-1.5 pr-1 text-[11px] text-text-muted">{q.time}</p>
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

/** A quote card's footer: where it came from, signed, and Open in Salesforce. */
function Via({ text }: { text: string }) {
  return (
    <>
      <ShieldCheck className="size-3.5 shrink-0 text-text-muted" strokeWidth={2} />
      <span className="mr-auto truncate text-[12px] text-text-muted">{text}</span>
      <CardAction icon={ExternalLink}>{q.request.open}</CardAction>
    </>
  );
}

type Line = { name: string; site: string; qty: string; amount: string; change?: string };
type Term = { label: string; value: string; note?: string };

/**
 * A quote's body, spaced to be read rather than scanned: each line its own
 * row (the product, its site under it; units, with what changed under them;
 * the list price), then the terms as three tiles of their own.
 */
function QuoteBody({ lines, terms }: { lines: readonly Line[]; terms: readonly Term[] }) {
  const cols = q.request.columns;
  return (
    <>
      <table className="w-full text-[14px]">
        <thead>
          <tr className="text-left text-[12px] text-text-muted">
            <th className="pb-2.5 font-medium">{cols.name}</th>
            <th className="pb-2.5 text-right font-medium">{cols.qty}</th>
            <th className="pb-2.5 pl-6 text-right font-medium">{cols.amount}</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {lines.map((l) => (
            <tr key={l.name} className="border-t border-black/[0.06] align-top">
              <td className="py-3.5 pr-4">
                <p className="font-medium text-text">{l.name}</p>
                <p className="mt-0.5 text-[12.5px] text-text-muted">{l.site}</p>
              </td>
              <td className="py-3.5 text-right">
                <p className="font-medium text-text">{l.qty}</p>
                {l.change && <p className="mt-0.5 text-[12.5px] font-medium text-[#1f7a3d]">{l.change}</p>}
              </td>
              <td className="py-3.5 pl-6 text-right text-text-muted">{l.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="mt-4 grid grid-cols-3 gap-2">
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

/** One musing: a line up to the row above, its icon, and what it did (shimmering while it's the one at work). Matches the phone agent's timeline. */
function Row({ icon: Icon, current, children }: { icon: LucideIcon; current: boolean; children: ReactNode }) {
  return (
    <li className="group/row a2a-load-in relative flex gap-2 pt-2.5 text-[13px] leading-snug text-text-muted">
      <span aria-hidden className="absolute -top-1.5 left-[7.5px] h-[14px] w-px bg-[#dcdce0]" />
      <span aria-hidden className="absolute bottom-0 left-[7.5px] top-[29px] w-px bg-[#dcdce0] group-last/row:hidden" />
      <span className="grid h-[18px] w-4 shrink-0 place-items-center">
        <Icon className={`size-3.5 ${current ? "text-text" : ""}`} strokeWidth={2} />
      </span>
      <span className={current ? "a2a-shimmer" : undefined}>{children}</span>
    </li>
  );
}
