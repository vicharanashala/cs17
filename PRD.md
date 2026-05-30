# Query Posting Page — Full Technical Specification v5.3 (MERN Stack)

> **Page 2 of the FAQ Platform** — Reached when the chatbot (Page 1) cannot resolve a user's question.  
> Requires login before query submission.

---

## 1. Purpose & Context

**Page 1** is the FAQ + Chatbot page. The student searches or asks the chatbot here first. If the chatbot cannot answer, the student is directed to **Page 2**.

**Page 2** is the community query page. It has three dynamic sections that reveal/hide based on user action — all on the same single page (no routing or separate pages):

1. **Genie** — shown by default on Page 2 load. Contains a search bar and the Top 5 most-asked questions from the 15-day cache that are NOT already answered in the Page 1 FAQ. Below Genie are two CTA buttons: **Raise a Query** and **Solve a Query**.
2. **Raise a Query form** — replaces the Discussion Forum when the user clicks "Raise a Query". The forum section and the Solve a Query button disappear; only the query submission form is shown.
3. **Solve a Query panel** — replaces the Discussion Forum and the Raise a Query button when the user clicks "Solve a Query". Shows unanswered cached queries that the user can answer.

The goal is to let students raise new queries efficiently, while preventing duplicates, managing admin workload, and ensuring every submitted question reaches the right person.

---

## 1a. Hard Constraints

These constraints apply to the entire platform and override any implementation detail elsewhere in this spec.

| # | Constraint |
|---|---|
| 1 | **Zero generative AI** — no LLMs draft answers at any stage. Every official FAQ entry is written and approved by a human admin. The AI chatbot on page 1 only retrieves and presents existing approved content. |
| 2 | **Free hosting** — the entire stack must run on free-tier infrastructure (e.g. MongoDB Atlas free tier, Railway free tier, Cloudflare R2 free tier, Vercel hobby plan). No paid services may be introduced without explicit approval. |
| 3 | **Hidden admin dashboard** — the admin dashboard lives at `/admin`, is not linked anywhere in the student-facing UI, and requires a separate authentication flow (separate credentials, not student login). It is the only place to review the query queue, publish FAQ entries, and read the gap report and cohort pulse heatmap. |
| 4 | **No Page 3 / escalation page** — there is no separate escalation page or third page in the student-facing flow. The "Not Satisfied" escalation re-queues the query inside the existing admin dashboard; no new page is created or shown to the student. |
| 5 | **No left sidebar on Page 2** — Page 2 has no left sidebar. Navigation between Genie, Raise a Query, and Solve a Query is handled entirely by the persistent top navigation bar. No sidebar exists in any view state of Page 2. |
| 6 | **No Escalations in navigation** — the word "Escalations" does not appear as a menu item, tab, sidebar link, or label anywhere in the student-facing UI or the admin dashboard navigation. The underlying escalation mechanism (re-queuing on "Not Satisfied") exists in the backend and admin queue but is never surfaced as a named section. |

---

## 2. Complete Feature List

| # | Feature | Status |
|---|---|---|
| 1 | Admin-provisioned login gate — only users added by admin can log in; no self-registration | ✅ |
| 2 | Smart title input + real-time similarity scan | ✅ |
| 3 | Character limit counter (live, colour-coded) | ✅ |
| 4 | Self-duplicate detection (same user, similar past query) | ✅ |
| 5 | Category toggle | ✅ |
| 6 | Tag system | ✅ |
| 7 | Drag & drop screenshot attachment | ✅ |
| 8 | Email notification preference | ✅ |
| 9 | Auto-save draft every 30 seconds | ✅ |
| 10 | Query status tracker (Posted → In Progress → Answered / Rejected) | ✅ |
| 11 | Edit after submit (10-minute window) | ✅ |
| 12 | Delete own query | ✅ |
| 13 | Estimated reply time | ✅ |
| 14 | Genie (top of page 2) with Top 5 Most Asked from cache (not in FAQ); unanswered cache questions show upvote option | ✅ |
| 15 | Search bar for Genie (cache-backed, excludes FAQ entries already on Page 1) | ✅ |
| 21 | "Raise a Query" CTA button — hides Genie + Solve button, reveals submission form; in-page navigation bar allows switching between all views | ✅ |
| 22 | "Solve a Query" CTA button — hides Genie + Raise button, reveals unanswered query list | ✅ |
| 23 | Dynamic single-page layout — all three modes (Genie / Raise / Solve) on the same page, no routing; persistent nav bar between modes | ✅ |
| 16 | 15-day query cache with upvote / flag on both questions (by others) and answers | ✅ |
| 17 | User confidence score system | ✅ |
| 18 | Trusted-user direct posting (bypasses admin approval) | ✅ |
| 19 | Unsatisfied button → escalation to admin queue | ✅ |
| 24 | Admin dashboard at `/admin` — view all queries filtered by status (Pending / Under Review / Resolved / Rejected / Deleted) | ✅ |
| 25 | Admin approve/reject queries, add query to FAQ, manually create new FAQ entries | ✅ |
| 26 | Separate admin authentication (email + password, independent from student login) | ✅ |
| 27 | JWT inactivity timeout — token expires after 10 minutes of user inactivity | ✅ |
| 28 | Admin can provision new user accounts; no self-registration allowed | ✅ |
| 29 | Self-duplicate hard block — student cannot resubmit a query they already raised; shown their existing query with status/answer | ✅ |
| 30 | Categories sourced from Page 1 FAQ categories; admin-managed (add/edit/delete) | ✅ |
| 31 | Edit query allows editing the question text (not just tags); button hidden after 10-minute window closes | ✅ |
| 32 | Unanswered cache questions: student can upvote OR register interest; on admin answer all interested students notified in-app and by email (if opted in) | ✅ |
| 33 | Answered cache questions: upvote and flag available | ✅ |
| 34 | Admin answered queries go to Answered folder; admin can delete from there at any time | ✅ |
| 35 | Admin query list sorted oldest-first by default; sortable by newest, oldest, most-asked, least-asked | ✅ |
| 36 | FAQ promotion: query removed from cache immediately; remains visible in submitter's past queries list | ✅ |
| 37 | Admin answers trust-resolved query: only the asker is notified, not the community answerer | ✅ |
| 38 | Confidence score decreases by 1 when a user's answer is flagged by multiple users and removed | ✅ |
| 39 | Admin can modify an answer before pushing to FAQ | ✅ |
| 40 | Admin can provision new student accounts with email and password from the admin dashboard | ✅ |
| 41 | Notification bell icon in TopNavBar — shows unread in-app alerts; clicking opens notification dropdown | ✅ |
| 42 | Profile dropdown in TopNavBar — shows user's name, email, confidence points, and link to My Queries | ✅ |
| 43 | No word limit on answers — users and admins may write answers of any length | ✅ |
| 44 | Vector search used in both query submission similarity scan AND Genie search bar | ✅ |
| 45 | User-deleted queries are hard-deleted from the database and are not visible to the user, admin, or anyone | ✅ |
| 46 | Trust/confidence milestone display in Profile — shown as a milestone progress line (not on Page 2 Genie) | ✅ |
| 47 | Admin-side delete of a query from the Answered folder hides it from admin only; students still see it | ✅ |
| 48 | Admin deletes a query from Genie/cache — hides it from everyone (students and admin) | ✅ |
| 49 | Upvote and downvote on peer-posted answers in Solve a Query and Genie | ✅ |

---

## 3. User Flow

```
[Page 1 — FAQ + Chatbot]
  User searches / asks chatbot
        │
   Answer found → shown on Page 1 (no redirect)
        │
   Answer NOT found
        │
        ▼
[Page 2 loads]
  Check login status
        │
   Not logged in ────────────────────────────┐
        │                                    │
        ▼                                    ▼
   Show login modal               Enter email + password
                                         Authenticate (JWT)
                                                │
                                    ◄───────────┘
        │
   Logged in
        │
        ├── Check for saved draft → restore if found (banner shown)
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  DEFAULT VIEW — DISCUSSION FORUM                          │
│  ├── Search bar (searches 15-day cache only,              │
│  │    NOT Page 1 FAQ entries)                             │
│  │     ├── Match in cache → show Q+A card (if answered)  │
│  │     │   or Q only (if pending) + upvote/flag           │
│  │     └── No match → prompt user to raise a query       │
│  │                                                        │
│  ├── Top 5 Most Asked (from cache, NOT in FAQ)            │
│  │   ranked by vote_count DESC — expandable              │
│  │                                                        │
│  └── CTA Buttons (below forum)                            │
│       [Raise a Query]   [Solve a Query]                   │
└───────────────────────────────────────────────────────────┘
        │
        ├── User clicks "Raise a Query"
        │       │
        │       ▼
        │   Discussion Forum hides
        │   "Solve a Query" button hides
        │       │
        │       ▼
        │  ┌─────────────────────────────────────────────┐
        │  │  RAISE A QUERY FORM                         │
        │  │  (same submission form — see §3a below)     │
        │  └─────────────────────────────────────────────┘
        │
        └── User clicks "Solve a Query"
                │
                ▼
            Discussion Forum hides
            "Raise a Query" button hides
                │
                ▼
           ┌──────────────────────────────────────────────┐
           │  SOLVE A QUERY PANEL                         │
           │  List of unanswered cached queries           │
           │  User can submit an answer to any of them    │
           │  Trusted users: answer posted directly       │
           │  New users: answer pending admin approval    │
           └──────────────────────────────────────────────┘
```

### 3a. Raise a Query Submission Flow

```
User is in Raise a Query view
        │
        ▼
User types query title  ←──── Auto-save fires every 30 seconds
        │
        ├── Character counter updates live (warn at 400, red at 470)
        │
        ├── Real-time similarity scan (debounced 400ms)
        │        │
        │    FAQ/pending match found (≥ threshold)
        │        └── Show matched FAQ links / pending queries panel
        │
        │    Self-duplicate detected (same user, similar query)
        │        └── Show "You asked this on [date]" warning
        │
        │    No match → Continue
        │
        ▼
User picks category (required)
        │
        ▼
(Optional) Add tags
        │
        ▼
(Optional) Drag & drop screenshot
        │
        ▼
(Optional) Toggle email notification
        │
        ▼
Click "Submit Query"
        │
        ├── Final server-side similarity check
        │        │
        │    Duplicate found → Increment vote count, notify user
        │        │
        │    No duplicate → Save query, add to cache, clear draft
        │
        ▼
Query enters answer pipeline:
        │
        ├── Trusted user answers → posted directly (no admin approval)
        │        │
        │    Asker satisfied → query removed from admin queue
        │        │
        │    Asker clicks "Not Satisfied" → re-added to admin queue
        │        at original timestamp position
        │
        └── No trusted user → admin reviews normally
                │
                ▼
        Query Status Tracker visible
        [Posted ✓] → [In Progress ⟳] → [Answered ✓ / Rejected ✕]
                │
                ├── Edit button active for 10-minute window (live countdown)
                │
                └── Delete button always available
```

---

## 4. Page Layout

Page 2 is a **single-page dynamic layout**. Three mutually exclusive view states exist. Only one is visible at a time. No routing — state is managed client-side.

### 4a. Default View (Discussion Forum)

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER: Logo | "Page 1" | "Page 2" tabs | Draft dot | 🔔 Notif | User pill │
├──────────────────────────────────────────────────────────────────┤
│ [DRAFT BANNER if applicable]   📝 Draft restored · Discard       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GENIE                                                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🔍 Search questions from community...          [Search]    │  │
│  │   (searches 15-day cache only — NOT Page 1 FAQ)           │  │
│  │                                                            │  │
│  │  [Search result card — if cache hit]                       │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ Q: "How do I access the library portal?"             │  │  │
│  │  │ A: "Use your student ID at library.uni.ac.in"        │  │  │
│  │  │ Confidence: ★★★☆  [↑ Upvote] [⚑ Flag as wrong]      │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │ TOP 5 MOST ASKED (from cache, not in FAQ)                  │  │
│  │   1. How do I reset my portal password?  [↑ 42] [⚑ 2]    │  │
│  │   2. Where can I find my timetable?      [↑ 38] [⚑ 0]    │  │
│  │   3. ...  (up to 5 entries only)                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [  ✏ Raise a Query  ]   [  🛠 Solve a Query  ]                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 4b. Raise a Query View (after clicking "Raise a Query")

Discussion Forum section and "Solve a Query" button are hidden. Only the submission form is shown.

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER (unchanged)                                               │
├──────────────────────────────────────────────────────────────────┤
│  ← Back to forum                                                 │
│                                                                  │
│  QUERY STATUS TRACKER (visible after submission only)            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Query: "How do I reset my portal password?"                │  │
│  │                           Edit window: 09:47  [Edit][Del]  │  │
│  │ ●────⟳────○                                              │  │
│  │ Post  In Prog  Ans/Rej                [😕 Not Satisfied]    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  FORM CARD                                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ §1 Your Question * (with similarity scan + self-dupe)      │  │
│  │ §2 Category *                                              │  │
│  │ §3 Tags (optional)                                         │  │
│  │ §4 Attach Screenshot (optional)                            │  │
│  │ §5 Preferences (email notification toggle)                 │  │
│  │                          [ → Submit Query ]                │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 4c. Solve a Query View (after clicking "Solve a Query")

Discussion Forum section and "Raise a Query" button are hidden. Only the solve panel is shown.

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER (unchanged)                                               │
├──────────────────────────────────────────────────────────────────┤
│  ← Back to forum                                                 │
│                                                                  │
│  SOLVE A QUERY                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Unanswered community questions — help your peers!         │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ Q: "How to get library card issued?"   [↑ 31]        │  │  │
│  │  │ Category: Administrative | Tags: #library #card       │  │  │
│  │  │  ┌──────────────────────────────────────────────────┐ │  │  │
│  │  │  │ Write your answer...                             │ │  │  │
│  │  │  └──────────────────────────────────────────────────┘ │  │  │
│  │  │  [ Submit Answer ]  · Trusted users post directly      │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │  (more unanswered queries...)                               │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
---

### 4d. Admin Dashboard (hidden at `/admin`)

Accessible only via separate admin credentials. Not linked from any student-facing page.

```
┌──────────────────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD   [admin@uni.ac.in]                  [Sign out] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FILTER BAR                                                      │
│  [All] [Pending] [Under Review] [Resolved] [Rejected] [Deleted]  │
│  Category: [All v]   Tags: [filter...]   Search: [search...]     │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  QUERY LIST                                                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ # | Question              | Category | Votes | Status  | v │  │
│  │ 1 | How do I reset my ... | Technical|  42   | Pending | > │  │
│  │ 2 | Library card issued?  | Admin    |  31   | In Prog | > │  │
│  │ 3 | Hostel allotment...   | Admin    |  28   | Resolved| > │  │
│  │ 4 | Can I change elective?| Academic |  17   | Rejected| > │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [EXPANDED QUERY ROW - on click >]                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Q: "How do I reset my portal password?"                    │  │
│  │ By: aarav.shah@uni.ac.in · May 20 2025 · 42 votes          │  │
│  │ Tags: #login #portal | Category: Technical                 │  │
│  │ Screenshot: [View attachment]                              │  │
│  │                                                            │  │
│  │ ADMIN RESPONSE                                             │  │
│  │ ┌──────────────────────────────────────────────────────┐  │  │
│  │ │ Type your official answer here...                    │  │  │
│  │ └──────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │ [Approve & Answer]  [Reject]  [Add to FAQ]                 │  │
│  │ [Mark as Seen]  [Mark as In Progress]                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  FAQ MANAGEMENT                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ [+ Add New FAQ Entry]                                      │  │
│  │                                                            │  │
│  │ Existing FAQ entries:                                      │  │
│  │ 1. How do I access the student portal?  [Edit] [Delete]    │  │
│  │ 2. What is the fee payment deadline?    [Edit] [Delete]    │  │
│  │ 3. How to apply for bonafide cert?      [Edit] [Delete]    │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Features — Detailed Behaviour

### 5.1 Login Gate

**No blurred background.** When a student lands on Page 2 without being logged in, they see a clean, unblurred login page — not a blurred overlay. The login form is presented clearly with no underlying content visible behind it.

**Admin-provisioned accounts only.** There is no self-registration on the student side. The only way a student can log in is if an admin has already created an account for them via the admin dashboard. No email is automatically on a whitelist. No one can sign themselves up.

**Login credentials:** Email address and password only. No SSO, no magic links, no OTP in this version.

**On successful login:** A JWT access token is stored in an `httpOnly` cookie (not localStorage — prevents XSS token theft). After login the page transitions to Page 2 default view (Genie), the draft is checked and restored if found, and auto-save begins.

**Inactivity timeout:** The JWT expires after **10 minutes of user inactivity** (no mouse movement, keypress, scroll, or API call). A 2-minute warning is shown before expiry ("You will be logged out in 2 minutes due to inactivity"). On expiry, the session is invalidated, the cookie is cleared, and the student is returned to the clean login page. Activity resets the inactivity timer silently — the token is refreshed on each active API call as long as the user is engaged.

**Session rule summary:**
- Active session: token refreshes on every API call.
- Inactive for 10 minutes: token expires, student returned to login page.
- No fixed 24-hour session — session length is determined entirely by activity.

---

### 5.2 Smart Title Input with Real-Time Similarity Scan

As the user types their query title:

1. Input is debounced by 400ms — the scan only fires when the user pauses.
2. The title is sent to `POST /api/similarity/scan`.
3. Backend runs three-layer similarity checking (see Section 9).
4. If match found, a results panel appears showing matched FAQ entries and pending queries.
5. User can still submit — the system informs, not hard-blocks.
6. If a near-duplicate pending query is confirmed server-side at submission, the vote count increments and the user is shown that query's status.

**Similarity thresholds:**
| Layer | Method | Threshold |
|---|---|---|
| Layer 1 | Exact keyword (Jaccard) | ≥ 85% |
| Layer 2 | Fuzzy (Levenshtein) | Score ≥ 0.75 |
| Layer 3 | Semantic (MiniLM cosine) | ≥ 0.88 |

---

### 5.3 Character Limit Counter

- Live counter below the textarea: `234 / 500`
- A thin progress bar fills as the user types.
- Colour states:
  - 0–399 chars: green bar, grey counter
  - 400–469 chars: amber bar and counter ("warning zone")
  - 470–500 chars: red bar and counter, counter bold
- Hard limit at 500 — textarea has `maxlength="500"`.
- Also shown on the backend — reject if `title.length > 500` even if client-side is bypassed.

---

### 5.4 Self-Duplicate Detection — Hard Block

Separate from the general similarity check, this specifically checks the current logged-in user's own query history.

- Runs at the same time as the global similarity scan (debounced 400ms).
- Calls `POST /api/similarity/scan` with `{ title, userId }`.
- Backend checks the `queries` table filtered by `submitted_by = userId` AND `status NOT IN ('rejected', 'deleted')`.
- If a past query from the same user scores ≥ 0.85 cosine similarity:
  - **Submission is completely blocked.** The Submit button is disabled.
  - The existing query is shown to the student in full — including: question title, current status (Posted / Under Review / Answered / Rejected), the answer (if any), all tags, category, submission date, and vote count.
  - Message displayed: "You've already asked this. Here's your existing query."
  - The student cannot work around this — the block is enforced server-side at `POST /api/queries` too, returning a `409 Conflict` with the existing query ID.
- This is a **hard block**, not a soft warning. Unlike the global similarity scan (which informs and allows submission), a self-duplicate always prevents a new submission.

---

### 5.5 Category Toggle

- Pill/chip toggle — single select, required.
- Categories are **fully admin-managed** — stored in the `categories` table, fetched on page load via `GET /api/categories`.
- **The categories shown on Page 2 are the same set used on Page 1 FAQ.** They are not hardcoded. The defaults at setup are examples only (e.g. Academic, NOC, Vibe, Finance, etc.) — the actual list is whatever the admin has configured.
- Admin can add, edit, or delete categories at any time from the admin dashboard. Changes reflect immediately on both Page 1 and Page 2.
- No hardcoded fallback list — if the admin has defined 3 categories, only 3 chips appear. If they've defined 10, all 10 appear.
- Selected category routes the query in the admin dashboard and is used for FAQ promotion categorisation.

---

### 5.6 Tag System

- User can add up to 5 tags per query.
- Input accepts free text — auto-lowercased, spaces converted to hyphens, `#` prefix stripped on input but displayed with `#`.
- Tags can be added by typing + Enter, or by clicking suggested tag chips.
- Suggested tags are fetched from most-used tags in the system (`GET /api/tags/popular`).
- Each tag renders as a removable chip.
- Tags are stored as a `TEXT[]` array in the DB and indexed for filtering in the admin dashboard.
- No spaces in individual tags — validated server-side.

---

### 5.7 Drag & Drop Screenshot Attachment

- Drop zone accepts: `image/png`, `image/jpeg`, `application/pdf`. Max 5MB.
- On drop/select: shows thumbnail preview with remove button.
- File uploaded to object storage on form submit (not on drop — avoids orphaned uploads).
- If upload fails, query still submits; `screenshot_url` is stored as null.

---

### 5.8 Email Notification Toggle

- Checkbox defaulting to ON.
- When admin answers and approves a query, backend triggers email to all students with `notify_email = true`.
- Email contains: question, answer, and a link to the FAQ entry.
- Uses Resend, SendGrid, or Nodemailer + SMTP.

---

### 5.9 Auto-Save Draft

- Every 30 seconds, if the query title is non-empty, the draft is saved.
- Additionally saved 2 seconds after the user stops typing (debounced).
- Draft stored in `localStorage` (key: `faq_draft`) as JSON:
  ```json
  {
    "title": "...",
    "cat": "technical",
    "tags": ["login", "mobile"],
    "emailNotify": true,
    "savedAt": 1716451200000
  }
  ```
- On next page load (post-login), draft is detected and restored — a banner shows with the save time and a "Discard draft" option.
- Draft is cleared on successful submission or manual discard.
- Header shows a live "Draft saved / Unsaved changes…" indicator dot.

**Edge cases:**
- If localStorage is unavailable (private mode, storage full): fail silently, continue without draft.
- Draft from a different device is not restored (localStorage is per-device). For cross-device draft: store draft server-side in a `drafts` table instead.

---

### 5.10 Query Status Tracker

Visible in the student's Raise a Query view after submission.

**Three stages rendered as a horizontal stepper, with a terminal fourth for rejection:**

| Stage | Label shown to student | Trigger |
|---|---|---|
| Stage 1 | **Posted** ✓ | Immediately on query creation |
| Stage 2 | **In Progress** ⟳ | Admin opens or starts working on the query |
| Stage 3 | **Answered** ✓ | Admin or trusted user posts an approved answer |
| Stage 3 (alt) | **Rejected** ✕ | Admin explicitly rejects the query |

**Removed from student view:** The "Seen" stage is not shown to the student at all. Internally the admin still has `adminStatus` values of `seen` and `in_progress` in MongoDB, but from the student's perspective both of these map to the single "In Progress" stage. The student never sees a "Seen" label.

- Active stage pulses with a coloured ring animation.
- Timestamps shown below each completed stage.
- Polled via `GET /api/queries/:id/status` every 60 seconds (or WebSocket/SSE for live push).
- If query was answered by a trusted user, a "Not Satisfied?" button appears in the tracker card. Clicking it escalates the query back to the admin queue at its original timestamp position.
- **Rejected** stage is terminal — no further transitions. The rejection reason (if provided by admin) is shown below the stage.

---

### 5.11 Edit After Submit (10-Minute Window)

- After successful submission, an edit timer starts: `09:59 → 00:00`.
- Displayed as a monospace countdown badge in the tracker card.
- The **Edit button is active and visible while timer > 0 only.** Once the timer reaches 00:00, the Edit button is completely removed from the UI — it is not greyed out, it disappears entirely.
- Clicking Edit opens the full question form in edit mode, allowing the student to modify:
  - The **question text** (not just tags — the full title/description)
  - Category
  - Tags
  - Screenshot attachment
- The button changes to "Save edits" while in edit mode, with a "Cancel" option to discard changes.
- On save: `PATCH /api/queries/:id` with `{ title, category, tags, screenshot_url }`.
- The embedding is re-computed if the title changed.
- Server enforces: `PATCH` rejected with `403 Forbidden` if `now() - created_at > interval '10 minutes'` or if `status != 'pending'` (can't edit if already being answered).
- After window closes: Edit button is removed entirely. No "Edit window closed" label — it simply does not exist.
- Rationale: prevents admin from starting to answer a query that is still being revised.

---

### 5.12 Delete Own Query

- "Delete query" button always visible in tracker card.
- Clicking opens a confirmation modal: "Only do this if you found the answer yourself."
- On confirm: `DELETE /api/queries/:id` — **hard delete**. The query and all associated votes, cache entries, and draft data are permanently removed from the database. This cannot be undone.
- The query is not visible to the student, admin, or anyone after deletion. It does not appear in any dashboard filter (including "Deleted") — it is gone from the DB entirely.
- All voters on that query are notified before deletion: "This query was removed by the original poster."
- **This is a permanent action.** Unlike admin-side soft-deletes, user-initiated deletes bypass soft-delete logic and cascade to all related records (`queryCache`, `queryVotes`, `cacheVotes`, `drafts`).

---

### 5.13 Genie

Displayed at the top of Page 2 by default. It is the first stop for students arriving from Page 1. Named **Genie**.

**Important:** Genie only contains queries from the **15-day community cache**. It does **not** include or surface any questions that are already answered in the Page 1 FAQ. The purpose is to surface community questions that are NOT yet in the official knowledge base.

**Navigation:** A persistent navigation bar is always visible at the top of Page 2, allowing the student to switch between Genie, Raise a Query, and Solve a Query at any time without losing their place. Switching views does not require a "back" link — the nav bar replaces that need.

**Search Bar**
- Accepts free-text search input.
- Searches the 15-day cache only (not Page 1 FAQ).
- On search:
  1. Check 15-day cache — if matched, show the cached Q&A card (answered or pending).
  2. If no cache match — show a message prompting the user to submit a new query via "Raise a Query".
- Search uses the same 3-layer similarity scan (§5.2).

**Top 5 Most Asked**
- Shows the **top 5** most-asked questions from the 15-day cache that are NOT promoted to the Page 1 FAQ.
- Ranked by `upvotes DESC` among cached queries.
- Each entry shows: question title, upvote count, flag count.
- Clicking an entry expands it to show the answer (if available) or the unanswered state (see below).

**Upvoting and flagging a question (the query itself):**
- Any logged-in student can **upvote a question raised by another student** — this signals "I have this question too."
- Any logged-in student can **flag a question** raised by another student — this signals "This question is inappropriate, spam, or a duplicate."
- Upvote and flag are mutually exclusive on a question: picking one removes the other.
- A student **cannot upvote or flag their own question** — only questions submitted by others.
- If a question accumulates **more than 3 flags**, it is auto-hidden from Genie and sent to admin for review.
- Upvoting a question increments `queryCache.upvotes` and registers the voter in `queryVotes` (so they are notified when answered).
- Vote state is stored in `cacheVotes` with `voteType: 'upvote'` or `'flag'`.

**Unanswered questions in Genie:**
- If a cache question has `answerStatus = 'pending'`, it is shown with an "Awaiting answer" label.
- The student sees two options:
  1. **Upvote** — increments the question's vote count and registers the student for notification.
  2. **Register interest** (if they did not originally submit this query and have not already upvoted) — functionally identical to upvoting; adds them to `queryVotes` so they will be notified when answered. Button label: "Notify me when answered."
- Upvote and Register Interest are the same action — showing both is a UX choice to make the notification aspect explicit.
- If the student originally submitted the query, they are already registered; the Upvote button is shown but the Register Interest button is hidden.
- When an admin or trusted user answers a question: all voters with `notifyEmail = true` receive an email notification AND an in-app notification. Voters with `notifyEmail = false` receive in-app notification only.

**Answered questions in Genie:**
- If `answerStatus = 'answered'`, the answer is shown below the question.
- **On the question itself:** the Upvote button remains (still means "I had this question too / this was useful to find"), but the Flag button on the question is replaced by a Flag on the **answer** only.
- **On the answer:** two buttons — **Upvote answer** (this answer is correct and helpful) and **Flag answer** (this answer is wrong).
- A student cannot upvote and flag the same answer simultaneously — choosing one removes the other.
- If answer flags exceed 3, the answer is auto-hidden and sent to admin for review.
- A student cannot flag their own answer.

**CTA Buttons (below the Top 5 list)**
- **Raise a Query**: navigates to the Raise a Query view via the nav bar.
- **Solve a Query**: navigates to the Solve a Query view via the nav bar.
- These buttons are supplementary to the nav bar — the nav bar is the primary navigation.

---

### 5.14 15-Day Query Cache

All queries submitted on page 2 are stored in a rolling cache for 15 days from submission date. The cache powers the discussion forum search and the Top 10 list.

**Cache entry structure:**
```json
{
  "query_id": "uuid",
  "title": "How do I access the VPN?",
  "answer": "Use your student ID at vpn.uni.ac.in ...",
  "answered_by": "user_id | admin",
  "answer_status": "pending | answered",
  "upvotes": 12,
  "flags": 1,
  "confidence_score": 3,
  "expires_at": "2025-06-10T00:00:00Z"
}
```

**Display rules:**
- If `answer_status = answered`: show question + answer + confidence star rating + upvote/flag buttons.
- If `answer_status = pending`: show question only + "Awaiting answer" label.
- Cache entries expire automatically after 15 days (cron or DB TTL).
- If a cached query is promoted to the official FAQ by admin, it is removed from the cache and a redirect link is shown.

**Upvote / Downvote (Flag):**
- Any logged-in user can upvote a cached answer (signals the answer was helpful).
- Any logged-in user can flag an answer as wrong (downvote/report).
- If a cached answer accumulates **more than 3 flags**, it is automatically hidden from the cache and sent to the admin for review.
- A user cannot upvote and flag the same answer simultaneously; picking one removes the other.

---

### 5.15 User Confidence Score

Each user has a `confidence_score` (integer, starts at 0). It reflects the reliability of the user's answers as verified by admin.

**Earning points:**
- When a user posts an answer to a cached query and an admin approves it as correct: **+1 confidence point**.

**Losing points:**
- When a user's answer is flagged by multiple users (flags exceed 3) AND the answer is subsequently removed (auto-hidden and confirmed removed by admin review): **−1 confidence point**.
- The deduction only applies when both conditions are met: (a) flag threshold exceeded, AND (b) admin confirms removal. Flags alone without admin-confirmed removal do not deduct points.
- Minimum score is 0 — a score cannot go negative.

**Confidence tiers:**

| Tier | Score | Privileges |
|---|---|---|
| New | 0–2 | Answers require admin approval before display |
| Trusted | 3–9 | Answers posted directly; admin removed from queue |
| Expert | 10+ | Answers posted directly; displayed with ★★★ badge |

**Confidence display:**
- In the discussion forum, each answer shows a star-based confidence indicator (1–3 stars based on tier).
- User profile page shows the current score, tier, and a **milestone progress line** — see §5.30 for the full specification. The "How trust works" explanatory box is **not shown on Page 2 (Genie)**; it lives exclusively in the profile view.

---

### 5.16 Trusted-User Direct Posting

When a user with confidence score ≥ 3 (Trusted tier) answers a question in the discussion forum:

- The answer is posted immediately without waiting for admin approval.
- The query is **removed from the admin's review queue** — admin does not need to act.
- The answer is visible in the cache with the user's confidence star badge.
- Other users can upvote or flag the answer.
- If flags exceed 3 → answer is auto-hidden and re-added to admin queue for review. If admin confirms removal, the answering user loses 1 confidence point (§5.15).

---

### 5.17 "Not Satisfied" Escalation & Admin Queue Re-insertion

When a trusted user answers a query directly:

- The original asker sees a **"Not Satisfied?"** button in their query tracker card.
- Clicking it opens a confirmation: "Send this to our admin team for an official answer?"
- On confirm:
  - The query is re-added to the admin queue.
  - It is inserted at the position it would have originally occupied based on its **submission timestamp** (not re-queued at the end).
  - The trusted user's answer remains visible but is labelled "Community answer — official review requested".
  - Admin is notified via in-app alert.
- If the asker does not click "Not Satisfied" within 48 hours, the query is considered resolved and permanently removed from the admin queue.

---

### 5.19 Solve a Query Panel

Shown when the user clicks "Solve a Query" from the Discussion Forum. Hides the forum and the "Raise a Query" button.

- Lists unanswered cached queries (those with `answer_status = 'pending'`), sorted by upvote count DESC.
- Each entry shows: question title, category, tags, upvote count.
- Each entry has an answer textarea (no word/character limit — see §5.31) and a "Submit Answer" button.
- Once an answer is posted and visible, other students can **upvote** (↑) or **downvote** (↓) it directly on the card. Votes are mutually exclusive per user; a student cannot vote on their own answer. At 3 downvotes the answer is auto-hidden and sent to admin (§5.34).
- On submit:
  - If user confidence score ≥ 3 (Trusted): answer posted directly, query marked answered, removed from admin queue.
  - If confidence score < 3 (New): answer stored as pending, awaiting admin approval.
- A "← Back to forum" link restores the default forum view.

---

### 5.20 Page 2 View State Machine

```
State: GENIE (default)
  → click "Raise a Query" (nav or CTA) → State: RAISE
  → click "Solve a Query" (nav or CTA) → State: SOLVE

State: RAISE
  → click "Genie" in nav bar → State: GENIE
  → click "Solve a Query" in nav bar → State: SOLVE

State: SOLVE
  → click "Genie" in nav bar → State: GENIE
  → click "Raise a Query" in nav bar → State: RAISE
```

**Navigation bar:** A persistent tab bar is always visible at the top of the Page 2 content area (below the global header). It contains three tabs: **Genie**, **Raise a Query**, **Solve a Query**. The active tab is highlighted. Clicking any tab switches the view immediately without losing draft state (draft is preserved in memory/localStorage even when switching tabs).

All three states live on the same page. No URL routing. Managed via client-side state (e.g. `useState` in React). The "← Back to forum" link pattern is replaced entirely by the nav bar.

The admin dashboard is updated to reflect the trust system:

- Queries answered by trusted users are **not shown** in the admin queue by default.
- Admin has a toggle: "Show trust-resolved queries" to review them optionally.
- If a "Not Satisfied" escalation arrives, the query re-appears in the queue at the correct timestamp position (sorted among pending queries as if it had never been removed).
- Admin can also proactively approve or override any trusted-user answer from the optional view.
- Approving a trusted answer awards the answering user +1 confidence point (§5.15).

---

---

### 5.21 Admin Dashboard — Query Management

The admin dashboard lives at `/admin` and requires a separate login (separate credential table — `admins`, not `users`). It is never linked from any student-facing page.

**Authentication:**
- Admin logs in with email + password via `POST /api/admin/auth/login`.
- Issues a separate short-lived JWT (4-hour session) stored in an `httpOnly` cookie.
- Admin session is not shared with the student session in any way.

**Query List View:**
- Displays all queries in a paginated table, sorted by `created_at DESC` by default.
- Each row shows: row number, question title (truncated), category, vote count, current status, and an expand toggle.
- Clicking any row expands it inline to show full query detail (see wireframe §4d).

**Filter Bar:**
- Admin can filter the query list by status:
  - **All** — every query regardless of status
  - **Pending** — submitted, not yet seen or acted on
  - **Under Review** — admin has marked as Seen or In Progress
  - **Resolved** — answered (by admin or trusted user, confirmed satisfied or timeout)
  - **Rejected** — admin explicitly rejected
  - **Deleted** — soft-deleted by student
- Additional filters: Category (dropdown), Tags (text filter), free-text search across titles.
- Filters are combinable (e.g. "Pending + Technical + #login").
- A toggle: **"Show trust-resolved queries"** — off by default. When on, shows queries answered by trusted users that never entered the admin queue.

**Per-Query Actions (in expanded row):**

| Action | Behaviour |
|---|---|
| **Mark as Seen** | Sets `admin_status = 'seen'`; student tracker updates to stage 2 |
| **Mark as In Progress** | Sets `admin_status = 'in_progress'`; student tracker updates to stage 3 |
| **Approve & Answer** | Admin types answer → sets `status = 'answered'`, `admin_status = 'answered'`; student notified by email; query removed from pending queue |
| **Reject** | Sets `status = 'rejected'`; all voters notified; admin can optionally add a rejection reason |
| **Add to FAQ** | Promotes the query+answer to the official FAQ (see §5.22) |
| **Approve trusted answer** | Confirms a trusted-user answer as officially correct; awards answering user +1 confidence point |
| **Override trusted answer** | Admin replaces trusted-user answer with their own official answer. Only the **original asker** is notified ("Your query has been officially answered"). The community answerer is not notified. |

---

### 5.22 Promote Query to FAQ

When an admin clicks **"Add to FAQ"** on an answered query:

1. A modal appears pre-filled with:
   - **Question** (editable) — the query title
   - **Answer** (editable) — the current answer text (admin's or trusted user's)
   - **Category** (dropdown) — pre-set from query category
   - **Tags** (editable chips) — pre-set from query tags
2. Admin edits as needed — they can modify the question text, rewrite the answer, change the category, and adjust the tags — then clicks **"Publish to FAQ"**.
3. On publish:
   - `POST /api/admin/faq` — inserts a new row into the `faq_entries` table.
   - The query's `status` is set to `'faq_promoted'`.
   - The query is removed from the 15-day cache (`query_cache` row deleted).
   - A redirect stub is stored in `query_cache` so any direct link shows: "This question has been added to the official FAQ → View".
   - All voters on that query are notified: "Your question is now in the official FAQ!".
   - The FAQ entry is immediately visible on Page 1.

**FAQ entry DB structure (new table):**
```js
// Collection auto-created by Mongoose faq_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question     TEXT NOT NULL,
  answer       TEXT NOT NULL,
  category_id  INTEGER REFERENCES categories(id),
  tags         TEXT[],
  promoted_from UUID REFERENCES queries(id),
  created_by   UUID REFERENCES admins(id),
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);
```

---

### 5.23 Admin Creates New FAQ Entry Manually

Admin can create a brand-new FAQ entry without it originating from a student query. This is accessible via the **"+ Add New FAQ Entry"** button in the FAQ Management section of the admin dashboard.

**Form fields:**
| Field | Required | Notes |
|---|---|---|
| Question | Yes | Max 300 chars |
| Answer | Yes | No max — supports basic markdown (bold, lists) |
| Category | Yes | Dropdown from `categories` table |
| Tags | No | Same tag input as student form; max 10 tags |

**Behaviour:**
- Admin fills out the form and clicks **"Publish"**.
- `POST /api/admin/faq` is called with `promoted_from: null` (manual entry flag).
- Entry is inserted into `faq_entries` with `promoted_from = null`.
- Immediately live on Page 1 (no approval step — admin action is inherently approved).
- Admin can edit or delete any FAQ entry at any time via the FAQ Management list (see §4d wireframe).

**Edit/Delete existing FAQ entries:**
- **Edit**: `PATCH /api/admin/faq/:id` — opens the same form pre-filled; saves updated `question`, `answer`, `category`, `tags`, `updated_at`.
- **Delete**: `DELETE /api/admin/faq/:id` — hard delete (FAQ entries don't need soft-delete since they are admin-authored). Entry is removed from Page 1 immediately.

---

### 5.24 Admin User Provisioning

Since there is no self-registration, the admin is the sole gatekeeper for student accounts.

**Creating a new student account (from admin dashboard):**
- Admin navigates to the **User Management** section of the admin dashboard.
- Fills in: Full name, University email address, Temporary password.
- On submit: `POST /api/admin/users` — inserts a new row into the `users` table with `active = true`.
- The student can now log in on Page 2 with the provided email and password.
- Admin can optionally flag the account to require a password reset on first login.

**Deactivating an account:**
- `PATCH /api/admin/users/:id` with `{ active: false }`.
- Deactivated users cannot log in — login endpoint checks `active = true` before issuing token.
- Existing queries from deactivated users remain in the system.

**No email invite flow** — the admin provides credentials to the student directly (verbally, printed handout, internal communication). The platform does not send sign-up emails.

---

### 5.25 Admin Answered Queries — Answered Folder

When a query is answered (by admin or by a trusted user and confirmed), it moves to the **Answered** section in the admin dashboard. This is a separate view from the active query queue.

**Answered folder behaviour:**
- Contains all queries with `status = 'answered'`.
- Sorted newest-answered first by default.
- Shows: question title, who answered, date answered, number of voters notified.
- Admin can **delete** any query from the Answered folder at any time — this is a soft delete on the admin side (`adminDeleted = true` flag), meaning the query is removed from the admin's Answered view but the student can still see it in their past queries list. This is distinct from a Genie/cache delete (§5.32), which hides the query from everyone.
- Admin cannot edit an already-answered query from the Answered folder — they would need to go back to the active query and use Override (§5.21).

---

### 5.26 Admin Query List — Sorting & Ordering

By default, the admin query list shows **oldest first** (`.sort({ createdAt: 1 })`). This ensures the longest-waiting queries are addressed first.

**Available sort options (dropdown in the filter bar):**

| Sort option | DB equivalent |
|---|---|
| Oldest first *(default)* | `.sort({ createdAt: 1 })` |
| Newest first | `.sort({ createdAt: -1 })` |
| Most asked first | `.sort({ voteCount: -1 })` |
| Least asked first | `.sort({ voteCount: 1 })` |
| Most recently updated | `.sort({ updatedAt: -1 })` |
| Alphabetical (A–Z) | `.sort({ title: 1 })` |

Sorting is combinable with all existing filters (status, category, tags, search).

---

### 5.27 FAQ Promotion — Cache Removal & Past Queries Visibility

When a query is promoted to FAQ (§5.22):

- The query is **immediately removed from the 15-day cache** — it no longer appears in Genie's Top 5 or search results for other students.
- A redirect stub is placed in the cache so that any direct link to the cached query shows: "This question has been added to the official FAQ → View".
- **The query remains fully visible in the submitting student's Past Queries list.** The student can still see their original question, the answer, the FAQ promotion status, and all metadata. It is only removed from the public Genie view, not from the submitter's personal history.
- All voters on that query are notified: "Your question is now in the official FAQ!"

---

## 6. Tech Stack

**Runtime:** Node.js + Express.js (backend), React.js (frontend)
**Database:** MongoDB Atlas (free M0 cluster) via Mongoose ODM
**Authentication:** JWT stored in `httpOnly` cookies; separate secrets for student and admin tokens
**File Storage:** Cloudflare R2 (free tier) for screenshot attachments
**Embeddings:** MiniLM (384-dim, runs locally on server — no per-call AI cost)
**Vector Search:** MongoDB Atlas Vector Search (replaces Atlas Vector Search)
**Email:** Nodemailer or Resend free tier
**Hosting:** Vercel (frontend) + Railway free tier (Express backend)

---

### Frontend
| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR for auth checks, fast routing |
| Styling | Tailwind CSS | Utility-first, rapid consistent UI |
| State | Zustand | Lightweight, no boilerplate |
| Forms | React Hook Form + Zod | Validation, schema-first |
| Animations | Framer Motion | Smooth panel reveals, drag feedback |
| File upload | react-dropzone | Battle-tested drag & drop |
| Debounce | use-debounce | Controlled API scan calls |
| Real-time status | SWR with polling or SSE | Query status updates |

### Backend
| Layer | Choice | Reason |
|---|---|---|
| Runtime | Node.js + Express OR FastAPI (Python) | Express if JS-only stack; FastAPI if running MiniLM locally |
| Auth | JWT (httpOnly cookie) | Secure, stateless |
| Embedding service | FastAPI microservice (Python) | Runs sentence-transformers separately |
| Email | Resend or Nodemailer | Simple transactional email |
| File storage | Cloudflare R2 or MongoDB Atlas Storage | S3-compatible, generous free tier |
| Cron jobs | node-cron or pg_cron | Cache expiry (15-day TTL) and flag auto-delete |

### Database
| Layer | Choice | Reason |
|---|---|---|
| Primary DB | MongoDB (MongoDB Atlas or Railway) | Relational, reliable |
| Vector storage | Atlas Vector Search extension | Store & query embeddings in same DB |
| Cache | Redis (optional) | Cache embeddings of stored queries |

---

## 7. MongoDB Collections (Atlas)

All collections live in a single MongoDB Atlas M0 (free) cluster in a database named `faqplatform`. Mongoose schemas are defined server-side. Collections are auto-created on first insert.

---

### 7.1 `users` — Student accounts (admin-provisioned only)

```js
{
  _id: ObjectId,                    // auto-generated
  name: String,                     // required
  email: String,                    // required, unique index
  passwordHash: String,             // bcrypt hash
  confidenceScore: Number,          // default: 0 — never negative
  active: Boolean,                  // default: true — false = deactivated by admin
  requirePasswordReset: Boolean,    // default: false
  createdAt: Date,                  // auto
  updatedAt: Date                   // auto
}
```
**Indexes:** `{ email: 1 }` unique

---

### 7.2 `admins` — Admin accounts (completely separate from users)

```js
{
  _id: ObjectId,
  name: String,
  email: String,          // required, unique
  passwordHash: String,
  createdAt: Date
}
```
**Indexes:** `{ email: 1 }` unique

---

### 7.3 `categories` — Admin-managed; shared between Page 1 and Page 2

```js
{
  _id: ObjectId,
  name: String,     // e.g. "Academic", "NOC", "Vibe"
  slug: String,     // e.g. "academic", "noc" — URL-safe
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:** `{ slug: 1 }` unique

---

### 7.4 `faqEntries` — Official FAQ knowledge base (shown on Page 1)

```js
{
  _id: ObjectId,
  question: String,          // required, max 300 chars
  answer: String,            // required, supports basic markdown
  category: ObjectId,        // ref: categories
  tags: [String],            // array of tag strings
  promotedFrom: ObjectId,    // ref: queries — null if manually created by admin
  createdBy: ObjectId,       // ref: admins
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:** `{ category: 1 }`, `{ tags: 1 }`

---

### 7.5 `queries` — Every student query submitted

```js
{
  _id: ObjectId,
  title: String,               // required, max 500 chars
  category: ObjectId,          // ref: categories
  submittedBy: ObjectId,       // ref: users
  screenshotUrl: String,       // Cloudflare R2 URL, nullable
  tags: [String],
  status: String,              // 'pending' | 'answered' | 'rejected' | 'faq_promoted' | 'deleted'
  adminStatus: String,         // 'pending' | 'seen' | 'in_progress' | 'answered' | 'rejected'
                             // Note: 'seen' and 'in_progress' both map to 'In Progress' on student tracker
  adminDeleted: Boolean,       // default: false — soft delete from admin answered folder
  voteCount: Number,           // default: 1 (submitter counts as first vote)
  answer: String,              // null until answered
  answeredBy: ObjectId,        // ref: users OR admins
  answeredByModel: String,     // 'User' or 'Admin' — for Mongoose populate
  isTrustedAnswer: Boolean,    // true = answered by Trusted/Expert user directly
  askerSatisfied: Boolean,     // null = not yet resolved, true = satisfied, false = escalated
  rejectionReason: String,     // null unless status = 'rejected'
  embedding: [Number],         // 384-dim MiniLM vector for similarity search
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes:** `{ submittedBy: 1 }`, `{ status: 1 }`, `{ adminStatus: 1 }`, `{ voteCount: -1 }`, `{ createdAt: 1 }`, `{ category: 1 }`
**Atlas Vector Search Index:** `{ path: "embedding", numDimensions: 384, similarity: "cosine" }`

---

### 7.6 `queryCache` — 15-day rolling window (powers Genie on Page 2)

```js
{
  _id: ObjectId,
  queryId: ObjectId,       // ref: queries
  title: String,           // denormalised for fast reads
  answer: String,          // null if pending
  answerStatus: String,    // 'pending' | 'answered'
  upvotes: Number,          // default: 0 — votes on the question
  flags: Number,            // default: 0 — flags on the question (spam/inappropriate)
  answerUpvotes: Number,    // default: 0 — upvotes on the answer
  answerDownvotes: Number,  // default: 0 — downvotes on the answer (triggers auto-hide at 3)
  isHidden: Boolean,        // true = auto-hidden after question flags > 3 OR answer downvotes > 3
  adminDeletedGenie: Boolean, // default: false — admin-deleted from Genie; hidden from everyone
  expiresAt: Date,         // set to createdAt + 15 days
  createdAt: Date
}
```
**Indexes:** `{ queryId: 1 }` unique, `{ upvotes: -1 }`, `{ expiresAt: 1 }` with `expireAfterSeconds: 0` (MongoDB TTL — auto-deletes expired documents, no cron job needed)

---

### 7.7 `queryVotes` — Tracks who voted on / registered interest in a query

```js
{
  _id: ObjectId,
  userId: ObjectId,              // ref: users
  queryId: ObjectId,             // ref: queries
  notifyEmail: Boolean,          // user's email preference at time of vote
  registeredInterest: Boolean,   // true = clicked "Notify me when answered"
  createdAt: Date
}
```
**Indexes:** `{ userId: 1, queryId: 1 }` unique (prevents double-voting)

**Note:** This collection handles both "I upvoted this question" and "notify me when answered." Upvoting a question from Genie does both — increments `queryCache.upvotes` and inserts a `queryVotes` record.

---

### 7.8 `cacheVotes` — Upvote / flag on Genie cache entries (both questions and answers)

```js
{
  _id: ObjectId,
  userId: ObjectId,          // ref: users
  cacheEntryId: ObjectId,    // ref: queryCache
  target: String,            // 'question' | 'answer' — what is being voted on
  voteType: String,          // 'upvote' | 'flag'
  createdAt: Date
}
```
**Indexes:** `{ userId: 1, cacheEntryId: 1, target: 1 }` unique (one vote per user per entry per target — allows a student to upvote the question AND separately upvote the answer on the same cache entry)

---

### 7.9 `drafts` — Auto-saved query drafts (one per user)

```js
{
  _id: ObjectId,
  userId: ObjectId,    // ref: users, unique index
  title: String,
  category: ObjectId,
  tags: [String],
  notifyEmail: Boolean,
  savedAt: Date
}
```
**Indexes:** `{ userId: 1 }` unique (upsert on save — each user has at most one draft)

---

## 8. Similarity

---

### 5.28 TopNavBar — Notification Icon

A bell icon (🔔) is always visible in the global header (TopNavBar), to the left of the User pill, for all logged-in students.

**Behaviour:**
- An unread count badge overlays the bell when there are unread notifications (e.g. "3").
- Clicking the bell opens a dropdown/panel listing the most recent in-app notifications (newest first).
- Each notification entry shows: message text, timestamp, and a link to the relevant query or FAQ entry.
- Clicking a notification marks it as read and navigates to the linked resource.
- A "Mark all as read" action clears the badge.
- Notification types that appear here: query answered, query rejected, query added to FAQ, answer flagged and removed, trusted user answer confirmed, "Not Satisfied" escalation acknowledged.

**DB Collection — `notifications`:**
```js
{
  _id: ObjectId,
  userId: ObjectId,        // ref: users
  message: String,         // human-readable notification text
  link: String,            // relative URL to navigate to
  read: Boolean,           // default: false
  createdAt: Date
}
```
**Indexes:** `{ userId: 1, read: 1 }`, `{ createdAt: -1 }`

---

### 5.29 Profile Dropdown in TopNavBar

The User pill in the global header is a clickable dropdown. On click it expands to show:

| Field | Value |
|---|---|
| **Name** | Student's full name |
| **Email** | Student's university email |
| **Confidence Points** | Current `confidenceScore` with tier label (New / Trusted / Expert) |
| **My Queries** | Link to the student's past queries list (filtered to their own submissions) |
| **Sign Out** | Ends the session (clears cookie, returns to login) |

This dropdown replaces any need for a separate profile page as a navigation destination. The full profile milestone view (§5.30) is accessible from within My Queries.

---

### 5.30 Profile — Confidence Milestone Progress Line

The student's confidence progression is displayed as a **horizontal milestone line** (similar to an order-tracking progress bar) inside their profile/My Queries view — **not** on Page 2 Genie or anywhere in the query flow. The "How trust works" explanatory box is removed from Page 2 Genie entirely and replaced by this milestone UI in the profile.

**Milestone line layout (3 stops):**

```
  ●────────────────────○────────────────────○
SELECT (0 pts)      ELITE (threshold)    ICON (max)
```

- The filled/active node tracks the student's current tier.
- Each node shows the tier name and the point threshold below it.
- The connecting line fills proportionally to show progress toward the next tier.
- Tiers map to confidence score ranges (see §5.15):
  - **New (0–2 pts)** — first node active
  - **Trusted (3–9 pts)** — second node active
  - **Expert (10+ pts)** — third node active
- A short label below the active node shows current points: e.g. "4 / 10 pts to Expert".
- Visual style: dark background, gold/amber filled nodes and progress line (consistent with the reference image provided).

**Where it appears:** Only in the student's profile view (accessible via "My Queries" in the profile dropdown). It does NOT appear on Page 2 in Genie, on the query tracker, or in the Solve a Query panel.

---

### 5.31 Answer Word Limit — None

There is **no word or character limit** on answers submitted by students (in Solve a Query) or by admins (in the admin dashboard). The answer textarea accepts content of any length.

- No `maxlength` attribute on answer textareas.
- No server-side length validation on `answer` fields.
- This applies to: student answers in §5.19 (Solve a Query), admin answers in §5.21, trusted-user direct answers in §5.16, and admin-created FAQ entries in §5.23.
- Note: The 500-character limit applies only to **query titles**, not to answers.

---

### 5.32 Admin — Delete Query from Genie (Cache)

In addition to managing queries from the admin query list, an admin can delete a query directly from the Genie cache. This is a distinct action from the admin-side soft-delete in §5.25.

**Behaviour:**
- Admin deletes a query from Genie/cache → the query is hidden from **everyone**: students see it neither in Genie, the Top 5, search results, nor in any student's past queries list. The admin also does not see it.
- This is effectively a full suppression of the cache entry (`queryCache` document deleted; associated `queries` record set to `status = 'admin_deleted_genie'`).
- Use case: spam, offensive content, or a query that should never have been cached.
- This is separate from the admin answered-folder soft-delete (§5.25), which only hides the query from the admin's own view while leaving it visible to students.

**Summary of delete behaviours:**

| Action | Visible to student | Visible to admin |
|---|---|---|
| Student deletes own query | ❌ Hard deleted — gone for everyone | ❌ Gone |
| Admin deletes from Answered folder | ✅ Student still sees it | ❌ Hidden from admin |
| Admin deletes from Genie/cache | ❌ Hidden from students | ❌ Hidden from admin |

---

### 5.33 Vector Search — Scope (Query Submission AND Genie)

Vector search (MongoDB Atlas Vector Search with MiniLM 384-dim embeddings) is used in **two places**:

1. **Query Submission similarity scan (§5.2):** When a student types a query title in the Raise a Query form, the real-time scan uses vector search (Layer 3, cosine ≥ 0.88) to find semantically similar existing queries and FAQ entries.

2. **Genie search bar (§5.13):** When a student searches in the Genie search bar, the search runs the same 3-layer similarity check — including vector search — against the 15-day cache. This ensures semantic matches are surfaced even when keywords don't overlap exactly.

Both flows call `POST /api/similarity/scan` (or a dedicated `/api/genie/search` endpoint) and use the same MiniLM embedding service. Embeddings for new queries are computed at submission time and stored in `queries.embedding`.

---

### 5.34 Upvote / Downvote on Peer-Posted Answers

When a student posts an answer in the Solve a Query panel (§5.19) and that answer is visible in Genie (§5.13) or on the query tracker, other students can:

- **Upvote the answer** — signals the answer is correct and helpful. Increments `answerUpvotes` on the cache entry.
- **Downvote the answer** — signals the answer is incorrect or unhelpful. Increments `answerDownvotes`. (Previously referred to as "flag" in some contexts; "downvote" is the user-facing label. Internal flag-threshold logic at 3 downvotes still applies — auto-hides answer and sends to admin review.)

Upvote and downvote are mutually exclusive per user per answer — choosing one removes the other. A student cannot vote on their own answer.

**DB change — `cacheVotes.voteType` updated values:**

| voteType | Meaning |
|---|---|
| `'upvote'` | Positive vote (question or answer) |
| `'downvote'` | Negative vote on an answer (replaces `'flag'` for answers) |
| `'flag'` | Flag a question as spam/inappropriate (questions only) |

**Display:** Each answer card shows `↑ N  ↓ M` vote counts. The threshold for auto-hiding an answer remains 3 downvotes (formerly "flags").
