import React, { useEffect, useState } from 'react';
import TicketDetails from '../components/TicketDetails';
import ticketService from '../services/ticketService';
import { useAuth } from '../context/AuthContext';
import { hasRole, USER_ROLES } from '../utils/authorization';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../utils/apiError';

const PAGE_SIZE = 10;

const statusMeta = {
  UNALLOCATED: { label: 'تخصیص‌نیافته', className: 'unallocated' },
  ASSIGNED: { label: 'تخصیص‌یافته', className: 'assigned' },
  IN_PROGRESS: { label: 'در حال بررسی', className: 'in-progress' },
  RESOLVED: { label: 'حل‌شده', className: 'resolved' },
  CLOSED: { label: 'بسته‌شده', className: 'closed' },
};

const priorityMeta = {
  HIGH: { label: 'زیاد', className: 'high', icon: 'fas fa-arrow-up' },
  MEDIUM: { label: 'متوسط', className: 'medium', icon: 'fas fa-minus' },
  LOW: { label: 'کم', className: 'low', icon: 'fas fa-arrow-down' },
};

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
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function normalizePage(response, requestedPage) {
  if (Array.isArray(response)) {
    return {
      content: response,
      totalElements: response.length,
      totalPages: response.length ? 1 : 0,
      number: 0,
      first: true,
      last: true,
    };
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

function TicketRow({ ticket, isSelected, onSelect, showTriage, showManagement, onDelete }) {
  const status = statusMeta[ticket.status] || { label: ticket.status || 'نامشخص', className: 'unknown' };
  const priority = priorityMeta[ticket.priority];

  return (
    <tr
      className={isSelected ? 'selected' : ''}
      onClick={() => onSelect(ticket.id)}
      tabIndex="0"
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(ticket.id);
        }
      }}
      aria-label={`نمایش جزئیات تیکت ${ticket.title || ticket.id}`}
    >
      <td className="task-id fa-num">#{ticket.id}</td>
      <td>
        <div className="task-title-cell">
          <span className="task-name">{ticket.title || 'بدون عنوان'}</span>
          {ticket.description && <span className="task-desc">{ticket.description}</span>}
        </div>
      </td>
      <td><span className={`ticket-status ${status.className}`}><span className="dot" />{status.label}</span></td>
      {showTriage && <td>
        {priority ? (
          <span className={`priority-badge ${priority.className}`}>
            <i className={priority.icon} aria-hidden="true" /> {priority.label}
          </span>
        ) : <span className="ticket-muted">—</span>}
      </td>}
      {showTriage && <td>{ticket.scope || ticket.serviceScope || <span className="ticket-muted">—</span>}</td>}
      {showManagement && <><td>{ticket.customerName || (ticket.customerId ? `مشتری ${ticket.customerId}` : '—')}</td>
      <td>{ticket.assignedToName || ticket.assignedMemberName || (ticket.assignedMemberId ? `عضو ${ticket.assignedMemberId}` : 'تخصیص نیافته')}</td>
      <td><button type="button" className="action-btn" aria-label="حذف تیکت" onClick={(event) => { event.stopPropagation(); onDelete(ticket); }}><i className="fas fa-trash" /></button></td></>}
      <td className="ticket-date fa-num">{formatDate(ticket.createdAt)}</td>
    </tr>
  );
}

export default function TicketPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const isCustomer = hasRole(auth, USER_ROLES.CUSTOMER);
  const isManager = hasRole(auth, USER_ROLES.TEAM_MANAGER);
  const showTriage = !isCustomer;
  const showManagement = isManager;
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [ticketPage, setTicketPage] = useState(() => normalizePage(null, 0));
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(0);
  }, [debouncedQuery, statusFilter]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTickets() {
      setIsLoading(true);
      setLoadError('');
      const filters = {};
      if (debouncedQuery) filters.title = debouncedQuery;
      if (statusFilter !== 'all') filters.status = statusFilter;

      try {
        const response = await ticketService.searchTickets(filters, {
          page,
          size: PAGE_SIZE,
          signal: controller.signal,
        });
        setTicketPage(normalizePage(response, page));
      } catch (error) {
        if (error?.code !== 'ERR_CANCELED') setLoadError(getLoadErrorMessage(error));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadTickets();
    return () => controller.abort();
  }, [debouncedQuery, statusFilter, page, reloadKey]);

  function clearFilters() {
    setQuery('');
    setDebouncedQuery('');
    setStatusFilter('all');
    setPage(0);
  }

  async function deleteTicket(ticket) {
    if (!window.confirm(`تیکت «${ticket.title || ticket.id}» حذف شود؟ این عملیات قابل بازگشت نیست.`)) return;
    try {
      await ticketService.delete(ticket.id);
      setSelectedTicketId(null);
      setReloadKey((value) => value + 1);
    } catch (error) {
      setLoadError(getLoadErrorMessage(error));
    }
  }

  const visibleStart = ticketPage.totalElements ? ticketPage.number * PAGE_SIZE + 1 : 0;
  const visibleEnd = Math.min((ticketPage.number + 1) * PAGE_SIZE, ticketPage.totalElements);

  return (
    <section className="ticket-page">
      <div className={`ticket-content${selectedTicketId ? ' has-details' : ''}`}>
      <div className="panel ticket-directory animate-in delay-1">
        <div className="panel-header ticket-directory-header">
          <div>
            <div className="panel-title">فهرست تیکت‌ها</div>
            <div className="team-results-count fa-num">
              {ticketPage.totalElements} تیکت پیدا شد
            </div>
          </div>
          <div className="panel-actions ticket-toolbar">
            {(isCustomer || isManager) && <button type="button" className="filter-btn active" onClick={() => navigate('/tickets/new')}><i className="fas fa-plus" /> ایجاد تیکت</button>}
            <label className="team-search">
              <i className="fas fa-search" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="جستجو در عنوان تیکت..."
                aria-label="جستجوی تیکت‌ها"
              />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="فیلتر وضعیت تیکت">
              <option value="all">همه وضعیت‌ها</option>
              {Object.entries(statusMeta).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
            </select>
            <button type="button" className="filter-btn" onClick={() => setReloadKey((value) => value + 1)} disabled={isLoading}>
              <i className={isLoading ? 'fas fa-spinner fa-spin' : 'fas fa-rotate'} aria-hidden="true" />
              به‌روزرسانی
            </button>
          </div>
        </div>

        {isLoading && !ticketPage.content.length ? (
          <div className="team-empty">
            <div className="stat-icon cyan"><i className="fas fa-spinner fa-spin" /></div>
            <strong>در حال دریافت تیکت‌ها...</strong>
          </div>
        ) : loadError ? (
          <div className="team-empty" role="alert">
            <div className="stat-icon red"><i className="fas fa-triangle-exclamation" /></div>
            <strong>امکان نمایش تیکت‌ها نیست</strong>
            <span>{loadError}</span>
            <button type="button" className="filter-btn" onClick={() => setReloadKey((value) => value + 1)}>تلاش دوباره</button>
          </div>
        ) : ticketPage.content.length ? (
          <>
            <div className={`ticket-table-wrap${isLoading ? ' loading' : ''}`}>
              <table className="task-table ticket-table">
                <thead><tr><th>شناسه</th><th>عنوان</th><th>وضعیت</th>{showTriage && <><th>اولویت</th><th>محدوده</th></>}{showManagement && <><th>مشتری</th><th>مسئول</th><th>عملیات</th></>}<th>تاریخ ایجاد</th></tr></thead>
                <tbody>{ticketPage.content.map((ticket) => (
                  <TicketRow
                    ticket={ticket}
                    key={ticket.id}
                    isSelected={selectedTicketId === ticket.id}
                    onSelect={setSelectedTicketId}
                    showTriage={showTriage}
                    showManagement={showManagement}
                    onDelete={deleteTicket}
                  />
                ))}</tbody>
              </table>
            </div>
            <div className="ticket-pagination">
              <span className="fa-num">نمایش {visibleStart} تا {visibleEnd} از {ticketPage.totalElements}</span>
              <div>
                <button type="button" className="filter-btn" disabled={ticketPage.first || isLoading} onClick={() => setPage((value) => Math.max(0, value - 1))}>
                  <i className="fas fa-chevron-right" /> قبلی
                </button>
                <span className="fa-num">صفحه {ticketPage.number + 1} از {Math.max(ticketPage.totalPages, 1)}</span>
                <button type="button" className="filter-btn" disabled={ticketPage.last || isLoading} onClick={() => setPage((value) => value + 1)}>
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
      {selectedTicketId && (
        <TicketDetails
          ticketId={selectedTicketId}
          ticketSummary={ticketPage.content.find((ticket) => ticket.id === selectedTicketId)}
          onClose={() => setSelectedTicketId(null)}
        />
      )}
      </div>
    </section>
  );
}
