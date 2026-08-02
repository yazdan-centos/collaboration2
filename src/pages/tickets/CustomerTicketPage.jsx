import { useLocation } from 'react-router-dom';
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import ticketService from '../../services/ticketService';
import TicketModal from '../../components/ticket/TicketModal';
import { getApiErrorMessage } from '../../utils/apiError';
import { hasPermission } from '../../utils/authorization';

const PAGE_SIZE = 10;

const statusMeta = {
  UNALLOCATED: { label: 'تخصیص‌نیافته', className: 'unallocated' },
  ASSIGNED: { label: 'تخصیص‌یافته', className: 'assigned' },
  IN_PROGRESS: { label: 'در حال بررسی', className: 'in-progress' },
  RESOLVED: { label: 'حل‌شده', className: 'resolved' },
  CLOSED: { label: 'بسته‌شده', className: 'closed' },
};

function getStatusMeta(status) {
  const normalizedStatus = String(status || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  return statusMeta[normalizedStatus] || {
    label: status ? String(status).replace(/_/g, ' ') : 'نامشخص',
    className: 'unknown',
  };
}

function getLoadErrorMessage(error) {
  return getApiErrorMessage(error, 'دریافت اطلاعات تیکت‌ها با خطا مواجه شد.', {
    400: 'فیلترهای جستجو معتبر نیستند.',
    403: 'حساب شما اجازه مشاهده فهرست تیکت‌ها را ندارد.',
  });
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

function normalizePage(response, requestedPage) {
  if (Array.isArray(response)) {
    return { content: response, totalElements: response.length, totalPages: response.length ? 1 : 0, number: 0, first: true, last: true };
  }
  return {
    content: Array.isArray(response?.content) ? response.content : [],
    totalElements: response?.totalElements ?? 0,
    totalPages: response?.totalPages ?? 0,
    number: response?.number ?? requestedPage,
    first: response?.first ?? requestedPage === 0,
    last: response?.last ?? true,
  };
}

export default function CustomerTicketPage() {
  const { auth } = useAuth();
  const canCreate = hasPermission(auth, 'TICKET_CREATE');
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [ticketPage, setTicketPage] = useState({ content: [], totalElements: 0, totalPages: 0, number: 0, first: true, last: true });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [modalMode, setModalMode] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicketSummary, setSelectedTicketSummary] = useState(null);

  const loadTickets = useCallback(async (signal) => {
    setIsLoading(true);
    setLoadError('');
    const filters = {};
    if (debouncedQuery) filters.title = debouncedQuery;
    if (statusFilter !== 'all') filters.status = statusFilter;
    try {
      const response = await ticketService.searchTickets(filters, { page, size: PAGE_SIZE, signal });
      setTicketPage(normalizePage(response, page));
    } catch (error) {
      if (error?.code !== 'ERR_CANCELED') setLoadError(getLoadErrorMessage(error));
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [debouncedQuery, statusFilter, page, reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => setDebouncedQuery(query), 250);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    loadTickets(controller.signal);
    return () => controller.abort();
  }, [loadTickets]);

  function clearFilters() {
    setQuery('');
    setDebouncedQuery('');
    setStatusFilter('all');
    setPage(0);
  }


  useEffect(() => {
    if (location.pathname === '/tickets/new') openCreateModal();
  }, [location.pathname]);

  function openCreateModal() {
    setSelectedTicketId(null);
    setSelectedTicketSummary(null);
    setModalMode('create');
  }

  function openViewModal(ticket) {
    setSelectedTicketId(ticket.id);
    setSelectedTicketSummary(ticket);
    setModalMode('view');
  }

  function handleTicketCreated() {
    setModalMode(null);
    setReloadKey((k) => k + 1);
  }

  function handleTicketUpdated() {
    setReloadKey((k) => k + 1);
  }

  const total = ticketPage.totalElements;
  const openCount = ticketPage.content.filter((t) => !['RESOLVED', 'CLOSED'].includes(t.status)).length;
  const resolvedCount = ticketPage.content.filter((t) => t.status === 'RESOLVED').length;
  const closedCount = ticketPage.content.filter((t) => t.status === 'CLOSED').length;
  const visibleStart = total ? ticketPage.number * PAGE_SIZE + 1 : 0;
  const visibleEnd = Math.min((ticketPage.number + 1) * PAGE_SIZE, total);

  return (
    <section className="customer-ticket-page">
      <div className="customer-ticket-stats">
        <div className="stat-card cyan animate-in delay-1">
          <div className="stat-header"><div className="stat-icon cyan"><i className="fas fa-ticket" /></div></div>
          <div className="stat-value fa-num">{total}</div>
          <div className="stat-label">کل تیکت‌ها</div>
        </div>
        <div className="stat-card amber animate-in delay-2">
          <div className="stat-header"><div className="stat-icon amber"><i className="fas fa-clock" /></div></div>
          <div className="stat-value fa-num">{openCount}</div>
          <div className="stat-label">در جریان</div>
        </div>
        <div className="stat-card green animate-in delay-3">
          <div className="stat-header"><div className="stat-icon green"><i className="fas fa-check" /></div></div>
          <div className="stat-value fa-num">{resolvedCount}</div>
          <div className="stat-label">حل‌شده</div>
        </div>
        <div className="stat-card red animate-in delay-4">
          <div className="stat-header"><div className="stat-icon red"><i className="fas fa-ban" /></div></div>
          <div className="stat-value fa-num">{closedCount}</div>
          <div className="stat-label">بسته‌شده</div>
        </div>
      </div>

      <div className="panel ticket-directory animate-in delay-1">
        <div className="panel-header ticket-directory-header">
          <div>
            <div className="panel-title">تیکت‌های من</div>
            <div className="team-results-count fa-num">{total} تیکت پیدا شد</div>
          </div>
          <div className="panel-actions ticket-toolbar">
            {canCreate && <button type="button" className="primary-action-btn" onClick={openCreateModal}><i className="fas fa-plus" /> تیکت جدید</button>}
            <label className="team-search">
              <i className="fas fa-search" aria-hidden="true" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجو در عنوان تیکت..." aria-label="جستجوی تیکت‌ها" />
            </label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="فیلتر وضعیت تیکت">
              <option value="all">همه وضعیت‌ها</option>
              {Object.entries(statusMeta).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
            </select>
            <button type="button" className="filter-btn" onClick={() => setReloadKey((k) => k + 1)} disabled={isLoading}>
              <i className={isLoading ? 'fas fa-spinner fa-spin' : 'fas fa-rotate'} /> به‌روزرسانی
            </button>
          </div>
        </div>

        {isLoading && !ticketPage.content.length ? (
          <div className="team-empty"><div className="stat-icon cyan"><i className="fas fa-spinner fa-spin" /></div><strong>در حال دریافت تیکت‌ها...</strong></div>
        ) : loadError ? (
          <div className="team-empty" role="alert">
            <div className="stat-icon red"><i className="fas fa-triangle-exclamation" /></div>
            <strong>امکان نمایش تیکت‌ها نیست</strong>
            <span>{loadError}</span>
            <button type="button" className="filter-btn" onClick={() => setReloadKey((k) => k + 1)}>تلاش دوباره</button>
          </div>
        ) : ticketPage.content.length ? (
          <>
            <div className={`ticket-table-wrap${isLoading ? ' loading' : ''}`}>
              <table className="task-table ticket-table">
                <thead><tr><th>شناسه</th><th>عنوان</th><th>وضعیت</th><th>تاریخ ایجاد</th><th>عملیات</th></tr></thead>
                <tbody>
                  {ticketPage.content.map((ticket) => {
                    const status = getStatusMeta(ticket.status);
                    return (
                      <tr key={ticket.id} className={selectedTicketId === ticket.id ? 'selected' : ''} onClick={() => openViewModal(ticket)}>
                        <td className="task-id fa-num">#{ticket.id}</td>
                        <td>
                          <div className="task-title-cell">
                            <span className="task-name">{ticket.title || 'بدون عنوان'}</span>
                            {ticket.description && <span className="task-desc">{ticket.description}</span>}
                          </div>
                        </td>
                        <td><span className={`ticket-status ${status.className}`}><span className="dot" />{status.label}</span></td>
                        <td className="ticket-date fa-num">{formatDate(ticket.createdAt)}</td>
                        <td>
                          <button type="button" className="filter-btn" onClick={(e) => { e.stopPropagation(); openViewModal(ticket); }}>
                            <i className="fas fa-eye" /> مشاهده
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="ticket-pagination">
              <span className="fa-num">نمایش {visibleStart} تا {visibleEnd} از {total}</span>
              <div>
                <button type="button" className="filter-btn" disabled={ticketPage.first || isLoading} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                  <i className="fas fa-chevron-right" /> قبلی
                </button>
                <span className="fa-num">صفحه {ticketPage.number + 1} از {Math.max(ticketPage.totalPages, 1)}</span>
                <button type="button" className="filter-btn" disabled={ticketPage.last || isLoading} onClick={() => setPage((p) => p + 1)}>
                  بعدی <i className="fas fa-chevron-left" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="team-empty">
            <div className="stat-icon cyan"><i className="fas fa-ticket" /></div>
            <strong>تیکتی پیدا نشد</strong>
            <span>عبارت جستجو یا فیلتر وضعیت را تغییر دهید.</span>
            {(debouncedQuery || statusFilter !== 'all') && <button type="button" className="filter-btn" onClick={clearFilters}>پاک کردن فیلترها</button>}
          </div>
        )}
      </div>

      {modalMode && (
        <TicketModal
          mode={modalMode}
          ticketId={selectedTicketId}
          ticketSummary={selectedTicketSummary}
          onClose={() => setModalMode(null)}
          onSuccess={modalMode === 'create' ? handleTicketCreated : handleTicketUpdated}
        />
      )}
    </section>
  );
}
