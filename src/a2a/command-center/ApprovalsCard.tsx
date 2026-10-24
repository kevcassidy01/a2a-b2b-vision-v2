import { FileText, Inbox } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import agentLogo from "../../assets/a2a/agent-logo.png";
import { copy } from "../../copy/copy";

const t = copy.a2a.commandCenter.approvals;

/**
 * ApprovalsCard — the storefront's quote requests waiting on the seller, full
 * width. Empty, it's a grey banner
 * saying nothing's waiting, fading down into the card. Once John's agent sends
 * Q-1042 it lists that: who it's from, what's asked, and who it's assigned to
 * (the seller agent, as an avatar pill). Clicking it opens the agent's chat about it.
 * Once the agent sends v2, the row shows v2 and the pill waits on Isar, without dots.
 */
export function ApprovalsCard({
  request = false,
  countered = false,
  onOpen,
}: {
  request?: boolean;
  /** Whether the seller agent has sent v2: the row shows it, and the agent waits on the buyer (no dots). */
  countered?: boolean;
  /** Opens the request in the agent's drawer. */
  onOpen?: () => void;
}) {
  const r = t.request;
  const c = r.countered;
  const id = countered ? c.id : r.id;
  const meta = countered ? c.meta : r.meta;
  return (
    <section className="a2a-card flex flex-col gap-4 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="mr-auto flex flex-col gap-0.5">
          <h3 className="a2a-title text-[14px] font-semibold text-text">
            {t.title} <span className="tabular-nums text-text-muted">({request ? 1 : 0})</span>
          </h3>
          <p className="text-[13px] text-text-muted">{t.checked}</p>
        </div>
      </div>
      {request ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`${r.open} ${id}`}
          className="a2a-load-in flex w-full items-center gap-3.5 rounded-lg px-3.5 py-3 text-left shadow-[0_0_0_1px_rgb(0_0_0/0.07)] transition-[background-color,box-shadow] hover:bg-[#f7f7f8] hover:shadow-[0_0_0_1px_rgb(0_0_0/0.14)] active:bg-[#f0f0f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0176d3]"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f3f3f5]">
            <FileText className="size-4 text-text" strokeWidth={1.75} />
          </span>
          <div className="mr-auto min-w-0">
            <p className="truncate text-[13.5px] font-semibold text-text">
              <span key={id} className="a2a-load-in inline-block">
                {id}
              </span>{" "}
              <Fetched at={META_AT[0]} className="font-normal text-text-muted">
                · {r.from}
              </Fetched>
            </p>
            <p className="truncate text-[12.5px] text-text-muted">
              {/* v2's figures come in quickly, one after another, in place of v1's. */}
              {meta.map((m, i) => (
                <Fetched key={m} at={countered ? i * 120 : META_AT[i + 1]}>
                  {i > 0 && " · "}
                  {m}
                </Fetched>
              ))}
            </p>
          </div>
          {/* A beat after the request lands, the seller agent picks it up, then the details come in. */}
          <AgentPill name={countered ? c.agent : r.agent} working={!countered} workingLabel={r.working} />
          <span className="w-16 shrink-0 text-right text-[12.5px] text-text-muted">{r.time}</span>
        </button>
      ) : (
        <div className="a2a-empty-fade flex items-center gap-2.5 rounded-t-md px-3.5 pb-8 pt-3.5 text-[13.5px] text-text">
          <Inbox className="size-4 shrink-0 text-text-muted" strokeWidth={1.75} />
          {t.empty}
        </div>
      )}
    </section>
  );
}

/** Colours of the three typing dots: the agent's violet, then blue and teal. */
/** When the seller agent picks the request up, and when each detail comes in as it reads them (who it's from, then units, discount, terms), in ms after the row lands. */
const PICKED_UP = 400;
const META_AT = [900, 1300, 1700, 2100];

/** A detail of the request, fading in once the agent has read it. */
function Fetched({ at, className = "", children }: { at: number; className?: string; children: ReactNode }) {
  return (
    <span style={{ animationDelay: `${at}ms` }} className={`a2a-load-in inline-block ${className}`}>
      {children}
    </span>
  );
}

const DOTS = ["#7f56d9", "#0176d3", "#0b827c"];

/**
 * Who a request is assigned to: the agent's avatar and name in a pill. While
 * it works on the request, three coloured dots bounce at the right, as in a
 * typing indicator; with nothing to do, there are no dots.
 */
function AgentPill({ name, working, workingLabel }: { name: string; working: boolean; workingLabel: string }) {
  return (
    <span
      style={{ animationDelay: `${PICKED_UP}ms` }}
      className="a2a-load-in flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-[#f3f3f5] pl-1 pr-2.5 text-[12.5px] font-medium text-text"
    >
      <span className="grid size-5 place-items-center rounded-full bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.07)]">
        <img src={agentLogo} alt="" className="size-3" />
      </span>
      {name}
      {working && (
        <span aria-hidden className="ml-0.5 flex items-center gap-[3px]">
          {DOTS.map((c, i) => (
            <span
              key={c}
              className="a2a-typing-dot size-[5px] rounded-full"
              style={{ background: c, "--i": i } as CSSProperties}
            />
          ))}
        </span>
      )}
      {working && <span className="sr-only">, {workingLabel}</span>}
    </span>
  );
}
