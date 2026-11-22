import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FolderKanban,
  ListTodo,
  RefreshCw,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../libs/api';
import { useI18n } from '../contexts/I18nContext';
import type { Project, Task } from '../types';

interface ProjectWithTasks extends Project {
  tasks: Task[];
}

const STATUS_COLORS = {
  TODO: '#94a3b8', // slate-400
  IN_PROGRESS: '#4f46e5', // indigo-600
  DONE: '#10b981', // emerald-500
};

export function DashboardPage() {
  const { t, dir } = useI18n();
  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: projectList } = await api.get<Project[]>('/projects');

      const projectsWithTasks = await Promise.all(
        projectList.map(async (project) => {
          try {
            const { data: tasks } = await api.get<Task[]>(
              `/projects/${project.id}/tasks`,
            );
            return { ...project, tasks };
          } catch {
            return { ...project, tasks: [] };
          }
        }),
      );

      setProjects(projectsWithTasks);
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const allTasks = projects.flatMap((p) => p.tasks);
  const todoCount = allTasks.filter((task) => task.status === 'TODO').length;
  const inProgressCount = allTasks.filter(
    (task) => task.status === 'IN_PROGRESS',
  ).length;
  const doneCount = allTasks.filter((task) => task.status === 'DONE').length;
  const completionRate =
    allTasks.length > 0 ? Math.round((doneCount / allTasks.length) * 100) : 0;

  const pieData = [
    { name: t('statusTodo'), value: todoCount, color: STATUS_COLORS.TODO },
    {
      name: t('statusInProgress'),
      value: inProgressCount,
      color: STATUS_COLORS.IN_PROGRESS,
    },
    { name: t('statusDone'), value: doneCount, color: STATUS_COLORS.DONE },
  ].filter((item) => item.value > 0);

  const barData = projects.slice(0, 6).map((project) => ({
    name:
      project.name.length > 14
        ? `${project.name.slice(0, 14)}…`
        : project.name,
    [t('statusTodo')]: project.tasks.filter((tk) => tk.status === 'TODO')
      .length,
    [t('statusInProgress')]: project.tasks.filter(
      (tk) => tk.status === 'IN_PROGRESS',
    ).length,
    [t('statusDone')]: project.tasks.filter((tk) => tk.status === 'DONE')
      .length,
  }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
        <p className="text-sm">{t('loadingDashboard')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 cursor-pointer"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* هدر صفحه */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('dashboardTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t('dashboardSubtitle')}
          </p>
        </div>

        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition self-start"
        >
          <span>{t('viewAllProjects')}</span>
          <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
        </Link>
      </div>

      {/* کارت‌های آمار (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {t('totalProjects')}
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {projects.length}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {t('totalTasks')}
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {allTasks.length}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <ListTodo className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {t('inProgressTasks')}
            </p>
            <p className="text-3xl font-bold text-indigo-600 mt-1">
              {inProgressCount}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {t('completedTasks')}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-bold text-emerald-600">{doneCount}</p>
              <span className="text-xs font-medium text-slate-500">
                ({completionRate}% {t('completionRate')})
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* بخش نمودارها */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* نمودار دایره‌ای وضعیت تسک‌ها */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            {t('tasksByStatus')}
          </h2>

          {pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-slate-400">
              {t('noTasksChart')}
            </div>
          ) : (
            <div className="h-64" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={4}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={32} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* نمودار میله‌ای تسک‌های هر پروژه */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            {t('tasksPerProject')}
          </h2>

          {barData.length === 0 || allTasks.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-slate-400">
              {t('noTasksChart')}
            </div>
          ) : (
            <div className="h-64" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={t('statusTodo')} stackId="a" fill={STATUS_COLORS.TODO} radius={[0, 0, 0, 0]} />
                  <Bar dataKey={t('statusInProgress')} stackId="a" fill={STATUS_COLORS.IN_PROGRESS} />
                  <Bar dataKey={t('statusDone')} stackId="a" fill={STATUS_COLORS.DONE} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* لیست سریع پروژه‌ها */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            {t('recentProjects')}
          </h2>
          <Link
            to="/projects"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            {t('viewAllProjects')}
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm font-medium text-slate-700">{t('noProjectsYet')}</p>
            <p className="text-xs text-slate-500 mt-1">{t('noProjectsDesc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const pDone = project.tasks.filter((tk) => tk.status === 'DONE').length;
              const pTotal = project.tasks.length;
              const progress = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;

              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="group block p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition truncate">
                      {project.name}
                    </h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                      {pTotal} {t('tasksCount')}
                    </span>
                  </div>

                  {project.description && (
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>{progress}%</span>
                      <span>
                        {pDone}/{pTotal}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}