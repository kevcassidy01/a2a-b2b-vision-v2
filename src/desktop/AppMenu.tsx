import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { copy } from "../copy/copy";

/**
 * AppMenu — the Claude app menu dropped from the menu bar, matched to Somnath's
 * screenshots: dark glass panel, hairline separators, dimmed shortcuts, and the
 * macOS blue highlight on hover. Items are inert (no click behaviour yet).
 */
export function AppMenu() {
  const groups = copy.desktop.menuBar.appMenu;
  return (
    <div
      role="menu"
      className="absolute left-0 top-[calc(100%+5px)] w-[216px] rounded-[11px] bg-[#2f2f31]/[0.93] p-[5px] text-[13px] font-normal shadow-[0_0_0_0.5px_rgba(0,0,0,0.6),inset_0_0_0_0.5px_rgba(255,255,255,0.22),0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
    >
      {groups.map((group, i) => (
        <Fragment key={i}>
          {i > 0 && <div role="separator" className="mx-2.5 my-[5px] h-px bg-white/15" />}
          {group.map((item) => (
            <div
              key={item.label}
              role="menuitem"
              className="group/item flex h-[22px] cursor-default items-center justify-between rounded-[5px] px-2.5 hover:bg-[#3d7bd9]"
            >
              <span>{item.label}</span>
              {item.shortcut && <span className="text-white/40 group-hover/item:text-white">{item.shortcut}</span>}
              {item.submenu && <ChevronRight className="size-3.5 text-white/80" strokeWidth={2.5} />}
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  );
}
