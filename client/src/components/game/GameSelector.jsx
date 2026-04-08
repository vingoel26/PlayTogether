import { useRoom } from '../../contexts/RoomContext.jsx';
import { useSocket } from '../../hooks/useSocket.js';

export default function GameSelector({ onStart }) {
  const { hostId } = useRoom();
  const { socket } = useSocket();
  const isHost = hostId === socket?.id;

  const games = [
    { id: 'tictactoe', name: 'Tic Tac Toe', icon: 'grid_3x3', desc: 'Classic 3x3 strategy game. Get three in a row to win!' },
    { id: 'memory', name: 'Memory Match', icon: 'style', desc: 'Find all the matching emoji pairs. The player with the most pairs wins!' },
    { id: 'quickmath', name: 'Quick Math', icon: 'calculate', desc: 'Race to answer math questions! Faster answers earn more points.' },
    { id: 'rps', name: 'Rock Paper Scissors', icon: 'gesture', desc: 'Best of 5! Pick rock, paper, or scissors — choices reveal simultaneously.' },
    { id: 'wordscramble', name: 'Word Scramble', icon: 'spellcheck', desc: 'Unscramble the letters to find the hidden word. Use hints if you get stuck!' }
  ];

  return (
    <div style={{
      padding: 24, display: 'flex', flexDirection: 'column', gap: 24, height: '100%'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <h2 style={{ margin: '0 0 8px 0', color: 'var(--color-text-on-dark)' }}>Mini Games</h2>
        <p style={{ margin: 0, color: 'var(--color-text-on-dark-dim)', fontSize: 14 }}>
          {isHost ? 'Select a game to play with the room!' : 'Waiting for the host to select a game...'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {games.map(game => (
          <div key={game.id} style={{
            background: 'var(--color-video-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            opacity: isHost ? 1 : 0.6,
            transition: 'transform 0.2s ease, border-color 0.2s ease',
          }}>
            <div style={{
               width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.05)',
               display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--color-blue)' }}>{game.icon}</span>
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: 16, color: 'var(--color-text-on-dark)' }}>{game.name}</h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-on-dark-dim)', lineHeight: 1.4 }}>
                {game.desc}
              </p>
            </div>

            {isHost && (
              <button
                onClick={() => onStart(game.id)}
                style={{
                  padding: '8px 24px', borderRadius: 'var(--radius-pill)',
                  background: 'var(--color-blue)', color: 'white', border: 'none',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Play
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
