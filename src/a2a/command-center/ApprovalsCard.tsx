import { FileText, Inbox, Package } from "lucide-react";
import { useRef, type ReactNode } from "react";
import agentLogo from "../../assets/a2a/agent-logo.png";
import { copy } from "../../copy/copy";
import { useGlide } from "./glide";
import { Pulse } from "../Pulse";

const t = copy.a2a.commandCenter.approvals;

/**
 * ApprovalsCard — the task pipeline: the storefront's quote requests and where
 * each has got to, full width. Empty, it's a grey banner
 * saying nothing's in, fading down into the card. When a request lands, the
 * banner fades away under it, the card glides to the row's height, and the row
 * rises in with a pale blue wash that settles (.a2a-arrive). Once John's agent sends
 * Q-1042 it lists that: who it's from, what's asked, and who it's assigned to
 * (the seller agent, as an avatar pill). Clicking it opens the agent's chat about it.
 * Once the agent sends v2, the row shows v2 and the pill waits on Isar, without the pulse.
 */
export function ApprovalsCard({
  request = false,
  stage = "request",
  onOpen,
}: {
  request?: boolean;
  /** Where Q-1042 has got to: v1 in, the agent on it; v2 out, waiting on the buyer (no pulse); the buyer held
   *  out, the agent on it again; it needs Alex (no pulse, flagged); v3a and v3b out, waiting on the buyer;
   *  Isar took v3a (approved, green); the order's in (the row becomes O-5531, green). */
  stage?: "request" | "countered" | "heldOut" | "needsYou" | "v3" | "accepted" | "ordered";
  /** Opens the request in the agent's drawer. */
  onOpen?: () => void;
}) {
  const r = t.request;
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
  const { id, meta } = row;
  const changed = stage !== "request";
  const working = stage === "request" || stage === "heldOut";
  const needsYou = stage === "needsYou";
  const settled = stage === "accepted" || stage === "ordered";
  const body = useRef<HTMLDivElement>(null);
  useGlide(body, request);
  return (
    <section className="a2a-card flex flex-col gap-4 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="mr-auto flex flex-col gap-0.5">
          <h3 className="a2a-title text-[14px] font-semibold text-text">
            {t.title}{" "}
            <span key={request ? 1 : 0} className="a2a-load-in inline-block tabular-nums text-text-muted">
              ({request ? 1 : 0})
            </span>
          </h3>
          <p className="text-[13px] text-text-muted">{t.checked}</p>
        </div>
      </div>
      <div ref={body} className="relative">
        {/* Once the request's in, the banner stays a moment under it, fading. */}
        <div
          aria-hidden={request}
          data-gone={request || undefined}
          className={`a2a-empty-fade flex items-center gap-2.5 rounded-t-md px-3.5 pb-8 pt-3.5 text-[13.5px] text-text ${
            request ? "pointer-events-none absolute inset-x-0 top-0" : ""
          }`}
        >
          <Inbox className="size-4 shrink-0 text-text-muted" strokeWidth={1.75} />
          {t.empty}
        </div>
        {request && (
          <button
            type="button"
            onClick={onOpen}
            aria-label={`${r.open} ${id}`}
            className="a2a-arrive relative flex w-full items-center gap-3.5 rounded-lg px-3.5 py-3 text-left shadow-[0_0_0_1px_rgb(0_0_0/0.07)] transition-[background-color,box-shadow] hover:bg-[#f7f7f8] hover:shadow-[0_0_0_1px_rgb(0_0_0/0.14)] active:bg-[#f0f0f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0176d3]"
          >
            <span key={stage === "ordered" ? 1 : 0} className="a2a-load-in grid size-9 shrink-0 place-items-center rounded-lg bg-[#f3f3f5]">
              {stage === "ordered" ? (
                <Package className="size-4 text-text" strokeWidth={1.75} />
              ) : (
                <FileText className="size-4 text-text" strokeWidth={1.75} />
              )}
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
                {/* A new version's figures come in quickly, one after another, in place of v1's. */}
                {meta.map((m, i) => (
                  <Fetched key={`${id}-${m}`} at={changed ? i * 120 : META_AT[i + 1]}>
                    {i > 0 && " · "}
                    {m}
                  </Fetched>
                ))}
              </p>
            </div>
            {/* A beat after the request lands, the seller agent picks it up, then the details come in. */}
            <AgentPill
              name={needsYou ? r.heldOut.needsYou : row.agent}
              working={working}
              tone={needsYou ? "flagged" : settled ? "done" : undefined}
              workingLabel={r.working}
            />
            <span className="w-16 shrink-0 text-right text-[12.5px] text-text-muted">{r.time}</span>
          </button>
        )}
      </div>
    </section>
  );
}

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

/**
 * Who a request is assigned to: the agent's avatar and name in a pill. While
 * it works on the request, the pulse runs at the right, as if it's typing;
 * with nothing to do, there's no pulse.
 */
function AgentPill({
  name,
  working,
  tone,
  workingLabel,
}: {
  name: string;
  working: boolean;
  /** When it's handed the request to Alex, a gold tint; once it's approved or ordered, a green one. */
  tone?: "flagged" | "done";
  workingLabel: string;
}) {
  return (
    <span
      key={name}
      style={{ animationDelay: `${PICKED_UP}ms` }}
      className={`a2a-load-in flex h-7 shrink-0 items-center gap-1.5 rounded-full pl-1 pr-2.5 text-[12.5px] font-medium text-text ${
        tone === "flagged" ? "bg-[#fdf0cc]" : tone === "done" ? "bg-[#e3f3e6]" : "bg-[#f3f3f5]"
      }`}
    >
      <span className="grid size-5 place-items-center rounded-full bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.07)]">
        <img src={agentLogo} alt="" className="size-3" />
      </span>
      {name}
      {working && (
        <Pulse scale={0.9} className="ml-1" />
      )}
      {working && <span className="sr-only">, {workingLabel}</span>}
    </span>
  );
}
