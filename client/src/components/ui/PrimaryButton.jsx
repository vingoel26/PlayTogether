import { useState } from 'react';

/**
 * PrimaryButton — 48px pill, min-width 120px, Google Blue
 * Full-width variant, optional leading icon
 */
export default function PrimaryButton({
  children,
  onClick,
  icon,
  disabled = false,
  fullWidth = false,
  danger = false,
  style = {}, 
  className = '',
}) {
  const [pressed, setPressed] = useState(false);

  const bg = danger ? 'var(--color-red)' : 'var(--color-blue)';
  const bgHover = danger ? 'var(--color-red-hover)' : 'var(--color-blue-hover)';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        height: 48,
        minWidth: 120,
        width: fullWidth ? '100%' : 'auto',
        padding: '0 24px',
        borderRadius: 'var(--radius-pill)',
        border: 'none',
        background: bg,
        color: 'var(--color-text-on-dark)',
        fontFamily: 'var(--font-sans)',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
        cursor: disabled ? 'default' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'background 150ms ease, transform 100ms ease',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        opacity: disabled ? 0.38 : 1,
        ...style,
      }}
      className={className}
    >
      {icon && (
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}
