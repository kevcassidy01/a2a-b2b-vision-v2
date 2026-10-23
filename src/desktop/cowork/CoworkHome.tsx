import { useState } from "react";
import { copy } from "../../copy/copy";
import { Composer } from "../../shell/Composer";
import { FileChips } from "./chat/FileChips";
import { ChatCoworkToggle, type CoworkMode } from "./ChatCoworkToggle";
import { QuickStart } from "./QuickStart";
import { SalesforceBanner } from "./SalesforceBanner";

/**
 * CoworkHome — the Cowork window's start state (COWORK_INTENT §8).
 *
 * Same parts as the browser's greeting state (the Claude spark, the serif
 * greeting, the initial-state prompt box), laid out like the live desktop app:
 * the greeting left-aligned over the box, the group sitting high in the window
 * (11vh down) rather than dead centre. The box's Salesforce chip gives way to
 * the Chat | Cowork switch (Cowork selected). Below the box, a smaller banner
 * about what Claude can do with Salesforce, then a few quick starts. Sending
 * starts the session; Cowork keeps its own conversation, separate from the
 * browser chat (decision 6). Files dragged in from the desktop land as chips
 * above the text (✕ removes one) and go with the prompt.
 */
export function CoworkHome({ onSend, dictation }: { onSend: (files: string[]) => void; dictation?: string }) {
  const [mode, setMode] = useState<CoworkMode>("cowork");
  const [files, setFiles] = useState<string[]>([]);
  const [over, setOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const name = e.dataTransfer.getData("text/plain");
        if (name) setFiles((f) => (f.includes(name) ? f : [...f, name]));
      }}
      className="flex min-w-0 flex-1 flex-col items-center overflow-y-auto bg-bg pb-10 pt-[11vh]"
    >
      <div className="w-full max-w-[720px] px-6">
        <div className="flex items-center gap-3">
          <img src="/favicon.webp" alt="" aria-hidden className="size-8" />
          <h1 className="font-serif text-[32px] font-normal leading-none text-text">
            {copy.shell.greeting.timeOfDay} {copy.shell.account.name}
          </h1>
        </div>
        <div className="mt-8 w-full">
          <div className={`rounded-lg transition-shadow duration-[var(--dur-fast)] ${over ? "ring-2 ring-accent/50 ring-offset-4 ring-offset-bg" : ""}`}>
            <Composer
              onSend={() => onSend(files)}
              dictation={dictation}
              chip={<ChatCoworkToggle mode={mode} onChange={setMode} />}
              attachments={
                files.length > 0 && (
                  <FileChips align="start" names={files} onRemove={(name) => setFiles((f) => f.filter((n) => n !== name))} />
                )
              }
            />
          </div>
          <SalesforceBanner />
          <QuickStart />
        </div>
      </div>
    </div>
  );
}
