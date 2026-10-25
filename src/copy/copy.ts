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
    documentTitle: "Agentic Commerce Vision",
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
        email: "alex.rivera@fizzdrinks.com",
      },
    },
    phone: {
      time: "9:41",
      placeholder: "Storefront",
      /** Safari's bottom bar (iOS 26, compact). */
      safari: {
        domain: "partners.fizzdrinks.com",
        back: "Back",
        pageMenu: "Page menu",
        reload: "Reload",
        stop: "Stop loading",
        more: "More",
        expand: "Show the address bar",
      },
    },
    /** The bar under the stage: who is acting right now. People at the ends,
     *  their agents meeting in the middle. */
    actors: {
      label: "Who's acting",
      active: "acting",
      john: "John",
      johnAgent: "John's agent",
      alexAgent: "Alex's agent",
      alex: "Alex",
    },
    /** John's view: Fizz Drinks' B2B store on the phone, before he logs in. */
    storefront: {
      brand: "fizz",
      brandTag: "Partners",
      /** The names drawn on the cans. */
      canLabels: {
        fizz: "fizz",
        zero: "zero",
        lime: "lime",
        bubbl: "bubbl",
        zing: "zing",
        pulp: "pulp",
        brew: "brew",
        cherry: "fizz",
        vanilla: "fizz",
        lemon: "pulp",
      },
      /** On the drums' labels. */
      concentrate: "Concentrate",
      home: "Fizz Partners home",
      logIn: "Log in",
      /** The bell beside John's pill, and how it reads once Mike's cart notification is in. */
      notifications: { label: "Notifications", unread: "Notifications, 1 new" },
      /** Where Log in was, once John is logged in: his avatar and name. */
      account: {
        name: "John",
        label: "Your account",
        fullName: "John Müller",
        role: "Procurement Director",
        company: "Isar Bottling",
      },
      menu: "Menu",
      closeMenu: "Close menu",
      /** John's buyer agent: the bottler's, not Fizz's (A2A_INTENT §3), opened
       *  from the agent button in the header (logged in or not), the card atop
       *  the menu, or Assign to your agent on Mike's cart. Assigning hands the
       *  cart off: John types nothing. The agent works out what's needed (story
       *  steps 3–5) and shows its thinking, its plan, the cart it built and
       *  where it's left the quote. Plan steps have a running and a done form. */
      agent: {
        name: "Your agent",
        owner: "Isar Bottling",
        open: "Open your agent",
        close: "Close your agent",
        fab: "New task",
        card: { title: "Your agent", status: "3 tasks in motion" },
        working: "Working…",
        intro: {
          title: "What should I work on?",
          body: "I buy for Isar Bottling, inside the spend limits and approval rules you set.",
        },
        suggestion: "Assign Oktoberfest stock-up",
        /** Before login, no wall: Fizz's helpful agent for the store's questions.
         *  Delegating tasks is for John's own buyer agent, once he's logged in. */
        signedOut: {
          name: "Fizz agent",
          owner: "Fizz Partners",
          fab: "Ask agent",
          title: "How can I help?",
          body: "Ask about our concentrates, syrups, delivery areas or opening a business account.",
          suggestions: ["Which concentrates do you sell?", "Do you deliver to Munich?", "How do I open an account?"],
          placeholder: "Ask anything",
        },
        handoff: { label: "You assigned this cart", time: "Just now" },
        cart: { name: "Oktoberfest stock-up", meta: "1 line · 5,000 units · Shared with Mike" },
        /** While it reasons, a timeline of what it's doing in its head, one row after another (no "Thinking"):
         *  what it reads and fetches, what it notices, what it wonders. `kind` picks the icon. Folded, they stay in the timeline. */
        mulling: "Working through the cart",
        musings: [
          { kind: "read", text: "Reading Mike's cart and who it's meant for" },
          { kind: "fetch", text: "Pulling Isar's open orders from SAP S/4HANA" },
          { kind: "notice", text: "Noticing Munich has nothing on order for Oktoberfest" },
          { kind: "wonder", text: "Wondering if Mike's 5,000 was meant to cover both plants" },
          { kind: "fetch", text: "Checking plant stock in SAP: Munich has 9 days of cover" },
          { kind: "wonder", text: "Weighing one combined order against two smaller ones" },
        ],
        thought: (s: number) => `Mulled it over for ${s}s`,
        reasoning:
          "Mike started this cart for Frankfurt's Oktoberfest stock. Munich runs the same three weeks and nothing is ordered for it yet. Check Munich's forecast, add what it needs to this cart so it stays one order, then ask Fizz for its best price on the lot.",
        lead: "Mike's cart covers **Frankfurt** for Oktoberfest, but **Munich isn't stocked yet**. I'll top it up for Munich and get Fizz's best price on the whole order.",
        plan: {
          title: "Stock up for Oktoberfest",
          of: "of",
          done: "done",
          toggle: "Show or hide the plan",
          /** Each step names the system it touched and how (`kind`: read, fetch or write), shown once it's done. */
          steps: [
            {
              doing: "Reading Mike's cart",
              done: "Read Mike's cart",
              detail: "**5,000** lemonade concentrate for Frankfurt",
              kind: "read",
              source: "Fizz Partners · cart",
            },
            {
              doing: "Checking Munich's demand forecast",
              done: "Checked Munich's demand forecast",
              detail: "**+40%** over the Oktoberfest weeks",
              kind: "fetch",
              source: "SAP IBP · demand forecast",
            },
            {
              doing: "Finding the right items for Munich",
              done: "Found the right items for Munich",
              detail: "Orange concentrate, Munich's best seller over Oktoberfest",
              kind: "fetch",
              source: "SAP S/4HANA · sales history",
            },
            {
              doing: "Adding 10,000 orange concentrate",
              done: "Added 10,000 orange concentrate",
              detail: "To the same cart, for Munich. Mike can see it.",
              kind: "write",
              source: "Fizz Partners · cart",
            },
            {
              doing: "Asking Fizz for a quote",
              done: "Asked Fizz for a quote",
              detail: "**15,000 units** · **15% off** · Net30",
              kind: "write",
              source: "Fizz seller agent · quote request",
            },
          ],
        },
        result: {
          name: "Oktoberfest stock-up",
          meta: "2 lines · 15,000 units",
          isNew: "New",
          lines: [
            { name: "Lemonade concentrate", qty: "5,000 units", site: "Frankfurt", by: "Mike's agent" },
            { name: "Orange concentrate", qty: "10,000 units", site: "Munich", by: "Your agent", added: true },
          ],
        },
        reply: "Fizz has our quote request: **15,000 units at 15% off, Net30**. I'll negotiate within your limits and only come back to you if the terms change.",
        quote: { id: "Q-1042 v1", status: "Waiting for Fizz to respond", meta: "15,000 units · asking 15% off · Net30" },
        suggestions: ["What are my limits?", "Show the quote"],
        /** Story steps 8–9: Fizz's counter-offer, v2, lands in the thread (on
         *  the right, as the other side's turn), and the agent weighs it. It takes
         *  the extra volume but holds out for 15% at Net30: inside John's limits,
         *  so it doesn't ask him. Limits are dummy. */
        counter: {
          from: "Fizz's agent",
          time: "Just now",
          offer: {
            title: "Counter-offer",
            id: "Q-1042 v2",
            lines: [
              { name: "Orange concentrate", site: "Munich", qty: "12,000", change: "+2,000" },
              { name: "Lemonade concentrate", site: "Frankfurt", qty: "7,500", change: "+2,500" },
            ],
            terms: [
              { label: "Discount", value: "12%", note: "You asked 15%" },
              { label: "Terms", value: "Net30" },
              { label: "Total", value: "$72,072" },
            ],
          },
          mulling: "Weighing Fizz's counter",
          thought: (s: number) => `Weighed it up for ${s}s`,
          musings: [
            { kind: "read", text: "Fizz came back with v2: 12% off at Net30, and more of both" },
            { kind: "fetch", text: "Checking the extra units against the forecast in SAP IBP" },
            { kind: "notice", text: "Both plants can sell 19,500 units over Oktoberfest" },
            { kind: "notice", text: "$72,072 is inside John's $100,000 limit for an order" },
            { kind: "wonder", text: "12% is short of our 15%. Can we keep the volume and push on price?" },
          ],
          lead: "v2 gives us **more volume** but only **12% off**. The extra units fit Oktoberfest demand, so I'll **take the quantities** and **hold out for 15%**.",
          plan: {
            title: "Reply to Fizz",
            of: "of",
            done: "done",
            toggle: "Show or hide the plan",
            steps: [
              {
                doing: "Checking the extra units against demand",
                done: "Checked the extra units against demand",
                detail: "Munich and Frankfurt can sell **19,500 units** over Oktoberfest",
                kind: "fetch",
                source: "SAP IBP · demand forecast",
              },
              {
                doing: "Checking your limits",
                done: "Checked your limits",
                detail: "**$72,072** is inside your **$100,000** limit. No need to ask you.",
                kind: "read",
                source: "Isar buying policy",
              },
              {
                doing: "Taking v2's quantities",
                done: "Took v2's quantities",
                detail: "**12,000** orange and **7,500** lemonade, in the same cart",
                kind: "write",
                source: "Fizz Partners · cart",
              },
              {
                doing: "Asking Fizz for 15%",
                done: "Asked Fizz for 15%",
                detail: "**19,500 units** · **15% off** · Net30",
                kind: "write",
                source: "Fizz seller agent · quote reply",
              },
            ],
          },
          reply: "I've told Fizz we'll take **19,500 units** if they meet us at **15% off, Net30**. That's inside your limits, so there's nothing for you to do yet. I'll come back to you if the terms change.",
          quote: { id: "Q-1042 v2", status: "Waiting for Fizz to respond", meta: "19,500 units · asking 15% off · Net30" },
          /** The back and forth on Q-1042 so far, folded under a chevron before the done mark. `by` picks the avatar. */
          turns: {
            title: (n: number) => `${n} turns on Q-1042`,
            list: [
              { by: "buyer", text: "**John's agent** sent v1: 15,000 units at **15% off**, Net30" },
              { by: "seller", text: "**Fizz's agent** countered with v2: 19,500 units at **12% off**, Net30, $72,072" },
              { by: "buyer", text: "**John's agent** took v2's units and asked for **15% off**" },
              { by: "seller", text: "**Fizz's agent** sent v3a, **15% at Net15**, and v3b, **15% with a Ginger Ale bundle**" },
              { by: "buyer", text: "**You** approved v3a, and **John's agent** placed order **O-5531**" },
            ],
          },
        },
        /** Story step 12: Fizz sends two offers, v3a and v3b, stacked one under
         *  the other (the phone's too narrow for side by side). The agent weighs
         *  the bundle in its thinking, recommends v3a and says why not each of
         *  the others. Net30 → Net15 changes the terms, so it asks John. */
        v3: {
          from: "Fizz's agent",
          time: "Just now",
          offers: {
            title: "Two offers",
            id: "Q-1042 v3a, v3b",
            list: [
              { id: "v3a", name: "15% at Net15", rows: [["Units", "19,500"], ["Discount", "15%"], ["Terms", "Net15"], ["Total", "$69,615"]] },
              {
                id: "v3b",
                name: "15% with a bundle",
                rows: [["Units", "20,500"], ["Discount", "15%"], ["Terms", "Net30"], ["Total", "$73,185"]],
                note: "+1,000 Ginger Ale concentrate, new",
              },
            ],
          },
          mulling: "Weighing both offers",
          thought: (s: number) => `Weighed them up for ${s}s`,
          musings: [
            { kind: "read", text: "Fizz sent two ways to 15%: v3a at Net15, or v3b with a Ginger Ale bundle at Net30" },
            { kind: "fetch", text: "Checking Isar's approved product list" },
            { kind: "notice", text: "Ginger Ale isn't on it, and a new concentrate needs quality sign-off first" },
            { kind: "fetch", text: "Looking for a Ginger Ale demand plan in SAP IBP" },
            { kind: "notice", text: "There isn't one: 1,000 units is about a million litres of a drink Isar has never sold" },
            { kind: "wonder", text: "The bundle adds $3,570 of stock nobody planned. Paying in 15 days costs about $115" },
            { kind: "notice", text: "Net15 isn't the Net30 John set, so this one's his call" },
          ],
          lead: "Fizz met us at **15% off**, two ways. I'd take **v3a, 15% at Net15**. Paying 15 days early costs about **$115**; the bundle adds **$3,570** of a drink we've never sold. The terms change from Net30, so I need your OK.",
          approval: {
            title: "Approve v3a?",
            id: "Q-1042 v3a",
            tag: "Recommended",
            rows: [["Units", "19,500"], ["Discount", "15%"], ["Terms", "Net15"], ["Total", "$69,615"]],
            /** What changed since the terms John set. */
            changed: "Was Net30",
            whyNot: {
              title: "Why not the others",
              list: [
                { name: "v3b, the bundle", text: "Ginger Ale isn't on Isar's approved list and has no demand plan. It adds **$3,570** of unplanned stock." },
                { name: "Holding out at Net30", text: "Fizz can't give 15% at Net30, and Oktoberfest is **three weeks** out." },
              ],
            },
            approve: "Approve v3a",
            approved: "Approved",
          },
          /** Story step 13: John's turn, once he taps Approve. */
          you: { label: "You approved", time: "Just now", text: "Approve v3a" },
        },
        /** Story steps 13–14: the agent accepts v3a with Fizz and places O-5531. */
        order: {
          plan: {
            title: "Place the order",
            of: "of",
            done: "done",
            toggle: "Show or hide the plan",
            steps: [
              {
                doing: "Accepting v3a with Fizz",
                done: "Accepted v3a with Fizz",
                detail: "**19,500 units** · **15% off** · Net15, approved by you",
                kind: "write",
                source: "Fizz seller agent · quote reply",
              },
              {
                doing: "Placing order O-5531",
                done: "Placed order O-5531",
                detail: "**$69,615**, from the cart Mike started",
                kind: "write",
                source: "Fizz Partners · checkout",
              },
              {
                doing: "Logging the purchase order",
                done: "Logged the purchase order",
                detail: "Due in **15 days**. Munich and Frankfurt can see their deliveries.",
                kind: "write",
                source: "SAP S/4HANA · purchase order",
              },
            ],
          },
          card: {
            title: "Order O-5531",
            meta: "19,500 units · 15% off · Net15",
            status: "Placed",
            lines: [
              { name: "Orange concentrate", qty: "12,000 units", site: "Munich" },
              { name: "Lemonade concentrate", qty: "7,500 units", site: "Frankfurt" },
            ],
            total: { label: "Total", value: "$69,615", note: "Due in 15 days" },
          },
          reply: "Done. **O-5531** is placed: **19,500 units at 15% off, Net15**, for **$69,615**. The purchase order is in SAP, and Mike can see it on his cart.",
          suggestions: ["Show the order", "Save as a template"],
        },
        placeholder: "Ask your agent",
        add: "Add",
        send: "Send",
        stop: "Stop",
      },
      /** The menu, a drawer from the right. Logged in: John, his agent, a
       *  search, what a B2B buyer comes back for, then Log out. `count` is a
       *  badge. Logged out: the shop and the way in. */
      nav: {
        label: "Site menu",
        search: "Search products or SKUs",
        signedIn: [
          {
            title: "Buying",
            items: [
              { label: "Carts", icon: "cart", count: 2 },
              { label: "Quick order", icon: "quick" },
              { label: "Buy again", icon: "again" },
              { label: "Order templates", icon: "template" },
              { label: "Quotes", icon: "quote" },
              { label: "Approvals", icon: "approval" },
            ],
          },
          {
            title: "Orders and billing",
            items: [
              { label: "Orders", icon: "order" },
              { label: "Deliveries", icon: "delivery" },
              { label: "Invoices and payments", icon: "invoice" },
            ],
          },
          {
            title: "Account",
            items: [
              { label: "Delivery sites", icon: "site", detail: "Munich, Frankfurt" },
              { label: "Team and permissions", icon: "team" },
              { label: "Agent and limits", icon: "agent" },
            ],
          },
          {
            title: "Help",
            items: [
              { label: "Support and cases", icon: "support" },
              { label: "Your Fizz rep", icon: "rep", detail: "Alex Rivera" },
            ],
          },
        ],
        logOut: "Log out",
        signedOut: [
          {
            title: "Shop",
            items: [
              { label: "Concentrates", icon: "concentrate" },
              { label: "Fountain syrups", icon: "syrup" },
              { label: "New launches", icon: "launch" },
              { label: "Packaging and marketing", icon: "marketing" },
              { label: "Brands", icon: "brand" },
              { label: "Offers", icon: "offer" },
            ],
          },
          {
            title: "Help",
            items: [
              { label: "Delivery areas", icon: "delivery" },
              { label: "Help centre", icon: "support" },
              { label: "Contact sales", icon: "rep" },
            ],
          },
        ],
      },
      /** The store's home once John is logged in (story step 1): Mike's cart
       *  waiting for him, then what he buys with. Euro: John buys in Germany.
       *  Prices are still to be set (A2A_INTENT §12), so none show. */
      accountHome: {
        greeting: "Good morning, John",
        company: "Isar Bottling · 2 delivery sites",
        notice: {
          from: "Mike",
          title: "Mike started a cart",
          body: "Oktoberfest stock-up: 5,000 lemonade concentrate for Frankfurt.",
          /** What the cart's worth, on a line of its own (dummy: $4.20 a unit). */
          value: "$21,000",
          valueLabel: "Cart value",
          time: "now",
          cta: "Open cart",
          assign: "Assign to your agent",
        },
        quick: [
          { label: "Quick order", icon: "quick" },
          { label: "Buy again", icon: "again" },
          { label: "Quotes", icon: "quote" },
          { label: "Invoices", icon: "invoice" },
        ],
        carts: {
          title: "Your carts",
          all: "All carts",
          items: [
            { name: "Oktoberfest stock-up", meta: "Started by Mike today", lines: "1 line · 5,000 units", shared: "Shared" },
            { name: "Weekly restock, Munich", meta: "Saved Oct 16", lines: "4 lines · 1,240 units" },
          ],
        },
        account: {
          title: "Your account",
          credit: { label: "Credit available", value: "$84,200", of: "of $150,000", share: 0.56 },
          rows: [
            { label: "Payment terms", value: "Net30" },
            { label: "Next delivery", value: "Tue, Oct 27 · Munich" },
            { label: "Open quotes", value: "None" },
          ],
        },
        buyAgain: {
          title: "Buy again",
          add: "Add",
          items: [
            { name: "Pulp Orange concentrate", pack: "1 unit makes 1,000 L", last: "Last ordered Sep 12" },
            { name: "Pulp Lemonade concentrate", pack: "1 unit makes 1,000 L", last: "Last ordered Sep 12" },
            { name: "Fizz cola syrup", pack: "20 L bag-in-box", last: "Last ordered Aug 28" },
          ],
        },
        orders: {
          title: "Recent orders",
          all: "All orders",
          items: [
            { id: "O-5512", date: "Oct 14", total: "$21,860", status: "In transit" },
            { id: "O-5498", date: "Sep 30", total: "$18,420", status: "Delivered" },
            { id: "O-5476", date: "Sep 12", total: "$34,075", status: "Delivered" },
          ],
        },
      },
      hero: {
        label: "Featured offers",
        slideOf: "Go to slide",
        slides: [
          {
            eyebrow: "New in",
            title: "Fizz Zero Lime concentrate, now shipping",
            cta: "See the range",
          },
          {
            eyebrow: "Fizz trade credit",
            title: "A credit line that grows with your orders",
            cta: "Apply now",
          },
          {
            eyebrow: "Autumn stock-up",
            title: "12% off concentrate orders over 10,000 units",
            cta: "Log in to order",
          },
        ],
      },
      brands: {
        title: "Shop by brand",
        items: [
          { name: "Fizz", kind: "Cola" },
          { name: "Fizz Zero", kind: "No sugar" },
          { name: "Bubbl", kind: "Sparkling water" },
          { name: "Zing", kind: "Energy" },
          { name: "Pulp", kind: "Juice" },
          { name: "Brew", kind: "Iced tea" },
        ],
      },
      /** What a bottler buys from Fizz: concentrate first (it makes the drinks
       *  itself), then fountain syrups, cases only of what it can't make yet, and
       *  packaging and marketing. A unit of concentrate makes 1,000 L. */
      products: {
        title: "Concentrates",
        subtitle: "Shipped in drums from Fizz's concentrate plant in Cork, Ireland.",
        priceGate: "Log in for trade pricing",
        view: "View",
        items: [
          { name: "Fizz Original", pack: "Cola · 1 unit makes 1,000 L", moq: "Min. 500 units" },
          { name: "Fizz Zero", pack: "No sugar cola · 1 unit makes 1,000 L", moq: "Min. 500 units" },
          { name: "Fizz Cherry", pack: "Cherry cola · 1 unit makes 1,000 L", moq: "Min. 250 units" },
          { name: "Fizz Vanilla", pack: "Vanilla cola · 1 unit makes 1,000 L", moq: "Min. 250 units" },
          { name: "Fizz Zero Lime", pack: "No sugar lime cola · new", moq: "Min. 250 units" },
          { name: "Pulp Orange", pack: "Orange juice drink · 1 unit makes 1,000 L", moq: "Min. 500 units" },
          { name: "Pulp Lemonade", pack: "Cloudy lemonade · 1 unit makes 1,000 L", moq: "Min. 500 units" },
        ],
      },
      syrups: {
        title: "Fountain syrups",
        subtitle: "Bag-in-box, for the bars and restaurants you supply.",
        items: [
          { name: "Fizz cola syrup", pack: "20 L bag-in-box" },
          { name: "Fizz Zero syrup", pack: "20 L bag-in-box" },
          { name: "Pulp Lemonade syrup", pack: "10 L bag-in-box" },
          { name: "Brew iced tea syrup", pack: "10 L bag-in-box" },
        ],
      },
      launches: {
        title: "New launches",
        subtitle: "Made by Fizz and sold by the case, until your lines can make them.",
        items: [
          { name: "Zing Energy Mango", pack: "24 × 250 ml cans · Test market", moq: "Min. 20 cases" },
          { name: "Brew Peach Iced Tea", pack: "12 × 500 ml bottles · Limited edition", moq: "Min. 20 cases" },
        ],
      },
      marketing: {
        title: "Packaging and marketing",
        items: [
          { name: "Oktoberfest cooler and display kit", detail: "For 50 outlets · Ships in 5 days", icon: "kit" },
          { name: "Label and sleeve artwork", detail: "Approved files for every pack", icon: "artwork" },
          { name: "Fizz closures, 38 mm", detail: "Cartons of 5,000", icon: "closure" },
        ],
      },
      feature: {
        eyebrow: "Multi-plant ordering",
        title: "One account for every plant",
        body: "Order concentrate for all your plants at once, with a delivery slot and an invoice for each site.",
        link: "Learn more",
      },
      perks: {
        title: "Why buy direct",
        items: [
          { title: "Volume pricing", body: "Tiered prices that drop as your order grows." },
          { title: "Net terms", body: "Pay in 30 days once your account is approved." },
          { title: "Scheduled delivery", body: "Pick a slot for each plant and we ship before your lines run low." },
        ],
      },
      login: {
        title: "Log in",
        subtitle: "Welcome back to Fizz Partners.",
        email: "Work email",
        emailPlaceholder: "name@company.com",
        password: "Password",
        showPassword: "Show password",
        forgot: "Forgot password?",
        submit: "Log in",
        signingIn: "Logging in",
        newHere: "New to Fizz Partners?",
        /** What iOS AutoFill puts in (John, the buyer). */
        autofill: { email: "john.mueller@isarbottling.de", password: "fizz-partners-26" },
      },
      cta: {
        title: "Ready to restock?",
        body: "Log in to see your prices, past orders and quotes.",
        request: "Request a business account",
      },
      footer: {
        links: ["About Fizz", "Contact sales", "Delivery areas", "Returns", "Help centre"],
        legal: ["Terms of trade", "Privacy", "Cookies"],
        copyright: "© 2026 Fizz Drinks Ltd. All rights reserved.",
      },
    },
    /** Alex's Command Center: the MCP app's full-screen frame, then the app itself. */
    commandCenter: {
      frame: {
        title: "B2B Command Center",
        updated: "Data updated 20 minutes ago",
        reload: "Reload",
        share: "Share",
        popOut: "Pop out",
        more: "More",
        close: "Close",
      },
      /** What Alex sees first: he's been away, and one tap loads the Command Center. */
      welcome: {
        eyebrow: "14 updates while you were away",
        /** Two lines, broken here. */
        title: ["Every store, every market,", "at your fingertips"],
        body: "Orders, revenue and approvals from all your storefronts, pulled together from Salesforce, Slack and the tools your team already uses.",
        cta: "Load Command Center",
        /** Floating around the edges: what the Command Center tracks, each with its colour dot. */
        signals: ["Orders", "Revenue", "Approvals", "Germany +18%", "Checkout", "Agent handling"],
      },
      greeting: "Good morning, Alex",
      store: "Fizz Partners B2B",
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
      /** The period the figures cover, 6 months by default. */
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
        default: "Fizz Partners",
        options: ["All stores", "Fizz Partners"],
      },
      /** Section headings, top to bottom. */
      sections: {
        /** Shown once John's agent has sent its quote request: what's come in today, above the period. */
        today: {
          title: "Today",
          subtitle: "Oct 23, 2026, so far. Days are counted in UTC+1.",
        },
        last6Months: {
          title: "Last 6 months",
          subtitle:
            "Apr 23, 2026 - Oct 23, 2026, 10:11 • compared with Oct 23, 2025 - Apr 23, 2026, the same elapsed time. Days are counted in UTC+1.",
        },
      },
      /** Quote requests from the storefront waiting on the seller (empty for now). */
      ordersByCountry: {
        title: "Orders by bill-to-country",
        metric: {
          label: "Metric",
          options: [
            "Orders",
            "Order value",
            "Ordering accounts",
            "Abandoned carts",
            "Open cases",
            "Returns",
            "At-risk accounts",
            "Product demand",
          ],
        },
        ask: "Ask about this",
        export: "Export CSV",
        scope: "Orders: all stores",
        description:
          "Orders in the period, by the bill-to address on the order. The bill-to address stands in for ship-to, which the org does not record.",
        zoomIn: "Zoom in",
        zoomOut: "Zoom out",
        reset: "Reset",
        fullScreen: "Full screen",
        byCountry: "By country",
        /** Orders in the last 6 months; `none` have no bill-to country. With
         *  them, the total is the Orders tile's 188. `at` is where the bubble
         *  sits ([longitude, latitude]); `label` names it on the map. */
        total: 188,
        /** Once O-5531 is in: one more order, from Germany. */
        afterOrder: { code: "DE", orders: 9, total: 189 },
        none: "4 orders have no bill-to country.",
        countries: [
          { name: "United States", code: "US", orders: 116, at: [-98, 39], label: true },
          { name: "Canada", code: "CA", orders: 14, at: [-106, 58], label: true },
          { name: "Brazil", code: "BR", orders: 11, at: [-52, -10], label: true },
          { name: "Germany", code: "DE", orders: 8, at: [10.4, 51.2], label: true },
          { name: "India", code: "IN", orders: 8, at: [79, 22], label: true },
          { name: "Japan", code: "JP", orders: 6, at: [138.5, 36.5], label: true },
          { name: "United Arab Emirates", code: "AE", orders: 6, at: [54, 24], label: false },
          { name: "United Kingdom", code: "GB", orders: 4, at: [-2, 53], label: false },
          { name: "Australia", code: "AU", orders: 3, at: [134, -25], label: false },
          { name: "France", code: "FR", orders: 3, at: [2.5, 46.5], label: false },
          { name: "Mexico", code: "MX", orders: 3, at: [-102, 23.5], label: false },
          { name: "Netherlands", code: "NL", orders: 2, at: [5.3, 52.2], label: false },
        ],
      },
      monthlyRevenue: {
        title: "Monthly revenue (USD), last 24 months",
        scope: "Orders: all stores",
        ask: "Ask about this",
        export: "Export CSV",
        description: "Sum of order totals by order month; the last bar is month to date.",
        monthToDate: "month to date",
        /** Revenue by order month, oldest first, in thousands of USD; the last
         *  is October 2026 so far. Every third month is labelled on the axis. */
        months: [
          { label: "Nov 24", k: 40 }, { label: "Dec 24", k: 56 }, { label: "Jan 25", k: 44 },
          { label: "Feb 25", k: 19 }, { label: "Mar 25", k: 38 }, { label: "Apr 25", k: 45 },
          { label: "May 25", k: 44 }, { label: "Jun 25", k: 59 }, { label: "Jul 25", k: 43 },
          { label: "Aug 25", k: 82 }, { label: "Sep 25", k: 36 }, { label: "Oct 25", k: 84 },
          { label: "Nov 25", k: 38 }, { label: "Dec 25", k: 67 }, { label: "Jan 26", k: 41 },
          { label: "Feb 26", k: 46 }, { label: "Mar 26", k: 61 }, { label: "Apr 26", k: 73 },
          { label: "May 26", k: 76 }, { label: "Jun 26", k: 31 }, { label: "Jul 26", k: 62 },
          { label: "Aug 26", k: 63 }, { label: "Sep 26", k: 37 }, { label: "Oct 26", k: 332 },
        ],
      },
      checkoutFunnel: {
        title: "Checkout funnel",
        ask: "Ask about this",
        export: "Export CSV",
        description:
          "Carts created in the period, followed to checkout and an order. Each share is of the step before; pending and activated split the orders placed by their CRM status.",
        /** The steps, each with the step it comes `from` and what its share is
         *  `of`. `drop` marks where carts leave the funnel; `waiting`, orders waiting on
         *  someone (yellow). Checkout started to
         *  Order placed (20 of 36) is the Checkout success tile's 55.6%. */
        nodes: [
          { id: "carts", label: "Carts created", n: 109 },
          { id: "checkout", label: "Checkout started", n: 36, from: "carts", of: "of carts created" },
          { id: "noCheckout", label: "No checkout", n: 73, from: "carts", of: "of carts created", drop: true },
          { id: "ordered", label: "Order placed", n: 20, from: "checkout", of: "of checkouts" },
          { id: "noOrder", label: "No order", n: 16, from: "checkout", of: "of checkouts", drop: true },
          { id: "pending", label: "Pending approval", n: 6, from: "ordered", of: "of orders placed", waiting: true },
          { id: "activated", label: "Activated", n: 14, from: "ordered", of: "of orders placed" },
        ],
      },
      activity: {
        title: "Activity",
        scope: "Orders: all stores",
        ask: "Ask about this",
        export: "Export CSV",
        description:
          "The newest orders in the period. J and K move through the list and Enter opens the row; quotes and cases open their account.",
        kind: { label: "Activity", options: ["Orders", "Carts", "Quotes", "Cases"] },
        columns: { date: "Date", order: "Order", account: "Account", status: "Status", total: "Total" },
        /** The Orders tile's 188, of which the newest 12 show. All in 2026, so dates drop the year. */
        total: 188,
        /** "12 of 188" under the table. */
        of: "of",
        showAll: "Show all",
        /** `tone` colours the status's dot: done, in progress, waiting on someone, not started. */
        statuses: {
          activated: { label: "Activated", tone: "success" },
          created: { label: "Created", tone: "info" },
          pending: { label: "Pending approval", tone: "warning" },
          draft: { label: "Draft", tone: "neutral" },
        },
        /** O-5531, once it's placed (story step 14): it joins the top of the list. */
        newRow: { date: "Oct 23, 10:24", order: "O-5531", store: "Fizz Partners", account: "Isar Bottling", status: "created", total: "$69,615" },
        rows: [
          { date: "Oct 22, 11:01", order: "00001882", store: "Fizz Partners", account: "Boston Barista Co.", status: "activated", total: "$10,125" },
          { date: "Oct 22, 09:47", order: "00001881", store: "Fizz Partners", account: "Isar Getränke GmbH", status: "pending", total: "$24,600" },
          { date: "Oct 21, 16:12", order: "00001880", store: "Alpine B2B", account: "Alpenhof Hotels", status: "created", total: "$1,500" },
          { date: "Oct 21, 08:30", order: "00001879", store: "Fizz Partners", account: "Lakeshore Grocers", status: "activated", total: "$3,840" },
          { date: "Oct 20, 20:39", order: "00001878", store: "Fizz Partners", account: "Maple Leaf Vending", status: "activated", total: "$2,105" },
          { date: "Oct 20, 14:05", order: "00001877", store: "Alpine B2B", account: "Rheinland Bottling", status: "pending", total: "$18,250" },
          { date: "Oct 19, 19:36", order: "00001876", store: "Fizz Partners", account: "Harbor Café Group", status: "activated", total: "$500" },
          { date: "Oct 19, 05:30", order: "00001875", store: "Fizz Partners", account: "São Paulo Bebidas", status: "created", total: "$6,720" },
          { date: "Oct 18, 19:04", order: "00001874", store: "Alpine B2B", account: "Tokyo Kissa Co.", status: "activated", total: "$304" },
          { date: "Oct 18, 18:29", order: "00001873", store: "Fizz Partners", account: "Northwind Foodservice", status: "pending", total: "$9,410" },
          { date: "Oct 14, 06:10", order: "00001872", store: "Fizz Partners", account: "Prairie Wind Markets", status: "activated", total: "$1,290" },
          { date: "Oct 12, 03:26", order: "00001871", store: "Alpine B2B", account: "Midwest Campus Dining", status: "draft", total: "$52,009" },
        ],
      },
      approvals: {
        title: "Task pipeline",
        checked: "Checked Oct 23, 2026, 10:11; it checks every 15 s while this page is open.",
        empty: "No storefront quote requests yet.",
        /** The quote request from John's agent, once it's sent: the seller agent has already picked it up. */
        request: {
          id: "Q-1042 v1",
          from: "Isar Bottling",
          /** Read in one at a time by the seller agent. */
          meta: ["15,000 units", "asking 15% off", "Net30"],
          /** Who it's assigned to, as an avatar pill; dots bounce while the agent works on it. */
          agent: "Agent responding",
          /** Read out before the id: the row opens the request in the agent's drawer. */
          open: "Open",
          working: "working on it",
          time: "Just now",
          /** Once the seller agent has sent v2: the row shows it, and the agent waits on the buyer (no dots). */
          countered: {
            id: "Q-1042 v2",
            meta: ["19,500 units", "12% off", "Net30"],
            agent: "Waiting on Isar",
          },
          /** Isar's agent has held out for 15%: the seller agent is at it again, then hands it to Alex. */
          heldOut: { id: "Q-1042 v2", meta: ["19,500 units", "asking 15% off", "Net30"], agent: "Agent responding", needsYou: "Needs you" },
          /** Alex sent both: v3a and v3b are out, waiting on the buyer. */
          v3: { id: "Q-1042 v3a, v3b", meta: ["19,500 units", "15% off", "Net15 or bundle"], agent: "Waiting on Isar" },
          /** Isar took v3a: approved on both sides. */
          accepted: { id: "Q-1042 v3a", meta: ["19,500 units", "15% off", "Net15"], agent: "Approved" },
          /** The order's in: the row becomes O-5531, done. */
          ordered: { id: "O-5531", meta: ["From Q-1042 v3a", "19,500 units", "$69,615"], agent: "Order placed" },
        },
      },
      /** The last 6 months at a glance. `delta` is the rise on the prior 6
       *  months; `compare` names that prior figure. */
      metrics: [
        { label: "Orders", value: "188", delta: "4%", compare: "vs the prior 6 months (181)" },
        { label: "Order value", value: "$956K", delta: "62%", compare: "vs the prior 6 months ($590.2K)" },
        { label: "Avg order value", value: "$5,085", delta: "56%", compare: "vs the prior 6 months ($3,261)" },
        { label: "Checkout success", value: "55.6%", compare: "vs the prior 6 months (no checkouts)" },
        { label: "Carts with errors", value: "13" },
        { label: "Abandoned cart value", value: "$97" },
        { label: "Buying accounts", value: "30", delta: "7%", compare: "vs the prior 6 months (28)" },
        { label: "Open cases", value: "14" },
      ],
      /** Once O-5531 is in (story step 14): the tiles it moves, by label, as they then read. */
      afterOrder: {
        Orders: { value: "189", delta: "4%", compare: "vs the prior 6 months (181)" },
        "Order value": { value: "$1.03M", delta: "74%", compare: "vs the prior 6 months ($590.2K)" },
        "Avg order value": { value: "$5,427", delta: "66%", compare: "vs the prior 6 months ($3,261)" },
      } as Record<string, { value: string; delta: string; compare: string }>,
      /** Read out before a metric's rise, which is shown as an arrow. */
      up: "Up",
      refresh: "Refresh",
      notifications: "Notifications",
      /** The seller agent. Its status is read out to screen readers; the dots show it visually. */
      agent: {
        label: "Agent",
        /** The drawer the Agent button opens: no chat yet, just what's around it. */
        close: "Close Agent",
        status: "Fizz's seller agent",
        newChat: "New chat",
        history: "Chat history",
        more: "More",
        /** The chat about Q-1042, once Alex opens the request: what came in, then the agent taking it in. It doesn't conclude yet. */
        quote: {
          from: "Isar Bottling's agent",
          time: "Just now",
          request: {
            title: "Quote request",
            id: "Q-1042 · v1",
            from: "Isar Bottling · Oktoberfest stock-up",
            status: "New",
            /** Column heads for the lines. Prices are dummy, $4.20 a unit list price. */
            columns: { name: "Product", qty: "Units", amount: "List price" },
            lines: [
              { name: "Orange concentrate", site: "Munich", qty: "10,000", amount: "$42,000" },
              { name: "Lemonade concentrate", site: "Frankfurt", qty: "5,000", amount: "$21,000" },
            ],
            /** What they ask, as facts: the discount, the terms, and what it comes to. */
            terms: [
              { label: "Discount asked", value: "15%" },
              { label: "Payment terms", value: "Net30" },
              { label: "Total at ask", value: "$53,550", note: "$63,000 list price" },
            ],
            via: "Received over A2A · signed by Isar Bottling",
            open: "Open in Salesforce",
          },
          /** One at a time; `label` heads the timeline while that musing is the one at work. Varied on purpose: not "thinking" throughout. */
          musings: [
            { kind: "read", label: "Reading the request", text: "15,000 units across two sites, Munich and Frankfurt" },
            { kind: "read", label: "Reading the request", text: "They're asking for 15% off at Net30, ahead of Oktoberfest" },
            { kind: "fetch", label: "Pulling up the account", text: "Looking up Isar Bottling's account and price book in Salesforce", tool: { name: "dispatch_readonly", target: "buyer-profile-management" } },
            { kind: "notice", label: "Pulling up the account", text: "A steady account: 3 orders this year, all paid on time" },
            { kind: "fetch", label: "Checking our rules", text: "Checking the discount policy for this account", tool: { name: "get_sor_detail", target: "b2b-merchant-quote-management" } },
            { kind: "notice", label: "Checking our rules", text: "Policy allows up to 12% at Net30, so 15% is over the line" },
            { kind: "wonder", label: "Weighing it up", text: "Munich's demand is up for Oktoberfest. Could they take more volume?" },
            { kind: "wonder", label: "Considering a counter", text: "A bigger order at a smaller discount might work for both sides" },
          ],
          /** Ahead of a Salesforce tool call (a musing's or a check's `tool`): "Called `dispatch_readonly` <SOR>", as on Cowork. */
          called: "Called",
          /** Where it stays once it's run through them, still at work, before it folds. */
          hold: "Weighing the options",
          weighed: (s: number) => `Weighed it up for ${s}s`,
          /** What it'll do, once it's weighed it up. */
          lead: "Isar wants **15% at Net30**, but the most I can give is **12%**. Before I counter, I'll check stock, their price book and their credit.",
          /** Fizz's checks before an offer goes out, then the counter. Present tense while running, past once done. */
          plan: {
            title: "Checks before countering",
            of: "of",
            done: "done",
            toggle: "Show or hide the checks",
            steps: [
              { doing: "Checking stock in Munich and Frankfurt", done: "Checked stock in Munich and Frankfurt", detail: "**14,000** orange in Munich, **9,000** lemonade in Frankfurt: room for more", kind: "fetch", source: "Omnichannel Inventory", tool: { name: "dispatch_readonly", target: "merchant-catalog-management" } },
              { doing: "Pulling Isar's price book", done: "Pulled Isar's price book", detail: "**$4.20** a unit list price, with a volume tier from **18,000 units**", kind: "fetch", source: "Revenue Cloud", tool: { name: "dispatch_readonly", target: "promotion-management" } },
              { doing: "Checking the discount policy", done: "Checked the discount policy", detail: "Up to **12% at Net30**. More, or Net15, needs a person", kind: "read", source: "Pricing policy", tool: { name: "get_sor_detail", target: "b2b-merchant-quote-management" } },
              { doing: "Checking Isar's credit", done: "Checked Isar's credit", detail: "**$250,000** limit, **$38,000** open: room for this order", kind: "fetch", source: "Billing", tool: { name: "dispatch_readonly", target: "merchant-payment-management" } },
              { doing: "Drafting counter-offer v2", done: "Drafted counter-offer v2", detail: "More volume at 12%: **12,000** orange and **7,500** lemonade", kind: "write", source: "Revenue Cloud", tool: { name: "dispatch_write", target: "b2b-merchant-quote-management" } },
              { doing: "Sending v2 to Isar Bottling's agent", done: "Sent v2 to Isar Bottling's agent", detail: "Over A2A, signed by Fizz Drinks", kind: "write", source: "A2A" },
            ],
          },
          /** The counter-offer it sent, as a knowledge card. */
          counter: {
            title: "Counter-offer",
            id: "Q-1042 · v2",
            for: "To Isar Bottling · Oktoberfest stock-up",
            status: "Waiting on Isar",
            lines: [
              { name: "Orange concentrate", site: "Munich", qty: "12,000", change: "+2,000", amount: "$50,400" },
              { name: "Lemonade concentrate", site: "Frankfurt", qty: "7,500", change: "+2,500", amount: "$31,500" },
            ],
            terms: [
              { label: "Discount", value: "12%", note: "They asked 15%" },
              { label: "Payment terms", value: "Net30" },
              { label: "Total", value: "$72,072", note: "$81,900 list price" },
            ],
            via: "Sent over A2A · signed by Fizz Drinks",
          },
          reply: "I've countered with **v2: 12% off, not the 15% they asked**, the most I can give at Net30. Munich's Oktoberfest demand can take more, so I offered **2,000 more orange** and **2,500 more lemonade**. That takes the order to **$72,072**, up from $53,550. I'll tell you when Isar's agent replies.",
          /** The back and forth on Q-1042 so far, folded under a chevron before the done mark. `by` picks the avatar. */
          turns: {
            title: (n: number) => `${n} turns on Q-1042`,
            list: [
              { by: "buyer", text: "**Isar's agent** asked for v1: 15,000 units at **15% off**, Net30" },
              { by: "seller", text: "**Fizz's agent** countered with v2: 19,500 units at **12% off**, Net30, $72,072" },
              { by: "buyer", text: "**Isar's agent** took v2's units and held out for **15% off**, Net30" },
              { by: "seller", text: "**Fizz's agent** sent v3a, **15% at Net15**, and v3b, **15% with a Ginger Ale bundle**" },
              { by: "buyer", text: "**Isar's agent** took v3a, approved by John Müller, and placed order **O-5531**" },
            ],
          },
          /** Story step 9, Fizz's side: Isar's agent takes v2's units and holds out for 15%. Fizz's agent weighs it and finds only Alex can get there. */
          heldOut: {
            from: "Isar Bottling's agent",
            time: "Just now",
            reply: {
              title: "Reply to v2",
              id: "Q-1042 · v2",
              from: "Isar Bottling · Oktoberfest stock-up",
              status: "New",
              lines: [
                { name: "Orange concentrate", site: "Munich", qty: "12,000", amount: "$50,400" },
                { name: "Lemonade concentrate", site: "Frankfurt", qty: "7,500", amount: "$31,500" },
              ],
              terms: [
                { label: "Discount asked", value: "15%", note: "You offered 12%" },
                { label: "Payment terms", value: "Net30" },
                { label: "Total at ask", value: "$69,615", note: "$81,900 list price" },
              ],
              via: "Received over A2A · signed by Isar Bottling",
            },
            /** First, a short read of what came back, then what it heard, before it deliberates. */
            understand: {
              musings: [
                { kind: "read", label: "Reading Isar's reply", text: "They'll take all 19,500 units from v2" },
                { kind: "notice", label: "Comparing it with v2", text: "They've kept Net30 and gone back to 15% off, not the 12% I offered" },
              ],
              hold: "Taking it in",
              done: (s: number) => `Read Isar's reply in ${s}s`,
              said: "Isar's agent will take v2's **19,500 units**, but it's holding out for **15% off at Net30**, not the 12% I offered. Let me see what I can put together.",
            },
            musings: [
              { kind: "fetch", label: "Checking the price book", text: "Checking Isar's volume tiers for 19,500 units", tool: { name: "dispatch_readonly", target: "promotion-management" } },
              { kind: "notice", label: "Checking the price book", text: "19,500 clears the 18,000-unit tier, but that tier tops out at 12%" },
              { kind: "fetch", label: "Checking our rules", text: "Checking what the policy allows past 12%", tool: { name: "get_sor_detail", target: "b2b-merchant-quote-management" } },
              { kind: "notice", label: "Checking our rules", text: "15% is allowed at Net15, or with a bundle, and either needs a person to sign off" },
              { kind: "fetch", label: "Looking for room", text: "Looking for a bundle Isar's account can get", tool: { name: "dispatch_readonly", target: "merchant-catalog-management" } },
              { kind: "notice", label: "Looking for room", text: "Margret Reyes's agent set up a Ginger Ale launch bundle: 1,000 units of the new concentrate keeps 15% at Net30" },
              { kind: "wonder", label: "Weighing it up", text: "Two ways to 15%, Net15 or the bundle. Alex should choose, and Isar can pick" },
            ],
            lead: "15% at Net30 is past the **12%** I can give, so this one's your call. There are two ways to get Isar to 15%: **Net15**, or the **Ginger Ale bundle** Margret's agent set up. I'd send both and let Isar's agent pick.",
          },
          /** Story step 10: Alex's call, as two offers side by side. Both are picked to start; only "Send both" plays on in the demo. Picking neither declines. */
          decision: {
            title: "Your call on Q-1042",
            for: "15% is past my limit at Net30",
            ask: "Which should Isar's agent get?",
            status: "Needs you",
            options: [
              {
                id: "v3a",
                name: "15% at Net15",
                rows: [["Units", "19,500"], ["Discount", "15%"], ["Terms", "Net15"], ["Total", "$69,615"]],
                why: "Isar pays in **15 days** instead of 30",
              },
              {
                id: "v3b",
                name: "15% with the bundle",
                tag: "Bundle",
                bundle: { name: "Ginger Ale concentrate", qty: "+1,000", amount: "$4,200", note: "New, only sold in this bundle" },
                rows: [["Units", "20,500"], ["Discount", "15%"], ["Terms", "Net30"], ["Total", "$73,185"]],
                why: "Isar keeps **Net30** and takes the Ginger Ale bundle with its order",
                suggested: { label: "Suggested by", name: "Margret's agent", role: "Sales Director" },
              },
            ],
            pick: "Pick",
            note: { both: "Isar's agent picks one", one: "Only Send both offers plays on in this demo", none: "Pick an offer, or decline: v2 stands" },
            send: { both: "Send both offers", one: (id: string) => `Send ${id}`, none: "Send offer" },
            decline: "Decline",
            notScripted: "Only Send both offers plays on in this demo",
            sent: "Sent",
            sentNote: "Sent both. I'm drafting the offers",
          },
          /** Story step 11: Alex sends both. His turn, then the agent drafts and sends v3a and v3b. */
          v3: {
            you: "Alex",
            said: "Send both: v3a and v3b",
            plan: {
              title: "Sending both offers",
              of: "of",
              done: "done",
              toggle: "Show or hide the steps",
              steps: [
                { doing: "Drafting v3a: 15% at Net15", done: "Drafted v3a: 15% at Net15", detail: "**19,500** units, **$69,615**, paid in 15 days", kind: "write", source: "Revenue Cloud", tool: { name: "dispatch_write", target: "b2b-merchant-quote-management" } },
                { doing: "Drafting v3b: the Ginger Ale bundle", done: "Drafted v3b: the Ginger Ale bundle", detail: "**20,500** units with Ginger Ale, **$73,185**, Net30", kind: "write", source: "Revenue Cloud", tool: { name: "dispatch_write", target: "promotion-management" } },
                { doing: "Sending both to Isar Bottling's agent", done: "Sent both to Isar Bottling's agent", detail: "Over A2A, signed by Fizz Drinks", kind: "write", source: "A2A" },
              ],
            },
            offers: {
              title: "Two offers",
              id: "Q-1042 · v3a, v3b",
              for: "To Isar Bottling · Oktoberfest stock-up",
              status: "Waiting on Isar",
              list: [
                { id: "v3a", name: "15% at Net15", rows: [["Units", "19,500"], ["Discount", "15%"], ["Terms", "Net15"], ["Total", "$69,615"]] },
                { id: "v3b", name: "15% with the bundle", rows: [["Units", "20,500"], ["Discount", "15%"], ["Terms", "Net30"], ["Total", "$73,185"]], note: "+1,000 Ginger Ale" },
              ],
              via: "Sent over A2A · signed by Fizz Drinks",
            },
            reply: "I've sent Isar's agent **both**: v3a, **15% at Net15**, and v3b, **15% at Net30 with 1,000 Ginger Ale** ($73,185). Either way, they get their 15%. I'll tell you which one they pick.",
          },
          /** Story step 13, Fizz's side: John approves v3a and Isar's agent accepts it. */
          accepted: {
            from: "Isar Bottling's agent",
            time: "Just now",
            card: {
              title: "Accepted v3a",
              id: "Q-1042 · v3a",
              from: "Isar Bottling · approved by John Müller",
              status: "Accepted",
              lines: [
                { name: "Orange concentrate", site: "Munich", qty: "12,000", amount: "$50,400" },
                { name: "Lemonade concentrate", site: "Frankfurt", qty: "7,500", amount: "$31,500" },
              ],
              terms: [
                { label: "Discount", value: "15%" },
                { label: "Payment terms", value: "Net15", note: "Paid in 15 days" },
                { label: "Total", value: "$69,615", note: "$81,900 list price" },
              ],
              via: "Received over A2A · signed by Isar Bottling",
            },
            said: "Isar's agent took **v3a, 15% at Net15**, and **John Müller** approved it on their side. Q-1042 is approved on both sides. The order should follow.",
            /** The two offers' status, once Isar's picked. */
            took: "Isar took v3a",
          },
          /** Story step 14, Fizz's side: the order arrives. */
          order: {
            title: "Order",
            id: "O-5531",
            for: "Isar Bottling · from Q-1042 v3a",
            status: "Placed",
            lines: [
              { name: "Orange concentrate", site: "Munich", qty: "12,000", amount: "$50,400" },
              { name: "Lemonade concentrate", site: "Frankfurt", qty: "7,500", amount: "$31,500" },
            ],
            terms: [
              { label: "Discount", value: "15%" },
              { label: "Payment terms", value: "Net15", note: "Due Nov 7" },
              { label: "Total", value: "$69,615", note: "$81,900 list price" },
            ],
            via: "Placed on Fizz Partners B2B by Isar's agent",
            said: "**O-5531** is in: **$69,615**, due in 15 days. It's on your dashboard: orders are up to **189**, and Germany to **9**.",
          },
        },
        empty: {
          title: "Ready when you are, Alex",
          body: "Hand me a task, from a quote to a report, and I'll take it from there. Anything that needs your call comes back to you.",
          suggestionsLabel: "Suggestions",
          suggestions: [
            "What's waiting on me today?",
            "Summarise this week's orders in Germany",
            "Which accounts are near their credit limit?",
            "Show the quotes you're handling",
          ],
        },
        composer: {
          placeholder: "Ask anything, or type @ to add an account or quote",
          context: "Fizz Partners B2B · Last 6 months",
          removeContext: "Remove context",
          add: "Add files or records",
          mention: "Mention an account or quote",
          dictate: "Dictate",
          send: "Send",
          note: "Your agent can make mistakes. Check quotes and terms before they go out.",
        },
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
