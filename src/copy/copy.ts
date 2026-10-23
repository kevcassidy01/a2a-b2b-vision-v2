/**
 * copy.ts — the single source of truth for user-facing text.
 *
 * Change any string ONCE, here, and it updates everywhere it's referenced.
 * Reference by key (e.g. `copy.shell.newChat`) — never hard-code strings in
 * components.
 *
 * Structure mirrors the shell / experience separation:
 *   - `shell`      — the chrome (buttons, placeholders, empty states).
 *   - experiences  — each authored experience owns its own copy block,
 *                    added under its own key as they're built.
 *
 * `as const` gives literal types, so `Copy` autocompletes every key and the
 * compiler flags typos or removed keys still in use. The shape is also
 * i18n-ready: it can be swapped behind a real i18n lib later without a rewrite.
 */

export const copy = {
  app: {
    /** Product name. Also the browser tab / document title. */
    name: "Claude XKit",
    documentTitle: "Claudeforce",
  },
  /** Demo chrome that floats above both views (not part of either app). */
  demo: {
    /** Floating Browser ↔ Desktop switch (COWORK_INTENT §5). */
    viewToggle: {
      label: "Switch view",
      browser: "Browser",
      desktop: "Desktop",
    },
  },
  /** The agent-to-agent B2B prototype (A2A_INTENT): one split screen, John's
   *  storefront on an iPhone (left) and Alex's Command Center in a generic AI
   *  chat app shell (right). */
  a2a: {
    /** The AI app shell's sidenav, laid out like Cowork's (header icons, nav,
     *  projects, recents, account footer) but deliberately not Claude or ChatGPT.
     *  Alex is a Fizz Drinks seller, so the chats are a seller's. */
    shell: {
      search: "Search",
      collapse: "Collapse sidebar",
      nav: {
        newChat: "New chat",
        artifacts: "Artifacts",
        agents: "Agents",
        scheduled: "Scheduled",
      },
      /** The Command Center is an artifact Alex has pinned: it sits open under Artifacts, and it's the page on screen. */
      pinnedArtifact: "B2B Command Center",
      projectsLabel: "Projects",
      newProject: "New project",
      /** The first folder is expanded, showing its chats; the rest are closed. */
      projects: [
        {
          name: "Oktoberfest 2026 · DACH",
          chats: [
            "Munich bottler allocation",
            "Promo depth vs. margin floor",
            "Fizz Zero launch kit for Bavaria",
          ],
        },
        { name: "Q4 key accounts", chats: [] },
        { name: "Pricing and contracts", chats: [] },
        { name: "Territory planning", chats: [] },
      ],
      recentsLabel: "Recents",
      recents: [
        "Why are Hamburg reorders down 12% this month",
        "Draft renewal terms for Rheinland Getränke",
        "Summarise last week's pipeline changes",
        "Fizz Classic vs. Zero sell-through by region",
        "Prep for Thursday's distributor call",
      ],
      user: {
        name: "Alex Rivera",
        initials: "AR",
        email: "alex.rivera@fizzdrinks.com",
      },
    },
    phone: {
      time: "9:41",
      placeholder: "Storefront",
    },
    /** Alex's Command Center: the MCP app's full-screen frame, then the app itself. */
    commandCenter: {
      frame: { title: "B2B Command Center", share: "Share", close: "Close" },
      greeting: "Good morning, Alex",
      store: "Fizz Drinks B2B",
      openStore: "Open store",
      opensInNewTab: "(opens in a new tab)",
      /** The currency picker: USD by default. */
      currency: {
        label: "Currency",
        default: "USD",
        options: [
          { code: "INR", name: "Indian Rupee" },
          { code: "USD", name: "US Dollar" },
          { code: "GBP", name: "British Pound" },
        ],
      },
      /** Where the numbers come from, and which systems they cover (Org data and Both by default). */
      source: { label: "Data source", options: ["Org data", "Demo data"] },
      scope: { label: "Data scope", options: ["CRM", "Data 360", "Both"] },
      /** The view (a mode of the Command Center), Console by default. */
      view: { label: "View", options: ["Console", "Dashboard", "Service"] },
      /** The period the figures cover, Today by default. */
      period: {
        label: "Period",
        options: [
          "Today",
          "MTD",
          "QTD",
          "YTD",
          "6 months",
          "1 year",
          "All time",
        ],
      },
      /** Which stores the figures cover, this store by default. */
      storeScope: {
        label: "Stores",
        default: "Fizz Drinks B2B",
        options: ["All stores", "Fizz Drinks B2B"],
      },
      /** Section headings, top to bottom. */
      sections: {
        last12Months: {
          title: "Last 12 months",
          subtitle:
            "Oct 23, 2025 - Oct 23, 2026, 10:11 • compared with Oct 23, 2024 - Oct 23, 2025, the same elapsed time. Days are counted in UTC+1.",
        },
      },
      /** Quote requests from the storefront waiting on the seller (empty for now). */
      approvals: {
        title: "Needs your approval",
        count: 0,
        autoApproval: "Auto-approval",
        checked: "Checked Oct 23, 2026, 10:11; it checks every 15 s while this page is open.",
        empty: "No storefront quote requests are waiting.",
      },
      /** The last 12 months at a glance. `delta` is the rise on the prior 12
       *  months; `compare` names that prior figure. */
      metrics: [
        { label: "Orders", value: "188", delta: "4%", compare: "vs the prior 12 months (181)" },
        { label: "Order value", value: "$956K", delta: "62%", compare: "vs the prior 12 months ($590.2K)" },
        { label: "Avg order value", value: "$5,085", delta: "56%", compare: "vs the prior 12 months ($3,261)" },
        { label: "Checkout success", value: "55.6%", compare: "vs the prior 12 months (no checkouts)" },
        { label: "Carts with errors", value: "13" },
        { label: "Abandoned cart value", value: "$97" },
        { label: "Buying accounts", value: "30", delta: "7%", compare: "vs the prior 12 months (28)" },
        { label: "Open cases", value: "14" },
      ],
      /** Read out before a metric's rise, which is shown as an arrow. */
      up: "Up",
      refresh: "Refresh",
      notifications: "Notifications",
      /** The seller agent. Its status is read out to screen readers; the dots show it visually. */
      agent: {
        label: "Agent",
        working: "Agent is working",
        done: "Agent has finished",
        asking: (n: number) =>
          `Agent has ${n} ${n === 1 ? "question" : "questions"} for you`,
      },
    },
  },
  /** The simulated Mac desktop (COWORK_INTENT). */
  desktop: {
    /** Aaron's employer, the Salesforce customer (decision 10). One place to rebrand. */
    brand: { name: "Ohana Networks", domain: "ohananetworks.com" }, // also Aaron's email domain in the Cowork footer
    /** The Slack banner the presenter pops with Ctrl+S (decision 47): Claude, in
     *  Slack, saying the daily brief is ready. */
    slackBanner: {
      app: "Slack",
      sender: "Claude",
      body: "Good morning, Aaron ☀️\nYour daily brief is ready.",
      time: "now",
      close: "Close",
      /** The dashboard the Scheduled card and Jump in open, once the brief has run. */
      opens: "Morning Brief",
    },
    /** The Slack banner from the Salesforce app each time a live agent acts;
     *  the body is the agent's one-line title (from the store). */
    salesforceNotice: {
      app: "Slack",
      sender: "Salesforce",
      time: "now",
      close: "Close",
    },
    menuBar: {
      apple: "Apple menu",
      /** The frontmost app, shown bold. */
      app: "Claude",
      menus: ["File", "Edit", "View", "Go", "Window", "Help"],
      /** The Claude app menu, as in Somnath's screenshot. Groups are split by
       *  separators; `submenu` shows a chevron. Items don't act yet. */
      appMenu: [
        [{ label: "About Claude" }],
        [
          { label: "Settings…", shortcut: "⌘ ," },
          { label: "Check for Updates…" },
        ],
        [{ label: "Services", submenu: true }],
        [
          { label: "Hide Claude", shortcut: "⌘ H" },
          { label: "Hide Others", shortcut: "⌥ ⌘ H" },
          { label: "Show All" },
        ],
        [{ label: "Quit Claude", shortcut: "⌘ Q" }],
      ] as { label: string; shortcut?: string; submenu?: boolean }[][],
      /** Menu-bar extras: Aaron also runs Salesforce agents. */
      agentforce: "Agentforce",
      salesforce: "Salesforce",
      wifi: "Wi-Fi",
      battery: "Battery",
      spotlight: "Spotlight",
      controlCenter: "Control Center",
    },
    window: {
      title: "Claude",
      trafficLights: { close: "Close", minimize: "Minimize", zoom: "Zoom" },
    },
    /** The Cowork app inside the window (labels that differ from the browser shell). */
    cowork: {
      sidebar: {
        search: "Search",
        back: "Back",
        forward: "Forward",
        homeOrCode: "Home or Code",
        home: "Home",
        code: "Code",
        /** The long-running agents Claude chose to create (decision 45). Its own
         *  item beside the live app's Scheduled, which keeps its timed tasks. */
        agents: "Agents",
        scheduled: "Scheduled",
      },
      /** The banner under the start state's prompt box. Modelled on the live
       *  app's "Finish setting up…" nudge, but the connector is already in, so
       *  it invites you to learn what Claude can now do instead. */
      /** Files dragged from the desktop into the start state's prompt box. */
      home: {
        dropHint: "Drop files to add them to this session",
        removeFile: "Remove",
      },
      salesforceBanner: {
        title: "Claude is connected to Salesforce",
        body: "Ask about your accounts, quotes, orders and storefront, or have Claude act on them for you. See what's possible.",
        cta: "Explore",
        dismiss: "Dismiss",
      },
      /** Quick options under the banner (the live app's "Ideas for you" slot).
       *  Short and generic: the demo's own prompts are spoken, not picked. */
      quickStart: {
        title: "Jump in",
        /** Tops the list once the morning's brief has run. */
        brief: "Daily brief",
        items: [
          "Catch me up on my accounts",
          "Prep me for my next meeting",
          "Draft a quote",
          "Reorder for a customer",
        ],
      },
      /** Chrome for Cowork's own chat view (the scripts carry their content). */
      chat: {
        ranSkill: "Ran skill",
        usedIntegrations: (n: number) =>
          `Used ${n} integration${n === 1 ? "" : "s"}`,
        usingIntegrations: "Using integrations",
        writingSalesforce: "Writing to Salesforce",
        wroteRecords: (n: number) => `Wrote ${n} records to Salesforce`,
        called: "Called",
        thingsIllDo: "What it'll do",
        asksFirst: "Asks you first",
        readsFrom: "Reads from",
        details: "Details",
        createAgent: "Create agent",
        createdAgent: "Created agent:",
        startAgent: "Start agent",
        cancel: "Cancel",
        sources: "Sources",
        openInSalesforce: "Open in Salesforce",
        openInSlack: "Open in Slack",
        viewAll: (n: number) => `View all ${n}`,
        fixedInPolicy: "Done within policy",
        /** An approval card: something Claude won't do without Aaron's OK. */
        /** Claude's plan, pinned above the prompt bar. */
        plan: {
          title: "Plan",
          done: (n: number, of: number) => `${n} of ${of} done`,
          claude: "Claude does",
          you: "Needs you, one at a time",
          claudeDone: (n: number) => `Claude did ${n} on its own`,
          yourCall: "Your call",
          youNext: (n: number) => `${n} need you next`,
          toggle: "Show or hide the plan",
        },
        approval: {
          needsOk: "Needs your OK",
          notNow: "Not now",
          approved: "Approved:",
          declined: "Left for now:",
          why: "Why I picked this",
        },
        inCloud: "Runs in the cloud",
        /** The scheduled task's card, after the live app's (docs/references/cowork/scheduled-task.png). */
        scheduleTask: "Schedule task",
        createdTask: "Created scheduled task:",
        schedule: "Schedule",
        alsoChanges: "Also changes:",
        onThisComputer: "Only on this computer",
        instructions: "Each run",
        superseded: "Updated below",
        /** The setup questions under /schedule's explainer. */
        /** A drafted Gmail reply. */
        email: {
          header: "Reply in Gmail",
          to: "To",
          subject: "Subject",
          send: "Send",
          sent: "Sent",
          openInGmail: "Open in Gmail",
        },
        /** The right-hand panel, after the live app's. */
        panel: {
          toggle: "Toggle panel",
          /** Every session's dashboards, always first in the panel: this agent's, then the rest. */
          artifacts: "Artifacts",
          artifactsEmpty: "Dashboards your agents build appear here.",
          fromThisAgent: "From this agent",
          otherArtifacts: "Other artifacts",
          progress: "Progress",
          progressEmpty: "Progress on longer tasks appears here.",
          folder: "Working folder",
          folderEmpty: "View and open files created during this task.",
          context: "Context",
          sources: "Sources",
          skills: "Skills",
          /** The chip on top of the panel once the session is building an agent, then once it's running. */
          longRunning: "Long-running agent",
          scheduledTask: "Scheduled task",
          liveAgent: "Live",
          connectors: "Connectors",
          connectorNames: {
            salesforce: "Salesforce Headless 360",
            slack: "Slack",
            gmail: "Gmail",
            calendar: "Google Calendar",
            asana: "Asana",
            gong: "Gong",
            files: "Your files",
          },
        },
      },
      /** The Agents page, built like Scheduled but lighter: a header and a few
       *  quick starts. The agents Aaron creates in sessions get listed above these later. */
      agentsPage: {
        title: "Agents",
        search: "Search agents",
        subline: [
          "Agents work toward a goal on their own, and check in when they need you. Type",
          "/agents",
          "in any session to build one.",
        ],
        newAgent: "New agent",
        templates: [
          {
            id: "goal",
            title: "Work toward a goal",
            body: "Break a goal into steps and keep making progress on it every day.",
            when: "Checks in daily",
          },
          {
            id: "research",
            title: "Research a question",
            body: "Dig into a question across the web and your files, and report back.",
            when: "Runs until it's done",
          },
          {
            id: "followup",
            title: "Follow up for me",
            body: "Keep track of open threads and nudge people when replies go quiet.",
            when: "Weekdays at 9:00 AM",
          },
          {
            id: "watch",
            title: "Watch for changes",
            body: "Keep an eye on something that matters to you, and act when it changes.",
            when: "Wakes when something changes",
          },
        ],
      },
      /** The Scheduled page, as in the live app (docs/references/cowork/
       *  live-scheduled-01.png): the header, then the six templates. Each
       *  template's `preview` titles the card that peeks out on hover. */
      scheduledPage: {
        title: "Scheduled tasks",
        subline: [
          "Run tasks on a schedule or whenever you need them. Type",
          "/schedule",
          "in any existing task to set one up.",
        ],
        search: "Search tasks",
        newTask: "New task",
        /** What clicking the Daily briefing template sends to start the brief's session. */
        briefingPrompt: "Set up a daily briefing",
        /** The scheduled brief's card, above the templates once it's set up. */
        taskBody:
          "A short summary, today's focus list, accounts at risk and what to fix on your store.",
        taskWhen: "Weekdays at 8:30 AM",
        nextRun: "Next run tomorrow, 8:30 AM",
        lastRun: "Last run today, 8:30 AM",
        templates: [
          {
            id: "briefing",
            title: "Daily briefing",
            body: "What needs your attention today across calendar, email, and messages.",
            when: "Weekdays at 8:00 AM",
            preview: "Today's brief",
          },
          {
            id: "inbox",
            title: "Inbox triage",
            body: "Categorize your inbox and draft replies to anything urgent.",
            when: "Weekdays at 8:00 AM",
            preview: "Inbox",
          },
          {
            id: "meeting",
            title: "Meeting prep",
            body: "A short brief before each meeting on your calendar, covering attendees, context, and agenda.",
            when: "Weekdays at 8:00 AM",
            preview: "Next meeting",
          },
          {
            id: "weekly",
            title: "Weekly review",
            body: "A Friday summary of what happened this week.",
            when: "Every Friday at 4:00 PM",
            preview: "This week",
          },
          {
            id: "content",
            title: "Content ideas",
            body: "Draft a few post ideas each week from the latest news in your industry.",
            when: "Every Monday at 9:00 AM",
            preview: "Post ideas",
          },
          {
            id: "monitor",
            title: "Monitor a topic",
            body: "Watch for news or mentions of a topic, competitor, or keyword.",
            when: "Daily at 9:00 AM",
            preview: "Mentions",
          },
        ],
      },
      /** The run of show's four sessions, fixed at the top of the sidenav. Each
       *  reads "New session" until its first prompt is sent, then takes its
       *  title and its `kind` icon, with a when-it-runs tooltip (decisions 28, 45):
       *  the two agents get Waypoints, the brief (a scheduled task) gets the
       *  clock, and the Canary Wharf one is a plain chat with none (decision 29).
       *  `prompt` is the scripted dictation for its opening prompt (decision 40): the
       *  agents' from §4.2, Canary Wharf's from §4.6. A `|` is a hesitation (a
       *  pause mid-thought, "umm… and also"); it isn't typed. */
      flows: {
        placeholder: "New session",
        items: [
          {
            id: "delivery",
            title: "Delivery Watch",
            kind: "agent",
            schedule: "Wakes on order, fulfillment and cart changes",
            prompt:
              "Watch every open order and cart for the next 60 days. If an order is going to ship late, stock runs short at a warehouse, or a cart stalls before checkout, investigate it using Salesforce data and fix what you can within our existing policies. | If a fix affects pricing, margins, or requires an exception, bring it to me with your recommendation and the evidence behind it.",
          },
          {
            id: "growth",
            title: "Growth Scout",
            kind: "agent",
            schedule: "Runs daily at 7 AM for 1 week",
            prompt:
              "For any account that hasn't ordered in 30 days, send them an approved quote for their most-ordered product. Set the quantity from their average order and apply 5% off. Run this daily for a week. | Also build me a dashboard of quotes sent versus orders they turned into, then send me a summary so we can keep going or pivot.",
          },
          {
            id: "brief",
            title: "Morning Brief",
            kind: "task",
            schedule: "Weekdays at 8:30 AM, ready by 9",
            // Started from the Scheduled page's Daily briefing template (decision 54);
            // this is Aaron's dictated answer to its setup template, a line per answer.
            prompt:
              "Every weekday morning. | Go through my accounts, my store, my inbox and Slack, and what both my agents did overnight. | Have it ready by 9 AM. | Give me a short summary, a focus list for today, the accounts at risk and what to fix on my store.",
          },
          {
            id: "prestige",
            title: "Canary Wharf Manchester quote",
            kind: "chat",
            schedule: null,
            prompt:
              "Just off my call with Canary Wharf. My notes, their floor plan and a photo of the comms room are here. Tom's emailed their requirements, and the call's on Gong. | Build the Manchester cart, sort out whatever else they need, and get a quote to Priya today. They move in on 3 December.",
          },
        ],
      },
      /** The prompt box's Chat | Cowork switch (in place of the Salesforce chip). */
      composer: {
        mode: "Chat or Cowork",
        chat: "Chat",
        cowork: "Cowork",
      },
      /** The Settings modal (AccountMenu → Settings), from Somnath's screenshots
       *  of the live app. Only General, Skills and Connectors have panes; the
       *  other nav rows are presentational. */
      settings: {
        close: "Close settings",
        nav: [
          {
            caption: "Settings",
            items: [
              { id: "general", label: "General" },
              { id: "account", label: "Account" },
              { id: "privacy", label: "Privacy" },
              { id: "usage", label: "Usage" },
              { id: "capabilities", label: "Capabilities" },
              { id: "claudeCode", label: "Claude Code" },
              { id: "cowork", label: "Cowork" },
            ],
          },
          {
            caption: "This computer",
            items: [
              { id: "system", label: "System" },
              { id: "extensions", label: "Extensions" },
              { id: "developer", label: "Developer" },
            ],
          },
          {
            caption: "Customize",
            items: [
              { id: "skills", label: "Skills" },
              { id: "connectors", label: "Connectors" },
              { id: "plugins", label: "Plugins" },
            ],
          },
        ],
        general: {
          appearance: "Appearance",
          theme: "Theme",
          chatFont: "Chat font",
          chatFontValue: "Anthropic Serif",
          textSize: "Transcript text size",
          textSizeHint: "Size of the conversation transcript text.",
          textSizes: ["Small", "Medium", "Large"],
          motion: "Motion",
          motionHint:
            "Reduce animation in streaming responses and other interface elements.",
          motions: ["System", "Reduced"],
          voice: "Voice",
          language: "Language",
          languageValue: "English",
          style: "Style",
          styleValue: "Buttery",
          speed: "Speed",
          speedValue: "Normal",
          notifications: "Notifications",
          toggles: [
            {
              label: "Response completions",
              hint: "Get notified when Claude has finished a response. Useful for long-running tasks.",
            },
            {
              label: "Code notifications",
              hint: "Claude can choose to notify you about important updates from a Code session.",
            },
            {
              label: "Code permission requests",
              hint: "Get a push notification when Claude needs your approval to run a command in a Code session.",
            },
            {
              label: "Emails from Claude Code cloud sessions",
              hint: "Get an email when a cloud session has finished building or needs your response.",
            },
          ],
        },
        /** Shared by the Skills and Connectors panes' headers. */
        list: {
          yours: "Yours",
          discover: "Discover",
          search: "Search",
          filter: "Filter",
          sort: "Sort",
          add: "Add",
        },
        skills: {
          title: "Skills",
          emptyTitle: "Add your first skills",
          emptyBody:
            "Skills teach Claude how you work. Add them from Discover, or create your own.",
          discoverCta: "Discover skills",
          orgCaption: "From your organization",
          /** Badge beside every org skill (Sales Cloud in the live app). */
          source: "Salesforce Headless 360",
          updated: "2d ago",
          /** The Salesforce skills (ids from `shell.composer.skills.salesforceItems`), A–Z. */
          items: [
            {
              id: "account-360",
              description:
                "Build a 360-degree brief on a buyer account from Commerce: orders, open quotes, entitlements, cases and spend trends.",
            },
            {
              id: "add-note",
              description:
                "Add a note to a quote, order or account record so the next person picks up where you left off.",
            },
            {
              id: "add-to-cart",
              description:
                "Add products to a buyer's cart on their behalf, with their contract pricing and entitlements applied.",
            },
            {
              id: "approve-quote",
              description:
                "Review a pending quote against discount policy, then approve, reject or send it back with comments.",
            },
            {
              id: "checkout",
              description:
                "Check out a cart on a buyer's behalf: shipping, payment terms and PO number, then place the order.",
            },
            {
              id: "entitlement-check",
              description:
                "Check which products, price books and discounts a buyer account is entitled to before you quote.",
            },
            {
              id: "find-products",
              description:
                "Search the Commerce catalog by name, SKU or need, with the buyer's pricing and stock levels.",
            },
            {
              id: "order-on-behalf",
              description:
                "Place an order for a buyer from a conversation, an email or site-visit notes, end to end.",
            },
            {
              id: "reorder",
              description:
                "Rebuild a buyer's previous order as a new cart, with today's prices and stock.",
            },
            {
              id: "store-health",
              description:
                "Check a storefront's health: conversion, cart abandonment, searches with no results and slow pages.",
            },
          ],
        },
        connectors: {
          title: "Connectors",
          columns: { connector: "Connector", type: "Type", status: "Status" },
          web: "Web",
          connected: "Connected",
          connect: "Connect",
          /** A–Z. `connected` ones are the demo's; the rest show a Connect button.
           *  `logo` is a file in public/connectors/ (Somnath's); a row without
           *  one would show an initial tile. */
          items: [
            { name: "Asana", connected: false, logo: "/connectors/asana.svg" },
            {
              name: "Confluence",
              connected: false,
              logo: "/connectors/confluence.svg",
            },
            {
              name: "GitHub",
              connected: false,
              logo: "/connectors/github.svg",
            },
            { name: "Gmail", connected: true, logo: "/connectors/gmail.svg" },
            {
              name: "Google Calendar",
              connected: true,
              logo: "/connectors/google-calendar.svg",
            },
            { name: "Gong", connected: true, logo: "/connectors/gong.png" },
            {
              name: "Google Drive",
              connected: true,
              logo: "/connectors/google-drive.svg",
            },
            {
              name: "Notion",
              connected: false,
              logo: "/connectors/notion.svg",
            },
            {
              name: "Salesforce Headless 360",
              connected: true,
              badge: "Custom",
              logo: "/salesforce.svg",
            },
            { name: "Slack", connected: true, logo: "/connectors/slack.svg" },
            {
              name: "Tableau",
              connected: false,
              badge: "Community",
              logo: "/connectors/tableau.svg",
            },
          ] as {
            name: string;
            connected: boolean;
            badge?: string;
            logo?: string;
          }[],
        },
      },
    },
    /** Files on Aaron's desktop, top to bottom: the Canary Wharf session's context,
     *  dragged into its prompt box (today's call notes, their floor plan, the comms room). */
    files: [
      { name: "Canary Wharf call notes.txt", kind: "text" },
      { name: "CanaryWharf_Floorplan_L1-L3.pdf", kind: "pdf" },
      { name: "Comms room.jpg", kind: "photo" },
    ] as { name: string; kind: "text" | "pdf" | "photo" }[],
    /** Every file in the demo, by name: its kind and size, for the file chips'
     *  "PDF · 3.4 MB" line (the desktop's, then the ones Tom emailed). */
    fileInfo: {
      "Canary Wharf call notes.txt": "Text · 2 KB",
      "CanaryWharf_Floorplan_L1-L3.pdf": "PDF · 3.4 MB",
      "Comms room.jpg": "JPEG image · 1.8 MB",
      "Manchester_requirements.xlsx": "Excel · 24 KB",
      "Floorplan_rev-B.pdf": "PDF · 2.1 MB",
    } as Record<string, string>,
    /** First lines of Canary Wharf call notes.txt, shown tiny in its Finder preview. */
    notesPreview: [
      "Canary Wharf call · Wed 14 Oct",
      "Priya (ops) + Tom (IT)",
      "Manchester, 3 floors",
      "18 APs? cart only has 12",
      "Move-in 3 Dec, hard date",
      "Other vendor quoted $410/AP",
      "Reuse their SW-24s?",
      "Tom sending reqs + new plan",
      "Jess + Marta will order",
    ],
  },
  shell: {
    /** Sidenav wordmark. */
    wordmark: "Claude",
    /** Sidebar collapse toggle — used as both its aria-label and tooltip. */
    toggleSidebar: "Hide sidebar",
    /** Chat/Code segmented switcher on the wordmark row (interactive, no-op). */
    segmented: {
      chat: "Chat",
      code: "Code",
    },
    /** Sidenav search field placeholder (input is presentational for now). */
    searchPlaceholder: "Search",
    /** Section caption above the recents list (claude.ai calls it "Recents"). */
    recentsCaption: "Chats and tasks",
    /** aria-label for the recents preferences (sliders) button. */
    recentsPrefs: "Preferences",
    /** The sidenav's three fixed chats — one per authored journey. These ARE
     *  the journey selector (no new-chat creation in this build): clicking one
     *  arms that experience and starts it from scratch. Labels double as the
     *  top-bar chat title. Keyed by `ExperienceId` (see chat/experiences). */
    experiences: {
      quote: "Quote approval",
      checkout: "Checkout anywhere",
      insights: "Merchant insights",
    },
    /** Dummy history below the journey chats (presentational, not clickable
     *  into anything). Two run long on purpose to show the edge fade. */
    pastChats: [
      "Spring catalog price book",
      "Why are Q2 cart abandonment rates higher on mobile checkout for B2B buyers",
      "Agentforce order status agent",
      "Bulk-update product images",
      "Map Data Cloud segments to Commerce buyer groups and entitlement policies",
      "Shipping rules for Canada",
    ],
    /** Dummy account (footer row). Initial shows in the avatar; the chevron
     *  and download affordances are presentational (aria-labels only). */
    account: {
      email: "aaron@alpine.com",
      initial: "A",
      name: "Aaron",
      menu: "Account menu",
      download: "Download apps",
      /** Account menu (opens upward from the footer email button). All
       *  presentational; "Learn more" carries a dummy chevron. */
      items: {
        theme: "Theme",
        /** Theme segmented control (System / Light / Dark). Interactive but
         *  presentational — dark theme isn't built yet (light-only for now);
         *  this is a hook for forkers. */
        themeOptions: {
          system: "System",
          light: "Light",
          dark: "Dark",
        },
        settings: "Settings",
        language: "Language",
        help: "Get help",
        upgrade: "Upgrade plan",
        apps: "Get apps and extensions",
        learnMore: "Learn more",
        logout: "Log out",
      },
    },
    /** Tooltip on the main-stage incognito (ghost) button — presentational. */
    incognito: "Use incognito",
    /** Main-stage "Share" button (top-right, 28px small variant) — dummy. */
    share: "Share",
    /** Action row below each assistant response (aria-labels). The real
     *  product also shows speak + thumbs-down; we intentionally keep only
     *  copy / like / retry. All presentational. */
    messageActions: {
      copy: "Copy",
      like: "Good response",
      dislike: "Bad response",
      retry: "Retry",
    },
    /** The active chat's title menu (top-left of the main stage). The title is
     *  plain text; only the trailing chevron opens this menu. All
     *  presentational — the shortcut letters and the Add-to-project chevron
     *  open/do nothing. */
    chatMenu: {
      /** aria-label for the chevron trigger. */
      options: "Chat options",
      pin: "Pin",
      rename: "Rename",
      addToProject: "Add to project",
      shareChat: "Share chat",
      delete: "Delete",
    },
    /** Main-stage composer (prompt box). Mostly presentational; the model
     *  picker (below) is the one genuinely interactive piece. */
    composer: {
      placeholder: "How can I help you today?",
      attach: "Add content",
      dictate: "Dictate",
      /** Dictation's recording-state buttons. */
      dictateCancel: "Cancel",
      dictateDone: "Done",
      voice: "Voice mode",
      send: "Send",
      /** Model picker — footer trigger button + upward popover menu. */
      model: {
        /** aria-label for the trigger button. */
        label: "Choose model",
        /** Default selected model (must match one of `options[].name`). */
        default: "Opus 5.5",
        /** The primary model list. Selecting one swaps the trigger label —
         *  the only interactive behavior. The Pro / Pro-or-Max badges and
         *  Upgrade pills from claude.ai are intentionally omitted. */
        options: [
          { name: "Fable 5.1", description: "For your toughest challenges" },
          { name: "Opus 5.5", description: "Most capable for ambitious work" },
          {
            name: "Sonnet 5",
            description: "Most efficient for everyday tasks",
          },
          { name: "Haiku 4.5", description: "Fastest for quick answers" },
        ],
        /** Effort + More models rows — chevrons are presentational (no
         *  submenu opens). */
        effort: "Effort",
        effortValue: "Medium",
        moreModels: "More models",
        /** Footer note; `learnMore` is the underlined trailing link. */
        note: "Fable 5.1 is included in Max plans, or available with usage credits on Pro.",
        learnMore: "Learn more",
      },
      /** The in-chat (thinner, bottom-anchored) prompt box. Shares the model
       *  picker + "+" menu with the new-chat box; differs in layout (single
       *  row, big pill) and its right-side control (a return/↵ send, dimmed
       *  until there's text). The disclaimer + model label sit below the pill. */
      inChat: {
        placeholder: "Write a message…",
        disclaimer:
          "Claude is AI and can make mistakes. Please double-check cited sources.",
      },
      /** Slash skills. Typing "/" (at the start or after a space) opens a menu
       *  of available skills; picking one drops an atomic chunk into the box.
       *  Default skills are always available (grey chunk); the Salesforce set
       *  appears only when the Commerce connector is on (light-blue chunk),
       *  led by `ask` + `report`. Ids double as the displayed label
       *  (lowercase, hyphenated). See `src/shell/skills.ts`. */
      skills: {
        /** Ghost hint shown right after the "/" while the query is empty. */
        filterPlaceholder: "Type to filter",
        /** aria-label for the skill menu. */
        menuLabel: "Skills",
        defaultItems: [
          "export-report",
          "google-workspace",
          "import-memory",
          "morning",
          "skill-creator",
        ],
        /** Salesforce skills across ALL three journeys — the slash menu is
         *  intentionally exhaustive, not scoped to the selected chat (updated on
         *  the go). Grouped by journey: quote approval, checkout anywhere,
         *  merchant insights. */
        salesforceItems: [
          // Quote approval
          "entitlement-check",
          "find-products",
          "add-note",
          "approve-quote",
          // Checkout anywhere
          "order-on-behalf",
          "add-to-cart",
          "checkout",
          "reorder",
          // Merchant insights
          "account-360",
          "store-health",
        ],
      },
      /** The "+" add-content menu (footer left). Mostly presentational; only
       *  Skills and Add connector open real submenus. Toggles (Web search,
       *  Memory) flip a check. The ⌘U shortcut on "files" is intentionally
       *  omitted. Icons are paired in the component. */
      add: {
        /** Tooltip on the "+" trigger. */
        tooltip: "Add files, connectors, and more",
        files: "Add files or photos",
        screenshot: "Take a screenshot",
        project: "Add to project",
        skills: "Skills",
        connector: "Add connector",
        designSystem: "Design system",
        plugins: "Add plugins",
        webSearch: "Web search",
        memory: "Memory",
        /** aria-label for the "×" on the connected-connector chip. */
        disconnect: "Disconnect",
        /** Label on the always-on connector chip beside "+" (logo + this word).
         *  Just "Salesforce" — the connector itself is "Salesforce Commerce" in
         *  the menu, but the in-composer chip reads cleaner as one word. */
        connectorChip: "Salesforce",
        /** Skills submenu. `items` are dummy skill names (same glyph each). */
        skillsMenu: {
          items: ["import-memory", "morning", "skill-creator"],
          manage: "Manage skills",
          browse: "Browse skills",
        },
        /** Add-connector submenu. `commerce` is the one live connector — it's
         *  connected during setup (always on in this build), shown here as a
         *  static connected row, and reflected by the "Salesforce" chip beside
         *  "+". `items` are dummy connectors (icons paired by position). */
        connectorMenu: {
          commerce: "Salesforce Commerce",
          /** Shown on the connector row — it's connected during setup, not here. */
          connected: "Connected",
          items: ["Gmail", "Google Drive", "Google Calendar"],
          manage: "Manage connectors",
          browse: "Browse connectors",
        },
      },
    },
    /** Suggestion chips below the composer (presentational, inert). Salesforce
     *  actions in place of claude.ai's Write · Learn · Code; labels only, icons
     *  are paired by position in the component. */
    suggestions: [
      "Lightning Design System",
      "Debug Apex",
      "Learn on Trailhead",
    ],
    /** Main-stage empty/home greeting. `timeOfDay` is static for now (will be
     *  time-based later); rendered as "{timeOfDay} {account.name}". */
    greeting: {
      timeOfDay: "Morning",
    },
    /** Primary sidenav items (top group). */
    nav: {
      new: "New",
      projects: "Projects",
      artifacts: "Artifacts",
      code: "Code",
      customize: "Customize",
    },
    /** Keyboard shortcut hints shown on nav-item hover (presentational).
     *  Customize has none. */
    shortcuts: {
      new: "Ctrl+O",
      projects: "Ctrl+P",
      artifacts: "Ctrl+A",
      code: "Ctrl+C",
    },
    newChat: "New chat",
    /** Legacy new-chat auto-title pool. Unused now the sidenav holds three fixed
     *  journey chats (titled from `shell.experiences`) with no new-chat creation;
     *  kept for forkers who re-enable an FTUX. */
    draftNames: [
      "Morton Account Quotes",
      "Quarterly planning notes",
      "Debugging a React error",
      "Marketing copy draft",
      "Trip itinerary ideas",
      "SQL query help",
      "Naming a new feature",
      "Meeting summary",
    ],
    inputPlaceholder: "Reply to Claude…",
    thinking: "Thinking…",
    emptyTitle: "What are we working on?",
  },
} as const;

export type Copy = typeof copy;
