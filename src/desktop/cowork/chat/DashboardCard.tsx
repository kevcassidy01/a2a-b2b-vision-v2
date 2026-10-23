import { useEffect, useState } from "react";
import { CardShell } from "../../../chat/CardShell";
import { CardSkeleton } from "../../../chat/InlineCard";
import { ColumnChart } from "../../../chat/viz/ColumnChart";
import { InsightPageView, KpiTiles, PromptSendContext } from "../../../chat/viz/InsightView";
import { SourceChips } from "./SourceChips";
import { CardFullScreen, SALESFORCE, SKELETON_MS } from "./TableCard";
import type { DashboardBlock } from "./types";

/**
 * DashboardCard — a Salesforce dashboard in the browser chat's MCP card, like
 * TableCard: Salesforce's identity in the header, a short skeleton, then the
 * title, the browser chat's KPI tiles and column chart, its source chips, and
 * a footer note. A live agent's posts update it in place, so the figures tick
 * up as each result lands. The header's expand button opens the full page
 * (DashboardFullScreen).
 */
export function DashboardCard({ block, onExpand }: { block: DashboardBlock; onExpand: () => void }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), SKELETON_MS);
    return () => clearTimeout(timer);
  }, []);
  const { title: chartTitle, ...chart } = block.chart;

  return (
    <div className="animate-fade-in">
      <CardShell app={SALESFORCE} onExpand={onExpand}>
        <div className="p-5">
          {loading ? (
            <CardSkeleton />
          ) : (
            <div className="animate-fade-in flex flex-col gap-4">
              <h4 className="text-[15px] font-semibold text-text">{block.title}</h4>
              <KpiTiles items={block.kpis} />
              <div className="rounded-lg border border-border p-4">
                <p className="mb-1 text-[13px] font-medium text-text-muted">{chartTitle}</p>
                <ColumnChart spec={chart} />
              </div>
              <SourceChips sources={block.sources} />
            </div>
          )}
        </div>
        {!loading && block.footer && (
          <div className="flex h-[41px] items-center border-t border-border px-4">
            <span className="text-[13px] text-text-subtle">{block.footer}</span>
          </div>
        )}
      </CardShell>
    </div>
  );
}

/**
 * DashboardFullScreen — the dashboard's full page, in the full-screen frame:
 * the browser chat's insight page (title, then groups of KPIs, charts and
 * tables, ending on next best actions), then its sources. `reveal` (ms)
 * loads it group by group.
 */
export function DashboardFullScreen({
  block,
  onClose,
  onSend,
  reveal,
}: {
  block: DashboardBlock;
  onClose: () => void;
  onSend: (text: string) => void;
  reveal?: number;
}) {
  return (
    <CardFullScreen onClose={onClose} onSend={onSend}>
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-8 p-6 pb-36">
        {/* Its next-best-action buttons post to this chat, then close the page. */}
        <PromptSendContext.Provider
          value={(prompt) => {
            onSend(prompt);
            onClose();
          }}
        >
          <InsightPageView page={block.full} reveal={reveal} />
        </PromptSendContext.Provider>
        <SourceChips sources={block.sources} />
      </div>
    </CardFullScreen>
  );
}
