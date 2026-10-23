import { Fragment, useState } from "react";
import { MessageIdContext, useMessageId } from "./MessageId";
import { Suggestions } from "./Suggestions";
import type { Block, FileRef, Message } from "./types";
import { Bookmark, Check, ChevronRight, Copy, FileText, ListChecks, RotateCcw, ScrollText, ThumbsDown, ThumbsUp } from "lucide-react";
import { useBusy, useChat, useFired } from "./store";
import { Slot } from "./Slot";
import { ToolTimeline } from "./ToolTimeline";
import { WriteTimeline } from "./WriteTimeline";
import { AppTimeline } from "./AppTimeline";
import { PermissionCard } from "./PermissionCard";
import { Tooltip } from "../shell/Tooltip";
import { ExportShareIcons } from "./ExportShare";
import { copy } from "../copy/copy";
import { Checklist } from "./viz/InsightView";

/** Render inline `**bold**` spans within a line of response text. */
function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    const m = /^\*\*([^*]+)\*\*$/.exec(part);
    return m ? (
      <strong key={i} className="font-semibold text-text">
        {m[1]}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    );
  });
}

/**
 * FormattedText — a light renderer for assistant text: paragraphs, `## `
 * headings, `- ` bullet lists and `1. ` numbered lists (consecutive lines
 * grouped; an indented `- ` line under a numbered item is its sub-line), and
 * inline `**bold**`. Keeps copy scannable without pulling in a markdown lib.
 */
export function FormattedText({ content }: { content: string }) {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let bullets: string[] = [];
  let numbered: { head: string; subs: string[] }[] = [];

  const flush = () => {
    if (bullets.length) {
      nodes.push(
        <ul key={`ul${nodes.length}`} className="list-disc space-y-1 pl-5 text-[16px] leading-relaxed text-text">
          {bullets.map((b, i) => (
            <li key={i}>{renderInline(b)}</li>
          ))}
        </ul>,
      );
      bullets = [];
    }
    if (numbered.length) {
      nodes.push(
        <ol key={`ol${nodes.length}`} className="list-decimal space-y-3 pl-6 text-[16px] leading-relaxed text-text marker:font-semibold marker:text-text-muted">
          {numbered.map((n, i) => (
            <li key={i} className="pl-1">
              {renderInline(n.head)}
              {n.subs.length > 0 && (
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-text-muted">
                  {n.subs.map((sub, j) => (
                    <li key={j}>{renderInline(sub)}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>,
      );
      numbered = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    const num = /^\d+\.\s+(.*)$/.exec(line);
    if (num) {
      if (bullets.length) flush();
      numbered.push({ head: num[1], subs: [] });
    } else if (line.startsWith("- ") && numbered.length && /^\s+/.test(raw)) {
      numbered[numbered.length - 1].subs.push(line.slice(2));
    } else if (line.startsWith("- ")) {
      if (numbered.length) flush();
      bullets.push(line.slice(2));
    } else if (line.startsWith("## ")) {
      flush();
      nodes.push(
        <h2 key={`h${nodes.length}`} className="pt-1 text-title font-semibold text-text">
          {renderInline(line.slice(3))}
        </h2>,
      );
    } else if (line) {
      flush();
      nodes.push(
        <p key={`p${nodes.length}`} className="text-[16px] leading-relaxed text-text">
          {renderInline(line)}
        </p>,
      );
    }
  }
  flush();

  return <div className="space-y-2.5">{nodes}</div>;
}

/** "Noted for later · Premium Grinder" — Claude acknowledging what to remember. */
function NotedLine({ items }: { items: string }) {
  return (
    <div className="flex items-center gap-2 text-label text-text-muted">
      <Bookmark className="size-4" strokeWidth={2} />
      <span>
        Noted for later · <span className="font-medium text-text">{items}</span>
      </span>
    </div>
  );
}

/** The created-file card (claude.ai's artifact chip): doc icon tile, title,
 *  "Document · PDF", then Download and Share icon buttons (display only).
 *  Clicking the card opens the side preview; the open file reads as selected. */
function FileCard({ file }: { file: FileRef }) {
  const open = useChat((s) => s.openPreview);
  const selected = useChat((s) => s.preview?.id === file.id);
  return (
    <div
      className={`flex w-full max-w-[460px] items-center gap-2 rounded-xl border pr-2 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
        selected ? "border-text-muted/40 bg-elevated" : "border-border bg-surface hover:bg-elevated"
      }`}
    >
      <button type="button" onClick={() => open(file)} className="flex min-w-0 flex-1 items-center gap-3 p-3 text-left">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-border bg-surface">
          <FileText className="size-5 text-text-muted" strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-body font-medium text-text">{file.title}</span>
          <span className="block text-label text-text-muted">Document · {file.format}</span>
        </span>
      </button>
      <ExportShareIcons exportLabel="Download" />
    </div>
  );
}

/** Claude's own to-do list (e.g. the recap's Things to do): a plain card in
 *  the file card's look, no app header or footer, since it comes from the
 *  chat, not from Salesforce. */
function ChecklistCard({ block }: { block: Extract<Block, { type: "checklist" }> }) {
  return (
    <div className="animate-fade-in overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center gap-3 border-b border-border p-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-border bg-surface">
          <ListChecks className="size-5 text-text-muted" strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-body font-medium text-text">{block.title}</span>
          {block.meta && <span className="block text-label text-text-muted">{block.meta}</span>}
        </span>
      </div>
      <Checklist items={block.items} bare />
    </div>
  );
}

/** Slack's mark (lucide has no brand icons), in its four colors. */
function SlackLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#E01E5A" d="M5.04 15.17a2.53 2.53 0 1 1-2.52-2.53h2.52v2.53Zm1.27 0a2.53 2.53 0 0 1 5.05 0v6.31a2.53 2.53 0 1 1-5.05 0v-6.31Z" />
      <path fill="#36C5F0" d="M8.83 5.04a2.53 2.53 0 1 1 2.53-2.52v2.52H8.83Zm0 1.27a2.53 2.53 0 0 1 0 5.05H2.52a2.53 2.53 0 0 1 0-5.05h6.31Z" />
      <path fill="#2EB67D" d="M18.96 8.83a2.53 2.53 0 1 1 2.52 2.53h-2.52V8.83Zm-1.27 0a2.53 2.53 0 0 1-5.05 0V2.52a2.53 2.53 0 1 1 5.05 0v6.31Z" />
      <path fill="#ECB22E" d="M15.17 18.96a2.53 2.53 0 1 1-2.53 2.52v-2.52h2.53Zm0-1.27a2.53 2.53 0 0 1 0-5.05h6.31a2.53 2.53 0 1 1 0 5.05h-6.31Z" />
    </svg>
  );
}

/** A share card shaped like the file card, with its action at the right.
 *  With an `actionKey` the button plays it (an in-app button: no user
 *  bubble), and once it has, or the reply's chip fired it, the card shows
 *  where it went. Without, display only (a hover state). */
function ShareCard({ block }: { block: Extract<Block, { type: "share" }> }) {
  const runAction = useChat((s) => s.runAction);
  const busy = useBusy();
  const [clicked, setClicked] = useState(false);
  const fired = useFired(useMessageId(), block.actionKey?.split("|")[0]);
  const sent = !!block.actionKey && (clicked || fired);
  return (
    <div className="flex w-full max-w-[520px] items-center gap-3 rounded-xl border border-border bg-surface p-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-border bg-surface">
        <SlackLogo className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body font-medium text-text">{block.title}</span>
        <span className="block text-label text-text-muted">{block.meta}</span>
      </span>
      {sent ? (
        <span className="flex h-9 shrink-0 items-center gap-1.5 px-1 text-label font-medium text-text-muted">
          <Check className="size-4 text-success" strokeWidth={2.5} />
          {block.sent ?? "Sent"}
        </span>
      ) : (
        <button
          type="button"
          disabled={!!block.actionKey && busy}
          onClick={
            block.actionKey
              ? () => {
                  setClicked(true);
                  runAction(block.actionKey!);
                }
              : undefined
          }
          className="h-9 shrink-0 rounded-lg border border-border px-3.5 text-label font-medium text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated disabled:opacity-50"
        >
          {block.action}
        </button>
      )}
    </div>
  );
}

/** Skill transparency chip — shown when a response ran a skill, even one
 *  Claude selected on its own. Grey, low-key, with a scroll icon + the skill's
 *  mono name; sits above the response so the provenance is clear. */
function SkillChip({ skill }: { skill: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[13px] text-text-muted">
      <ScrollText className="size-3.5" strokeWidth={2} />
      <span>Ran skill</span>
      <code className="rounded-md bg-skill-chunk px-1.5 py-0.5 font-mono text-[12px] text-text-muted">{skill}</code>
    </div>
  );
}

function BlockView({ block, latest }: { block: Block; latest: boolean }) {
  switch (block.type) {
    case "tools":
      return (
        <>
          <ToolTimeline tools={block.tools} latest={latest} />
          {block.skill && <SkillChip skill={block.skill} />}
        </>
      );
    case "writes":
      return <WriteTimeline steps={block.steps} latest={latest} />;
    case "apps":
      return <AppTimeline steps={block.steps} latest={latest} />;
    case "permission":
      return <PermissionCard block={block} />;
    case "text":
      return <FormattedText content={block.content} />;
    case "noted":
      return <NotedLine items={block.items} />;
    case "file":
      return <FileCard file={block.file} />;
    case "share":
      return <ShareCard block={block} />;
    case "checklist":
      return <ChecklistCard block={block} />;
    case "slot":
      return <Slot block={block} />;
  }
}

/**
 * MessageBubble — renders one message.
 *
 * User messages are a right-aligned bubble (`--color-bubble-user` #F0F0EF,
 * rounded but not pilled). Assistant messages have no bubble — blocks stack
 * left-aligned across the column, followed by an action row (copy / like /
 * retry — presentational) and the Claude clay spark. Both roles use the UI
 * sans at 16px; slots render MCP app cards (see `Slot`).
 *
 * `latest` marks the newest assistant message — its tool-call timeline shows
 * expanded; earlier messages collapse theirs behind a summary row.
 *
 * `end` marks the reply that ends the chat (the last message, nothing
 * generating): only it closes with its follow-up chips and the Claude logo on
 * its own line. Once anything follows, both go, so the transcript reads as a
 * chat. Every finished reply keeps its action row.
 */
export function MessageBubble({ message, latest = false, end = false }: { message: Message; latest?: boolean; end?: boolean }) {
  if (message.role === "user") {
    const text = message.blocks
      .map((b) => (b.type === "text" ? b.content : ""))
      .join("");
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl bg-bubble-user px-4 py-2.5 text-[16px] leading-relaxed text-text">
          {text}
        </div>
      </div>
    );
  }

  const actions = copy.shell.messageActions;
  return (
    <MessageIdContext.Provider value={message.id}>
      <div className="flex flex-col gap-4">
        {/* Tool-call timeline — the Headless 360 MCP tools this response ran, shown
            above everything else (they produced the answer). Latest message shows
            them expanded; earlier ones collapse behind a summary row. */}
        {message.tools && message.tools.length > 0 && (
          <ToolTimeline tools={message.tools} latest={latest} />
        )}

        {message.skill && <SkillChip skill={message.skill} />}

        {/* Claude's own tool summary (not MCP): a muted collapsed line. */}
        {message.activity && (
          <div className="flex items-center gap-1 text-[14px] text-text-muted">
            <span>{message.activity}</span>
            <ChevronRight className="size-4" strokeWidth={2} />
          </div>
        )}

        {message.blocks.map((block, i) => (
          <BlockView key={i} block={block} latest={latest} />
        ))}

        {/* Held back while a follow-on part is still playing. */}
        {!message.pending && (
          <>
            {/* Action row — copy / like / dislike / retry (presentational; the
                product's speak icon is intentionally omitted). Each has a tooltip. */}
            <div className="-ml-1.5 flex items-center gap-0.5 text-text-muted">
              {[
                { icon: Copy, label: actions.copy },
                { icon: ThumbsUp, label: actions.like },
                { icon: ThumbsDown, label: actions.dislike },
                { icon: RotateCcw, label: actions.retry },
              ].map(({ icon: Icon, label }) => (
                <Tooltip key={label} label={label} side="top">
                  <button
                    type="button"
                    aria-label={label}
                    className="grid size-7 place-items-center rounded-md transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text"
                  >
                    <Icon className="size-4" strokeWidth={2} />
                  </button>
                </Tooltip>
              ))}
            </div>

            {end && (
              <>
                <Suggestions message={message} />
                {/* Claude clay spark — closes out the chat, on its own line.
                    Placeholder asset, same as the greeting. */}
                <div>
                  <img src="/favicon.webp" alt="" aria-hidden className="size-6" />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </MessageIdContext.Provider>
  );
}
