import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import Sidebar from '../components/Sidebar';
import Genie from '../components/p2/Genie';
import RaiseQuery from '../components/p2/RaiseQuery';
import SolveQuery from '../components/p2/SolveQuery';
import useAuthStore from '../store/authStore';

const TABS = [
  { key: 'genie',   label: 'Genie',         icon: 'auto_awesome' },
  { key: 'raise',   label: 'Raise a Query',  icon: 'add_circle' },
  { key: 'solve',   label: 'Solve a Query',  icon: 'lightbulb' },
];

export default function Page2_Forum() {
  const navigate = useNavigate();
  const { user, loading, checkAuth, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('genie');
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const inactivityRef = { warning: null, logout: null };

  // Check auth on mount
  useEffect(() => { checkAuth(); }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user]);

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

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col">
      <TopNavBar active="forum" />

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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar active="forum" />

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
            <div className="flex items-center gap-1 p-1 bg-surface-container rounded-xl mb-6 w-fit">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body-sm text-body-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-surface text-primary shadow-sm'
                      : 'text-ink-400 hover:text-ink-700 hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'genie' && (
              <Genie onSwitchToRaise={() => setActiveTab('raise')} />
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
    </div>
  );
}
