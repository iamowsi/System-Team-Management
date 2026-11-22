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
    invalidCredentials: 'Invalid email or password.',
    registerFailed: 'Registration failed. Email might already be in use.',
    switchLang: 'فارسی',

    // Navigation & Layout
    navDashboard: 'Dashboard',
    navProjects: 'Projects',
    roleAdmin: 'Admin',
    roleUser: 'Member',

    // Dashboard & Analytics
    dashboardTitle: 'Workspace Overview',
    dashboardSubtitle: 'Real-time metrics across all your team projects',
    totalProjects: 'Total Projects',
    totalTasks: 'Total Tasks',
    inProgressTasks: 'In Progress',
    completedTasks: 'Completed',
    completionRate: 'completion rate',
    tasksByStatus: 'Tasks by Status',
    tasksPerProject: 'Tasks per Project',
    recentProjects: 'Your Projects',
    viewAllProjects: 'Manage Projects',
    noProjectsYet: 'No projects yet',
    noProjectsDesc: 'Create your first project to start tracking tasks and team progress.',
    noTasksChart: 'No tasks data available yet.',
    loadingDashboard: 'Loading workspace metrics...',
    fetchError: 'Failed to load data from server. Make sure the backend is running.',
    retry: 'Retry',
    tasksCount: 'tasks',

    // Status labels
    statusTodo: 'To Do',
    statusInProgress: 'In Progress',
    statusDone: 'Done',

    // Projects & Members (Phase 3)
    projectsTitle: 'Projects',
    projectsSubtitle: 'Create projects, manage team roles, and open task boards',
    newProject: 'New Project',
    createProjectTitle: 'Create New Project',
    projectNameLabel: 'Project Name',
    projectNamePlaceholder: 'e.g. Website Redesign',
    projectDescLabel: 'Description (optional)',
    projectDescPlaceholder: 'Short summary of the project goals...',
    create: 'Create',
    creating: 'Creating...',
    cancel: 'Cancel',
    openBoard: 'Open Board',
    teamMembers: 'Members',
    roleManager: 'Manager',
    roleMember: 'Member',
    manageMembersTitle: 'Project Members',
    addMemberSection: 'Add Team Member',
    memberEmailPlaceholder: 'sara@test.com',
    memberRoleLabel: 'Role',
    addMemberBtn: 'Add Member',
    addingMember: 'Adding...',
    memberAddedSuccess: 'Member added successfully.',
    memberAddError: 'Could not add member. Check that the user exists and is not already in the project.',
    deleteProjectTitle: 'Delete Project',
    deleteProjectConfirm: 'Are you sure you want to delete this project? All its tasks and attachments will be permanently removed.',
    delete: 'Delete',
    deleting: 'Deleting...',
    deleteError: 'Failed to delete project. Only project managers can perform this action.',
    createError: 'Failed to create project.',
    noDescription: 'No description provided.',
    onlyManagersCanAdd: 'Only project managers can add new members.',
    membersCount: 'members',
    loadingProjects: 'Loading projects...',

    // Kanban Board (Phase 4)
    backToProjects: 'Back to Projects',
    newTask: 'New Task',
    createTaskTitle: 'Create New Task',
    taskTitleLabel: 'Task Title',
    taskTitlePlaceholder: 'e.g. Design landing page hero',
    taskDescLabel: 'Description (optional)',
    taskDescPlaceholder: 'Add details, acceptance criteria, or notes...',
    assigneeLabel: 'Assignee (optional)',
    unassigned: 'Unassigned',
    assigneeEmailHint: 'Assigning a team member automatically queues an email notification (BullMQ).',
    createTaskError: 'Failed to create task.',
    updateStatusError: 'Failed to update task status.',
    deleteTaskError: 'Failed to delete task. Only project managers can delete tasks.',
    deleteTaskConfirm: 'Delete this task permanently?',
    emptyColumn: 'No tasks here. Drag a card or create a new one.',
    loadingBoard: 'Loading project board...',
    dragHint: 'Drag cards between columns or click a card to view details & attachments',

    // Task Details & S3 Attachments (Phase 5)
    taskDetailsTitle: 'Task Details',
    statusLabel: 'Status',
    descriptionTitle: 'Description',
    attachmentsTitle: 'Attachments (S3 Cloud Storage)',
    uploadFile: 'Upload File',
    uploading: 'Uploading...',
    maxFileSizeHint: 'Max file size: 5 MB (stored privately on S3)',
    fileTooLarge: 'File is too large. Maximum allowed size is 5 MB.',
    uploadSuccess: 'File uploaded to S3 successfully.',
    uploadError: 'Failed to upload file. Check S3 service and file size.',
    downloadError: 'Failed to generate Presigned download URL.',
    deleteAttachmentConfirm: 'Delete this attachment from S3 and database?',
    deleteAttachmentError: 'Failed to delete attachment. Only project managers can delete files.',
    noAttachmentsYet: 'No files attached to this task yet.',
    download: 'Download',
    deleteTaskBtn: 'Delete Task',
    close: 'Close',
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
    invalidCredentials: 'ایمیل یا رمز عبور اشتباه است.',
    registerFailed: 'ثبت‌نام ناموفق بود. ممکن است این ایمیل قبلاً ثبت شده باشد.',
    switchLang: 'English',

    // Navigation & Layout
    navDashboard: 'داشبورد',
    navProjects: 'پروژه‌ها',
    roleAdmin: 'ادمین سیستم',
    roleUser: 'کاربر',

    // Dashboard & Analytics
    dashboardTitle: 'نمای کلی فضای کاری',
    dashboardSubtitle: 'آمار لحظه‌ای تمام پروژه‌ها و تسک‌های تیم شما',
    totalProjects: 'کل پروژه‌ها',
    totalTasks: 'کل تسک‌ها',
    inProgressTasks: 'در حال انجام',
    completedTasks: 'تکمیل‌شده',
    completionRate: 'نرخ تکمیل',
    tasksByStatus: 'توزیع تسک‌ها بر اساس وضعیت',
    tasksPerProject: 'تعداد تسک در هر پروژه',
    recentProjects: 'پروژه‌های شما',
    viewAllProjects: 'مدیریت پروژه‌ها',
    noProjectsYet: 'هنوز پروژه‌ای وجود ندارد',
    noProjectsDesc: 'اولین پروژه خود را بسازید تا مدیریت تسک‌ها و پیشرفت تیم را شروع کنید.',
    noTasksChart: 'هنوز تسکی برای نمایش در نمودار ثبت نشده است.',
    loadingDashboard: 'در حال بارگذاری آمار فضای کاری...',
    fetchError: 'خطا در دریافت اطلاعات از سرور. مطمئن شوید بک‌اند روشن است.',
    retry: 'تلاش مجدد',
    tasksCount: 'تسک',

    // Status labels
    statusTodo: 'برای انجام',
    statusInProgress: 'در حال انجام',
    statusDone: 'انجام‌شده',

    // Projects & Members (Phase 3)
    projectsTitle: 'پروژه‌ها',
    projectsSubtitle: 'پروژه بسازید، نقش اعضای تیم را مدیریت کنید و وارد بُرد تسک‌ها شوید',
    newProject: 'پروژه جدید',
    createProjectTitle: 'ساخت پروژه جدید',
    projectNameLabel: 'نام پروژه',
    projectNamePlaceholder: 'مثلاً بازطراحی وب‌سایت',
    projectDescLabel: 'توضیحات (اختیاری)',
    projectDescPlaceholder: 'توضیح کوتاهی درباره هدف این پروژه...',
    create: 'ساخت پروژه',
    creating: 'در حال ساخت...',
    cancel: 'انصراف',
    openBoard: 'باز کردن بُرد',
    teamMembers: 'اعضا',
    roleManager: 'مدیر پروژه',
    roleMember: 'عضو تیم',
    manageMembersTitle: 'اعضای پروژه',
    addMemberSection: 'افزودن عضو جدید',
    memberEmailPlaceholder: 'sara@test.com',
    memberRoleLabel: 'نقش در پروژه',
    addMemberBtn: 'افزودن عضو',
    addingMember: 'در حال افزودن...',
    memberAddedSuccess: 'عضو جدید با موفقیت اضافه شد.',
    memberAddError: 'افزودن عضو ناموفق بود. مطمئن شوید کاربر ثبت‌نام کرده و قبلاً عضو این پروژه نباشد.',
    deleteProjectTitle: 'حذف پروژه',
    deleteProjectConfirm: 'آیا از حذف این پروژه مطمئن هستید؟ تمام تسک‌ها و فایل‌های پیوست آن برای همیشه پاک می‌شوند.',
    delete: 'حذف پروژه',
    deleting: 'در حال حذف...',
    deleteError: 'حذف پروژه ناموفق بود. فقط مدیر پروژه اجازه حذف دارد.',
    createError: 'ساخت پروژه ناموفق بود.',
    noDescription: 'توضیحی ثبت نشده است.',
    onlyManagersCanAdd: 'فقط مدیران پروژه اجازه افزودن عضو جدید دارند.',
    membersCount: 'عضو',
    loadingProjects: 'در حال بارگذاری پروژه‌ها...',

    // Kanban Board (Phase 4)
    backToProjects: 'بازگشت به پروژه‌ها',
    newTask: 'تسک جدید',
    createTaskTitle: 'ساخت تسک جدید',
    taskTitleLabel: 'عنوان تسک',
    taskTitlePlaceholder: 'مثلاً طراحی بخش هدر صفحه اصلی',
    taskDescLabel: 'توضیحات (اختیاری)',
    taskDescPlaceholder: 'جزئیات، معیارهای پذیرش یا یادداشت‌ها...',
    assigneeLabel: 'مسئول انجام (اختیاری)',
    unassigned: 'بدون مسئول',
    assigneeEmailHint: 'با انتخاب مسئول، ایمیل اطلاع‌رسانی به‌صورت خودکار در صف پس‌زمینه (BullMQ) ارسال می‌شود.',
    createTaskError: 'ساخت تسک ناموفق بود.',
    updateStatusError: 'تغییر وضعیت تسک ناموفق بود.',
    deleteTaskError: 'حذف تسک ناموفق بود. فقط مدیر پروژه اجازه حذف تسک دارد.',
    deleteTaskConfirm: 'آیا از حذف دائمی این تسک مطمئن هستید؟',
    emptyColumn: 'تسکی در این ستون نیست. کارتی بکشید یا تسک جدید بسازید.',
    loadingBoard: 'در حال بارگذاری بُرد پروژه...',
    dragHint: 'کارت‌ها را بین ستون‌ها بکشید یا برای مشاهده جزئیات و فایل‌های پیوست روی هر کارت کلیک کنید',

    // Task Details & S3 Attachments (Phase 5)
    taskDetailsTitle: 'جزئیات تسک',
    statusLabel: 'وضعیت',
    descriptionTitle: 'توضیحات',
    attachmentsTitle: 'فایل‌های پیوست (فضای ابری S3)',
    uploadFile: 'آپلود فایل',
    uploading: 'در حال آپلود...',
    maxFileSizeHint: 'حداکثر حجم مجاز: ۵ مگابایت (ذخیره امن در باکت خصوصی S3)',
    fileTooLarge: 'حجم فایل بیشتر از ۵ مگابایت است.',
    uploadSuccess: 'فایل با موفقیت روی S3 آپلود شد.',
    uploadError: 'آپلود فایل ناموفق بود. روشن بودن سرویس S3 و حجم فایل را بررسی کنید.',
    downloadError: 'دریافت لینک دانلود موقت (Presigned URL) ناموفق بود.',
    deleteAttachmentConfirm: 'آیا از حذف این فایل از S3 و دیتابیس مطمئن هستید؟',
    deleteAttachmentError: 'حذف فایل ناموفق بود. فقط مدیر پروژه اجازه حذف فایل پیوست دارد.',
    noAttachmentsYet: 'هنوز فایلی به این تسک پیوست نشده است.',
    download: 'دانلود',
    deleteTaskBtn: 'حذف تسک',
    close: 'بستن',
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