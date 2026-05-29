# Yaksha FAQ Platform — Project Specification
### For AI-assisted development · Read this file before every feature

---

## Project Overview

We are building **Yaksha FAQ**, a community-driven FAQ and escalation platform for the Vicharanashala Internship (VINS) cohort at IIT Ropar.

The platform has three pages:
- **Page 1 — Public FAQ** (`/faq`): Official answers, fuzzy search, chatbot widget, deadline-aware surfacing. No login required.
- **Page 2 — Discussion Forum** (`/forum`): Private peer-to-peer workspace for 100 whitelisted cohort members. Google login required.
- **Page 3 — Admin Escalation** (`/escalate`): Accessible only via redirect from an unresolved forum post after 72 hours. Not directly navigable.

The admin dashboard (`/admin`) is a hidden, separately authenticated view for reviewing the queue, publishing FAQ entries, and reading the gap report and cohort pulse heatmap.

---

## Core Philosophy & Hard Constraints

- **Zero generative AI** — no LLMs draft answers. Every official FAQ entry is human-approved.
- **Zero file uploads** — text only. No images, no attachments, at any layer.
- **Community-first triage** — peers filter questions before admin ever sees them.
- **Admin reviews outcomes, not noise** — admin only sees community-validated or truly unanswered questions.
- **Free hosting throughout** — Vercel (frontend), Render (backend), MongoDB Atlas (database). No paid services.

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React.js (Vite) |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| HTTP | Axios (one instance, JWT auto-injected) |
| Auth UI | @react-oauth/google |
| Global state | React Context (auth + user prefs) |
| Fuzzy search | Fuse.js (client-side, no backend cost) |
| Search highlight | mark.js |
| Real-time | socket.io-client |
| Notifications | react-hot-toast |
| Date logic | date-fns |
| Charts (admin) | recharts |
| Icons | Font Awesome |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Auth | Passport.js + passport-google-oauth20 |
| Sessions | jsonwebtoken (JWT, stateless) |
| Real-time | socket.io |
| Cron jobs | node-cron |
| Email | Nodemailer |
| Security | cors, helmet, express-rate-limit |
| Logging | morgan |
| Config | dotenv |

### Database
| Layer | Technology |
|---|---|
| Database | MongoDB (Mongoose ODM) |
| Hosting | MongoDB Atlas free tier |

### Approved UI Component & Asset Libraries
Where ever any asset or library is used, they must ONLY come from the following approved lists:

**UI Component Libraries**
- **shadcn/ui** (Copy & Paste Registry) - https://shadcn.com
- **Mantine UI** (Full-Featured Framework) - https://mantine.dev
- **daisyUI** (Tailwind CSS Plugin) - https://daisyui.com
- **HeroUI** (React Component Library) - https://heroui.com
- **Material UI (MUI)** (Enterprise Framework) - https://mui.com

**Assets & Creative Libraries**
- **UIverse** (Open-Source UI Elements) - https://uiverse.io
- **Figma Community** (Design Assets & Kits) - https://figma.com
- **Font Awesome** (Vector Icons) - https://fontawesome.com
- **Unsplash** (Stock Images) - https://unsplash.com
- **Google Fonts** (Typography) - https://fonts.google.com

**Images & Placeholders**
Use **Lorem Picsum** (https://picsum.photos) for any placeholder images.
- Basic usage: `https://picsum.photos/200/300` (width/height)
- Square image: `https://picsum.photos/200`
- Specific image: `https://picsum.photos/id/237/200/300`
- Static random image: `https://picsum.photos/seed/picsum/200/300`
- Grayscale: `https://picsum.photos/200/300?grayscale`
- Blurred: `https://picsum.photos/200/300/?blur` (optional ?blur=2)
- Formats available: `.jpg`, `.webp` extensions work.

Do not introduce new major libraries without a strong reason. Ask before installing anything new.

---

## Development Philosophy

Build feature by feature. For every feature:
1. Read this file first.
2. Keep the implementation simple.
3. Avoid overengineering.
4. Prefer readable code over clever code.
5. Build the smallest useful version first.
6. Refactor only when repetition appears.

If something is unclear or could be improved, suggest a better approach. If a new library would significantly help, recommend it, explain why, and ask before adding it.

---

## Folder Structure

```
project/
├── client/                        ← React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Page1_FAQ.jsx              ← Public FAQ
│   │   │   ├── Page2_Forum.jsx            ← Whitelisted forum
│   │   │   ├── Page3_Escalate.jsx         ← Redirect-only escalation form
│   │   │   └── AdminDashboard.jsx         ← Hidden admin view
│   │   ├── components/
│   │   │   ├── SearchBar.jsx              ← Fuse.js + mark.js live search
│   │   │   ├── AccordionCard.jsx          ← FAQ category + dropdown answers
│   │   │   ├── FilterTabs.jsx             ← All / Resolved / Unresolved / My Posts
│   │   │   ├── ThreadRow.jsx              ← Forum list item with vote + status badge
│   │   │   ├── AnswerBlock.jsx            ← Peer answer with confidence badge + flag
│   │   │   ├── StatusBar.jsx              ← Live question status (socket-driven)
│   │   │   ├── ChatbotWidget.jsx          ← Floating Yaksha-mini widget
│   │   │   ├── DeadlineBanner.jsx         ← "Relevant right now" strip
│   │   │   ├── ExitConfirmModal.jsx       ← "Did this answer your question?"
│   │   │   ├── PeerFootnote.jsx           ← 200-char community note under FAQ answer
│   │   │   ├── CohortPulseChart.jsx       ← Admin heatmap (recharts)
│   │   │   ├── GapReport.jsx              ← Admin gap signal list
│   │   │   ├── AdminQueue.jsx             ← Approve / override / answer fresh
│   │   │   └── Sidebar.jsx                ← Left nav (sticky, category links)
│   │   ├── context/
│   │   │   └── AuthContext.jsx            ← Google auth state + whitelist flag
│   │   ├── hooks/
│   │   │   ├── useFuzzySearch.js          ← Fuse.js wrapper
│   │   │   ├── useSocket.js               ← socket.io-client connection
│   │   │   ├── useConfidenceScore.js      ← Read-only score display
│   │   │   └── useDeadlinePhase.js        ← date-fns phase calculator
│   │   ├── lib/
│   │   │   ├── axios.js                   ← Axios instance with JWT interceptor
│   │   │   └── socket.js                  ← socket.io-client singleton
│   │   ├── constants/
│   │   │   └── phases.js                  ← Deadline-aware phase config (admin-editable JSON)
│   │   └── App.jsx                        ← Routes + auth guards
│
├── server/                        ← Express backend
│   ├── routes/
│   │   ├── faq.js                         ← GET faqs, POST helpful click, GET search
│   │   ├── forum.js                       ← CRUD threads, POST answers, upvote, flag
│   │   ├── escalate.js                    ← POST Page 3 form submission
│   │   ├── auth.js                        ← Google OAuth callback, JWT issue
│   │   └── admin.js                       ← Queue, approve, publish, gap report
│   ├── services/
│   │   ├── confidenceService.js           ← Score formula + threshold checks
│   │   ├── similarityService.js           ← Fuse.js server-side dedup
│   │   ├── gapTracker.js                  ← Nightly aggregation, writes gap fields
│   │   ├── notificationService.js         ← Nodemailer: resolution email + digest
│   │   └── cronJobs.js                    ← node-cron: archive, escalation, digest
│   ├── models/
│   │   ├── FAQ.js
│   │   ├── Thread.js
│   │   ├── User.js
│   │   ├── Upvote.js
│   │   ├── Escalation.js
│   │   └── Analytics.js
│   ├── middleware/
│   │   ├── authMiddleware.js              ← JWT verify + whitelist check
│   │   └── adminMiddleware.js             ← Admin-only route guard
│   └── server.js
│
└── .env
```

**pages/** are routes only. They compose components and call hooks. No business logic inline.

**components/** are reusable UI blocks. Do not create a component until it is used in more than one place or makes a page significantly easier to read.

**services/** hold all business logic on the backend. Routes are thin — they call services and return responses.

**models/** are Mongoose schemas only. No logic inside models.

---

## MongoDB Collections & Schemas

### db.faqs
```js
{
  question: String,               // The FAQ question text
  answer: String,                 // Official admin-written answer
  category: String,               // e.g. "NOC", "ViBe Platform"
  sectionId: String,              // e.g. "q-3-1" for anchor links
  helpfulCount: Number,           // Sourced from "This answered my question" yes clicks
  resolvedViaEscalation: Boolean, // true if this entered FAQ via Page 3
  peerFootnote: {                 // Optional 200-char community note
    text: String,
    authorName: String,
    approvedByAdmin: Boolean
  },
  gapScore: Number,               // Computed nightly by gapTracker.js
  phase: [String],                // e.g. ["may", "june"] for deadline surfacing
  popularBadge: Boolean,          // Admin-toggled, shows 🔥 badge
  updatedAt: Date
}
```

### db.threads
```js
{
  title: String,                  // max 100 chars (enforced at DB level)
  body: String,                   // max 1500 chars
  authorEmail: String,
  answers: [{
    text: String,                 // max 1500 chars
    authorEmail: String,
    authorName: String,
    confidenceScore: Number,      // computed: upvotes×2 + markedHelpful×5 - reports×3
    markedHelpful: Boolean,       // set by original author only
    flagCount: Number,
    flaggedBy: [String],          // email array, auto-hide at 3
    createdAt: Date
  }],
  upvoteCount: Number,
  status: {
    type: String,
    enum: ["open", "community_resolved", "escalated", "admin_resolved"]
  },
  isArchived: Boolean,
  subscribers: [String],          // emails to notify on resolution (asker + upvoters)
  createdAt: Date,                // TTL index: 14 days → isArchived = true via cron
  escalatedAt: Date               // set when 72hr passes with no resolution
}
```

### db.users
```js
{
  email: String,                  // unique, from whitelist
  name: String,
  isWhitelisted: Boolean,
  isAdmin: Boolean,
  notifyOnResolve: Boolean,       // user preference
  contributionScore: Number,      // answers given × helpfulness ratio
  createdAt: Date
}
```

### db.upvotes
```js
{
  userId: ObjectId,
  threadId: ObjectId,
  isSilentMerge: Boolean          // true if auto-upvoted via similarity dedup
}
// Compound unique index on { userId, threadId }
```

### db.escalations
```js
{
  threadId: ObjectId,             // link to original forum thread
  studentEmail: String,
  questionSummary: String,
  adminResponse: String,
  status: { type: String, enum: ["pending", "answered"] },
  publishedToFAQ: Boolean,
  createdAt: Date
}
```

### db.analytics
```js
{
  eventType: {
    type: String,
    enum: [
      "search_hit",        // FAQ matched a query
      "search_miss",       // chatbot redirected to forum
      "helpful_yes",       // exit confirmation: yes
      "helpful_no",        // exit confirmation: no → forum
      "section_view"       // FAQ section opened
    ]
  },
  section: String,          // FAQ category e.g. "NOC"
  query: String,            // anonymised search query
  userHash: String,         // sha256 of email, not raw email
  createdAt: Date
}
```

---

## Automated Pipeline (node-cron Jobs)

All cron logic lives in `server/services/cronJobs.js`.

```
Every day at 00:00
→ Archive sweep: threads where createdAt < now - 14days → isArchived = true
→ Gap tracker: aggregation query writes gapScore to each db.faqs document

Every hour
→ Escalation check: threads where status = "open"
  AND createdAt < now - 72hrs
  → status = "escalated", escalatedAt = now
  → frontend shows "Submit to Admin" button to original author

Every day at 08:00
→ Admin daily digest email:
  - Threads pending 1-click approval (confidenceScore ≥ 10, markedHelpful = true)
  - Flagged answers needing override
  - Escalated questions with no admin response
  - Top 3 gap signals from last 24hrs
```

---

## Confidence Score System

Lives in `server/services/confidenceService.js`. No library needed.

```js
// Formula
score = (upvotes × 2) + (markedHelpful × 5) - (flagCount × 3)

// Thresholds
score 0–4    → "Unverified" (no badge)
score 5–9    → "Community Pick" (yellow badge)
score ≥ 10   → "High Confidence" (green badge, sent to admin digest)
markedHelpful = true + score ≥ 15 + flagCount = 0
             → "Auto-publish candidate" (admin can ratify in digest, 24hr window to retract)
```

---

## Similarity Deduplication

Lives in `server/services/similarityService.js`. Uses Fuse.js server-side.

```
When a new forum question is submitted:
1. Run Fuse.js against all open (isArchived = false) thread titles
2. If similarity score ≥ 0.75 → do not create new thread
   → silently add upvote to existing thread (isSilentMerge = true)
   → return existing thread ID to frontend
   → frontend shows: "N other interns asked this — being tracked"
3. If similarity score < 0.75 → create new thread normally
```

---

## Gap Tracker Signals

Lives in `server/services/gapTracker.js`. Runs nightly, writes to `db.faqs.gapScore`.

A gap score increases when any of these occur for a given FAQ section:
1. `helpful_no` exit confirmation on that section's answers
2. Same unlisted question posted 3+ times in one week (dedup count from similarity service)
3. `resolvedViaEscalation: true` — this FAQ entry only exists because the system failed
4. High `search_hit` count on a section but low `helpful_yes` rate (answer exists but isn't working)

Admin sees the gap report as a ranked list. Red = rewrite needed. Yellow = surfacing issue. Green = working.

---

## Key Feature Implementations

### Fuzzy Search (Page 1)
- Fuse.js index built client-side from FAQ data fetched on mount
- Live filtering as user types — no debounce needed at this scale
- Matches on question text + answer text + category
- mark.js highlights matching terms inside accordion answers
- If no match → `helpful_no` analytics event logged → chatbot shows redirect to Page 2
- "Did you mean this?" shown for matches scoring 0.60–0.84

### Deadline-Aware Surfacing
- `constants/phases.js` holds the config (admin edits once per cohort cycle):
```js
export const phases = [
  {
    dateRange: ["2026-05-01", "2026-05-20"],
    categories: ["NOC", "Offer Letter"],
    banner: "Starting soon? Most asked questions right now:"
  },
  {
    dateRange: ["2026-05-21", "2026-06-15"],
    categories: ["ViBe Platform", "Team Formation"],
    banner: "Phase 1 is live — common questions this week:"
  }
]
```
- `useDeadlinePhase.js` uses date-fns to find the active phase and return the banner + pinned categories

### Exit Confirmation
- Fires only when: user opened a specific accordion AND spent > 15 seconds on it AND navigates away
- One-tap: "Yes, thanks" logs `helpful_yes` | "No" logs `helpful_no` + redirects to Page 2 search
- Do not fire on every page exit — only after genuine FAQ engagement

### Live Status Bar (Page 2, socket.io)
```
States (4):
● Grey   → "Waiting for community — check back tomorrow"
● Yellow → "Being discussed — N answers, community voting"
● Blue   → "Answer found — admin verifying"
● Green  → "Resolved — now in official FAQ"
● Orange → "Sent to admin — no peer answer in 72hrs"

Socket events:
  server emits "thread:status_change" with { threadId, newStatus }
  client updates StatusBar for subscribed thread
  resolution email sent via Nodemailer to subscribers[]
```

### Admin Queue (Single Page, Three Task Types)
Admin never browses raw forum threads. Queue shows only:
1. **Approve** — community-validated answer, 1-click publish to FAQ
2. **Override** — flagged wrong answer, admin writes correct version
3. **Answer fresh** — 72hr escalation with no peer answer, admin writes from scratch

Daily digest email replaces real-time admin alerts. Admin reviews once daily.

---

## Authentication & Route Guards

```
/faq          → public, no auth
/forum        → Google login required + whitelist check
/escalate     → only reachable via redirect from a 72hr-old unresolved thread
               → direct navigation → redirect to /faq
/admin        → separate admin JWT, not the same as cohort whitelist
```

Whitelist check in `authMiddleware.js`:
```js
const user = await User.findOne({ email: decoded.email })
if (!user || !user.isWhitelisted) return res.status(403).json({ error: "Access restricted to authorized cohort members." })
```

---

## UI Rules

For any UI task:
- Replicate the provided design exactly.
- Match layout, spacing, padding, font sizes, font hierarchy, colors, border radius, shadows, alignment, and proportions.
- Do not approximate. Do not simplify unless explicitly asked.

### Page 1 Layout
```
┌──────────────────────────────────────────────────────┐
│ HEADER: VINS logo · Nav (Overview | FAQ | samagama)  │
├──────────────┬───────────────────────────────────────┤
│              │  🔍 Search bar (Fuse.js + mark.js)    │
│  LEFT        │  Popular chips: NOC · Dates · Stipend │
│  SIDEBAR     ├───────────────────────────────────────┤
│  (sticky)    │  Deadline banner (if active phase)    │
│              │  Filter tabs (horizontal)              │
│  Categories  │  AccordionCards with dropdowns         │
│  + icons     │  "N interns found this helpful" count  │
│              │  PeerFootnote (if approved)            │
└──────────────┴───────────────────────────────────────┘
│  Chatbot widget (floating bottom-right, pulsing)     │
│  Back to top button (after 300px scroll)             │
└──────────────────────────────────────────────────────┘
```

### Page 2 Layout
```
┌──────────────────────────────────────────────────────┐
│ HEADER: notification bell (red badge) · user avatar  │
├──────────────┬───────────────────────────────────────┤
│              │  🔍 "Search active discussions..."    │
│  LEFT        │  [Ask a Question] button (blue)       │
│  SIDEBAR     ├───────────────────────────────────────┤
│  (matches    │  Filter tabs: All · Unresolved ·      │
│   Page 1)    │            Resolved · My Posts        │
│              │  Thread rows (stacked list, no cards) │
│              │  StatusBar (socket-driven)             │
│              │  Leaderboard strip (weekly top 3)     │
└──────────────┴───────────────────────────────────────┘
```

### Thread Row Data
Each row: vote count | question title | 1-line preview | author | timestamp | status badge

### Color System
- Primary student action: `#0044FF` (solid blue) — "Ask a Question", submit buttons
- Resolved badge: green checkmark
- Confidence badges: grey (unverified) → yellow (community pick) → green (high confidence)
- Status bar: grey → yellow → blue → green → orange (per state above)
- Admin dashboard: dark mode contrast aesthetic

---

## Styling Rules

Use Tailwind CSS classes throughout. Do not use inline styles unless:
- Dynamic values calculated at runtime (e.g. confidence score width bars)
- Platform-specific overrides
- Animated transitions requiring JS-driven style values

Reuse patterns via Tailwind `@apply` in `global.css` for repeated component patterns.

---

## State Management

- React Context for auth state and user preferences (whitelist flag, notifyOnResolve)
- Local `useState` for UI state (accordion open/close, active filter tab, modal visibility)
- No Redux or Zustand needed at this scale

---

## TypeScript

- Strict mode on both client and server
- No `any`
- Keep types in `types/` on the client, inline in models on the server
- Key shared types: `FAQEntry`, `Thread`, `Answer`, `User`, `AnalyticsEvent`, `ConfidenceStatus`, `PhaseConfig`

---

## Secrets — Never in Client Code

Required environment variables (`.env` on server):
```
MONGODB_URI=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EMAIL_USER=
EMAIL_PASS=
ADMIN_JWT_SECRET=
CLIENT_URL=
```

Client only receives:
```
VITE_GOOGLE_CLIENT_ID=
VITE_API_URL=
```

---

## Feature Build Order (MVP Sequence)

Build in this order. Do not skip ahead.

1. **MongoDB models + Express server skeleton** — all 6 schemas, basic routes returning empty arrays
2. **Google OAuth + whitelist middleware** — login flow, JWT issue, auth guard on /forum
3. **Page 1 static FAQ** — AccordionCard, Sidebar, FilterTabs, hardcoded FAQ data from db.faqs seed
4. **Fuse.js search + mark.js highlight** — live search on Page 1, no backend call
5. **Deadline banner + phases config** — useDeadlinePhase hook, DeadlineBanner component
6. **Chatbot widget** — Yaksha-mini floating widget, search → redirect fallback
7. **Exit confirmation modal** — 15s timer, helpful_yes/no analytics events
8. **Page 2 forum feed** — ThreadRow list, filter tabs, Ask a Question modal
9. **Upvoting + flag system** — upvote API, compound unique index, flagCount auto-hide at 3
10. **Confidence score engine** — confidenceService.js, badge display in AnswerBlock
11. **Similarity dedup** — similarityService.js on POST /threads, silent merge + "N others asked" message
12. **Status bar + socket.io** — useSocket hook, StatusBar component, server emit on status change
13. **Resolution email + notification toggle** — Nodemailer, subscribers[], notifyOnResolve pref
14. **node-cron jobs** — archive sweep, 72hr escalation, daily admin digest
15. **Page 3 escalation form** — redirect guard, auto-attach thread URL, POST /escalate
16. **Admin dashboard** — AdminQueue, CohortPulseChart, GapReport, approve/override/publish flows
17. **Peer footnote pipeline** — submission on high-confidence resolution, admin 1-click approve, display on Page 1
18. **"N interns found this helpful" counter** — helpfulCount on db.faqs, display in AccordionCard
19. **Leaderboard** — weekly aggregation on db.threads, display on Page 2 sidebar
20. **Gap tracker nightly job** — gapTracker.js, GapReport component in admin

---

## Communication

Be concise. For every feature, explain:
1. What files were changed
2. What the feature does
3. How to test it locally

---

## Final Reminder

Before every feature:
- Read this file
- Follow it strictly
- Build clean, simple code
- Match the UI spec exactly when designs are provided
- Fix all lint and type errors before marking a feature complete

