import { Share, X, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { copy } from "../copy/copy";
import { Tooltip } from "./Tooltip";

const t = copy.a2a.commandCenter.frame;

/**
 * ArtifactFrame — the host app's full-screen bar around an MCP app (the
 * Command Center): its title on the left, actions with icon and label toward
 * the right (Share), and Close, icon only, at the far right. Host chrome, not the
 * app's content, so it stays plain and light.
 */
export function ArtifactFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-11 shrink-0 items-center gap-1 border-b border-border pl-4 pr-2">
        <h2 className="mr-auto truncate text-[13.5px] font-medium text-text">
          {t.title}
        </h2>
        <BarAction icon={Share} label={t.share} />
        <span className="mx-1 h-4 w-px bg-border" aria-hidden />
        <Tooltip label={t.close}>
          <button
            type="button"
            aria-label={t.close}
            className="a2a-control grid size-7 place-items-center rounded-md text-text-muted hover:text-text"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </Tooltip>
      </header>
      <div className="relative min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

function BarAction({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button
      type="button"
      className="flex h-7 items-center gap-1.5 rounded-md pl-1.5 pr-2 text-[13px] text-text-muted transition-colors duration-[var(--dur-fast)] hover:bg-black/[0.05] hover:text-text"
    >
      <Icon className="size-3.5" strokeWidth={2} />
      {label}
    </button>
  );
}
