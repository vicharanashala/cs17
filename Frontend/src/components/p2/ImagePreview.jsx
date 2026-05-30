export default function ImagePreview({ urls, onRemove }) {
  return (
    <div className="flex gap-2 flex-wrap mt-2">
      {urls.map((url, i) => (
        <div key={i} className="relative group">
          <img
            src={url}
            alt=""
            className="w-20 h-20 object-cover rounded-lg border border-ink-700"
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}