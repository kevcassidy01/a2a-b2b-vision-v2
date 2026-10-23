import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, X } from "lucide-react";
import { AppLogo, CardShell } from "../../../chat/CardShell";
import { CardSkeleton } from "../../../chat/InlineCard";
import type { CardApp, Tone } from "../../../chat/types";
import { TONE_SKIN } from "../../../chat/viz/Pills";
import { copy } from "../../../copy/copy";
import { InChatComposer } from "../../../shell/InChatComposer";
import { SourceChips } from "./SourceChips";
import type { CoworkBlock, TableColumn } from "./types";

export type TableBlock = Extract<CoworkBlock, { type: "table" }>;

/** The card's app identity, as the browser chat's Salesforce MCP cards show it. */
export const SALESFORCE: CardApp = { name: "Salesforce", badge: "S", logo: "/salesforce.svg" };

/** How long the card's skeleton shows, a beat shorter than the browser chat's. */
export const SKELETON_MS = 500;

/** Status pill tones, by label. */
const STATUS_TONE: Record<string, Tone> = {
  "Agent fixes": "info",
  "Agent sends": "info",
  "Needs you": "warning",
  Fixed: "success",
  Done: "success",
  "Awaiting reply": "neutral",
  Watching: "neutral",
};

/** Whether a table holds more than its inline card shows, so it can go full screen. */
export function isExpandable(block: TableBlock) {
  return (
    (block.preview ?? block.rows.length) < block.rows.length ||
    (block.inline?.length ?? block.columns.length) < block.columns.length
  );
}

/**
 * TableCard — a table in the browser chat's MCP card (CardShell): Salesforce's
 * identity in the header, a short skeleton, then a title and the table on the
 * Salesforce list-view look (hairline frame, grey header band, row dividers),
 * its source chips, and a footer with the totals. When the table holds more
 * rows or columns than fit inline, the header's expand button and the
 * footer's "View all" link open it full screen (TableFullScreen).
 */
export function TableCard({ block, onExpand }: { block: TableBlock; onExpand: () => void }) {
  const t = copy.desktop.cowork.chat;
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), SKELETON_MS);
    return () => clearTimeout(timer);
  }, []);
  const expandable = isExpandable(block);
  const rows = block.rows.slice(0, block.preview ?? block.rows.length);

  return (
    <div className="animate-fade-in">
      <CardShell app={SALESFORCE} onExpand={expandable ? onExpand : undefined}>
        <div className="p-5">
          {loading ? (
            <CardSkeleton />
          ) : (
            <div className="animate-fade-in flex flex-col gap-4">
              <h4 className="text-[15px] font-semibold text-text">{block.title}</h4>
              <DataTable columns={block.columns} rows={rows} total={block.total} show={block.inline} />
              <SourceChips sources={block.sources} />
            </div>
          )}
        </div>
        {!loading && (block.footer || expandable) && (
          <div className="flex h-[41px] items-center justify-between border-t border-border px-4">
            <span className="text-[13px] text-text-subtle">{block.footer}</span>
            {expandable && (
              <button type="button" onClick={onExpand} className="flex items-center gap-1.5 text-[13px] text-app-link">
                {t.viewAll(block.rows.length)}
                <ArrowRight className="size-4" strokeWidth={2} />
              </button>
            )}
          </div>
        )}
      </CardShell>
    </div>
  );
}

/**
 * TableFullScreen — the expanded table: every row and column, under its title
 * and totals, in the full-screen frame (CardFullScreen).
 */
export function TableFullScreen({
  block,
  onClose,
  onSend,
}: {
  block: TableBlock;
  onClose: () => void;
  onSend: (text: string) => void;
}) {
  return (
    <CardFullScreen onClose={onClose} onSend={onSend}>
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-4 p-6 pb-36">
        <div>
          <h2 className="text-[20px] font-semibold text-text">{block.title}</h2>
          {block.footer && <p className="mt-1 text-[14px] text-text-muted">{block.footer}</p>}
        </div>
        <DataTable columns={block.columns} rows={block.rows} total={block.total} />
        <SourceChips sources={block.sources} />
      </div>
    </CardFullScreen>
  );
}

/**
 * CardFullScreen — an expanded Salesforce card, after the browser chat's
 * FullScreenApp: it covers the chat and the right panel (the transcript stays mounted underneath),
 * with the app header and a close X, the content scrolling, and an "Ask
 * Salesforce" prompt bar pinned at the bottom. A prompt sent here goes to the
 * chat and closes it, as does Escape.
 */
export function CardFullScreen({
  onClose,
  onSend,
  children,
}: {
  onClose: () => void;
  onSend: (text: string) => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="animate-fade-in absolute inset-0 z-30 bg-bg">
      <div className="absolute inset-3 flex flex-col overflow-hidden rounded-xl border border-prompt-border bg-surface">
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-4">
          <AppLogo app={SALESFORCE} />
          <span className="text-[16px] font-medium text-text">{SALESFORCE.name}</span>
          <button
            type="button"
            aria-label="Close full screen"
            onClick={onClose}
            className="ml-auto grid size-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text"
          >
            <X className="size-[18px]" strokeWidth={2} />
          </button>
        </div>
        <div className="relative min-h-0 flex-1">
          <div className="scroll-autohide absolute inset-0 overflow-y-auto">{children}</div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-surface from-40% to-transparent px-4 pb-6 pt-12">
            <div className="pointer-events-auto mx-auto max-w-[752px]">
              <InChatComposer
                hideConnector
                hideMeta
                placeholder={`Ask ${SALESFORCE.name}`}
                onSend={(text) => {
                  onSend(text);
                  onClose();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The table itself, the browser chat's TableFrame: `show` picks columns by
 *  index; `total` is a bold last row on the header's grey band. */
function DataTable({
  columns,
  rows,
  total,
  show,
}: {
  columns: TableColumn[];
  rows: string[][];
  total?: string[];
  show?: number[];
}) {
  const cols = show ?? columns.map((_, i) => i);
  const align = (c: TableColumn) => (c.kind === "amount" ? "text-right" : "text-left");
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full border-collapse text-[14px] leading-snug [&_td]:px-4 [&_th]:px-4">
        <thead>
          <tr>
            {cols.map((i) => (
              <th
                key={i}
                className={`whitespace-nowrap bg-elevated py-2.5 text-[13px] font-medium text-text-muted ${align(columns[i])}`}
              >
                {columns[i].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-t border-border align-top">
              {cols.map((i) => {
                const col = columns[i];
                const cell = row[i];
                if (col.kind === "status") {
                  return (
                    <td key={i} className="whitespace-nowrap py-2.5">
                      <span
                        className={`whitespace-nowrap inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-medium ${TONE_SKIN[STATUS_TONE[cell] ?? "neutral"]}`}
                      >
                        {cell}
                      </span>
                    </td>
                  );
                }
                const skin =
                  col.kind === "lead"
                    ? "whitespace-nowrap font-medium text-text"
                    : col.kind === "name"
                      ? "whitespace-nowrap text-text"
                      : col.kind === "amount"
                        ? "whitespace-nowrap text-right font-medium tabular-nums text-text"
                        : "text-text-muted";
                return (
                  <td key={i} className={`py-2.5 ${skin}`}>
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        {total && (
          <tfoot>
            <tr className="border-t border-border bg-elevated">
              {cols.map((i) => (
                <td
                  key={i}
                  className={`whitespace-nowrap py-2.5 font-semibold tabular-nums text-text ${align(columns[i])}`}
                >
                  {total[i]}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
