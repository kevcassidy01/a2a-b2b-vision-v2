import { Search } from "lucide-react";

/** The search field in the Scheduled and Agents pages' headers. Inert for now. */
export function PageSearch({ placeholder }: { placeholder: string }) {
  return (
    <label className="flex h-8 w-[220px] items-center gap-2 rounded-md border border-prompt-border bg-surface px-2.5 text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-within:border-prompt-border-focus">
      <Search className="size-4 shrink-0" strokeWidth={2} />
      <input
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-text outline-none placeholder:text-text-subtle"
      />
    </label>
  );
}
