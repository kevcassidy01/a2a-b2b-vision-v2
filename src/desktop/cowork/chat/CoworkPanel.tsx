import { useState, type ReactNode } from "react";
import { fileIcon } from "./fileIcon";
import {
  Check,
  ChevronDown,
  Clock,
  ChevronRight,
  LayoutDashboard,
  Maximize2,
  ScrollText,
  Waypoints,
} from "lucide-react";
import { copy } from "../../../copy/copy";
import type { FlowId } from "../CoworkSidebar";
import { AppLogo } from "./AppLogo";
import { LiveChip } from "./LiveChip";
import { artifactsOf, EMPTY_PANEL, stepsFor, useCoworkChat, type Artifact } from "./store";

/**
 * CoworkPanel — the session's right-hand panel, after the live app's
 * (docs/references/cowork/): one card with three collapsible sections that
 * fill in as the script plays.
 *   - Progress: a circle per step, joined by dashes (done ones checked, the
 *     current one ringed), and the current step's name.
 *   - Working folder: the files the task made.
 *   - Context: the Salesforce sources it read (first), the skills it loaded
 *     and the connectors it reached.
 * Once the session is building an agent, a chip on top says so ("Long-running
 * agent"), with a "✓ Live" chip beside it once it's started (LiveChip). A
 * scheduled task gets its own chip ("Scheduled task") once it's scheduled.
 * Artifacts always comes first, the same in every session: every dashboard
 * the agents have built, its latest version, a click from full screen. In an
 * agent's chat it splits into "From this agent" and "Other artifacts"; opening
 * another session's goes to that chat (CoworkWindow follows `opened`).
 * Each section shows the live app's empty line until something lands.
 */
export function CoworkPanel({ flow }: { flow: FlowId }) {
  const t = copy.desktop.cowork.chat.panel;
  const panel = useCoworkChat((s) => s.panels[flow]) ?? EMPTY_PANEL;
  const agentIcon = useCoworkChat((s) => s.agentIcon.includes(flow));
  const live = useCoworkChat((s) => s.live.includes(flow));
  const scheduled = useCoworkChat((s) => s.scheduled.includes(flow));
  const steps = stepsFor(flow);
  const transcripts = useCoworkChat((s) => s.transcripts);
  const artifacts = artifactsOf(transcripts);
  const own = artifacts.filter((a) => a.flow === flow);
  const others = artifacts.filter((a) => a.flow !== flow);
  const current = steps[panel.progress - 1];

  return (
    <aside className="w-[300px] shrink-0 overflow-y-auto py-2 pr-2">
      <div className="rounded-xl border border-border bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]">
        {agentIcon && (
          <div className="animate-fade-in flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="whitespace-nowrap inline-flex h-6 items-center gap-1.5 rounded-md bg-elevated px-2 text-[12px] font-medium text-text-muted">
              <Waypoints className="size-3.5" strokeWidth={1.75} />
              {t.longRunning}
            </span>
            {live && <LiveChip />}
          </div>
        )}
        {scheduled && (
          <div className="animate-fade-in flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="whitespace-nowrap inline-flex h-6 items-center gap-1.5 rounded-md bg-elevated px-2 text-[12px] font-medium text-text-muted">
              <Clock className="size-3.5" strokeWidth={1.75} />
              {t.scheduledTask}
            </span>
          </div>
        )}
        <Section title={t.artifacts}>
          {!artifacts.length ? (
            <p className="text-[13px] text-text-subtle">{t.artifactsEmpty}</p>
          ) : own.length ? (
            <>
              <ArtifactGroup label={t.fromThisAgent} items={own} />
              {others.length > 0 && <ArtifactGroup label={t.otherArtifacts} items={others} showAgent />}
            </>
          ) : (
            <ArtifactGroup items={others} showAgent />
          )}
        </Section>
        <Section title={t.progress}>
          {steps.length > 0 && (
            <div className="flex items-center">
              {steps.map((step, i) => {
                const done = i < panel.progress;
                return (
                  <span key={step} className="flex items-center">
                    {i > 0 && <span className={`h-px w-2 ${done ? "bg-text-muted" : "bg-border"}`} />}
                    <span
                      title={step}
                      className={`grid size-6 place-items-center rounded-full border ${
                        done ? "border-text-muted text-text-muted" : "border-transparent bg-elevated"
                      }`}
                    >
                      {done && <Check className="size-3.5" strokeWidth={2} />}
                    </span>
                  </span>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-[13px] text-text-subtle">
            {current ? (
              <>
                <span className="text-text">{current}</span> · {panel.progress} of {steps.length}
              </>
            ) : (
              t.progressEmpty
            )}
          </p>
        </Section>

        <Section title={t.folder}>
          {panel.files.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {panel.files.map((file) => {
                const Icon = fileIcon(file);
                return (
                  <li key={file} className="animate-fade-in flex items-center gap-2.5 text-[14px] text-text">
                    <span className="grid size-7 shrink-0 place-items-center rounded-md border border-border text-text-muted">
                      <Icon className="size-4" strokeWidth={1.75} />
                    </span>
                    <span className="truncate">{file}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-[13px] text-text-subtle">{t.folderEmpty}</p>
          )}
        </Section>

        <Section title={t.context} last>
          {panel.sources.length > 0 && (
            <Group label={t.sources}>
              {panel.sources.map((src) => (
                <Row
                  key={`${src.app}:${src.label}`}
                  icon={<AppLogo app={src.app} className="size-3.5" />}
                  label={src.label}
                />
              ))}
            </Group>
          )}
          {panel.skills.length > 0 && (
            <Group label={t.skills}>
              {panel.skills.map((skill) => (
                <Row
                  key={skill}
                  icon={<ScrollText className="size-3.5 text-text-muted" strokeWidth={1.75} />}
                  label={skill}
                />
              ))}
            </Group>
          )}
          {panel.connectors.length > 0 && (
            <Group label={t.connectors}>
              {panel.connectors.map((app) => (
                <Row key={app} icon={<AppLogo app={app} className="size-3.5" />} label={t.connectorNames[app]} />
              ))}
            </Group>
          )}
        </Section>
      </div>
    </aside>
  );
}

/** A list of artifact rows, under an optional caption. `showAgent` names the
 *  session that made each one, since it isn't the one open. */
function ArtifactGroup({
  label,
  items,
  showAgent = false,
}: {
  label?: string;
  items: Artifact[];
  showAgent?: boolean;
}) {
  const openArtifact = useCoworkChat((s) => s.openArtifact);
  const flows = copy.desktop.cowork.flows.items;
  return (
    <div className="mb-3 last:mb-0">
      {label && <p className="mb-1.5 text-[12px] text-text-subtle">{label}</p>}
      <ul className="flex flex-col gap-1.5">
        {items.map(({ flow, dashboard }) => {
          const agent = flows.find((f) => f.id === flow)?.title;
          const detail = showAgent ? [agent, dashboard.footer].filter(Boolean).join(" · ") : dashboard.footer;
          return (
            <li key={`${flow}:${dashboard.title}`}>
              <button
                type="button"
                onClick={() => openArtifact(flow, dashboard.title)}
                className="animate-fade-in group flex w-full items-center gap-2.5 rounded-md border border-border p-2.5 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-elevated"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-elevated text-text-muted">
                  <LayoutDashboard className="size-4" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] text-text">{dashboard.title}</span>
                  {detail && <span className="block truncate text-[12px] text-text-subtle">{detail}</span>}
                </span>
                <Maximize2 className="size-3.5 shrink-0 text-text-subtle group-hover:text-text" strokeWidth={2} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Section({ title, last = false, children }: { title: string; last?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <section className={`px-4 py-3 ${last ? "" : "border-b border-border"}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[15px] font-medium text-text"
      >
        {title}
        <Chevron className="size-4 text-text-subtle" strokeWidth={2} />
      </button>
      {open && <div className="mt-3 empty:hidden">{children}</div>}
    </section>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="mb-1.5 text-[12px] text-text-subtle">{label}</p>
      <ul className="flex flex-col gap-1.5">{children}</ul>
    </div>
  );
}

function Row({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <li className="animate-fade-in flex items-center gap-2.5 text-[14px] text-text">
      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-elevated">{icon}</span>
      <span className="truncate">{label}</span>
    </li>
  );
}
