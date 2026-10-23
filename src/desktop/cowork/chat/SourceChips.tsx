import { AppLogo } from "./AppLogo";
import type { Source } from "./types";

/**
 * SourceChips — where an answer came from (decision 41, Somnath's favorite):
 * small pills with the app's logo and the record or object they name.
 */
export function SourceChips({ sources }: { sources: Source[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {sources.map((s) => (
        <span
          key={`${s.app}:${s.label}`}
          className="flex h-6 items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-surface px-2 text-[12px] text-text-muted"
        >
          <AppLogo app={s.app} className="size-3.5" />
          {s.label}
        </span>
      ))}
    </div>
  );
}
