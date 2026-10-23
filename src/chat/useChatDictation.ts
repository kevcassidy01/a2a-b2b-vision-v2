import { useEffect, useRef, useState } from "react";

/**
 * useChatDictation — the browser chat's simulated dictation of a journey's
 * next prompt (desktop Cowork has its own, `shell/useDictation`, and the two
 * are kept apart on purpose). Nothing is recognized: `start` plays `script`
 * back a word or a few at a time while `speaking` drives the waveform.
 *
 * The browser's prompts are short, so there are no pauses: no hesitations, no
 * breath after a sentence or comma, just a steady speaking pace from the
 * first word to the last. Once every word is in, the recording ends by itself
 * (no Done click needed); `stop` ends it early (Done / Cancel).
 */

/** The beat before the first words. */
const LEAD_MS = 200;
/** The beat after the last word before the recording ends by itself. */
const DONE_MS = 250;
export function useChatDictation(script: string | undefined) {
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const words = script ? script.split(" ") : [];
  const transcript = words.slice(0, heard).join(" ");

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const start = () => {
    if (!words.length) return;
    setListening(true);
    setHeard(0);
    setSpeaking(true);
    const step = (n: number) => {
      // Usually one word, sometimes two or three in a burst.
      const r = Math.random();
      const next = Math.min(words.length, n + (r < 0.6 ? 1 : r < 0.88 ? 2 : 3));
      setHeard(next);
      if (next >= words.length) {
        timer.current = window.setTimeout(() => {
          setSpeaking(false);
          timer.current = window.setTimeout(stop, DONE_MS);
        }, 200);
        return;
      }
      timer.current = window.setTimeout(() => step(next), 110 + Math.random() * 120);
    };
    timer.current = window.setTimeout(() => step(0), LEAD_MS);
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
