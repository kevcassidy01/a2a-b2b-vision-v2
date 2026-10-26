/**
 * Rich — an agent's words with the facts that matter picked out: copy marks
 * them `**like this**`, and they render semibold in full ink (so they stand
 * out on muted text too). A blank line (`\n\n`) starts a new paragraph.
 * Nothing else is parsed.
 */
export function Rich({ text }: { text: string }) {
  const paras = text.split("\n\n");
  if (paras.length === 1) return <Marked text={text} />;
  return (
    <>
      {paras.map((p, i) => (
        <span key={i} className={`block ${i > 0 ? "mt-2.5" : ""}`}>
          <Marked text={p} />
        </span>
      ))}
    </>
  );
}

function Marked({ text }: { text: string }) {
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
