/**
 * Rich — an agent's words with the facts that matter picked out: copy marks
 * them `**like this**`, and they render semibold in full ink (so they stand
 * out on muted text too). Nothing else is parsed.
 */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 ? (
          <strong key={i} className="font-semibold text-text">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}
