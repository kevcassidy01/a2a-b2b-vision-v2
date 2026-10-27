import { useEffect, useState } from "react";
import gmail from "../assets/a2a/logos/gmail.svg";
import { copy } from "../copy/copy";
import { demoTimeout } from "./demoClock";
import { woosh } from "./sounds";

const t = copy.a2a.mail;

/** After O-5531 is placed, in ms: when the banner slides in (once the seller agent has said the order's in), how long it stays, and its slide out. */
const IN = 2200;
const STAY = 6000;
const OUT = 320;

/**
 * MailNotification — a macOS notification on Alex's side once O-5531 is
 * placed: Gmail has sent Isar Bottling the order confirmation. Dark glass
 * like the rest of the OS chrome, top right of the screen over the Command
 * Center. It slides in from the right with a woosh, stays a few seconds,
 * slides back out. Once per run.
 */
export function MailNotification({ ordered }: { ordered: boolean }) {
  const [phase, setPhase] = useState<"off" | "in" | "out" | "done">("off");
  useEffect(() => {
    if (!ordered || phase !== "off") return;
    return demoTimeout(() => {
      setPhase("in");
      woosh();
    }, IN);
  }, [ordered, phase]);
  useEffect(() => {
    if (phase === "in") return demoTimeout(() => setPhase("out"), STAY);
    if (phase === "out") return demoTimeout(() => setPhase("done"), OUT);
  }, [phase]);
  if (phase === "off" || phase === "done") return null;
  return (
    <div role="status" className="a2a-mail" data-out={phase === "out" || undefined}>
      <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-white shadow-[0_0_0_0.5px_rgb(0_0_0/0.2)]">
        <img src={gmail} alt="" className="size-[22px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2 text-[12px] text-white/50">
          <span className="mr-auto">{t.app}</span>
          {t.time}
        </span>
        <span className="block truncate text-[13px] font-semibold text-white/95">{t.title}</span>
        <span className="block truncate text-[13px] text-white/75">{t.body}</span>
      </span>
    </div>
  );
}
