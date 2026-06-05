import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api2 from '../lib/axiosP2';
import TopNavBar from '../components/TopNavBar';
import Samvaad from '../components/p2/Samvaad';
import RaiseQuery from '../components/p2/RaiseQuery';
import SolveQuery from '../components/p2/SolveQuery';
import useAuthStore from '../store/authStore';

const TABS = [
  { key: 'samvaad', label: 'Samvaad',       icon: 'auto_awesome' },
  { key: 'raise',   label: 'Raise a Query',  icon: 'add_circle' },
  { key: 'solve',   label: 'Solve a Query',  icon: 'lightbulb' },
];

function ChangePasswordModal({ onDone }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!newPassword || !confirm) { setError('All fields are required.'); return; }
    if (newPassword.length < 8) { setError('New password must be at least 8 characters.'); return; }
    if (newPassword !== confirm) { setError('Passwords do not match.'); return; }
    if (newPassword === currentPassword) { setError('New password must be different from current.'); return; }
    setLoading(true);
    try {
      await api2.post('/auth/change-password', { currentPassword, newPassword });
      onDone();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink-900/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-ink-100 rounded-xl p-8 w-full max-w-sm shadow-xl">
        <div className="mb-6">
          <h2 className="font-headline-md text-headline-md text-ink-900 mb-1">Change Password</h2>
          <p className="font-body-sm text-body-sm text-ink-400">Set a new password to access the forum.</p>
        </div>
        {error && (
          <div className="mb-4 px-3 py-2 bg-error-container rounded-lg border border-error/20">
            <p className="font-body-sm text-body-sm text-error">{error}</p>
          </div>
        )}
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="block font-label-mono text-label-mono text-ink-400 uppercase mb-1.5">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              autoFocus
              className="w-full px-3 py-2.5 bg-surface-bright border border-ink-200 rounded-lg font-body-md text-body-md text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="block font-label-mono text-label-mono text-ink-400 uppercase mb-1.5">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-3 py-2.5 bg-surface-bright border border-ink-200 rounded-lg font-body-md text-body-md text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="block font-label-mono text-label-mono text-ink-400 uppercase mb-1.5">Confirm New Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat new password"
              className="w-full px-3 py-2.5 bg-surface-bright border border-ink-200 rounded-lg font-body-md text-body-md text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-on-primary py-2.5 rounded-lg font-body-sm text-body-sm font-medium hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1">
            {loading ? 'Saving…' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Page2_Forum() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, checkAuth, logout, sessionExpired } = useAuthStore();
  const [activeTab, setActiveTab] = useState('samvaad');
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const inactivityRef = { warning: null, logout: null };

  // Check auth on mount
  useEffect(() => { checkAuth(); }, []);

  // Detect first-login password reset redirect
  useEffect(() => {
    if (searchParams.get('change-password') === '1') {
      setShowPasswordReset(true);
    }
  }, [searchParams]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate(sessionExpired ? '/login?timeout=1' : '/login');
    }
  }, [loading, user, sessionExpired]);

  // Inactivity timer — 8min warning + 10min logout
  useEffect(() => {
    if (!user) return;
    const resetTimer = () => {
      clearTimeout(inactivityRef.warning);
      clearTimeout(inactivityRef.logout);
      setShowInactivityWarning(false);
      inactivityRef.warning = setTimeout(() => setShowInactivityWarning(true), 8 * 60 * 1000);
      inactivityRef.logout = setTimeout(async () => {
        await logout();
        navigate('/login?timeout=1');
      }, 10 * 60 * 1000);
    };
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((e) => document.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      events.forEach((e) => document.removeEventListener(e, resetTimer));
      clearTimeout(inactivityRef.warning);
      clearTimeout(inactivityRef.logout);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-bright flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-ink-200 animate-spin">refresh</span>
      </div>
    );
  }

  if (!user) return null; // redirecting

  if (showPasswordReset) {
    return (
      <div className="min-h-screen bg-surface-bright flex flex-col">
        <TopNavBar active="forum" user={user} />
        <ChangePasswordModal
          onDone={async () => {
            await checkAuth();
            setShowPasswordReset(false);
            // Clear query param without reload
            const url = new URL(window.location.href);
            url.searchParams.delete('change-password');
            window.history.replaceState({}, '', url.pathname);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col">
      <TopNavBar active="forum" user={user} />

      {/* Inactivity warning banner */}
      {showInactivityWarning && (
        <div className="bg-status-discuss/10 border-b border-status-discuss/20 px-container-margin py-2 flex items-center justify-between gap-4">
          <p className="font-body-sm text-body-sm text-on-surface">
            <span className="font-medium">Still there?</span> You'll be logged out in 2 minutes due to inactivity.
          </p>
          <button
            onClick={() => setShowInactivityWarning(false)}
            className="font-body-sm text-body-sm text-primary hover:underline shrink-0"
          >
            Keep me signed in
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
          <div className="max-w-content-max-width mx-auto px-4 md:px-8 py-8 pb-24">

            {/* Page header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="font-display-lg text-display-lg text-ink-900">Discussion Forum</h1>
                <p className="font-body-sm text-body-sm text-ink-400 mt-1">
                  Signed in as <span className="text-ink-700 font-medium">{user.name}</span>
                </p>
              </div>
              <button
                onClick={async () => { await logout(); navigate('/login'); }}
                className="font-body-sm text-body-sm text-ink-400 hover:text-error transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">logout</span> Sign out
              </button>
            </div>

            {/* Tab switcher */}
            <div className="flex items-center gap-1 p-1 bg-surface-container rounded-xl mb-6 w-fit relative">
              {/* Sliding indicator */}
              <motion.div
                layoutId="tab-indicator"
                className="absolute top-1 bottom-1 bg-surface shadow-sm"
                style={{ borderRadius: '8px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg font-body-sm text-body-sm font-medium transition-colors ${
                    activeTab === tab.key ? 'text-primary' : 'text-ink-400 hover:text-ink-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'samvaad' && (
              <Samvaad user={user} onSwitchToRaise={() => setActiveTab('raise')} />
            )}
            {activeTab === 'raise' && (
              <RaiseQuery user={user} />
            )}
            {activeTab === 'solve' && (
              <SolveQuery user={user} />
            )}
          </div>
      </main>
    </div>
  );
}
