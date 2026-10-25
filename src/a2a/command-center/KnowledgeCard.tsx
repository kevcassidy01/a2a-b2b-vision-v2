import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * KnowledgeCard — what an agent hands over in the Command Center's chat: a
 * quote, a cart, an order, a check (DESIGN_DECISIONS: knowledge cards). White
 * and outlined, in three parts, as Copilot's and other agents' result cards:
 * - a header: the object's icon, what it is and its id, who or what it's for,
 *   and its status at the right;
 * - a body, whatever the object needs (lines, facts), its own hierarchy;
 * - a footer on a faint grey: where it came from at the left, actions at the right.
 * The header and footer are optional; the body is the card.
 */
export function KnowledgeCard({
  icon: Icon,
  title,
  id,
  subtitle,
  status,
  footer,
  className = "",
  children,
}: {
  icon?: LucideIcon;
  title?: string;
  id?: string;
  subtitle?: string;
  status?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      className={`overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] ${className}`}
    >
      {title && (
        <header className="flex items-start gap-3.5 px-5 pb-4 pt-5">
          {Icon && (
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f3f3f5]">
              <Icon className="size-4 text-text" strokeWidth={1.75} />
            </span>
          )}
          <div className="mr-auto min-w-0">
            <h4 className="flex items-center gap-2 text-[15px] font-semibold leading-snug text-text">
              {title}
              {id && (
                <span className="rounded-md bg-[#f3f3f5] px-1.5 py-px font-mono text-[11px] font-medium tracking-[0.02em] text-text-muted">
                  {id}
                </span>
              )}
            </h4>
            {subtitle && <p className="mt-1 truncate text-[13px] text-text-muted">{subtitle}</p>}
          </div>
          {status}
        </header>
      )}
      <div className="px-5 pb-5">{children}</div>
      {footer && (
        <footer className="flex items-center gap-3 border-t border-black/[0.06] bg-[#fafafb] px-5 py-3">{footer}</footer>
      )}
    </article>
  );
}

/** A status at the header's right: an 8px chip with a coloured dot. */
export function CardStatus({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="flex h-6 shrink-0 items-center gap-1.5 rounded-lg bg-[#f3f3f5] px-2 text-[12px] font-medium text-text">
      <span aria-hidden className="size-1.5 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}

/** The Command Center's three kinds of action button: blue for the one thing to do, outlined for the rest, grey for the quietest. */
export const BUTTON = {
  primary: "bg-[#0176d3] text-white hover:bg-[#014486] disabled:bg-[#c9d7e6]",
  secondary: "bg-white text-text shadow-[0_0_0_1px_rgb(0_0_0/0.1)] hover:bg-[#f7f7f8] hover:shadow-[0_0_0_1px_rgb(0_0_0/0.16)]",
  tertiary: "bg-[#f0f0f2] text-text hover:bg-[#e6e6e9]",
} as const;

/**
 * A footer action, 6px corners like the Command Center's other buttons:
 * primary, secondary (the default) or tertiary. Footers lead with their
 * actions, on the left.
 */
export function CardAction({
  icon: Icon,
  kind = "secondary",
  disabled,
  title,
  onClick,
  children,
}: {
  icon?: LucideIcon;
  kind?: keyof typeof BUTTON;
  disabled?: boolean;
  title?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      onClick={onClick}
      className={`flex h-9 shrink-0 items-center gap-2 rounded-md px-3.5 text-[13.5px] font-medium transition-[background-color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0176d3] disabled:cursor-not-allowed ${BUTTON[kind]}`}
    >
      {children}
      {Icon && <Icon className={`size-4 ${kind === "primary" ? "" : "text-text-muted"}`} strokeWidth={2} />}
    </button>
  );
}
