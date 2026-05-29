# Product Requirements Document
# Yaksha FAQ Platform — VINS Cohort @ IIT Ropar

**Version:** 1.0  
**Status:** Final Draft  
**Prepared for:** Vicharanashala Internship (VINS) Engineering Team  
**Last Updated:** May 2026  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas](#4-user-personas)
5. [Product Overview & Architecture](#5-product-overview--architecture)
6. [Feature Specifications](#6-feature-specifications)
   - 6.1 [Page 1 — Public FAQ (`/faq`)](#61-page-1--public-faq-faq)
   - 6.2 [Page 2 — Discussion Forum (`/forum`)](#62-page-2--discussion-forum-forum)
   - 6.3 [Page 3 — Admin Escalation (`/escalate`)](#63-page-3--admin-escalation-escalate)
   - 6.4 [Admin Dashboard (`/admin`)](#64-admin-dashboard-admin)
7. [Data Models](#7-data-models)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Automated Pipeline & Cron Jobs](#9-automated-pipeline--cron-jobs)
10. [Confidence Score System](#10-confidence-score-system)
11. [Similarity Deduplication Engine](#11-similarity-deduplication-engine)
12. [Gap Tracker & Analytics](#12-gap-tracker--analytics)
13. [Real-Time Layer (Socket.io)](#13-real-time-layer-socketio)
14. [Notification System](#14-notification-system)
15. [UI Design System](#15-ui-design-system)
16. [Tech Stack & Infrastructure](#16-tech-stack--infrastructure)
17. [Folder Structure & Code Conventions](#17-folder-structure--code-conventions)
18. [Environment Configuration & Secrets](#18-environment-configuration--secrets)
19. [Build Order & MVP Sequence](#19-build-order--mvp-sequence)
20. [Non-Goals & Hard Constraints](#20-non-goals--hard-constraints)
21. [Open Questions & Future Considerations](#21-open-questions--future-considerations)

---

## 1. Executive Summary

**Yaksha FAQ** is a community-driven FAQ and escalation platform purpose-built for the Vicharanashala Internship (VINS) cohort at IIT Ropar. It addresses a recurring operational problem: cohort members ask the same questions repeatedly across scattered channels (WhatsApp, email, Slack), admins get flooded with duplicate queries, and answers are neither searchable nor canonical.

The platform introduces a three-layer triage system:

- **Layer 1 (Public FAQ):** A static-but-smart FAQ page with fuzzy search, chatbot fallback, and deadline-aware question surfacing. Open to anyone.
- **Layer 2 (Peer Forum):** A private, whitelisted discussion space where the 100-member cohort collectively resolves questions before admin involvement.
- **Layer 3 (Admin Escalation):** A restricted escalation form that becomes accessible only after a question has remained unresolved for 72 hours in the forum.

This architecture ensures admins review only validated, community-filtered questions — not noise.

---

## 2. Problem Statement

### Current Pain Points

| Stakeholder | Problem |
|---|---|
| VINS Intern | Cannot find official answers quickly; must ask in group chats and wait |
| Cohort Peer | Same questions appear repeatedly with no canonical answer |
| Admin/Coordinator | Flooded with duplicate, low-quality questions via email/WhatsApp |
| Admin/Coordinator | No structured way to publish official answers once given |
| All | Answers given informally are never recorded; the knowledge is lost |

### Root Causes

- No single, searchable, authoritative answer repository
- No peer-filtering mechanism before admin escalation
- No feedback loop to detect when existing answers fail users
- No time-sensitive surfacing (e.g., "NOC questions" during the first week)

---

## 3. Goals & Success Metrics

### Primary Goals

- Reduce duplicate admin queries by ≥ 60% within the first month
- Answer ≥ 80% of common questions directly on Page 1 without requiring login
- Ensure every escalated admin question has already been through peer triage

### Success Metrics

| Metric | Target |
|---|---|
| FAQ `helpful_yes` rate | ≥ 70% of engaged FAQ sessions |
| `search_miss` rate (no FAQ match) | ≤ 20% of all searches |
| Forum thread resolution rate (peer-only) | ≥ 65% resolved without admin |
| Admin queue items per week | ≤ 15 (down from estimated 60+) |
| Thread-to-escalation conversion | ≤ 20% of open threads |
| Similarity dedup merge rate | ≥ 30% of submitted questions matched |

---

## 4. User Personas

### Persona 1 — The New Intern (Priya)
- **Context:** Just joined VINS; confused about NOC submission, offer letters, ViBe platform onboarding
- **Behavior:** Will Google or ask WhatsApp before checking any formal system
- **Needs:** Instant, searchable answers; no login friction; mobile-friendly layout
- **Access:** Page 1 only (unauthenticated)

### Persona 2 — The Active Cohort Member (Rahul)
- **Context:** 3 weeks into the internship; knows the system; helps peers
- **Behavior:** Checks the forum daily; upvotes good answers; flags wrong ones
- **Needs:** Quick post/answer flow; confidence in answer quality; notification when their question resolves
- **Access:** Pages 1 and 2 (Google login + whitelist)

### Persona 3 — The Admin / Coordinator (Dr. Sharma)
- **Context:** Manages the cohort; reviews the queue once daily
- **Behavior:** Does not browse raw forum threads; wants a curated review list
- **Needs:** One-click approve/override/answer fresh workflow; daily digest email; gap intelligence
- **Access:** `/admin` dashboard (separate admin JWT)

---

## 5. Product Overview & Architecture

### The Three-Page Funnel

```
User has a question
       │
       ▼
[Page 1 — /faq]  ──── Found answer? ──── YES ──→ Done (helpful_yes logged)
       │
       │ No match in FAQ
       ▼
[Chatbot Widget] ──── Redirects to /forum ──────────────────────────────┐
                                                                         │
       ┌─────────────────────────────────────────────────────────────────┘
       │
       ▼
[Page 2 — /forum]  ──── Community resolves in < 72 hrs? ──── YES ──→ Done (notification sent)
       │
       │ No peer resolution after 72 hrs
       ▼
[Cron job promotes status to "escalated"]
       │
       │ Original author sees "Submit to Admin" button
       ▼
[Page 3 — /escalate]  ──── Admin answers ──→ Published to FAQ ──→ Done
```

### Component Interaction Summary

- **Frontend** (React + Vite) hosted on **Vercel**
- **Backend** (Node.js + Express) hosted on **Render**
- **Database** (MongoDB Atlas) — free tier
- **Real-time** layer via **Socket.io** for live status bar updates
- **Cron jobs** run on the backend for archival, escalation, and digest emails
- **Nodemailer** for transactional emails (resolution notifications, admin digest)
- **Fuse.js** for fuzzy search (client-side on Page 1, server-side for dedup)

---

## 6. Feature Specifications

---

### 6.1 Page 1 — Public FAQ (`/faq`)

**Purpose:** The primary self-service layer. No login required. Answers the most common VINS questions, with smart search and surfacing based on what phase of the internship is active.

#### 6.1.1 Layout

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

#### 6.1.2 Fuzzy Search

- Fuse.js index built **client-side** from the full FAQ dataset fetched on mount
- No debounce needed at this scale — live filtering on every keystroke
- Matching fields: `question`, `answer`, `category`
- `mark.js` highlights matched terms inside expanded accordion answers
- "Did you mean this?" shown for match scores between **0.60 and 0.84**
- If score < 0.60 (no match): logs `search_miss` analytics event → chatbot widget activates with "No match found, ask the community?" → redirects to `/forum` with search query pre-filled
- If score ≥ 0.85: direct match, shown at top with highlight

**Search Analytics Events:**
- `search_hit` — at least one FAQ entry matched
- `search_miss` — no match found

#### 6.1.3 Accordion Cards

- Component: `AccordionCard.jsx`
- Groups FAQ entries by `category` (e.g., "NOC", "ViBe Platform", "Stipend")
- Each card is collapsible; only one section can be fully expanded at a time within a category group (or all open simultaneously — to be confirmed per design)
- Shows: question text → answer text → `helpfulCount` counter → `peerFootnote` (if present and admin-approved)
- Answer text is the human-written, admin-approved content from `db.faqs.answer`

**"N interns found this helpful" counter:**
- Displayed below each answer: `"42 interns found this helpful"`
- Sourced from `db.faqs.helpfulCount`
- Incremented via the Exit Confirmation modal's "Yes, thanks" click
- Counter is display-only; no inline click-to-increment button

#### 6.1.4 Sidebar (Left, Sticky)

- Lists all FAQ categories with icons (Tabler Icons)
- Clicking a category smoothly scrolls to the relevant `AccordionCard` group
- Sidebar is sticky — remains visible during vertical scroll
- On mobile: collapses into a horizontal scrollable chip row or hidden drawer

#### 6.1.5 Deadline-Aware Surfacing (DeadlineBanner + Phases)

- Config lives in `client/src/constants/phases.js`:

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

- `useDeadlinePhase.js` hook uses `date-fns` to determine which phase is currently active
- If an active phase exists: `DeadlineBanner` renders a dismissible strip at the top of the main content area
- Banner text is the phase `banner` string; below it, pinned `AccordionCards` for the phase's `categories` appear first in the list
- If no active phase: banner does not render; normal category order applies
- This config is admin-editable as a JSON file (no UI needed in V1)

#### 6.1.6 Popular Chips

- Horizontal clickable tag row beneath the search bar
- Chips: dynamically generated from the most-searched categories over the last 7 days (or hardcoded as "NOC", "Dates", "Stipend" in V1)
- Clicking a chip filters the accordion list to that category and scrolls to it

#### 6.1.7 Chatbot Widget (Yaksha-mini)

- Component: `ChatbotWidget.jsx`
- Floating bottom-right, with pulsing animation to draw attention
- **Trigger conditions:**
  - `search_miss` event fires (no FAQ match)
  - User explicitly clicks the widget icon
- **Behavior:**
  - Performs a Fuse.js search against FAQ data using the current search query
  - If a result found: shows it inline with a "Was this helpful?" prompt
  - If no result: shows "Couldn't find an answer — ask the community" + button that redirects to `/forum` with query pre-filled in the forum search bar
- Widget state: collapsed (icon only) ↔ expanded (chat panel)
- Does **not** call any LLM. All results are from the FAQ database.

#### 6.1.8 Exit Confirmation Modal

- Component: `ExitConfirmModal.jsx`
- **Fire conditions (ALL must be true):**
  - User opened a specific accordion item
  - User spent > 15 seconds on that item (tracked by local timer)
  - User navigates away from the page (router `beforeunload` / route change)
- **Does NOT fire** on every page exit — only after genuine FAQ engagement
- **Modal content:** "Did this answer your question?"
  - "Yes, thanks" → logs `helpful_yes` analytics event (with `section` field) → increments `helpfulCount` on the FAQ entry → dismisses
  - "No" → logs `helpful_no` analytics event → redirects to `/forum` with section pre-filled as search query

#### 6.1.9 Peer Footnote

- Component: `PeerFootnote.jsx`
- Appears below the official answer in an `AccordionCard` if `peerFootnote.approvedByAdmin === true`
- Max 200 characters
- Display format: `"💬 [authorName]: [text]"`
- Sourced from `db.faqs.peerFootnote`
- Submission pipeline: triggered from Page 2 when a forum answer reaches high-confidence resolution (see Section 6.2.8)

---

### 6.2 Page 2 — Discussion Forum (`/forum`)

**Purpose:** A private peer workspace for the 100 whitelisted cohort members. Questions are posted here when the FAQ doesn't help. Community votes and answers route good resolutions toward the FAQ.

#### 6.2.1 Access Control

- Requires Google login via `@react-oauth/google`
- After OAuth, backend checks `db.users.isWhitelisted === true`
- If not whitelisted: `403 — "Access restricted to authorized cohort members."`
- If not logged in: redirect to Google login, return to `/forum` after auth

#### 6.2.2 Layout

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

#### 6.2.3 Thread Row

Each `ThreadRow.jsx` displays:
- Vote count (upvote arrow + number)
- Question title (max 100 chars)
- 1-line body preview (truncated at ~120 chars)
- Author name + timestamp (relative: "2 hours ago")
- Status badge (colored, socket-driven)

#### 6.2.4 Filter Tabs

Component: `FilterTabs.jsx`

| Tab | Filter logic |
|---|---|
| All | All non-archived threads |
| Unresolved | `status = "open"` or `status = "escalated"` |
| Resolved | `status = "community_resolved"` or `status = "admin_resolved"` |
| My Posts | Threads where `authorEmail === currentUser.email` |

#### 6.2.5 Ask a Question Modal

- Triggered by the [Ask a Question] button (`#0044FF`, solid blue)
- **Modal fields:**
  - Title: plain text, max 100 chars, required
  - Body: plain text, max 1500 chars, optional
- **On submit:**
  - POST to `/api/threads`
  - Backend runs `similarityService.js` before creating the thread (see Section 11)
  - If duplicate detected: thread not created; frontend shows "N other interns asked this — being tracked"; user is redirected to existing thread
  - If new: thread created with `status = "open"`; user is auto-subscribed to resolution notifications

#### 6.2.6 Thread Detail View

- Clicking a `ThreadRow` opens the full thread
- Displays: title, full body, all answers sorted by `confidenceScore` descending
- Each answer shown in `AnswerBlock.jsx` (see below)
- Input area at bottom: post an answer (max 1500 chars)
- Current user's own answer has a "Mark as Helpful" button

#### 6.2.7 AnswerBlock

Component: `AnswerBlock.jsx`

Shows per answer:
- Answer text
- Author name + timestamp
- **Confidence badge** (derived from `confidenceScore`):
  - Score 0–4: no badge (grey, "Unverified")
  - Score 5–9: yellow badge ("Community Pick")
  - Score ≥ 10: green badge ("High Confidence")
- **Upvote button** (calls POST `/api/threads/:id/upvote`)
- **Flag button** (calls POST `/api/threads/:id/answers/:answerId/flag`)
  - Disabled if user already flagged
  - Answer auto-hidden when `flagCount ≥ 3`
- **Mark as Helpful** button — only visible to the original thread author on their own thread's answers

#### 6.2.8 Upvoting

- POST `/api/threads/:id/upvote`
- `db.upvotes` enforces a compound unique index on `{ userId, threadId }` — one upvote per user per thread
- Upvoting a thread also subscribes the upvoter to resolution notifications
- If upvote is a `isSilentMerge` (auto-upvote from similarity dedup), `isSilentMerge = true` on the record

#### 6.2.9 Flagging

- POST `/api/threads/:id/answers/:answerId/flag`
- `flaggedBy` array tracks user emails to prevent duplicate flags
- Once `flagCount ≥ 3`: answer is hidden from view and enters admin queue as "Override needed"
- Backend does not delete the answer — admin reviews and either confirms removal or overrides with correct answer

#### 6.2.10 Live Status Bar

Component: `StatusBar.jsx`

Driven by `socket.io`. Four states:

| Color | Label | Meaning |
|---|---|---|
| Grey | "Waiting for community…" | Newly posted, 0 answers |
| Yellow | "Being discussed — N answers, community voting" | Has answers, voting in progress |
| Blue | "Answer found — admin verifying" | `confidenceScore ≥ 10`, `markedHelpful = true` |
| Green | "Resolved — now in official FAQ" | `status = "admin_resolved"` or `status = "community_resolved"` |
| Orange | "Sent to admin — no peer answer in 72hrs" | `status = "escalated"` |

Socket event: server emits `thread:status_change` with `{ threadId, newStatus }`. Client updates only the relevant `StatusBar` instances.

#### 6.2.11 Leaderboard Strip

- Weekly aggregation on `db.threads` and `db.users.contributionScore`
- Displayed in the sidebar on Page 2 as a compact strip: top 3 contributors for the current week
- Metric: answers given with at least one upvote or `markedHelpful`
- Resets weekly (cron job or aggregated query — no persistent leaderboard document needed in V1)

---

### 6.3 Page 3 — Admin Escalation (`/escalate`)

**Purpose:** A last-resort form that allows the original thread author to formally submit an unresolved question to admin. Only reachable via redirect — never directly navigable.

#### 6.3.1 Access Control

- Direct navigation to `/escalate` → immediate redirect to `/faq`
- Only accessible via redirect when ALL of the following are true:
  - User is logged in and whitelisted
  - The `threadId` in the URL query param exists
  - That thread's `status === "escalated"` (72hr cron set this)
  - The current user is the `authorEmail` of that thread
- If any condition fails: redirect to `/forum`

#### 6.3.2 Form Fields

- Thread title (pre-filled from `db.threads.title`, read-only)
- Question summary (editable, max 500 chars, required) — user can rephrase for admin
- Original forum thread URL (auto-attached, hidden, sent as `threadId`)

#### 6.3.3 Submission

- POST `/api/escalate`
- Creates a record in `db.escalations`
- Thread `status` remains `"escalated"` until admin answers
- Admin receives this in the "Answer fresh" section of the admin queue

---

### 6.4 Admin Dashboard (`/admin`)

**Purpose:** A hidden, separately authenticated view for reviewing the escalation queue, publishing FAQ entries, reading the gap report, and reviewing the cohort pulse heatmap.

#### 6.4.1 Access Control

- Not linked from any public page — URL known only to admins
- Separate JWT: `ADMIN_JWT_SECRET` (different from cohort `JWT_SECRET`)
- Admin login: separate credentials (not Google OAuth flow)
- `adminMiddleware.js` verifies `isAdmin === true` on decoded token

#### 6.4.2 Admin Queue

Component: `AdminQueue.jsx`

Admin never sees raw forum threads. The queue shows exactly three task types:

**Task Type 1: Approve**
- Community-validated answer: `confidenceScore ≥ 10`, `markedHelpful = true`
- Admin sees: thread title, best answer text, confidence score
- Action: one-click "Publish to FAQ" → creates/updates `db.faqs` entry → sets `thread.status = "admin_resolved"` → sends resolution email to `thread.subscribers`
- 24-hour retraction window after publish (undo button)

**Task Type 2: Override**
- Flagged answer (`flagCount ≥ 3`) — community suspects the answer is wrong
- Admin sees: flagged answer text, flag count, thread context
- Action: admin writes corrected answer in a text field → clicks "Publish Override" → publishes corrected answer to FAQ (if worthy) or closes thread with correction

**Task Type 3: Answer Fresh**
- 72hr escalation from Page 3 — no peer answer exists
- Admin sees: `db.escalations.questionSummary`, original forum thread link
- Action: admin writes answer in text field → clicks "Publish to FAQ"
- Sets `db.escalations.status = "answered"`, `publishedToFAQ = true`
- Sets `db.faqs.resolvedViaEscalation = true` (signals gap tracker that FAQ had a hole)

**Daily Digest (replaces real-time admin alerts):**
- Admin receives one email per day at 08:00 listing:
  - Pending approvals
  - Override requests
  - Fresh escalations needing response
  - Top 3 gap signals
- Admin reviews queue at their own pace; no real-time pressure

#### 6.4.3 Cohort Pulse Chart

Component: `CohortPulseChart.jsx` (recharts)

- Heatmap-style chart showing question activity by category over time
- X-axis: days (last 14 days)
- Y-axis: FAQ categories
- Cell color intensity: volume of `search_hit`, `helpful_no`, or new forum threads for that category-day pair
- Helps admin identify which topics are surging before they become escalations
- Data sourced from `db.analytics` aggregated by `section` and `createdAt`

#### 6.4.4 Gap Report

Component: `GapReport.jsx`

- Ranked list of FAQ sections by `gapScore` (computed nightly by `gapTracker.js`)
- Color coding:
  - Red: gapScore ≥ threshold → "Rewrite needed"
  - Yellow: medium gap → "Surfacing issue"
  - Green: low gap → "Working"
- Each row shows: category name, gapScore, contributing signals (e.g., "Posted 4× this week", "High search_hit but low helpful_yes")
- Admin can click a row to jump to that FAQ section for editing

#### 6.4.5 Peer Footnote Approval

- High-confidence resolved threads trigger a `peerFootnote` candidate (max 200 chars)
- Admin sees these as a light approval task in the queue
- One-click "Approve Footnote" → sets `db.faqs.peerFootnote.approvedByAdmin = true` → footnote appears on Page 1

---

## 7. Data Models

### 7.1 `db.faqs`

```js
{
  question: String,               // The FAQ question text
  answer: String,                 // Official admin-written answer
  category: String,               // e.g. "NOC", "ViBe Platform"
  sectionId: String,              // e.g. "q-3-1" for anchor links
  helpfulCount: Number,           // Incremented by helpful_yes clicks
  resolvedViaEscalation: Boolean, // true if entered FAQ via Page 3
  peerFootnote: {
    text: String,                 // max 200 chars
    authorName: String,
    approvedByAdmin: Boolean
  },
  gapScore: Number,               // Computed nightly by gapTracker.js
  phase: [String],                // e.g. ["may", "june"] for deadline surfacing
  popularBadge: Boolean,          // Admin-toggled, shows 🔥 badge
  updatedAt: Date
}
```

### 7.2 `db.threads`

```js
{
  title: String,                  // max 100 chars (DB-level validation)
  body: String,                   // max 1500 chars
  authorEmail: String,
  answers: [{
    text: String,                 // max 1500 chars
    authorEmail: String,
    authorName: String,
    confidenceScore: Number,      // upvotes×2 + markedHelpful×5 - reports×3
    markedHelpful: Boolean,       // set by original thread author only
    flagCount: Number,
    flaggedBy: [String],          // email array; auto-hide at flagCount ≥ 3
    createdAt: Date
  }],
  upvoteCount: Number,
  status: {
    type: String,
    enum: ["open", "community_resolved", "escalated", "admin_resolved"]
  },
  isArchived: Boolean,            // set to true by nightly cron after 14 days
  subscribers: [String],          // emails to notify on resolution
  createdAt: Date,
  escalatedAt: Date               // set by cron when 72hr elapses without resolution
}
```

### 7.3 `db.users`

```js
{
  email: String,                  // unique; sourced from whitelist
  name: String,
  isWhitelisted: Boolean,
  isAdmin: Boolean,
  notifyOnResolve: Boolean,       // user notification preference
  contributionScore: Number,      // answers given × helpfulness ratio
  createdAt: Date
}
```

### 7.4 `db.upvotes`

```js
{
  userId: ObjectId,
  threadId: ObjectId,
  isSilentMerge: Boolean          // true if auto-upvoted via similarity dedup
}
// Compound unique index on { userId, threadId }
```

### 7.5 `db.escalations`

```js
{
  threadId: ObjectId,             // link to original forum thread
  studentEmail: String,
  questionSummary: String,        // max 500 chars
  adminResponse: String,
  status: { type: String, enum: ["pending", "answered"] },
  publishedToFAQ: Boolean,
  createdAt: Date
}
```

### 7.6 `db.analytics`

```js
{
  eventType: {
    type: String,
    enum: [
      "search_hit",      // FAQ matched a query
      "search_miss",     // chatbot redirected to forum
      "helpful_yes",     // exit confirmation: yes
      "helpful_no",      // exit confirmation: no → forum
      "section_view"     // FAQ section opened
    ]
  },
  section: String,        // FAQ category, e.g. "NOC"
  query: String,          // anonymized search query
  userHash: String,       // sha256 of email, never raw email
  createdAt: Date
}
```

---

## 8. Authentication & Authorization

### Route Guard Matrix

| Route | Access Level | Guard |
|---|---|---|
| `/faq` | Public | None |
| `/forum` | Google login + whitelist | `authMiddleware.js` |
| `/escalate` | Whitelisted user + thread is escalated + user is thread author | `authMiddleware.js` + redirect guard |
| `/admin` | Admin JWT | `adminMiddleware.js` |

### Whitelist Check (`authMiddleware.js`)

```js
const user = await User.findOne({ email: decoded.email })
if (!user || !user.isWhitelisted) {
  return res.status(403).json({ error: "Access restricted to authorized cohort members." })
}
```

### JWT Strategy

- Cohort JWT: issued after Google OAuth callback via `passport-google-oauth20`
  - Payload: `{ email, name, isWhitelisted }`
  - Secret: `JWT_SECRET`
- Admin JWT: issued via separate admin login (username/password or separate Google account)
  - Payload: `{ email, isAdmin: true }`
  - Secret: `ADMIN_JWT_SECRET`
- JWT is stateless; no server-side session storage
- Frontend stores JWT in memory (React Context) — **not** localStorage
- Axios instance in `client/src/lib/axios.js` auto-injects JWT in every request header via interceptor

### Google OAuth Flow

- Frontend: `@react-oauth/google` renders the Google login button
- Backend: `passport-google-oauth20` handles the callback at `/api/auth/google/callback`
- On successful OAuth:
  1. Check if `email` exists in `db.users`
  2. If not: create user record with `isWhitelisted: false` (admin manually whitelists)
  3. Issue JWT and return to frontend
  4. `AuthContext.jsx` stores JWT and `isWhitelisted` flag

---

## 9. Automated Pipeline & Cron Jobs

All cron logic in `server/services/cronJobs.js`. Uses `node-cron`.

### Job 1 — Archive Sweep (Daily at 00:00)

```
Condition: thread.createdAt < now - 14 days AND thread.isArchived === false
Action: thread.isArchived = true
Purpose: Keeps the active forum clean; archived threads are excluded from
         similarity dedup and forum feed (but preserved in DB for analytics)
```

### Job 2 — Gap Tracker (Daily at 00:00)

```
Runs: gapTracker.js aggregation query
Writes: updated gapScore to each db.faqs document
See Section 12 for full logic
```

### Job 3 — Escalation Promotion (Every Hour)

```
Condition: thread.status === "open"
           AND thread.createdAt < now - 72hrs
           AND no answer with markedHelpful === true
Action:
  - thread.status = "escalated"
  - thread.escalatedAt = now
  - server emits "thread:status_change" { threadId, newStatus: "escalated" }
  - frontend shows "Submit to Admin" button to original author
```

### Job 4 — Admin Daily Digest (Daily at 08:00)

```
Sends one email to the admin account containing:
  - Count + list of threads pending approval (confidenceScore ≥ 10, markedHelpful = true)
  - Count + list of flagged answers needing override (flagCount ≥ 3)
  - Count + list of escalated questions with no admin response
  - Top 3 gap signals from last 24hrs (ranked by delta gapScore)
```

---

## 10. Confidence Score System

File: `server/services/confidenceService.js`

### Formula

```
score = (upvotes × 2) + (markedHelpful × 5) - (flagCount × 3)
```

Where:
- `upvotes` = `answer.confidenceScore` upstream field (thread-level `upvoteCount` is separate)
- `markedHelpful` is boolean (treated as 0 or 1)
- `flagCount` is the number of flags on that specific answer

### Thresholds & Badge Logic

| Score Range | Badge | Color | Action |
|---|---|---|---|
| 0 – 4 | None / "Unverified" | Grey | No action |
| 5 – 9 | "Community Pick" | Yellow | Visible prominence in AnswerBlock |
| ≥ 10 | "High Confidence" | Green | Sent to admin digest |
| ≥ 15 + markedHelpful = true + flagCount = 0 | "Auto-publish candidate" | Green + star | Admin can ratify in digest (24hr window to retract) |

### Score Recalculation Triggers

- On every upvote POST
- On every flag POST
- On every `markedHelpful` toggle
- Score stored on the embedded answer object in `db.threads`

---

## 11. Similarity Deduplication Engine

File: `server/services/similarityService.js`

Uses Fuse.js server-side against all active (non-archived) thread titles.

### Flow

```
POST /api/threads (new question submitted)
  │
  ▼
similarityService.findDuplicate(title)
  │
  ├── similarity ≥ 0.75 found
  │     → Do NOT create new thread
  │     → Silently add upvote to existing thread (isSilentMerge: true in db.upvotes)
  │     → Return { isDuplicate: true, existingThreadId, existingThreadTitle }
  │     → Frontend shows: "N other interns asked this — being tracked"
  │     → Frontend redirects user to existing thread
  │
  └── similarity < 0.75
        → Create new thread normally
        → Return { isDuplicate: false, thread: newThread }
```

### Why This Matters

- Prevents forum fragmentation from slight question variations
- Boosts upvote signal on existing threads (faster confidence score growth)
- Reduces admin queue noise
- "N other interns asked this" message provides social validation

---

## 12. Gap Tracker & Analytics

File: `server/services/gapTracker.js`

### Gap Score Signals

A FAQ section's `gapScore` increases when any of the following occur:

| Signal | Description | Weight |
|---|---|---|
| `helpful_no` exits | Users confirmed the FAQ answer didn't help | High |
| Repeated duplicate threads | Same unlisted question posted 3+ times in 7 days (dedup count) | High |
| `resolvedViaEscalation: true` | FAQ entry only exists because peer forum failed | Medium |
| High `search_hit` + low `helpful_yes` | Answer is found but doesn't satisfy | Medium |

### Gap Score Color Bands (Admin View)

| Color | Meaning |
|---|---|
| Red | Answer is actively failing users — rewrite urgently needed |
| Yellow | Answer exists but surfacing or clarity is an issue |
| Green | Answer is working well |

### Analytics Events Schema

All events are anonymous. `userHash` is `sha256(email)` — never raw email.

| Event | When Logged |
|---|---|
| `search_hit` | FAQ matched user query |
| `search_miss` | No FAQ match found |
| `helpful_yes` | Exit modal: "Yes, thanks" |
| `helpful_no` | Exit modal: "No" (also fires when chatbot fallback redirects) |
| `section_view` | User expands an accordion card |

---

## 13. Real-Time Layer (Socket.io)

### Server-Side

- `socket.io` attached to Express HTTP server in `server.js`
- Emits `thread:status_change` event with `{ threadId, newStatus }` whenever a thread's status changes

### Client-Side

- `client/src/lib/socket.js` — singleton `socket.io-client` instance
- `useSocket.js` hook — connects/subscribes on mount, cleans up on unmount
- `StatusBar.jsx` subscribes to `thread:status_change` events and updates only matching thread rows

### Status Change Triggers

| Trigger | New Status | Emitted by |
|---|---|---|
| Thread created | `open` | Route handler |
| Answer added, voting begins | `open` → StatusBar shows discussion | Implicit (vote count) |
| `confidenceScore ≥ 10`, `markedHelpful = true` | `community_resolved` (tentative) | `confidenceService.js` |
| 72hr cron fires with no resolution | `escalated` | `cronJobs.js` |
| Admin approves/publishes | `admin_resolved` | `admin.js` route |

---

## 14. Notification System

File: `server/services/notificationService.js`  
Transport: **Nodemailer** via `EMAIL_USER` / `EMAIL_PASS`

### Resolution Email

- Sent when `thread.status` transitions to `community_resolved` or `admin_resolved`
- Recipients: `thread.subscribers` array (original author + upvoters who have `notifyOnResolve: true`)
- Content: thread title, the resolved answer, link to the now-published FAQ entry (if applicable)

### Notification Preference

- `db.users.notifyOnResolve` — boolean, defaults to `true`
- User can toggle this in their profile/header settings on Page 2
- Upvoters are auto-added to `thread.subscribers` but only emailed if `notifyOnResolve === true`

### Admin Daily Digest Email

- Sent daily at 08:00 by `cronJobs.js`
- To: admin email (from env)
- Summarizes the current admin queue (see Section 9, Job 4)
- Replaces all real-time admin alerts — admin is not pinged on every flag or escalation

---

## 15. UI Design System

### Color System

| Element | Color |
|---|---|
| Primary student action (Ask, Submit) | `#0044FF` (solid blue) |
| Resolved badge | Green with checkmark |
| Status: Waiting | Grey |
| Status: Being discussed | Yellow |
| Status: Answer found, verifying | Blue |
| Status: Resolved | Green |
| Status: Sent to admin | Orange |
| Confidence: Unverified | Grey |
| Confidence: Community Pick | Yellow |
| Confidence: High Confidence | Green |
| Admin dashboard | Dark mode (high-contrast) |

### Typography

- Default font: system sans-serif via Tailwind defaults
- Heading hierarchy: Tailwind `text-2xl font-bold` → `text-xl font-semibold` → `text-base font-medium`
- Timestamps and metadata: `text-sm text-gray-500`

### Spacing & Layout Conventions

- Content area max width: `max-w-5xl mx-auto`
- Sidebar width: fixed, `w-64`
- Padding: `p-4` for cards, `p-6` for page content
- Accordion cards: `rounded-lg border border-gray-200 shadow-sm`
- Status badges: `rounded-full px-2 py-0.5 text-xs font-medium`

### Styling Rules

- **Tailwind CSS throughout** — no inline styles unless:
  - Dynamic runtime values (e.g., confidence score width bars)
  - Platform-specific overrides
  - JS-driven animated transitions
- Repeated patterns extracted to `@apply` directives in `global.css`
- No `style={{ }}` props for anything that could be a Tailwind class

### Responsive Behavior

- Desktop: two-column layout (sidebar + main content)
- Mobile: sidebar collapses; hamburger menu or horizontal chip row for categories
- Thread rows: stacked vertically, touch-friendly tap targets

---

## 16. Tech Stack & Infrastructure

### Frontend

| Layer | Technology | Notes |
|---|---|---|
| Framework | React.js (Vite) | Fast HMR; optimized build |
| Styling | Tailwind CSS | Utility-first; `@apply` for repeated patterns |
| Routing | React Router v6 | `<Routes>` + auth guards |
| HTTP | Axios | Single instance; JWT auto-injected via interceptor |
| Auth UI | `@react-oauth/google` | Google One Tap / button flow |
| Global state | React Context | Auth state + user prefs (no Redux/Zustand) |
| Fuzzy search | Fuse.js | Client-side; no backend cost on Page 1 |
| Search highlight | mark.js | Highlights matched terms in accordion answers |
| Real-time | socket.io-client | Live status bar |
| Notifications | react-hot-toast | Non-blocking toast messages |
| Date logic | date-fns | Phase calculation, relative timestamps |
| Charts | recharts | Admin cohort pulse heatmap |
| Icons | Font Awesome | Consistent icon system |

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

### Backend

| Layer | Technology | Notes |
|---|---|---|
| Runtime | Node.js | |
| Framework | Express.js | Thin routes; logic in services |
| Auth | Passport.js + passport-google-oauth20 | OAuth flow |
| Sessions | jsonwebtoken (JWT) | Stateless; two secrets (cohort + admin) |
| Real-time | socket.io | Emits status change events |
| Cron jobs | node-cron | 4 scheduled jobs |
| Email | Nodemailer | Resolution notifications + admin digest |
| Security | cors, helmet, express-rate-limit | Standard hardening |
| Logging | morgan | Request logging |
| Config | dotenv | Environment variable management |

### Database

| Layer | Technology | Notes |
|---|---|---|
| Database | MongoDB (Mongoose ODM) | 6 collections |
| Hosting | MongoDB Atlas free tier | No cost |

### Hosting

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Free tier; auto-deploy from `main` |
| Backend | Render | Free tier; may cold-start on inactivity |
| Database | MongoDB Atlas | Free tier; 512MB storage |

### Strict Library Policy

Do not introduce new major libraries without a documented reason and team approval. All additions must be justified against the existing stack. Default answer is "no new library."

---

## 17. Folder Structure & Code Conventions

```
project/
├── client/                        ← React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Page1_FAQ.jsx              ← Public FAQ (routes only; composes components)
│   │   │   ├── Page2_Forum.jsx            ← Whitelisted forum
│   │   │   ├── Page3_Escalate.jsx         ← Redirect-only escalation form
│   │   │   └── AdminDashboard.jsx         ← Hidden admin view
│   │   ├── components/
│   │   │   ├── SearchBar.jsx              ← Fuse.js + mark.js live search
│   │   │   ├── AccordionCard.jsx          ← FAQ category + dropdown answers
│   │   │   ├── FilterTabs.jsx             ← All / Resolved / Unresolved / My Posts
│   │   │   ├── ThreadRow.jsx              ← Forum list item: vote + title + status badge
│   │   │   ├── AnswerBlock.jsx            ← Peer answer with confidence badge + flag
│   │   │   ├── StatusBar.jsx              ← Socket-driven live status display
│   │   │   ├── ChatbotWidget.jsx          ← Floating Yaksha-mini widget
│   │   │   ├── DeadlineBanner.jsx         ← "Relevant right now" strip
│   │   │   ├── ExitConfirmModal.jsx       ← "Did this answer your question?"
│   │   │   ├── PeerFootnote.jsx           ← 200-char community note under FAQ answer
│   │   │   ├── CohortPulseChart.jsx       ← Admin heatmap (recharts)
│   │   │   ├── GapReport.jsx              ← Admin gap signal ranked list
│   │   │   ├── AdminQueue.jsx             ← Approve / override / answer fresh
│   │   │   └── Sidebar.jsx                ← Left nav (sticky, category links)
│   │   ├── context/
│   │   │   └── AuthContext.jsx            ← Google auth state + whitelist flag
│   │   ├── hooks/
│   │   │   ├── useFuzzySearch.js          ← Fuse.js wrapper
│   │   │   ├── useSocket.js               ← socket.io-client connection/cleanup
│   │   │   ├── useConfidenceScore.js      ← Read-only score display helper
│   │   │   └── useDeadlinePhase.js        ← date-fns phase calculator
│   │   ├── lib/
│   │   │   ├── axios.js                   ← Axios instance with JWT interceptor
│   │   │   └── socket.js                  ← socket.io-client singleton
│   │   ├── constants/
│   │   │   └── phases.js                  ← Deadline-aware phase config
│   │   ├── types/
│   │   │   └── index.ts                   ← FAQEntry, Thread, Answer, User, etc.
│   │   └── App.jsx                        ← Routes + auth guards
│
├── server/                        ← Express backend
│   ├── routes/
│   │   ├── faq.js                         ← GET /faqs, POST /faqs/:id/helpful, GET /faqs/search
│   │   ├── forum.js                       ← CRUD /threads, POST answers, upvote, flag
│   │   ├── escalate.js                    ← POST /escalate
│   │   ├── auth.js                        ← Google OAuth callback, JWT issue
│   │   └── admin.js                       ← Queue, approve, publish, gap report
│   ├── services/
│   │   ├── confidenceService.js           ← Score formula + threshold logic
│   │   ├── similarityService.js           ← Fuse.js server-side dedup
│   │   ├── gapTracker.js                  ← Nightly aggregation → writes gapScore
│   │   ├── notificationService.js         ← Nodemailer: resolution email + digest
│   │   └── cronJobs.js                    ← node-cron: archive, escalation, digest
│   ├── models/
│   │   ├── FAQ.js                         ← Mongoose schema only; no logic
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

### Code Conventions

- **Pages** are route-level components only. They compose components and call hooks. Zero business logic inline.
- **Components** are created only when: used in more than one place, OR make a page significantly easier to read.
- **Services** hold all backend business logic. Routes are thin — they validate input, call a service, return the response.
- **Models** are Mongoose schemas only. No methods, no middleware, no business logic inside model files.
- **TypeScript:** Strict mode on both client and server. No `any`. Shared types in `client/src/types/`. Inline types in server model files.

---

## 18. Environment Configuration & Secrets

### Server `.env` (Never committed)

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

### Client `.env` (Only two variables; Vite prefix required)

```
VITE_GOOGLE_CLIENT_ID=
VITE_API_URL=
```

### Rules

- No secrets in client code — ever
- No secrets in `console.log` or error messages
- JWT decoded client-side for display only; never trusted without backend verification
- `userHash` in analytics = `sha256(email)` — raw email never stored in `db.analytics`

---

## 19. Build Order & MVP Sequence

Build strictly in this order. Do not skip ahead. Each step depends on the previous.

| # | Feature | Key Files |
|---|---|---|
| 1 | MongoDB models + Express server skeleton | All 6 schemas, basic routes returning `[]` |
| 2 | Google OAuth + whitelist middleware | `auth.js`, `authMiddleware.js`, `AuthContext.jsx` |
| 3 | Page 1 static FAQ | `AccordionCard`, `Sidebar`, `FilterTabs`, seeded FAQ data |
| 4 | Fuse.js search + mark.js highlight | `SearchBar.jsx`, `useFuzzySearch.js` |
| 5 | Deadline banner + phases config | `useDeadlinePhase.js`, `DeadlineBanner.jsx`, `phases.js` |
| 6 | Chatbot widget | `ChatbotWidget.jsx` — search fallback + redirect |
| 7 | Exit confirmation modal | `ExitConfirmModal.jsx` — 15s timer + analytics events |
| 8 | Page 2 forum feed | `ThreadRow`, `FilterTabs`, Ask a Question modal |
| 9 | Upvoting + flag system | `forum.js` routes, `Upvote` model, compound index |
| 10 | Confidence score engine | `confidenceService.js`, `AnswerBlock` badge display |
| 11 | Similarity dedup | `similarityService.js` on POST `/threads` |
| 12 | Status bar + socket.io | `useSocket.js`, `StatusBar.jsx`, server emit |
| 13 | Resolution email + notification toggle | `notificationService.js`, `subscribers[]`, pref toggle |
| 14 | node-cron jobs | `cronJobs.js` — archive, escalation, digest |
| 15 | Page 3 escalation form | `Page3_Escalate.jsx`, redirect guard, `escalate.js` |
| 16 | Admin dashboard | `AdminQueue`, `CohortPulseChart`, `GapReport`, publish flows |
| 17 | Peer footnote pipeline | Submission trigger, admin 1-click approve, Page 1 display |
| 18 | "N interns found this helpful" counter | `helpfulCount` on `db.faqs`, display in `AccordionCard` |
| 19 | Leaderboard | Weekly aggregation, Page 2 sidebar strip |
| 20 | Gap tracker nightly job | `gapTracker.js`, `GapReport` component in admin |

---

## 20. Non-Goals & Hard Constraints

These are **firm constraints** — not subject to re-evaluation during development:

| Constraint | Rationale |
|---|---|
| **Zero generative AI** | No LLMs draft answers. Every FAQ entry is human-approved. No hallucination risk in an official document. |
| **Zero file uploads** | Text only at every layer. No images, no attachments. Simplifies security, storage, and moderation. |
| **Free hosting throughout** | Vercel + Render + MongoDB Atlas free tier. No paid services. |
| **Community-first triage** | Admin must never see raw, unfiltered questions. Every admin queue item has passed peer review or exhausted it. |
| **Admin reviews outcomes, not noise** | Daily digest only. No real-time admin pings. |
| **No Redux or Zustand** | React Context is sufficient at this scale. No state management library bloat. |
| **No new major libraries without approval** | Every addition must justify its cost in bundle size, maintenance burden, and learning curve. |
| **TypeScript strict mode, no `any`** | Both client and server. Enforced at lint time. |

---

## 21. Open Questions & Future Considerations

### Open Questions (To resolve before or during build)

- Should multiple accordion items be open simultaneously on Page 1, or only one at a time per category?
- Leaderboard scoring formula: is `contributionScore` accumulated over the full cohort, or reset weekly for the Page 2 strip?
- Peer footnote submission: should the high-confidence answer's author be notified that their answer was selected as a footnote candidate, or should it happen silently?
- Admin whitelist management: is there a UI for adding/removing whitelisted emails, or is it seeded directly in the database?
- On Render free tier cold-starts (≥30s): should there be a frontend "warming" indicator or a backend keep-alive ping?

### Future Considerations (Post-MVP, Not in V1)

- Mobile app version (PWA or React Native)
- Bulk FAQ import from a spreadsheet (admin upload once per cohort cycle)
- Multi-cohort support (separate namespaced FAQ/forum per cohort year)
- Voting on FAQ entries directly (not just forum threads) to surface "most helpful" answers
- Search analytics dashboard visible to cohort reps, not just admin
- Automated phase config updates (admin UI to edit `phases.js` without a code deploy)
- Rate limiting per user on POST `/threads` and POST `/answers` to prevent spam

---

*This PRD is the single source of truth for Yaksha FAQ Platform V1. All feature decisions, edge cases, and implementation details should be resolved against this document. When in doubt, re-read Section 20 (Non-Goals) before adding complexity.*
