import type { ReactNode } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { copy } from "../../../copy/copy";
import { Segmented, SelectValue, Switch } from "./parts";

const THEMES = [
  { key: "system", Icon: Monitor },
  { key: "light", Icon: Sun },
  { key: "dark", Icon: Moon },
] as const;

/** A setting: label (and optional hint) on the left, its control on the right,
 *  a hairline under every row but a section's last. */
function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-14 items-center gap-6 border-b border-border py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="text-ui text-text">{label}</div>
        {hint && <div className="mt-0.5 text-[13px] text-text-subtle">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h3 className="mb-2 text-[16px] font-semibold text-text">{title}</h3>
      <div>{children}</div>
    </section>
  );
}

/**
 * GeneralPane — Settings → General, as in the live app: Appearance, Voice and
 * Notifications. Every control moves, none changes anything (light theme only).
 */
export function GeneralPane() {
  const t = copy.desktop.cowork.settings.general;
  const themes = copy.shell.account.items.themeOptions;
  const [theme, setTheme] = useState<(typeof THEMES)[number]["key"]>("light");

  return (
    <div className="px-7 pb-6 pt-16">
      <Section title={t.appearance}>
        <Row label={t.theme}>
          <div className="inline-flex items-center gap-0.5 rounded-md bg-track p-0.5">
            {THEMES.map(({ key, Icon }) => (
              <button
                key={key}
                type="button"
                aria-label={themes[key]}
                aria-pressed={theme === key}
                onClick={() => setTheme(key)}
                className={`grid size-7 place-items-center rounded-sm transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] ${
                  theme === key ? "bg-track-thumb text-text shadow-sm" : "text-text-muted hover:text-text"
                }`}
              >
                <Icon className="size-4" strokeWidth={2} />
              </button>
            ))}
          </div>
        </Row>
        <Row label={t.chatFont}>
          <SelectValue className="font-serif text-[16px]">{t.chatFontValue}</SelectValue>
        </Row>
        <Row label={t.textSize} hint={t.textSizeHint}>
          <Segmented options={t.textSizes} initial={1} label={t.textSize} />
        </Row>
        <Row label={t.motion} hint={t.motionHint}>
          <Segmented options={t.motions} label={t.motion} />
        </Row>
      </Section>

      <Section title={t.voice}>
        <Row label={t.language}>
          <SelectValue>{t.languageValue}</SelectValue>
        </Row>
        <Row label={t.style}>
          <SelectValue>{t.styleValue}</SelectValue>
        </Row>
        <Row label={t.speed}>
          <SelectValue>{t.speedValue}</SelectValue>
        </Row>
      </Section>

      <Section title={t.notifications}>
        {t.toggles.map(({ label, hint }) => (
          <Row key={label} label={label} hint={hint}>
            <Switch label={label} />
          </Row>
        ))}
      </Section>
    </div>
  );
}
