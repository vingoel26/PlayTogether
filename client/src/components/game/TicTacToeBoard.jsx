import { useSocket } from '../../hooks/useSocket.js';
import { useRoom } from '../../contexts/RoomContext.jsx';
import Avatar from '../ui/Avatar.jsx';

/**
 * TicTacToeBoard — Interactive 3×3 Tic Tac Toe game board
 * Renders inside the HubPanel when a game is active
 */
export default function TicTacToeBoard({ gameState, onMove, onStart, onReset }) {
  const { socket } = useSocket();
  const { hostId } = useRoom();
  const myId = socket?.id;
  const isHost = myId === hostId;

  // Pre-game: show "Start Game" button for host
  if (!gameState || gameState.state === 'lobby') {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 24,
        color: 'var(--color-text-on-dark)',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 64, opacity: 0.4 }}>grid_3x3</span>
        <h3 style={{ margin: 0 }}>Tic Tac Toe</h3>
        <p style={{ color: 'var(--color-text-on-dark-dim)', fontSize: 13, textAlign: 'center', maxWidth: 240 }}>
          {isHost
            ? 'Click below to start the game. The first two participants will play!'
            : 'Waiting for the host to start the game...'}
        </p>
        {isHost && (
          <button
            onClick={() => onStart('tictactoe')}
            style={{
              padding: '12px 32px', borderRadius: 'var(--radius-pill)',
              background: 'var(--color-blue)', color: 'white', border: 'none',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-blue-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-blue)'}
          >
            Start Game
          </button>
        )}
      </div>
    );
  }

  const { board, currentPlayerId, marks, players, winnerId, scores, state } = gameState;
  const myMark = marks?.[myId];
  const isMyTurn = currentPlayerId === myId;
  const isPlayer = !!myMark;
  const isComplete = state === 'complete';

  // Determine winner display name
  let resultText = '';
  if (isComplete) {
    if (winnerId === 'draw') {
      resultText = "It's a draw!";
    } else {
      const winner = players.find(p => p.id === winnerId);
      resultText = winnerId === myId ? 'You won! 🎉' : `${winner?.displayName} wins!`;
    }
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
      color: 'var(--color-text-on-dark)', padding: 16,
    }}>
      
      {/* Player Info Bar */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', fontSize: 14 }}>
        {players.map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            opacity: isComplete ? 1 : (currentPlayerId === p.id ? 1 : 0.5),
            transition: 'opacity 200ms ease',
          }}>
            <Avatar name={p.displayName} id={p.id} size={28} />
            <span style={{ fontWeight: 500 }}>{p.id === myId ? 'You' : p.displayName}</span>
            <span style={{
              background: marks[p.id] === 'X' ? 'var(--color-blue)' : 'var(--color-red)',
              color: 'white', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600,
            }}>
              {marks[p.id]}
            </span>
            <span style={{ color: 'var(--color-text-on-dark-dim)', fontSize: 12 }}>
              Score: {scores[p.id] || 0}
            </span>
          </div>
        ))}
      </div>

      {/* Turn / Result Indicator */}
      <div style={{ fontSize: 15, fontWeight: 500, minHeight: 24 }}>
        {isComplete
          ? resultText
          : isPlayer
            ? (isMyTurn ? "Your turn!" : "Opponent's turn...")
            : `${players.find(p => p.id === currentPlayerId)?.displayName}'s turn`
        }
      </div>

      {/* The Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: 6,
        width: 'min(280px, 80vw)',
        height: 'min(280px, 80vw)',
        aspectRatio: '1',
      }}>
        {board.map((cell, index) => {
          const canClick = !isComplete && isMyTurn && isPlayer && cell === null;
          return (
            <button
              key={index}
              onClick={() => canClick && onMove({ cellIndex: index })}
              disabled={!canClick}
              style={{
                background: cell ? '#3C4043' : '#2D2E31',
                border: '2px solid var(--color-control-bar)',
                borderRadius: 8,
                cursor: canClick ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 40,
                fontWeight: 700,
                color: cell === 'X' ? '#8AB4F8' : cell === 'O' ? '#F28B82' : 'transparent',
                transition: 'background 120ms ease, transform 100ms ease',
                transform: cell ? 'scale(1)' : 'scale(1)',
              }}
              onMouseEnter={e => { if (canClick) e.currentTarget.style.background = '#4A4E51'; }}
              onMouseLeave={e => { if (canClick) e.currentTarget.style.background = '#2D2E31'; }}
            >
              {cell || '·'}
            </button>
          );
        })}
      </div>

      {/* Rematch Button (host only, shown after game ends) */}
      {isComplete && isHost && (
        <button
          onClick={onReset}
          style={{
            padding: '10px 28px', borderRadius: 'var(--radius-pill)',
            background: 'var(--color-blue)', color: 'white', border: 'none',
            fontSize: 14, fontWeight: 500, cursor: 'pointer', marginTop: 8,
            transition: 'background 150ms ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-blue-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--color-blue)'}
        >
          🔄 Rematch
        </button>
      )}
    </div>
  );
}
