import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, RefObject } from "react";
import { availableSkills, defaultSkillCount, findSkill } from "./skills";
import type { Skill } from "./skills";
import { useChat } from "../chat/store";
import { copy } from "../copy/copy";

/** Fixed width of the slash-skill menu (px) — used to clamp its left offset so
 *  it never spills past the box's right edge. Mirrors the `w-[280px]` in SkillMenu. */
const MENU_WIDTH = 280;

/** Slash-menu state handed to `PromptEditor` / `SkillMenu`. Positions are in px,
 *  relative to the editor wrapper. */
export interface SlashState {
  open: boolean;
  /** Flattened, filtered skills in canonical order (defaults, then Salesforce). */
  items: Skill[];
  /** Count of leading `items` that are default — where the separator goes. */
  defaultCount: number;
  /** Highlighted row (keyboard / hover). */
  active: number;
  /** Menu left offset, clamped to the wrapper. */
  left: number;
  /** Ghost "Type to filter" hint position — only while the query is empty. */
  hint: { left: number; top: number } | null;
}

const CLOSED: SlashState = { open: false, items: [], defaultCount: 0, active: 0, left: 0, hint: null };

/** Where a live `/query` sits in the DOM — captured on each detect so a later
 *  select/space can replace exactly that range with a chunk. */
interface SlashCtx {
  node: Node;
  slashStart: number;
  caretOffset: number;
  query: string;
}

/** Chunk styling — literal Tailwind classes so the scanner picks them up
 *  (the element is built imperatively, not as JSX). */
const CHUNK_BASE =
  "mx-0.5 inline rounded px-1.5 py-0.5 align-baseline font-mono text-[14px] text-text";

function makeChunk(skill: Skill): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = `${CHUNK_BASE} ${skill.kind === "salesforce" ? "bg-skill-chunk-sf" : "bg-skill-chunk"}`;
  span.contentEditable = "false";
  span.dataset.skill = skill.id;
  span.dataset.kind = skill.kind;
  span.textContent = `/${skill.id}`;
  return span;
}

/**
 * useComposer — shared guts for both prompt boxes.
 *
 * The new-chat `Composer` and the in-chat `InChatComposer` look different
 * (stacked vs single-row) but share one input: a **contenteditable** editor
 * (not a `<textarea>`) so authored **slash skills** can render inline as atomic
 * chunks. Both boxes render `<PromptEditor>` with the returned `editor` bundle
 * and use `hasText` / `send` / `commerce` for the rest of their chrome.
 *
 * Slash skills: typing `/` at the start or after a space opens a menu of
 * available skills (default set always; the Salesforce set once the Commerce
 * connector is on). The query after `/` filters it; ↑/↓ + Enter or a click
 * inserts the skill as a grey/blue chunk that deletes as one unit. Typing a
 * full skill name and pressing space auto-converts it too.
 *
 * `onSend` receives the trimmed message text (chunks serialize as `/id`); the
 * editor clears after. It's optional — omit it and the box is self-contained.
 */
export function useComposer(onSend?: (text: string) => void) {
  const [text, setText] = useState("");
  // Salesforce Commerce connector — shown as a chip beside "+" and gates the
  // Salesforce skill section. State lives in the chat store (not here) so it's
  // shared across every composer instance (empty-state, in-chat, full-screen)
  // and survives the empty → chat view swap. Always on in this build (connecting
  // is a one-time setup step elsewhere), so there's no setter to plumb through.
  const commerce = useChat((s) => s.commerce);
  const [slash, setSlash] = useState<SlashState>(CLOSED);
  const draft = useChat((s) => s.draft);
  const clearDraft = useChat((s) => s.clearDraft);

  const editorRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const slashCtxRef = useRef<SlashCtx | null>(null);

  const hasText = text.trim().length > 0;

  const closeSlash = () => {
    slashCtxRef.current = null;
    setSlash((s) => (s.open ? CLOSED : s));
  };

  // Read the editor's plain text into React state (chunks serialize as `/id`
  // via their textContent). Also cleans up a stray <br> the browser may leave
  // in an otherwise-empty editor so the CSS placeholder shows.
  const syncText = () => {
    const editor = editorRef.current;
    const t = editor?.textContent ?? "";
    if (editor && t === "" && editor.childNodes.length) editor.innerHTML = "";
    setText(t);
  };

  // Is the caret sitting in a fresh `/query` token? Returns the context if so.
  const detectSlash = (): SlashCtx | null => {
    const sel = window.getSelection();
    if (!sel || !sel.isCollapsed || !editorRef.current) return null;
    const node = sel.anchorNode;
    if (!node || node.nodeType !== Node.TEXT_NODE || !editorRef.current.contains(node)) {
      return null;
    }
    const before = (node.textContent ?? "").slice(0, sel.anchorOffset);
    const m = /(^|\s)\/([^\s/]*)$/.exec(before);
    if (!m) return null;
    return {
      node,
      slashStart: m.index + m[1].length,
      caretOffset: sel.anchorOffset,
      query: m[2],
    };
  };

  // Recompute the slash menu against the current caret + connector state.
  const refreshSlash = () => {
    const ctx = detectSlash();
    if (!ctx) {
      closeSlash();
      return;
    }
    const q = ctx.query.toLowerCase();
    const all = availableSkills(commerce);
    const items = q ? all.filter((s) => s.id.includes(q)) : all;
    if (items.length === 0) {
      closeSlash();
      return;
    }
    slashCtxRef.current = ctx;

    // Position: rect of the "/" char, relative to the wrapper.
    const wrap = wrapperRef.current;
    const range = document.createRange();
    range.setStart(ctx.node, ctx.slashStart);
    range.setEnd(ctx.node, ctx.slashStart + 1);
    const r = range.getBoundingClientRect();
    const w = wrap?.getBoundingClientRect();
    const rawLeft = w ? r.left - w.left : 0;
    const maxLeft = w ? Math.max(0, w.width - MENU_WIDTH) : 0;
    const left = Math.min(Math.max(0, rawLeft), maxLeft);
    const defaults = items.filter((s) => s.kind === "default").length;

    setSlash({
      open: true,
      items,
      defaultCount: Math.min(defaults, defaultSkillCount()),
      active: 0,
      left,
      hint: q === "" && w ? { left: r.right - w.left, top: r.top - w.top } : null,
    });
  };

  // Replace the live `/query` with a skill chunk + trailing space; caret lands
  // after the space so the user keeps typing their prompt.
  const insertSkill = (skill: Skill) => {
    const ctx = slashCtxRef.current;
    const editor = editorRef.current;
    if (!ctx || !editor) return;
    const range = document.createRange();
    range.setStart(ctx.node, ctx.slashStart);
    range.setEnd(ctx.node, ctx.caretOffset);
    range.deleteContents();
    const space = document.createTextNode(" ");
    range.insertNode(space);
    range.insertNode(makeChunk(skill));

    const sel = window.getSelection();
    const after = document.createRange();
    after.setStart(space, space.length);
    after.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(after);
    editor.focus();

    closeSlash();
    syncText();
  };

  // Backspace with the caret right after a chunk removes the whole chunk.
  const deleteChunkBeforeCaret = (): boolean => {
    const sel = window.getSelection();
    if (!sel || !sel.isCollapsed) return false;
    const { anchorNode: node, anchorOffset: offset } = sel;
    if (!node) return false;
    let target: ChildNode | null = null;
    if (node.nodeType === Node.TEXT_NODE && offset === 0) {
      target = (node as ChildNode).previousSibling;
    } else if (node === editorRef.current) {
      target = node.childNodes[offset - 1] ?? null;
    }
    if (target && target.nodeType === Node.ELEMENT_NODE && (target as HTMLElement).dataset?.skill) {
      target.remove();
      return true;
    }
    return false;
  };

  const send = () => {
    const editor = editorRef.current;
    const t = (editor?.textContent ?? "").trim();
    if (!t) return;
    onSend?.(t);
    if (editor) {
      editor.innerHTML = "";
      // Keep focus in the box so the next message can be typed straight away
      // (like any chat), even while the response is generating.
      editor.focus();
    }
    setText("");
    closeSlash();
  };

  // Replace the box's content with a prompt: a leading `/skill` becomes a
  // chunk, the rest stays plain text; caret lands at the end so Enter sends it.
  const writePrompt = (t: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.innerHTML = "";
    const m = /^\/(\S+)\s*(.*)$/.exec(t);
    const skill = m ? findSkill(m[1], commerce) : undefined;
    if (skill) editor.append(makeChunk(skill), document.createTextNode(` ${m![2]}`));
    else editor.append(document.createTextNode(t));
    editor.focus();
    const sel = window.getSelection();
    const end = document.createRange();
    end.selectNodeContents(editor);
    end.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(end);
    closeSlash();
    syncText();
  };

  // Prefill from an in-app button (e.g. a row's "Reorder" → "/reorder MIXOZ-…").
  // Consumed once.
  useEffect(() => {
    if (!draft || !editorRef.current) return;
    clearDraft();
    writePrompt(draft.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const onInput = () => {
    syncText();
    refreshSlash();
  };

  const onMouseUp = () => refreshSlash();

  const onBlur = () => closeSlash();

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (slash.open) {
      const n = slash.items.length;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlash((s) => ({ ...s, active: (s.active + 1) % n }));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlash((s) => ({ ...s, active: (s.active - 1 + n) % n }));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertSkill(slash.items[slash.active]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        closeSlash();
        return;
      }
      if (e.key === " ") {
        // Full skill name typed + space → convert even without picking a row.
        const match = slashCtxRef.current ? findSkill(slashCtxRef.current.query, commerce) : undefined;
        if (match) {
          e.preventDefault();
          insertSkill(match);
        } else {
          closeSlash(); // token now has a space; let the space through
        }
        return;
      }
    }

    if (e.key === "Backspace" && deleteChunkBeforeCaret()) {
      e.preventDefault();
      syncText();
      refreshSlash();
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Replace the box's content with plain text, caret at the end (dictation's Done).
  const fill = (t: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.textContent = t;
    editor.focus();
    const end = document.createRange();
    end.selectNodeContents(editor);
    end.collapse(false);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(end);
    syncText();
  };

  return {
    commerce,
    hasText,
    send,
    fill,
    /** As `fill`, but a leading `/skill` shows as its chunk (the browser
     *  chat's dictation). */
    fillPrompt: writePrompt,
    editor: {
      ref: editorRef as RefObject<HTMLDivElement>,
      wrapperRef: wrapperRef as RefObject<HTMLDivElement>,
      onInput,
      onKeyDown,
      onMouseUp,
      onBlur,
      slash,
      filterPlaceholder: copy.shell.composer.skills.filterPlaceholder,
      menuLabel: copy.shell.composer.skills.menuLabel,
      onSelect: (i: number) => insertSkill(slash.items[i]),
      onHover: (i: number) => setSlash((s) => ({ ...s, active: i })),
    },
  };
}

export type ComposerEditor = ReturnType<typeof useComposer>["editor"];
