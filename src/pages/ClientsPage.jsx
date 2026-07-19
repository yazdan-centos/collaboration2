import React, { useCallback, useEffect, useMemo, useState } from 'react';
import customerService from '../services/customerService';
import { getApiErrorMessage, getValidationMessage } from '../utils/apiError';

const emptyForm = { firstName: '', lastName: '', username: '', email: '', phone: '', companyName: '', password: '' };

function customerName(customer) {
  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim();
  return fullName || customer.name || customer.username || `مشتری ${customer.id}`;
}

function contractIds(customer) {
  if (Array.isArray(customer.slaContractIds)) return customer.slaContractIds;
  if (Array.isArray(customer.slaContracts)) return customer.slaContracts.map((contract) => contract.id);
  return [];
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

function apiErrorMessage(error, fallback) {
  return error?.status === 400 ? getValidationMessage(error, fallback) : getApiErrorMessage(error, fallback);
}

function CustomerForm({ customer, isSaving, onCancel, onSubmit }) {
  const [values, setValues] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const isEditing = Boolean(customer);

  useEffect(() => {
    setValues(customer ? {
      firstName: customer.firstName || '', lastName: customer.lastName || '', username: customer.username || '',
      email: customer.email || '', phone: customer.phone || '', companyName: customer.companyName || '', password: '',
    } : emptyForm);
    setFieldErrors({});
    setFormError('');
  }, [customer]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const requiredFields = ['firstName', 'lastName', 'username', 'email', 'companyName'];
    if (!isEditing) requiredFields.push('password');
    const localErrors = requiredFields.reduce((result, field) => {
      if (!values[field].trim()) result[field] = 'تکمیل این فیلد الزامی است.';
      return result;
    }, {});
    if (Object.keys(localErrors).length) {
      setFieldErrors(localErrors);
      setFormError('فیلدهای الزامی را تکمیل کنید.');
      return;
    }
    const payload = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]).filter(([key, value]) => key !== 'password' || value));
    try {
      setFormError('');
      setFieldErrors({});
      await onSubmit(payload);
    } catch (error) {
      setFormError(apiErrorMessage(error, 'ذخیره اطلاعات مشتری انجام نشد.'));
    }
  }

  return (
    <div className="client-form-backdrop" role="presentation">
      <div className="panel client-form-panel" role="dialog" aria-modal="true" aria-labelledby="client-form-title">
        <div className="panel-header client-form-header"><div><div className="panel-title" id="client-form-title">{isEditing ? 'ویرایش مشتری' : 'ثبت مشتری جدید'}</div><div className="team-results-count">اطلاعات هویتی و ارتباطی مشتری را وارد کنید.</div></div><button type="button" className="icon-action-btn" onClick={onCancel} disabled={isSaving} aria-label="بستن فرم"><i className="fas fa-xmark" /></button></div>
        <form onSubmit={handleSubmit}>
          <div className="client-form-grid">
            <label className="sla-form-field">نام<input name="firstName" value={values.firstName} onChange={handleChange} autoFocus />{fieldErrors.firstName && <span className="client-field-error">{fieldErrors.firstName}</span>}</label>
            <label className="sla-form-field">نام خانوادگی<input name="lastName" value={values.lastName} onChange={handleChange} />{fieldErrors.lastName && <span className="client-field-error">{fieldErrors.lastName}</span>}</label>
            <label className="sla-form-field">نام کاربری<input name="username" value={values.username} onChange={handleChange} dir="ltr" />{fieldErrors.username && <span className="client-field-error">{fieldErrors.username}</span>}</label>
            <label className="sla-form-field">ایمیل<input type="email" name="email" value={values.email} onChange={handleChange} dir="ltr" />{fieldErrors.email && <span className="client-field-error">{fieldErrors.email}</span>}</label>
            <label className="sla-form-field">تلفن<input type="tel" name="phone" value={values.phone} onChange={handleChange} dir="ltr" />{fieldErrors.phone && <span className="client-field-error">{fieldErrors.phone}</span>}</label>
            <label className="sla-form-field">شرکت<input name="companyName" value={values.companyName} onChange={handleChange} />{fieldErrors.companyName && <span className="client-field-error">{fieldErrors.companyName}</span>}</label>
            <label className="sla-form-field client-form-wide">{isEditing ? 'رمز عبور جدید (اختیاری)' : 'رمز عبور'}<input type="password" name="password" value={values.password} onChange={handleChange} dir="ltr" autoComplete="new-password" />{fieldErrors.password && <span className="client-field-error">{fieldErrors.password}</span>}</label>
            {formError && <div className="sla-form-alert" role="alert"><i className="fas fa-triangle-exclamation" />{formError}</div>}
          </div>
          <div className="sla-edit-actions"><button type="button" className="filter-btn" onClick={onCancel} disabled={isSaving}>انصراف</button><button type="submit" className="primary-action-btn" disabled={isSaving}><i className={isSaving ? 'fas fa-spinner fa-spin' : 'fas fa-floppy-disk'} />{isSaving ? 'در حال ذخیره...' : 'ذخیره مشتری'}</button></div>
        </form>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const response = await customerService.getAll();
      setCustomers(Array.isArray(response) ? response : response?.content || response?.customers || []);
    } catch (error) {
      setLoadError(apiErrorMessage(error, 'دریافت فهرست مشتریان انجام نشد.'));
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return customers.filter((customer) => {
      const isDeleted = customer.deleted === true || customer.active === false;
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && !isDeleted) || (statusFilter === 'inactive' && isDeleted);
      const searchable = [customerName(customer), customer.username, customer.email, customer.phone, customer.companyName].filter(Boolean).join(' ').toLowerCase();
      return matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [customers, query, statusFilter]);

  const activeCount = customers.filter((customer) => customer.deleted !== true && customer.active !== false).length;
  const companyCount = new Set(customers.map((customer) => customer.companyName).filter(Boolean)).size;
  const contractCount = customers.reduce((sum, customer) => sum + contractIds(customer).length, 0);

  async function saveCustomer(payload) {
    setIsSaving(true);
    try {
      if (editingCustomer) await customerService.update(editingCustomer.id, payload);
      else await customerService.create(payload);
      setIsFormOpen(false);
      setEditingCustomer(null);
      await loadCustomers();
    } finally { setIsSaving(false); }
  }

  async function deleteCustomer(customer) {
    if (!window.confirm(`مشتری «${customerName(customer)}» حذف شود؟ این عملیات ممکن است دسترسی او و ارتباطات مدیریتی مرتبط را غیرفعال کند.`)) return;
    setDeletingId(customer.id);
    setActionError('');
    try {
      await customerService.delete(customer.id);
      await loadCustomers();
    } catch (error) {
      setActionError(apiErrorMessage(error, 'حذف مشتری انجام نشد.'));
    } finally { setDeletingId(null); }
  }

  return (
    <section className="client-page">
      <div className="client-stats-grid">
        <div className="stat-card green animate-in delay-1"><div className="stat-header"><div className="stat-icon green"><i className="fas fa-users" /></div></div><div className="stat-value fa-num">{customers.length}</div><div className="stat-label">کل مشتریان</div></div>
        <div className="stat-card cyan animate-in delay-2"><div className="stat-header"><div className="stat-icon cyan"><i className="fas fa-user-check" /></div></div><div className="stat-value fa-num">{activeCount}</div><div className="stat-label">مشتری فعال</div></div>
        <div className="stat-card amber animate-in delay-3"><div className="stat-header"><div className="stat-icon amber"><i className="fas fa-building" /></div></div><div className="stat-value fa-num">{companyCount}</div><div className="stat-label">شرکت ثبت‌شده</div></div>
        <div className="stat-card red animate-in delay-4"><div className="stat-header"><div className="stat-icon red"><i className="fas fa-file-signature" /></div></div><div className="stat-value fa-num">{contractCount}</div><div className="stat-label">قرارداد SLA مرتبط</div></div>
      </div>

      <div className="panel client-directory animate-in delay-5">
        <div className="panel-header client-directory-header"><div><div className="panel-title">مدیریت مشتریان</div><div className="team-results-count fa-num">{filteredCustomers.length} مشتری نمایش داده می‌شود</div></div><div className="panel-actions client-toolbar"><label className="team-search"><i className="fas fa-search" aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجوی نام، شرکت یا ایمیل..." aria-label="جستجوی مشتریان" /></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="فیلتر وضعیت مشتری"><option value="all">همه وضعیت‌ها</option><option value="active">فعال</option><option value="inactive">غیرفعال</option></select><button type="button" className="filter-btn" onClick={loadCustomers} disabled={isLoading}><i className={isLoading ? 'fas fa-spinner fa-spin' : 'fas fa-rotate'} /> به‌روزرسانی</button><button type="button" className="primary-action-btn" onClick={() => { setEditingCustomer(null); setIsFormOpen(true); }}><i className="fas fa-user-plus" /> مشتری جدید</button></div></div>
        {actionError && <div className="client-action-alert" role="alert"><i className="fas fa-triangle-exclamation" /><span>{actionError}</span><button type="button" onClick={() => setActionError('')} aria-label="بستن پیام"><i className="fas fa-xmark" /></button></div>}
        {isLoading && !customers.length ? <div className="team-empty"><div className="stat-icon cyan"><i className="fas fa-spinner fa-spin" /></div><strong>در حال دریافت مشتریان...</strong></div> : loadError ? <div className="team-empty" role="alert"><div className="stat-icon red"><i className="fas fa-triangle-exclamation" /></div><strong>امکان نمایش مشتریان نیست</strong><span>{loadError}</span><button type="button" className="filter-btn" onClick={loadCustomers}>تلاش دوباره</button></div> : filteredCustomers.length ? (
          <div className={`client-table-wrap${isLoading ? ' loading' : ''}`}><table className="task-table client-table"><thead><tr><th>مشتری</th><th>شرکت</th><th>اطلاعات تماس</th><th>قرارداد SLA</th><th>وضعیت</th><th>تاریخ ثبت</th><th>عملیات</th></tr></thead><tbody>{filteredCustomers.map((customer) => { const isActive = customer.deleted !== true && customer.active !== false; return <tr key={customer.id}><td><div className="client-identity"><div className="client-avatar">{customerName(customer).slice(0, 1)}</div><div className="task-title-cell"><span className="task-name">{customerName(customer)}</span><span className="task-desc" dir="ltr">@{customer.username || '—'}</span></div></div></td><td><div className="sla-customer"><i className="fas fa-building" /><span>{customer.companyName || '—'}</span></div></td><td><div className="client-contact"><span dir="ltr"><i className="fas fa-envelope" />{customer.email || '—'}</span><span className="fa-num" dir="ltr"><i className="fas fa-phone" />{customer.phone || '—'}</span></div></td><td><span className="client-contract-count fa-num">{contractIds(customer).length} قرارداد</span></td><td><span className={`sla-status ${isActive ? 'active' : 'inactive'}`}><span className="dot" />{isActive ? 'فعال' : 'غیرفعال'}</span></td><td className="ticket-date fa-num">{formatDate(customer.createdAt)}</td><td><div className="client-row-actions"><button type="button" className="filter-btn" onClick={() => { setEditingCustomer(customer); setIsFormOpen(true); }}><i className="fas fa-pen" /> ویرایش</button><button type="button" className="client-delete-btn" onClick={() => deleteCustomer(customer)} disabled={deletingId === customer.id} aria-label={`حذف ${customerName(customer)}`}><i className={deletingId === customer.id ? 'fas fa-spinner fa-spin' : 'fas fa-trash'} /></button></div></td></tr>; })}</tbody></table></div>
        ) : <div className="team-empty"><div className="stat-icon cyan"><i className="fas fa-user-slash" /></div><strong>مشتری‌ای پیدا نشد</strong><span>عبارت جستجو یا فیلتر وضعیت را تغییر دهید.</span>{(query || statusFilter !== 'all') && <button type="button" className="filter-btn" onClick={() => { setQuery(''); setStatusFilter('all'); }}>پاک کردن فیلترها</button>}</div>}
      </div>
      {isFormOpen && <CustomerForm customer={editingCustomer} isSaving={isSaving} onCancel={() => setIsFormOpen(false)} onSubmit={saveCustomer} />}
    </section>
  );
}
