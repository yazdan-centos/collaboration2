import React, { useId } from 'react';

const STATUS_STYLES = {
  active: {
    label: 'فعال',
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
    dotClassName: 'bg-emerald-500',
  },
  warning: {
    label: 'در معرض نقض',
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-500',
    dotClassName: 'bg-amber-500',
  },
  breached: {
    label: 'نقض شده',
    className: 'border-red-500/20 bg-red-500/10 text-red-500',
    dotClassName: 'bg-red-500',
  },
  expired: {
    label: 'منقضی',
    className: 'border-slate-500/20 bg-slate-500/10 text-[var(--text-secondary)]',
    dotClassName: 'bg-[var(--text-muted)]',
  },
  neutral: {
    label: 'نامشخص',
    className: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-500',
    dotClassName: 'bg-cyan-500',
  },
};

const STATUS_ALIASES = {
  ACTIVE: 'active',
  ENABLED: 'active',
  HEALTHY: 'active',
  COMPLIANT: 'active',
  WARNING: 'warning',
  AT_RISK: 'warning',
  PENDING_BREACH: 'warning',
  BREACH: 'breached',
  BREACHED: 'breached',
  VIOLATED: 'breached',
  FAILED: 'breached',
  EXPIRED: 'expired',
  INACTIVE: 'expired',
  CANCELLED: 'expired',
  CANCELED: 'expired',
  EXPIRATION: 'expired',
};

const STATUS_LABELS = {
  ENABLED: 'فعال',
  HEALTHY: 'مطابق SLA',
  COMPLIANT: 'مطابق SLA',
  AT_RISK: 'در معرض نقض',
  PENDING_BREACH: 'در آستانه نقض',
  VIOLATED: 'نقض شده',
  FAILED: 'ناموفق',
  INACTIVE: 'غیرفعال',
  CANCELLED: 'لغو شده',
  CANCELED: 'لغو شده',
};

function firstValue(object, fields) {
  return fields
    .map((field) => object?.[field])
    .find((value) => value !== undefined && value !== null && value !== '');
}

function normalizeStatus(status, isActive) {
  const normalized = String(status || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  const tone = STATUS_ALIASES[normalized] || (isActive === true ? 'active' : isActive === false ? 'expired' : 'neutral');
  const fallbackLabel = STATUS_STYLES[tone].label;
  return {
    ...STATUS_STYLES[tone],
    label: STATUS_LABELS[normalized]
      || (STATUS_ALIASES[normalized] ? fallbackLabel : String(status || fallbackLabel).replace(/_/g, ' ')),
  };
}

function formatUptime(value) {
  if (value === undefined || value === null || value === '') return '—';
  return typeof value === 'number' || /^\d+(\.\d+)?$/.test(String(value).trim())
    ? `${value}٪`
    : String(value);
}

function formatDuration(value, unit = '') {
  if (value === undefined || value === null || value === '') return '—';
  return typeof value === 'number' || /^\d+(\.\d+)?$/.test(String(value).trim())
    ? `${value} ${unit || 'ساعت'}`
    : String(value);
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function Metric({ icon, label, value, ltr = false }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
        <i className={`${icon} w-3 text-center text-[var(--accent)]`} aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className="break-words text-[11.5px] font-semibold text-[var(--text-primary)]" dir={ltr ? 'ltr' : undefined}>
        {value}
      </div>
    </div>
  );
}

/**
 * Presentational SLA summary for a ticket detail container. Data loading belongs
 * to the parent container; `history` can be supplied separately or on `contract`.
 */
export default function SLAcontractDetails({
  contract,
  slaContractId,
  history,
  className = '',
}) {
  const headingId = useId();
  const contractId = slaContractId ?? firstValue(contract, ['id', 'slaContractId', 'contractId']);
  const contractIdLabel = contractId ?? '—';

  if (!contract && !contractId) {
    return (
      <section className={`rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-center ${className}`} aria-label="جزئیات SLA">
        <i className="fas fa-file-circle-xmark mb-2 text-base text-[var(--text-muted)]" aria-hidden="true" />
        <p className="text-xs font-semibold text-[var(--text-secondary)]">SLA به این تیکت متصل نیست</p>
        <p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)]">اهداف پاسخ‌گویی و رفع مشکل برای این تیکت تعریف نشده‌اند.</p>
      </section>
    );
  }

  const title = firstValue(contract, ['title', 'label', 'contractName', 'name', 'slaName']) || `قرارداد #${contractIdLabel}`;
  const rawStatus = firstValue(contract, ['status', 'slaStatus', 'currentStatus']);
  const isActive = firstValue(contract, ['isActive', 'active']);
  const status = normalizeStatus(rawStatus, isActive);
  const targetUptime = firstValue(contract, ['targetUptime', 'uptimeTarget', 'uptimePercentage', 'availabilityTarget']);
  const responseTime = firstValue(contract, ['responseTimeTarget', 'responseTimeHours', 'responseHours', 'targetResponseHours']);
  const resolutionTime = firstValue(contract, ['resolutionTimeTarget', 'resolutionTimeHours', 'resolutionHours', 'targetResolutionHours']);
  const supportCoverage = firstValue(contract, ['supportCoverage', 'supportHours', 'coverageHours', 'serviceHours']) || '—';
  const scope = firstValue(contract, ['serviceScope', 'scope', 'coverageDetails', 'serviceCoverage']);
  const notes = firstValue(contract, ['notes', 'description', 'scopeNotes']);
  const embeddedHistory = firstValue(contract, ['history', 'events', 'evaluations', 'breaches', 'slaEvents']);
  const events = Array.isArray(history) ? history : Array.isArray(embeddedHistory) ? embeddedHistory : [];

  return (
    <section className={`overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-card)] ${className}`} aria-labelledby={headingId}>
      <header className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-3.5 py-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
            <i className="fas fa-file-contract text-[var(--accent)]" aria-hidden="true" />
            <span>SLA تیکت</span>
            <span className="fa-num" dir="ltr">#{contractIdLabel}</span>
          </div>
          <h3 id={headingId} className="break-words text-xs font-semibold leading-5 text-[var(--text-primary)]">{title}</h3>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-medium ${status.className}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status.dotClassName}`} aria-hidden="true" />
          {status.label}
        </span>
      </header>

      <div className="p-3.5">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          <Metric icon="fas fa-hashtag" label="شناسه قرارداد" value={`#${contractIdLabel}`} ltr />
          <Metric icon="fas fa-signal" label="آپ‌تایم هدف" value={formatUptime(targetUptime)} />
          <Metric icon="fas fa-reply" label="هدف پاسخ‌گویی" value={formatDuration(responseTime)} />
          <Metric icon="fas fa-screwdriver-wrench" label="هدف رفع مشکل" value={formatDuration(resolutionTime)} />
          <Metric icon="fas fa-headset" label="ساعات پشتیبانی" value={supportCoverage} />
        </div>

        <div className="mt-3 border-t border-[var(--border)] pt-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--text-secondary)]">
            <i className="fas fa-layer-group text-[var(--accent)]" aria-hidden="true" />
            محدوده و پوشش خدمات
          </h4>
          {scope || notes ? (
            <div className="space-y-2 rounded-lg bg-[var(--bg-secondary)] px-3 py-2.5 text-[10.5px] leading-5 text-[var(--text-secondary)]">
              {scope && <p className="whitespace-pre-wrap"><span className="font-semibold text-[var(--text-primary)]">محدوده: </span>{scope}</p>}
              {notes && notes !== scope && <p className="whitespace-pre-wrap"><span className="font-semibold text-[var(--text-primary)]">یادداشت: </span>{notes}</p>}
            </div>
          ) : (
            <p className="rounded-lg bg-[var(--bg-secondary)] px-3 py-2.5 text-[10.5px] text-[var(--text-muted)]">جزئیات پوشش خدمات ثبت نشده است.</p>
          )}
        </div>

        {events.length > 0 && (
          <div className="mt-3 border-t border-[var(--border)] pt-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h4 className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                <i className="fas fa-clock-rotate-left text-[var(--accent)]" aria-hidden="true" />
                تاریخچه SLA
              </h4>
              <span className="fa-num rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[9px] text-[var(--text-muted)]">{events.length}</span>
            </div>
            <ol className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3">
              {events.map((event, index) => {
                const eventTitle = firstValue(event, ['title', 'label', 'eventType', 'type', 'status', 'result']) || 'رویداد SLA';
                const eventNote = firstValue(event, ['description', 'note', 'details', 'message']);
                const eventDate = firstValue(event, ['occurredAt', 'evaluatedAt', 'createdAt', 'timestamp', 'date']);
                const eventStatus = normalizeStatus(firstValue(event, ['status', 'result', 'type']));

                return (
                  <li key={event.id ?? `${eventDate || 'sla-event'}-${index}`} className="flex gap-2.5 py-2.5">
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${eventStatus.dotClassName}`} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                        <span className="text-[10.5px] font-medium text-[var(--text-primary)]">{eventTitle}</span>
                        {eventDate && <time className="fa-num text-[9px] text-[var(--text-muted)]" dateTime={eventDate}>{formatDate(eventDate)}</time>}
                      </div>
                      {eventNote && <p className="mt-1 whitespace-pre-wrap text-[10px] leading-5 text-[var(--text-secondary)]">{eventNote}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
