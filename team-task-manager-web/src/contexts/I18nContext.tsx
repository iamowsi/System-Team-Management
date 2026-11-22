import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type Language = 'en' | 'fa';

const translations = {
  en: {
    appName: 'TaskFlow',
    appTagline: 'Team Task Management',
    loginTitle: 'Welcome back',
    loginSubtitle: 'Sign in to manage your team projects and tasks',
    registerTitle: 'Create an account',
    registerSubtitle: 'Get started with your team workspace in seconds',
    nameLabel: 'Full Name',
    namePlaceholder: 'Ali Rezaei',
    emailLabel: 'Email Address',
    emailPlaceholder: 'ali@test.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    signUp: 'Create Account',
    signingUp: 'Creating account...',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    logout: 'Sign Out',
    dashboardWelcome: 'Welcome',
    dashboardPlaceholder: 'Phase 1 Auth & i18n are connected! Ready for Phase 2 (Layout & Analytics Dashboard).',
    invalidCredentials: 'Invalid email or password.',
    registerFailed: 'Registration failed. Email might already be in use.',
    switchLang: 'فارسی',
  },
  fa: {
    appName: 'تسک‌فلو',
    appTagline: 'مدیریت پروژه‌ها و تسک‌های تیمی',
    loginTitle: 'خوش آمدید',
    loginSubtitle: 'برای مدیریت پروژه‌ها و تسک‌های تیمی وارد حساب خود شوید',
    registerTitle: 'ساخت حساب کاربری',
    registerSubtitle: 'فضای کاری تیمی خود را در چند ثانیه بسازید',
    nameLabel: 'نام و نام خانوادگی',
    namePlaceholder: 'علی رضایی',
    emailLabel: 'ایمیل',
    emailPlaceholder: 'ali@test.com',
    passwordLabel: 'رمز عبور',
    passwordPlaceholder: '••••••••',
    signIn: 'ورود به حساب',
    signingIn: 'در حال ورود...',
    signUp: 'ثبت‌نام',
    signingUp: 'در حال ثبت‌نام...',
    noAccount: 'حساب کاربری ندارید؟',
    hasAccount: 'قبلاً ثبت‌نام کرده‌اید؟',
    logout: 'خروج',
    dashboardWelcome: 'خوش آمدی',
    dashboardPlaceholder: 'فاز ۱ (احراز هویت و دوزبانه) با موفقیت وصل شد! آماده رفتن به فاز ۲ (داشبورد و منوی اصلی).',
    invalidCredentials: 'ایمیل یا رمز عبور اشتباه است.',
    registerFailed: 'ثبت‌نام ناموفق بود. ممکن است این ایمیل قبلاً ثبت شده باشد.',
    switchLang: 'English',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
  lang: Language;
  dir: 'ltr' | 'rtl';
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('lang');
    return saved === 'fa' ? 'fa' : 'en';
  });

  const dir = lang === 'fa' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem('lang', lang);
  }, [lang, dir]);

  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'fa' : 'en'));
  const t = (key: TranslationKey) => translations[lang][key];

  return (
    <I18nContext.Provider value={{ lang, dir, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}