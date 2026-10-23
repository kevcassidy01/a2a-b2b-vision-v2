export type Fact = { label: string; value: string };

/**
 * FactsTable — key-value details in the live app's tool-row list
 * (docs/references/cowork/: "Loaded a skill  morning"): a bordered box, one
 * row per fact, muted label then the value, hairlines between. Read-only, so
 * no chevrons.
 */
export function FactsTable({ facts }: { facts: Fact[] }) {
  return (
    <dl className="overflow-hidden rounded-lg border border-border">
      {facts.map((f, i) => (
        <div key={f.label} className={`flex gap-4 px-4 py-2.5 text-[14px] leading-snug ${i > 0 ? "border-t border-border" : ""}`}>
          <dt className="w-36 shrink-0 text-text-subtle">{f.label}</dt>
          <dd className="min-w-0 text-text">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
