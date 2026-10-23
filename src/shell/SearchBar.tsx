import { Search } from "lucide-react";
import { copy } from "../copy/copy";

/**
 * SearchBar — the sidenav search field (magnifier + "Search" placeholder).
 *
 * A real input so it feels live (focus, typing), but presentational — there's
 * no search behavior behind it yet. Border darkens on focus.
 */
export function SearchBar() {
  return (
    <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-2 text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-within:border-prompt-border">
      <Search className="size-4 shrink-0" strokeWidth={2} />
      <input
        type="text"
        placeholder={copy.shell.searchPlaceholder}
        className="w-full bg-transparent text-ui text-text outline-none placeholder:text-text-muted"
      />
    </div>
  );
}
