import { getInitials, getAvatarColor } from '../../utils/helpers.js';

/**
 * Avatar — Circle with initials, consistent color per user
 * Sizes: 64 (video tile), 40 (participant list), 32 (score header), 16 (reaction sender)
 */
export default function Avatar({
  name = '',
  id = '',
  size = 40,
  speaking = false,
  online = true,
  style = {},
}) {
  const color = getAvatarColor(id || name);
  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.4);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        fontFamily: 'var(--font-sans)',
        fontSize,
        fontWeight: 500,
        lineHeight: 1,
        userSelect: 'none',
        flexShrink: 0,
        opacity: online ? 1 : 0.5,
        border: speaking ? '2px solid var(--color-green)' : 'none',
        animation: speaking ? 'speakingPulse 1200ms ease-in-out infinite' : 'none',
        ...style,
      }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
