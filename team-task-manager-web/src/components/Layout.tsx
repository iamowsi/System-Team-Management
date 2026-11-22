import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  FolderKanban,
  Globe,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';

export function Layout() {
  const { user, logout } = useAuth();
  const { t, toggleLang } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: t('navDashboard'), icon: LayoutDashboard, end: true },
    { to: '/projects', label: t('navProjects'), icon: FolderKanban, end: false },
  ];

  const initials = (user?.name || user?.email || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* لوگو */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <KanbanSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block leading-tight">
              {t('appName')}
            </span>
            <span className="text-[11px] text-slate-500">{t('appTagline')}</span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* لینک‌های منو */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* اطلاعات کاربر و خروج */}
      <div className="p-3 border-t border-slate-200 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user?.name || user?.email}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.systemRole === 'ADMIN' ? t('roleAdmin') : t('roleUser')}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar دسکتاپ */}
      <aside className="hidden lg:block w-64 bg-white border-e border-slate-200 shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Sidebar موبایل */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] bg-white h-full shadow-xl z-10">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* بدنه اصلی */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* نوار بالا (Topbar) */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:block" />

          <button
            onClick={toggleLang}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>{t('switchLang')}</span>
          </button>
        </header>

        {/* محتوای صفحات */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}