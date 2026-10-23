/**
 * Cowork's own chat blocks (decision 6: separate from the browser chat).
 *
 * Claude-native, not MCP-app cards: prose, the skill line, the integrations
 * timeline (after the Cowork promo), tables in an MCP-style card, and the
 * agent card (after the live app's Schedule card).
 */

import type { ColumnChartSpec, InsightPage, Kpi } from "../../../chat/types";

/** An app Cowork reaches. Salesforce first, then the other connectors (decision 46). */
export type AppId = "salesforce" | "slack" | "gmail" | "calendar" | "asana" | "gong" | "files";

/** A Headless 360 MCP call (`project-codey`): the tool and the Commerce SOR it hit. */
export type ToolCall = { name: string; target: string };

/** A Salesforce record a step writes: the object's API name, the record, and
 *  the fields it set (changes as `old → new`). `count` is for a batch (6 lines). */
export type WriteRecord = { op: "insert" | "update"; object: string; name: string; fields: string; count?: number };

/** How long apart a step's writes land, so a script can time its grow beat. */
export const WRITE_MS = 500;

/** One integrations step: the app, a plain-language action, the Headless 360
 *  call behind it (Salesforce steps) and its result chip. */
export type IntegrationStep = {
  app: AppId;
  action: string;
  tool?: ToolCall;
  result: string;
  /** A long read: while it works, its labels in turn over `ms` (its grow
   *  beat's wait). With a `length` (a call recording), a progress bar along it;
   *  without (an inbox search), just the labels. */
  listen?: { ms: number; length?: string; stages: string[] };
  /** Once done: what it found, a line each (e.g. timestamped call moments). */
  moments?: string[];
  /** Once done: files that came with it, as file chips (e.g. an email's attachments). */
  attachments?: string[];
  /** The records it writes, landing one at a time while it works. */
  writes?: WriteRecord[];
};

/** A task on Claude's plan, pinned above the prompt bar: Claude's own, or one
 *  that needs Aaron. `now` is the one being worked on (or waiting on Aaron). */
export type PlanItem = { id: string; label: string; by: "claude" | "you"; status: "todo" | "now" | "done" };

/** A source chip: the app it came from and the record or object it names. */
export type Source = { app: AppId; label: string };

/** A table column. `lead` is the bold first column, `name` keeps a name on one
 *  line, `amount` right-aligns figures, `status` renders its cells as pills
 *  (tone looked up by label). */
export type TableColumn = { label: string; kind?: "lead" | "name" | "amount" | "status" };

export type CoworkBlock =
  | { type: "text"; content: string }
  /** Files Aaron dropped into the prompt box, shown above their bubble. */
  | { type: "files"; names: string[] }
  | { type: "skill"; name: string }
  /** `shown` grows as the script plays, so results land in place one by one. */
  | { type: "integrations"; steps: IntegrationStep[]; shown: number }
  /** A table inside a Salesforce MCP-style card (borrowed from the browser
   *  chat's InlineCard). Inline it shows the `inline` columns and the first
   *  `preview` rows; when it holds more, it opens full screen with every row
   *  and column. `footer` is the card's quiet status line. */
  | {
      type: "table";
      title: string;
      columns: TableColumn[];
      rows: string[][];
      inline?: number[];
      preview?: number;
      footer?: string;
      /** A bold last row, e.g. the cart's total (blank cells for columns it skips). */
      total?: string[];
      sources: Source[];
    }
  /** The scale moment: a row of big numbers, and a line saying what it saved. */
  | { type: "stats"; items: Kpi[]; note?: string; /** 2 tiles a row, for longer lines. */ pairs?: boolean }
  /** Follow-up prompts at the end of a reply; clicking one sends it. */
  | { type: "chips"; items: string[] }
  /** Something the live agent just did, as its own card: a one-line title, a
   *  key-value Details box, and end buttons (ask the agent about it, or open
   *  the record). */
  | {
      type: "action";
      agent: string;
      title: string;
      time: string;
      details: { label: string; value: string }[];
      /** The footer's note (default "Done within policy"). */
      footer?: string;
      /** The app it was done in, as the header's logo (default: the agent icon). */
      app?: AppId;
    }
  /** A Salesforce dashboard in the MCP card: KPI tiles over a column chart,
   *  with the browser chat's own KpiTiles and ColumnChart. `full` is the
   *  full-screen page (the browser chat's insight page: groups of sections).
   *  A live agent's posts can update it in place (see CoworkScript's `watch`),
   *  and the right-hand panel keeps the latest one pinned. */
  | {
      type: "dashboard";
      title: string;
      kpis: Kpi[];
      chart: { title: string } & ColumnChartSpec;
      full: InsightPage;
      footer?: string;
      sources: Source[];
    }
  /** A hairline with a label across the transcript, e.g. "7 days later". */
  | { type: "divider"; label: string }
  | {
      type: "agent";
      name: string;
      /** One line on what it is. */
      summary: string;
      trigger: string;
      /** The meta line's accent chip, e.g. "Runs for 60 days". */
      runsFor: string;
      things: string[];
      /** What it brings to Aaron instead of doing itself. */
      asksFirst: string[];
      sources: Source[];
      /** What the folded "Created agent" row opens to: its type, what it does,
       *  how long it runs, and so on. */
      facts: { label: string; value: string }[];
      /** Set once Aaron starts it (or cancels): the card folds to one line. */
      status: "proposed" | "started" | "cancelled";
    }
  /** /schedule's setup questions as a prompt template: one line per answer,
   *  a label then a greyed hint. Aaron answers it in one dictation; the
   *  template itself never changes. */
  | { type: "template"; title: string; lines: { label: string; hint: string }[] }
  /** What Claude read from Aaron's answer, as a key-value table. */
  | { type: "answers"; title: string; facts: { label: string; value: string }[] }
  /** Claude's proposal for a scheduled task, after the live app's Schedule card
   *  (docs/references/cowork/scheduled-task.png). An edit posts a new card and
   *  folds the old one (`superseded`); Schedule folds it to "Created scheduled task". */
  | {
      type: "schedule";
      name: string;
      summary: string;
      when: string;
      /** The meta line's accent chip, e.g. "Ready by 9 AM". */
      ready: string;
      /** The numbered instructions it'll run each time. */
      steps: string[];
      /** "Also changes: …", on an edit. */
      changes?: string[];
      facts: { label: string; value: string }[];
      status: "proposed" | "superseded" | "scheduled" | "cancelled";
    }
  /** Something Claude won't do without Aaron's OK: what and why, a key-value
   *  table, then the approve button / Not now. Approving folds it to one line
   *  and plays the script's `approvals[id]`. */
  | {
      type: "approval";
      id: string;
      title: string;
      summary: string;
      details: { label: string; value: string }[];
      /** The approve button's label, e.g. "Add them". */
      approve: string;
      status: "proposed" | "approved" | "declined";
      /** A recommendation rather than a plain OK: its own header, an info note
       *  on why (a line each, with its source), the other button's label, and
       *  and the folded line each way (in place of the title). */
      recommend?: {
        header: string;
        why: { text: string; source: Source }[];
        decline: string;
        folded: { approved: string; declined: string };
      };
    }
  /** A question with a few answers: one click sends that answer as Aaron
   *  (so it plays like saying it). Once answered, the pick is ticked and the
   *  rest dim. */
  | {
      type: "choice";
      id: string;
      question: string;
      options: { label: string; detail: string; tag?: string }[];
      picked?: string;
    }
  /** A moment from a call recording: who said it, their words, and the
   *  timestamp, which plays the clip (`at` to `to`, m:ss). */
  | { type: "quote"; app: AppId; source: string; speaker: string; role: string; text: string; at: string; to: string }
  /** A Gmail reply Claude drafted, in an MCP-style card; Send sends it. */
  | {
      type: "email";
      to: string;
      subject: string;
      body: string;
      /** The quiet line under the header, e.g. the thread it replies on. */
      thread: string;
      /** `sample`: an example of what the agent sends, with no Send (its note instead). */
      status: "draft" | "sent" | "sample";
      /** The header, if not "Reply in Gmail"; and, for a sample, the footer's note. */
      header?: string;
      note?: string;
    };

export type ApprovalBlock = Extract<CoworkBlock, { type: "approval" }>;

export type ChoiceBlock = Extract<CoworkBlock, { type: "choice" }>;

export type QuoteBlock = Extract<CoworkBlock, { type: "quote" }>;

export type DashboardBlock = Extract<CoworkBlock, { type: "dashboard" }>;

/** `event` marks a message the live agent posted on its own: replies never append to it. */
export type CoworkMessage = { id: string; role: "user" | "assistant"; event?: true; blocks: CoworkBlock[] };

/**
 * A scripted beat. Beats play in order, each after `wait` ms. `thinking` shows
 * the spark with a label until the next beat; `block` appends to Claude's
 * reply; `grow` reveals the next integrations step; `agentIcon` gives the
 * sidenav row its agent icon (right after Claude says it'll set up an agent).
 * The rest feed the right-hand panel: `progress` (steps done), `skill` and
 * `connector` and `sources` (Context) and `file` (Working folder).
 * `notice` pops a Slack notification with that text, from Salesforce unless
 * `noticeFrom` names another sender (Slackbot, for a reminder); `stop` takes
 * the agent off the live list.
 */
export type Beat = {
  wait: number;
  thinking?: string;
  block?: CoworkBlock;
  grow?: true;
  agentIcon?: true;
  progress?: number;
  skill?: string;
  connector?: AppId;
  file?: string;
  sources?: Source[];
  notice?: string;
  noticeFrom?: string;
  stop?: true;
  /** Pin Claude's plan above the prompt bar. */
  plan?: PlanItem[];
  /** Move tasks on the plan along, by id. */
  planStatus?: Record<string, PlanItem["status"]>;
};

/** The right-hand panel's state for one session (the live app's Progress,
 *  Working folder and Context). */
export type PanelState = { progress: number; sources: Source[]; skills: string[]; connectors: AppId[]; files: string[] };

/** A session's script: its progress steps, then what plays on send and on
 *  Start agent (or a scheduled task's Schedule). */
export type CoworkScript = {
  steps: string[];
  opening: Beat[];
  onStart: Beat[];
  /** What the live agent posts on its own once started, each `wait` ms after
   *  the last, with Salesforce's Slack notification (independent of the chat's beats).
   *  `dashboard` updates the session's first dashboard card to match. */
  watch?: { wait: number; block: CoworkBlock; dashboard?: Partial<DashboardBlock> }[];
  /** The in-chat prompt bar's placeholders once the agent is live: tips on
   *  what to ask it, shown in turn. */
  hints?: string[];
  /** Scripted answers to the chips, keyed by the chip's text. */
  replies?: Record<string, Beat[]>;
  /** Prompts Aaron types or dictates: any message matching `match` plays the
   *  reply under `reply`, so the wording can be Aaron's own. A reply of
   *  `approve:<id>` approves that approval card, and `send-email` sends the
   *  drafted email, as if Aaron had clicked. */
  intents?: { match: RegExp; reply: string }[];
  /** What the in-chat mic dictates, in turn: the next one Aaron hasn't sent yet. */
  dictations?: string[];
  /** A scheduled task's run, while Aaron's away: it lands all at once, as
   *  its own message, when the presenter pops the next morning's Slack banner. */
  run?: { blocks: CoworkBlock[]; file?: string; progress?: number };
  /** What plays when Aaron sends a drafted email from its card. */
  onEmailSent?: Beat[];
  /** What plays when Aaron approves (or declines) an approval card, by its id. */
  approvals?: Record<string, { approve: Beat[]; decline: Beat[] }>;
};
