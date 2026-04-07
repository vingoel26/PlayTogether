import { useEffect, useState } from 'react';

/**
 * Snackbar — bottom-center notification
 * #323232 bg, white text, 4px radius, auto-dismiss 4s
 */
export default function Snackbar({
  message,
  action,
  onAction,
  onDismiss,
  duration = 4000,
  visible = true,
}) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        onDismiss?.();
      }, 150);
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 88, // 16px above 72px control bar
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2000,
        maxWidth: 344,
        minWidth: 288,
        minHeight: 48,
        padding: '14px 16px',
        background: 'var(--color-snackbar)',
        color: 'var(--color-text-on-dark)',
        borderRadius: 'var(--radius-snackbar)',
        fontFamily: 'var(--font-sans)',
        fontSize: 14,
        fontWeight: 400,
        lineHeight: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        animation: exiting
          ? 'snackbarOut 150ms ease forwards'
          : 'snackbarIn 250ms var(--ease-standard) forwards',
      }}
    >
      <span>{message}</span>
      {action && (
        <button
          onClick={onAction}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-blue)',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            padding: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}
