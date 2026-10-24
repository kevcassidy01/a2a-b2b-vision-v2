import { ChevronDown, Database, ExternalLink, Eye, FileSearch, FileText, Lightbulb, ShieldCheck, type LucideIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import agentLogo from "../../assets/a2a/agent-logo.png";
import buyerAgent from "../../assets/a2a/agent-sparkle.png";
import { copy } from "../../copy/copy";
import { CardAction, CardStatus, KnowledgeCard } from "./KnowledgeCard";

const q = copy.a2a.commandCenter.agent.quote;
const MUSINGS = q.musings;

/** How long each musing runs before the next, in ms. Slower than the phone's:
 *  the seller agent takes its time over the ask. Lookups take longest. */
const MUSE: Record<string, number> = { read: 1500, fetch: 2300, notice: 1600, wonder: 2200 };
/** When the agent's turn starts, after the request shows, in ms. */
const START = 700;
/** When each musing starts, in ms after the thread opens. */
const AT = MUSINGS.map((_, i) => START + 400 + MUSINGS.slice(0, i).reduce((n, m) => n + MUSE[m.kind], 0));
/** After the last musing has run, the agent stays at weighing it up (the next beat is still to come). */
const HOLD = AT[AT.length - 1] + MUSE[MUSINGS[MUSINGS.length - 1].kind];

/** What a musing did, as an icon: read, looked up, noticed, wondered. */
const KIND: Record<string, LucideIcon> = { read: FileSearch, fetch: Database, notice: Eye, wonder: Lightbulb };

/** Ms since the thread opened, ticking until the agent has reached its hold. */
function useClock() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now() - t0;
      setT(now);
      if (now > HOLD) clearInterval(id);
    }, 100);
    return () => clearInterval(id);
  }, []);
  return t;
}

/**
 * QuoteThread — the seller agent's chat about Q-1042, opened when Alex clicks
 * the request. Isar's agent's turn is the quote request it sent (right, like
 * a person's turn). Then Fizz's agent takes it in: a timeline of musings, one
 * at a time and slower than the phone's (reading the request, pulling up the
 * account, checking Fizz's rules, weighing it up), the header naming what
 * it's doing now. It doesn't conclude yet: past the last musing it stays at
 * "Weighing the options", still at work.
 */
export function QuoteThread() {
  const t = useClock();
  const shown = AT.filter((at) => t >= at).length;
  const holding = t >= HOLD;
  const label = holding ? q.hold : MUSINGS[Math.max(0, shown - 1)].label;
  // Keep the newest musing in view, above the prompt box, as each one comes in.
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scroller = ref.current?.closest<HTMLElement>(".overflow-y-auto");
    scroller?.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
  }, [shown, t >= START]);
  return (
    <div ref={ref} className="flex flex-col py-8">
      <Request />
      {t >= START && (
        <div className="mt-7">
          <span className="a2a-load-in grid size-7 place-items-center rounded-full bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.08)]">
            <img src={agentLogo} alt="" className="size-4" />
          </span>
          <div className="a2a-load-in mt-3">
            <p className="flex min-h-8 items-center gap-2 text-[14px] font-medium text-text-muted">
              <span className="grid size-4 shrink-0 place-items-center">
                <span aria-hidden className="a2a-pulse size-2 rounded-full bg-[#7f56d9]" />
              </span>
              <span key={label} className="a2a-load-in">
                <span className="a2a-shimmer">{label}</span>
              </span>
              <ChevronDown className="size-4 shrink-0 rotate-180" strokeWidth={2.25} />
            </p>
            <ol aria-live="polite">
              {MUSINGS.slice(0, shown).map((m, i) => (
                <Row key={m.text} icon={KIND[m.kind]} current={i === shown - 1}>
                  {m.text}
                </Row>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
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
        className="w-full max-w-[480px]"
        footer={
          <>
            <ShieldCheck className="size-3.5 shrink-0 text-text-muted" strokeWidth={2} />
            <span className="mr-auto truncate text-[12px] text-text-muted">{r.via}</span>
            <CardAction icon={ExternalLink}>{r.open}</CardAction>
          </>
        }
      >
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11.5px] text-text-muted">
              <th className="pb-1.5 font-medium">{r.columns.name}</th>
              <th className="pb-1.5 font-medium">{r.columns.site}</th>
              <th className="pb-1.5 text-right font-medium">{r.columns.qty}</th>
              <th className="pb-1.5 text-right font-medium">{r.columns.amount}</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {r.lines.map((l) => (
              <tr key={l.name} className="border-t border-black/[0.06]">
                <td className="py-2 pr-3 font-medium text-text">{l.name}</td>
                <td className="py-2 pr-3 text-text-muted">{l.site}</td>
                <td className="py-2 text-right text-text">{l.qty}</td>
                <td className="py-2 pl-3 text-right text-text-muted">{l.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-black/[0.06]">
          {r.terms.map((f) => (
            <div key={f.label} className="bg-[#f7f7f8] px-3 py-2.5">
              <dt className="text-[11.5px] text-text-muted">{f.label}</dt>
              <dd className="a2a-title mt-0.5 text-[16px] font-semibold tabular-nums text-text">{f.value}</dd>
              {"note" in f && <dd className="text-[11px] tabular-nums text-text-muted">{f.note}</dd>}
            </div>
          ))}
        </dl>
      </KnowledgeCard>
      <p className="mt-1.5 pr-1 text-[11px] text-text-muted">{q.time}</p>
    </div>
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
