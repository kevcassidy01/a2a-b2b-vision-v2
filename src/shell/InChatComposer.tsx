import { useEffect, useState } from "react";
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
 * InChatComposer — the in-chat prompt box (bottom-anchored, thinner variant).
 *
 * The counterpart to the new-chat `Composer`. It shares the same guts — the
 * "+" add menu (with the connector chip) and the model picker — but differs in
 * shape and layout:
 *   - a single-row box, not the stacked textarea + footer (same `rounded-lg`
 *     corner radius as the new-chat box). Once the text wraps past one line
 *     the box **expands**: the text takes the full width on top and the "+",
 *     connector chip and send drop to a row along the bottom, with the box
 *     hugging its content. It stays expanded until the box is emptied (so it
 *     never flips back and forth while the line is near the edge);
 *   - one right-side control: the **same arrow send button as the new-chat
 *     box** — grey while empty, clay once there's text;
 *   - the disclaimer + model label sit **below** the pill in a meta row.
 *
 * Because it's anchored to the bottom, its menus open **upward** (`openUp`).
 * The model label in the meta row is the same `ModelMenu` — clicking it opens
 * the picker, exactly like the new-chat box.
 *
 * `onSend` fires when a non-empty message is submitted (Enter or the send
 * button), receiving the message text. It's optional — omit it and the box is
 * self-contained (the send button still toggles grey → clay as you type, so all
 * states stay visible).
 *
 * `placeholder` overrides the default prompt text (e.g. full-screen uses an
 * app-contextual "Ask {app}"). `hideMeta` drops the disclaimer + model row below
 * the pill, for surfaces that want just the box (the full-screen prompt bar).
 *
 * `dictation` is a scripted line for a mic beside send (Cowork's sessions), as
 * in the new-chat `Composer`: a waveform and Cancel / Done take the send
 * button's place while the words come in. Without it there's no mic.
 * `chatDictation` is the browser chat's line instead: its own pace (no
 * pauses), and a leading `/skill` shows as its chunk.
 */
/** Cancel / Done while recording: bordered squares, as in the new-chat box. */
const DICT_BTN =
  "grid size-8 shrink-0 place-items-center rounded-md border border-prompt-border bg-surface text-text transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated";

export function InChatComposer({
  onSend,
  placeholder,
  hideMeta = false,
  hideConnector = false,
  dictation,
  chatDictation,
}: {
  onSend?: (text: string) => void;
  placeholder?: string;
  hideMeta?: boolean;
  /** Drops the Salesforce chip (Cowork's in-chat box has none). */
  hideConnector?: boolean;
  dictation?: string;
  /** The browser chat's mic line (its own steady-paced dictation). */
  chatDictation?: string;
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

  // Focus the box as soon as it appears (the greeting → chat swap), so typing
  // continues seamlessly after the first send.
  useEffect(() => {
    editor.ref.current?.focus();
  }, [editor.ref]);

  // Expanded layout — on as soon as the text runs past one line (24px line
  // height), off again only once the box is empty.
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const el = editor.ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (el.offsetHeight > 30) setExpanded(true);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [editor.ref]);
  useEffect(() => {
    if (!hasText) setExpanded(false);
  }, [hasText]);

  return (
    <div>
      {/* The box — single row: "+" · text · ↵, or (expanded) text on top with
          the controls along the bottom. Same rounded-lg radius as the new-chat
          box; soft halo; border firms up a touch on focus. */}
      <div className={`flex flex-wrap gap-1 rounded-lg ${expanded ? "items-end gap-y-2" : "items-center"} border border-prompt-border bg-surface px-2.5 py-2.5 shadow-prompt transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-within:border-prompt-border-focus`}>
        {/* "+" add menu — opens upward from the bottom-anchored box. */}
        <AddMenu commerce={commerce} openUp />
        {/* Connected-connector chip — always on (connecting is a one-time setup
            step elsewhere). Static: logo + "Salesforce", no border, no disconnect. */}
        {commerce && !hideConnector && (
          <div className="flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap px-1 text-[14px] text-text">
            <img src="/salesforce.svg" alt="" aria-hidden className="h-4 w-auto" />
            {c.add.connectorChip}
          </div>
        )}

        {/* Text — a contenteditable that hosts inline slash-skill chunks.
            Enter sends; Shift+Enter = newline. Expanded, it moves to its own
            full-width row on top (`order-first`). */}
        <PromptEditor
          editor={editor}
          placeholder={placeholder ?? c.inChat.placeholder}
          wrapperClassName={`relative min-w-0 ${expanded ? "order-first basis-full pt-1" : "flex-1"}`}
          className="max-h-[160px] overflow-y-auto px-2 text-[16px] leading-normal text-text"
        />

        {dictate.listening ? (
          <div className={`flex shrink-0 items-center gap-2 ${expanded ? "ml-auto" : ""}`}>
            <Waveform speaking={dictate.speaking} />
            <Tooltip label={c.dictateCancel} side="top">
              <button
                type="button"
                aria-label={c.dictateCancel}
                onClick={() => {
                  dictate.stop();
                  fill("");
                }}
                className={DICT_BTN}
              >
                <X className="size-[18px]" strokeWidth={2} />
              </button>
            </Tooltip>
            <Tooltip label={c.dictateDone} side="top">
              <button type="button" aria-label={c.dictateDone} onClick={dictate.stop} className={DICT_BTN}>
                <Check className="size-[18px]" strokeWidth={2} />
              </button>
            </Tooltip>
          </div>
        ) : (
          <div className={`flex shrink-0 items-center gap-1 ${expanded ? "ml-auto" : ""}`}>
            {(dictation || chatDictation) && (
              <Tooltip label={c.dictate} side="top">
                <button
                  type="button"
                  aria-label={c.dictate}
                  onClick={dictate.start}
                  className="grid size-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text"
                >
                  <Mic className="size-[18px]" strokeWidth={2} />
                </button>
              </Tooltip>
            )}
            {/* Send — same arrow button as the new-chat box: grey while empty,
                clay once there's text. */}
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

      {/* Meta row — below the pill. Disclaimer left; model picker right (same
          ModelMenu as the new-chat box, opening upward). Hidden when `hideMeta`
          (the full-screen prompt bar wants just the box). */}
      {!hideMeta && (
        <div className="mt-1.5 flex items-center justify-between px-2 text-[14px]">
          <span className="text-text-subtle">{c.inChat.disclaimer}</span>
          <ModelMenu openUp />
        </div>
      )}
    </div>
  );
}
