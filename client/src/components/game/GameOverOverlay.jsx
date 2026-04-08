import { useSocket } from '../../hooks/useSocket.js';

/**
 * GameOverOverlay — Shared game-complete overlay for all game boards
 * Shows winner, final scores, and rematch/exit buttons
 * Animates in with scale + opacity
 */
export default function GameOverOverlay({ players, scores, winnerId, isHost, onReset, onExit }) {
  const { socket } = useSocket();
  const myId = socket?.id;

  let resultText = '';
  let resultEmoji = '🏆';
  if (winnerId === 'draw') {
    resultText = "It's a draw!";
    resultEmoji = '🤝';
  } else {
    const winner = players.find(p => p.id === winnerId);
    if (winnerId === myId) {
      resultText = 'You won!';
      resultEmoji = '🎉';
    } else {
      resultText = `${winner?.displayName} wins!`;
    }
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
      zIndex: 20, color: 'var(--color-text-on-dark)',
      animation: 'overlayIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      <style>{`
        @keyframes overlayIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <span style={{ fontSize: 56 }}>{resultEmoji}</span>
      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>{resultText}</h2>

      {/* Final Scores */}
      <div style={{
        display: 'flex', gap: 24, fontSize: 14, color: 'var(--color-text-on-dark-dim)',
      }}>
        {players.map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontWeight: p.id === winnerId ? 600 : 400,
            color: p.id === winnerId ? 'var(--color-text-on-dark)' : 'var(--color-text-on-dark-dim)',
          }}>
            <span>{p.id === myId ? 'You' : p.displayName}</span>
            <span style={{
              background: 'rgba(255,255,255,0.1)', borderRadius: 4,
              padding: '2px 10px', fontWeight: 700, color: 'white',
            }}>
              {scores?.[p.id] || 0}
            </span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        {isHost && (
          <button
            onClick={onReset}
            style={{
              padding: '10px 28px', borderRadius: 'var(--radius-pill)',
              background: 'var(--color-blue)', color: 'white', border: 'none',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-blue-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-blue)'}
          >
            🔄 Rematch
          </button>
        )}
        {onExit && (
          <button
            onClick={onExit}
            style={{
              padding: '10px 28px', borderRadius: 'var(--radius-pill)',
              background: 'rgba(255,255,255,0.08)', color: 'var(--color-text-on-dark-dim)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            Exit Game
          </button>
        )}
      </div>
    </div>
  );
}
