import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api2 from '../lib/axiosP2';
import useAuthStore from '../store/authStore';
import QueryStatusTracker from '../components/p2/QueryStatusTracker';
import { formatDistanceToNow } from 'date-fns';

// ── Admin Login Screen ───────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const adminLogin = useAuthStore((s) => s.adminLogin);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await adminLogin(form.email.trim(), form.password);
      onLogin();
    } catch (err) {
      setError(err?.response?.data?.error || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-admin-surface border border-admin-border rounded-xl p-8">
        <h1 className="font-headline-md text-headline-md text-ink-50 mb-1">Admin Portal</h1>
        <p className="font-body-sm text-body-sm text-ink-400 mb-6">VINS · Yaksha</p>
        {error && (
          <div className="mb-4 px-3 py-2 bg-error-container rounded-lg">
            <p className="font-body-sm text-body-sm text-error">{error}</p>
          </div>
        )}
        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            type="email" placeholder="Admin email" value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg font-body-md text-body-md text-ink-50 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
          <input
            type="password" placeholder="Password" value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg font-body-md text-body-md text-ink-50 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
          <button
            type="submit" disabled={loading}
            className="w-full bg-primary text-on-primary py-2.5 rounded-lg font-body-sm text-body-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Query Detail Drawer ──────────────────────────────────────────────────────
function QueryDrawer({ query, onClose, onRefresh }) {
  const [answer, setAnswer] = useState(query.answer || '');
  const [rejectReason, setRejectReason] = useState('');
  const [mode, setMode] = useState('view'); // view | answer | reject | faq
  const [faqForm, setFaqForm] = useState({ question: query.title, answer: query.answer || '', category: query.category?.name || '', tags: (query.tags || []).join(', ') });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const act = async (action, body = {}) => {
    setLoading(true); setMsg('');
    try {
      await api2.patch(`/admin/queries/${query._id}/${action}`, body);
      setMsg('Done!');
      setTimeout(() => { onRefresh(); onClose(); }, 800);
    } catch (err) {
      setMsg(err?.response?.data?.error || 'Error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-full max-w-lg bg-admin-surface border-l border-admin-border flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-admin-border">
          <div className="min-w-0">
            <p className="font-label-mono text-label-mono text-ink-400 uppercase mb-1">{query.category?.name}</p>
            <p className="font-body-md text-body-md font-medium text-ink-50">{query.title}</p>
            <p className="font-label-mono text-label-mono text-ink-400 mt-1">
              {query.submittedBy?.name} · {formatDistanceToNow(new Date(query.createdAt), { addSuffix: true })} · {query.voteCount} vote{query.voteCount !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-50 transition-colors shrink-0">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Status tracker */}
        <div className="p-5 border-b border-admin-border">
          <QueryStatusTracker status={query.status} rejectionReason={query.rejectionReason} />
        </div>

        {/* Tags */}
        {query.tags?.length > 0 && (
          <div className="px-5 py-3 border-b border-admin-border flex gap-2 flex-wrap">
            {query.tags.map((t) => (
              <span key={t} className="font-label-mono text-label-mono text-ink-400 bg-admin-bg px-2 py-0.5 rounded-full">#{t}</span>
            ))}
          </div>
        )}

        {/* Existing answer */}
        {query.answer && (
          <div className="p-5 border-b border-admin-border">
            <p className="font-label-mono text-label-mono text-ink-400 uppercase mb-2">
              {query.isTrustedAnswer ? 'Community Answer (Trusted User)' : 'Answer'}
            </p>
            <p className="font-body-sm text-body-sm text-ink-200">{query.answer}</p>
            {query.askerSatisfied === false && (
              <p className="mt-2 font-label-mono text-label-mono text-status-escalated uppercase">⚠ Asker not satisfied — override recommended</p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="p-5 border-b border-admin-border flex gap-2 flex-wrap">
          {query.adminStatus === 'pending' && (
            <button onClick={() => act('mark-seen')} disabled={loading}
              className="px-3 py-1.5 bg-admin-bg border border-admin-border text-amber-400 font-body-sm text-body-sm rounded-lg hover:border-amber-400 transition-colors">
              Mark as Seen
            </button>
          )}
          {(query.adminStatus === 'seen' || query.adminStatus === 'pending') && (
            <button onClick={() => act('mark-progress')} disabled={loading}
              className="px-3 py-1.5 bg-admin-bg border border-admin-border text-ink-200 font-body-sm text-body-sm rounded-lg hover:border-primary hover:text-primary transition-colors">
              Mark In Progress
            </button>
          )}
          <button onClick={() => setMode(mode === 'answer' ? 'view' : 'answer')}
            className={`px-3 py-1.5 font-body-sm text-body-sm rounded-lg border transition-colors ${mode === 'answer' ? 'bg-primary text-on-primary border-primary' : 'bg-admin-bg border-admin-border text-ink-200 hover:border-primary hover:text-primary'}`}>
            {query.isTrustedAnswer && query.askerSatisfied === false ? 'Override Answer' : 'Answer'}
          </button>
          {query.isTrustedAnswer && query.adminStatus !== 'answered' && (
            <button onClick={() => act('approve-trusted')} disabled={loading}
              className="px-3 py-1.5 bg-admin-bg border border-conf-high/40 text-conf-high font-body-sm text-body-sm rounded-lg hover:bg-conf-high/10 transition-colors">
              ✓ Approve Community Answer
            </button>
          )}
          <button onClick={() => setMode(mode === 'faq' ? 'view' : 'faq')}
            className={`px-3 py-1.5 font-body-sm text-body-sm rounded-lg border transition-colors ${mode === 'faq' ? 'bg-primary text-on-primary border-primary' : 'bg-admin-bg border-admin-border text-ink-200 hover:border-primary hover:text-primary'}`}>
            Promote to FAQ
          </button>
          <button onClick={() => setMode(mode === 'reject' ? 'view' : 'reject')}
            className={`px-3 py-1.5 font-body-sm text-body-sm rounded-lg border transition-colors ${mode === 'reject' ? 'bg-error text-on-error border-error' : 'bg-admin-bg border-admin-border text-ink-200 hover:border-error hover:text-error'}`}>
            Reject
          </button>
        </div>

        {/* Answer form */}
        {mode === 'answer' && (
          <div className="p-5 flex flex-col gap-3">
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6} placeholder="Write the official answer…"
              className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-xl font-body-sm text-body-sm text-ink-50 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <button onClick={() => act(query.isTrustedAnswer && query.askerSatisfied === false ? 'override-answer' : 'answer', { answer })}
              disabled={loading || !answer.trim()}
              className="self-end bg-primary text-on-primary px-4 py-2 rounded-lg font-body-sm text-body-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors">
              {loading ? 'Saving…' : 'Submit Answer'}
            </button>
          </div>
        )}

        {/* Reject form */}
        {mode === 'reject' && (
          <div className="p-5 flex flex-col gap-3">
            <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection reason (optional)" 
              className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-xl font-body-sm text-body-sm text-ink-50 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-error/40"
            />
            <button onClick={() => act('reject', { reason: rejectReason })} disabled={loading}
              className="self-end bg-error text-on-error px-4 py-2 rounded-lg font-body-sm text-body-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all">
              {loading ? 'Rejecting…' : 'Confirm Reject'}
            </button>
          </div>
        )}

        {/* FAQ promote form */}
        {mode === 'faq' && (
          <div className="p-5 flex flex-col gap-3">
            <p className="font-label-mono text-label-mono text-ink-400 uppercase">Edit before promoting</p>
            <input value={faqForm.question} onChange={(e) => setFaqForm((f) => ({ ...f, question: e.target.value }))}
              placeholder="Question" 
              className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-xl font-body-sm text-body-sm text-ink-50 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <textarea value={faqForm.answer} onChange={(e) => setFaqForm((f) => ({ ...f, answer: e.target.value }))} rows={5}
              placeholder="Answer" 
              className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-xl font-body-sm text-body-sm text-ink-50 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <button onClick={() => act('promote-faq', faqForm)} disabled={loading || !faqForm.question || !faqForm.answer}
              className="self-end bg-conf-high text-white px-4 py-2 rounded-lg font-body-sm text-body-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all">
              {loading ? 'Promoting…' : 'Promote to FAQ'}
            </button>
          </div>
        )}

        {msg && (
          <div className="mx-5 mb-5 px-3 py-2 bg-surface-container rounded-lg">
            <p className="font-body-sm text-body-sm text-conf-high">{msg}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Status Tab Button ───────────────────────────────────────────────────────
const STATUS_TABS = [
  { key: 'pending',     label: 'Pending',      color: 'text-status-open' },
  { key: 'seen',        label: 'Under Review', color: 'text-status-verifying' },
  { key: 'in_progress', label: 'In Progress',  color: 'text-status-verifying' },
  { key: 'answered',    label: 'Answered',     color: 'text-conf-high' },
  { key: 'rejected',    label: 'Rejected',     color: 'text-error' },
  { key: 'all',         label: 'All',          color: 'text-ink-400' },
];

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { admin, loading, checkAdminAuth, adminLogout } = useAuthStore();
  const [ready, setReady] = useState(false);
  const [queries, setQueries] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusTab, setStatusTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('oldest');
  const [page, setPage] = useState(1);
  const [loadingQ, setLoadingQ] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeSection, setActiveSection] = useState('queries'); // queries | users
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '' });
  const [userMsg, setUserMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth().then(() => setReady(true));
  }, []);

  const fetchQueries = async () => {
    setLoadingQ(true);
    try {
      const params = new URLSearchParams({ status: statusTab, page, limit: 20, sort });
      if (search) params.set('search', search);
      const r = await api2.get(`/admin/queries?${params}`);
      setQueries(r.data.queries);
      setTotal(r.data.total);
    } catch {
      setQueries([]);
    } finally {
      setLoadingQ(false);
    }
  };

  useEffect(() => { if (admin) fetchQueries(); }, [admin, statusTab, page, search, sort]);

  const fetchUsers = async () => {
    const r = await api2.get('/admin/users');
    setUsers(r.data);
  };
  useEffect(() => { if (admin && activeSection === 'users') fetchUsers(); }, [admin, activeSection]);

  const createUser = async (e) => {
    e.preventDefault();
    setUserMsg('');
    try {
      await api2.post('/admin/users', { ...userForm, requirePasswordReset: true });
      setUserMsg('Account created. Student must change password on first login.');
      setUserForm({ name: '', email: '', password: '' });
      fetchUsers();
    } catch (err) {
      setUserMsg(err?.response?.data?.error || 'Failed to create user.');
    }
  };

  const toggleUser = async (id, active) => {
    await api2.patch(`/admin/users/${id}`, { active });
    fetchUsers();
  };

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-ink-400 animate-spin">refresh</span>
      </div>
    );
  }

  if (!admin) return <AdminLogin onLogin={() => checkAdminAuth()} />;

  return (
    <div className="min-h-screen bg-admin-bg flex flex-col">
      {/* Admin top bar */}
      <header className="h-header-height border-b border-admin-border flex items-center justify-between px-container-margin bg-admin-surface">
        <div className="flex items-center gap-6">
          <span className="font-headline-md text-headline-md text-ink-50 font-black">Admin · Yaksha</span>
          <nav className="flex gap-1">
            {['queries', 'users'].map((s) => (
              <button key={s} onClick={() => setActiveSection(s)}
                className={`px-3 py-1.5 rounded-lg font-body-sm text-body-sm capitalize transition-colors ${activeSection === s ? 'bg-primary text-on-primary' : 'text-ink-400 hover:text-ink-50 hover:bg-admin-bg'}`}>
                {s}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-body-sm text-body-sm text-ink-400">{admin.name}</span>
          <button onClick={async () => { await adminLogout(); navigate('/admin'); }}
            className="font-body-sm text-body-sm text-ink-400 hover:text-error transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-base">logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-container-margin py-6">
        {/* ── Queries section ─────────────────────────────────────────── */}
        {activeSection === 'queries' && (
          <div className="flex flex-col gap-4">
            {/* Status tabs + search */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1 bg-admin-surface border border-admin-border rounded-xl p-1">
                {STATUS_TABS.map((t) => (
                  <button key={t.key} onClick={() => { setStatusTab(t.key); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg font-label-mono text-label-mono transition-colors ${statusTab === t.key ? `bg-admin-bg ${t.color}` : 'text-ink-400 hover:text-ink-50'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="relative flex-1 min-w-[200px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-lg">search</span>
                <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search queries…"
                  className="w-full pl-10 pr-4 py-2 bg-admin-surface border border-admin-border rounded-xl font-body-sm text-body-sm text-ink-50 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-admin-surface border border-admin-border text-ink-200 font-body-sm text-body-sm rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40">
                <option value="oldest">Oldest first</option>
                <option value="newest">Newest first</option>
                <option value="most-voted">Most voted</option>
                <option value="least-voted">Least voted</option>
                <option value="updated">Recently updated</option>
                <option value="alpha">A → Z</option>
              </select>
              <p className="font-label-mono text-label-mono text-ink-400">{total} total</p>
            </div>

            {/* Query list */}
            {loadingQ ? (
              <div className="flex flex-col gap-2">
                {[1,2,3,4,5].map((i) => <div key={i} className="h-16 bg-admin-surface rounded-xl animate-pulse" />)}
              </div>
            ) : queries.length === 0 ? (
              <div className="text-center py-16 bg-admin-surface rounded-xl border border-admin-border">
                <p className="font-body-sm text-body-sm text-ink-400">No queries in this status.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {queries.map((q) => (
                  <button key={q._id} onClick={() => setSelected(q)}
                    className="w-full flex items-start gap-4 p-4 bg-admin-surface border border-admin-border rounded-xl hover:border-outline-variant text-left transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`font-label-mono text-label-mono uppercase ${
                          q.adminStatus === 'pending' ? 'text-status-open' :
                          q.adminStatus === 'in_progress' ? 'text-status-verifying' :
                          q.adminStatus === 'answered' ? 'text-conf-high' : 'text-error'
                        }`}>{q.adminStatus?.replace('_', ' ')}</span>
                        {q.category?.name && <span className="font-label-mono text-label-mono text-ink-400">{q.category.name}</span>}
                        {q.isTrustedAnswer && q.askerSatisfied === false && (
                          <span className="font-label-mono text-label-mono text-status-escalated">⚠ Escalated</span>
                        )}
                      </div>
                      <p className="font-body-sm text-body-sm font-medium text-ink-50 line-clamp-1">{q.title}</p>
                      <p className="font-label-mono text-label-mono text-ink-400 mt-0.5">
                        {q.submittedBy?.name} · {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })} · {q.voteCount} vote{q.voteCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-ink-400 text-lg shrink-0 mt-0.5">chevron_right</span>
                  </button>
                ))}
              </div>
            )}

            {/* Pagination */}
            {total > 20 && (
              <div className="flex items-center justify-between">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 bg-admin-surface border border-admin-border text-ink-400 rounded-lg font-body-sm text-body-sm hover:text-ink-50 disabled:opacity-30 transition-colors">
                  ← Previous
                </button>
                <span className="font-label-mono text-label-mono text-ink-400">Page {page} of {Math.ceil(total / 20)}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 20)}
                  className="px-3 py-1.5 bg-admin-surface border border-admin-border text-ink-400 rounded-lg font-body-sm text-body-sm hover:text-ink-50 disabled:opacity-30 transition-colors">
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Users section ────────────────────────────────────────────── */}
        {activeSection === 'users' && (
          <div className="flex flex-col gap-6 max-w-2xl">
            {/* Create user form */}
            <div className="bg-admin-surface border border-admin-border rounded-xl p-5">
              <h2 className="font-headline-md text-headline-md text-ink-50 mb-4">Create Student Account</h2>
              <form onSubmit={createUser} className="flex flex-col gap-3">
                <input value={userForm.name} onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Full name" required
                  className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-xl font-body-sm text-body-sm text-ink-50 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input type="email" value={userForm.email} onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="Email" required
                  className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-xl font-body-sm text-body-sm text-ink-50 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input type="password" value={userForm.password} onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Temporary password (min 8 chars)" required minLength={8}
                  className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-xl font-body-sm text-body-sm text-ink-50 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button type="submit"
                  className="self-start bg-primary text-on-primary px-4 py-2 rounded-lg font-body-sm text-body-sm font-medium hover:bg-blue-600 transition-colors">
                  Create Account
                </button>
                {userMsg && <p className={`font-body-sm text-body-sm ${userMsg.includes('created') ? 'text-conf-high' : 'text-error'}`}>{userMsg}</p>}
              </form>
            </div>

            {/* User list */}
            <div>
              <h3 className="font-label-mono text-label-mono text-ink-400 uppercase mb-3">All Students ({users.length})</h3>
              <div className="flex flex-col gap-2">
                {users.map((u) => (
                  <div key={u._id} className="flex items-center justify-between gap-3 p-4 bg-admin-surface border border-admin-border rounded-xl">
                    <div>
                      <p className="font-body-sm text-body-sm font-medium text-ink-50">{u.name}</p>
                      <p className="font-label-mono text-label-mono text-ink-400">{u.email} · {u.confidenceScore} pts</p>
                    </div>
                    <button onClick={() => toggleUser(u._id, !u.active)}
                      className={`font-label-mono text-label-mono px-3 py-1 rounded-full border transition-colors ${
                        u.active
                          ? 'text-conf-high border-conf-high/30 hover:bg-error-container hover:text-error hover:border-error/30'
                          : 'text-error border-error/30 hover:bg-surface-container hover:text-conf-high hover:border-conf-high/30'
                      }`}>
                      {u.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Query drawer */}
      {selected && (
        <QueryDrawer query={selected} onClose={() => setSelected(null)} onRefresh={fetchQueries} />
      )}
    </div>
  );
}
