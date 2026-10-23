import { create } from "zustand";
import type { FlowId } from "../CoworkSidebar";
import type { Beat, CoworkBlock, CoworkMessage, CoworkScript, DashboardBlock, PanelState, PlanItem } from "./types";
import { brief } from "./scripts/brief";
import { delivery } from "./scripts/delivery";
import { growth } from "./scripts/growth";
import { prestige } from "./scripts/prestige";

/** The sessions with a script so far. The others just show Aaron's prompt. */
const SCRIPTS: Partial<Record<FlowId, CoworkScript>> = { delivery, growth, brief, prestige };

/** A session's progress steps, for the right-hand panel (none until it has a script). */
export const stepsFor = (flow: FlowId) => SCRIPTS[flow]?.steps ?? [];

/** A session's prompt-bar tips once its agent is live (none without a script). */
export const hintsFor = (flow: FlowId) => SCRIPTS[flow]?.hints ?? [];

/** What the in-chat mic dictates next in a session: the first of its script's
 *  dictations Aaron hasn't sent yet (none once they're all used). One is
 *  skipped once Aaron has done it another way: a chip with the same reply,
 *  the card it approves, or the email it sends. */
export function dictationFor(flow: FlowId, messages: CoworkMessage[]) {
  const said = (text: string) => text.replace(/\s*\|\s*/g, " ");
  const sent = messages
    .filter((m) => m.role === "user")
    .map((m) => m.blocks.map((b) => (b.type === "text" ? b.content : "")).join(""));
  const blocks = messages.flatMap((m) => m.blocks);
  const keyOf = (text: string) => SCRIPTS[flow]?.intents?.find((i) => i.match.test(text))?.reply;
  const settled = (d: string) => {
    const key = keyOf(said(d));
    if (key && sent.some((t) => keyOf(t) === key)) return true;
    if (key?.startsWith("approve:")) {
      const id = key.slice("approve:".length);
      return blocks.some((b) => b.type === "approval" && b.id === id && b.status !== "proposed");
    }
    if (key === "send-email") return blocks.some((b) => b.type === "email" && b.status === "sent");
    return false;
  };
  return SCRIPTS[flow]?.dictations?.find((d) => !sent.includes(said(d)) && !settled(d));
}

export const EMPTY_PANEL: PanelState = { progress: 0, sources: [], skills: [], connectors: [], files: [] };

/** An artifact in the right-hand panel: a dashboard, by the session that made it. */
export type Artifact = { flow: FlowId; dashboard: DashboardBlock };

/** Every session's dashboards, one per title (its latest version), in the order they were made. */
export function artifactsOf(transcripts: State["transcripts"]): Artifact[] {
  const out: Artifact[] = [];
  for (const [flow, list] of Object.entries(transcripts) as [FlowId, CoworkMessage[]][]) {
    for (const b of list.flatMap((m) => m.blocks)) {
      if (b.type !== "dashboard") continue;
      const i = out.findIndex((a) => a.flow === flow && a.dashboard.title === b.title);
      if (i < 0) out.push({ flow, dashboard: b });
      else out[i] = { flow, dashboard: b };
    }
  }
  return out;
}

/** How long a live agent's typing dots show before its post lands. */
const TYPING_MS = 2000;

let nextId = 0;
const id = () => `cw${++nextId}`;

type State = {
  /** One transcript per session. */
  transcripts: Partial<Record<FlowId, CoworkMessage[]>>;
  /** The thinking label per session, while Claude is working (null = idle). */
  thinking: Partial<Record<FlowId, string | null>>;
  /** Claude's plan per session, pinned above the prompt bar (none until a script sets one). */
  plans: Partial<Record<FlowId, PlanItem[]>>;
  /** The right-hand panel per session: progress, skills, connectors, files. */
  panels: Partial<Record<FlowId, PanelState>>;
  /** Sessions whose sidenav row shows the agent icon (set by the script). */
  agentIcon: FlowId[];
  /** Bumps each time a live agent posts, to pop Salesforce's Slack notification. */
  notices: number;
  /** What that notification says: the agent and what it just did. */
  noticeText: string;
  /** Who it's from (null = Salesforce, the default). */
  noticeFrom: string | null;
  /** Sessions Claude is replying in (a script playing) or about to post in
   *  (an agent's post on its way): the sidenav row shows typing dots. */
  talking: FlowId[];
  /** Actions each session has completed while Aaron was elsewhere: the row's badge. */
  unread: Partial<Record<FlowId, number>>;
  /** The session open in the window (null = none), so its own posts aren't counted as unread. */
  viewing: FlowId | null;
  setViewing: (flow: FlowId | null) => void;
  /** Agents Aaron has started: a pulsing dot on the row, listed on Agents. */
  live: FlowId[];
  /** The dashboard open full screen, by session and title, so it reads the
   *  latest version as the agent updates it (null = none). */
  opened: { flow: FlowId; title: string } | null;
  openArtifact: (flow: FlowId, title: string) => void;
  /** Scheduled tasks Aaron has set up (the Scheduled page lists them). */
  scheduled: FlowId[];
  /** Scheduled tasks that have run. */
  ran: FlowId[];
  /** Set once the next morning's brief has run: the menu-bar clock jumps to
   *  Thursday 15 October, the day after the demo. */
  morning: boolean;
  closeArtifact: () => void;
  /** Aaron's opening prompt (and any files dropped with it): Aaron's bubble,
   *  then the session's script. The files go to the Working folder. */
  start: (flow: FlowId, prompt: string, files?: string[]) => void;
  /** Aaron's follow-ups (typed, or a chip): Aaron's bubble, then a scripted reply if there is one. */
  send: (flow: FlowId, text: string) => void;
  /** The agent card's buttons. */
  startAgent: (flow: FlowId) => void;
  cancelAgent: (flow: FlowId) => void;
  /** The schedule card's buttons. */
  scheduleTask: (flow: FlowId) => void;
  cancelTask: (flow: FlowId) => void;
  /** A scheduled task's run, if it's scheduled and hasn't run yet (true if it ran). */
  runTask: (flow: FlowId) => boolean;
  /** An email card's Send. */
  sendEmail: (flow: FlowId) => void;
  /** An approval card's buttons. */
  approve: (flow: FlowId, id: string) => void;
  decline: (flow: FlowId, id: string) => void;
};

/**
 * useCoworkChat — Cowork's conversations, apart from the browser's `useChat`
 * (decision 6). A session's script plays as timed beats into one assistant
 * message, so the reply grows in place: prose, the skill line, the
 * integrations timeline step by step, the sweep, then the agent card.
 */
export const useCoworkChat = create<State>((set, get) => {
  const messages = (flow: FlowId) => get().transcripts[flow] ?? [];
  const setMessages = (flow: FlowId, next: CoworkMessage[]) =>
    set((s) => ({ transcripts: { ...s.transcripts, [flow]: next } }));
  const setThinking = (flow: FlowId, label: string | null) =>
    set((s) => ({ thinking: { ...s.thinking, [flow]: label } }));
  const editPanel = (flow: FlowId, edit: (p: PanelState) => PanelState) =>
    set((s) => ({ panels: { ...s.panels, [flow]: edit(s.panels[flow] ?? EMPTY_PANEL) } }));

  /** Edit the newest assistant message, starting one if the last message is Aaron's. */
  const editReply = (flow: FlowId, edit: (blocks: CoworkBlock[]) => CoworkBlock[]) => {
    const list = messages(flow);
    const last = list[list.length - 1];
    if (last?.role === "assistant" && !last.event) {
      setMessages(flow, [...list.slice(0, -1), { ...last, blocks: edit(last.blocks) }]);
    } else {
      setMessages(flow, [...list, { id: id(), role: "assistant", blocks: edit([]) }]);
    }
  };

  /** Overlapping plays and posts per session, so the dots stop only when all are done. */
  const busy: Partial<Record<FlowId, number>> = {};
  const setTalking = (flow: FlowId, on: boolean) => {
    busy[flow] = Math.max(0, (busy[flow] ?? 0) + (on ? 1 : -1));
    const talking = busy[flow]! > 0;
    set((s) => ({ talking: talking ? (s.talking.includes(flow) ? s.talking : [...s.talking, flow]) : s.talking.filter((f) => f !== flow) }));
  };
  /** A completed action in a session Aaron isn't looking at. */
  const markUnread = (flow: FlowId) => {
    if (get().viewing === flow) return;
    set((s) => ({ unread: { ...s.unread, [flow]: (s.unread[flow] ?? 0) + 1 } }));
  };

  const play = (flow: FlowId, beats: Beat[]) => {
    setTalking(flow, true);
    const step = (i: number) => {
      const beat = beats[i];
      if (!beat) {
        setThinking(flow, null);
        setTalking(flow, false);
        return;
      }
      window.setTimeout(() => {
        setThinking(flow, beat.thinking ?? null);
        // A new schedule card replaces the one it edits: the old one folds.
        if (beat.block?.type === "schedule") setScheduleStatus(flow, "proposed", "superseded");
        if (beat.block) editReply(flow, (b) => [...b, beat.block!]);
        if (beat.block?.type === "action") markUnread(flow);
        if (beat.grow) {
          // Grow the newest timeline still working (a reply can hold more than one).
          editReply(flow, (b) => {
            let at = -1;
            b.forEach((x, i) => {
              if (x.type === "integrations" && x.shown < x.steps.length) at = i;
            });
            return b.map((x, i) => (i === at && x.type === "integrations" ? { ...x, shown: x.shown + 1 } : x));
          });
        }
        if (beat.agentIcon) set((s) => ({ agentIcon: s.agentIcon.includes(flow) ? s.agentIcon : [...s.agentIcon, flow] }));
        if (beat.progress !== undefined) editPanel(flow, (p) => ({ ...p, progress: beat.progress! }));
        if (beat.skill) editPanel(flow, (p) => ({ ...p, skills: [...p.skills, beat.skill!] }));
        if (beat.connector) editPanel(flow, (p) => ({ ...p, connectors: [...p.connectors, beat.connector!] }));
        if (beat.sources) editPanel(flow, (p) => ({ ...p, sources: [...p.sources, ...beat.sources!] }));
        if (beat.file) editPanel(flow, (p) => ({ ...p, files: [...p.files, beat.file!] }));
        if (beat.notice) set((s) => ({ notices: s.notices + 1, noticeText: beat.notice!, noticeFrom: beat.noticeFrom ?? null }));
        if (beat.stop) set((s) => ({ live: s.live.filter((f) => f !== flow) }));
        if (beat.plan) set((s) => ({ plans: { ...s.plans, [flow]: beat.plan } }));
        if (beat.planStatus) {
          const moves = beat.planStatus;
          set((s) => ({
            plans: {
              ...s.plans,
              [flow]: (s.plans[flow] ?? []).map((p) => (moves[p.id] ? { ...p, status: moves[p.id] } : p)),
            },
          }));
        }
        step(i + 1);
      }, beat.wait);
    };
    step(0);
  };

  /** The live agent's own posts: each lands as its own message, with a notification. */
  const watch = (flow: FlowId, posts: NonNullable<CoworkScript["watch"]>) => {
    let at = 0;
    for (const post of posts) {
      at += post.wait;
      // The agent "types" for a moment before each post lands.
      window.setTimeout(() => setTalking(flow, true), Math.max(0, at - TYPING_MS));
      window.setTimeout(() => {
        setTalking(flow, false);
        markUnread(flow);
        let list = messages(flow);
        if (post.dashboard) {
          // Update the first dashboard card, so the one Aaron saw at Start ticks up.
          let done = false;
          list = list.map((m) => ({
            ...m,
            blocks: m.blocks.map((b) => {
              if (done || b.type !== "dashboard") return b;
              done = true;
              return { ...b, ...post.dashboard };
            }),
          }));
        }
        setMessages(flow, [...list, { id: id(), role: "assistant", event: true, blocks: [post.block] }]);
        const text = post.block.type === "action" ? `${post.block.agent}: ${post.block.title}` : "";
        set((s) => ({ notices: s.notices + 1, noticeText: text, noticeFrom: null }));
      }, at);
    }
  };

  type ScheduleStatus = Extract<CoworkBlock, { type: "schedule" }>["status"];
  const setScheduleStatus = (flow: FlowId, from: ScheduleStatus, to: ScheduleStatus) =>
    setMessages(
      flow,
      messages(flow).map((m) => ({
        ...m,
        blocks: m.blocks.map((b) => (b.type === "schedule" && b.status === from ? { ...b, status: to } : b)),
      })),
    );

  const setAgentStatus = (flow: FlowId, status: "started" | "cancelled") =>
    setMessages(
      flow,
      messages(flow).map((m) => ({
        ...m,
        blocks: m.blocks.map((b) => (b.type === "agent" && b.status === "proposed" ? { ...b, status } : b)),
      })),
    );

  /** Settle an approval card, once, then play what follows it. */
  const decide = (flow: FlowId, key: string, status: "approved" | "declined") => {
    const pending = messages(flow).some((m) =>
      m.blocks.some((b) => b.type === "approval" && b.id === key && b.status === "proposed"),
    );
    if (!pending) return;
    setMessages(
      flow,
      messages(flow).map((m) => ({
        ...m,
        blocks: m.blocks.map((b) => (b.type === "approval" && b.id === key && b.status === "proposed" ? { ...b, status } : b)),
      })),
    );
    const beats = SCRIPTS[flow]?.approvals?.[key];
    if (beats) play(flow, status === "approved" ? beats.approve : beats.decline);
  };

  return {
    transcripts: {},
    thinking: {},
    plans: {},
    panels: {},
    agentIcon: [],
    live: [],
    talking: [],
    unread: {},
    viewing: null,
    setViewing: (flow) =>
      set((s) => ({ viewing: flow, unread: flow ? { ...s.unread, [flow]: 0 } : s.unread })),
    notices: 0,
    noticeText: "",
    noticeFrom: null,
    opened: null,
    scheduled: [],
    ran: [],
    morning: false,
    openArtifact: (flow, title) => set({ opened: { flow, title } }),
    closeArtifact: () => set({ opened: null }),
    start: (flow, prompt, files = []) => {
      if (messages(flow).length) return;
      const attached: CoworkBlock[] = files.length ? [{ type: "files", names: files }] : [];
      setMessages(flow, [{ id: id(), role: "user", blocks: [...attached, { type: "text", content: prompt }] }]);
      if (files.length) editPanel(flow, (p) => ({ ...p, files: [...p.files, ...files] }));
      const script = SCRIPTS[flow];
      if (script) play(flow, script.opening);
    },
    send: (flow, text) => {
      const script = SCRIPTS[flow];
      const keyOf = (t: string) => (script?.replies?.[t] ? t : script?.intents?.find((i) => i.match.test(t))?.reply);
      const key = keyOf(text);
      // An open choice is answered by its option, clicked or said another way.
      const answer = (b: CoworkBlock): CoworkBlock => {
        if (b.type !== "choice" || b.picked !== undefined) return b;
        const pick = b.options.find((o) => o.label === text || (key && keyOf(o.label) === key));
        return pick ? { ...b, picked: pick.label } : b;
      };
      setMessages(flow, [
        ...messages(flow).map((m) => ({ ...m, blocks: m.blocks.map(answer) })),
        { id: id(), role: "user", blocks: [{ type: "text", content: text }] },
      ]);
      // Said instead of clicked: the card's button, in Aaron's words.
      if (key?.startsWith("approve:")) {
        window.setTimeout(() => decide(flow, key.slice("approve:".length), "approved"), 500);
        return;
      }
      if (key === "send-email") {
        window.setTimeout(() => get().sendEmail(flow), 500);
        return;
      }
      const reply = key ? script?.replies?.[key] : undefined;
      if (reply) play(flow, reply);
    },
    startAgent: (flow) => {
      if (get().live.includes(flow)) return;
      setAgentStatus(flow, "started");
      set((s) => ({ live: [...s.live, flow] }));
      const script = SCRIPTS[flow];
      if (!script) return;
      play(flow, script.onStart);
      if (script.watch) watch(flow, script.watch);
    },
    cancelAgent: (flow) => setAgentStatus(flow, "cancelled"),
    scheduleTask: (flow) => {
      // An edit to a task that's already scheduled (↵ pressed on the first card
      // before Aaron asked for the change) still lands, without the welcome again.
      if (get().scheduled.includes(flow)) {
        setScheduleStatus(flow, "scheduled", "superseded");
        setScheduleStatus(flow, "proposed", "scheduled");
        return;
      }
      setScheduleStatus(flow, "proposed", "scheduled");
      set((s) => ({ scheduled: [...s.scheduled, flow] }));
      const script = SCRIPTS[flow];
      if (script) play(flow, script.onStart);
    },
    cancelTask: (flow) => setScheduleStatus(flow, "proposed", "cancelled"),
    runTask: (flow) => {
      const run = SCRIPTS[flow]?.run;
      if (!run || !get().scheduled.includes(flow) || get().ran.includes(flow)) return false;
      setMessages(flow, [...messages(flow), { id: id(), role: "assistant", event: true, blocks: run.blocks }]);
      if (run.file) editPanel(flow, (p) => ({ ...p, files: [...p.files, run.file!] }));
      if (run.progress !== undefined) editPanel(flow, (p) => ({ ...p, progress: run.progress! }));
      set((s) => ({ ran: [...s.ran, flow], morning: true }));
      return true;
    },
    sendEmail: (flow) => {
      if (!messages(flow).some((m) => m.blocks.some((b) => b.type === "email" && b.status === "draft"))) return;
      setMessages(
        flow,
        messages(flow).map((m) => ({
          ...m,
          blocks: m.blocks.map((b) => (b.type === "email" && b.status === "draft" ? { ...b, status: "sent" } : b)),
        })),
      );
      const beats = SCRIPTS[flow]?.onEmailSent;
      if (beats) play(flow, beats);
    },
    approve: (flow, key) => decide(flow, key, "approved"),
    decline: (flow, key) => decide(flow, key, "declined"),
  };
});
