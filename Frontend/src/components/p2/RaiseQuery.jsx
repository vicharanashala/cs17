import { useState, useEffect, useRef } from 'react';
import api2 from '../../lib/axiosP2';
import SimilarityPanel from './SimilarityPanel';
import MyQueryCard from './MyQueryCard';
import DraftBanner from './DraftBanner';

export default function RaiseQuery({ user }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [categories, setCategories] = useState([]);
  const [draft, setDraft] = useState(null);
  const [myQueries, setMyQueries] = useState([]);
  const [similarity, setSimilarity] = useState({ loading: false, selfDuplicate: null, communityMatches: [], faqMatches: [] });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const draftTimerRef = useRef(null);

  // Load categories, draft, my queries
  useEffect(() => {
    api2.get('/categories').then((r) => setCategories(r.data));
    api2.get('/drafts/mine').then((r) => setDraft(r.data)).catch(() => {});
    api2.get('/queries/mine').then((r) => setMyQueries(r.data)).catch(() => {});
  }, []);

  // Auto-save draft every 30s
  useEffect(() => {
    draftTimerRef.current = setInterval(() => {
      if (!title && !category) return;
      api2.put('/drafts/mine', { title, category: category || null, tags: tags.split(',').map((t) => t.trim()).filter(Boolean), notifyEmail })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(draftTimerRef.current);
  }, [title, category, tags, notifyEmail]);

  // 2-second debounced draft save after typing stops
  useEffect(() => {
    const t = setTimeout(() => {
      if (!title && !category && !tags) return;
      api2.put('/drafts/mine', { title, category: category || null, tags: tags.split(',').map((t) => t.trim()).filter(Boolean), notifyEmail })
        .catch(() => {});
    }, 2000);
    return () => clearTimeout(t);
  }, [title, category, tags, notifyEmail]);

  // Real-time similarity scan (debounced 600ms)
  useEffect(() => {
    if (title.trim().length < 5) { setSimilarity({ loading: false, selfDuplicate: null, communityMatches: [], faqMatches: [] }); return; }
    setSimilarity((s) => ({ ...s, loading: true }));
    const t = setTimeout(async () => {
      try {
        const r = await api2.post('/similarity/scan', { title });
        setSimilarity({ loading: false, ...r.data });
      } catch {
        setSimilarity((s) => ({ ...s, loading: false }));
      }
    }, 600);
    return () => clearTimeout(t);
  }, [title]);

  const restoreDraft = () => {
    if (!draft) return;
    setTitle(draft.title || '');
    setCategory(draft.category?._id || draft.category || '');
    setTags((draft.tags || []).join(', '));
    setNotifyEmail(draft.notifyEmail ?? true);
    setDraft(null);
  };

  const discardDraft = async () => {
    await api2.delete('/drafts/mine').catch(() => {});
    setDraft(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    await api2.delete(`/queries/${id}`);
    setMyQueries((prev) => prev.filter((q) => q._id !== id));
  };

  const handleUpdated = (id, updated) => {
    setMyQueries((prev) => prev.map((q) => q._id === id ? { ...q, ...updated, category: updated.category } : q));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!title.trim()) { setError('Question is required.'); return; }
    if (!category) { setError('Please select a category.'); return; }
    if (similarity.selfDuplicate) { setError("You've already asked this question."); return; }

    setSubmitting(true);
    try {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      const res = await api2.post('/queries', { title: title.trim(), category, tags: tagList, notifyEmail });

      if (res.data.code === 'DUPLICATE_VOTED') {
        setSuccess('A similar question exists — your vote has been added and you\'ll be notified when it\'s answered.');
      } else {
        setSuccess('Question submitted! We\'ll notify you when it\'s answered.');
        setMyQueries((prev) => [res.data.query, ...prev]);
      }
      setTitle(''); setCategory(''); setTags(''); setSimilarity({ loading: false, selfDuplicate: null, communityMatches: [], faqMatches: [] });
      await api2.delete('/drafts/mine').catch(() => {});
    } catch (err) {
      if (err?.response?.data?.code === 'SELF_DUPLICATE') {
        setSimilarity((s) => ({ ...s, selfDuplicate: err.response.data.existingQuery }));
        setError("You've already asked this question.");
      } else {
        setError(err?.response?.data?.error || 'Failed to submit. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const hasSelfDuplicate = !!similarity.selfDuplicate;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-headline-md text-headline-md text-ink-900 mb-1">Raise a Query</h2>
        <p className="font-body-sm text-body-sm text-ink-400">
          Ask the admin team. Duplicate detection runs as you type.
        </p>
      </div>

      <DraftBanner draft={draft} onRestore={restoreDraft} onDiscard={discardDraft} />

      {/* Form */}
      <form onSubmit={submit} className="flex flex-col gap-4">
        {/* Title */}
        <div>
          <label className="block font-label-mono text-label-mono text-ink-400 uppercase mb-1.5">
            Your question <span className="text-error">*</span>
          </label>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How do I get a NOC for an off-campus internship?"
            maxLength={500}
            rows={3}
            className="w-full px-3 py-2.5 bg-surface border border-ink-200 rounded-xl font-body-md text-body-md text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors resize-none"
          />
          <div className="flex items-center justify-between mt-1">
            <p className="font-label-mono text-label-mono text-ink-400">{title.length}/500</p>
            {similarity.loading && (
              <p className="font-label-mono text-label-mono text-ink-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs animate-spin">refresh</span> Checking…
              </p>
            )}
          </div>
        </div>

        {/* Similarity panel */}
        <SimilarityPanel
          selfDuplicate={similarity.selfDuplicate}
          communityMatches={similarity.communityMatches}
          faqMatches={similarity.faqMatches}
          loading={false}
        />

        {/* Category */}
        <div>
          <label className="block font-label-mono text-label-mono text-ink-400 uppercase mb-1.5">
            Category <span className="text-error">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 bg-surface border border-ink-200 rounded-xl font-body-md text-body-md text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block font-label-mono text-label-mono text-ink-400 uppercase mb-1.5">
            Tags <span className="text-ink-400 normal-case">(optional, up to 5)</span>
          </label>
          <input
            value={tags}
            onChange={(e) => {
              const val = e.target.value;
              const count = val.split(',').filter((t) => t.trim()).length;
              if (count > 5) return; // block 6th tag
              setTags(val);
            }}
            placeholder="noc, vibe-platform, deadline"
            className="w-full px-3 py-2.5 bg-surface border border-ink-200 rounded-xl font-body-md text-body-md text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
          />
          <p className="font-label-mono text-label-mono text-ink-400 mt-1">
            {tags.split(',').filter((t) => t.trim()).length}/5 tags
          </p>
        </div>

        {/* Notify toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setNotifyEmail((v) => !v)}
            className={`relative w-10 h-6 rounded-full transition-colors ${notifyEmail ? 'bg-primary' : 'bg-ink-200'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifyEmail ? 'translate-x-5' : 'translate-x-1'}`} />
          </div>
          <span className="font-body-sm text-body-sm text-ink-700">
            Email me when this is answered
          </span>
        </label>

        {error && (
          <div className="px-3 py-2 bg-error-container border border-error/20 rounded-lg">
            <p className="font-body-sm text-body-sm text-error">{error}</p>
          </div>
        )}
        {success && (
          <div className="px-3 py-2 bg-surface-container border border-conf-high/20 rounded-lg">
            <p className="font-body-sm text-body-sm text-conf-high">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || hasSelfDuplicate}
          className="w-full bg-primary text-on-primary py-2.5 rounded-xl font-body-sm text-body-sm font-medium hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting…' : 'Submit Question'}
        </button>
      </form>

      {/* My questions */}
      {myQueries.length > 0 && (
        <div>
          <h3 className="font-label-mono text-label-mono text-ink-400 uppercase mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">history</span>
            My questions ({myQueries.length})
          </h3>
          <div className="flex flex-col gap-2">
            {myQueries.map((q) => (
              <MyQueryCard key={q._id} query={q} onDelete={handleDelete} onUpdated={handleUpdated} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
