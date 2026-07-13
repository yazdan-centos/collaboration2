import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext'; // adjust path to match your project
import { fetchMessages, postMessage, subscribeToTyping } from '../../services/chatService';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

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
 * Drop-in chatroom component. Fetches history for `roomId`, lets the
 * current authenticated user send new messages, and keeps the view
 * pinned to the latest message.
 *
 * Props:
 * - roomId (string, required): conversation/room identifier used to scope API calls.
 * - receiverId (string, optional): the other participant's id, useful for 1:1 rooms
 *   or for labeling ("Chat with ..."), and for backends that key by receiver rather than room.
 * - title (string, optional): header label. Defaults to "Chat".
 * - height (string, optional): CSS height for the container. Defaults to "560px".
 * - className (string, optional): extra classes for the outer wrapper.
 */
export default function EmbeddedChat({ roomId, receiverId, title = 'Chat', height = '560px', className = '' }) {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [typingUserName, setTypingUserName] = useState(null);

  const scrollAnchorRef = useRef(null);
  const messagesContainerRef = useRef(null);

  /* -------------------------- Load history -------------------------- */

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchMessages(roomId);
      setMessages(data);
    } catch (err) {
      setLoadError('بارگذاری پیام‌ها با خطا مواجه شد. لطفا دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    loadMessages();
  }, [roomId, loadMessages]);

  /* --------------------- Typing indicator (mocked) -------------------- */

  useEffect(() => {
    if (!roomId) return undefined;
    const unsubscribe = subscribeToTyping(roomId, (payload) => {
      setTypingUserName(payload?.userName ?? null);
    });
    return unsubscribe;
  }, [roomId]);

  /* ----------------------------- Autoscroll ---------------------------- */

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typingUserName]);

  /* ------------------------------ Sending ------------------------------ */

  const handleSend = useCallback(
    async (content) => {
      if (!user) return;

      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        roomId,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar ?? null,
        content,
        createdAt: new Date().toISOString(),
        pending: true,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setInputValue('');
      setIsSending(true);

      try {
        const saved = await postMessage(roomId, {
          content,
          senderId: user.id,
          senderName: user.name,
          senderAvatar: user.avatar ?? null,
        });
        setMessages((prev) => prev.map((m) => (m.id === optimisticMessage.id ? saved : m)));
      } catch (err) {
        // Mark the optimistic message as failed rather than silently dropping it
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMessage.id ? { ...m, pending: false, failed: true } : m))
        );
      } finally {
        setIsSending(false);
      }
    },
    [roomId, user]
  );

  /* ------------------------------- Render ------------------------------- */

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl ${className}`}
      style={{ height, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--header-bg)' }}
      >
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
          {receiverId && (
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              گفتگو با کاربر #{receiverId}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div ref={messagesContainerRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {isLoading && <LoadingState />}

        {!isLoading && loadError && <ErrorState message={loadError} onRetry={loadMessages} />}

        {!isLoading && !loadError && messages.length === 0 && <EmptyState />}

        {!isLoading &&
          !loadError &&
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} isOwnMessage={message.senderId === user?.id} />
          ))}

        {!isLoading && !loadError && <TypingIndicator typingUserName={typingUserName} />}

        <div ref={scrollAnchorRef} />
      </div>

      {/* Input */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSend}
        isSending={isSending}
        disabled={!user || isLoading || !!loadError}
      />
    </div>
  );
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
