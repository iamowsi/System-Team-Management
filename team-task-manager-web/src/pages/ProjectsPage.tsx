import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { api } from '../libs/api';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import type { Project, ProjectMember, ProjectRole } from '../types';

export function ProjectsPage() {
  const { user } = useAuth();
  const { t, dir } = useI18n();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // مودال ساخت پروژه
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState('');

  // مودال مدیریت اعضا
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<ProjectRole>('MEMBER');
  const [addingMember, setAddingMember] = useState(false);
  const [memberErr, setMemberErr] = useState('');
  const [memberSuccess, setMemberSuccess] = useState('');

  // مودال تایید حذف پروژه
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState('');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: list } = await api.get<Project[]>('/projects');

      // دریافت جزئیات کامل هر پروژه (شامل لیست اعضا برای اعمال دقیق RBAC در UI)
      const detailed = await Promise.all(
        list.map(async (project: Project) => {
          try {
            const { data: full } = await api.get<Project>(`/projects/${project.id}`);
            return full;
          } catch {
            return project;
          }
        }),
      );

      setProjects(detailed);
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // تشخیص نقش کاربر فعلی در یک پروژه
  const getUserProjectRole = (project: Project): ProjectRole | null => {
    if (user?.systemRole === 'ADMIN') return 'MANAGER';
    const membership = project.members?.find(
      (m: ProjectMember) => m.userId === user?.id || m.user?.id === user?.id,
    );
    return membership?.role ?? null;
  };

  const canManageProject = (project: Project): boolean => {
    return getUserProjectRole(project) === 'MANAGER';
  };

  // ساخت پروژه جدید
  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault();
    setCreateErr('');
    setCreating(true);
    try {
      await api.post('/projects', {
        name: newName.trim(),
        description: newDesc.trim() || undefined,
      });
      setNewName('');
      setNewDesc('');
      setCreateOpen(false);
      await loadProjects();
    } catch {
      setCreateErr(t('createError'));
    } finally {
      setCreating(false);
    }
  };

  // افزودن عضو جدید به پروژه
  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setMemberErr('');
    setMemberSuccess('');
    setAddingMember(true);
    try {
      await api.post(`/projects/${selectedProject.id}/members`, {
        email: memberEmail.trim(),
        role: memberRole,
      });
      setMemberEmail('');
      setMemberRole('MEMBER');
      setMemberSuccess(t('memberAddedSuccess'));

      // رفرش اطلاعات همین پروژه برای نمایش فوری عضو جدید
      const { data: updated } = await api.get<Project>(
        `/projects/${selectedProject.id}`,
      );
      setSelectedProject(updated);
      setProjects((prev) =>
        prev.map((p: Project) => (p.id === updated.id ? updated : p)),
      );
    } catch {
      setMemberErr(t('memberAddError'));
    } finally {
      setAddingMember(false);
    }
  };

  // حذف پروژه
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setDeleteErr('');
    setDeleting(true);
    try {
      await api.delete(`/projects/${projectToDelete.id}`);
      setProjects((prev) =>
        prev.filter((p: Project) => p.id !== projectToDelete.id),
      );
      setProjectToDelete(null);
    } catch {
      setDeleteErr(t('deleteError'));
    } finally {
      setDeleting(false);
    }
  };

  const openMembersModal = (project: Project) => {
    setMemberEmail('');
    setMemberRole('MEMBER');
    setMemberErr('');
    setMemberSuccess('');
    setSelectedProject(project);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
        <p className="text-sm">{t('loadingProjects')}</p>
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
          onClick={loadProjects}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('projectsTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t('projectsSubtitle')}
          </p>
        </div>

        <button
          onClick={() => {
            setCreateErr('');
            setCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('newProject')}</span>
        </button>
      </div>

      {/* لیست پروژه‌ها */}
      {projects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">
            {t('noProjectsYet')}
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {t('noProjectsDesc')}
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium mt-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('newProject')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project: Project) => {
            const role = getUserProjectRole(project);
            const isManager = canManageProject(project);
            const memberCount =
              project.members?.length ?? project._count?.members ?? 1;

            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:border-indigo-300 hover:shadow-xs transition"
              >
                <div>
                  {/* ردیف بالا: نقش کاربر و دکمه حذف (فقط برای مدیر) */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                        role === 'MANAGER'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      {role === 'MANAGER' ? t('roleManager') : t('roleMember')}
                    </span>

                    {isManager && (
                      <button
                        onClick={() => {
                          setDeleteErr('');
                          setProjectToDelete(project);
                        }}
                        title={t('deleteProjectTitle')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* نام و توضیحات پروژه */}
                  <h3 className="text-lg font-bold text-slate-900 truncate">
                    {project.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2 min-h-[40px]">
                    {project.description || t('noDescription')}
                  </p>
                </div>

                {/* دکمه‌های پایین کارت */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openMembersModal(project)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>
                      {memberCount} {t('membersCount')}
                    </span>
                  </button>

                  <Link
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition"
                  >
                    <span>{t('openBoard')}</span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 ${dir === 'rtl' ? 'rotate-180' : ''}`}
                    />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== مودال ساخت پروژه ==================== */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {t('createProjectTitle')}
              </h2>
              <button
                onClick={() => setCreateOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createErr && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createErr}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('projectNameLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('projectNamePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('projectDescLabel')}
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder={t('projectDescPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium cursor-pointer"
                >
                  {creating ? t('creating') : t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== مودال مدیریت اعضا ==================== */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {t('manageMembersTitle')}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedProject.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* لیست اعضای فعلی */}
            <div className="space-y-2 overflow-y-auto flex-1 pr-1 mb-5">
              {(selectedProject.members ?? []).map((member: ProjectMember) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {member.user?.name || member.userId}
                    </p>
                    {member.user?.email && (
                      <p className="text-xs text-slate-500 truncate" dir="ltr">
                        {member.user.email}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                      member.role === 'MANAGER'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {member.role === 'MANAGER'
                      ? t('roleManager')
                      : t('roleMember')}
                  </span>
                </div>
              ))}
            </div>

            {/* فرم افزودن عضو جدید (فقط برای مدیر پروژه) */}
            <div className="pt-4 border-t border-slate-200">
              {canManageProject(selectedProject) ? (
                <form onSubmit={handleAddMember} className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <UserPlus className="w-4 h-4 text-indigo-600" />
                    <span>{t('addMemberSection')}</span>
                  </div>

                  {memberErr && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{memberErr}</span>
                    </div>
                  )}

                  {memberSuccess && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{memberSuccess}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      required
                      dir="ltr"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      placeholder={t('memberEmailPlaceholder')}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <select
                      value={memberRole}
                      onChange={(e) =>
                        setMemberRole(e.target.value as ProjectRole)
                      }
                      className="px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="MEMBER">{t('roleMember')}</option>
                      <option value="MANAGER">{t('roleManager')}</option>
                    </select>

                    <button
                      type="submit"
                      disabled={addingMember}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium shrink-0 cursor-pointer"
                    >
                      {addingMember ? t('addingMember') : t('addMemberBtn')}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-slate-500 text-center">
                  {t('onlyManagersCanAdd')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== مودال تایید حذف پروژه ==================== */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900">
              {t('deleteProjectTitle')}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {t('deleteProjectConfirm')}
            </p>
            <p className="text-sm font-semibold text-slate-900 mt-2">
              "{projectToDelete.name}"
            </p>

            {deleteErr && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {deleteErr}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium cursor-pointer"
              >
                {deleting ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}