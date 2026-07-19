import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import slaContractService from '../services/slaContractService';
import { getApiErrorMessage } from '../utils/apiError';

const EMPTY_FORM = {
  contractName: '',
  customerId: '',
  responseTimeHours: '',
  resolutionTimeHours: '',
  targetUptime: '',
  supportCoverage: '',
  serviceScope: '',
  notes: '',
  status: 'ACTIVE',
};

function firstValue(source, keys, fallback = '') {
  for (const key of keys) {
    if (source?.[key] !== undefined && source[key] !== null) return source[key];
  }
  return fallback;
}

function toForm(contract) {
  const active = firstValue(contract, ['isActive', 'active']);
  return {
    contractName: firstValue(contract, ['contractName', 'name', 'title']),
    customerId: firstValue(contract, ['customerId']) || firstValue(contract?.customer, ['id']),
    responseTimeHours: firstValue(contract, ['responseTimeHours', 'responseHours', 'targetResponseHours']),
    resolutionTimeHours: firstValue(contract, ['resolutionTimeHours', 'resolutionHours', 'targetResolutionHours']),
    targetUptime: firstValue(contract, ['targetUptime', 'uptimeTarget', 'uptimePercentage', 'availabilityTarget']),
    supportCoverage: firstValue(contract, ['supportCoverage', 'supportHours', 'coverageHours', 'serviceHours']),
    serviceScope: firstValue(contract, ['serviceScope', 'scope', 'coverageDetails', 'serviceCoverage']),
    notes: firstValue(contract, ['notes', 'description', 'scopeNotes']),
    status: firstValue(contract, ['status'], active === false ? 'INACTIVE' : 'ACTIVE'),
  };
}

function errorMessage(error, action) {
  return getApiErrorMessage(error, action === 'save' ? 'ذخیره تغییرات با خطا مواجه شد.' : 'دریافت اطلاعات قرارداد با خطا مواجه شد.', {
    403: 'حساب شما اجازه ویرایش قرارداد SLA را ندارد.',
    404: 'قرارداد SLA مورد نظر پیدا نشد.',
  });
}

export default function SlaContractEdit() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadContract() {
      setIsLoading(true);
      setError('');
      try {
        const response = await slaContractService.getById(contractId, { signal: controller.signal });
        setContract(response);
        setForm(toForm(response));
      } catch (loadError) {
        if (loadError?.code !== 'ERR_CANCELED') setError(errorMessage(loadError, 'load'));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadContract();
    return () => controller.abort();
  }, [contractId]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const payload = {
        ...contract,
        ...form,
        customerId: form.customerId === '' ? null : Number(form.customerId),
        responseTimeHours: form.responseTimeHours === '' ? null : Number(form.responseTimeHours),
        resolutionTimeHours: form.resolutionTimeHours === '' ? null : Number(form.resolutionTimeHours),
        targetUptime: form.targetUptime === '' ? null : Number(form.targetUptime),
        isActive: form.status === 'ACTIVE',
        active: form.status === 'ACTIVE',
      };
      await slaContractService.update(contractId, payload);
      navigate('/sla-contracts');
    } catch (saveError) {
      setError(errorMessage(saveError, 'save'));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <section className="sla-page"><div className="panel team-empty"><div className="stat-icon cyan"><i className="fas fa-spinner fa-spin" /></div><strong>در حال دریافت قرارداد...</strong></div></section>;
  }

  if (!contract) {
    return (
      <section className="sla-page"><div className="panel team-empty" role="alert"><div className="stat-icon red"><i className="fas fa-triangle-exclamation" /></div><strong>امکان ویرایش قرارداد نیست</strong><span>{error}</span><button type="button" className="filter-btn" onClick={() => navigate('/sla-contracts')}>بازگشت به قراردادها</button></div></section>
    );
  }

  return (
    <section className="sla-page">
      <form className="panel sla-edit-panel animate-in" onSubmit={handleSubmit}>
        <div className="panel-header sla-edit-header">
          <div><div className="panel-title">ویرایش قرارداد SLA</div><div className="team-results-count fa-num">شناسه قرارداد #{contractId}</div></div>
          <button type="button" className="filter-btn" onClick={() => navigate('/sla-contracts')}><i className="fas fa-arrow-right" /> بازگشت</button>
        </div>

        <div className="sla-edit-form">
          {error && <div className="sla-form-alert" role="alert"><i className="fas fa-triangle-exclamation" />{error}</div>}
          <label className="sla-form-field"><span>نام قرارداد</span><input name="contractName" value={form.contractName} onChange={updateField} required /></label>
          <label className="sla-form-field"><span>شناسه مشتری</span><input name="customerId" type="number" min="1" value={form.customerId} onChange={updateField} /></label>
          <label className="sla-form-field"><span>زمان پاسخ (ساعت)</span><input name="responseTimeHours" type="number" min="0" step="0.5" value={form.responseTimeHours} onChange={updateField} /></label>
          <label className="sla-form-field"><span>زمان رفع مشکل (ساعت)</span><input name="resolutionTimeHours" type="number" min="0" step="0.5" value={form.resolutionTimeHours} onChange={updateField} /></label>
          <label className="sla-form-field"><span>آپ‌تایم هدف (%)</span><input name="targetUptime" type="number" min="0" max="100" step="0.01" value={form.targetUptime} onChange={updateField} /></label>
          <label className="sla-form-field"><span>ساعات پشتیبانی</span><input name="supportCoverage" value={form.supportCoverage} onChange={updateField} placeholder="مثال: 24/7" /></label>
          <label className="sla-form-field"><span>وضعیت</span><select name="status" value={form.status} onChange={updateField}><option value="ACTIVE">فعال</option><option value="INACTIVE">غیرفعال</option><option value="EXPIRED">منقضی</option><option value="CANCELLED">لغو شده</option></select></label>
          <label className="sla-form-field sla-form-wide"><span>محدوده خدمات</span><textarea name="serviceScope" rows="4" value={form.serviceScope} onChange={updateField} /></label>
          <label className="sla-form-field sla-form-wide"><span>یادداشت‌ها</span><textarea name="notes" rows="4" value={form.notes} onChange={updateField} /></label>
        </div>

        <div className="sla-edit-actions">
          <button type="button" className="filter-btn" onClick={() => navigate('/sla-contracts')} disabled={isSaving}>انصراف</button>
          <button type="submit" className="filter-btn active" disabled={isSaving}><i className={isSaving ? 'fas fa-spinner fa-spin' : 'fas fa-floppy-disk'} />{isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</button>
        </div>
      </form>
    </section>
  );
}
