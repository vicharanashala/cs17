import { Link } from 'react-router-dom';

export default function Sidebar({ active, isAdmin = false }) {
  return (
    <aside className="hidden md:flex flex-col h-full py-gutter gap-2 bg-surface-bright dark:bg-admin-bg font-body-md text-body-md font-label-mono text-label-mono w-sidebar-width h-screen sticky top-header-height border-r-[1.5px] border-ink-100 dark:border-admin-border flat no shadows">
      <div className="px-4 py-4 border-b border-ink-100 mb-2">
        <h2 className="font-label-mono text-label-mono text-ink-400 uppercase mb-1">Navigation</h2>
        <p className="font-body-sm text-body-sm text-ink-700 font-medium">Technical Hub</p>
      </div>
      <nav className="flex flex-col gap-1 px-2 flex-1">
        <Link to="/faq" className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all duration-200 ${active === 'faq' ? 'bg-ink-100 dark:bg-admin-surface text-primary dark:text-primary-fixed-dim font-bold border-l-2 border-primary-container hover:bg-ink-100 dark:hover:bg-admin-surface' : 'text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-admin-surface rounded-lg'}`}>
          <span className="material-symbols-outlined text-lg">quiz</span>
          <span className="font-body-sm text-body-sm">Public FAQ</span>
        </Link>
        <Link to="/forum" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active === 'forum' ? 'bg-ink-100 dark:bg-admin-surface text-primary dark:text-primary-fixed-dim font-bold border-l-2 border-primary-container' : 'text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-admin-surface'}`}>
          <span className="material-symbols-outlined text-lg">forum</span>
          <span className="font-body-sm text-body-sm">Discussion Forum</span>
        </Link>
        <Link to="/escalate" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active === 'escalate' ? 'bg-ink-100 dark:bg-admin-surface text-primary dark:text-primary-fixed-dim font-bold border-l-2 border-primary-container' : 'text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-admin-surface'}`}>
          <span className="material-symbols-outlined text-lg">emergency_home</span>
          <span className="font-body-sm text-body-sm">Escalations</span>
        </Link>
        {isAdmin && (
          <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active === 'admin' ? 'bg-ink-100 dark:bg-admin-surface text-primary dark:text-primary-fixed-dim font-bold border-l-2 border-primary-container' : 'text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-admin-surface'}`}>
            <span className="material-symbols-outlined text-lg">dashboard</span>
            <span className="font-body-sm text-body-sm">Admin Dashboard</span>
          </Link>
        )}
      </nav>
      <div className="px-4 mt-auto mb-4">
        <button className="w-full bg-primary text-on-primary py-2 px-4 rounded-lg font-body-sm text-body-sm font-medium hover:bg-blue-600 transition-colors active:scale-95">
          Submit Inquiry
        </button>
      </div>
      <div className="border-t border-ink-100 py-2 px-2 flex flex-col gap-1">
        <a href="#" className="flex items-center gap-3 text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-admin-surface px-4 py-2 rounded-lg transition-all duration-200">
          <span className="material-symbols-outlined text-lg">settings</span>
          <span className="font-body-sm text-body-sm">Settings</span>
        </a>
        <a href="#" className="flex items-center gap-3 text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-admin-surface px-4 py-2 rounded-lg transition-all duration-200">
          <span className="material-symbols-outlined text-lg">contact_support</span>
          <span className="font-body-sm text-body-sm">Support</span>
        </a>
      </div>
    </aside>
  );
}
