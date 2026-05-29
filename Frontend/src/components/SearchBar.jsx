export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative max-w-2xl mx-auto">
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-2xl">search</span>
      <input
        id="faq-search"
        name="faq-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search for NOC, ViBe, guidelines..."
        className="w-full h-header-height bg-surface border-[1.5px] border-ink-200 rounded-lg pl-12 pr-4 text-body-lg font-body-lg focus:outline-none focus:border-primary focus:border-b-2 shadow-sm transition-all text-ink-900 placeholder:text-ink-400"
      />
    </div>
  );
}
