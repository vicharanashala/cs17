import QueryStatusTracker from './QueryStatusTracker';

export default function SimilarityPanel({ selfDuplicate, communityMatches, faqMatches, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 bg-surface-container rounded-lg border border-outline-variant">
        <span className="material-symbols-outlined text-sm text-ink-400 animate-spin">refresh</span>
        <span className="font-body-sm text-body-sm text-ink-400">Checking for similar questions…</span>
      </div>
    );
  }

  const hasAnything = selfDuplicate || communityMatches?.length > 0 || faqMatches?.length > 0;
  if (!hasAnything) return null;

  return (
    <div className="flex flex-col gap-3">

      {/* ── Self duplicate — hard block ────────────────────────────────── */}
      {selfDuplicate && (
        <div className="border border-error/30 bg-error-container rounded-xl p-4">
          <div className="flex items-start gap-2 mb-3">
            <span className="material-symbols-outlined text-error text-lg mt-0.5">block</span>
            <div>
              <p className="font-body-sm text-body-sm font-medium text-error">You already asked this</p>
              <p className="font-body-sm text-body-sm text-error/80">Track your existing question below.</p>
            </div>
          </div>
          <div className="bg-surface rounded-lg border border-ink-100 p-3 mb-3">
            <p className="font-body-sm text-body-sm font-medium text-ink-900 mb-1">{selfDuplicate.title}</p>
            <span className="font-label-mono text-label-mono text-ink-400 uppercase">{selfDuplicate.category?.name}</span>
          </div>
          <QueryStatusTracker status={selfDuplicate.status} rejectionReason={selfDuplicate.rejectionReason} />
          {selfDuplicate.answer && (
            <div className="mt-3 border-t border-error/20 pt-3">
              <p className="font-label-mono text-label-mono text-ink-400 uppercase mb-1">Answer</p>
              <p className="font-body-sm text-body-sm text-ink-700">{selfDuplicate.answer}</p>
            </div>
          )}
        </div>
      )}

      {/* ── FAQ matches ────────────────────────────────────────────────── */}
      {faqMatches?.length > 0 && (
        <div className="border border-primary/20 bg-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-lg">library_books</span>
            <p className="font-body-sm text-body-sm font-medium text-primary">Found in official FAQ</p>
          </div>
          <div className="flex flex-col gap-2">
            {faqMatches.map((faq) => (
              <div key={faq._id} className="bg-surface rounded-lg border border-ink-100 p-3">
                <p className="font-body-sm text-body-sm font-medium text-ink-900 mb-1">{faq.question}</p>
                <p className="font-body-sm text-body-sm text-ink-700 line-clamp-2">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Community matches — soft warning ───────────────────────────── */}
      {!selfDuplicate && communityMatches?.length > 0 && (
        <div className="border border-status-discuss/30 bg-surface-container-low rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-status-discuss text-lg">info</span>
            <p className="font-body-sm text-body-sm font-medium text-on-surface">
              Similar questions already exist — you can still submit or upvote instead
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {communityMatches.map((q) => (
              <div key={q._id} className="bg-surface rounded-lg border border-ink-100 p-3">
                <p className="font-body-sm text-body-sm font-medium text-ink-900 mb-1">{q.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-label-mono text-label-mono text-ink-400 uppercase">{q.category?.name}</span>
                  <span className="text-ink-200">·</span>
                  <span className="font-label-mono text-label-mono text-ink-400">{q.voteCount} vote{q.voteCount !== 1 ? 's' : ''}</span>
                  <span className="text-ink-200">·</span>
                  <span className={`font-label-mono text-label-mono uppercase ${q.status === 'answered' ? 'text-conf-high' : 'text-ink-400'}`}>
                    {q.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
