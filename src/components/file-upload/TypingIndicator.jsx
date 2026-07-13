import React from 'react';

/**
 * Small animated "someone is typing" row. Purely presentational —
 * driven by whatever real-time source the caller wires up
 * (see chatService.subscribeToTyping).
 */
export default function TypingIndicator({ typingUserName }) {
  if (!typingUserName) return null;

  return (
    <div className="flex items-center gap-2 px-1 py-1" aria-live="polite">
      <div
        className="flex items-center gap-1 rounded-2xl rounded-bl-sm px-3 py-2"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full"
            style={{
              background: 'var(--text-muted)',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {typingUserName} در حال تایپ است...
      </span>
    </div>
  );
}
