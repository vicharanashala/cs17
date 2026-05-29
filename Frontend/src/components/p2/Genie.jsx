import { useEffect, useState, useCallback } from 'react';
import api2 from '../../lib/axiosP2';
import { formatDistanceToNow } from 'date-fns';

function ConfidenceBadge({ tier }) {
  if (tier === 'expert') return (
    <span className="font-label-mono text-label-mono text-conf-high bg-surface-container px-2 py-0.5 rounded-full">★★★ Expert</span>
  );
  if (tier === 'trusted') return (
    <span className="font-label-mono text-label-mono text-status-verifying bg-surface-container px-2 py-0.5 rounded-full">★★ Trusted</span>
  );
  return null;
}

function QuestionCard({ entry, onVote, votedIds }) {
  const q = entry.queryId;
  if (!q) return null;
  const hasVoted = votedIds.has(entry._id);

  return (
    <div className="bg-surface border border-ink-100 rounded-xl p-4 hover:border-outline-variant transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {q.category?.name && (
              <span className="font-label-mono text-label-mono text-ink-400 uppercase">{q.category.name}</span>
            )}
            {q.tags?.slice(0, 2).map((t) => (
              <span key={t} className="font-label-mono text-label-mono text-ink-400 bg-surface-container px-2 py-0.5 rounded-full">#{t}</span>
            ))}
            {entry.answer && (
              <span className="font-label-mono text-label-mono text-conf-high bg-surface-container px-2 py-0.5 rounded-full">✓ Answered</span>
            )}
          </div>
          <p className="font-body-md text-body-md font-medium text-ink-900">{q.title}</p>
          {entry.answer && (
            <div className="mt-2 pt-2 border-t border-ink-100">
              <p className="font-label-mono text-label-mono text-conf-high uppercase mb-1">Answer</p>
              <p className="font-body-sm text-body-sm text-ink-700 line-clamp-2">{entry.answer}</p>
            </div>
          )}
          {!entry.answer && (
            <p className="mt-2 font-label-mono text-label-mono text-ink-400">Awaiting answer</p>
          )}
        </div>
        {/* Vote actions */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          {/* Upvote */}
          <button
            onClick={() => onVote(entry._id, 'upvote')}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg border transition-all ${
              hasVoted
                ? 'border-primary bg-blue-100 text-primary'
                : 'border-ink-200 hover:border-primary hover:bg-blue-100 text-ink-400 hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-lg">arrow_upward</span>
            <span className="font-label-mono text-label-mono">{entry.upvotes}</span>
          </button>
          {/* Flag */}
          <button
            onClick={() => onVote(entry._id, 'flag')}
            className="w-full flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg border border-ink-200 hover:border-error hover:bg-red-50 text-ink-400 hover:text-error transition-all"
            title="Flag as inappropriate"
          >
            <span className="material-symbols-outlined text-lg">flag</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Genie({ onSwitchToRaise }) {
  const [top5, setTop5] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingTop5, setLoadingTop5] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [votedIds, setVotedIds] = useState(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    api2.get('/cache/top5')
      .then((r) => setTop5(r.data))
      .catch(() => setError('Failed to load top questions.'))
      .finally(() => setLoadingTop5(false));
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const r = await api2.get(`/cache/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(r.data);
      } catch {
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleVote = async (cacheId, voteType) => {
    try {
      await api2.post(`/cache/${cacheId}/vote`, { target: 'question', voteType });
      setVotedIds((prev) => {
        const next = new Set(prev);
        const key = `${cacheId}_${voteType}`;
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
      // Refresh top5
      const r = await api2.get('/cache/top5');
      setTop5(r.data);
    } catch (err) {
      if (err?.response?.status === 401) setError('Please log in to vote.');
    }
  };

  const displayList = searchQuery.trim() ? searchResults : top5;
  const isSearching = !!searchQuery.trim();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="font-headline-md text-headline-md text-ink-900 mb-1">Genie</h2>
        <p className="font-body-sm text-body-sm text-ink-400">
          Browse the last 15 days of community questions. Search, upvote, or{' '}
          <button onClick={onSwitchToRaise} className="text-primary hover:underline">raise a new one</button>.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-lg">search</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search community questions…"
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-ink-200 rounded-xl font-body-md text-body-md text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
        />
        {loadingSearch && (
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 text-lg animate-spin">refresh</span>
        )}
      </div>

      {error && (
        <p className="font-body-sm text-body-sm text-error">{error}</p>
      )}

      {/* Section label */}
      <div>
        <h3 className="font-label-mono text-label-mono text-ink-400 uppercase mb-3 flex items-center gap-2">
          {isSearching ? (
            <><span className="material-symbols-outlined text-base">search</span> Search results ({displayList.length})</>
          ) : (
            <><span className="material-symbols-outlined text-base">trending_up</span> Top questions from the community</>
          )}
        </h3>

        {loadingTop5 && !isSearching ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-surface-container rounded-xl animate-pulse" />
            ))}
          </div>
        ) : displayList.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-ink-100 rounded-xl">
            <span className="material-symbols-outlined text-4xl text-ink-200 mb-2 block">
              {isSearching ? 'search_off' : 'forum'}
            </span>
            <p className="font-body-sm text-body-sm text-ink-400">
              {isSearching ? 'No questions match your search.' : 'No questions in the community yet.'}
            </p>
            {!isSearching && (
              <button onClick={onSwitchToRaise} className="mt-3 text-primary font-body-sm text-body-sm hover:underline">
                Be the first to ask →
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayList.map((entry) => (
              <QuestionCard
                key={entry._id}
                entry={entry}
                onVote={handleVote}
                votedIds={votedIds}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
