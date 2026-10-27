import { ArrowRight, Check, Megaphone } from "lucide-react";
import type { ReactNode } from "react";
import agentLogo from "../../assets/a2a/agent-logo.png";
import gmail from "../../assets/a2a/logos/gmail.svg";
import { copy } from "../../copy/copy";
import { Pulse } from "../Pulse";
import { CardAction } from "./KnowledgeCard";
import type { TaskStage } from "./Today";

const t = copy.a2a.commandCenter;
const c = t.campaigns;

/** Where an account has got to at one stage: done (a check), at it now (the agent working), or not yet. */
type Step = "done" | "now" | "todo";

/**
 * Campaigns — the section between Today and the quarter to date: the campaigns
 * Fizz's promotions agent runs. One card. On top, the live one (Oktoberfest
 * stock-up): what it offers, how it's doing, then a few of the accounts it
 * reached, each with a three-stage Lightning path (Seen, Quote, Converted) and what
 * the agent's doing next. Under it, the campaigns that ended recently, and a
 * footer that opens all of them.
 *
 * Isar's row follows the story: seen, with Mike's agent's cart, at load; the
 * quote under way once Q-1042 lands in Today; quoted once Isar takes v3a;
 * converted (all green) once O-5531 is placed, when the campaign's figures move.
 */
export function Campaigns({ task, stage }: { task: boolean; stage: TaskStage }) {
  const ordered = stage === "ordered";
  const quoted = ordered || stage === "accepted";
  const live = c.live;
  const isar = ordered ? live.isar.ordered : quoted ? live.isar.accepted : task ? live.isar.quote : live.isar;
  const isarSteps: Step[] = ["done", quoted ? "done" : task ? "now" : "todo", ordered ? "done" : "todo"];
  const s = live.stats;
  // Each figure, and whether it's moved: Q-1042 adds a quote, O-5531 a conversion and its value.
  const stats = [
    { label: s.seen.label, value: s.seen.value, moved: false },
    {
      label: s.quotes.label,
      value: task ? s.quotes.after : s.quotes.value,
      moved: task,
    },
    {
      label: s.converted.label,
      value: ordered ? s.converted.after : s.converted.value,
      moved: ordered,
    },
    {
      label: s.attributed.label,
      value: ordered ? s.attributed.after : s.attributed.value,
      moved: ordered,
    },
  ];
  return (
    <section className="flex flex-col gap-3">
      <h2 className="a2a-title text-[16px] font-semibold leading-snug tracking-[-0.01em] text-text">{t.sections.campaigns.title}</h2>
      <section className="a2a-card flex flex-col overflow-hidden rounded-xl">
        <div className="flex flex-col p-5">
          {/* The live campaign: who runs it (the agent, sending over Gmail), what it offers. */}
          <Head
            mark={
              <span role="img" aria-label={live.by} className="flex shrink-0 items-center">
                <Circle>
                  <img src={agentLogo} alt="" className="size-[18px]" />
                </Circle>
                <Circle className="-ml-2.5">
                  <img src={gmail} alt="" className="size-4" />
                </Circle>
              </span>
            }
            title={live.title}
            subtitle={live.subtitle}
          >
            <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#e3f3e6] px-2 text-[12px] font-medium leading-6 text-[#1f6b35]">
              <span aria-hidden className="size-1.5 rounded-full bg-[#2e844a]" />
              {live.status}
            </span>
          </Head>

          {/* How it's doing. A figure that moves (Q-1042 in, O-5531 placed) gets the wash. */}
          <dl className="mt-4 grid grid-cols-4 gap-3 border-t border-black/[0.06] pt-3">
            {stats.map((x) => (
              <div key={x.label} className="flex min-w-0 flex-col gap-0.5">
                <dt className="text-[12px] text-text-muted">{x.label}</dt>
                <dd key={x.value} className={`self-start text-[15px] font-semibold tabular-nums text-text ${x.moved ? "a2a-bump" : ""}`}>
                  {x.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* The accounts it reached, each with its path. */}
          <div className="mt-5 flex flex-col">
            <div className={`${ROW} pb-2 text-[12px] text-text-muted`}>
              <span>{live.accountsLabel}</span>
              {/* The stage names, once, each over its chevron. */}
              <span aria-hidden className="flex">
                {live.steps.map((name) => (
                  <span key={name} className="min-w-0 flex-1 truncate text-center [&:not(:first-child)]:-ml-[5px]">
                    {name}
                  </span>
                ))}
              </span>
              <span />
            </div>
            <ul>
              <Account name={live.isar.name} steps={isarSteps}>
                <Note key={isar.note} working={isarSteps[1] === "now"} bump={task}>
                  {isar.note}
                </Note>
              </Account>
              {live.accounts.map((a) => (
                <Account key={a.name} name={a.name} steps={a.steps}>
                  <Note>{a.note}</Note>
                </Account>
              ))}
            </ul>
            <button
              type="button"
              className="mt-2 h-7 self-start rounded-lg bg-black/[0.04] px-2.5 text-[12.5px] font-medium text-text-muted hover:bg-black/[0.07] hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0176d3]"
            >
              {live.more}
            </button>
          </div>

          {/* What ran before it and has stopped, headed like the live one. */}
          <div className="mt-5 border-t border-black/[0.06] pt-5">
            <Head
              mark={
                <Circle>
                  <Megaphone className="size-4 text-text-muted" strokeWidth={1.75} />
                </Circle>
              }
              title={c.ended.title}
            />
            <ul className="mt-3">
              {c.ended.items.map((e) => (
                <li key={e.title} className="flex items-center gap-3 border-t border-black/[0.06] py-2.5 first:border-t-0">
                  <div className="mr-auto min-w-0">
                    <p className="truncate text-[13.5px] font-medium text-text">{e.title}</p>
                    <p className="truncate text-[12.5px] text-text-muted">{e.ran}</p>
                  </div>
                  <span className="hidden text-[12.5px] tabular-nums text-text-muted sm:inline">{e.results}</span>
                  <span className="w-[84px] shrink-0 text-right text-[13.5px] font-medium tabular-nums text-text">{e.attributed}</span>
                  <span className="shrink-0 rounded-lg bg-[#f3f3f5] px-2 text-[12px] font-medium leading-6 text-text-muted">{c.ended.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* The way into everything the agent has run. */}
        <footer className="flex items-center border-t border-black/[0.06] bg-[#fafafb] px-5 py-4">
          <CardAction icon={ArrowRight}>{c.footer.all}</CardAction>
        </footer>
      </section>
    </section>
  );
}

/** A part's heading in the card: its mark, the title (over a line of detail, if any), anything at the right. */
function Head({ mark, title, subtitle, children }: { mark: ReactNode; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {mark}
      <div className="mr-auto min-w-0">
        <h3 className="a2a-title text-[15px] font-semibold leading-snug text-text">{title}</h3>
        {subtitle && <p className="mt-0.5 truncate text-[12.5px] leading-normal text-text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/** A 32px white circle for a mark, ringed in white so stacked ones read as a pair. */
function Circle({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <span className={`grid size-8 shrink-0 place-items-center rounded-full bg-white shadow-[0_0_0_2px_#fff,0_0_0_3px_rgb(0_0_0/0.08)] ${className}`}>
      {children}
    </span>
  );
}

/** An account's row: its name, the stage path, then what the agent's at. */
const ROW = "grid grid-cols-[minmax(0,1.1fr)_264px_minmax(0,1.3fr)] items-center gap-4";

function Account({ name, steps, children }: { name: string; steps: readonly Step[]; children: ReactNode }) {
  return (
    <li className={`${ROW} border-t border-black/[0.06] py-2.5`}>
      <span className="truncate text-[13.5px] font-medium text-text">{name}</span>
      <Path steps={steps} />
      {children}
    </li>
  );
}

/** The chevrons' shapes: the first rounded at the left, the last at the right; each in between notched to take the one before's point. */
const ARROW = 8;
const SHAPE = {
  first: `polygon(0 0, calc(100% - ${ARROW}px) 0, 100% 50%, calc(100% - ${ARROW}px) 100%, 0 100%)`,
  middle: `polygon(0 0, calc(100% - ${ARROW}px) 0, 100% 50%, calc(100% - ${ARROW}px) 100%, 0 100%, ${ARROW}px 50%)`,
  last: `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${ARROW}px 50%)`,
};

/**
 * Seen, Quote, Converted, as a Lightning path: chevrons in a row, a thin white
 * gap between them, under the stage names in the column's header. A stage
 * that's done is green with a check; the one the agent's at now, blue; not
 * yet, grey. Converted, the whole path is green: the order's in.
 */
function Path({ steps }: { steps: readonly Step[] }) {
  const label = c.live.steps.map((s, i) => `${s}: ${c.live.stepState[steps[i]]}`).join(", ");
  return (
    <span role="img" aria-label={label} className="flex">
      {steps.map((s, i) => {
        const shape = i === 0 ? SHAPE.first : i === steps.length - 1 ? SHAPE.last : SHAPE.middle;
        return (
          <span
            key={`${i}-${s}`}
            style={{ clipPath: shape }}
            className={`a2a-load-in grid h-6 min-w-0 flex-1 place-items-center first:rounded-l-full last:rounded-r-full [&:not(:first-child)]:-ml-[5px] ${
              s === "done" ? "bg-[#3ba755] text-white" : s === "now" ? "bg-[#0b5cab]" : "bg-[#ececef]"
            }`}
          >
            {s === "done" && <Check className="size-3.5" strokeWidth={2.75} />}
          </span>
        );
      })}
    </span>
  );
}

/** What the agent's at with an account, with the pulse while it works. A new note comes in with the wash. */
function Note({ working = false, bump = false, children }: { working?: boolean; bump?: boolean; children: ReactNode }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className={`a2a-load-in truncate text-[12.5px] text-text-muted ${bump ? "a2a-bump" : ""}`}>{children}</span>
      {working && <Pulse scale={0.7} className="shrink-0" />}
      {working && <span className="sr-only">, {c.live.working}</span>}
    </span>
  );
}
