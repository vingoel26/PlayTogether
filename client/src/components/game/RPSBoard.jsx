import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../hooks/useSocket.js';
import { useRoom } from '../../contexts/RoomContext.jsx';
import Avatar from '../ui/Avatar.jsx';

const CHOICE_EMOJI = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️',
};

const CHOICE_LABELS = {
  rock: 'Rock',
  paper: 'Paper',
  scissors: 'Scissors',
};

/**
 * RPSBoard — Rock Paper Scissors game board
 * Simultaneous choice, reveal, best-of-5
 */
export default function RPSBoard({ gameState, onMove, onStart, onReset }) {
  const { socket } = useSocket();
  const { hostId } = useRoom();
  const myId = socket?.id;
  const isHost = myId === hostId;
  const [showReveal, setShowReveal] = useState(false);

  // Pre-game
  if (!gameState || gameState.state === 'lobby') {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 24,
        color: 'var(--color-text-on-dark)',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 64, opacity: 0.4 }}>gesture</span>
        <h3 style={{ margin: 0 }}>Rock Paper Scissors</h3>
        <p style={{ color: 'var(--color-text-on-dark-dim)', fontSize: 13, textAlign: 'center', maxWidth: 240 }}>
          {isHost
            ? 'Best of 5 rounds! Click below to start.'
            : 'Waiting for the host to start the game...'}
        </p>
        {isHost && (
          <button
            onClick={() => onStart('rps')}
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

  const {
    phase, roundNumber, totalRounds, roundWinnerId,
    playerChoices, roundHistory, players, scores, state, winnerId
  } = gameState;

  const isComplete = state === 'complete';
  const isPlayer = players.some(p => p.id === myId);
  const myChoice = playerChoices?.[myId];
  const hasSubmitted = myChoice === 'submitted' || (phase === 'reveal' && myChoice);
  const opponent = players.find(p => p.id !== myId);

  // Trigger reveal animation
  useEffect(() => {
    if (phase === 'reveal') {
      setShowReveal(false);
      const timer = setTimeout(() => setShowReveal(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowReveal(false);
    }
  }, [phase, roundNumber]);

  const handleChoice = useCallback((choice) => {
    if (!isPlayer || hasSubmitted || phase !== 'choosing') return;
    onMove({ choice });
  }, [isPlayer, hasSubmitted, phase, onMove]);

  const handleNextRound = useCallback(() => {
    onMove({ action: 'next_round' });
  }, [onMove]);

  // Result text for current round
  let roundResultText = '';
  if (phase === 'reveal' && roundWinnerId) {
    if (roundWinnerId === 'draw') roundResultText = "It's a draw!";
    else if (roundWinnerId === myId) roundResultText = 'You win this round! 🎉';
    else roundResultText = `${opponent?.displayName} wins this round!`;
  }

  // Game over result
  let gameResultText = '';
  if (isComplete) {
    if (winnerId === 'draw') gameResultText = "It's a draw!";
    else if (winnerId === myId) gameResultText = 'You won the match! 🎉';
    else gameResultText = `${players.find(p => p.id === winnerId)?.displayName} wins the match!`;
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
      color: 'var(--color-text-on-dark)', padding: 16,
    }}>

      {/* Player Score Bar */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'center', fontSize: 14 }}>
        {players.map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Avatar name={p.displayName} id={p.id} size={28} />
            <span style={{ fontWeight: 500 }}>{p.id === myId ? 'You' : p.displayName}</span>
            <span style={{
              background: 'rgba(255,255,255,0.1)', color: 'white',
              borderRadius: 4, padding: '2px 10px', fontSize: 13, fontWeight: 700,
            }}>
              {scores[p.id] || 0}
            </span>
          </div>
        ))}
      </div>

      {/* Round Indicator */}
      <div style={{ fontSize: 13, color: 'var(--color-text-on-dark-dim)' }}>
        Round {roundNumber}/{totalRounds} — Best of {totalRounds}
      </div>

      {isComplete ? (
        /* Game Over */
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 20, marginTop: 8,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#9C27B0' }}>emoji_events</span>
          <h2 style={{ margin: 0, fontSize: 24 }}>{gameResultText}</h2>
          <div style={{ fontSize: 14, color: 'var(--color-text-on-dark-dim)' }}>
            Final: {players.map(p => `${p.displayName}: ${scores[p.id] || 0}`).join(' • ')}
          </div>

          {/* Round History */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {roundHistory.map((rh, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '6px 12px',
                fontSize: 12, display: 'flex', gap: 6, alignItems: 'center',
              }}>
                <span>R{rh.round}</span>
                <span>{CHOICE_EMOJI[rh.choices[players[0].id]]}</span>
                <span style={{ color: 'var(--color-text-on-dark-dim)' }}>vs</span>
                <span>{CHOICE_EMOJI[rh.choices[players[1].id]]}</span>
              </div>
            ))}
          </div>

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
        </div>
      ) : phase === 'reveal' ? (
        /* Reveal Phase */
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        }}>
          {/* Versus Display */}
          <div style={{
            display: 'flex', gap: 40, alignItems: 'center', justifyContent: 'center',
          }}>
            {players.map(p => (
              <div key={p.id} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                transform: showReveal ? 'scale(1)' : 'scale(0.5)',
                opacity: showReveal ? 1 : 0,
                transition: 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}>
                <div style={{
                  fontSize: 64, lineHeight: 1,
                  filter: roundWinnerId === p.id ? 'drop-shadow(0 0 12px rgba(255,255,255,0.4))' : 'none',
                }}>
                  {CHOICE_EMOJI[playerChoices[p.id]]}
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 500,
                  color: roundWinnerId === p.id ? '#0F9D58' : 'var(--color-text-on-dark-dim)',
                }}>
                  {p.id === myId ? 'You' : p.displayName}
                </span>
              </div>
            ))}
          </div>

          {/* Round Result */}
          <div style={{
            fontSize: 16, fontWeight: 600,
            color: roundWinnerId === myId ? '#0F9D58' : roundWinnerId === 'draw' ? '#F29900' : '#D93025',
          }}>
            {roundResultText}
          </div>

          {/* Next Round / Continue */}
          {!isComplete && isHost && (
            <button
              onClick={handleNextRound}
              style={{
                padding: '10px 24px', borderRadius: 'var(--radius-pill)',
                background: 'var(--color-blue)', color: 'white', border: 'none',
                fontSize: 14, fontWeight: 500, cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-blue-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--color-blue)'}
            >
              Next Round →
            </button>
          )}
          {!isComplete && !isHost && (
            <div style={{ fontSize: 13, color: 'var(--color-text-on-dark-dim)' }}>
              Waiting for host to continue...
            </div>
          )}
        </div>
      ) : (
        /* Choosing Phase */
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
        }}>
          <div style={{ fontSize: 15, fontWeight: 500, minHeight: 20 }}>
            {hasSubmitted
              ? '⏳ Waiting for opponent...'
              : isPlayer
                ? 'Make your choice!'
                : 'Spectating...'}
          </div>

          {/* Opponent status */}
          {isPlayer && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
              color: 'var(--color-text-on-dark-dim)',
            }}>
              <Avatar name={opponent?.displayName} id={opponent?.id} size={24} />
              <span>
                {playerChoices?.[opponent?.id] === 'submitted'
                  ? '✅ Ready!'
                  : '🤔 Choosing...'}
              </span>
            </div>
          )}

          {/* Choice Buttons */}
          <div style={{ display: 'flex', gap: 16 }}>
            {['rock', 'paper', 'scissors'].map(choice => {
              const isSelected = (phase === 'choosing' && myChoice === 'submitted') ||
                (typeof myChoice === 'string' && myChoice !== 'submitted');
              // We can't know which one was selected in 'choosing' since server hides it
              // But we track it locally
              return (
                <button
                  key={choice}
                  onClick={() => handleChoice(choice)}
                  disabled={hasSubmitted || !isPlayer}
                  style={{
                    width: 100, height: 110, borderRadius: 16,
                    background: hasSubmitted ? 'rgba(255,255,255,0.05)' : 'var(--color-control-bar)',
                    border: '2px solid transparent',
                    color: 'white', cursor: hasSubmitted || !isPlayer ? 'default' : 'pointer',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 150ms ease',
                    opacity: hasSubmitted ? 0.5 : 1,
                  }}
                  onMouseEnter={e => {
                    if (!hasSubmitted && isPlayer) {
                      e.currentTarget.style.background = '#4A4E51';
                      e.currentTarget.style.borderColor = 'var(--color-blue)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!hasSubmitted && isPlayer) {
                      e.currentTarget.style.background = 'var(--color-control-bar)';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <span style={{ fontSize: 36, lineHeight: 1 }}>{CHOICE_EMOJI[choice]}</span>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{CHOICE_LABELS[choice]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
