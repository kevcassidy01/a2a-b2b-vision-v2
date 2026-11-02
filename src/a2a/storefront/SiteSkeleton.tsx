import { Bone } from "../Skeleton";

/**
 * SiteSkeleton — Fizz Partners before it's painted, the first time the phone
 * opens it: the header's logo, Log in and menu, the hero slide (the next one
 * peeking in), its dots, then a heading and a row of tiles. Safari's progress
 * line runs over it.
 */
export function SiteSkeleton() {
  return (
    <div aria-hidden className="min-h-full bg-white">
      <div className="flex h-14 items-center gap-3 px-4 pt-[54px] [box-sizing:content-box]">
        <Bone className="mr-auto h-7 w-28 rounded-[8px]" />
        <Bone className="h-9 w-[68px] rounded-[12px]" />
        <Bone className="size-7 rounded-[8px]" />
      </div>
      <div className="flex gap-3 overflow-hidden px-4 pt-4">
        <div className="flex h-[480px] w-[calc(100%-32px)] shrink-0 flex-col rounded-[32px] bg-[#f6f6f8] p-6">
          <Bone className="h-3.5 w-16 rounded" />
          <Bone className="mt-3 h-8 w-[85%] rounded-[8px]" />
          <Bone className="mt-2 h-8 w-[70%] rounded-[8px]" />
          <Bone className="mt-2 h-8 w-[55%] rounded-[8px]" />
          <Bone className="mt-auto h-12 w-36 rounded-[16px]" />
        </div>
        <div className="h-[480px] w-[calc(100%-32px)] shrink-0 rounded-[32px] bg-[#f6f6f8]" />
      </div>
      <div className="mt-4 flex justify-center gap-1.5">
        <Bone className="h-2 w-6 rounded-full" />
        <Bone className="size-2 rounded-full" />
        <Bone className="size-2 rounded-full" />
      </div>
      <Bone className="mx-auto mt-12 h-8 w-48 rounded-[8px]" />
      <div className="mt-6 flex gap-3 overflow-hidden px-4">
        {[0, 1, 2].map((i) => (
          <Bone key={i} className="h-[120px] w-[96px] shrink-0 rounded-[24px]" />
        ))}
      </div>
    </div>
  );
}
