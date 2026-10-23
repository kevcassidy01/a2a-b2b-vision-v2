import { Check } from "lucide-react";
import { FactsTable } from "./FactsTable";
import type { CoworkBlock } from "./types";

type Answers = Extract<CoworkBlock, { type: "answers" }>;

/**
 * AnswersCard — what Claude read from Aaron's answer to the setup template:
 * a check and a title, then the key-value table (FactsTable), as on the
 * agent card's facts.
 */
export function AnswersCard({ block }: { block: Answers }) {
  return (
    <div className="animate-fade-in space-y-3">
      <p className="flex items-center gap-2 text-[15px] text-text">
        <span className="grid size-5 place-items-center rounded-full bg-text text-white">
          <Check className="size-3" strokeWidth={2.5} />
        </span>
        {block.title}
      </p>
      <FactsTable facts={block.facts} />
    </div>
  );
}
