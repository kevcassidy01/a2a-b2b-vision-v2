import {
  ArrowUp,
  AtSign,
  Ellipsis,
  History,
  Mic,
  Plus,
  SquarePen,
  Store,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import agentLogo from "../../assets/a2a/agent-logo.png";
import { copy } from "../../copy/copy";
import { Tooltip } from "../Tooltip";
import { QuoteThread } from "./QuoteThread";

const t = copy.a2a.commandCenter.agent;

/** The chat's column: the thread and the prompt box share it, so the box is
 *  exactly as wide as the chat, centred in the drawer with room either side. */
const COLUMN = "mx-auto w-full max-w-[680px] px-8";

/**
 * AgentDrawer — the seller agent's side panel, opened by the Agent button. It
 * slides in from the Command Center's right edge, over the page, which dims
 * under a dark glass scrim (CommandCenter) so the chat has the focus. Escape or the close button shuts
 * it. Around the chat: the header (the agent, New chat, history, more,
 * close) and the prompt box with what the chat's about, under a short note.
 * Inside: an empty state (a greeting, what to hand it, suggestions), or once
 * Alex opens Q-1042 from Today, the agent's chat about it (QuoteThread).
 */
export function AgentDrawer({
  open,
  quote = false,
  onClose,
}: {
  open: boolean;
  /** Whether Alex has opened Q-1042: the drawer then holds its chat instead of the empty state. */
  quote?: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    // Focus moves into the panel (not onto Close, which would pop its tooltip).
    panelRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <aside
      ref={panelRef}
      tabIndex={-1}
      aria-label={t.label}
      inert={!open}
      data-open={open || undefined}
      className="a2a-drawer outline-none absolute inset-y-0 right-0 z-30 flex w-[clamp(560px,75%,960px)] max-w-full flex-col bg-white"
    >
      <div className="flex h-14 shrink-0 items-center gap-1 border-b border-border pl-5 pr-3">
        <img src={agentLogo} alt="" className="size-[18px] shrink-0" />
        <h2 className="ml-2 text-[15px] font-semibold text-text">{t.label}</h2>
        <span className="ml-2 mr-auto flex items-center gap-1.5 text-[12.5px] text-text-muted">
          <span aria-hidden className="size-1.5 rounded-full bg-[#2e844a]" />
          {t.status}
        </span>
        <HeaderButton icon={SquarePen} label={t.newChat} />
        <HeaderButton icon={History} label={t.history} />
        <HeaderButton icon={Ellipsis} label={t.more} />
        <span aria-hidden className="mx-1.5 h-5 w-px bg-border" />
        <HeaderButton icon={X} label={t.close} onClick={onClose} />
      </div>
      <div className="a2a-no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
        {quote ? (
          <div className={COLUMN}>
            <QuoteThread />
          </div>
        ) : (
          <Empty />
        )}
      </div>
      <div className={`${COLUMN} shrink-0 pb-4`}>
        <PromptBox />
        <p className="mt-2.5 text-center text-[11.5px] text-text-muted">{t.composer.note}</p>
      </div>
    </aside>
  );
}

function HeaderButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick?: () => void }) {
  return (
    <Tooltip label={label}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="grid size-8 place-items-center rounded-md text-text-muted transition-colors hover:bg-black/[0.05] hover:text-text"
      >
        <Icon className="size-4" strokeWidth={2} />
      </button>
    </Tooltip>
  );
}

/** Before any chat: the agent, a greeting and what to hand it, then a few suggestions as buttons (display only). */
function Empty() {
  const e = t.empty;
  return (
    <div className={`${COLUMN} my-auto py-10`}>
      <span className="grid size-11 place-items-center rounded-xl bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_4px_12px_-4px_rgb(0_0_0/0.12)]">
        <img src={agentLogo} alt="" className="size-6" />
      </span>
      <h3 className="a2a-title mt-5 text-[24px] font-normal leading-tight tracking-[-0.015em] text-text">{e.title}</h3>
      <p className="mt-2 max-w-[520px] text-pretty text-[14px] leading-[1.55] text-text-muted">{e.body}</p>

      <p className="mt-8 text-[12px] font-medium text-text-muted">{e.suggestionsLabel}</p>
      <ul className="mt-2.5 flex flex-wrap gap-2">
        {e.suggestions.map((s) => (
          <li key={s}>
            <button
              type="button"
              className="flex h-9 items-center rounded-[10px] bg-white px-3.5 text-[13.5px] font-medium text-text shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_2px_rgb(0_0_0/0.05)] transition-[background-color,box-shadow] hover:bg-[#f7f7f8] hover:shadow-[0_0_0_1px_rgb(0_0_0/0.16),0_1px_2px_rgb(0_0_0/0.05)] active:bg-[#f0f0f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0176d3]"
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The prompt box: what the chat's about (removable), the field, then Add, Mention, Dictate and Send. Typing works; nothing sends yet. */
function PromptBox() {
  const c = t.composer;
  const [text, setText] = useState("");
  const [context, setContext] = useState(true);
  return (
    <div className="rounded-2xl bg-white p-2 shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_2px_4px_rgb(0_0_0/0.03),0_12px_28px_-10px_rgb(0_0_0/0.14)] focus-within:shadow-[0_0_0_1px_rgb(0_0_0/0.22),0_2px_4px_rgb(0_0_0/0.03),0_12px_28px_-10px_rgb(0_0_0/0.14)]">
      {context && (
        <span className="ml-1 mt-1 inline-flex h-6 items-center gap-1.5 rounded-md bg-[#e8f3fd] pl-2 pr-1 text-[12px] font-medium text-text">
          <Store className="size-3.5 text-[#0176d3]" strokeWidth={2} />
          {c.context}
          <button
            type="button"
            aria-label={c.removeContext}
            onClick={() => setContext(false)}
            className="grid size-4 place-items-center rounded text-text-muted hover:bg-black/[0.06] hover:text-text"
          >
            <X className="size-3" strokeWidth={2.25} />
          </button>
        </span>
      )}
      <textarea
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label={c.placeholder}
        placeholder={c.placeholder}
        className="block w-full resize-none bg-transparent px-2 pt-2 text-[14.5px] leading-[1.5] text-text outline-none placeholder:text-text-muted"
      />
      <div className="mt-1 flex items-center gap-0.5">
        <BoxButton icon={Plus} label={c.add} />
        <BoxButton icon={AtSign} label={c.mention} />
        <span className="flex-1" />
        <BoxButton icon={Mic} label={c.dictate} />
        <button
          type="button"
          aria-label={c.send}
          disabled={!text.trim()}
          className="ml-1 grid size-8 place-items-center rounded-lg bg-[#1d1d1f] text-white transition-opacity disabled:opacity-20"
        >
          <ArrowUp className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function BoxButton({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <Tooltip label={label}>
      <button
        type="button"
        aria-label={label}
        className="grid size-8 place-items-center rounded-lg text-text-muted transition-colors hover:bg-black/[0.05] hover:text-text"
      >
        <Icon className="size-[17px]" strokeWidth={2} />
      </button>
    </Tooltip>
  );
}
