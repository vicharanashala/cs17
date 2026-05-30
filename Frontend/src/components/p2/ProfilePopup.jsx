import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api2 from '../../lib/axiosP2';
import useAuthStore from '../../store/authStore';

function TrustMilestone({ score }) {
  const tiers = [
    { label: 'New',     range: '0–2' },
    { label: 'Trusted', range: '3–9' },
    { label: 'Expert',  range: '10+' },
  ];
  const activeIndex = score >= 10 ? 2 : score >= 3 ? 1 : 0;
  const progress = activeIndex === 0
    ? (score / 2) * 33
    : activeIndex === 1
    ? 33 + ((score - 3) / 7) * 34
    : 100;

  return (
    <div className="px-4 py-3 border-b border-ink-100">
      <p className="font-label-mono text-label-mono text-ink-400 uppercase mb-4">Trust Level · {score} pts</p>
      <div className="relative px-1">
        <div className="h-1 bg-ink-200 rounded-full w-full" />
        <div
          className="absolute top-0 left-1 h-1 bg-primary rounded-full transition-all duration-500"
          style={{ width: `calc(${Math.min(progress, 100)}% - 8px)` }}
        />
        <div className="flex justify-between absolute -top-1.5 w-full px-1">
          {tiers.map((t, i) => (
            <div key={t.label} className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${i <= activeIndex ? 'bg-primary border-primary' : 'bg-surface border-ink-200'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${i <= activeIndex ? 'bg-white' : 'bg-ink-200'}`} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-5">
          {tiers.map((t, i) => (
            <div key={t.label} className={`flex flex-col ${i === 0 ? 'items-start' : i === 1 ? 'items-center' : 'items-end'}`}>
              <span className={`font-label-mono text-label-mono uppercase font-bold text-[10px] ${i <= activeIndex ? 'text-primary' : 'text-ink-400'}`}>{t.label}</span>
              <span className="font-label-mono text-label-mono text-ink-400 text-[10px]">{t.range} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePopup({ onClose }) {
  const ref = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api2.get('/queries/mine')
      .then(r => setQueries(r.data))
      .catch(() => setQueries([]))
      .finally(() => setLoading(false));
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/login');
  };

  const statusColor = (s) => {
    if (s === 'answered' || s === 'faq_promoted') return 'text-conf-high';
    if (s === 'rejected') return 'text-error';
    if (s === 'in_progress') return 'text-status-verifying';
    return 'text-ink-400';
  };

  const statusLabel = (s) => {
    if (s === 'in_progress') return 'Active';
    if (s === 'faq_promoted') return 'In FAQ';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <div ref={ref} className="absolute right-0 top-12 w-80 bg-surface border border-ink-100 rounded-xl shadow-lg z-50 overflow-hidden">
      {/* Name + email */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-ink-100">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-primary">{user?.name?.[0]?.toUpperCase()}</span>
        </div>
        <div className="min-w-0">
          <p className="font-body-sm text-body-sm font-semibold text-ink-900 truncate">{user?.name}</p>
          <p className="font-label-mono text-label-mono text-ink-400 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Trust milestone */}
      <TrustMilestone score={user?.confidenceScore || 0} />

      {/* My queries */}
      <div className="border-b border-ink-100">
        <div className="px-4 py-2 flex items-center justify-between">
          <p className="font-label-mono text-label-mono text-ink-400 uppercase">My Queries</p>
          <span className="font-label-mono text-label-mono text-ink-400">{queries.length}</span>
        </div>
        <div className="max-h-52 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center">
              <span className="material-symbols-outlined text-ink-200 animate-spin">refresh</span>
            </div>
          ) : queries.length === 0 ? (
            <p className="px-4 pb-3 font-body-sm text-body-sm text-ink-400">No queries yet.</p>
          ) : queries.map(q => (
            <div key={q._id}>
              <button
                onClick={() => setExpanded(expanded === q._id ? null : q._id)}
                className="w-full flex items-start justify-between gap-2 px-4 py-2 hover:bg-surface-container-low transition-colors text-left"
              >
                <p className="font-body-sm text-body-sm text-ink-700 line-clamp-1 flex-1">{q.title}</p>
                <span className={`font-label-mono text-label-mono uppercase shrink-0 text-[10px] ${statusColor(q.status)}`}>
                  {statusLabel(q.status)}
                </span>
              </button>
              {expanded === q._id && (
                <div className="px-4 pb-2 bg-surface-container-low">
                  {q.answer
                    ? <p className="font-body-sm text-body-sm text-ink-700 line-clamp-3">{q.answer}</p>
                    : <p className="font-body-sm text-body-sm text-ink-400 italic">No answer yet.</p>
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2 px-4 py-3 text-error hover:bg-error-container transition-colors font-body-sm text-body-sm"
      >
        <span className="material-symbols-outlined text-base">logout</span>
        Sign out
      </button>
    </div>
  );
}