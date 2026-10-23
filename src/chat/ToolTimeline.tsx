import { useEffect, useState } from "react";
import { ChevronRight, Wrench } from "lucide-react";
import type { ToolCall } from "./types";

/**
 * ToolTimeline — the Headless 360 MCP tool calls shown atop a response.
 *
 * Rendered above the skill chip (tool calls come first — they're what produced
 * the answer). Styled to match the on-response skill chip: low-key, text-muted,
 * mono chunks on the `skill-chunk` wash — but the glyph is a wrench, and the
 * calls stack vertically as a timeline, joined by a hairline through the nodes.
 *
 * `latest` controls disclosure (Somnath's spec):
 *   - latest response → tools are shown expanded, no toggle (don't collapse).
 *   - earlier responses → tools collapse into one "Headless 360 MCP tools" row
 *     with a chevron that expands the same timeline.
 *
 * 1–3 tools per response (not enforced here; authored in the scripts).
 */
export function ToolTimeline({ tools, latest }: { tools: ToolCall[]; latest: boolean }) {
  // Earlier responses start collapsed; the latest is always open (no toggle).
  const [open, setOpen] = useState(latest);
  // Once a newer response lands, this one stops being latest: fold its tools
  // back into the collapsed row (the chevron can still reopen them).
  useEffect(() => {
    if (!latest) setOpen(false);
  }, [latest]);

  if (!tools.length) return null;

  const timeline = (
    <ol className="relative mt-2 flex flex-col gap-2">
      {/* The connecting hairline — runs through the nodes between first + last. */}
      {tools.length > 1 && (
        <span aria-hidden className="absolute left-[7.5px] top-2.5 bottom-2.5 w-px bg-border" />
      )}
      {tools.map((t, i) => (
        <li key={i} className="relative flex items-center gap-1.5 text-[13px] text-text-muted">
          {/* Node — a wrench on the `skill-chunk` wash; opaque so it masks the line. */}
          <span className="grid size-4 shrink-0 place-items-center rounded-full bg-skill-chunk text-text-muted">
            <Wrench className="size-2.5" strokeWidth={2} />
          </span>
          <span>Called</span>
          <code className="rounded-md bg-skill-chunk px-1.5 py-0.5 font-mono text-[12px] text-text-muted">
            {t.name}
          </code>
          {t.target && <span className="truncate font-mono text-[12px] text-text-subtle">{t.target}</span>}
        </li>
      ))}
    </ol>
  );

  // Latest response: show the timeline outright.
  if (latest) return timeline;

  // Earlier response: a collapsed summary row that expands to the same timeline.
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[13px] text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-text"
      >
        <Wrench className="size-3.5 shrink-0" strokeWidth={2} />
        <span>Headless 360 MCP tools</span>
        <span className="text-text-subtle">{tools.length}</span>
        <ChevronRight
          className={`size-3.5 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] ${open ? "rotate-90" : ""}`}
          strokeWidth={2}
        />
      </button>
      {open && timeline}
    </div>
  );
}
