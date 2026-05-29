export default function ChatbotWidget() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 group">
      {/* Tooltip */}
      <div className="bg-ink-900 text-white font-body-sm text-body-sm px-3 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none mb-2 relative">
        Ask Yaksha Mini
        <div className="absolute -bottom-1 right-6 w-2 h-2 bg-ink-900 transform rotate-45"></div>
      </div>
      <button className="w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary-fixed">
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
      </button>
    </div>
  );
}
