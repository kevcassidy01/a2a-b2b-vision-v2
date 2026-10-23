/**
 * Separator — a one-pixel hairline rule, painted with the --color-border token.
 *
 * Shell chrome primitive. Vertical by default (e.g. the sidenav ↔ main
 * divider); pass orientation="horizontal" for a row rule between sections.
 */
type SeparatorProps = {
  orientation?: "vertical" | "horizontal";
  className?: string;
};

export function Separator({
  orientation = "vertical",
  className = "",
}: SeparatorProps) {
  const shape =
    orientation === "vertical" ? "w-px self-stretch" : "h-px w-full";

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={`shrink-0 bg-border ${shape} ${className}`}
    />
  );
}
