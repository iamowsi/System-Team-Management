import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Globe, LogOut } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useI18n } from './contexts/I18nContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// صفحه موقت برای تست موفقیت‌آمیز بودن لاگین در فاز ۱
function TempHome() {
  const { user, logout } = useAuth();
  const { t, toggleLang } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-lg w-full shadow-sm text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('dashboardWelcome')}, {user?.name || user?.email}
        </h1>
        <p className="text-sm text-slate-600">{t('dashboardPlaceholder')}</p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-indigo-600" />
            {t('switchLang')}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {t('logout')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <TempHome />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}