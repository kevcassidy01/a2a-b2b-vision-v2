import { useEffect, useRef } from "react";
import { InChatComposer } from "../shell/InChatComposer";
import { MessageBubble } from "./MessageBubble";
import { ThinkingIndicator } from "./ThinkingIndicator";
import type { ExperienceId } from "./experiences";
import { JourneyContext, useChat, useNextDictation } from "./store";

/**
 * ChatStage — the conversation view (replaces the empty/greeting state once a
 * chat starts). It fills its (positioned, clipped) parent: the transcript is
 * one scroll container that fills the whole region and **scrolls behind both
 * safe areas** — the top bar (title / Share, owned by the shell) and the
 * bottom prompt box, which floats over the transcript and stays put.
 *
 * The transcript's `pt`/`pb` reserve room so the first and last messages can
 * still scroll fully clear of those safe areas. Reads the transcript from
 * `useChat`; sending is delegated up via `onSend` so the shell can run its
 * sidebar-title bookkeeping. Auto-scrolls to the newest message / thinking.
 *
 * One per journey: the shell keeps each started chat mounted and shows only
 * the armed one, so cards keep their clicks, timelines don't replay and the
 * scroll stays where it was. Only the shown one has a prompt box.
 */
export function ChatStage({
  journey,
  shown,
  onSend,
}: {
  journey: ExperienceId;
  shown: boolean;
  onSend: (text: string) => void;
}) {
  const messages = useChat((s) => s.chats[journey].messages);
  const thinking = useChat((s) => s.chats[journey].thinking);
  const dictation = useNextDictation();
  // Id of the newest assistant message — its tool-call timeline shows expanded;
  // earlier ones collapse theirs. Found from the end so it's O(1) in practice.
  const latestAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;
  const thinkingLabel = useChat((s) => s.chats[journey].thinkingLabel);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Whether the view is "stuck" to the bottom. We only auto-scroll while stuck,
  // so scrolling up to read the thinking states (or an earlier answer) is never
  // yanked back down. Scrolling back near the bottom re-sticks.
  const stuckRef = useRef(true);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    // Distance from the bottom; a generous threshold so small overshoots still
    // count as "at the bottom" (the floating prompt box covers the last ~160px).
    stuckRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
  };

  // A new message (user prompt or assistant reply) always re-sticks and scrolls.
  useEffect(() => {
    stuckRef.current = true;
    scrollToBottom();
  }, [messages]);

  // While thinking, follow the newest step only if the user hasn't scrolled away.
  useEffect(() => {
    if (stuckRef.current) scrollToBottom();
  }, [thinking, thinkingLabel]);

  return (
    <JourneyContext.Provider value={journey}>
      {/* Transcript — the only scroll container; fills the region. Column
          matches the prompt-box width. `pt` clears the top safe area; `pb`
          reserves room so the last message (or thinking indicator) clears the
          floating prompt box instead of hiding behind it. */}
      <div ref={scrollRef} onScroll={onScroll} className="absolute inset-0 overflow-y-auto">
        <div className="mx-auto flex max-w-[820px] flex-col gap-8 px-4 pb-40 pt-20">
          {messages.map((m, i) => (
            <MessageBubble
              key={m.id}
              message={m}
              latest={m.id === latestAssistantId}
              end={i === messages.length - 1 && !thinking}
            />
          ))}
          {thinking && <ThinkingIndicator label={thinkingLabel} />}
        </div>
      </div>

      {/* Bottom safe area — the in-chat prompt box floats here; the transcript
          scrolls behind it. A gradient fades content out (mirrors the header),
          with ~20px of solid clearance above the box (the `from-40%` stop) so
          the last line never butts right against the prompt bar. */}
      {shown && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-6 pt-12 bg-gradient-to-t from-bg from-40% to-transparent">
          <div className="pointer-events-auto mx-auto max-w-[820px]">
            <InChatComposer onSend={onSend} chatDictation={dictation} />
          </div>
        </div>
      )}
    </JourneyContext.Provider>
  );
}
