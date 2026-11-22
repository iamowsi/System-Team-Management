import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, KanbanSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';

export function LoginPage() {
  const { login } = useAuth();
  const { t, toggleLang } = useI18n();
  const navigate = useNavigate();

  const [email, setEmail] = useState('ali@test.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError(t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      {/* دکمه تغییر زبان */}
      <button
        onClick={toggleLang}
        className="fixed top-5 end-5 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 shadow-xs transition cursor-pointer"
      >
        <Globe className="w-4 h-4 text-indigo-600" />
        {t('switchLang')}
      </button>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <KanbanSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{t('appName')}</h1>
            <p className="text-xs text-slate-500">{t('appTagline')}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900">{t('loginTitle')}</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">{t('loginSubtitle')}</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t('emailLabel')}
            </label>
            <input
              type="email"
              required
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t('passwordLabel')}
            </label>
            <input
              type="password"
              required
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('passwordPlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium text-sm rounded-lg transition cursor-pointer"
          >
            {loading ? t('signingIn') : t('signIn')}
          </button>
        </form>

        <p className="text-sm text-slate-600 text-center mt-6">
          {t('noAccount')}{' '}
          <Link to="/register" className="text-indigo-600 font-medium hover:underline">
            {t('signUp')}
          </Link>
        </p>
      </div>
    </div>
  );
}