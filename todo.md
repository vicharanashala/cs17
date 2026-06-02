# TODO — VINS · Yaksha FAQ Platform
## `D:\summership IIT Ropar\FAQ_SOFTWARE`

**Maintained by:** Hedwig 🦉
**Last updated:** 2026-06-02 22:40 GMT+5:30
**Backend:** Express 5 · MongoDB Atlas · Socket.IO · MiniLM-L6-v2
**Frontend:** React 19 · Vite · Zustand · Tailwind CSS

---

## Legend
- `[x]` = Done & verified working
- `[~]` = Partially done — has issues (see notes)
- `[ ]` = Not started / missing entirely
- `[P]` = Priority: high / `[M]` = medium / `[L]` = low

---

## ✅ COMPLETED & VERIFIED

### Auth & Security
- [x] Student JWT with httpOnly `student_token` cookie + 10-min sliding window
- [x] Admin JWT with httpOnly `admin_token` cookie + 4-hour hard session
- [x] Admin user provisioning (create/deactivate accounts)
- [x] bcrypt hashing (12 rounds)
- [x] express-rate-limit on auth/general routes (20 req/15min auth, 200 req/15min general)
- [x] First-login password reset flow (`requirePasswordReset` + `POST /api/auth/change-password`)

### Query Lifecycle
- [x] Query submission with category + up to 5 tags + screenshot uploads
- [x] 3-layer similarity dedup: Jaccard ≥0.85 → Levenshtein ≥0.75 → MiniLM cosine ≥0.88
- [x] Self-duplicate hard block (409 `SELF_DUPLICATE`)
- [x] Community duplicate → auto-vote + notification interest (no new query created)
- [x] 10-minute edit window with live countdown + modal
- [x] Hard delete with cascade (cache, votes, drafts)
- [x] `POST /api/queries/:id/not-satisfied` → re-queues + triggers `escalation_acked` notification

### Genie (Page 2, Default View)
- [x] Top 5 queries from cache (upvotes DESC), live Socket.IO refresh on new query
- [x] Genie search with full 3-layer semantic similarity (MiniLM + Jaccard + Levenshtein)
- [x] Screenshot upload end-to-end: Dropzone UI → `POST /api/upload` → FormData on submit → admin drawer display
- [x] Upvote (mutually exclusive with flag, toggle off) on cache questions — API wired
- [x] Flag on cache questions (3+ flags → auto-hide, -1 confidence to answerer) — API wired
- [x] Upvote and flag on cache answers — API wired
- [x] "Notify me when answered" (separate from upvote) — API wired
- [x] Submitter cannot vote on own question or answer (backend enforced)
- [x] Submitter cannot answer own question (backend enforced)
- [x] QuestionCard: expandable with answer display, vote buttons, Notify Me

### Solve a Query Panel
- [x] Unanswered queries list from cache
- [x] Trusted users (≥3 pts): answer posted directly + `query_answered` notification
- [x] New users (0–2 pts): answer stored pending admin approval
- [x] Live removal from list when query gets answered (Socket.IO `query:answered`)

### Raise a Query Form
- [x] Real-time 3-layer similarity scan (600ms debounce)
- [x] Self-duplicate hard block in UI (submit disabled)
- [x] FAQ matches shown with question + answer preview
- [x] Community matches shown with vote count + status
- [x] Character counter: green 0–399 / amber 400–469 / red 470–500
- [x] Category selector (fetched from API)
- [x] Tag chips (up to 5, comma-separated)
- [x] Draft auto-save (30s interval + 2s debounce) + restore banner
- [x] Estimated reply time display (from `GET /api/stats`)

### Status Tracker
- [x] `QueryStatusTracker` — 3-stage: Posted → In Progress → Answered/Rejected
- [x] Active stage pulses with coloured ring
- [x] Rejection reason displayed below tracker
- [x] FAQ promotion note shown when promoted

### Notifications & Email
- [x] Notification schema + bell dropdown + unread count (`GET /api/notifications/count`)
- [x] `query_answered` (admin + trusted answerer)
- [x] `query_rejected`
- [x] `added_to_faq`
- [x] `trusted_confirmed` (+1 confidence awarded) — ✅ implemented in `approve-trusted` route; ❌ NOT sent when trusted user auto-posts directly from `answers.js`
- [x] `escalation_acked` (triggered on mark-seen after escalation)
- [x] `answer_flagged` (when 3-flag auto-hide triggers)
- [x] Email notification service (Nodemailer, skips silently if SMTP not configured)
- [x] Daily admin digest email at 08:00 IST

### Admin Dashboard
- [x] Query list with status tabs: Pending / Under Review / In Progress / Answered / Rejected / Deleted / All
- [x] Search + sort (oldest/newest/most-voted/alpha)
- [x] Query drawer: answer / reject (with reason) / promote-to-FAQ / override / approve-trusted / mark-seen / mark-progress / soft-delete / restore / unhide-from-genie
- [x] Context-aware action buttons (Answer/Reject hidden when already answered/rejected) — FIXED 2026-06-02
- [x] Screenshot display in drawer
- [x] Answerer identity shown (answeredBy populated with name + email)
- [x] Pending answers section with per-item ✓ Approve button (M2 — committed `5a2aa2f`)
- [x] Comments section showing approved student answers as community discussion (M2 — committed `5a2aa2f`)
- [x] `unhide` button appears in drawer when `cacheEntry.isHidden === true`
- [x] Flag count shown in drawer header (P1 — flagCount synced from QueryCache on every flag vote) — FIXED 2026-06-02
- [x] `flagCount` stored in Query model, back-populated via `scripts/syncFlagCount.js` — FIXED 2026-06-02
- [x] User management (create account, deactivate/reactivate)
- [x] Category CRUD
- [ ] **FAQ Management backend routes** — `POST /api/admin/faqs`, `PUT /api/admin/faqs/:id`, `DELETE /api/admin/faqs/:id` return 404; AdminDashboard has the full CRUD UI but no working endpoints
- [ ] **Admin cache/Genie management routes** — no `GET /api/admin/cache`, `PATCH /api/admin/cache/:id` routes mounted; `unhide` only works via query drawer, no standalone cache management
- [ ] **Admin dedicated Genie page** — no `/admin/genie` route, no `AdminGenie.jsx` or `AdminCache.jsx`; admin sees no separate Genie tab (correctly absent)
- [x] **Trusted user direct-answer auto reward** — `approve-trusted` ✅ correctly awards +1 confidence; trusted path in `answers.js` now also awards `+1 confidence` and sends `trusted_confirmed` notification — FIXED 2026-06-02
- [x] **Admin user PATCH requires `active` boolean** — cannot set `confidenceScore` alone; must pass `{ active: true, confidenceScore: N }` — FIXED 2026-06-02 (either field works independently; validation added)


### Real-time
- [x] Socket.IO server running with JWT handshake auth
- [x] `io.emit('query:new', ...)` on new query submission
- [x] `io.emit('query:answered', ...)` on admin/trusted answer
- [x] Client live-refresh: Genie top5 on `query:new`; SolveQuery list on `query:answered`

### UI/UX Polish
- [x] 3-tab nav bar (Genie / Raise a Query / Solve a Query) — tab-based, no routing
- [x] Remove left sidebar from Page 2
- [x] TierBadge (New / ★ Trusted / ★★★ Expert) + ConfidenceBadge component
- [x] TrustMilestone progress line in ProfilePopup
- [x] Inactivity warning banner (2-min) + auto-logout
- [x] `sessionExpired` flag → specific "Session expired" message on login page
- [x] ProfilePopup with name/email/confidence + tier + My Queries inline (expandable)
- [x] Estimated reply time in student UI (submit success state + MyQueryCard)
- [x] Empty states for Genie search, SolveQuery, My Queries
- [x] Framer Motion panel transitions (GENIE ↔ RAISE ↔ SOLVE)
- [x] Skeleton loading states (Genie, SolveQuery, My Queries)

### Infrastructure
- [x] Hourly cron sweep for expired cache entries
- [x] 15-day MongoDB TTL index on `QueryCache.expiresAt`
- [x] Helmet security headers
- [x] Morgan request logging (token-sanitised)
- [x] `NODE_ENV=production` CORS restriction

---

## ⚠️ ISSUES FOUND (by priority)

### 🔴 HIGH — Must fix before production

**[P-H1] SMTP not configured**
- File: `Backend/.env` — placeholder values for `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
- Impact: Email notifications silently skipped; students/admins never receive them
- Fix: Replace with real Mailgun/SendGrid/Resend credentials

**[P-H2] MongoDB Atlas Vector Search index** — DEFERRED (M0 tier doesn't support Vector Search; needs M10+)
- Collection: `queries` — `embedding` field (384-dim MiniLM) has no Atlas index
- Impact: Cosine similarity layer inactive; falls back to Jaccard/Levenshtein only
- Fix: Upgrade to M10+ cluster → create Vector Search index in Atlas UI (field=`embedding`, dim=384, sim=`cosine`)

**[P-H3] Image upload stored locally on disk** — DEFERRED to deploy-time
- File: `Backend/routes/upload.js` + `server.js`
- Issue: `multer.diskStorage` writes to `Backend/uploads/` — ephemeral on Render/Railway
- Impact: Uploaded images silently deleted after redeploy
- Fix: Replace with Cloudinary (free tier) — requires cloud account setup

---

### 🟡 MEDIUM — Polish / correctness

**[P-M1] `similarity.scan` in-memory query fetching**
- File: `Backend/routes/similarity.js`
- Issue: `Query.find({...}).limit(500).lean()` fetched on every scan with no index hint
- Impact: Degrades under load (500 documents scanned per similarity check)
- Fix: Add covering index on `{status: 1, createdAt: -1}` or add projection `{_id:1, title:1, embedding:1}`

**[P-M2] Pending answer overwrite race condition** ✅ DONE
- File: `Backend/routes/answers.js` + `models/Query.js` + `routes/admin.queries.js`
- Fix: `query.pendingAnswers` array accumulates all student answers (no overwrite); admin approves one via `PATCH .../approve-pending-answer` → sets official `answer`, migrates all pending to `comments`
- Commits: `53501a6` `580d2ed` `5a2aa2f`

**[P-M3] Embedding race on submission**
- File: `Backend/routes/queries.js`
- Issue: `generateEmbedding()` runs after `res.json()` → query saved without embedding; duplicate detection next time misses vector layer
- Impact: Recently submitted queries only use Jaccard/Levenshtein until query is re-saved
- Fix: `await generateEmbedding()` before saving query, or save with embedding in same call

**[P-M4] `JWT_SECRET` unused**
- File: `Backend/.env`
- Impact: Variable defined but not referenced anywhere — confusion
- Fix: Remove or document its purpose

---

### 🟢 LOW — Nice to have

**[P-L1] Upload route is public (no auth middleware)**
- File: `Backend/routes/upload.js`
- Issue: `router.post('/', ...)` has no `authStudent` or rate-limit override
- Impact: Anyone can flood the disk with image uploads
- Fix: Add `authStudent` middleware + `postLimiter`

**[P-L2] `BASE_URL` fallback to localhost in upload.js**
- File: `Backend/routes/upload.js`
- Issue: `const baseUrl = process.env.BASE_URL || \`http://localhost:${process.env.PORT || 5002}\`` — if `BASE_URL` unset in production, image URLs are wrong
- Fix: Make `BASE_URL` required in env validation

**[P-L3] PRD.md FAQ DB schema truncated**
- File: `PRD.md`
- Impact: Specification is incomplete for FAQ collection
- Fix: Add complete FAQ schema to PRD.md

**[P-L4] Admin session hard-expiry policy**
- File: `Backend/middleware/authAdmin.js`
- Issue: Admin JWT has 4-hour hard session (no sliding window) — active admin still expires in 4h
- Fix: Consider sliding window for admin if longer sessions desired

---

## ✅ BUGS FIXED (2026-06-02)

- [x] `.env` `CLIENT_URL` typo (`http://localhost:517` → `http://localhost:5173`) — FIXED
- [x] `answers.js` dead code: `io.emit('query:answered', ...)` unreachable after `return` — FIXED (moved before return)
- [x] Admin drawer: Answer/Reject buttons shown for resolved queries — FIXED (added status guards)
- [x] Admin drawer: flag count not shown in drawer header — FIXED (added `flagCount` to Query schema, `syncQueryFlagCount()` called on every flag vote in `cache.js`, back-populated via `scripts/syncFlagCount.js`)

---

## 🗺️ FULLY VERIFIED API ROUTES

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | `/api/auth/login` | Public | ✅ |
| POST | `/api/auth/logout` | Student | ✅ |
| GET | `/api/auth/me` | Student | ✅ |
| POST | `/api/auth/change-password` | Student | ✅ |
| POST | `/api/admin/auth/login` | Public | ✅ |
| POST | `/api/admin/auth/logout` | Admin | ✅ |
| GET | `/api/admin/auth/me` | Admin | ✅ |
| GET | `/api/admin/queries` | Admin | ✅ |
| PATCH | `/api/admin/queries/:id/answer` | Admin | ✅ |
| PATCH | `/api/admin/queries/:id/reject` | Admin | ✅ |
| PATCH | `/api/admin/queries/:id/approve-trusted` | Admin | ✅ |
| PATCH | `/api/admin/queries/:id/override-answer` | Admin | ✅ |
| PATCH | `/api/admin/queries/:id/promote-faq` | Admin | ✅ |
| PATCH | `/api/admin/queries/:id/mark-seen` | Admin | ✅ |
| PATCH | `/api/admin/queries/:id/mark-progress` | Admin | ✅ |
| PATCH | `/api/admin/queries/:id/soft-delete` | Admin | ✅ |
| PATCH | `/api/admin/queries/:id/restore` | Admin | ✅ |
| PATCH | `/api/admin/queries/:id/unhide` | Admin | ✅ |
| GET | `/api/admin/users` | Admin | ✅ |
| POST | `/api/admin/users` | Admin | ✅ |
| PATCH | `/api/admin/users/:id` | Admin | ✅ |
| POST | `/api/queries` | Student | ✅ |
| GET | `/api/queries/mine` | Student | ✅ |
| GET | `/api/queries/:id` | Student | ✅ |
| PATCH | `/api/queries/:id` | Student | ✅ |
| DELETE | `/api/queries/:id` | Student | ✅ |
| POST | `/api/queries/:id/not-satisfied` | Student | ✅ |
| POST | `/api/answers/:queryId` | Student | ✅ |
| POST | `/api/similarity/scan` | Student | ✅ |
| GET | `/api/cache/top5` | Student | ✅ |
| GET | `/api/cache/unanswered` | Student | ✅ |
| GET | `/api/cache/search?q=` | Student | ✅ |
| POST | `/api/cache/:cacheId/vote` | Student | ✅ |
| GET | `/api/notifications` | Student | ✅ |
| GET | `/api/notifications/count` | Student | ✅ |
| PATCH | `/api/notifications/:id/read` | Student | ✅ |
| POST | `/api/notifications/read-all` | Student | ✅ |
| GET | `/api/drafts/mine` | Student | ✅ |
| PUT | `/api/drafts/mine` | Student | ✅ |
| DELETE | `/api/drafts/mine` | Student | ✅ |
| GET | `/api/categories` | Public | ✅ |
| POST | `/api/categories` | Admin | ✅ |
| PATCH | `/api/categories/:id` | Admin | ✅ |
| DELETE | `/api/categories/:id` | Admin | ✅ |
| GET | `/api/stats` | Public | ✅ |
| POST | `/api/upload` | Public | ⚠️ Needs auth |
| GET | `/api/faqs/all` | Public | ✅ |
| GET | `/health` | Public | ✅ |

---

## 📁 KEY FILES REFERENCE

| File | Purpose |
|------|---------|
| `Backend/server.js` | Express 5 + Socket.IO + cron setup |
| `Backend/services/similarity.js` | 3-layer dedup: Jaccard / Levenshtein / MiniLM |
| `Backend/services/email.js` | Nodemailer (skips if SMTP missing) |
| `Backend/services/emailDigest.js` | Daily admin digest |
| `Backend/middleware/authStudent.js` | JWT cookie → user object + sliding expiry |
| `Backend/middleware/authSocket.js` | Socket.IO JWT handshake auth |
| `Backend/routes/queries.js` | Submit/edit/delete + Socket.IO emit |
| `Backend/routes/answers.js` | Community answers + trusted direct-post |
| `Backend/routes/cache.js` | Genie top5/search/unanswered + voting |
| `Backend/routes/similarity.js` | FAQ + community duplicate scan |
| `Frontend/src/pages/Page2_Forum.jsx` | Tab shell: Genie / Raise / Solve |
| `Frontend/src/components/p2/Genie.jsx` | Top 5 + search + QuestionCard |
| `Frontend/src/components/p2/RaiseQuery.jsx` | Submit form + similarity panel + draft |
| `Frontend/src/components/p2/SolveQuery.jsx` | Unanswered list + answer form |
| `Frontend/src/pages/AdminDashboard.jsx` | Full admin panel + QueryDrawer |

---

*Last full inspection: 2026-06-02 19:57 GMT+5:30*
*Hedwig 🦉 — VINS · Yaksha FAQ Platform*