import { formatDistanceToNow } from 'date-fns';

export default function DraftBanner({ draft, onRestore, onDiscard }) {
  if (!draft) return null;
  const ago = formatDistanceToNow(new Date(draft.savedAt), { addSuffix: true });

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-surface-container border border-outline-variant rounded-xl mb-4">
      <div className="flex items-center gap-2 min-w-0">
        <span className="material-symbols-outlined text-ink-400 text-lg shrink-0">edit_note</span>
        <div className="min-w-0">
          <p className="font-body-sm text-body-sm font-medium text-ink-900 truncate">
            Draft saved {ago}
          </p>
          {draft.title && (
            <p className="font-body-sm text-body-sm text-ink-400 truncate">"{draft.title}"</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onDiscard}
          className="font-body-sm text-body-sm text-ink-400 hover:text-error transition-colors px-2 py-1 rounded"
        >
          Discard
        </button>
        <button
          onClick={onRestore}
          className="font-body-sm text-body-sm text-primary font-medium hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
        >
          Restore
        </button>
      </div>
    </div>
  );
}
