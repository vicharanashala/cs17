import { useState, useEffect } from 'react';
import api2 from '../../lib/axiosP2';

export default function EditQueryModal({ query, onClose, onSave }) {
  const [title, setTitle] = useState(query.title);
  const [category, setCategory] = useState(query.category?._id || '');
  const [tags, setTags] = useState((query.tags || []).join(', '));
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api2.get('/categories').then((r) => setCategories(r.data));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Question is required.'); return; }
    if (!category) { setError('Please select a category.'); return; }
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        category,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save. Try again.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h2 className="font-headline-md text-headline-md text-ink-900">Edit question</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-ink-500">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="flex flex-col gap-4 px-6 py-5 overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block font-label-mono text-label-mono text-ink-400 uppercase mb-1.5">
              Your question <span className="text-error">*</span>
            </label>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2.5 bg-surface border border-ink-200 rounded-xl font-body-md text-body-md text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors resize-none"
            />
            <p className="font-label-mono text-label-mono text-ink-400 mt-1">{title.length}/500</p>
          </div>

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
              Tags <span className="text-ink-400 normal-case">(comma-separated)</span>
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="noc, vibe-platform, deadline"
              className="w-full px-3 py-2.5 bg-surface border border-ink-200 rounded-xl font-body-md text-body-md text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <div className="px-3 py-2 bg-error-container border border-error/20 rounded-lg">
              <p className="font-body-sm text-body-sm text-error">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-body-sm text-body-sm font-medium border border-ink-200 text-ink-700 hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary text-on-primary py-2.5 rounded-xl font-body-sm text-body-sm font-medium hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}