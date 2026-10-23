import { useEffect, type ReactNode } from "react";
import { ArrowUp, Check, Mic, X } from "lucide-react";
import { AddMenu } from "./AddMenu";
import { ModelMenu } from "./ModelMenu";
import { PromptEditor } from "./PromptEditor";
import { Tooltip } from "./Tooltip";
import { useComposer } from "./useComposer";
import { useDictation } from "./useDictation";
import { useChatDictation } from "../chat/useChatDictation";
import { Waveform } from "./Waveform";
import { copy } from "../copy/copy";

/**
 * Composer — the "new chat" / greeting prompt box (main-stage empty/home
 * state). This is the centered, full-size variant. A separate, minimal
 * "in-chat prompt box" (anchored to the bottom once a chat begins) will come
 * later; its menus will open upward via the menus' `openUp` prop.
 *
 * A white rounded card in two stacked sections:
 *   1. a growing textarea (placeholder "How can I help you today?"), and
 *   2. a bottom footer that stays put no matter how many lines are typed —
 *      it never touches the text. Footer: "+" add-menu on the left; model ·
 *      mic · send on the right.
 *
 * Since it's centered with room below, its menus open DOWNWARD (menus default
 * to `openUp={false}`). The send button activates (grey → clay) once there's
 * text; Enter sends too (Shift+Enter for a newline).
 *
 * `onSend` fires when a non-empty message is submitted (Enter or the button),
 * receiving the message text. The shell uses it to start the chat + commit a
 * titled row to the recents list (see App). It's optional — omit it and the
 * composer is fully self-contained.
 *
 * `chip` replaces the Salesforce connector chip beside "+" (the desktop app
 * puts its Chat | Cowork switch there). `attachments` sits above the text
 * (the desktop app's files dropped in from the desktop).
 *
 * `dictation` is a scripted prompt for the mic (the desktop app's flows). The
 * mic then opens the live app's recording state: a waveform and Cancel / Done
 * in place of model · mic · send, while the words come into the box as
 * ordinary text, a few at a time. Once the last word is in, the recording
 * ends by itself and keeps them, so send lights up (Done does the same, early);
 * Cancel clears them. Without it the mic does nothing, as before.
 * `chatDictation` is the browser chat's line instead: its own pace (no
 * pauses), and a leading `/skill` shows as its chunk.
 */
export function Composer({
  onSend,
  chip,
  dictation,
  chatDictation,
  attachments,
}: {
  onSend?: (text: string) => void;
  chip?: ReactNode;
  dictation?: string;
  /** The browser chat's mic line (its own steady-paced dictation). */
  chatDictation?: string;
  attachments?: ReactNode;
}) {
  const c = copy.shell.composer;
  const { commerce, hasText, send, fill, fillPrompt, editor } = useComposer(onSend);
  const deskDictate = useDictation(dictation);
  const chatDictate = useChatDictation(chatDictation);
  const dictate = chatDictation ? chatDictate : deskDictate;
  // The browser chat's lines can open with a /skill, shown as its chunk.
  const show = chatDictation ? fillPrompt : fill;

  // While recording, the box shows what's been "heard" so far.
  useEffect(() => {
    if (dictate.listening) show(dictate.transcript);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictate.listening, dictate.transcript]);

  // Once the recording ends, the box takes focus with the caret after the
  // words, so Enter sends them (not a card's ↵ shortcut on the page).
  useEffect(() => {
    const el = editor.ref.current;
    if (dictate.listening || !el || !(el.textContent ?? "").trim()) return;
    el.focus();
    window.getSelection()?.selectAllChildren(el);
    window.getSelection()?.collapseToEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictate.listening]);

  const iconBtn =
    "grid size-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text";

  // Cancel / Done while recording: bordered squares, as in the live app.
  const dictBtn =
    "grid size-8 shrink-0 place-items-center rounded-md border border-prompt-border bg-surface text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated";

  return (
    <div className="rounded-lg border border-prompt-border bg-surface shadow-prompt transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-within:border-prompt-border-focus">
      {/* Text section — a contenteditable that grows with content and hosts
          inline slash-skill chunks. Enter sends; Shift+Enter = newline. */}
      {attachments && <div className="px-4 pt-4">{attachments}</div>}
      <PromptEditor
        editor={editor}
        placeholder={c.placeholder}
        className="min-h-[4.75rem] w-full px-4 pt-4 text-[16px] leading-relaxed text-text"
      />

      {/* Footer — pinned below the text, always spaced off it (a touch more in
          the desktop app: CoworkWindow sets --composer-gap). */}
      <div className="flex items-center px-3 pb-3 pt-[var(--composer-gap,4px)]">
        {/* Add content ("+") — trigger + popover menu with submenus. */}
        <AddMenu commerce={commerce} />
        {/* Connected-connector chip — always on (connecting is a one-time setup
            step elsewhere). Static: logo + "Salesforce", no border, no disconnect. */}
        {chip ?? (commerce && (
          <div className="ml-2 flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap text-[14px] text-text">
            <img src="/salesforce.svg" alt="" aria-hidden className="h-4 w-auto" />
            {c.add.connectorChip}
          </div>
        ))}
        {dictate.listening ? (
          <div className="ml-auto flex items-center gap-2">
            <Waveform speaking={dictate.speaking} />
            <Tooltip label={c.dictateCancel} side="bottom">
              <button
                type="button"
                aria-label={c.dictateCancel}
                onClick={() => {
                  dictate.stop();
                  fill("");
                }}
                className={dictBtn}
              >
                <X className="size-[18px]" strokeWidth={2} />
              </button>
            </Tooltip>
            <Tooltip label={c.dictateDone} side="bottom">
              <button type="button" aria-label={c.dictateDone} onClick={dictate.stop} className={dictBtn}>
                <Check className="size-[18px]" strokeWidth={2} />
              </button>
            </Tooltip>
          </div>
        ) : (
          <div className="ml-auto flex items-center gap-2 text-[14px]">
            {/* Model picker — trigger + popover menu. */}
            <ModelMenu />
            {/* Below in the desktop app, as in the live one. */}
            <Tooltip label={c.dictate} side={dictation ? "bottom" : "top"}>
              <button type="button" aria-label={c.dictate} onClick={dictate.enabled ? dictate.start : undefined} className={iconBtn}>
                <Mic className="size-[18px]" strokeWidth={2} />
              </button>
            </Tooltip>
            {/* Send — grey while empty, clay once there's text. */}
            <button
              type="button"
              aria-label={c.send}
              disabled={!hasText}
              onClick={send}
              className={`grid size-8 shrink-0 place-items-center rounded-md transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
                hasText
                  ? "bg-accent text-accent-fg hover:bg-accent-hover"
                  : "bg-pressed text-text-subtle"
              }`}
            >
              <ArrowUp className="size-[18px]" strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
