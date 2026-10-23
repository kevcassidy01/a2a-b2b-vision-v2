import { SkillMenu } from "./SkillMenu";
import type { ComposerEditor } from "./useComposer";

/**
 * PromptEditor — the shared input surface for both prompt boxes.
 *
 * A single-line-feeling `contenteditable` (not a `<textarea>`) so authored
 * slash-skills can live inline as atomic chunks. It grows with its content
 * naturally. Wired entirely by the `editor` bundle from `useComposer`:
 *   - the empty state shows `placeholder` via a CSS `:empty` pseudo;
 *   - while a `/query` is open + empty, a "Type to filter" ghost hint sits
 *     right after the slash;
 *   - the `SkillMenu` floats above, tracking the caret.
 *
 * `className` styles the editable surface (padding / type / max-height per box);
 * `wrapperClassName` styles the positioning context the menu anchors to.
 */
export function PromptEditor({
  editor,
  placeholder,
  className = "",
  wrapperClassName = "relative",
}: {
  editor: ComposerEditor;
  placeholder: string;
  className?: string;
  wrapperClassName?: string;
}) {
  const { slash, filterPlaceholder } = editor;

  return (
    <div ref={editor.wrapperRef} className={wrapperClassName}>
      <div
        ref={editor.ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        spellCheck={false}
        data-placeholder={placeholder}
        onInput={editor.onInput}
        onKeyDown={editor.onKeyDown}
        onMouseUp={editor.onMouseUp}
        onBlur={editor.onBlur}
        className={`whitespace-pre-wrap break-words outline-none empty:before:pointer-events-none empty:before:text-text-muted empty:before:content-[attr(data-placeholder)] ${className}`}
      />

      {/* "Type to filter" ghost — shown right after the "/" while the query is
          empty. Positioned at the caret; never intercepts input. */}
      {slash.hint && (
        <span
          aria-hidden
          style={{ left: slash.hint.left, top: slash.hint.top }}
          className="pointer-events-none absolute text-[16px] leading-relaxed text-text-muted"
        >
          {filterPlaceholder}
        </span>
      )}

      {slash.open && <SkillMenu editor={editor} />}
    </div>
  );
}
