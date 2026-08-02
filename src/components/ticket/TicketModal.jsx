import React, { useEffect, useMemo, useState } from 'react';
import FileUploadManager from '../file-upload/FileUploadManager';
import EmbeddedChat from '../chat/EmbeddedChat';
import { useAuth } from '../../context/AuthContext';
import ticketService from '../../services/ticketService';
import {
  hasRole,
  hasPermission,
  NEXT_TICKET_STATUSES,
  USER_ROLES,
} from '../../utils/authorization';
import {
  getApiErrorMessage,
  getValidationMessage,
} from '../../utils/apiError';
import { prepareTicketUpdate } from '../../utils/ticketUpdate';

const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const PAGE_SIZE = 10;

const statusMeta = {
  UNALLOCATED: { label: 'تخصیص‌نیافته', className: 'unallocated' },
  ASSIGNED: { label: 'تخصیص‌یافته', className: 'assigned' },
  IN_PROGRESS: { label: 'در حال بررسی', className: 'in-progress' },
  RESOLVED: { label: 'حل‌شده', className: 'resolved' },
  CLOSED: { label: 'بسته‌شده', className: 'closed' },
};

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
  return Number.isNaN(new Date(value || 0).getTime())
      ? 0
      : new Date(value).getTime();
}

function resolveAttachmentUrl(file) {
  const path = file.uploadedUrl || file.filePath || file.url;

  if (!path || /^(blob:|data:)/i.test(path)) return path;
  if (/^https?:\/\//i.test(path)) return path;

  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
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

function apiErrorMessage(error, fallback) {
  return error?.status === 400
      ? getValidationMessage(error, fallback)
      : getApiErrorMessage(error, fallback);
}

function TicketCreateForm({
                            auth,
                            isManager,
                            customerContracts,
                            onSubmit,
                            onCancel,
                          }) {
  const authenticatedCustomerId = auth?.customerId ?? auth?.userId;
  const [values, setValues] = useState({
    title: '',
    description: '',
    customerId: isManager ? '' : String(authenticatedCustomerId ?? ''),
    slaContractId: '',
    assignedMemberId: '',
  });
  const [files, setFiles] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadFailures, setUploadFailures] = useState([]);
  const [createdTicketId, setCreatedTicketId] = useState(null);

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
  }

  async function uploadFiles(ticketId, fileList) {
    const results = await Promise.allSettled(
        fileList.map((file) =>
            ticketService.uploadCustomerAttachment(ticketId, file)
        )
    );

    const failures = [];

    results.forEach((result, index) => {
      if (result.status === 'rejected') failures.push(fileList[index]);
    });

    setUploadFailures(failures);
    return failures;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const requiredFields = ['title', 'description'];
    if (isManager) requiredFields.push('customerId');

    const localErrors = requiredFields.reduce((result, field) => {
      if (!values[field].trim()) {
        result[field] = 'تکمیل این فیلد الزامی است.';
      }
      return result;
    }, {});

    if (Object.keys(localErrors).length) {
      setFieldErrors(localErrors);
      setFormError('فیلدهای الزامی را تکمیل کنید.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    setUploadFailures([]);

    try {
      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        slaContractId: values.slaContractId ? Number(values.slaContractId) : null,
        assignedMemberId:
            isManager && values.assignedMemberId
                ? Number(values.assignedMemberId)
                : null,
      };

      if (isManager) payload.customerId = Number(values.customerId);

      const ticket = await ticketService.create(payload);
      setCreatedTicketId(ticket.id);

      if (files.length) {
        const failures = await uploadFiles(ticket.id, files);
        if (!failures.length) onSubmit(ticket);
      } else {
        onSubmit(ticket);
      }
    } catch (error) {
      setFormError(apiErrorMessage(error, 'ثبت تیکت انجام نشد.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function retryUploads() {
    if (!createdTicketId || !uploadFailures.length) return;

    setIsSubmitting(true);
    const failures = await uploadFiles(createdTicketId, uploadFailures);
    setIsSubmitting(false);

    if (!failures.length) onSubmit({ id: createdTicketId });
  }

  return (
      <form onSubmit={handleSubmit}>
        <div className="client-form-grid">
          {formError && (
              <div className="sla-form-alert" role="alert">
                <i className="fas fa-triangle-exclamation" />
                {formError}
              </div>
          )}

          {uploadFailures.length > 0 && (
              <div className="sla-form-alert" role="alert">
                <i className="fas fa-cloud-arrow-up" /> آپلود {uploadFailures.length}{' '}
                فایل ناموفق بود.
                <button
                    type="button"
                    className="filter-btn"
                    onClick={retryUploads}
                    disabled={isSubmitting}
                >
                  تلاش دوباره
                </button>
              </div>
          )}

          <label className="sla-form-field client-form-wide">
            <span>عنوان</span>
            <input
                name="title"
                value={values.title}
                onChange={updateField}
                required
                disabled={isSubmitting}
            />
            {fieldErrors.title && (
                <span className="client-field-error">{fieldErrors.title}</span>
            )}
          </label>

          <label className="sla-form-field client-form-wide">
            <span>شرح مشکل</span>
            <textarea
                name="description"
                rows="5"
                value={values.description}
                onChange={updateField}
                required
                disabled={isSubmitting}
            />
            {fieldErrors.description && (
                <span className="client-field-error">{fieldErrors.description}</span>
            )}
          </label>

          {!isManager && (
              <label className="sla-form-field client-form-wide">
                <span>قرارداد SLA (اختیاری)</span>
                <select
                    name="slaContractId"
                    value={values.slaContractId}
                    onChange={updateField}
                    disabled={isSubmitting}
                >
                  <option value="">بدون قرارداد</option>
                  {customerContracts.map((contract) => (
                      <option key={contract.id} value={contract.id}>
                        {contract.contractName ||
                            contract.name ||
                            `قرارداد ${contract.id}`}
                      </option>
                  ))}
                </select>
              </label>
          )}

          {isManager && (
              <>
                <label className="sla-form-field">
                  <span>شناسه مشتری</span>
                  <input
                      name="customerId"
                      type="number"
                      min="1"
                      value={values.customerId}
                      onChange={updateField}
                      required
                      disabled={isSubmitting}
                  />
                  {fieldErrors.customerId && (
                      <span className="client-field-error">
                  {fieldErrors.customerId}
                </span>
                  )}
                </label>

                <label className="sla-form-field">
                  <span>شناسه قرارداد SLA (اختیاری)</span>
                  <input
                      name="slaContractId"
                      type="number"
                      min="1"
                      value={values.slaContractId}
                      onChange={updateField}
                      disabled={isSubmitting}
                  />
                </label>

                <label className="sla-form-field">
                  <span>شناسه کارشناس (اختیاری)</span>
                  <input
                      name="assignedMemberId"
                      type="number"
                      min="1"
                      value={values.assignedMemberId}
                      onChange={updateField}
                      disabled={isSubmitting}
                  />
                </label>
              </>
          )}

          <label className="sla-form-field client-form-wide">
            <span>پیوست‌ها</span>
            <input
                type="file"
                multiple
                onChange={(event) =>
                    setFiles(Array.from(event.target.files || []))
                }
                disabled={isSubmitting}
            />
            {files.length > 0 && (
                <span className="client-field-error">
              {files.length} فایل انتخاب شده
            </span>
            )}
          </label>
        </div>

        <div className="sla-edit-actions">
          <button
              type="button"
              className="filter-btn"
              onClick={onCancel}
              disabled={isSubmitting}
          >
            انصراف
          </button>

          <button
              type="submit"
              className="primary-action-btn"
              disabled={isSubmitting}
          >
            <i
                className={
                  isSubmitting ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'
                }
            />
            {isSubmitting ? 'در حال ثبت...' : 'ثبت تیکت'}
          </button>
        </div>
      </form>
  );
}

function TicketEditForm({ ticket, onSaved, onCancel }) {
  const { auth } = useAuth();
  const isManager = hasRole(auth, USER_ROLES.TEAM_MANAGER);
  const canUpdate = hasPermission(auth, 'TICKET_UPDATE');
  const canEditTitle = canUpdate && isManager;
  const canEditStatus = canUpdate;

  const [values, setValues] = useState({
    title: ticket.title || '',
    description: ticket.description || '',
    status: ticket.status || '',
    statusNote: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValues({
      title: ticket.title || '',
      description: ticket.description || '',
      status: ticket.status || '',
      statusNote: '',
    });
  }, [ticket]);

  const availableStatuses = useMemo(
      () => NEXT_TICKET_STATUSES[ticket.status] || [],
      [ticket.status]
  );

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {};

    if (canEditTitle) {
      payload.title = values.title.trim();
      payload.description = values.description.trim();
    }

    if (canEditStatus) {
      payload.status = values.status;
      if (values.statusNote.trim()) {
        payload.statusNote = values.statusNote.trim();
      }
    }

    if (!payload.title && !payload.description && !payload.status) {
      setFormError('تغییری برای ذخیره وجود ندارد.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const updated = await ticketService.update(
          ticket.id,
          prepareTicketUpdate(ticket, payload)
      );
      onSaved(updated);
    } catch (error) {
      setFormError(apiErrorMessage(error, 'ذخیره تغییرات انجام نشد.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
      <form onSubmit={handleSubmit}>
        <div className="client-form-grid">
          {formError && (
              <div className="sla-form-alert" role="alert">
                <i className="fas fa-triangle-exclamation" />
                {formError}
              </div>
          )}

          {canEditTitle && (
              <>
                <label className="sla-form-field client-form-wide">
                  <span>عنوان</span>
                  <input
                      name="title"
                      value={values.title}
                      onChange={updateField}
                      required
                      disabled={isSubmitting}
                  />
                  {fieldErrors.title && (
                      <span className="client-field-error">{fieldErrors.title}</span>
                  )}
                </label>

                <label className="sla-form-field client-form-wide">
                  <span>شرح مشکل</span>
                  <textarea
                      name="description"
                      rows="5"
                      value={values.description}
                      onChange={updateField}
                      required
                      disabled={isSubmitting}
                  />
                  {fieldErrors.description && (
                      <span className="client-field-error">
                  {fieldErrors.description}
                </span>
                  )}
                </label>
              </>
          )}

          {canEditStatus && (
              <>
                <label className="sla-form-field">
                  <span>وضعیت</span>
                  <select
                      name="status"
                      value={values.status}
                      onChange={updateField}
                      disabled={isSubmitting}
                  >
                    <option value={ticket.status}>
                      {statusMeta[ticket.status]?.label || ticket.status}
                    </option>
                    {availableStatuses.map((status) => (
                        <option key={status} value={status}>
                          {statusMeta[status]?.label || status}
                        </option>
                    ))}
                  </select>
                  {fieldErrors.status && (
                      <span className="client-field-error">{fieldErrors.status}</span>
                  )}
                </label>

                <label className="sla-form-field client-form-wide">
                  <span>یادداشت تغییر وضعیت</span>
                  <textarea
                      name="statusNote"
                      rows="3"
                      value={values.statusNote}
                      onChange={updateField}
                      disabled={isSubmitting}
                  />
                </label>
              </>
          )}

          {!canEditTitle && !canEditStatus && (
              <div className="sla-form-alert" role="alert">
                شما اجازه ویرایش این تیکت را ندارید.
              </div>
          )}
        </div>

        <div className="sla-edit-actions">
          <button
              type="button"
              className="filter-btn"
              onClick={onCancel}
              disabled={isSubmitting}
          >
            انصراف
          </button>

          {(canEditTitle || canEditStatus) && (
              <button
                  type="submit"
                  className="primary-action-btn"
                  disabled={isSubmitting}
              >
                <i
                    className={
                      isSubmitting ? 'fas fa-spinner fa-spin' : 'fas fa-floppy-disk'
                    }
                />
                {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
          )}
        </div>
      </form>
  );
}

function TicketView({ ticket, ticketId, onUpdated }) {
  const { auth } = useAuth();
  const isCustomer = hasRole(auth, USER_ROLES.CUSTOMER);
  const canUpdate = hasPermission(auth, 'TICKET_UPDATE');
  const canUpload = canUpdate;
  // Message authorization is enforced by the role-specific API endpoint; user and member IDs may differ.
  const canSendMessage =
      canUpdate;

  const attachments = useMemo(
      () =>
          [...(ticket?.attachments || [])].sort(
              (a, b) =>
                  timestamp(a.uploadedAt || a.createdAt) -
                  timestamp(b.uploadedAt || b.createdAt)
          ),
      [ticket]
  );

  const attachmentApi = useMemo(
      () => ({
        list: async () => attachments,
        upload: async (file) => {
          const uploaded = isCustomer
              ? await ticketService.uploadCustomerAttachment(ticketId, file)
              : await ticketService.uploadAttachment(ticketId, file);

          return { ...uploaded, uploadedUrl: resolveAttachmentUrl(uploaded) };
        },
        ...(canUpdate
            ? {
              delete: async (file) =>
                  ticketService.deleteAttachment(file.serverId || file.id),
            }
            : {}),
        download: async (file) => resolveAttachmentUrl(file),
        share: async (file) => resolveAttachmentUrl(file),
      }),
      [attachments, canUpdate, isCustomer, ticketId]
  );

  const status = statusMeta[ticket.status] || {
    label: ticket.status || 'نامشخص',
    className: 'unknown',
  };

  return (
      <div className="ticket-modal-view">
        <div className="ticket-modal-meta">
          <span className="task-id fa-num">تیکت #{ticket.id}</span>
          <span className={`ticket-status ${status.className}`}>
          <span className="dot" />
            {status.label}
        </span>
        </div>

        <h2 className="ticket-modal-title">{ticket.title || 'بدون عنوان'}</h2>

        {ticket.description && (
            <p className="ticket-modal-description">{ticket.description}</p>
        )}

        <div className="ticket-modal-dates fa-num">
        <span>
          <i className="fas fa-calendar" /> ایجاد: {formatDate(ticket.createdAt)}
        </span>
          <span>
          <i className="fas fa-rotate" /> بروزرسانی:{' '}
            {formatDate(ticket.updatedAt)}
        </span>
        </div>

        <section className="ticket-modal-section">
          <EmbeddedChat
              ticketId={ticketId}
              canSend={canSendMessage}
              height="320px"
              onMessageCreated={() => onUpdated()}
          />
        </section>

        {canUpload && (
            <section className="ticket-modal-section">
              <FileUploadManager
                  key={ticketId}
                  api={attachmentApi}
                  styles={ticketUploadStyles}
                  maxFiles={5}
                  maxFileSize={25 * 1024 * 1024}
                  uploadConcurrency={3}
                  onUploaded={() => onUpdated()}
              />
            </section>
        )}
      </div>
  );
}

export default function TicketModal({
                                      mode,
                                      ticketId,
                                      ticketSummary,
                                      onClose,
                                      onSuccess,
                                    }) {
  const { auth } = useAuth();
  const isManager = hasRole(auth, USER_ROLES.TEAM_MANAGER);
  const isCustomer = hasRole(auth, USER_ROLES.CUSTOMER);
  const canCreate = hasPermission(auth, 'TICKET_CREATE');
  const canUpdate = hasPermission(auth, 'TICKET_UPDATE');

  const [ticket, setTicket] = useState(ticketSummary || null);
  const [isLoading, setIsLoading] = useState(mode !== 'create');
  const [error, setError] = useState('');
  const [customerContracts, setCustomerContracts] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (mode === 'create') {
      setIsLoading(false);

      const customerId = auth?.customerId ?? auth?.userId;

      if (isCustomer && customerId) {
        ticketService
            .getCustomerById(customerId)
            .then((customer) => {
              const contracts =
                  customer?.slaContracts || customer?.slaContractIds || [];
              setCustomerContracts(contracts);
            })
            .catch(() => setCustomerContracts([]));
      }

      return;
    }

    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError('');

      try {
        const response = await ticketService.getTicketById(ticketId, {
          signal: controller.signal,
        });
        setTicket(response);
      } catch (err) {
        if (err?.code !== 'ERR_CANCELED') {
          setError(apiErrorMessage(err, 'دریافت جزئیات تیکت با خطا مواجه شد.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => controller.abort();
  }, [mode, ticketId, auth, reloadKey]);

  function handleSaved(updated) {
    setTicket((current) => ({ ...current, ...updated }));
    if (onSuccess) onSuccess(updated);
  }

  const title =
      mode === 'create'
          ? 'ثبت تیکت جدید'
          : mode === 'edit'
              ? 'ویرایش تیکت'
              : 'جزئیات تیکت';

  return (
      <div className="client-form-backdrop" role="presentation">
        <div
            className="panel client-form-panel ticket-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-modal-title"
        >
          <div className="panel-header client-form-header">
            <div>
              <div className="panel-title" id="ticket-modal-title">
                {title}
              </div>
              <div className="team-results-count">
                {mode === 'create'
                    ? 'درخواست خود را ثبت کنید'
                    : 'اطلاعات تیکت را مشاهده و پیام ارسال کنید'}
              </div>
            </div>

            <button
                type="button"
                className="icon-action-btn"
                onClick={onClose}
                aria-label="بستن"
            >
              <i className="fas fa-xmark" />
            </button>
          </div>

          <div className="ticket-modal-body">
            {isLoading ? (
                <div className="team-empty compact">
                  <i className="fas fa-spinner fa-spin" />
                  <span>در حال دریافت...</span>
                </div>
            ) : error ? (
                <div className="team-empty compact" role="alert">
                  <span>{error}</span>
                  <button
                      type="button"
                      className="filter-btn"
                      onClick={() => setReloadKey((k) => k + 1)}
                  >
                    تلاش دوباره
                  </button>
                </div>
            ) : mode === 'create' && canCreate ? (
                <TicketCreateForm
                    auth={auth}
                    isManager={isManager}
                    customerContracts={customerContracts}
                    onSubmit={(created) => {
                      if (onSuccess) onSuccess(created);
                      onClose();
                    }}
                    onCancel={onClose}
                />
            ) : mode === 'edit' && canUpdate ? (
                <TicketEditForm
                    ticket={ticket}
                    onSaved={handleSaved}
                    onCancel={onClose}
                />
            ) : mode === 'view' ? (
                <TicketView
                    ticket={ticket}
                    ticketId={ticketId}
                    onUpdated={() => setReloadKey((k) => k + 1)}
                />
            ) : <div className="team-empty compact"><i className="fas fa-lock"/><span>اجازه انجام این عملیات را ندارید.</span></div>}
          </div>
        </div>
      </div>
  );
}
