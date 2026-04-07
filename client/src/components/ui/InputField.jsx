import { useState } from 'react';

/**
 * InputField — 40px height, 4px radius, 1px border
 * Focus: 2px Google Blue. Error: 2px red + error message below.
 */
export default function InputField({
  value,
  onChange,
  placeholder = '',
  error = '',
  disabled = false,
  type = 'text',
  maxLength,
  icon,
  style = {},
  inputStyle = {},
  onKeyDown,
  id,
  autoFocus = false,
}) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? 'var(--color-red)'
    : focused
      ? 'var(--color-blue)'
      : 'var(--color-border)';
  const borderWidth = focused || error ? 2 : 1;

  return (
    <div style={{ width: '100%', ...style }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 40,
          borderRadius: 'var(--radius-input)',
          border: `${borderWidth}px solid ${borderColor}`,
          background: 'var(--color-surface-white)',
          padding: `0 ${icon ? 8 : 12}px`,
          gap: 8,
          transition: 'border-color 150ms ease',
        }}
      >
        {icon && (
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-text-secondary)' }}>
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            lineHeight: '20px',
            color: 'var(--color-text-primary)',
            width: '100%',
            ...inputStyle,
          }}
        />
      </div>
      {error && (
        <div style={{
          fontSize: 12,
          color: 'var(--color-red)',
          marginTop: 4,
          paddingLeft: 12,
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
