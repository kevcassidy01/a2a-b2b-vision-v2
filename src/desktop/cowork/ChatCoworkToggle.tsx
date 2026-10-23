import { copy } from "../../copy/copy";

export type CoworkMode = "chat" | "cowork";
const MODES: CoworkMode[] = ["chat", "cowork"];

/**
 * ChatCoworkToggle — the Chat | Cowork switch in the desktop prompt box, beside
 * "+" (Somnath's screenshot of the live app; Anthropic's Cowork guide: "choose
 * Cowork, then describe your task").
 *
 * Same track and thumb as the other segmented controls, but text-only and
 * sized to each label, so the selected segment carries the thumb itself rather
 * than a sliding pill. Presentational for now: switching changes nothing else.
 */
export function ChatCoworkToggle({ mode, onChange }: { mode: CoworkMode; onChange: (mode: CoworkMode) => void }) {
  const t = copy.desktop.cowork.composer;
  return (
    <div role="tablist" aria-label={t.mode} className="ml-2 inline-flex shrink-0 items-center gap-0.5 rounded-md bg-track p-0.5">
      {MODES.map((id) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`h-6 rounded-sm px-2.5 text-ui transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
              active ? "bg-track-thumb text-text shadow-sm" : "text-text-muted hover:text-text"
            }`}
          >
            {t[id]}
          </button>
        );
      })}
    </div>
  );
}
