import type { ReactNode } from "react";

/**
 * Flag — a small, simplified national flag (16×11) for the currency picker:
 * the shapes that make each one recognisable, no fine detail. A hairline keeps
 * the white in them from melting into the page.
 */
export function Flag({ code }: { code: string }) {
  return (
    <span
      aria-hidden
      className="relative inline-block h-[11px] w-4 shrink-0 overflow-hidden rounded-[2.5px] after:absolute after:inset-0 after:rounded-[2.5px] after:shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.18)]"
    >
      <svg
        viewBox="0 0 48 33"
        preserveAspectRatio="none"
        className="block size-full"
      >
        {FLAGS[code]}
      </svg>
    </span>
  );
}

const FLAGS: Record<string, ReactNode> = {
  INR: (
    <>
      <rect width="48" height="11" fill="#FF9933" />
      <rect y="11" width="48" height="11" fill="#fff" />
      <rect y="22" width="48" height="11" fill="#138808" />
      <circle
        cx="24"
        cy="16.5"
        r="3.6"
        fill="none"
        stroke="#000080"
        strokeWidth="1.2"
      />
      <circle cx="24" cy="16.5" r="0.9" fill="#000080" />
    </>
  ),
  USD: (
    <>
      <rect width="48" height="33" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect
          key={i}
          y={(i * 33) / 13}
          width="48"
          height={33 / 13}
          fill="#B22234"
        />
      ))}
      <rect width="21" height={(7 * 33) / 13} fill="#3C3B6E" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <circle
            key={`${r}${c}`}
            cx={3 + c * 5}
            cy={3 + r * 5.6}
            r="0.9"
            fill="#fff"
          />
        )),
      )}
    </>
  ),
  GBP: (
    <>
      <rect width="48" height="33" fill="#012169" />
      <path d="M0 0 48 33M48 0 0 33" stroke="#fff" strokeWidth="7" />
      <path d="M0 0 48 33M48 0 0 33" stroke="#C8102E" strokeWidth="2.4" />
      <path d="M24 0v33M0 16.5h48" stroke="#fff" strokeWidth="10" />
      <path d="M24 0v33M0 16.5h48" stroke="#C8102E" strokeWidth="6" />
    </>
  ),
};
