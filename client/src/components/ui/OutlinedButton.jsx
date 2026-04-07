import { useState } from 'react';

/**
 * OutlinedButton — 40px pill, 1px blue border, blue text, transparent bg
 */
export default function OutlinedButton({
  children,
  onClick,
  icon,
  disabled = false,
  fullWidth = false,
  style = {},
  className = '',
}) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => { setPressed(false); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      style={{
        height: 40,
        minWidth: 80,
        width: fullWidth ? '100%' : 'auto',
        padding: '0 16px',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid var(--color-blue)',
        background: hovered ? 'var(--color-blue-light)' : 'transparent',
        color: 'var(--color-blue)',
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
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}
