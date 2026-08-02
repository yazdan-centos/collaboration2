import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchMessages, postMessage } from '../../services/chatService';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { getApiErrorMessage, getValidationMessage } from '../../utils/apiError';

const EmptyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * EmbeddedChat
 *
 * Ticket message thread. Fetches history for `ticketId`, lets the
 * current authenticated user send new messages, and keeps the view
 * pinned to the latest message.
 *
 * Props:
 * - ticketId (number|string, required): ticket identifier used by the ticket API.
 * - title (string, optional): header label. Defaults to "Chat".
 * - height (string, optional): CSS height for the container. Defaults to "560px".
 * - className (string, optional): extra classes for the outer wrapper.
 */
export default function EmbeddedChat({
  ticketId,
  title = 'گفتگوی تیکت',
  subtitle,
  avatar,
  height = '560px',
  className = '',
  onMessageCreated,
  canSend = true,
  variant = 'default',
}) {
  const { currentUser, role, roles } = useAuth();

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [sendError, setSendError] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAnchorRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isWhatsApp = variant === 'whatsapp';

  const currentUserId = currentUser?.id ?? currentUser?.userId ?? null;
  const currentUserName = typeof currentUser === 'string'
    ? currentUser
    : currentUser?.name ?? currentUser?.fullName ?? currentUser?.username ?? '';

  /* -------------------------- Load history -------------------------- */

  const loadMessages = useCallback(async (options = {}) => {
    setIsLoading(true);
    setLoadError(null);
    setSendError(null);
    try {
      if (!ticketId) {
        setMessages([]);
        setLoadError('برای نمایش گفتگو ابتدا یک تیکت را انتخاب کنید.');
        return;
      }
      const data = await fetchMessages(ticketId, options);
      setMessages(data);
    } catch (err) {
      if (err?.code !== 'ERR_CANCELED') {
        setLoadError(getMessageError(err, 'بارگذاری پیام‌ها با خطا مواجه شد. لطفا دوباره تلاش کنید.'));
      }
    } finally {
      if (!options.signal?.aborted) setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    const controller = new AbortController();
    loadMessages({ signal: controller.signal });
    return () => controller.abort();
  }, [ticketId, loadMessages]);

  /* ----------------------------- Autoscroll ---------------------------- */

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  /* ------------------------------ Sending ------------------------------ */

  const handleSend = useCallback(
    async (content) => {
      if (!ticketId) return;
      setIsSending(true);
      setSendError(null);

      try {
        const saved = await postMessage(ticketId, { content }, { role: roles?.length ? roles : role });
        setMessages((previous) => [...previous, saved]);
        setInputValue('');
        onMessageCreated?.(saved);
      } catch (err) {
        setSendError(getMessageError(err, 'ارسال پیام با خطا مواجه شد. لطفا دوباره تلاش کنید.'));
      } finally {
        setIsSending(false);
      }
    },
    [onMessageCreated, role, roles, ticketId]
  );

  /* ------------------------------- Render ------------------------------- */

  return (
    <div
      className={`flex flex-col overflow-hidden ${isWhatsApp ? 'ticket-chat-whatsapp-thread' : 'rounded-2xl'} ${className}`}
      style={isWhatsApp
        ? { height }
        : { height, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className={isWhatsApp
          ? 'ticket-chat-whatsapp-header'
          : 'flex items-center justify-between px-4 py-3'}
        style={isWhatsApp ? undefined : { borderBottom: '1px solid var(--border)', background: 'var(--header-bg)' }}
      >
        <div className={isWhatsApp ? 'ticket-chat-whatsapp-contact' : ''}>
          {isWhatsApp && avatar && <img src={avatar} alt="" />}
          <div>
            <h3 className={isWhatsApp ? '' : 'text-sm font-bold'} style={isWhatsApp ? undefined : { color: 'var(--text-primary)' }}>
              {title}
            </h3>
            {ticketId && (
              <p className={isWhatsApp ? '' : 'text-[11px]'} style={isWhatsApp ? undefined : { color: 'var(--text-muted)' }}>
                {subtitle || `تیکت #${ticketId}`}
              </p>
            )}
          </div>
        </div>
        {isWhatsApp && <div className="ticket-chat-whatsapp-actions"><i className="fas fa-search" /><i className="fas fa-ellipsis-v" /></div>}
      </div>

      {/* Body */}
      <div ref={messagesContainerRef} className={isWhatsApp
        ? 'ticket-chat-whatsapp-messages'
        : 'flex-1 space-y-3 overflow-y-auto px-4 py-4'}>
        {isLoading && <LoadingState />}

        {!isLoading && loadError && <ErrorState message={loadError} onRetry={() => loadMessages()} />}

        {!isLoading && !loadError && messages.length === 0 && <EmptyState />}

        {!isLoading &&
          !loadError &&
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              variant={variant}
              isOwnMessage={(currentUserId != null && String(message.senderId) === String(currentUserId))
                || (!currentUserId && currentUserName && message.senderName === currentUserName)}
            />
          ))}

        <div ref={scrollAnchorRef} />
      </div>

      {/* Input */}
      {sendError && (
        <div className="px-4 py-2 text-xs" style={{ color: 'var(--danger)' }} role="alert">
          {sendError}
        </div>
      )}
      {canSend ? <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSend}
        isSending={isSending}
        disabled={!ticketId || isLoading || !!loadError}
        variant={variant}
      /> : <div className="ticket-detail-readonly-note">ارسال پیام برای این تیکت در دسترس شما نیست.</div>}
    </div>
  );
}

function getMessageError(error, fallback) {
  if (error?.status === 400) return getValidationMessage(error, 'متن پیام معتبر نیست.');
  return getApiErrorMessage(error, fallback, {
    403: 'اجازه مشاهده یا ارسال پیام در این تیکت را ندارید.',
    404: 'تیکت موردنظر پیدا نشد.',
  });
}

/* ------------------------------------------------------------------ */
/*  Small presentational states                                        */
/* ------------------------------------------------------------------ */

function LoadingState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
      <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span className="text-xs">در حال بارگذاری پیام‌ها...</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-2 text-center"
      style={{ color: 'var(--text-muted)' }}
    >
      <EmptyIcon />
      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        هنوز پیامی وجود ندارد
      </p>
      <p className="text-xs">اولین نفری باشید که پیام می‌فرستد.</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-3 text-center"
      style={{ color: 'var(--danger)' }}
    >
      <ErrorIcon />
      <p className="text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
        style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
      >
        تلاش دوباره
      </button>
    </div>
  );
}
