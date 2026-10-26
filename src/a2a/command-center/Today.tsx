import { FileText, Megaphone, Package, Truck } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import agentLogo from "../../assets/a2a/agent-logo.png";
import { copy } from "../../copy/copy";
import { Pulse } from "../Pulse";

const t = copy.a2a.commandCenter;
const d = t.today;
const r = t.approvals.request;

/** Where Q-1042 has got to: v1 in, the agent on it; v2 out, waiting on the buyer (no pulse); the buyer held
 *  out, the agent on it again; it needs Alex (no pulse, flagged); v3a and v3b out, waiting on the buyer;
 *  Isar took v3a (approved, green); the order's in (the card becomes O-5531, green). */
export type TaskStage = "request" | "countered" | "heldOut" | "needsYou" | "v3" | "accepted" | "ordered";

/**
 * Today — the first section of the Command Center: its heading over a dashed
 * frame holding one row of cards, top-aligned so each keeps its own height.
 * Three equal columns. Calm at load, two cards (what's going out, what's
 * booked) fill the first two, the last third left open. When an agent takes a
 * task up (Q-1042), its card opens a column at the front and the two ease
 * right into the rest (.a2a-today-row).
 */
export function Today({
  task,
  stage,
  onOpen,
}: {
  /** Whether the agent's task has come in. */
  task: boolean;
  stage: TaskStage;
  /** Opens the task in the agent's drawer. */
  onOpen: () => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="a2a-title text-[16px] font-semibold leading-snug tracking-[-0.01em] text-text">{t.sections.today.title}</h2>
        <p className="text-[13px] leading-normal text-text-muted">{t.sections.today.subtitle}</p>
      </div>
      <div className="rounded-2xl border border-dashed border-[#c4c4ca] px-1.5 py-3">
        <div className="a2a-today-row items-start" data-task={task || undefined}>
          <div aria-hidden={!task}>{task && <TaskCard stage={stage} onOpen={onOpen} />}</div>
          <GoingOut />
          <Booked ordered={stage === "ordered"} />
          <div aria-hidden />
        </div>
      </div>
    </section>
  );
}

/** A card in Today's row: white, a title, then what it holds. */
function Card({ title, icon, className = "", children }: { title: string; icon: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section className={`a2a-card mx-1.5 flex min-w-0 flex-col rounded-xl p-5 ${className}`}>
      <h3 className="flex items-center gap-2 text-[13px] font-medium text-text-muted">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

const TONE = {
  done: "bg-[#e3f3e6] text-[#1f6b35]",
  ready: "bg-[#e3effc] text-[#0b5cab]",
  idle: "bg-[#f3f3f5] text-text-muted",
} as const;

/** Orders leaving the warehouse today: the first few with where they're going and how far they've got, then how many more. */
function GoingOut() {
  const g = d.goingOut;
  return (
    <Card title={g.title} icon={<Truck className="size-4" strokeWidth={1.75} />}>
      <p className="mt-1 text-[12.5px] text-text-muted">{g.subtitle}</p>
      <ul className="mt-4 flex flex-col">
        {g.rows.map((o) => (
          <li key={o.id} className="flex items-center gap-3 border-t border-black/[0.06] py-2.5 first:border-t-0 first:pt-0">
            <div className="mr-auto min-w-0">
              <p className="truncate text-[13.5px] font-medium text-text">
                {o.to}
              </p>
              <p className="truncate text-[12.5px] text-text-muted">
                <span className="tabular-nums">{o.id}</span> · {o.site}
              </p>
            </div>
            <span className={`shrink-0 rounded-lg px-2 text-[12px] font-medium leading-6 ${TONE[o.tone]}`}>{o.status}</span>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-[12.5px] text-text-muted">{g.more}</p>
    </Card>
  );
}

/** What's been ordered today. When O-5531 comes in, the figure moves, with a wash. */
function Booked({ ordered }: { ordered: boolean }) {
  const b = d.booked;
  const now = ordered ? b.after : b;
  return (
    <Card title={b.title} icon={<Package className="size-4" strokeWidth={1.75} />}>
      <p key={now.value} className={`a2a-title mt-3 self-start text-[26px] font-semibold leading-tight tracking-[-0.015em] tabular-nums text-text ${ordered ? "a2a-bump" : ""}`}>
        {now.value}
      </p>
      <p className="mt-1 text-[12.5px] text-text-muted">{now.note}</p>
    </Card>
  );
}

/** When the agent picks the task up, and when each detail comes in as it reads them (who it's from, then units, discount, terms), in ms after the card lands. */
const LANDS = 320;
const PICKED_UP = LANDS + 400;
const META_AT = [900, 1300, 1700, 2100].map((ms) => ms + LANDS);

/**
 * The task an agent has taken up, as a card in Today's row: what kind it is and
 * when, the title (the quote), who it's from and what's asked under it, then
 * what it comes to and where it ships, and at the foot who's handling it, the
 * agent's footer, with the pulse while it works. It rises in with a pale blue wash once its column has opened. Clicking
 * it opens the agent's chat about it. As Q-1042 moves on, the card follows it,
 * through to order O-5531.
 */
function TaskCard({ stage, onOpen }: { stage: TaskStage; onOpen: () => void }) {
  const row =
    stage === "countered"
      ? r.countered
      : stage === "heldOut" || stage === "needsYou"
        ? r.heldOut
        : stage === "v3"
          ? r.v3
          : stage === "accepted"
            ? r.accepted
            : stage === "ordered"
              ? r.ordered
              : r;
  const changed = stage !== "request";
  const ordered = stage === "ordered";
  const needsYou = stage === "needsYou";
  const settled = stage === "accepted" || ordered;
  const Icon = ordered ? Package : FileText;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${r.open} ${row.id}`}
      style={{ animationDelay: `${LANDS}ms, ${LANDS}ms` }}
      className="a2a-card a2a-card-link a2a-arrive mx-1.5 flex w-[calc(100%-12px)] flex-col rounded-xl px-5 pb-1.5 pt-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0176d3]"
    >
      <span className="flex items-center gap-2 text-[13px] font-medium text-text-muted">
        <Icon key={ordered ? 1 : 0} className="a2a-load-in size-4" strokeWidth={1.75} />
        <span key={"kind" in row ? row.kind : r.kind} className="a2a-load-in mr-auto">{"kind" in row ? row.kind : r.kind}</span>
        <span className="text-[12px] font-normal">{r.time}</span>
      </span>
      <span key={row.id} className="a2a-title a2a-load-in mt-3 block text-[15px] font-semibold leading-snug text-text">{row.id}</span>
      <span className="mt-1 block text-[12.5px] leading-normal text-text-muted">
        <Fetched at={META_AT[0]} className="font-medium text-text">{r.from}</Fetched>
        {" · "}
        {/* A new version's figures come in quickly, one after another, in place of the last. */}
        {row.meta.map((m, i) => (
          <Fragment key={`${row.id}-${m}`}>
            {i > 0 && " · "}
            <Fetched at={changed ? i * 120 : META_AT[i + 1]}>{m}</Fetched>
          </Fragment>
        ))}
      </span>
      {/* The campaign the cart came from. */}
      <span style={{ animationDelay: `${META_AT[3] + 200}ms` }} className="a2a-load-in mt-3 flex">
        <span className="flex h-6 min-w-0 items-center gap-1.5 rounded-lg bg-[#f3f3f5] px-2 text-[12px] font-medium text-text-muted">
          <Megaphone aria-hidden className="size-3.5 shrink-0" strokeWidth={1.75} />
          <span className="sr-only">{r.campaign.label}: </span>
          <span className="truncate">{r.campaign.name}</span>
        </span>
      </span>
      {/* What it comes to, and where it ships, over a hairline. */}
      <span className="mt-4 grid grid-cols-2 gap-3 border-t border-black/[0.06] pt-3">
        <Fact label={r.facts.total} at={changed ? 0 : META_AT[3] + 400}>
          <span key={row.total} className="a2a-load-in inline-block tabular-nums">{row.total}</span>
        </Fact>
        <Fact label={r.facts.shipsTo} at={META_AT[3] + 400}>{r.facts.sites}</Fact>
      </span>
      <span className="-mx-3.5 mt-4 flex">
        <AgentPill
          name={needsYou ? r.heldOut.needsYou : row.agent}
          working={stage === "request" || stage === "heldOut"}
          tone={needsYou ? "flagged" : settled ? "done" : undefined}
        />
      </span>
    </button>
  );
}

/** One of the task's facts: a small label over its value. */
function Fact({ label, at, children }: { label: string; at: number; children: ReactNode }) {
  return (
    <span style={{ animationDelay: `${at}ms` }} className="a2a-load-in flex min-w-0 flex-col gap-0.5">
      <span className="text-[12px] text-text-muted">{label}</span>
      <span className="truncate text-[13.5px] font-medium text-text">{children}</span>
    </span>
  );
}

/** A detail of the task, fading in once the agent has read it. */
function Fetched({ at, className = "", children }: { at: number; className?: string; children: ReactNode }) {
  return (
    <span style={{ animationDelay: `${at}ms` }} className={`a2a-load-in inline-block ${className}`}>
      {children}
    </span>
  );
}

/**
 * Who's handling the task: the agent's avatar and what it's doing, as the
 * card's footer, inset 6px at the sides and bottom. Its bottom corners are the
 * card's radius less the inset (12 − 6), so the two curves stay concentric; the
 * top corners are square. Avatar, label and pulse sit centred in it.
 * While it works, the pulse runs at the right, as if it's typing; with nothing
 * to do, there's no pulse.
 */
function AgentPill({ name, working, tone }: { name: string; working: boolean; tone?: "flagged" | "done" }) {
  return (
    <span
      key={name}
      style={{ animationDelay: `${PICKED_UP}ms` }}
      className={`a2a-load-in flex h-8 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-b-[6px] px-3 text-[12.5px] font-medium text-text ${
        tone === "flagged" ? "bg-[#fdf0cc]" : tone === "done" ? "bg-[#e3f3e6]" : "bg-[#f3f3f5]"
      }`}
    >
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.07)]">
        <img src={agentLogo} alt="" className="size-3" />
      </span>
      <span className="truncate">{name}</span>
      {working && <Pulse scale={0.8} className="shrink-0" />}
      {working && <span className="sr-only">, {r.working}</span>}
    </span>
  );
}
