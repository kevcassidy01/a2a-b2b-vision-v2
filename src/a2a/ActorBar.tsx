import { copy } from "../copy/copy";

const t = copy.a2a.actors;

/** The four parties, in the order of the chain: person → agent ⇄ agent ← person. */
export const ACTORS = ["john", "johnAgent", "alexAgent", "alex"] as const;
export type Actor = (typeof ACTORS)[number];

/**
 * ActorBar — a thin dark bar under the stage, in four equal parts, so the
 * audience sees who is acting at each point of the story. All parts stay dull;
 * the acting one lights up. Two can be lit at once (a handoff between agents).
 */
export function ActorBar({ active }: { active: ReadonlySet<Actor> }) {
  return (
    <div
      role="group"
      aria-label={t.label}
      className="a2a-actor-bar grid h-8 shrink-0 grid-cols-4"
    >
      {ACTORS.map((a) => {
        const on = active.has(a);
        return (
          <div
            key={a}
            className="a2a-actor flex items-center justify-center gap-2 text-[13px] font-medium"
            data-actor={a}
            data-on={on || undefined}
          >
            <span aria-hidden className="a2a-actor-dot size-1.5 rounded-full" />
            {t[a]}
            {on && <span className="sr-only">, {t.active}</span>}
          </div>
        );
      })}
    </div>
  );
}
