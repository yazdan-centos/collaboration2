import React, { useEffect, useMemo, useState } from 'react';
import slaContractService from '../services/slaContractService';

function normalizeContracts(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function isContractActive(contract) {
  if (typeof contract.isActive === 'boolean') return contract.isActive;
  if (typeof contract.active === 'boolean') return contract.active;
  return !['INACTIVE', 'EXPIRED', 'CANCELLED'].includes(contract.status);
}

function contractName(contract) {
  return contract.contractName || contract.name || contract.title || `قرارداد ${contract.id}`;
}

function customerName(contract) {
  const customer = contract.customer || {};
  return customer.companyName || customer.name || customer.fullName || customer.username
    || contract.customerName || (contract.customerId ? `مشتری ${contract.customerId}` : 'نامشخص');
}

function responseHours(contract) {
  return contract.responseTimeHours ?? contract.responseHours ?? contract.targetResponseHours;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(date);
}

function loadErrorMessage(error) {
  const status = error?.response?.status ?? error?.status;
  if (status === 401) return 'برای مشاهده قراردادها باید وارد حساب کاربری شوید.';
  if (status === 403) return 'حساب شما اجازه مشاهده قراردادهای SLA را ندارد.';
  return 'دریافت قراردادهای SLA با خطا مواجه شد.';
}

export default function SlaContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  async function loadContracts(signal) {
    setIsLoading(true);
    setLoadError('');
    try {
      const response = await slaContractService.getAll({ signal });
      setContracts(normalizeContracts(response));
    } catch (error) {
      if (error?.code !== 'ERR_CANCELED') setLoadError(loadErrorMessage(error));
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    loadContracts(controller.signal);
    return () => controller.abort();
  }, []);

  const filteredContracts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return contracts.filter((contract) => {
      const active = isContractActive(contract);
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'active' ? active : !active);
      const matchesQuery = !normalizedQuery || [
        contractName(contract), customerName(contract), contract.serviceScope,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [contracts, query, statusFilter]);

  const activeCount = contracts.filter(isContractActive).length;
  const inactiveCount = contracts.length - activeCount;
  const responseValues = contracts.map(responseHours).filter((value) => Number.isFinite(Number(value)));
  const averageResponse = responseValues.length
    ? Math.round(responseValues.reduce((sum, value) => sum + Number(value), 0) / responseValues.length)
    : 0;

  function clearFilters() {
    setQuery('');
    setStatusFilter('all');
  }

  return (
    <section className="sla-page">
      <div className="sla-stats-grid">
        <div className="stat-card green animate-in delay-1">
          <div className="stat-header"><div className="stat-icon green"><i className="fas fa-file-contract" /></div></div>
          <div className="stat-value fa-num">{contracts.length}</div>
          <div className="stat-label">کل قراردادها</div>
        </div>
        <div className="stat-card cyan animate-in delay-2">
          <div className="stat-header"><div className="stat-icon cyan"><i className="fas fa-circle-check" /></div></div>
          <div className="stat-value fa-num">{activeCount}</div>
          <div className="stat-label">قرارداد فعال</div>
        </div>
        <div className="stat-card red animate-in delay-3">
          <div className="stat-header"><div className="stat-icon red"><i className="fas fa-circle-xmark" /></div></div>
          <div className="stat-value fa-num">{inactiveCount}</div>
          <div className="stat-label">قرارداد غیرفعال</div>
        </div>
        <div className="stat-card amber animate-in delay-4">
          <div className="stat-header"><div className="stat-icon amber"><i className="fas fa-clock" /></div></div>
          <div className="stat-value fa-num">{averageResponse}</div>
          <div className="stat-label">میانگین پاسخ‌گویی (ساعت)</div>
        </div>
      </div>

      <div className="panel sla-directory animate-in delay-5">
        <div className="panel-header sla-directory-header">
          <div>
            <div className="panel-title">قراردادهای SLA</div>
            <div className="team-results-count fa-num">{filteredContracts.length} قرارداد نمایش داده می‌شود</div>
          </div>
          <div className="panel-actions sla-toolbar">
            <label className="team-search">
              <i className="fas fa-search" aria-hidden="true" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجوی قرارداد یا مشتری..." aria-label="جستجوی قراردادهای SLA" />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="فیلتر وضعیت قرارداد">
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </select>
            <button type="button" className="filter-btn" onClick={() => loadContracts()} disabled={isLoading}>
              <i className={isLoading ? 'fas fa-spinner fa-spin' : 'fas fa-rotate'} /> به‌روزرسانی
            </button>
          </div>
        </div>

        {isLoading && !contracts.length ? (
          <div className="team-empty"><div className="stat-icon cyan"><i className="fas fa-spinner fa-spin" /></div><strong>در حال دریافت قراردادها...</strong></div>
        ) : loadError ? (
          <div className="team-empty" role="alert">
            <div className="stat-icon red"><i className="fas fa-triangle-exclamation" /></div>
            <strong>امکان نمایش قراردادها نیست</strong><span>{loadError}</span>
            <button type="button" className="filter-btn" onClick={() => loadContracts()}>تلاش دوباره</button>
          </div>
        ) : filteredContracts.length ? (
          <div className={`sla-table-wrap${isLoading ? ' loading' : ''}`}>
            <table className="task-table sla-table">
              <thead><tr><th>شناسه</th><th>قرارداد</th><th>مشتری</th><th>زمان پاسخ</th><th>وضعیت</th><th>آخرین به‌روزرسانی</th></tr></thead>
              <tbody>{filteredContracts.map((contract) => {
                const active = isContractActive(contract);
                const hours = responseHours(contract);
                return (
                  <tr key={contract.id}>
                    <td className="task-id fa-num">#{contract.id}</td>
                    <td><div className="task-title-cell"><span className="task-name">{contractName(contract)}</span>{contract.serviceScope && <span className="task-desc">{contract.serviceScope}</span>}</div></td>
                    <td><div className="sla-customer"><i className="fas fa-building" /><span>{customerName(contract)}</span></div></td>
                    <td><span className="sla-response-time fa-num">{hours ?? '—'}{hours !== undefined && hours !== null ? ' ساعت' : ''}</span></td>
                    <td><span className={`sla-status ${active ? 'active' : 'inactive'}`}><span className="dot" />{active ? 'فعال' : 'غیرفعال'}</span></td>
                    <td className="ticket-date fa-num">{formatDate(contract.updatedAt || contract.createdAt)}</td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        ) : (
          <div className="team-empty">
            <div className="stat-icon cyan"><i className="fas fa-file-circle-xmark" /></div><strong>قراردادی پیدا نشد</strong>
            <span>عبارت جستجو یا فیلتر وضعیت را تغییر دهید.</span>
            {(query || statusFilter !== 'all') && <button type="button" className="filter-btn" onClick={clearFilters}>پاک کردن فیلترها</button>}
          </div>
        )}
      </div>
    </section>
  );
}
