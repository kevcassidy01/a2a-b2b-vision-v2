import { InlineCard } from "./InlineCard";
import { InlineCarousel } from "./InlineCarousel";
import { Floating } from "./Floating";
import { SlotContent } from "./SlotContent";
import { useExport } from "./ExportShare";
import { useChat } from "./store";
import type { SlotBlock } from "./types";

/**
 * Slot — renders an MCP app in the transcript, dispatching on display mode.
 *
 * `inline-card`, `inline-carousel`, and `floating` render inline; `fullscreen`
 * is not a mode but the expanded view of an `expandable` card / floating block,
 * opened via the store (`openFullscreen`) and painted by `FullScreenApp`.
 */
export function Slot({ block }: { block: SlotBlock }) {
  const openFullscreen = useChat((s) => s.openFullscreen);
  // Only cards and floating slots expand; carousels never do.
  const expand =
    block.expandable && block.mode !== "inline-carousel"
      ? () => openFullscreen(block)
      : undefined;

  const onExport = useExport(block);
  const content = block.view ? <SlotContent view={block.view} /> : undefined;

  switch (block.mode) {
    case "inline-card":
      return (
        <InlineCard app={block.app} footer={block.footer} onExpand={expand} onExport={onExport} skeletonMs={block.skeletonMs}>
          {content}
        </InlineCard>
      );
    case "inline-carousel":
      return <InlineCarousel app={block.app} count={block.count} tiles={block.tiles} />;
    case "floating":
      return (
        <Floating app={block.app} onExpand={expand} onExport={onExport}>
          {content}
        </Floating>
      );
  }
}
