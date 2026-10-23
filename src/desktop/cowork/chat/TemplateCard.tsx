import type { CoworkBlock } from "./types";

type Template = Extract<CoworkBlock, { type: "template" }>;

/**
 * TemplateCard — /schedule's setup questions as a prompt to copy the shape
 * of: a bordered box, one line per answer (the label, then a greyed hint of
 * what goes there). Aaron dictates the whole answer; the template stays as it is.
 */
export function TemplateCard({ block }: { block: Template }) {
  return (
    <div className="animate-fade-in overflow-hidden rounded-xl border border-border bg-surface">
      <p className="border-b border-border px-4 py-2.5 text-[12px] font-medium uppercase tracking-wide text-text-subtle">
        {block.title}
      </p>
      <ol className="space-y-2 px-4 py-3.5 text-[15px] leading-relaxed">
        {block.lines.map((l) => (
          <li key={l.label}>
            <span className="text-text">{l.label}</span> <span className="text-text-subtle">{l.hint}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
