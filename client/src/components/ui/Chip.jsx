/**
 * Chip — 24px height, 12px border-radius, optional icon
 * Used for: speaking, SYNC, player count, difficulty, round indicators
 */
export default function Chip({
  children,
  icon,
  color = 'var(--color-text-secondary)',
  bg = 'var(--color-surface-light)',
  selected = false,
  selectedColor = 'var(--color-text-on-dark)',
  selectedBg = 'var(--color-blue)',
  onClick,
  disabled = false,
  style = {},
}) {
  const isClickable = !!onClick;

  return (
    <span
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 24,
        padding: '0 8px',
        borderRadius: 'var(--radius-chip)',
        background: selected ? selectedBg : bg,
        color: selected ? selectedColor : color,
        fontSize: 12,
        fontWeight: 500,
        fontFamily: 'var(--font-sans)',
        lineHeight: '16px',
        cursor: isClickable && !disabled ? 'pointer' : 'default',
        opacity: disabled ? 0.38 : 1,
        userSelect: 'none',
        whiteSpace: 'nowrap',
        transition: 'background 150ms ease, color 150ms ease',
        ...style,
      }}
    >
      {icon && (
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
