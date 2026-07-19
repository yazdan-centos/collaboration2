import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ticketService from '../services/ticketService';
import { hasRole, USER_ROLES } from '../utils/authorization';
import { getApiErrorMessage, getValidationMessage } from '../utils/apiError';

function errorMessage(error) {
  if (error?.status === 400) return getValidationMessage(error, 'اطلاعات تیکت معتبر نیست.');
  return getApiErrorMessage(error, 'ایجاد تیکت با خطا مواجه شد.', { 403: 'اجازه ایجاد تیکت را ندارید.' });
}

export default function TicketCreatePage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const isCustomer = hasRole(auth, USER_ROLES.CUSTOMER);
  const [form, setForm] = useState({ title: '', description: '', customerId: '', slaContractId: '' });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploadFailures, setUploadFailures] = useState([]);
  const [createdTicketId, setCreatedTicketId] = useState(null);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function uploadFiles(ticketId, selectedFiles) {
    const results = await Promise.allSettled(selectedFiles.map((file) => ticketService.uploadCustomerAttachment(ticketId, file)));
    setUploadFailures(results.flatMap((result, index) => (result.status === 'rejected' ? [selectedFiles[index]] : [])));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const title = form.title.trim();
    const description = form.description.trim();
    if (!title || !description || (!isCustomer && !form.customerId)) {
      setError(isCustomer ? 'عنوان و شرح را وارد کنید.' : 'عنوان، شرح و مشتری را وارد کنید.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    setUploadFailures([]);
    try {
      const payload = {
        title,
        description,
        slaContractId: form.slaContractId ? Number(form.slaContractId) : null,
        assignedMemberId: null,
      };
      if (!isCustomer) payload.customerId = Number(form.customerId);
      const created = await ticketService.create(payload);
      const ticketId = created?.id ?? created?.ticketId;
      if (!ticketId) throw new Error('شناسه تیکت جدید از سرور دریافت نشد.');
      setCreatedTicketId(ticketId);
      if (files.length) await uploadFiles(ticketId, files);
      if (!files.length || !uploadFailures.length) navigate('/tickets');
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function retryUploads() {
    if (!createdTicketId || !uploadFailures.length) return;
    setIsSubmitting(true);
    await uploadFiles(createdTicketId, uploadFailures);
    setIsSubmitting(false);
  }

  return (
    <section className="ticket-page">
      <form className="panel sla-edit-panel animate-in" onSubmit={handleSubmit} noValidate>
        <div className="panel-header sla-edit-header">
          <div><div className="panel-title">ایجاد تیکت</div><div className="team-results-count">درخواست خود را ثبت کنید</div></div>
          <button type="button" className="filter-btn" onClick={() => navigate('/tickets')}><i className="fas fa-arrow-right" /> بازگشت</button>
        </div>
        <div className="sla-edit-form">
          {error && <div className="sla-form-alert" role="alert"><i className="fas fa-triangle-exclamation" />{error}</div>}
          {uploadFailures.length > 0 && (
            <div className="sla-form-alert" role="alert">
              <i className="fas fa-cloud-arrow-up" /> آپلود {uploadFailures.length} فایل ناموفق بود.
              <button type="button" className="filter-btn" onClick={retryUploads} disabled={isSubmitting}>تلاش دوباره</button>
            </div>
          )}
          <label className="sla-form-field sla-form-wide"><span>عنوان</span><input name="title" value={form.title} onChange={updateField} required disabled={isSubmitting} /></label>
          <label className="sla-form-field sla-form-wide"><span>شرح مشکل</span><textarea name="description" rows="6" value={form.description} onChange={updateField} required disabled={isSubmitting} /></label>
          {!isCustomer && <label className="sla-form-field"><span>شناسه مشتری</span><input name="customerId" type="number" min="1" value={form.customerId} onChange={updateField} required disabled={isSubmitting} /></label>}
          {!isCustomer && <label className="sla-form-field"><span>شناسه قرارداد SLA (اختیاری)</span><input name="slaContractId" type="number" min="1" value={form.slaContractId} onChange={updateField} disabled={isSubmitting} /></label>}
          <label className="sla-form-field sla-form-wide"><span>پیوست‌ها</span><input type="file" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} disabled={isSubmitting} /></label>
        </div>
        <div className="sla-edit-actions">
          <button type="button" className="filter-btn" onClick={() => navigate('/tickets')} disabled={isSubmitting}>انصراف</button>
          <button type="submit" className="filter-btn active" disabled={isSubmitting}><i className={isSubmitting ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'} />{isSubmitting ? 'در حال ثبت...' : 'ثبت تیکت'}</button>
        </div>
      </form>
    </section>
  );
}
