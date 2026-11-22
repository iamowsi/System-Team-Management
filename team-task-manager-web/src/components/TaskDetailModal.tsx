import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
  User as UserIcon,
  X,
} from 'lucide-react';
import { api } from '../libs/api';
import { useI18n } from '../contexts/I18nContext';
import type { Attachment, Task, TaskStatus } from '../types';

interface TaskDetailModalProps {
  projectId: string;
  task: Task;
  assigneeName: string | null;
  isManager: boolean;
  onClose: () => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onAttachmentAdded: (taskId: string, attachment: Attachment) => void;
  onAttachmentDeleted: (taskId: string, attachmentId: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`; return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function TaskDetailModal({
  projectId,
  task,
  assigneeName,
  isManager,
  onClose,
  onStatusChange,
  onDeleteTask,
  onAttachmentAdded,
  onAttachmentDeleted,
}: TaskDetailModalProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const attachments = task.attachments ?? [];

  // آپلود فایل روی S3
  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setSuccessMsg('');

    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(t('fileTooLarge'));
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const { data: uploaded } = await api.post<Attachment>(
        `/projects/${projectId}/tasks/${task.id}/attachments`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      onAttachmentAdded(task.id, uploaded);
      setSuccessMsg(t('uploadSuccess'));
    } catch {
      setErrorMsg(t('uploadError'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

// دریافت لینک دانلود موقت (Presigned URL) و باز کردن در تب جدید
  const handleDownload = async (attachmentId: string) => {
    setErrorMsg('');
    setDownloadingId(attachmentId);
    try {
      const { data } = await api.get<{ url?: string; downloadUrl?: string }>(
        `/projects/${projectId}/tasks/${task.id}/attachments/${attachmentId}/download`,
      );
      const presignedUrl = data.url || data.downloadUrl;
      if (!presignedUrl) throw new Error('Missing URL');
      window.open(presignedUrl, '_blank', 'noopener,noreferrer');
    } catch {
      setErrorMsg(t('downloadError'));
    } finally {
      setDownloadingId(null);
    }
  };

  // حذف فایل از S3 و دیتابیس (فقط مدیر پروژه)
  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!window.confirm(t('deleteAttachmentConfirm'))) return;
    setErrorMsg('');
    setSuccessMsg('');
    setDeletingId(attachmentId);
    try {
      await api.delete(
        `/projects/${projectId}/tasks/${task.id}/attachments/${attachmentId}`,
      );
      onAttachmentDeleted(task.id, attachmentId);
    } catch {
      setErrorMsg(t('deleteAttachmentError'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر مودال */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
              {t('taskDetailsTitle')}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5 break-words">
              {task.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* بدنه قابل اسکرول */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* وضعیت و مسئول */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                {t('statusLabel')}
              </label>
              <select
                value={task.status}
                onChange={(e) =>
                  onStatusChange(task.id, e.target.value as TaskStatus)
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="TODO">{t('statusTodo')}</option>
                <option value="IN_PROGRESS">{t('statusInProgress')}</option>
                <option value="DONE">{t('statusDone')}</option>
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center">
              <span className="text-xs font-medium text-slate-500 mb-1.5">
                {t('assigneeLabel')}
              </span>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <UserIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">
                  {assigneeName || t('unassigned')}
                </span>
              </div>
            </div>
          </div>

          {/* توضیحات */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              {t('descriptionTitle')}
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {task.description || (
                <span className="text-slate-400">{t('noDescription')}</span>
              )}
            </div>
          </div>

          {/* بخش فایل‌های پیوست S3 */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-800">
                  {t('attachmentsTitle')}
                </h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {attachments.length}
                </span>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-medium transition cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{uploading ? t('uploading') : t('uploadFile')}</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mb-3">
              {t('maxFileSizeHint')}
            </p>

            {errorMsg && (
              <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {attachments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400">
                {t('noAttachmentsYet')}
              </div>
            ) : (
              <div className="space-y-2">
                {attachments.map((att: Attachment) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-sm font-medium text-slate-800 truncate"
                          dir="ltr"
                        >
                          {att.fileName}
                        </p>
                        <p className="text-[11px] text-slate-500" dir="ltr">
                          {formatFileSize(att.size)} · {att.mimeType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={downloadingId === att.id}
                        onClick={() => handleDownload(att.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-xs font-medium text-slate-700 transition cursor-pointer disabled:opacity-60"
                      >
                        {downloadingId === att.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>{t('download')}</span>
                      </button>

                      {isManager && (
                        <button
                          type="button"
                          disabled={deletingId === att.id}
                          onClick={() => handleDeleteAttachment(att.id)}
                          title={t('delete')}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-60"
                        >
                          {deletingId === att.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* فوتر مودال */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          {isManager ? (
            <button
              type="button"
              onClick={() => {
                onDeleteTask(task.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-100/70 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('deleteTaskBtn')}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-sm font-medium text-slate-700 cursor-pointer"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}