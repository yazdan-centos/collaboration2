import React, { useEffect, useMemo, useState } from 'react';
import FileUploadManager from './file-upload/FileUploadManager';
import EmbeddedChat from './chat/EmbeddedChat';
import SLAcontractDetails from './SLAcontractDetails';
import { useAuth } from '../context/AuthContext';
import ticketService from '../services/ticketService';
import { hasRole, isAssignedExpert, NEXT_TICKET_STATUSES, USER_ROLES } from '../utils/authorization';
import { getApiErrorMessage, getValidationMessage } from '../utils/apiError';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const ticketUploadStyles = {
  container: 'ticket-upload-manager',
  section: 'ticket-upload-section',
  sectionHeader: 'ticket-upload-section-header',
  dropzone: 'ticket-upload-dropzone',
  dropzoneActive: 'ticket-upload-dropzone active',
  fileList: 'ticket-upload-list',
  fileRow: 'ticket-upload-row',
  fileIcon: 'ticket-upload-icon',
  fileInfo: 'ticket-upload-info',
  fileName: 'ticket-upload-name',
  fileMeta: 'ticket-upload-meta',
  error: 'ticket-upload-error',
  progressTrack: 'ticket-upload-progress',
  progressBar: 'ticket-upload-progress-bar',
  button: 'filter-btn active',
  iconButton: 'action-btn',
  dangerButton: 'action-btn ticket-upload-delete',
  emptyState: 'ticket-upload-empty',
  status: 'ticket-upload-status',
};

function timestamp(value) {
  const time = new Date(value || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function resolveAttachmentUrl(file) {
  const path = file.uploadedUrl || file.filePath || file.url;
  if (!path || /^(blob:|data:)/i.test(path)) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

function detailError(error) {
  return getApiErrorMessage(error, 'دریافت جزئیات تیکت با خطا مواجه شد.', {
    403: 'اجازه مشاهده جزئیات این تیکت را ندارید.',
    404: 'تیکت موردنظر پیدا نشد.',
  });
}

function firstValue(object, fields) {
  return fields.map((field) => object?.[field]).find((value) => value !== undefined && value !== null && value !== '');
}

function mutationError(error, fallback) {
  if (error?.status === 400) return getValidationMessage(error, 'اطلاعات واردشده معتبر نیست.');
  return getApiErrorMessage(error, fallback, {
    403: 'اجازه انجام این تغییر را ندارید.',
    404: 'تیکت موردنظر پیدا نشد.',
  });
}

function TicketStatusEditor({ ticket, onSaved }) {
  const availableStatuses = NEXT_TICKET_STATUSES[ticket.status] || [];
  const [status, setStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (!status) {
      setError('وضعیت جدید را انتخاب کنید.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const updated = await ticketService.update(ticket.id, {
        status,
        statusNote: statusNote.trim() || null,
      });
      setStatus('');
      setStatusNote('');
      onSaved(updated);
    } catch (saveError) {
      setError(mutationError(saveError, 'تغییر وضعیت انجام نشد.'));
    } finally {
      setIsSaving(false);
    }
  }

  if (!availableStatuses.length) return null;
  return (
    <form className="ticket-detail-section" onSubmit={submit}>
      <div className="ticket-detail-section-title"><span>تغییر وضعیت</span></div>
      {error && <div className="sla-form-alert" role="alert">{error}</div>}
      <label className="sla-form-field"><span>وضعیت جدید</span><select value={status} onChange={(event) => setStatus(event.target.value)} disabled={isSaving} required><option value="">انتخاب کنید</option>{availableStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label className="sla-form-field"><span>یادداشت وضعیت</span><textarea rows="3" value={statusNote} onChange={(event) => setStatusNote(event.target.value)} disabled={isSaving} /></label>
      <button type="submit" className="filter-btn active" disabled={isSaving}>{isSaving ? 'در حال ذخیره...' : 'ثبت وضعیت'}</button>
    </form>
  );
}

function ManagerTicketEditor({ ticket, onSaved }) {
  const [values, setValues] = useState({
    title: ticket.title || '', description: ticket.description || '', status: ticket.status || '',
    customerId: ticket.customerId || '', slaContractId: ticket.slaContractId || '',
    assignedMemberId: ticket.assignedMemberId || ticket.assignedToId || '', priority: ticket.priority || '',
    scope: ticket.scope || ticket.serviceScope || '', statusNote: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const payload = {
        title: values.title.trim(), description: values.description.trim(), status: values.status,
        customerId: values.customerId ? Number(values.customerId) : null,
        slaContractId: values.slaContractId ? Number(values.slaContractId) : null,
        assignedMemberId: values.assignedMemberId ? Number(values.assignedMemberId) : null,
        priority: values.priority || null, scope: values.scope.trim() || null,
        statusNote: values.statusNote.trim() || null,
      };
      onSaved(await ticketService.update(ticket.id, payload));
    } catch (saveError) {
      setError(mutationError(saveError, 'ذخیره تغییرات انجام نشد.'));
    } finally {
      setIsSaving(false);
    }
  }

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  return (
    <form className="ticket-detail-section" onSubmit={submit}>
      <div className="ticket-detail-section-title"><span>مدیریت تیکت</span></div>
      {error && <div className="sla-form-alert" role="alert">{error}</div>}
      <div className="client-form-grid">
        <label className="sla-form-field client-form-wide"><span>عنوان</span><input name="title" value={values.title} onChange={update} required disabled={isSaving} /></label>
        <label className="sla-form-field client-form-wide"><span>شرح</span><textarea name="description" rows="4" value={values.description} onChange={update} required disabled={isSaving} /></label>
        <label className="sla-form-field"><span>وضعیت</span><select name="status" value={values.status} onChange={update} disabled={isSaving}><option value={ticket.status}>{ticket.status}</option>{(NEXT_TICKET_STATUSES[ticket.status] || []).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="sla-form-field"><span>اولویت</span><select name="priority" value={values.priority} onChange={update} disabled={isSaving}><option value="">بدون اولویت</option><option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option></select></label>
        <label className="sla-form-field"><span>شناسه مشتری</span><input name="customerId" type="number" min="1" value={values.customerId} onChange={update} disabled={isSaving} /></label>
        <label className="sla-form-field"><span>شناسه SLA</span><input name="slaContractId" type="number" min="1" value={values.slaContractId} onChange={update} disabled={isSaving} /></label>
        <label className="sla-form-field"><span>شناسه کارشناس</span><input name="assignedMemberId" type="number" min="1" value={values.assignedMemberId} onChange={update} disabled={isSaving} /></label>
        <label className="sla-form-field"><span>محدوده خدمات</span><input name="scope" value={values.scope} onChange={update} disabled={isSaving} /></label>
        <label className="sla-form-field client-form-wide"><span>یادداشت وضعیت</span><textarea name="statusNote" rows="2" value={values.statusNote} onChange={update} disabled={isSaving} /></label>
      </div>
      <button type="submit" className="filter-btn active" disabled={isSaving}>{isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</button>
    </form>
  );
}

export default function TicketDetails({ ticketId, ticketSummary, onClose }) {
  const { auth, role } = useAuth();
  const isCustomer = hasRole(auth, USER_ROLES.CUSTOMER);
  const isManager = hasRole(auth, USER_ROLES.TEAM_MANAGER);
  const [ticket, setTicket] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [slaContract, setSlaContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTicket() {
      setIsLoading(true);
      setError('');
      setTicket(null);
      setCustomer(null);
      setSlaContract(null);
      try {
        const response = await ticketService.getTicketById(ticketId, { signal: controller.signal });
        setTicket(response);

        const customerId = response.customerId || response.customer?.id;
        const slaContractId = response.slaContractId || response.slaContract?.id;
        const [customerResult, slaResult] = await Promise.allSettled([
          isManager && customerId ? ticketService.getCustomerById(customerId, { signal: controller.signal }) : Promise.resolve(null),
          isManager && slaContractId ? ticketService.getSlaContractById(slaContractId, { signal: controller.signal }) : Promise.resolve(null),
        ]);
        if (customerResult.status === 'fulfilled') setCustomer(customerResult.value);
        if (slaResult.status === 'fulfilled') setSlaContract(slaResult.value);
      } catch (loadError) {
        if (loadError?.code !== 'ERR_CANCELED') setError(detailError(loadError));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadTicket();
    return () => controller.abort();
  }, [isManager, ticketId, reloadKey]);

  const attachments = useMemo(() => [...(ticket?.attachments || [])]
    .sort((first, second) => timestamp(first.uploadedAt || first.createdAt) - timestamp(second.uploadedAt || second.createdAt)), [ticket]);
  const canUpload = isCustomer || isManager;
  // The assignment ID identifies a team-member record, not necessarily the login user record.
  // The API scopes visible tickets and validates assignment again when a message is posted.
  const canSendMessage = isCustomer || isManager || hasRole(auth, USER_ROLES.TEAM_MEMBER);
  const attachmentApi = useMemo(() => ({
    list: async () => attachments,
    upload: async (file, { onProgress } = {}) => {
      const options = {
        onUploadProgress(event) {
          if (event.total) onProgress?.(Math.round((event.loaded * 100) / event.total));
        },
      };
      const uploaded = isCustomer
        ? await ticketService.uploadCustomerAttachment(ticketId, file, options)
        : await ticketService.uploadAttachment(ticketId, file, options);
      return { ...uploaded, uploadedUrl: resolveAttachmentUrl(uploaded) };
    },
    ...(isManager ? { delete: async (file) => {
      await ticketService.deleteAttachment(file.serverId || file.id);
      setTicket((current) => ({
        ...current,
        attachments: (current?.attachments || []).filter((attachment) => attachment.id !== (file.serverId || file.id)),
      }));
    } } : {}),
    download: async (file) => resolveAttachmentUrl(file),
    share: async (file) => resolveAttachmentUrl(file),
  }), [attachments, isCustomer, role, ticketId]);
  const customerName = firstValue(customer, ['name', 'customerName', 'companyName', 'fullName', 'username'])
    || firstValue(ticket?.customer, ['name', 'customerName', 'companyName', 'fullName', 'username'])
    || ticket?.customerName
    || ticketSummary?.customerName;
  const slaName = firstValue(slaContract, ['name', 'title', 'contractName', 'slaName'])
    || firstValue(ticket?.slaContract, ['name', 'title', 'contractName', 'slaName'])
    || ticket?.slaContractName;
  const slaStatus = firstValue(slaContract, ['status']) || firstValue(ticket?.slaContract, ['status']);
  const slaIsActive = firstValue(slaContract, ['active', 'isActive']) ?? firstValue(ticket?.slaContract, ['active', 'isActive']);
  const hasActiveSla = Boolean(ticket?.slaContractId || ticket?.slaContract?.id || slaContract);

  return (
    <aside className="panel ticket-details animate-in" aria-label="جزئیات تیکت">
      <div className="ticket-details-header">
        <div>
          <span className="task-id fa-num">تیکت #{ticketId}</span>
          <h2>{ticket?.title || 'جزئیات تیکت'}</h2>
        </div>
        <button type="button" className="action-btn" onClick={onClose} aria-label="بستن جزئیات">
          <i className="fas fa-times" />
        </button>
      </div>

      {isLoading ? (
        <div className="team-empty compact">
          <i className="fas fa-spinner fa-spin" />
          <span>در حال دریافت جزئیات...</span>
        </div>
      ) : error ? (
        <div className="team-empty compact" role="alert">
          <span>{error}</span>
          <button type="button" className="filter-btn" onClick={() => setReloadKey((value) => value + 1)}>تلاش دوباره</button>
        </div>
      ) : ticket ? (
        <div className="ticket-details-body">
          {ticket.description && <p className="ticket-details-description">{ticket.description}</p>}

          {!isCustomer && <>
            <div className="ticket-association-grid">
              {isManager && <div>
                <span><i className="fas fa-building" /> مشتری</span>
                <strong>{customerName || (ticket.customerId ? `مشتری #${ticket.customerId}` : 'نامشخص')}</strong>
              </div>}
              {isManager && <div>
                <span><i className="fas fa-file-contract" /> SLA فعال</span>
                {hasActiveSla ? (
                  <strong>
                    {slaName || `قرارداد #${ticket.slaContractId || ticket.slaContract?.id}`}
                    <small className={(slaIsActive === false || ['INACTIVE', 'EXPIRED', 'CANCELLED'].includes(slaStatus)) ? 'inactive' : 'active'}>
                      {(slaIsActive === false || ['INACTIVE', 'EXPIRED', 'CANCELLED'].includes(slaStatus)) ? 'غیرفعال' : 'فعال'}
                    </small>
                  </strong>
                ) : <strong>بدون SLA فعال</strong>}
              </div>}
              <div><span><i className="fas fa-flag" /> اولویت</span><strong>{ticket.priority || '—'}</strong></div>
              <div><span><i className="fas fa-diagram-project" /> محدوده خدمات</span><strong>{ticket.scope || ticket.serviceScope || '—'}</strong></div>
            </div>
            {isManager && <SLAcontractDetails
              className="ticket-detail-section"
              contract={slaContract || ticket.slaContract}
              slaContractId={ticket.slaContractId || ticket.slaContract?.id}
              history={ticket.slaHistory || ticket.slaEvents}
            />}
          </>}

          <section className="ticket-detail-section ticket-status-summary">
            <span>وضعیت فعلی</span><strong>{ticket.status || 'نامشخص'}</strong>
          </section>

          {isManager && <ManagerTicketEditor ticket={ticket} onSaved={(updated) => setTicket((current) => ({ ...current, ...updated }))} />}
          {!isManager && isAssignedExpert(auth, ticket) && <TicketStatusEditor ticket={ticket} onSaved={(updated) => setTicket((current) => ({ ...current, ...updated }))} />}

          <section className="ticket-detail-section">
            <EmbeddedChat
              ticketId={ticketId}
              canSend={canSendMessage}
              height="420px"
              onMessageCreated={(created) => setTicket((current) => ({
                ...current,
                messages: [...(current?.messages || []), created],
              }))}
            />
          </section>

          {canUpload && <section className="ticket-detail-section">
            <FileUploadManager
              key={ticketId}
              api={attachmentApi}
              styles={ticketUploadStyles}
              maxFiles={5}
              maxFileSize={25 * 1024 * 1024}
              uploadConcurrency={3}
              onUploaded={(uploaded) => setTicket((current) => ({
                ...current,
                attachments: [...(current?.attachments || []), uploaded],
              }))}
            />
          </section>}
        </div>
      ) : null}
    </aside>
  );
}
