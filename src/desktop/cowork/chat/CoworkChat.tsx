import { useEffect, useRef, useState } from "react";
import { ChevronDown, CornerDownRight, PanelRight, ScrollText } from "lucide-react";
import { copy } from "../../../copy/copy";
import { FormattedText } from "../../../chat/MessageBubble";
import { ThinkingIndicator } from "../../../chat/ThinkingIndicator";
import { KpiTiles } from "../../../chat/viz/InsightView";
import { InChatComposer } from "../../../shell/InChatComposer";
import type { FlowId } from "../CoworkSidebar";
import { ActionCard } from "./ActionCard";
import { ActionList } from "./ActionList";
import { AgentCard } from "./AgentCard";
import { AnswersCard } from "./AnswersCard";
import { ApprovalCard } from "./ApprovalCard";
import { ChoiceCard } from "./ChoiceCard";
import { CoworkPanel } from "./CoworkPanel";
import { DashboardCard, DashboardFullScreen } from "./DashboardCard";
import { EmailCard } from "./EmailCard";
import { FileChips } from "./FileChips";
import { IntegrationsTimeline } from "./IntegrationsTimeline";
import { PlanDock } from "./PlanDock";
import { QuoteCard } from "./QuoteCard";
import { ScheduleCard } from "./ScheduleCard";
import { dictationFor, hintsFor, useCoworkChat } from "./store";
import { TableCard, TableFullScreen, type TableBlock } from "./TableCard";
import { TemplateCard } from "./TemplateCard";
import type { CoworkBlock, CoworkMessage, DashboardBlock } from "./types";

/**
 * CoworkChat — a session's conversation in the Cowork window, once its first
 * prompt is sent. As in the live app: a header (the session's title ⌄, and the
 * panel toggle on the right), the transcript scrolling behind the floating
 * in-chat prompt box (no Salesforce chip here), and the right-hand panel
 * (CoworkPanel). Reads Cowork's own store and renders its Claude-native blocks;
 * tables sit in the browser chat's MCP card and can open full screen over the
 * chat and right panel (TableFullScreen).
 *
 * Once the agent is live, the prompt bar's placeholder cycles through tips on
 * what to ask it (the script's `hints`).
 *
 * Follow-up chips belong to the latest reply but sit at the very end of the
 * transcript, right above the prompt box, even after the agent's own posts;
 * they go once Aaron sends something.
 *
 * The prompt box's mic dictates the session's next scripted line, if it has
 * one (the brief's setup answer, Growth Scout's discount).
 */
/** How long apart the Morning Brief's sections load when it opens. */
const BRIEF_REVEAL_MS = 350;

export function CoworkChat({ flow }: { flow: FlowId }) {
  const messages = useCoworkChat((s) => s.transcripts[flow]) ?? [];
  const thinking = useCoworkChat((s) => s.thinking[flow] ?? null);
  const send = useCoworkChat((s) => s.send);
  const [panelOpen, setPanelOpen] = useState(true);
  // A table opened full screen, over the chat and the right panel.
  const [expanded, setExpanded] = useState<TableBlock | null>(null);
  // The dashboard open full screen (from its card or the panel's Artifacts),
  // read from the transcript so it shows the latest version as the agent updates it.
  const opened = useCoworkChat((s) => s.opened);
  const closeArtifact = useCoworkChat((s) => s.closeArtifact);
  const dashboard =
    opened?.flow === flow
      ? messages
          .flatMap((m) => m.blocks)
          .filter((b): b is DashboardBlock => b.type === "dashboard" && b.title === opened.title)
          .pop()
      : undefined;
  const live = useCoworkChat((s) => s.live.includes(flow));
  const plan = useCoworkChat((s) => s.plans[flow]);
  const hint = useHint(live ? hintsFor(flow) : []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const title = copy.desktop.cowork.flows.items.find((f) => f.id === flow)?.title;

  // The latest chips, unless Aaron has sent something since, without any Aaron has
  // already used: each one is a one-time ask.
  const lastUser = messages.map((m) => m.role).lastIndexOf("user");
  const sent = messages.filter((m) => m.role === "user").map((m) => m.blocks.map((b) => (b.type === "text" ? b.content : "")).join(""));
  const chipItems =
    messages
      .slice(lastUser + 1)
      .flatMap((m) => m.blocks)
      .filter((b): b is Extract<CoworkBlock, { type: "chips" }> => b.type === "chips")
      .pop()
      ?.items.filter((c) => !sent.includes(c)) ?? [];
  const chips = chipItems.length ? { items: chipItems } : undefined;

  // The scrollbar shows only while the transcript scrolls, as on a Mac.
  const hideTimer = useRef<number | undefined>(undefined);
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.dataset.scrolling = "";
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => delete el.dataset.scrolling, 900);
  };

  // Follow the reply as it grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  return (
    <div className="relative flex min-w-0 flex-1 bg-bg">
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-12 shrink-0 items-center justify-between px-5">
          <button type="button" className="flex items-center gap-1.5 text-[14px] text-text">
            {title}
            <ChevronDown className="size-4 text-text-muted" strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label={copy.desktop.cowork.chat.panel.toggle}
            aria-pressed={panelOpen}
            onClick={() => setPanelOpen((v) => !v)}
            className={`grid size-7 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated ${
              panelOpen ? "bg-elevated text-text" : ""
            }`}
          >
            <PanelRight className="size-4" strokeWidth={1.75} />
          </button>
        </header>
        <div className="relative min-h-0 flex-1">
          <div ref={scrollRef} onScroll={onScroll} className="scroll-autohide absolute inset-0 overflow-y-auto">
            {/* Room at the bottom for the prompt box, and Claude's plan above it. */}
            <div className={`mx-auto flex max-w-[760px] flex-col gap-8 px-6 pt-6 ${plan ? "pb-[26rem]" : "pb-44"}`}>
              {messages.map((m) => (
                <Message key={m.id} flow={flow} message={m} onExpand={setExpanded} />
              ))}
              {thinking && <ThinkingIndicator label={thinking} />}
              {chips && !thinking && (
                <div className="animate-fade-in -mt-4">
                  <ActionList
                    items={chips.items.map((chip) => ({
                      label: chip,
                      icon: <CornerDownRight className="size-4 text-text-subtle" strokeWidth={1.75} />,
                      onClick: () => send(flow, chip),
                    }))}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-bg from-40% to-transparent px-6 pb-5 pt-12">
            <div className="pointer-events-auto mx-auto max-w-[760px]">
              {plan && <PlanDock items={plan} />}
              <InChatComposer
                hideConnector
                placeholder={hint}
                dictation={dictationFor(flow, messages)}
                onSend={(text) => send(flow, text)}
              />
            </div>
          </div>
        </div>
      </div>
      {panelOpen && <CoworkPanel flow={flow} />}
      {/* Full screen covers the whole main area, the right panel too. */}
      {expanded && (
        <TableFullScreen block={expanded} onClose={() => setExpanded(null)} onSend={(text) => send(flow, text)} />
      )}
      {dashboard && (
        <DashboardFullScreen
          block={dashboard}
          onClose={closeArtifact}
          onSend={(text) => send(flow, text)}
          // The brief loads section by section, quickly, as if just written.
          reveal={flow === "brief" ? BRIEF_REVEAL_MS : undefined}
        />
      )}
    </div>
  );
}

type Expand = (table: TableBlock) => void;

/** How long each prompt-bar tip shows before the next. */
const HINT_MS = 5000;

/** The prompt bar's placeholder: the live agent's tips in turn, or the default. */
function useHint(hints: string[]) {
  const [i, setI] = useState(0);
  const count = hints.length;
  useEffect(() => {
    if (count < 2) return;
    const timer = window.setInterval(() => setI((n) => n + 1), HINT_MS);
    return () => window.clearInterval(timer);
  }, [count]);
  return count ? hints[i % count] : undefined;
}

function Message({ flow, message, onExpand }: { flow: FlowId; message: CoworkMessage; onExpand: Expand }) {
  if (message.role === "user") {
    const text = message.blocks.map((b) => (b.type === "text" ? b.content : "")).join("");
    const files = message.blocks.flatMap((b) => (b.type === "files" ? b.names : []));
    return (
      <div className="flex flex-col items-end gap-2">
        {files.length > 0 && <FileChips names={files} />}
        <div className="max-w-[80%] rounded-2xl bg-bubble-user px-4 py-2.5 text-[15px] leading-relaxed text-text">
          {text}
        </div>
      </div>
    );
  }
  const blocks = message.blocks.filter((b) => b.type !== "chips");
  if (!blocks.length) return null;
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((b, i) => (
        <Block key={i} flow={flow} block={b} onExpand={onExpand} />
      ))}
    </div>
  );
}

function Block({ flow, block, onExpand }: { flow: FlowId; block: CoworkBlock; onExpand: Expand }) {
  const startAgent = useCoworkChat((s) => s.startAgent);
  const openArtifact = useCoworkChat((s) => s.openArtifact);
  const cancelAgent = useCoworkChat((s) => s.cancelAgent);
  const scheduleTask = useCoworkChat((s) => s.scheduleTask);
  const cancelTask = useCoworkChat((s) => s.cancelTask);
  const sendEmail = useCoworkChat((s) => s.sendEmail);
  const approve = useCoworkChat((s) => s.approve);
  const decline = useCoworkChat((s) => s.decline);
  const send = useCoworkChat((s) => s.send);

  switch (block.type) {
    case "text":
      return (
        <div className="animate-fade-in">
          <FormattedText content={block.content} />
        </div>
      );
    case "skill":
      return (
        <div className="animate-fade-in flex items-center gap-1.5 text-[13px] text-text-muted">
          <ScrollText className="size-3.5" strokeWidth={2} />
          <span>{copy.desktop.cowork.chat.ranSkill}</span>
          <code className="rounded-md bg-skill-chunk px-1.5 py-0.5 font-mono text-[12px] text-text-muted">
            {block.name}
          </code>
        </div>
      );
    case "integrations":
      return <IntegrationsTimeline steps={block.steps} shown={block.shown} />;
    case "table":
      return <TableCard block={block} onExpand={() => onExpand(block)} />;
    case "stats":
      // The scale moment: the browser chat's KPI tiles, then what it would've taken by hand.
      return (
        <div className="animate-fade-in flex flex-col gap-4">
          <KpiTiles items={block.items} pairs={block.pairs} />
          {block.note && <FormattedText content={block.note} />}
        </div>
      );
    case "chips":
      // Rendered once, at the end of the transcript (see CoworkChat).
      return null;
    case "action":
      return <ActionCard action={block} />;
    case "dashboard":
      return <DashboardCard block={block} onExpand={() => openArtifact(flow, block.title)} />;
    case "divider":
      return (
        <div className="animate-fade-in flex items-center gap-3 text-[13px] text-text-subtle">
          <span className="h-px flex-1 bg-border" />
          {block.label}
          <span className="h-px flex-1 bg-border" />
        </div>
      );
    case "agent":
      // Keyed by status, so the folded row starts closed.
      return (
        <AgentCard
          key={block.status}
          agent={block}
          onStart={() => startAgent(flow)}
          onCancel={() => cancelAgent(flow)}
        />
      );
    case "template":
      return <TemplateCard block={block} />;
    case "answers":
      return <AnswersCard block={block} />;
    case "schedule":
      return (
        <ScheduleCard
          key={block.status}
          task={block}
          onSchedule={() => scheduleTask(flow)}
          onCancel={() => cancelTask(flow)}
        />
      );
    case "email":
      return <EmailCard email={block} onSend={() => sendEmail(flow)} />;
    case "approval":
      return (
        <ApprovalCard
          key={block.status}
          block={block}
          onApprove={() => approve(flow, block.id)}
          onDecline={() => decline(flow, block.id)}
        />
      );
    case "quote":
      return <QuoteCard block={block} />;
    case "choice":
      return <ChoiceCard block={block} onPick={(label) => send(flow, label)} />;
    case "files":
      // Only on Aaron's messages (see Message).
      return null;
  }
}
