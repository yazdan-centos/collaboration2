import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getApiErrorMessage } from '../../utils/apiError';

export const FILE_UPLOAD_STYLES = {
  container: 'rounded-2xl border border-slate-700 bg-slate-900 p-5 text-slate-100 shadow-xl',
  section: 'mt-5 overflow-hidden rounded-xl border border-slate-700 bg-slate-950/40',
  sectionHeader: 'flex items-center justify-between border-b border-slate-700 px-4 py-3',
  dropzone: 'flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-600 bg-slate-950/40 p-6 text-center transition hover:border-emerald-500 hover:bg-emerald-500/5',
  dropzoneActive: 'border-emerald-400 bg-emerald-500/10',
  fileList: 'divide-y divide-slate-800',
  fileRow: 'flex flex-wrap items-center gap-3 px-4 py-3',
  fileIcon: 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-lg text-emerald-400',
  fileInfo: 'min-w-0 flex-1',
  fileName: 'block truncate text-sm font-semibold text-slate-100',
  fileMeta: 'mt-1 block text-xs text-slate-400',
  error: 'mt-1 block text-xs text-red-400',
  progressTrack: 'mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700',
  progressBar: 'h-full rounded-full bg-emerald-500 transition-all duration-200',
  button: 'inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50',
  secondaryButton: 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-200 transition hover:border-emerald-500 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-50',
  iconButton: 'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-50',
  dangerButton: 'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition hover:border-red-500 hover:text-red-400 disabled:opacity-50',
  emptyState: 'px-5 py-10 text-center text-sm text-slate-500',
  status: 'rounded-full bg-slate-800 px-2 py-1 text-[10px] font-semibold text-slate-300',
};

export const DEFAULT_ACCEPTED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv',
  'zip', 'rar', '7z', 'mp4', 'webm', 'mov', 'mp3', 'wav',
];

const statusLabels = {
  ready: 'آماده',
  uploading: 'در حال ارسال',
  success: 'موفق',
  error: 'خطا',
  'validation-error': 'نامعتبر',
};

function uniqueId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function extensionOf(name = '') {
  return name.includes('.') ? name.split('.').pop().toLowerCase() : '';
}

function formatSize(bytes) {
  if (!Number.isFinite(Number(bytes))) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

function normalizeUploadedFile(file) {
  return {
    id: file.id || file.serverId || uniqueId(),
    serverId: file.serverId || file.id,
    name: file.name || file.fileName || 'فایل بدون نام',
    size: file.size || 0,
    type: file.type || file.contentType || '',
    uploadedAt: file.uploadedAt || file.createdAt || new Date().toISOString(),
    uploadedUrl: file.uploadedUrl || file.url || file.filePath || '',
    ...file,
  };
}

function validateFile(file, acceptedExtensions, maxFileSize) {
  if (!acceptedExtensions.includes(extensionOf(file.name))) {
    return `فرمت .${extensionOf(file.name) || 'نامشخص'} پشتیبانی نمی‌شود.`;
  }
  if (file.size > maxFileSize) {
    return `حجم فایل از حداکثر ${formatSize(maxFileSize)} بیشتر است.`;
  }
  return '';
}

export function FileTypeIcon({ file, className = '' }) {
  const extension = extensionOf(file.name);
  let icon = 'fas fa-file';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) icon = 'fas fa-file-image';
  else if (extension === 'pdf') icon = 'fas fa-file-pdf';
  else if (['doc', 'docx'].includes(extension)) icon = 'fas fa-file-word';
  else if (['xls', 'xlsx', 'csv'].includes(extension)) icon = 'fas fa-file-excel';
  else if (['zip', 'rar', '7z'].includes(extension)) icon = 'fas fa-file-zipper';
  else if (['mp4', 'webm', 'mov'].includes(extension)) icon = 'fas fa-file-video';
  else if (['mp3', 'wav'].includes(extension)) icon = 'fas fa-file-audio';
  return <span className={className} aria-hidden="true"><i className={icon} /></span>;
}

export function FileRow({ item, uploaded = false, styles, onRemove, onDownload, onShare, onDelete, busyAction }) {
  return (
    <div className={styles.fileRow}>
      <FileTypeIcon file={item} className={styles.fileIcon} />
      <div className={styles.fileInfo}>
        <span className={styles.fileName} title={item.name}>{item.name}</span>
        <span className={styles.fileMeta}>
          {formatSize(item.size)}{uploaded ? ` · ${formatDate(item.uploadedAt)}` : ''}
        </span>
        {!uploaded && item.error && <span className={styles.error}>{item.error}</span>}
        {!uploaded && item.status === 'uploading' && (
          <div className={styles.progressTrack} role="progressbar" aria-valuenow={item.progress} aria-valuemin="0" aria-valuemax="100">
            <div className={styles.progressBar} style={{ width: `${item.progress}%` }} />
          </div>
        )}
      </div>
      {!uploaded && <span className={styles.status}>{statusLabels[item.status]}{item.status === 'uploading' ? ` ${item.progress}%` : ''}</span>}
      {!uploaded ? (
        <button type="button" className={styles.dangerButton} disabled={item.status === 'uploading'} onClick={() => onRemove(item.id)} aria-label={`حذف ${item.name}`}>
          <i className="fas fa-times" />
        </button>
      ) : (
        <div className="flex items-center gap-1">
          <button type="button" className={styles.iconButton} onClick={() => onDownload(item)} disabled={Boolean(busyAction)} aria-label={`دانلود ${item.name}`}><i className="fas fa-download" /></button>
          <button type="button" className={styles.iconButton} onClick={() => onShare(item)} disabled={Boolean(busyAction)} aria-label={`اشتراک ${item.name}`}><i className="fas fa-share-nodes" /></button>
          {onDelete && <button type="button" className={styles.dangerButton} onClick={() => onDelete(item)} disabled={Boolean(busyAction)} aria-label={`حذف ${item.name}`}><i className={busyAction === `delete:${item.id}` ? 'fas fa-spinner fa-spin' : 'fas fa-trash'} /></button>}
        </div>
      )}
    </div>
  );
}

export function PreflightFileList({ files, styles, onRemove, onUpload, isUploading }) {
  const readyCount = files.filter((item) => ['ready', 'error'].includes(item.status)).length;
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <div><strong className="text-sm">فایل‌های آماده ارسال</strong><span className="mr-2 text-xs text-slate-500">{files.length} فایل</span></div>
        <button type="button" className={styles.button} onClick={onUpload} disabled={!readyCount || isUploading}><i className="fas fa-cloud-arrow-up" /> شروع آپلود</button>
      </header>
      {files.length ? <div className={styles.fileList}>{files.map((item) => <FileRow key={item.id} item={item} styles={styles} onRemove={onRemove} />)}</div> : <div className={styles.emptyState}>هنوز فایلی انتخاب نشده است.</div>}
    </section>
  );
}

export function UploadedFilesList({ files, styles, onDownload, onShare, onDelete, busyAction, isLoading, error }) {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}><strong className="text-sm">فایل‌های آپلودشده</strong><span className="text-xs text-slate-500">{files.length} فایل</span></header>
      {isLoading ? <div className={styles.emptyState}><i className="fas fa-spinner fa-spin ml-2" />در حال دریافت فایل‌ها...</div>
        : error ? <div className={styles.emptyState}><span className={styles.error}>{error}</span></div>
          : files.length ? <div className={styles.fileList}>{files.map((item) => <FileRow key={item.id} item={item} uploaded styles={styles} onDownload={onDownload} onShare={onShare} onDelete={onDelete} busyAction={busyAction} />)}</div>
            : <div className={styles.emptyState}>فایل آپلودشده‌ای وجود ندارد.</div>}
    </section>
  );
}

export default function FileUploadManager({
  api,
  styles: styleOverrides = {},
  acceptedExtensions = DEFAULT_ACCEPTED_EXTENSIONS,
  maxFileSize = 25 * 1024 * 1024,
  maxFiles = 10,
  uploadConcurrency = 3,
  onUploaded,
} = {}) {
  const styles = useMemo(() => ({ ...FILE_UPLOAD_STYLES, ...styleOverrides }), [styleOverrides]);
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [busyAction, setBusyAction] = useState('');

  useEffect(() => {
    let active = true;
    async function loadFiles() {
      if (!api?.list) { setIsLoading(false); return; }
      try {
        const response = await api.list();
        if (active) setUploadedFiles((Array.isArray(response) ? response : response?.content || []).map(normalizeUploadedFile));
      } catch {
        if (active) setListError('دریافت فایل‌های آپلودشده انجام نشد.');
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadFiles();
    return () => { active = false; };
  }, [api]);

  function addFiles(selectedFiles) {
    const incoming = Array.from(selectedFiles);
    setFiles((current) => {
      const existingKeys = new Set(current.map((item) => `${item.name}:${item.size}:${item.file.lastModified}`));
      return [...current, ...incoming.map((file, index) => {
        const fileKey = `${file.name}:${file.size}:${file.lastModified}`;
        const duplicate = existingKeys.has(fileKey);
        existingKeys.add(fileKey);
        const countExceeded = current.length + index >= maxFiles;
        const error = duplicate ? 'این فایل قبلاً انتخاب شده است.'
          : countExceeded ? `حداکثر ${maxFiles} فایل قابل انتخاب است.`
            : validateFile(file, acceptedExtensions.map((item) => item.toLowerCase().replace(/^\./, '')), maxFileSize);
        return { id: uniqueId(), file, name: file.name, size: file.size, type: file.type, progress: 0, status: error ? 'validation-error' : 'ready', error, uploadedUrl: '' };
      })];
    });
  }

  async function uploadOne(item) {
    setFiles((current) => current.map((file) => file.id === item.id ? { ...file, status: 'uploading', progress: 0, error: '' } : file));
    try {
      const response = await api.upload(item.file, {
        onProgress: (progress) => setFiles((current) => current.map((file) => file.id === item.id ? { ...file, progress } : file)),
      });
      const uploaded = normalizeUploadedFile(response);
      setFiles((current) => current.map((file) => file.id === item.id ? { ...file, status: 'success', progress: 100, uploadedUrl: uploaded.uploadedUrl } : file));
      setUploadedFiles((current) => [uploaded, ...current.filter((file) => file.id !== uploaded.id)]);
      onUploaded?.(uploaded);
    } catch (error) {
      setFiles((current) => current.map((file) => file.id === item.id ? { ...file, status: 'error', error: getApiErrorMessage(error, 'آپلود فایل انجام نشد.') } : file));
    }
  }

  async function uploadAll() {
    if (!api?.upload) { setListError('تابع API آپلود تعریف نشده است.'); return; }
    const queue = files.filter((item) => ['ready', 'error'].includes(item.status));
    setIsUploading(true);
    const concurrency = Math.max(1, uploadConcurrency);
    for (let index = 0; index < queue.length; index += concurrency) {
      await Promise.all(queue.slice(index, index + concurrency).map(uploadOne));
    }
    setIsUploading(false);
  }

  async function resolveDownload(file) {
    setBusyAction(`download:${file.id}`);
    try {
      const url = await api?.download?.(file) || file.uploadedUrl;
      if (!url) throw new Error('آدرس دانلود موجود نیست.');
      const link = document.createElement('a');
      link.href = url; link.download = file.name; link.rel = 'noopener'; link.click();
    } catch (error) { setListError(error.message || 'دانلود فایل انجام نشد.'); }
    finally { setBusyAction(''); }
  }

  async function shareFile(file) {
    setBusyAction(`share:${file.id}`);
    try {
      const url = await api?.share?.(file) || file.uploadedUrl;
      if (!url) throw new Error('لینک اشتراک موجود نیست.');
      if (navigator.share) await navigator.share({ title: file.name, url });
      else await navigator.clipboard.writeText(url);
    } catch (error) { if (error.name !== 'AbortError') setListError(error.message || 'اشتراک فایل انجام نشد.'); }
    finally { setBusyAction(''); }
  }

  async function deleteFile(file) {
    if (!window.confirm(`فایل «${file.name}» حذف شود؟`)) return;
    setBusyAction(`delete:${file.id}`);
    try { await api?.delete?.(file); setUploadedFiles((current) => current.filter((item) => item.id !== file.id)); }
    catch (error) { setListError(getApiErrorMessage(error, 'حذف فایل انجام نشد.')); }
    finally { setBusyAction(''); }
  }

  return (
    <div className={styles.container}>
      <input ref={inputRef} className="hidden" type="file" multiple accept={acceptedExtensions.map((item) => `.${item.replace(/^\./, '')}`).join(',')} onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }} />
      <div className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`} role="button" tabIndex="0"
        onClick={() => inputRef.current?.click()} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click(); }}
        onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }} onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false); }}
        onDrop={(event) => { event.preventDefault(); setIsDragging(false); addFiles(event.dataTransfer.files); }}>
        <i className="fas fa-cloud-arrow-up mb-3 text-3xl text-emerald-400" />
        <strong className="text-sm">فایل‌ها را اینجا رها کنید</strong>
        <span className="mt-2 text-xs text-slate-400">یا برای انتخاب چند فایل کلیک کنید</span>
        <span className="mt-1 text-[10px] text-slate-500">حداکثر {maxFiles} فایل، هر فایل تا {formatSize(maxFileSize)}</span>
      </div>
      <PreflightFileList files={files} styles={styles} onRemove={(id) => setFiles((current) => current.filter((item) => item.id !== id))} onUpload={uploadAll} isUploading={isUploading} />
      <UploadedFilesList files={uploadedFiles} styles={styles} onDownload={resolveDownload} onShare={shareFile} onDelete={api?.delete ? deleteFile : undefined} busyAction={busyAction} isLoading={isLoading} error={listError} />
    </div>
  );
}
