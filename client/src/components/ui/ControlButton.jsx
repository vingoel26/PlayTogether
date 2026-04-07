import { useState } from 'react';
import Tooltip from './Tooltip.jsx';

/**
 * ControlButton — 48px (center) or 40px (side) circular icon button
 * White icon on dark surface, ripple on press, color fill when active
 */
export default function ControlButton({
  icon,
  label,
  onClick,
  active = false,
  activeColor = 'var(--color-red)',
  activeIcon,
  size = 48,
  disabled = false,
  className = '',
}) {
  const [pressed, setPressed] = useState(false);

  const bgColor = active
    ? activeColor
    : pressed
      ? 'rgba(255,255,255,0.12)'
      : 'transparent';

  return (
    <Tooltip text={label}>
      <button
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: 'none',
          background: bgColor,
          color: 'var(--color-text-on-dark)',
          cursor: disabled ? 'default' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: `background ${pressed ? '0ms' : '150ms'} ease, transform 100ms ease`,
          transform: pressed ? 'scale(0.94)' : 'scale(1)',
          opacity: disabled ? 0.38 : 1,
          position: 'relative',
          overflow: 'hidden',
        }}
        className={className}
      >
        <span className="material-symbols-outlined" style={{ fontSize: size === 48 ? 24 : 20 }}>
          {active && activeIcon ? activeIcon : icon}
        </span>
      </button>
    </Tooltip>
  );
}
