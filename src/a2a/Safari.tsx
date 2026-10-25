import { ChevronLeft, Ellipsis, PanelTop, RotateCw, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { copy } from "../copy/copy";
import { demoTimeout } from "./demoClock";

const t = copy.a2a.phone.safari;

/**
 * Safari — iOS 26 Safari's compact layout around the page on the phone, with
 * the OS in dark mode. The page scrolls full height, under a bottom bar of
 * dark Liquid Glass: Back on the
 * left, the address pill in the middle, More on the right. A scroll either
 * way shrinks the bar to a small capsule with just the domain; back at the
 * top of the page, or tapping the capsule, brings it back.
 * While a page loads the bar comes back up, Reload turns to Stop and a blue
 * progress line runs along the foot of the address pill. `overlay` is the
 * page's own layers over it (a drawer, a sheet), still under the bar;
 * `compact` keeps the bar down to its capsule while one is up. `float` is a
 * page's floating button, bottom centre, just above the bar: it rides down with
 * the bar when it shrinks, and is told so by `data-collapsed`.
 */
export function Safari({
  children,
  pageKey,
  loading = false,
  onBack,
  overlay,
  compact = false,
  float,
}: {
  children: ReactNode;
  /** Which page is showing; a new one starts at the top. */
  pageKey?: string;
  loading?: boolean;
  onBack?: () => void;
  overlay?: ReactNode;
  compact?: boolean;
  float?: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [progress, setProgress] = useState<"idle" | "run" | "done">("idle");
  const last = useRef(0);

  // A load brings the bar up and runs the line; when it ends the line
  // fills, then fades.
  useEffect(() => {
    if (loading) {
      setCollapsed(false);
      setProgress("run");
      return;
    }
    setProgress((p) => (p === "run" ? "done" : p));
    return demoTimeout(() => setProgress((p) => (p === "done" ? "idle" : p)), 450);
  }, [loading]);

  useEffect(() => {
    last.current = 0;
  }, [pageKey]);

  // A scroll either way shrinks the bar; only the top of the page (or a tap
  // on the capsule) brings it back.
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const y = e.currentTarget.scrollTop;
    const moved = y !== last.current;
    last.current = y;
    if (y <= 0) setCollapsed(false);
    else if (moved) setCollapsed(true);
  };

  return (
    <>
      <div key={pageKey} onScroll={onScroll} className="a2a-no-scrollbar absolute inset-0 overflow-y-auto">
        {children}
        {/* Room at the end, so the page's last lines clear the bar. */}
        <div className="h-24" aria-hidden />
      </div>
      {float && (
        <div className="a2a-safari-float" data-collapsed={collapsed || compact || undefined}>
          {float}
        </div>
      )}
      {overlay}
      <div className="a2a-safari z-10" data-collapsed={collapsed || compact || undefined}>
        <GlassButton icon={ChevronLeft} label={t.back} side="left" onClick={onBack} />
        <div className="a2a-safari-address a2a-liquid-glass">
          {collapsed && !compact && (
            <button
              type="button"
              aria-label={t.expand}
              onClick={() => setCollapsed(false)}
              className="absolute inset-0 z-10"
            />
          )}
          <button type="button" aria-label={t.pageMenu} className="a2a-safari-inner grid size-9 place-items-center">
            <PanelTop className="size-[19px]" strokeWidth={2} />
          </button>
          <span className="a2a-safari-domain">{t.domain}</span>
          <button
            type="button"
            aria-label={loading ? t.stop : t.reload}
            className="a2a-safari-inner grid size-9 place-items-center"
          >
            {loading ? (
              <X className="size-[19px]" strokeWidth={2.25} />
            ) : (
              <RotateCw className="size-[17px]" strokeWidth={2.25} />
            )}
          </button>
          <span className="a2a-safari-progress" data-state={progress} aria-hidden />
        </div>
        <GlassButton icon={Ellipsis} label={t.more} side="right" />
      </div>
    </>
  );
}

function GlassButton({
  icon: Icon,
  label,
  side,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  side: "left" | "right";
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`a2a-safari-side a2a-liquid-glass ${side === "left" ? "left-4" : "right-4"}`}
    >
      <Icon className="size-[22px]" strokeWidth={2.25} />
    </button>
  );
}
