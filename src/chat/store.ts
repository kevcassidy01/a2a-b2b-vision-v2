import { createContext, useContext } from "react";
import { create } from "zustand";
import type { Block, FileRef, Message, ScriptedResponse, SlotBlock } from "./types";
import { DEFAULT_EXPERIENCE, EXPERIENCES, EXPERIENCE_ORDER, type ExperienceId } from "./experiences";
import { writesMs } from "./WriteTimeline";

/**
 * useChat — the conversation store.
 *
 * Single source of truth for the transcript. Sending a message pushes a user
 * bubble, walks the scripted thinking steps (updating `thinkingLabel` beside
 * the animated dots), then drops the assistant response in one snappy beat.
 *
 * State is kept minimal on purpose; `started` is derived (messages.length > 0)
 * so the shell can swap the empty/greeting view for the chat view instantly.
 * Each journey keeps its own chat (`chats`), so switching away and back finds
 * it as it was left; a reply in flight finishes into the chat it began in.
 * Memory only: a refresh starts every journey from scratch. Pending step
 * timers are tracked module-side, per journey, so `reset()` (the "New"
 * button) can cancel that journey's in-flight response cleanly.
 */

const timers: Partial<Record<ExperienceId, ReturnType<typeof setTimeout>[]>> = {};
let counter = 0;
const uid = () => `m${counter++}`;
const clearTimers = (j: ExperienceId) => {
  timers[j]?.forEach(clearTimeout);
  timers[j] = [];
};
const later = (j: ExperienceId, fn: () => void, ms: number) => (timers[j] ??= []).push(setTimeout(fn, ms));

/** One journey's chat. */
export interface Chat {
  messages: Message[];
  /** True while the thinking sequence is playing (send is ignored meanwhile). */
  thinking: boolean;
  /** Current thinking phrase shown beside the dots. */
  thinkingLabel: string;
}

const EMPTY: Chat = { messages: [], thinking: false, thinkingLabel: "" };

interface ChatState {
  /** Every journey's chat, by id. Message ids are unique across them. */
  chats: Record<ExperienceId, Chat>;
  /** The slot currently expanded to full-screen, or null. Set by the expand
   *  affordance on an `expandable` card / floating block; cleared on close or
   *  on the next send (a prompt from full-screen returns to the transcript). */
  expanded: SlotBlock | null;
  /** The file open in the side preview panel (chat narrows beside it), or null. */
  preview: FileRef | null;
  openPreview: (file: FileRef) => void;
  closePreview: () => void;
  /** Salesforce Commerce connector on/off. Lives here (not in the composer) so
   *  the chip + skill gating stay consistent across every composer instance
   *  (empty-state, in-chat, full-screen) and survive the empty → chat swap.
   *  Defaults ON and stays on through `reset()` — connecting the connector is a
   *  one-time setup step on another screen, so the demo shell always shows it. */
  commerce: boolean;
  setCommerce: (on: boolean) => void;
  /** The journey currently armed. Drives which experience's script `send` /
   *  `runAction` dispatch to, and which sidenav chat reads as active. The
   *  sidenav's three fixed chats switch this via `selectExperience`. */
  activeExperience: ExperienceId;
  /** Switch journeys: arm `id`, its chat as it was left (any reply in flight
   *  elsewhere carries on). Closes the full-screen app and file preview. The
   *  connector stays on. */
  selectExperience: (id: ExperienceId) => void;
  /** Post a user message and play its beat. `plays` is the full prompt a
   *  chip stands for (the bubble shows `prompt`, the chip's short label).
   *  `typed` marks a prompt from the box, not a chip or a card's pick. */
  send: (prompt: string, plays?: string, typed?: boolean) => void;
  /** A live chip that does an in-app button's job: a bubble with its label,
   *  then the button's beat. The card it belongs to reads `fired` to show
   *  itself done, as if its own button had been clicked. */
  chipAction: (label: string, key: string, msg: string) => void;
  /** In-app actions a chip fired, by the message whose card they belong to
   *  and the action's name (its key before any `|`). */
  fired: { msg: string; name: string }[];
  /** Allow / Deny on a message's permission card, by message id. */
  permits: Record<string, "allowed" | "denied">;
  /** Decide a permission card: Allow plays its `allow` action (no user
   *  bubble, as an in-app button); Deny replies with its `denied` line. */
  permit: (msg: string, allow: boolean, block: Extract<Block, { type: "permission" }>) => void;
  /** Text an in-app button asked to PREFILL into the prompt box (not send), e.g.
   *  "/reorder MIXOZ-…". The mounted composer consumes it (writes it into the
   *  editor, a leading `/skill` as a chunk) and clears it via `clearDraft`.
   *  `nonce` makes a repeat prefill of the same text still fire. */
  draft: { text: string; nonce: number } | null;
  prefill: (text: string) => void;
  /** The last text a card prefilled (kept after the box takes it): sent
   *  unchanged, it's the card's pick, so the mic doesn't step past a line. */
  prefilled: string | null;
  clearDraft: () => void;
  /** Play a scripted beat triggered by an in-app button (no user bubble). */
  runAction: (key: string) => void;
  /** Tell the experience about a silent in-app change (no message plays). */
  notify: (key: string) => void;
  /** "New": start the armed journey from scratch. The others keep theirs. */
  reset: () => void;
  openFullscreen: (block: SlotBlock) => void;
  closeFullscreen: () => void;
}

/** The pause after a write timeline plays out, the spark pulsing, before
 *  the reply it leads to. */
const WRITE_PAUSE_MS = 2000;

/** A beat with `writes` plays as two parts: the writes (after its thinking,
 *  under its tools and skill), then, once the records are in and a pause, the
 *  rest of the beat. */
function splitWrites(script: ScriptedResponse): ScriptedResponse {
  const { writes, response, then, suggestions, ...first } = script;
  if (!writes?.length) return script;
  return {
    ...first,
    response: [{ type: "writes", steps: writes }],
    then: { thinking: [{ label: "", delay: writesMs(writes) + WRITE_PAUSE_MS }], response, then, suggestions },
  };
}

/**
 * play — walk a scripted response's thinking steps (updating `thinkingLabel`
 * beside the pulsing spark), then drop its blocks into the transcript in one
 * beat. A `then` part keeps thinking and appends to the same message. Shared by `send` (with a user bubble) and `runAction` (without one);
 * both flip `thinking` on before calling this.
 */
type Set = (partial: Partial<ChatState> | ((s: ChatState) => Partial<ChatState>)) => void;

/** Update journey `j`'s chat. */
const patch = (set: Set, j: ExperienceId, fn: (c: Chat) => Partial<Chat>) =>
  set((s) => ({ chats: { ...s.chats, [j]: { ...s.chats[j], ...fn(s.chats[j]) } } }));

function play(set: Set, j: ExperienceId, script: ScriptedResponse, into?: string) {
  script = splitWrites(script);
  let elapsed = 0;
  for (const step of script.thinking) {
    later(j, () => patch(set, j, () => ({ thinkingLabel: step.label })), elapsed);
    elapsed += step.delay;
  }
  later(
    j,
    () => {
      const next = script.then;
      const id = into ?? uid();
      patch(set, j, (s) => ({
        messages: into
          ? // A follow-on part: its tools and blocks append to the same message.
            s.messages.map((m) =>
              m.id === into
                ? {
                    ...m,
                    blocks: [
                      ...m.blocks,
                      ...(script.tools?.length ? [{ type: "tools" as const, tools: script.tools, skill: script.skill }] : []),
                      ...script.response,
                    ],
                    pending: !!next,
                    suggestions: next ? undefined : script.suggestions,
                  }
                : m,
            )
          : [
              ...s.messages,
              {
                id,
                role: "assistant",
                blocks: script.response,
                skill: script.skill,
                tools: script.tools,
                activity: script.activity,
                pending: !!next,
                suggestions: next ? undefined : script.suggestions,
              },
            ],
        thinking: !!next,
        thinkingLabel: "",
      }));
      if (next) play(set, j, next, id);
    },
    elapsed,
  );
}

export const useChat = create<ChatState>((set, get) => {
  /** The armed journey and its chat. */
  const armed = () => {
    const j = get().activeExperience;
    return { j, chat: get().chats[j] };
  };
  /** Post a user bubble into journey `j`'s chat and start thinking. */
  const ask = (j: ExperienceId, text: string, said?: string, typed?: boolean) =>
    patch(set, j, (c) => ({
      messages: [...c.messages, { id: uid(), role: "user", blocks: [{ type: "text", content: text }], said, typed }],
      thinking: true,
      thinkingLabel: "",
    }));
  /** Start thinking in journey `j`'s chat with no user bubble. */
  const think = (j: ExperienceId) => patch(set, j, () => ({ thinking: true, thinkingLabel: "" }));

  return {
    chats: Object.fromEntries(EXPERIENCE_ORDER.map((id) => [id, EMPTY])) as Record<ExperienceId, Chat>,
    expanded: null,
    preview: null,
    commerce: true,
    activeExperience: DEFAULT_EXPERIENCE,
    draft: null,
    prefilled: null,
    fired: [],
    permits: {},

    setCommerce: (on) => set({ commerce: on }),

    selectExperience: (id) => {
      // Arm the journey; its chat is as it was left (empty → the greeting).
      // Connector stays on; it's a one-time setup elsewhere.
      set({ activeExperience: id, expanded: null, preview: null, draft: null });
    },

    send: (prompt, plays, typed) => {
      const text = prompt.trim();
      const { j, chat } = armed();
      if (!text || chat.thinking) return;

      // User bubble in immediately; thinking begins. An open full-screen app
      // closes so the reply lands back in the transcript.
      const script = EXPERIENCES[j].getResponse(plays ?? text);
      const picked = get().prefilled;
      ask(j, text, plays, typed && !(picked && words(picked) === words(text)));
      if (picked) set({ prefilled: null });
      set({ expanded: null });
      play(set, j, script);
    },
    notify: (key) => EXPERIENCES[get().activeExperience].onEvent?.(key),

    prefill: (text) => set({ draft: { text, nonce: Date.now() }, prefilled: text, expanded: null }),
    clearDraft: () => set({ draft: null }),

    runAction: (key) => {
      // In-app action (a button inside a slot). Plays the next scripted beat as
      // an assistant message with NO user bubble — the app did the thing, per the
      // app-vs-chat split. Ignored while a response is already generating.
      const { j, chat } = armed();
      if (chat.thinking) return;
      const script = EXPERIENCES[j].getAction(key);
      if (!script) return;
      think(j);
      set({ expanded: null });
      play(set, j, script);
    },

    chipAction: (label, key, msg) => {
      const { j, chat } = armed();
      if (chat.thinking) return;
      const script = EXPERIENCES[j].getAction(key);
      if (!script) return;
      ask(j, label);
      set((s) => ({ fired: [...s.fired, { msg, name: key.split("|")[0] }], expanded: null }));
      play(set, j, script);
    },

    permit: (msg, allow, block) => {
      const { j, chat } = armed();
      if (chat.thinking || get().permits[msg]) return;
      const script: ScriptedResponse | undefined = allow
        ? EXPERIENCES[j].getAction(block.allow)
        : { thinking: [{ label: "", delay: 600 }], response: [{ type: "text", content: block.denied }] };
      set((s) => ({ permits: { ...s.permits, [msg]: allow ? "allowed" : "denied" } }));
      if (!script) return;
      think(j);
      set({ expanded: null });
      play(set, j, script);
    },

    reset: () => {
      const { j } = armed();
      clearTimers(j);
      EXPERIENCES[j].reset?.();
      // Connector stays on — it's a one-time setup elsewhere, not per-chat.
      set((s) => ({ chats: { ...s.chats, [j]: EMPTY }, expanded: null, preview: null, draft: null }));
    },

    openFullscreen: (block) => set({ expanded: block }),
    closeFullscreen: () => set({ expanded: null }),
    openPreview: (file) => set({ preview: file }),
    closePreview: () => set({ preview: null }),
  };
});

/** The journey a component's chat belongs to: set by its `ChatStage` (a
 *  hidden journey's chat stays mounted), else the armed one. */
export const JourneyContext = createContext<ExperienceId | null>(null);

export function useJourney(): ExperienceId {
  const own = useContext(JourneyContext);
  const armed = useChat((s) => s.activeExperience);
  return own ?? armed;
}

/** Whether this component's journey is generating a reply. */
export function useBusy() {
  const j = useJourney();
  return useChat((s) => s.chats[j].thinking);
}

/** The armed journey's chat. */
export const useActiveChat = () => useChat((s) => s.chats[s.activeExperience]);

/** A prompt reduced to its words for matching against a dictation line: no
 *  leading `/skill`, no spacing or punctuation, lower case. What the browser's
 *  prompt box hands back can differ from the line in exactly those (the
 *  skill chunk, non-breaking spaces, curly quotes). */
const words = (s: string) =>
  s
    .replace(/^\s*\/\S+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

/** What the browser chat's mic dictates next, given a journey's chat: the
 *  line after the last one sent (the first line before any). A line listed
 *  twice is offered twice. None once they're all used, or when a journey has
 *  none. */
export function nextDictation(lines: string[], messages: Message[]) {
  const want = lines.map(words);
  // Walk what's been sent: each one used moves past the first line it
  // matches from there, so a line can come up twice. A prompt from the box
  // that matches none (typed in its own words) still takes the next step; a
  // card's pick or a chip that matches none (Alpine) doesn't.
  let next = 0;
  for (const m of messages) {
    if (m.role !== "user") continue;
    const i = want.indexOf(words(m.said ?? m.blocks.map((b) => (b.type === "text" ? b.content : "")).join("")), next);
    if (i >= 0) next = i + 1;
    else if (m.typed && next < lines.length) next += 1;
  }
  return lines[next];
}

/** The armed journey's next mic line. */
export const useNextDictation = () =>
  useChat((s) => nextDictation(EXPERIENCES[s.activeExperience].dictations ?? [], s.chats[s.activeExperience].messages));

/** Whether a chip already fired the in-app action `name` for message `msg`
 *  (so that message's card shows itself done). */
export const useFired = (msg: string | undefined, name: string | undefined) =>
  useChat((s) => !!msg && !!name && s.fired.some((f) => f.msg === msg && f.name === name));
