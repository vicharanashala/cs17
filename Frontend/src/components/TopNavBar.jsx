import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api2 from '../lib/axiosP2';
import { formatDistanceToNow } from 'date-fns';

const NOTIF_ICONS = {
  query_answered:    'check_circle',
  query_rejected:    'cancel',
  added_to_faq:      'star',
  answer_flagged:    'flag',
  trusted_confirmed: 'verified',
  escalation_acked:  'redo',
};

const NOTIF_LABELS = {
  query_answered:    'Your query was answered',
  query_rejected:    'Your query was rejected',
  added_to_faq:      'Your query was added to FAQ',
  answer_flagged:    'Your answer was flagged',
  trusted_confirmed: 'Your answer was confirmed by admin',
  escalation_acked:  'Your escalation was acknowledged',
};

function TierBadge({ confidence }) {
  if (confidence >= 10) return <span className="font-label-mono text-label-mono text-amber-600">★ Expert</span>;
  if (confidence >= 3) return <span className="font-label-mono text-label-mono text-conf-high">Trusted</span>;
  return <span className="font-label-mono text-label-mono text-ink-400">New</span>;
}

export default function TopNavBar({ active, user }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch unread count on mount
  useEffect(() => {
    fetchCount();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchCount = async () => {
    try {
      const r = await api2.get('/notifications/count');
      setUnreadCount(r.data.count);
    } catch { /* silent */ }
  };

  const fetchNotifs = async () => {
    try {
      const r = await api2.get('/notifications');
      setNotifs(r.data);
    } catch { /* silent */ }
  };

  const openNotifs = async () => {
    setNotifOpen(true);
    await fetchNotifs();
  };

  const markRead = async (id) => {
    await api2.patch(`/notifications/${id}/read`);
    setNotifs((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await api2.post('/notifications/read-all');
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <header className="bg-surface-bright dark:bg-admin-bg font-headline-md text-headline-md font-body-md text-body-md docked full-width top-0 h-header-height border-b-[1.5px] border-ink-100 dark:border-admin-border flat no shadows flex justify-between items-center w-full px-container-margin max-w-full mx-auto z-50 sticky">
      <div className="flex items-center gap-8">
        <div className="font-headline-md text-headline-md font-black tracking-tight text-ink-900 dark:text-ink-50 cursor-pointer hover:text-primary transition-colors">
          VINS Â· Yaksha
        </div>
        <nav className="hidden md:flex gap-6 items-center h-full">
          <Link to="/overview" className={`font-bold border-b-2 h-full flex items-center px-2 transition-colors hover:bg-ink-50 dark:hover:bg-admin-surface hover:text-primary ${active === 'overview' ? 'text-primary dark:text-primary-fixed-dim border-primary' : 'text-ink-400 dark:text-ink-400 border-transparent'}`}>Overview</Link>
          <Link to="/faq" className={`font-bold border-b-2 h-full flex items-center px-2 transition-colors hover:bg-ink-50 dark:hover:bg-admin-surface hover:text-primary ${active === 'faq' ? 'text-primary dark:text-primary-fixed-dim border-primary' : 'text-ink-400 dark:text-ink-400 border-transparent'}`}>FAQ</Link>
          <Link
            to="/forum"
            className={`font-bold border-b-2 h-full flex items-center px-2 transition-colors hover:bg-ink-50 dark:hover:bg-admin-surface hover:text-primary ${active === 'forum' ? 'text-primary dark:text-primary-fixed-dim border-primary' : 'text-ink-400 dark:text-ink-400 border-transparent'}`}
          >
            Genie
          </Link>
          <a href="#" className="text-ink-400 dark:text-ink-400 font-normal hover:bg-ink-50 dark:hover:bg-admin-surface hover:text-primary transition-colors h-full flex items-center px-2">samagama</a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={openNotifs}
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-ink-100 transition-colors"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-ink-600">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-error text-on-error text-[10px] font-label-mono font-bold rounded-full flex items-center justify-center px-1 leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-ink-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
                <p className="font-label-mono text-label-mono text-ink-500 uppercase">Notifications</p>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="font-label-mono text-label-mono text-primary hover:text-blue-700 text-xs transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="py-8 text-center">
                    <span className="material-symbols-outlined text-ink-300 text-2xl">notifications_off</span>
                    <p className="font-body-sm text-body-sm text-ink-400 mt-2">No notifications yet</p>
                  </div>
                ) : (
                  notifs.map((n) => (
                    <button
                      key={n._id}
                      onClick={() => !n.read && markRead(n._id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-container-low transition-colors border-b border-ink-50 last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}
                    >
                      <span className={`material-symbols-outlined text-lg mt-0.5 shrink-0 ${!n.read ? 'text-primary' : 'text-ink-400'}`}>
                        {NOTIF_ICONS[n.type] || 'notifications'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-body-sm text-body-sm leading-snug ${!n.read ? 'font-medium text-ink-900' : 'text-ink-700'}`}>
                          {n.message || NOTIF_LABELS[n.type] || 'Notification'}
                        </p>
                        {n.queryId?.title && (
                          <p className="font-label-mono text-label-mono text-ink-400 truncate mt-0.5">Re: {n.queryId.title}</p>
                        )}
                        <p className="font-label-mono text-label-mono text-ink-400 mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile avatar + dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="w-8 h-8 rounded-full bg-ink-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all active:scale-[0.98] transition-transform duration-150"
            title="Profile"
          >
            <img src="https://picsum.photos/seed/user_profile/200/200" alt="User profile" className="w-full h-full object-cover" />
          </button>

          {profileOpen && user && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-ink-200 rounded-xl shadow-lg z-50 overflow-hidden">
              {/* User info */}
              <div className="px-4 py-3 border-b border-ink-100">
                <p className="font-body-md text-body-md font-medium text-ink-900 truncate">{user.name || 'Student'}</p>
                <p className="font-label-mono text-label-mono text-ink-400 truncate mt-0.5">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-label-mono text-label-mono text-ink-500">
                    {user.confidence ?? 0} confidence
                  </span>
                  <span className="font-label-mono text-label-mono text-ink-400">·</span>
                  <TierBadge confidence={user.confidence ?? 0} />
                </div>
              </div>

              {/* Links */}
              <div className="py-1">
                <Link
                  to="/forum"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-ink-500 text-lg">inbox</span>
                  <span className="font-body-sm text-body-sm text-ink-700">My Queries</span>
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-ink-100 py-1">
                <button
                  onClick={async () => {
                    setProfileOpen(false);
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/login';
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container-low transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-ink-500 text-lg">logout</span>
                  <span className="font-body-sm text-body-sm text-ink-700">Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}