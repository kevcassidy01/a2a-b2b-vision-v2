/** True if a key press lands in a field that has text in it, so a card's
 *  ↵ / Esc shortcuts leave it alone. An empty field doesn't count: the in-chat
 *  prompt box keeps focus after a send, and ↵ should still reach the card.
 *  Cards listen in the capture phase, so this sees the box before Enter sends
 *  and clears it (otherwise one Enter would send the message and press the card). */
export function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") return (el as HTMLInputElement).value.trim() !== "";
  return el.isContentEditable && (el.textContent ?? "").trim() !== "";
}
