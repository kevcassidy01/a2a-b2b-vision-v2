import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import agentLogo from "../../assets/a2a/agent-logo.png";
import { copy } from "../../copy/copy";
import { Tooltip } from "../Tooltip";

const t = copy.a2a.commandCenter.agent;

/**
 * AgentDrawer — the seller agent's side panel, opened by the Agent button. It
 * slides in from the Command Center's right edge, over the page (no dimming,
 * so the figures stay readable beside it). Escape or the close button shuts
 * it. No content yet: just its header.
 */
export function AgentDrawer({
  open,
  onClose,
}: {
  open: boolean;
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
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border pl-5 pr-3">
        <img src={agentLogo} alt="" className="size-[18px] shrink-0" />
        <h2 className="mr-auto text-[15px] font-semibold text-text">{t.label}</h2>
        <Tooltip label={t.close}>
          <button
            type="button"
            aria-label={t.close}
            onClick={onClose}
            className="a2a-control grid size-8 place-items-center rounded-md text-text-muted hover:text-text"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </Tooltip>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto" />
    </aside>
  );
}
