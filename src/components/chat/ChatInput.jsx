import React, { useRef } from 'react';

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MAX_LENGTH = 2000;

/**
 * Controlled message composer. Auto-grows up to a max height,
 * submits on Enter (Shift+Enter for newline), and disables itself
 * while a send is in flight.
 */
export default function ChatInput({ value, onChange, onSubmit, isSending, disabled }) {
  const textareaRef = useRef(null);

  const handleInput = (e) => {
    const el = textareaRef.current;
    onChange(e.target.value);
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isSending || disabled) return;
    onSubmit(trimmed);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const isDisabled = disabled || isSending;

  return (
    <div
      className="flex items-end gap-2 p-3"
      style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        rows={1}
        maxLength={MAX_LENGTH}
        placeholder="پیام خود را بنویسید..."
        className="max-h-[120px] min-h-[40px] flex-1 resize-none rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors disabled:opacity-60"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
        }}
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isDisabled || !value.trim()}
        aria-label="Send message"
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-transform disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:scale-105 enabled:active:scale-95"
        style={{ background: 'var(--accent)', color: '#ffffff' }}
      >
        {isSending ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : (
          <SendIcon />
        )}
      </button>
    </div>
  );
}
