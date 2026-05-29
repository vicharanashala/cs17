export default function FilterTabs({ activeTab = 'All Questions' }) {
  return (
    <div className="flex border-b border-ink-200 mb-8 overflow-x-auto hide-scrollbar">
      <button className={`px-4 py-3 font-body-md text-body-md whitespace-nowrap transition-colors ${activeTab === 'All Questions' ? 'font-bold text-primary border-b-2 border-primary' : 'text-ink-700 hover:text-ink-900 border-b-2 border-transparent'}`}>
        All Questions
      </button>
      <button className={`px-4 py-3 font-body-md text-body-md whitespace-nowrap transition-colors ${activeTab === 'Recently Resolved' ? 'font-bold text-primary border-b-2 border-primary' : 'text-ink-700 hover:text-ink-900 border-b-2 border-transparent'}`}>
        Recently Resolved
      </button>
      <button className={`px-4 py-3 font-body-md text-body-md whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'Escalation-sourced' ? 'font-bold text-primary border-b-2 border-primary' : 'text-ink-700 hover:text-ink-900 border-b-2 border-transparent'}`}>
        Escalation-sourced <span className="bg-status-escalated text-white text-[10px] px-1.5 py-0.5 rounded-sm font-label-mono leading-none">NEW</span>
      </button>
    </div>
  );
}
