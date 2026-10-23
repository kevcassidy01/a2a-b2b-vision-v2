import { useEffect, useRef, useState } from "react";
import { Download, Share, X } from "lucide-react";
import type { FileRef, ReportPage } from "./types";
import { useChat } from "./store";
import { KpiTiles, Section } from "./viz/InsightView";
import { Tooltip } from "../shell/Tooltip";

/**
 * FilePreview — the side panel a created file opens in (claude.ai's artifact
 * panel). The chat narrows beside it; Esc or the X closes it.
 *
 * Header: file title + "· PDF", download and share buttons (no-ops) and close. Body: the
 * report's pages as letter-ratio white sheets on the grey stage — a cover
 * (title, scope, KPI strip, "In this report" contents), then one page per view
 * Aaron picked: a running header, a numbered heading, the takeaway as a lead
 * line, its key points, then the view's own sections, and a footer with the
 * page number. Static, like a printed PDF: nothing on a sheet hovers or
 * clicks. A "Page N / M" pill tracks the page in view.
 */
export function FilePreview() {
  const file = useChat((s) => s.preview);
  const close = useChat((s) => s.closePreview);
  const scroller = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!file) return;
    setPage(1);
    scroller.current?.scrollTo({ top: 0 });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [file, close]);

  if (!file) return null;

  // The page in view: the last sheet whose top has passed a third of the way
  // down the viewport.
  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const line = el.getBoundingClientRect().top + el.clientHeight / 3;
    const sheets = [...el.querySelectorAll<HTMLElement>("[data-page]")];
    const n = sheets.filter((s) => s.getBoundingClientRect().top <= line).length;
    setPage(Math.max(n, 1));
  };

  return (
    <aside className="flex w-[47%] min-w-[480px] shrink-0 flex-col border-l border-border bg-surface">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border pl-5 pr-3">
        <span className="min-w-0 truncate text-[16px] font-medium text-text">{file.title}</span>
        <span className="shrink-0 text-[16px] text-text-muted">· {file.format}</span>
        <div className="ml-auto flex items-center gap-0.5">
          <Tooltip label="Download" side="bottom">
            <button
              type="button"
              aria-label="Download"
              className="grid size-8 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text"
            >
              <Download className="size-[18px]" strokeWidth={2} />
            </button>
          </Tooltip>
          <Tooltip label="Share" side="bottom">
            <button
              type="button"
              aria-label="Share"
              className="grid size-8 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text"
            >
              <Share className="size-[18px]" strokeWidth={2} />
            </button>
          </Tooltip>
          <Tooltip label="Close" side="bottom" align="end">
            <button
              type="button"
              aria-label="Close preview"
              onClick={close}
              className="grid size-8 place-items-center rounded-md text-text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated hover:text-text"
            >
              <X className="size-[18px]" strokeWidth={2} />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div ref={scroller} onScroll={onScroll} className="absolute inset-0 overflow-y-auto bg-elevated">
          <div className="mx-auto flex max-w-[720px] flex-col gap-6 px-6 py-6 pb-20">
            {file.pages.map((p, i) => (
              <Sheet key={i} file={file} page={p} n={i + 1} />
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
          <span className="whitespace-nowrap rounded-full bg-text/80 px-3 py-1 text-label font-medium tabular-nums text-white">
            Page {page} / {file.pages.length}
          </span>
        </div>
      </div>
    </aside>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

/** One letter-ratio page. `pointer-events-none` keeps it static: the charts'
 *  hover annotations never show in the PDF. */
function Sheet({ file, page, n }: { file: FileRef; page: ReportPage; n: number }) {
  const total = file.pages.length;
  const scope = file.pages[0]?.cover?.scope;
  return (
    <div
      data-page={n}
      className="pointer-events-none flex aspect-[8.5/11] w-full select-none flex-col rounded-sm bg-surface px-10 pt-8 pb-6 shadow-sm"
    >
      {page.cover ? (
        <>
          <img src="/salesforce.svg" alt="" aria-hidden className="h-7 w-fit" />
          <div className="mt-16 space-y-2">
            <p className="text-label font-medium uppercase tracking-[0.08em] text-text-muted">Report</p>
            <h1 className="text-page font-semibold leading-tight text-text">{page.cover.title}</h1>
            <p className="text-body text-text-muted">{page.cover.scope}</p>
          </div>
          <div className="mt-10">
            <KpiTiles items={page.cover.kpis} />
          </div>
          <div className="mt-10">
            <p className="border-b border-border pb-2 text-label font-medium uppercase tracking-[0.08em] text-text-muted">
              In this report
            </p>
            <ol>
              {file.pages.slice(1).map((p, i) => (
                <li key={i} className="flex items-baseline gap-4 border-b border-border py-2.5 text-body">
                  <span className="w-6 shrink-0 tabular-nums text-text-muted">{pad(i + 1)}</span>
                  <span className="min-w-0 flex-1 text-text">{p.title}</span>
                  <span className="tabular-nums text-text-muted">{i + 2}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2 text-label text-text-muted">
            <span className="truncate">{file.title}</span>
            {scope && <span className="shrink-0">{scope}</span>}
          </div>
          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <p className="text-label font-medium tabular-nums text-text-muted">{pad(n - 1)}</p>
              {page.title && <h2 className="text-group font-semibold text-text">{page.title}</h2>}
              {page.takeaway && <p className="text-[17px] leading-7 text-text">{page.takeaway}</p>}
            </div>
            {!!page.points?.length && (
              <ul className="space-y-1.5 border-l-2 border-border pl-4">
                {page.points.map((pt) => (
                  <li key={pt} className="text-body text-text-muted">
                    {pt}
                  </li>
                ))}
              </ul>
            )}
            {page.sections?.map((s, i) => (
              <div key={i} className="border-t border-border pt-6">
                <Section section={s} />
              </div>
            ))}
          </div>
        </>
      )}
      <div className="mt-auto flex items-baseline justify-between gap-4 pt-8 text-label text-text-muted">
        <span>Prepared with Claude · Salesforce Commerce</span>
        <span className="tabular-nums">
          Page {n} of {total}
        </span>
      </div>
    </div>
  );
}
