import { useState, useEffect } from 'react';
import api2 from '../../lib/axiosP2';

function TierBadge({ score }) {
  if (score >= 10) return <span className="font-label-mono text-label-mono text-conf-high bg-surface-container px-2 py-0.5 rounded-full">★★★ Expert</span>;
  if (score >= 3) return <span className="font-label-mono text-label-mono text-status-verifying bg-surface-container px-2 py-0.5 rounded-full">★★ Trusted</span>;
  return <span className="font-label-mono text-label-mono text-conf-unverified bg-surface-container px-2 py-0.5 rounded-full">★ New · answers need approval</span>;
}

function QuestionRow({ entry, user, onAnswered }) {
  const [expanded, setExpanded] = useState(false);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const q = entry.queryId;
  if (!q) return null;

  const isOwn = q.submittedBy?._id === user?._id || q.submittedBy === user?._id;

  const submit = async () => {
    setError('');
    if (!answer.trim()) { setError('Please write an answer.'); return; }
    if (answer.trim().length < 5) { setError('Answer too short.'); return; }
    setSubmitting(true);
    try {
      const res = await api2.post(`/answers/${q._id}`, { answer: answer.trim() });
      setSuccess(res.data.message);
      setAnswer('');
      if (res.data.posted) onAnswered(entry._id);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to submit. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface border border-ink-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-surface-container-low transition-colors"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {q.category?.name && (
              <span className="font-label-mono text-label-mono text-ink-400 uppercase">{q.category.name}</span>
            )}
            {q.tags?.slice(0, 2).map((t) => (
              <span key={t} className="font-label-mono text-label-mono text-ink-400 bg-surface-container px-2 py-0.5 rounded-full">#{t}</span>
            ))}
          </div>
          <p className="font-body-md text-body-md font-medium text-ink-900">{q.title}</p>
          <p className="font-label-mono text-label-mono text-ink-400 mt-1">{entry.upvotes} vote{entry.upvotes !== 1 ? 's' : ''}</p>
        </div>
        <span className={`material-symbols-outlined text-ink-400 text-lg shrink-0 mt-0.5 transition-transform ${expanded ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-ink-100">
          {isOwn ? (
            <p className="mt-3 font-body-sm text-body-sm text-ink-400 italic">This is your question.</p>
          ) : success ? (
            <div className="mt-3 px-3 py-2 bg-surface-container border border-conf-high/20 rounded-lg">
              <p className="font-body-sm text-body-sm text-conf-high">{success}</p>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write a clear, helpful answer…"
                rows={4}
                className="w-full px-3 py-2.5 bg-surface-bright border border-ink-200 rounded-xl font-body-sm text-body-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors resize-none"
              />
              {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
              <button
                onClick={submit}
                disabled={submitting}
                className="self-end bg-primary text-on-primary px-4 py-2 rounded-lg font-body-sm text-body-sm font-medium hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit Answer'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SolveQuery({ user }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api2.get('/cache/unanswered')
      .then((r) => setQuestions(r.data))
      .catch(() => setError('Failed to load questions.'))
      .finally(() => setLoading(false));
  }, []);

  const handleAnswered = (cacheId) => {
    setQuestions((prev) => prev.filter((q) => q._id !== cacheId));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="font-headline-md text-headline-md text-ink-900 mb-1">Solve a Query</h2>
        <p className="font-body-sm text-body-sm text-ink-400 mb-2">
          Help your fellow students. Earn trust points for correct answers.
        </p>
        {user && (
          <div className="flex items-center gap-2">
            <TierBadge score={user.confidenceScore} />
            <span className="font-label-mono text-label-mono text-ink-400">
              {user.confidenceScore} point{user.confidenceScore !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Trust system explainer */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-col gap-1">
        <p className="font-label-mono text-label-mono text-ink-400 uppercase mb-1">How trust works</p>
        <p className="font-body-sm text-body-sm text-ink-700">★ New (0–2 pts) — your answer is reviewed by admin before going live</p>
        <p className="font-body-sm text-body-sm text-ink-700">★★ Trusted (3–9 pts) — your answer posts immediately</p>
        <p className="font-body-sm text-body-sm text-ink-700">★★★ Expert (10+ pts) — trusted + badge</p>
        <p className="font-body-sm text-body-sm text-ink-400 mt-1">+1 point when admin approves your answer as correct</p>
      </div>

      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-surface-container rounded-xl animate-pulse" />)}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 bg-surface border border-ink-100 rounded-xl">
          <span className="material-symbols-outlined text-4xl text-ink-200 mb-2 block">done_all</span>
          <p className="font-body-sm text-body-sm text-ink-400">No unanswered questions right now. Check back later!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {questions.map((entry) => (
            <QuestionRow key={entry._id} entry={entry} user={user} onAnswered={handleAnswered} />
          ))}
        </div>
      )}
    </div>
  );
}
