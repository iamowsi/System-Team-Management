import { useCallback, useEffect, useState } from 'react';
import type { DragEvent, FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  GripVertical,
  Mail,
  Paperclip,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import { api } from '../libs/api';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { TaskDetailModal } from '../components/TaskDetailModal';
import type {
  Attachment,
  Project,
  ProjectMember,
  Task,
  TaskStatus,
} from '../types';

const COLUMNS: {
  status: TaskStatus;
  dotColor: string;
  badgeBg: string;
}[] = [
  { status: 'TODO', dotColor: 'bg-slate-400', badgeBg: 'bg-slate-200 text-slate-700' },
  { status: 'IN_PROGRESS', dotColor: 'bg-indigo-600', badgeBg: 'bg-indigo-100 text-indigo-700' },
  { status: 'DONE', dotColor: 'bg-emerald-500', badgeBg: 'bg-emerald-100 text-emerald-700' },
];

export function ProjectBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const { t, dir } = useI18n();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastError, setToastError] = useState('');

  // تسک انتخاب‌شده برای نمایش در مودال جزئیات و پیوست‌های S3
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // وضعیت Drag & Drop
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // مودال ساخت تسک جدید
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState('');

  const loadBoard = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError('');
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get<Project>(`/projects/${projectId}`),
        api.get<Task[]>(`/projects/${projectId}/tasks`),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  }, [projectId, t]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const isManager = (() => {
    if (user?.systemRole === 'ADMIN') return true;
    const membership = project?.members?.find(
      (m: ProjectMember) => m.userId === user?.id || m.user?.id === user?.id,
    );
    return membership?.role === 'MANAGER';
  })();

  const selectedTask =
    tasks.find((tk: Task) => tk.id === selectedTaskId) ?? null;

  const getStatusLabel = (status: TaskStatus) => {
    if (status === 'TODO') return t('statusTodo');
    if (status === 'IN_PROGRESS') return t('statusInProgress');
    return t('statusDone');
  };

  const getAssigneeName = (task: Task): string | null => {
    if (task.assignee?.name) return task.assignee.name;
    if (task.assignee?.email) return task.assignee.email;
    if (task.assigneeId && project?.members) {
      const member = project.members.find(
        (m: ProjectMember) =>
          m.userId === task.assigneeId || m.user?.id === task.assigneeId,
      );
      return member?.user?.name || member?.user?.email || null;
    }
    return null;
  };

  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    setCreateErr('');
    setCreating(true);
    try {
      const { data: created } = await api.post<Task>(
        `/projects/${projectId}/tasks`,
        {
          title: title.trim(),
          description: description.trim() || undefined,
          assigneeId: assigneeId || undefined,
        },
      );
      setTasks((prev) => [created, ...prev]);
      setTitle('');
      setDescription('');
      setAssigneeId('');
      setCreateOpen(false);
    } catch {
      setCreateErr(t('createTaskError'));
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (!projectId) return;
    const target = tasks.find((tk: Task) => tk.id === taskId);
    if (!target || target.status === newStatus) return;

    const previousTasks = tasks;
    setToastError('');
    setTasks((prev) =>
      prev.map((tk: Task) =>
        tk.id === taskId ? { ...tk, status: newStatus } : tk,
      ),
    );

    try {
      await api.patch(`/projects/${projectId}/tasks/${taskId}/status`, {
        status: newStatus,
      });
    } catch {
      setTasks(previousTasks);
      setToastError(t('updateStatusError'));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!projectId) return;
    if (!window.confirm(t('deleteTaskConfirm'))) return;

    const previousTasks = tasks;
    setToastError('');
    setTasks((prev) => prev.filter((tk: Task) => tk.id !== taskId));

    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`);
    } catch {
      setTasks(previousTasks);
      setToastError(t('deleteTaskError'));
    }
  };

  const handleAttachmentAdded = (taskId: string, attachment: Attachment) => {
    setTasks((prev) =>
      prev.map((tk: Task) =>
        tk.id === taskId
          ? { ...tk, attachments: [attachment, ...(tk.attachments ?? [])] }
          : tk,
      ),
    );
  };

  const handleAttachmentDeleted = (taskId: string, attachmentId: string) => {
    setTasks((prev) =>
      prev.map((tk: Task) =>
        tk.id === taskId
          ? {
              ...tk,
              attachments: (tk.attachments ?? []).filter(
                (a: Attachment) => a.id !== attachmentId,
              ),
            }
          : tk,
      ),
    );
  };

  const onDragStart = (e: DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);
    setDragOverColumn(null);
    if (taskId) {
      handleStatusChange(taskId, status);
    }
  };

  const onDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
        <p className="text-sm">{t('loadingBoard')}</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error || t('fetchError')}</p>
        </div>
        <button
          onClick={loadBoard}
          className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 cursor-pointer"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* هدر بُرد */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft
              className={`w-3.5 h-3.5 ${dir === 'rtl' ? 'rotate-180' : ''}`}
            />
            <span>{t('backToProjects')}</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                isManager
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Shield className="w-3 h-3" />
              {isManager ? t('roleManager') : t('roleMember')}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
              <Users className="w-3 h-3" />
              {project.members?.length ?? 1} {t('membersCount')}
            </span>
          </div>

          {project.description && (
            <p className="text-sm text-slate-500">{project.description}</p>
          )}
        </div>

        <button
          onClick={() => {
            setCreateErr('');
            setCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition self-start cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('newTask')}</span>
        </button>
      </div>

      {toastError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between gap-2 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{toastError}</span>
          </div>
          <button
            onClick={() => setToastError('')}
            className="p-1 hover:bg-red-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <p className="text-xs text-slate-400">{t('dragHint')}</p>

      {/* ستون‌های بُرد کانبان */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter(
            (tk: Task) => tk.status === col.status,
          );
          const isOver = dragOverColumn === col.status;

          return (
            <div
              key={col.status}
              onDragOver={(e) => onDragOver(e, col.status)}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => onDrop(e, col.status)}
              className={`rounded-2xl p-4 min-h-[420px] transition border-2 ${
                isOver
                  ? 'bg-indigo-50/70 border-indigo-400 border-dashed'
                  : 'bg-slate-100/80 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                  <h2 className="text-sm font-bold text-slate-800">
                    {getStatusLabel(col.status)}
                  </h2>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${col.badgeBg}`}
                >
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnTasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400">
                    {t('emptyColumn')}
                  </div>
                ) : (
                  columnTasks.map((task: Task) => {
                    const assigneeName = getAssigneeName(task);
                    const attachmentCount = task.attachments?.length ?? 0;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onClick={() => setSelectedTaskId(task.id)}
                        onDragStart={(e) => onDragStart(e, task.id)}
                        onDragEnd={onDragEnd}
                        className={`group bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition cursor-pointer ${
                          draggedTaskId === task.id ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-1.5 min-w-0">
                            <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-400 shrink-0 mt-0.5 cursor-grab" />
                            <h3 className="text-sm font-semibold text-slate-900 leading-snug break-words">
                              {task.title}
                            </h3>
                          </div>

                          {isManager && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                              title={t('delete')}
                              className="p-1 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition shrink-0 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2 ps-5">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 min-w-0">
                            {assigneeName ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg max-w-[150px] truncate">
                                <UserIcon className="w-3 h-3 text-indigo-600 shrink-0" />
                                <span className="truncate">{assigneeName}</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                {t('unassigned')}
                              </span>
                            )}

                            <span
                              className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md ${
                                attachmentCount > 0
                                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                                  : 'text-slate-400'
                              }`}
                            >
                              <Paperclip className="w-3 h-3" />
                              {attachmentCount}
                            </span>
                          </div>

                          <select
                            value={task.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(
                                task.id,
                                e.target.value as TaskStatus,
                              );
                            }}
                            className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value="TODO">{t('statusTodo')}</option>
                            <option value="IN_PROGRESS">
                              {t('statusInProgress')}
                            </option>
                            <option value="DONE">{t('statusDone')}</option>
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================== مودال ساخت تسک جدید ==================== */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {t('createTaskTitle')}
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

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('taskTitleLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('taskTitlePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('taskDescLabel')}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('taskDescPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('assigneeLabel')}
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">{t('unassigned')}</option>
                  {(project.members ?? []).map((m: ProjectMember) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user?.name || m.user?.email || m.userId} (
                      {m.role === 'MANAGER'
                        ? t('roleManager')
                        : t('roleMember')}
                      )
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{t('assigneeEmailHint')}</span>
                </p>
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

      {/* ==================== مودال جزئیات تسک و پیوست‌های S3 ==================== */}
      {selectedTask && projectId && (
        <TaskDetailModal
          projectId={projectId}
          task={selectedTask}
          assigneeName={getAssigneeName(selectedTask)}
          isManager={isManager}
          onClose={() => setSelectedTaskId(null)}
          onStatusChange={handleStatusChange}
          onDeleteTask={handleDeleteTask}
          onAttachmentAdded={handleAttachmentAdded}
          onAttachmentDeleted={handleAttachmentDeleted}
        />
      )}
    </div>
  );
}