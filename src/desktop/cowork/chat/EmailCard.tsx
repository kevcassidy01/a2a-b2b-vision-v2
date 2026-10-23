import { Check, ExternalLink, Send } from "lucide-react";
import { copy } from "../../../copy/copy";
import { AppLogo } from "./AppLogo";
import type { CoworkBlock } from "./types";

type Email = Extract<CoworkBlock, { type: "email" }>;

/**
 * EmailCard — a Gmail reply Claude drafted, framed like ActionCard (the
 * browser chat's MCP card): Gmail and the thread in a bordered header, To and
 * Subject, the body, then Send and "Open in Gmail" in the footer. Once sent,
 * Send gives way to a quiet "✓ Sent".
 */
export function EmailCard({ email, onSend }: { email: Email; onSend: () => void }) {
  const t = copy.desktop.cowork.chat.email;
  const sent = email.status === "sent";

  return (
    <div className="animate-fade-in overflow-hidden rounded-xl border border-prompt-border bg-surface">
      <div className="flex h-[52px] items-center gap-2.5 border-b border-border px-4">
        <AppLogo app="gmail" className="size-5" />
        <span className="text-[16px] font-medium text-text">{email.header ?? t.header}</span>
        <span className="ml-auto truncate text-[13px] text-text-subtle">{email.thread}</span>
      </div>

      <dl className="border-b border-border px-4 py-2 text-[14px]">
        <div className="flex gap-3 py-1">
          <dt className="w-16 shrink-0 text-text-subtle">{t.to}</dt>
          <dd className="min-w-0 text-text">{email.to}</dd>
        </div>
        <div className="flex gap-3 py-1">
          <dt className="w-16 shrink-0 text-text-subtle">{t.subject}</dt>
          <dd className="min-w-0 text-text">{email.subject}</dd>
        </div>
      </dl>

      <p className="whitespace-pre-line px-4 py-4 text-[15px] leading-relaxed text-text">{email.body}</p>

      <div className="flex h-[52px] items-center justify-between border-t border-border px-4">
        {email.status === "sample" ? (
          <span className="text-[13px] text-text-subtle">{email.note}</span>
        ) : sent ? (
          <span className="animate-fade-in flex items-center gap-1.5 text-[14px] text-text-muted">
            <Check className="size-4" strokeWidth={2} />
            {t.sent}
          </span>
        ) : (
          <button
            type="button"
            onClick={onSend}
            className="flex h-8 items-center gap-2 rounded-md bg-text px-3.5 text-[14px] font-medium text-white transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:opacity-85"
          >
            <Send className="size-3.5" strokeWidth={2} />
            {t.send}
          </button>
        )}
        <button type="button" className="flex items-center gap-1.5 text-[13px] text-app-link">
          {t.openInGmail}
          <ExternalLink className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
