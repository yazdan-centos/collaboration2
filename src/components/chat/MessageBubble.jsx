import React from 'react';

const getInitials = (name = '') =>
  name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';

const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * A single chat bubble. Visually distinguishes the current user's own
 * messages (right-aligned, accent color) from other participants'
 * messages (left-aligned, neutral surface).
 */
export default function MessageBubble({ message, isOwnMessage, variant = 'default' }) {
  const { senderName, senderAvatar, content, createdAt } = message;
  const isWhatsApp = variant === 'whatsapp';

  return (
    <div
      className={isWhatsApp
        ? `ticket-chat-whatsapp-message ${isOwnMessage ? 'own' : 'other'}`
        : `flex items-end gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
      aria-label={`Message from ${isOwnMessage ? 'you' : senderName}`}
    >
      {/* Avatar */}
      {!isWhatsApp && <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg text-xs font-bold text-white"
        style={{
          background: isOwnMessage
            ? 'linear-gradient(135deg, var(--accent), #059669)'
            : 'linear-gradient(135deg, var(--info), var(--purple))',
        }}
      >
        {senderAvatar ? (
          <img src={senderAvatar} alt={senderName} className="h-full w-full object-cover" />
        ) : (
          getInitials(senderName)
        )}
      </div>}

      {/* Bubble */}
      <div className={isWhatsApp
        ? 'ticket-chat-whatsapp-bubble'
        : `flex max-w-[75%] flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {!isOwnMessage && !isWhatsApp && (
          <span className="mb-1 px-1 text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            {senderName}
          </span>
        )}

        <div
          data-chat-content
          className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
            isOwnMessage ? 'rounded-br-sm' : 'rounded-bl-sm'
          }`}
          style={isWhatsApp ? undefined :
            isOwnMessage
              ? { background: 'var(--accent)', color: '#ffffff' }
              : { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
          }
        >
          {content}
        </div>

        <span className={isWhatsApp ? 'ticket-chat-whatsapp-time' : 'mt-1 px-1 text-[10px]'} style={isWhatsApp ? undefined : { color: 'var(--text-muted)' }}>
          {formatTime(createdAt)}
        </span>
      </div>
    </div>
  );
}
