import type { ReactNode } from "react";
import { copy } from "../../../copy/copy";
import { ThemeSegmented } from "../../../shell/ThemeSegmented";
import { Segmented, SelectValue, Switch } from "./parts";

/** A setting: label (and optional hint) on the left, its control on the right,
 *  a hairline under every row but a section's last. */
function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-14 items-center gap-6 border-b border-border py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="text-ui text-text">{label}</div>
        {hint && (
          <div className="mt-0.5 text-[13px] text-text-subtle">{hint}</div>
        )}
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

  return (
    <div className="px-7 pb-6 pt-16">
      <Section title={t.appearance}>
        <Row label={t.theme}>
          <ThemeSegmented />
        </Row>
        <Row label={t.chatFont}>
          <SelectValue className="font-serif text-[16px]">
            {t.chatFontValue}
          </SelectValue>
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
