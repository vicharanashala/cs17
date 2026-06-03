import { useState, useEffect } from 'react';
import api2 from '../lib/axiosP2';
import MyQueryCard from '../components/p2/MyQueryCard';

export default function MyQueriesPage() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all'); // all | pending | resolved

  useEffect(() => {
    api2.get('/queries/mine').then((r) => {
      setQueries(r.data);
    }).catch(() => {
      setQueries([]);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleDelete = (id) => {
    setQueries((prev) => prev.filter((q) => q._id !== id));
  };

  const handleUpdated = (id, updated) => {
    setQueries((prev) => prev.map((q) => q._id === id ? { ...q, ...updated } : q));
  };

  const filtered = queries.filter((q) => {
    if (tab === 'pending') return q.status === 'posted' || q.status === 'in_progress';
    if (tab === 'resolved') return q.status === 'answered' || q.status === 'rejected' || q.status === 'faq_promoted';
    return true;
  });

  const pendingCount = queries.filter((q) => q.status === 'posted' || q.status === 'in_progress').length;
  const resolvedCount = queries.filter((q) => q.status === 'answered' || q.status === 'rejected' || q.status === 'faq_promoted').length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-md text-headline-md text-ink-900">My Queries</h1>
        <p className="font-body-sm text-body-sm text-ink-400">
          {loading ? 'Loadingâ€¦' : `${queries.length} total Â· ${pendingCount} pending Â· ${resolvedCount} resolved`}
        </p>
      </div>

      {/* Tab filter */}
      <div className="flex gap-2 border-b border-ink-100 pb-0">
        {[['all', 'All'], ['pending', 'Pending'], ['resolved', 'Resolved']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-2 font-body-sm text-body-sm border-b-2 transition-colors ${
              tab === key
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-ink-400 hover:text-ink-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="material-symbols-outlined text-2xl text-ink-300 animate-spin">refresh</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-ink-200 text-4xl">inbox</span>
          <p className="font-body-sm text-body-sm text-ink-400">
            {tab === 'all' ? 'You haven\'t submitted any queries yet.' : `No ${tab} queries.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((q) => (
            <MyQueryCard
              key={q._id}
              query={q}
              onDelete={handleDelete}
              onUpdated={handleUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}