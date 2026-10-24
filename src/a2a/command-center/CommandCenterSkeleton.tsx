import type { ReactNode } from "react";
import { Bone } from "../Skeleton";

/**
 * CommandCenterSkeleton — the cards under the header while the Command Center
 * loads, in their real shapes: the section heading, Needs your approval, the
 * four metric tiles, orders by country and monthly revenue.
 */
export function CommandCenterSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-3">
      <Bone className="h-4 w-28 rounded" />
      <Bone className="h-3 w-[60%] rounded" />
      <Card className="h-[148px]">
        <Bone className="h-4 w-40 rounded" />
        <Bone className="mt-5 h-12 w-full rounded-md" />
      </Card>
      <div className="grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="a2a-card flex h-[118px] flex-col rounded-xl p-4">
            <Bone className="h-3 w-20 rounded" />
            <Bone className="mt-3 h-7 w-24 rounded-md" />
            <Bone className="mt-auto h-3 w-28 rounded" />
          </div>
        ))}
      </div>
      <Card className="h-[420px]">
        <Bone className="h-4 w-44 rounded" />
        <Bone className="mt-2 h-3 w-64 rounded" />
        <Bone className="mt-6 h-[300px] w-full rounded-lg" />
      </Card>
      <Card className="h-[320px]">
        <Bone className="h-4 w-36 rounded" />
        <div className="mt-8 flex h-[220px] items-end gap-3">
          {[46, 62, 54, 78, 70, 92].map((h, i) => (
            <Bone key={i} className="flex-1 rounded-t-[4px]" style={{ height: `${h}%` }} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`a2a-card flex flex-col rounded-xl p-5 ${className}`}>{children}</div>;
}
