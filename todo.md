# TODO — VINS · Yaksha FAQ Platform
## `D:\summership IIT Ropar\FAQ_SOFTWARE`

**Maintained by:** Hedwig 🦉
**Last updated:** 2026-06-03 17:24 GMT+5:30
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
- [x] Student JWT with httpOnly `studentToken` cookie + 10-min sliding window
- [x] Admin JWT with httpOnly `adminToken` cookie + 4-hour hard session
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
- [x] `trusted_confirmed` (+1 confidence awarded) — implemented in both `approve-trusted` (admin route) and trusted direct-answer path in `answers.js`
- [x] `escalation_acked` (triggered on mark-seen after escalation)
- [x] `answer_flagged` (when 3-flag auto-hide triggers)
- [x] Email notification service (Nodemailer, skips silently if SMTP not configured)
- [x] Daily admin digest email at 08:00 IST

### Admin Dashboard
- [x] Query list with status tabs: Pending / Under Review / In Progress / Answered / Rejected / Deleted / All
- [x] Search + sort (oldest/newest/most-voted/alpha)
- [x] Query drawer: answer / reject (with reason) / promote-to-FAQ / override / approve-trusted / mark-seen / mark-progress / soft-delete / restore / unhide-from-genie
- [x] Context-aware action buttons (Answer/Reject hidden when already answered/rejected)
- [x] Screenshot display in drawer
- [x] Answerer identity shown (answeredBy.name + email; trusted badge for trusted users)
- [x] Pending answers section with per-item ✓ Approve button
- [x] Comments section showing approved student answers as community discussion
- [x] `unhide` button appears in drawer when `cacheEntry.isHidden === true`
- [x] Flag count shown in drawer header (`flagCount` synced from QueryCache on every flag vote)
- [x] User management (create account, deactivate/reactivate)
- [x] Category CRUD
- [x] **FAQ Management** — full CRUD at `/api/faqs` (POST/PUT/DELETE) — tested working end-to-end ✅
- [x] **Trusted user auto-reward** — `approve-trusted` awards +1 confidence; trusted direct-answer in `answers.js` also awards +1 confidence
- [x] **Admin Genie (cache management) page** — implemented 2026-06-03
  - `Backend/routes/admin.cache.js`: GET /api/admin/cache/all, PATCH hide, PATCH unhide, DELETE (cascade CacheVote)
  - AdminDashboard.jsx: 'genie' tab with paginated table (title, category, upvotes, flags, answer status, hidden status, expiry)
  - All/Visible/Hidden filter + title search + pagination
  - Per-row actions: Hide (removes from student Genie), Unhide (restores to Genie), Delete (hard-delete with confirm dialog)
  - All 4 endpoints tested: 200 OK confirmed via Node.js HTTP
  - Commits: beee11d (scaffold) → 642e773 (routes) → 3767f8b (UI + test)
  - Pushed to origin/main ✅
- [x] **Restore + unhide coordination issue** — fixed 2026-06-03
  - `PATCH /api/admin/queries/:id/restore` now calls `QueryCache.findOne({ queryId })` and also sets `isHidden=false` if the cache entry was auto-hidden by flags
  - Also fixed `PATCH /queries/:id/unhide` which had the same `populate('cacheEntry')` bug (Query model has no cacheEntry field — was causing CastError 500)
  - Single 'Restore to Answered' click now fully restores to both Answered tab AND Genie
  - Commits: 1dd5804 → 172ae45 → 97e2f68 (all pushed ✅)

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

**[P-H1] SMTP — Resend configured, student emails removed** ✅ DONE 2026-06-03
- Removed nodemailer, added `resend` SDK
- `Backend/services/email.js` rewritten with Resend HTTP API
- `Backend/.env` has `RESEND_API_KEY` + `RESEND_FROM_EMAIL` set
- `emailDigest.js` (admin daily digest) still works via Resend ✅
- All student-facing email calls removed: `sendAnswerNotification`, `sendFAQPromotionNotification`, `sendRejectionNotification` no longer called from `admin.queries.js`
- `RaiseQuery.jsx`: `notifyEmail` toggle removed (was dead UI — emails never worked)
- In-app notifications (bell icon) remain fully functional
- Free tier limitation: Resend free plan can only send to verified `kiwi61472@gmail.com`; students can't receive emails yet
- For production: add custom domain or upgrade to paid Resend plan to enable student emails
- Commits: 78d498e (setup) → 9765038 (test) → 9bd1bd3 (backend) → fb857c5 (frontend) → pending (todo)

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

**[P-M1] `similarity.scan` index + projection** ✅ DONE 2026-06-03
- `scripts/m1_similarity_index.js`: creates compound index `{ status: 1, createdAt: -1 }` on queries collection (background, non-blocking)
- `similarity.js`: added `.project({ _id, title, embedding, submittedBy, status, tags, voteCount, answer, category })` — covering projection, cuts data from ~768KB → ~100KB per scan
- Added `.hint({ status: 1, createdAt: -1 })` — forces compound index usage, avoids collection scan
- Commits: ed35c30 (migration) → 86ec6f8 (projection+hint) → pending (todo)

**[P-M2] Pending answer overwrite race condition** ✅ DONE
- File: `Backend/routes/answers.js` + `models/Query.js` + `routes/admin.queries.js`
- Fix: `query.pendingAnswers` array accumulates all student answers (no overwrite); admin approves one via `PATCH .../approve-pending-answer` → sets official `answer`, migrates all pending to `comments`
- Commits: `53501a6` `580d2ed` `5a2aa2f`

**[P-M3] Embedding race on submission** ✅ DONE 2026-06-03
- POST /queries: `generateEmbedding(title)` now awaited BEFORE `Query.create()` — embedding stored on first save, no race window
- POST /queries dup-check query: also gets M1 index hint + covering projection (same as similarity.js)
- PATCH /queries/:id: when title is edited, `generateEmbedding(newTitle)` runs non-blocking after response — embedding stays in sync with title
- Commits: c36229b (feature) → pending (todo)

**[P-M4] `JWT_SECRET` unused variable** ✅ DONE 2026-06-03
- Removed dead `JWT_SECRET=...` from `Backend/.env` (local, gitignored)
- Removed `JWT_SECRET=...` from `Backend/.env.example`
- `JWT_STUDENT_SECRET` and `JWT_ADMIN_SECRET` remain (the actual secrets used)
- Commits: 5944474 (feature) → pending (todo)

---

### 🟢 LOW — Nice to have

**[P-L1] Upload route is public** ✅ DONE 2026-06-03
- `server.js`: added `const authStudent = require('./middleware/authStudent')` + applied to `/api/upload` mount
- Before: unauthenticated multipart POST — anyone could flood `uploads/`
- After: requires valid `studentToken` JWT cookie; `generalLimiter` (200 req/15min per IP) still applies
- Abuse now tied to a real user account — can be traced and deactivated
- Commits: 336d32e (feature) → pending (todo)

**[P-L2] `BASE_URL` fallback to localhost** ✅ DONE 2026-06-03
- `server.js`: `BASE_URL` added to required env list — server exits on startup if missing
- `upload.js`: removed `|| localhost` fallback — now returns 500 with clear error if `BASE_URL` unset
- `.env.example`: `BASE_URL` documented with dev/production values
- Local `.env`: `BASE_URL=http://localhost:5002` set (gitignored, not in git)
- Commits: b9195a6 (feature) → pending (todo)

**[P-L3] PRD.md FAQ DB schema truncated** ✅ DONE 2026-06-03
- `PRD.md` section 7.4 rewritten to match actual `FAQ.js` model
- `category: ObjectId` → `category: String` (type was wrong)
- Added all 14 actual fields with descriptions + correct indexes
- Commits: 8b6ec6a → c90f97a → pending (todo)

**[P-L4] Admin session hard-expiry policy** ✅ DONE (already correct)
- `ADMIN_SESSION_HOURS = 4` in `admin.auth.js` — hardcoded, no sliding window
- `jwt.sign` uses `expiresIn: '4h'` — session dies at the 4-hour mark regardless of activity
- `GET /me` does NOT reissue token — verified in `admin.auth.js`
- No code change needed — was already implemented correctly

---

## ✅ BUGS FIXED (2026-06-02)

- [x] `.env` `CLIENT_URL` typo (`http://localhost:517` → `http://localhost:5173`) — FIXED
- [x] `answers.js` dead code: `io.emit('query:answered', ...)` unreachable after `return` — FIXED (moved before return)
- [x] Admin drawer: Answer/Reject buttons shown for resolved queries — FIXED (added status guards)
- [x] Admin drawer: flag count not shown in drawer header — FIXED (added `flagCount` to Query schema, `syncQueryFlagCount()` called on every flag vote in `cache.js`, back-populated via `scripts/syncFlagCount.js`)

---

## 📁 ROUTE MAP (confirmed from server.js)

```
app.use('/api/faqs',          postLimiter,  require('./routes/faq'));        // CRUD + authAdmin
app.use('/api/auth',                          require('./routes/auth'));       // student auth
app.use('/api/admin/auth',                    require('./routes/admin.auth')); // admin auth
app.use('/api/categories',                    require('./routes/categories'));
app.use('/api/upload',                         require('./routes/upload'));     // ⚠ no auth
app.use('/api/queries',                       require('./routes/queries'));
app.use('/api/similarity',  similarityLimiter,require('./routes/similarity'));
app.use('/api/cache',                          require('./routes/cache'));
app.use('/api/stats',                          require('./routes/stats'));
app.use('/api/drafts',                         require('./routes/drafts'));
app.use('/api/answers',                        require('./routes/answers'));
app.use('/api/admin',                          require('./routes/admin.queries'));
app.use('/api/notifications',                  require('./routes/notifications'));
```

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

*Last full inspection: 2026-06-03 15:10 GMT+5:30*
*Hedwig 🦉 — VINS · Yaksha FAQ Platform*