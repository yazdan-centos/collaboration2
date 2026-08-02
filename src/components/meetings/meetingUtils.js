export const meetingStatusMeta = Object.freeze({
  SCHEDULED: { label: 'برنامه‌ریزی‌شده', icon: 'fas fa-calendar-check', tone: 'scheduled' },
  IN_PROGRESS: { label: 'در حال برگزاری', icon: 'fas fa-circle-play', tone: 'in-progress' },
  COMPLETED: { label: 'تکمیل‌شده', icon: 'fas fa-circle-check', tone: 'completed' },
  CANCELLED: { label: 'لغوشده', icon: 'fas fa-ban', tone: 'cancelled' },
});

export const rsvpMeta = Object.freeze({
  PENDING: { label: 'در انتظار پاسخ', tone: 'pending' },
  ACCEPTED: { label: 'پذیرفته', tone: 'accepted' },
  DECLINED: { label: 'رد شده', tone: 'declined' },
  TENTATIVE: { label: 'احتمالی', tone: 'tentative' },
});

export const noteTypeMeta = Object.freeze({
  GENERAL: { label: 'یادداشت', icon: 'fas fa-note-sticky' },
  ACTION_ITEM: { label: 'اقدام', icon: 'fas fa-list-check' },
  DECISION: { label: 'تصمیم', icon: 'fas fa-gavel' },
});

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

export function formatTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(date);
}

export function formatDay(value) {
  if (!value) return { weekday: '—', day: '—', month: '—' };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { weekday: '', day: '', month: value };
  return {
    weekday: new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(date),
    day: new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(date),
    month: new Intl.DateTimeFormat('fa-IR', { month: 'short' }).format(date),
  };
}

export function toDateTimeInputValue(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

export function getInitials(name) {
  return String(name || 'کاربر')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
}

export function getDurationMinutes(startTime, endTime) {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, Math.round((end - start) / 60000));
}
