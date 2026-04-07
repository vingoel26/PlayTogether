import { useParams } from 'react-router-dom';

/**
 * PreJoinScreen — Placeholder for Step A4
 * Shows the room code and a simple message for now
 */
export default function PreJoinScreen() {
  const { roomCode } = useParams();

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--color-video-surface)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-on-dark)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 16 }}>
        Pre-Join Screen
      </h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-on-dark-dim)' }}>
        Room: <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{roomCode}</span>
      </p>
      <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 8 }}>
        (Full implementation in Step A4)
      </p>
    </div>
  );
}
