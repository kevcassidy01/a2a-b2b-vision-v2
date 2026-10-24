import type { LucideIcon } from "lucide-react";

/** A card's action, icon + label, with a little less padding on the icon's side so the pair looks centred. */
export function ActionButton({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button
      type="button"
      className="a2a-control flex h-8 items-center gap-1.5 rounded-md pl-2.5 pr-3 text-[13.5px] font-medium text-text"
    >
      <Icon className="size-4 text-text-muted" strokeWidth={2} />
      {label}
    </button>
  );
}
