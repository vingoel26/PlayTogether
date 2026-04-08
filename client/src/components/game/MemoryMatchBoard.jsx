import { useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket.js';
import { useRoom } from '../../contexts/RoomContext.jsx';
import ScoreHeader from './ScoreHeader.jsx';
import GameOverOverlay from './GameOverOverlay.jsx';

/**
 * MemoryMatchBoard — Interactive card flipping game
 * 4x4 Grid of randomized Emojis
 */
export default function MemoryMatchBoard({ gameState, onMove, onStart, onReset, onExit }) {
  const { socket } = useSocket();
  const { hostId } = useRoom();
  const myId = socket?.id;
  const isHost = myId === hostId;

  // Pre-game placeholder handled by GameSelector now
  if (!gameState || gameState.state === 'lobby') return null;

  const { board, currentPlayerId, players, winnerId, scores, state, isWaitingForClear } = gameState;
  const isMyTurn = currentPlayerId === myId;
  const isPlayer = players.some(p => p.id === myId);
  const isComplete = state === 'complete';

  // Automatically send clear_flips if we are the current player and the server says we're waiting
  useEffect(() => {
    if (isWaitingForClear && isMyTurn) {
        const timer = setTimeout(() => {
            onMove({ action: 'clear_flips' });
        }, 1200);
        return () => clearTimeout(timer);
    }
  }, [isWaitingForClear, isMyTurn, onMove]);

  // Turn indicator
  let turnText = '';
  if (!isComplete) {
    turnText = isWaitingForClear
      ? 'No match...'
      : isPlayer
          ? (isMyTurn ? "Your turn! Pick two cards." : "Opponent is picking...")
          : `${players.find(p => p.id === currentPlayerId)?.displayName}'s turn`;
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
      color: 'var(--color-text-on-dark)', padding: 16,
      position: 'relative',
    }}>
      
      {/* Shared Score Header */}
      <ScoreHeader
        players={players}
        scores={scores}
        currentPlayerId={currentPlayerId}
      />

      {/* Turn Indicator */}
      {!isComplete && (
        <div style={{
          fontSize: 15, fontWeight: 500, minHeight: 24,
          color: isWaitingForClear ? 'var(--color-red)' : 'white',
        }}>
          {turnText}
        </div>
      )}

      {/* 4x4 Card Grid */}
      <section aria-label="Memory Match game board" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: 8,
        width: 'min(320px, 55vh, 80vw)',
        height: 'min(320px, 55vh, 80vw)',
        aspectRatio: '1',
      }}>
        {board.map((card, index) => {
          const isFlipped = card !== null;
          const canClick = !isComplete && isMyTurn && isPlayer && !isFlipped && !isWaitingForClear;
          
          return (
            <button
              key={index}
              onClick={() => canClick && onMove({ cardIndex: index })}
              disabled={!canClick}
              aria-label={card ? `Card ${index + 1}, ${card}` : `Card ${index + 1}, face down`}
              className={canClick ? 'hover:-translate-y-1 transition-transform duration-150 hover:shadow-lg' : ''}
              style={{
                perspective: '1000px',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: canClick ? 'pointer' : 'default',
              }}
            >
              <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transition: 'transform 0.6s var(--ease-standard)',
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}>
                {/* Back of card */}
                <div style={{
                  position: 'absolute', width: '100%', height: '100%',
                  background: 'var(--color-blue)', borderRadius: 8,
                  border: '2px solid rgba(255,255,255,0.1)',
                  backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span className="material-symbols-outlined" style={{ color: 'rgba(255,255,255,0.3)'}}>help</span>
                </div>
                
                {/* Front of card (Emoji) */}
                <div style={{
                  position: 'absolute', width: '100%', height: '100%',
                  background: '#3C4043', borderRadius: 8,
                  backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}>
                  {card}
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {/* Shared Game Over Overlay */}
      {isComplete && (
        <GameOverOverlay
          players={players}
          scores={scores}
          winnerId={winnerId}
          isHost={isHost}
          onReset={onReset}
          onExit={onExit}
        />
      )}
    </div>
  );
}
