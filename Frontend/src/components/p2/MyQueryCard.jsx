import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import QueryStatusTracker from './QueryStatusTracker';
import EditQueryModal from './EditQueryModal';
import api2 from '../../lib/axiosP2';

const EDIT_WINDOW_MS = 10 * 60 * 1000;

function formatCountdown(ms) {
  if (ms <= 0) return null;
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function MyQueryCard({ query, onDelete, onUpdated }) {
  const [expanded, setExpanded] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const createdAt = new Date(query.createdAt).getTime();

  // Live countdown: ticks every second while window is open
  useEffect(() => {
    const tick = () => {
      const remaining = EDIT_WINDOW_MS - (Date.now() - createdAt);
      setCountdown(remaining > 0 ? remaining : null);
    };
    tick(); // immediate first tick
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt]);

  const canEdit = countdown !== null;

  const handleSaveEdit = async (updated) => {
    await api2.patch(`/queries/${query._id}`, updated);
    setEditOpen(false);
    onUpdated?.(query._id, updated);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this question? This cannot be undone.')) return;
    await api2.delete(`/queries/${query._id}`);
    onDelete(query._id);
  };

  return (
    <>
      <div className="bg-surface border border-ink-100 rounded-xl overflow-hidden">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-surface-container-low transition-colors"
        >
          <div className="min-w-0 flex-1">
            <p className="font-body-sm text-body-sm font-medium text-ink-900 line-clamp-2">{query.title}</p>
            <p className="font-label-mono text-label-mono text-ink-400 uppercase mt-1">
              {query.category?.name} · {formatDistanceToNow(new Date(query.createdAt), { addSuffix: true })}
            </p>
          </div>
          <span className={`material-symbols-outlined text-ink-400 text-lg shrink-0 mt-0.5 transition-transform ${expanded ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        {expanded && (
          <div className="px-4 pb-4 border-t border-ink-100">
            <div className="mt-3">
              <QueryStatusTracker status={query.status} rejectionReason={query.rejectionReason} />
            </div>

            {query.answer && (
              <div className="mt-3 p-3 bg-surface-container rounded-lg border border-outline-variant">
                <p className="font-label-mono text-label-mono text-conf-high uppercase mb-1">Answer</p>
                <p className="font-body-sm text-body-sm text-ink-700">{query.answer}</p>
                {query.isTrustedAnswer && query.askerSatisfied === null && (
                  <div className="mt-3 flex items-center gap-2">
                    <p className="font-body-sm text-body-sm text-ink-400">Was this helpful?</p>
                    <button
                      onClick={async () => {
                        try { await api2.post(`/queries/${query._id}/not-satisfied`); }
                        catch { /* handled silently */ }
                      }}
                      className="font-body-sm text-body-sm text-error hover:underline"
                    >
                      Not satisfied — escalate to admin
                    </button>
                  </div>
                )}
              </div>
            )}

            {countdown !== null && (
              <p className="mt-2 font-label-mono text-label-mono text-status-discuss flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">edit</span>
                Editable for {formatCountdown(countdown)} remaining
              </p>
            )}

            <div className="mt-3 flex items-center gap-3">
              {canEdit && (
                <button
                  onClick={() => setEditOpen(true)}
                  className="font-body-sm text-body-sm text-primary hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Edit
                </button>
              )}
              <button
                onClick={handleDelete}
                className="font-body-sm text-body-sm text-error/70 hover:text-error transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {editOpen && (
        <EditQueryModal
          query={query}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
}