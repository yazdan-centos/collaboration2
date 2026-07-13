import React, { useEffect, useMemo, useState } from 'react';
import FileUploadManager from './file-upload/FileUploadManager';
import { useAuth } from '../context/AuthContext';
import ticketService from '../services/ticketService';

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

function formatDate(value) {
  if (!value) return 'زمان نامشخص';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'زمان نامشخص';
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function resolveAttachmentUrl(file) {
  const path = file.uploadedUrl || file.filePath || file.url;
  if (!path || /^(blob:|data:)/i.test(path)) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

function detailError(error) {
  const status = error?.response?.status ?? error?.status;
  if (status === 401) return 'نشست کاربری منقضی شده است؛ دوباره وارد شوید.';
  if (status === 403) return 'اجازه مشاهده جزئیات این تیکت را ندارید.';
  if (status === 404) return 'تیکت موردنظر پیدا نشد.';
  return 'دریافت جزئیات تیکت با خطا مواجه شد.';
}

function firstValue(object, fields) {
  return fields.map((field) => object?.[field]).find((value) => value !== undefined && value !== null && value !== '');
}

export default function TicketDetails({ ticketId, ticketSummary, onClose }) {
  const { role } = useAuth();
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
          customerId ? ticketService.getCustomerById(customerId, { signal: controller.signal }) : Promise.resolve(null),
          slaContractId ? ticketService.getSlaContractById(slaContractId, { signal: controller.signal }) : Promise.resolve(null),
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
  }, [ticketId, reloadKey]);

  const messages = useMemo(() => [...(ticket?.messages || [])]
    .sort((first, second) => timestamp(first.sentAt || first.createdAt) - timestamp(second.sentAt || second.createdAt)), [ticket]);
  const attachments = useMemo(() => [...(ticket?.attachments || [])]
    .sort((first, second) => timestamp(first.uploadedAt || first.createdAt) - timestamp(second.uploadedAt || second.createdAt)), [ticket]);
  const attachmentApi = useMemo(() => ({
    list: async () => attachments,
    upload: async (file, { onProgress } = {}) => {
      const options = {
        onUploadProgress(event) {
          if (event.total) onProgress?.(Math.round((event.loaded * 100) / event.total));
        },
      };
      const uploaded = role === 'ROLE_CUSTOMER' || role === 'CUSTOMER'
        ? await ticketService.uploadCustomerAttachment(ticketId, file, options)
        : await ticketService.uploadAttachment(ticketId, file, options);
      return { ...uploaded, uploadedUrl: resolveAttachmentUrl(uploaded) };
    },
    delete: async (file) => {
      await ticketService.deleteAttachment(file.serverId || file.id);
      setTicket((current) => ({
        ...current,
        attachments: (current?.attachments || []).filter((attachment) => attachment.id !== (file.serverId || file.id)),
      }));
    },
    download: async (file) => resolveAttachmentUrl(file),
    share: async (file) => resolveAttachmentUrl(file),
  }), [attachments, role, ticketId]);
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

          <div className="ticket-association-grid">
            <div>
              <span><i className="fas fa-building" /> مشتری</span>
              <strong>{customerName || (ticket.customerId ? `مشتری #${ticket.customerId}` : 'نامشخص')}</strong>
            </div>
            <div>
              <span><i className="fas fa-file-contract" /> SLA فعال</span>
              {hasActiveSla ? (
                <strong>
                  {slaName || `قرارداد #${ticket.slaContractId || ticket.slaContract?.id}`}
                  <small className={(slaIsActive === false || ['INACTIVE', 'EXPIRED', 'CANCELLED'].includes(slaStatus)) ? 'inactive' : 'active'}>
                    {(slaIsActive === false || ['INACTIVE', 'EXPIRED', 'CANCELLED'].includes(slaStatus)) ? 'غیرفعال' : 'فعال'}
                  </small>
                </strong>
              ) : <strong>بدون SLA فعال</strong>}
            </div>
          </div>

          <section className="ticket-detail-section">
            <div className="ticket-detail-section-title">
              <strong>پیام‌ها</strong><span className="fa-num">{messages.length}</span>
            </div>
            <div className="ticket-message-list">
              {messages.length ? messages.map((message) => (
                <article className="ticket-message" key={message.id}>
                  <div>
                    <strong>{message.senderName || `فرستنده ${message.senderId || ''}`}</strong>
                    <time className="fa-num" dateTime={message.sentAt || message.createdAt}>{formatDate(message.sentAt || message.createdAt)}</time>
                  </div>
                  <p>{message.message}</p>
                </article>
              )) : <div className="ticket-detail-empty">پیامی برای این تیکت ثبت نشده است.</div>}
            </div>
          </section>

          <section className="ticket-detail-section">
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
          </section>
        </div>
      ) : null}
    </aside>
  );
}
