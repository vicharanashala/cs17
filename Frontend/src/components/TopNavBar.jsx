import { Link } from 'react-router-dom';

export default function TopNavBar({ active }) {
  return (
    <header className="bg-surface-bright dark:bg-admin-bg font-headline-md text-headline-md font-body-md text-body-md docked full-width top-0 h-header-height border-b-[1.5px] border-ink-100 dark:border-admin-border flat no shadows flex justify-between items-center w-full px-container-margin max-w-full mx-auto z-50 sticky">
      <div className="flex items-center gap-8">
        <div className="font-headline-md text-headline-md font-black tracking-tight text-ink-900 dark:text-ink-50 cursor-pointer hover:text-primary transition-colors">
          VINS · Yaksha
        </div>
        <nav className="hidden md:flex gap-6 items-center h-full">
          <Link to="/overview" className={`font-bold border-b-2 h-full flex items-center px-2 transition-colors hover:bg-ink-50 dark:hover:bg-admin-surface hover:text-primary ${active === 'overview' ? 'text-primary dark:text-primary-fixed-dim border-primary' : 'text-ink-400 dark:text-ink-400 border-transparent'}`}>Overview</Link>
          <Link to="/faq" className={`font-bold border-b-2 h-full flex items-center px-2 transition-colors hover:bg-ink-50 dark:hover:bg-admin-surface hover:text-primary ${active === 'faq' ? 'text-primary dark:text-primary-fixed-dim border-primary' : 'text-ink-400 dark:text-ink-400 border-transparent'}`}>FAQ</Link>
          <Link 
            to="/forum" 
            className={`font-bold border-b-2 h-full flex items-center px-2 transition-colors hover:bg-ink-50 dark:hover:bg-admin-surface hover:text-primary ${active === 'forum' ? 'text-primary dark:text-primary-fixed-dim border-primary' : 'text-ink-400 dark:text-ink-400 border-transparent'}`}
          >
            Genie
          </Link>
          <a href="#" className="text-ink-400 dark:text-ink-400 font-normal hover:bg-ink-50 dark:hover:bg-admin-surface hover:text-primary transition-colors h-full flex items-center px-2">samagama</a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-ink-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all active:scale-[0.98] transition-transform duration-150">
          <img src="https://picsum.photos/seed/user_profile/200/200" alt="User profile" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}
