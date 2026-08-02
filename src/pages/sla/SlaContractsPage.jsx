import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import slaContractService from '../../services/slaContractService';
import { getApiErrorMessage } from '../../utils/apiError';
import { toPersianNum } from '../../utils/helpers';

const PAGE_SIZES = [5, 10, 15];

function unwrap(response) {
  return response?.body ?? response?.data ?? response;
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
  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ');
  return customer.companyName || customer.name || customer.fullName || fullName || customer.username
    || contract.customerName || (contract.customerId ? `مشتری ${contract.customerId}` : 'نامشخص');
}

function responseHours(contract) {
  return contract.responseTimeHours ?? contract.responseHours ?? contract.targetResponseHours;
}

function resolutionHours(contract) {
  return contract.resolutionTimeHours ?? contract.resolutionHours ?? contract.targetResolutionHours;
}

function targetUptime(contract) {
  return contract.targetUptime ?? contract.uptimeTarget ?? contract.uptimePercentage ?? contract.availabilityTarget;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

function loadErrorMessage(error) {
  return getApiErrorMessage(error, 'دریافت قراردادهای SLA با خطا مواجه شد.', {
    403: 'حساب شما اجازه مشاهده قراردادهای SLA را ندارد.',
  });
}

function SlaContractDetails({ contract, onClose, onEdit }) {
  const active = isContractActive(contract);
  const facts = [
    { icon: 'fas fa-building', label: 'مشتری', value: customerName(contract) },
    { icon: 'fas fa-bolt', label: 'زمان پاسخ', value: responseHours(contract) != null ? `${responseHours(contract)} ساعت` : 'تعیین نشده' },
    { icon: 'fas fa-screwdriver-wrench', label: 'زمان رفع', value: resolutionHours(contract) != null ? `${resolutionHours(contract)} ساعت` : 'تعیین نشده' },
    { icon: 'fas fa-chart-line', label: 'آپ‌تایم هدف', value: targetUptime(contract) != null ? `${targetUptime(contract)}٪` : 'تعیین نشده' },
  ];

  return (
    <aside className="panel sla-detail-panel animate-in" aria-label="جزئیات قرارداد SLA">
      <div className="sla-detail-accent" />
      <header className="sla-detail-header">
        <div>
          <span><i className="fas fa-shield-halved" /> جزئیات توافق‌نامه</span>
          <h2>{contractName(contract)}</h2>
          <small className="fa-num">SLA #{toPersianNum(contract.id)}</small>
        </div>
        <button type="button" className="icon-action-btn" onClick={onClose} aria-label="بستن جزئیات"><i className="fas fa-times" /></button>
      </header>
      <div className="sla-detail-status-row">
        <span className={`sla-status ${active ? 'active' : 'inactive'}`}><span className="dot" />{active ? 'فعال' : 'غیرفعال'}</span>
        <span><i className="far fa-calendar" /> آخرین تغییر: {formatDate(contract.updatedAt || contract.createdAt)}</span>
      </div>
      <div className="sla-detail-facts">
        {facts.map((fact) => <div key={fact.label}><i className={fact.icon} /><span>{fact.label}</span><strong className="fa-num">{fact.value}</strong></div>)}
      </div>
      <section className="sla-detail-section">
        <span><i className="fas fa-layer-group" /> محدوده خدمات</span>
        <p>{contract.serviceScope || contract.scope || 'برای این قرارداد محدوده خدمات ثبت نشده است.'}</p>
      </section>
      <section className="sla-detail-section">
        <span><i className="fas fa-note-sticky" /> یادداشت‌ها</span>
        <p>{contract.notes || contract.description || 'یادداشتی ثبت نشده است.'}</p>
      </section>
      <button type="button" className="sla-detail-edit-action" onClick={onEdit}><i className="fas fa-pen" /> ویرایش قرارداد</button>
    </aside>
  );
}

export default function SlaContractsPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isServerPage, setIsServerPage] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadContracts = useCallback(async (signal) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const response = await slaContractService.getPage({ page, size: pageSize, searchKey }, { signal });
      const data = unwrap(response);
      const pageable = !Array.isArray(data) && Array.isArray(data?.content);
      const items = pageable ? data.content : Array.isArray(data) ? data : [];
      setContracts(items);
      setIsServerPage(pageable);
      setTotalElements(pageable ? Number(data.totalElements ?? items.length) : items.length);
      setTotalPages(pageable ? Number(data.totalPages ?? 0) : Math.ceil(items.length / pageSize));
    } catch (error) {
      if (error?.code !== 'ERR_CANCELED') setLoadError(loadErrorMessage(error));
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [page, pageSize, searchKey]);

  useEffect(() => {
    const controller = new AbortController();
    loadContracts(controller.signal);
    return () => controller.abort();
  }, [loadContracts]);

  const filteredContracts = useMemo(() => {
    const normalizedQuery = searchKey.trim().toLocaleLowerCase('fa-IR');
    return contracts.filter((contract) => {
      const active = isContractActive(contract);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? active : !active);
      const matchesQuery = isServerPage || !normalizedQuery || [contractName(contract), customerName(contract), contract.serviceScope, contract.id]
        .some((value) => String(value || '').toLocaleLowerCase('fa-IR').includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [contracts, isServerPage, searchKey, statusFilter]);

  const visibleContracts = isServerPage
    ? filteredContracts
    : filteredContracts.slice(page * pageSize, (page + 1) * pageSize);
  const effectiveTotal = isServerPage ? totalElements : filteredContracts.length;
  const effectivePages = isServerPage ? totalPages : Math.ceil(filteredContracts.length / pageSize);
  const selectedContract = contracts.find((contract) => String(contract.id) === String(selectedId)) || null;
  const activeCount = contracts.filter(isContractActive).length;
  const responseValues = contracts.map(responseHours).filter((value) => Number.isFinite(Number(value)));
  const averageResponse = responseValues.length ? Math.round(responseValues.reduce((sum, value) => sum + Number(value), 0) / responseValues.length) : 0;

  useEffect(() => {
    if (page > 0 && effectivePages && page >= effectivePages) setPage(effectivePages - 1);
  }, [effectivePages, page]);

  function submitSearch(event) {
    event.preventDefault();
    setPage(0);
    setSearchKey(searchInput.trim());
  }

  function clearFilters() {
    setSearchInput('');
    setSearchKey('');
    setStatusFilter('all');
    setPage(0);
  }

  return (
    <section className="sla-page">
      <div className="sla-stats-grid">
        <div className="stat-card green animate-in delay-1"><div className="stat-header"><div className="stat-icon green"><i className="fas fa-file-contract" /></div></div><div className="stat-value fa-num">{effectiveTotal}</div><div className="stat-label">کل قراردادها</div></div>
        <div className="stat-card cyan animate-in delay-2"><div className="stat-header"><div className="stat-icon cyan"><i className="fas fa-circle-check" /></div></div><div className="stat-value fa-num">{activeCount}</div><div className="stat-label">فعال در این صفحه</div></div>
        <div className="stat-card purple animate-in delay-3"><div className="stat-header"><div className="stat-icon purple"><i className="fas fa-layer-group" /></div></div><div className="stat-value fa-num">{visibleContracts.length}</div><div className="stat-label">نتایج صفحه جاری</div></div>
        <div className="stat-card amber animate-in delay-4"><div className="stat-header"><div className="stat-icon amber"><i className="fas fa-clock" /></div></div><div className="stat-value fa-num">{averageResponse}</div><div className="stat-label">میانگین پاسخ (ساعت)</div></div>
      </div>

      <div className={`sla-workspace${selectedContract ? ' has-details' : ''}`}>
        <div className="panel sla-directory animate-in delay-5">
          <div className="panel-header sla-directory-header">
            <div><div className="panel-title">مدیریت قراردادهای SLA</div><div className="team-results-count fa-num">{effectiveTotal} نتیجه</div></div>
            <button type="button" className="filter-btn" onClick={() => loadContracts()} disabled={isLoading}><i className={isLoading ? 'fas fa-spinner fa-spin' : 'fas fa-rotate'} /> به‌روزرسانی</button>
          </div>
          <form className="sla-search-toolbar" onSubmit={submitSearch}>
            <label className="team-search"><i className="fas fa-search" /><input type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="search-key: قرارداد، مشتری یا شناسه..." aria-label="کلید جستجوی قرارداد" /></label>
            <button type="submit" className="filter-btn active"><i className="fas fa-magnifying-glass" /> جستجو</button>
            <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(0); }} aria-label="فیلتر وضعیت"><option value="all">همه وضعیت‌ها</option><option value="active">فعال</option><option value="inactive">غیرفعال</option></select>
            <label className="sla-size-select"><span>تعداد:</span><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }}>{PAGE_SIZES.map((size) => <option key={size} value={size}>{toPersianNum(size)}</option>)}</select></label>
          </form>

          {isLoading && !contracts.length ? <div className="team-empty"><div className="stat-icon cyan"><i className="fas fa-spinner fa-spin" /></div><strong>در حال دریافت قراردادها...</strong></div> : loadError ? <div className="team-empty" role="alert"><div className="stat-icon red"><i className="fas fa-triangle-exclamation" /></div><strong>امکان نمایش قراردادها نیست</strong><span>{loadError}</span><button type="button" className="filter-btn" onClick={() => loadContracts()}>تلاش دوباره</button></div> : visibleContracts.length ? (
            <div className={`sla-contract-list${isLoading ? ' loading' : ''}`}>
              {visibleContracts.map((contract) => {
                const active = isContractActive(contract);
                return <button type="button" key={contract.id} className={`sla-contract-card${String(selectedId) === String(contract.id) ? ' selected' : ''}`} onClick={() => setSelectedId(contract.id)}><span className="sla-contract-icon"><i className="fas fa-file-shield" /></span><div className="sla-contract-card-main"><div><span className={`sla-status ${active ? 'active' : 'inactive'}`}><span className="dot" />{active ? 'فعال' : 'غیرفعال'}</span><small className="fa-num">#{toPersianNum(contract.id)}</small></div><h3>{contractName(contract)}</h3><p>{contract.serviceScope || 'محدوده خدمات ثبت نشده است.'}</p><footer><span><i className="fas fa-building" /> {customerName(contract)}</span><span className="fa-num"><i className="fas fa-bolt" /> {responseHours(contract) ?? '—'} ساعت</span></footer></div><i className="fas fa-chevron-left sla-contract-arrow" /></button>;
              })}
            </div>
          ) : <div className="team-empty"><div className="stat-icon cyan"><i className="fas fa-file-circle-xmark" /></div><strong>قراردادی پیدا نشد</strong><span>کلید جستجو یا فیلتر را تغییر دهید.</span>{(searchKey || statusFilter !== 'all') && <button type="button" className="filter-btn" onClick={clearFilters}>پاک کردن فیلترها</button>}</div>}

          <footer className="sla-pagination">
            <span className="fa-num">صفحه {toPersianNum(effectivePages ? page + 1 : 0)} از {toPersianNum(effectivePages)}</span>
            <div><button type="button" onClick={() => setPage((current) => current - 1)} disabled={page === 0 || isLoading} aria-label="صفحه قبل"><i className="fas fa-chevron-right" /></button><button type="button" onClick={() => setPage((current) => current + 1)} disabled={page + 1 >= effectivePages || isLoading} aria-label="صفحه بعد"><i className="fas fa-chevron-left" /></button></div>
          </footer>
        </div>
        {selectedContract && <SlaContractDetails contract={selectedContract} onClose={() => setSelectedId(null)} onEdit={() => navigate(`/sla-contracts/${selectedContract.id}/edit`)} />}
      </div>
    </section>
  );
}
