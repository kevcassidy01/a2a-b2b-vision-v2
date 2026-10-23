import { useEffect, useRef, useState } from "react";

/**
 * useDictation — simulated dictation of a scripted prompt (COWORK_INTENT
 * decisions 31 and 40). Nothing is recognized: `start` plays `script` back
 * a word or a few at a time, at a speaking pace with a breath after each
 * sentence, while `speaking` drives the waveform. A `|` in the script is a
 * hesitation (an "umm… and also"): sound but no words for a moment, so it
 * feels human. Once every word is in, the recording ends by itself (no Done
 * click needed); `stop` ends it early (Done / Cancel).
 */

/** A hesitation's length: the waveform keeps moving, no words come. */
const HESITATE_MS = 1500;
/** The pause after the last word before the recording ends by itself. */
const DONE_MS = 700;
export function useDictation(script: string | undefined) {
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const words = script ? script.split(" ") : [];
  const transcript = words.slice(0, heard).filter((w) => w !== "|").join(" ");

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const start = () => {
    if (!words.length) return;
    setListening(true);
    setHeard(0);
    const step = (n: number) => {
      // Usually one word, sometimes two or three in a burst.
      const r = Math.random();
      let next = Math.min(words.length, n + (r < 0.6 ? 1 : r < 0.88 ? 2 : 3));
      // Stop a burst at a hesitation, so the words before it land first.
      const mark = words.indexOf("|", n);
      if (mark !== -1 && mark < next) next = mark === n ? n + 1 : mark;
      setHeard(next);
      setSpeaking(true);
      if (next >= words.length) {
        // The last word's sound fades, then a beat later the recording ends on
        // its own (as Done would), so send lights up without a click.
        timer.current = window.setTimeout(() => {
          setSpeaking(false);
          timer.current = window.setTimeout(stop, DONE_MS);
        }, 300);
        return;
      }
      // A hesitation, a breath after a sentence or clause, otherwise a speaking pace.
      const last = words[next - 1];
      const pause =
        last === "|" ? HESITATE_MS : /[.?!]$/.test(last) ? 650 : /,$/.test(last) ? 320 : 130 + Math.random() * 200;
      if (pause > 300) window.setTimeout(() => setSpeaking(false), 150);
      timer.current = window.setTimeout(() => step(next), pause);
    };
    // A beat of silence before the first words, as when someone starts talking.
    timer.current = window.setTimeout(() => step(0), 600);
  };

  const stop = () => {
    window.clearTimeout(timer.current);
    setListening(false);
    setSpeaking(false);
  };

  return {
    enabled: words.length > 0,
    listening,
    speaking,
    transcript,
    start,
    stop,
  };
}
