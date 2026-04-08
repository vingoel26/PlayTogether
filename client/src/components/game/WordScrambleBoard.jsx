import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../../hooks/useSocket.js';
import { useRoom } from '../../contexts/RoomContext.jsx';
import Avatar from '../ui/Avatar.jsx';

/**
 * WordScrambleBoard — Unscramble the word game board
 * Type your guess, use hints (private, with penalty), race against time
 */
export default function WordScrambleBoard({ gameState, onMove, onStart, onReset }) {
  const { socket } = useSocket();
  const { hostId } = useRoom();
  const myId = socket?.id;
  const isHost = myId === hostId;

  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState(null); // 'wrong' | null
  const [timeLeft, setTimeLeft] = useState(100);
  const [prevRound, setPrevRound] = useState(0);
  const timeoutSentRef = useRef(false);

  // Pre-game
  if (!gameState || gameState.state === 'lobby') {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 24,
        color: 'var(--color-text-on-dark)',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 64, opacity: 0.4 }}>spellcheck</span>
        <h3 style={{ margin: 0 }}>Word Scramble</h3>
        <p style={{ color: 'var(--color-text-on-dark-dim)', fontSize: 13, textAlign: 'center', maxWidth: 240 }}>
          {isHost
            ? 'Unscramble words as fast as you can! Click below to start.'
            : 'Waiting for the host to start the game...'}
        </p>
        {isHost && (
          <button
            onClick={() => onStart('wordscramble')}
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
    scrambledWord, wordLength, playerHints, playerHintLetters, maxHints, hintPenalty,
    roundNumber, totalRounds, roundStartTime, roundTimeLimit,
    roundResult, roundTimedOut, answer, players, scores, state, winnerId
  } = gameState;

  const isComplete = state === 'complete';
  const isPlayer = players.some(p => p.id === myId);
  const showResult = !!roundResult || roundTimedOut;

  // My personal hints (only I can see these)
  const myHints = playerHints?.[myId] || [];
  const myHintsUsed = myHints.length;

  // My hint letters from the server (private to me)
  const myHintLetters = playerHintLetters?.[myId] || [];

  // Reset state when round changes
  useEffect(() => {
    if (roundNumber !== prevRound) {
      setGuess('');
      setFeedback(null);
      setPrevRound(roundNumber);
      timeoutSentRef.current = false;
    }
  }, [roundNumber, prevRound]);

  // Countdown timer + auto-timeout
  useEffect(() => {
    if (isComplete || !roundStartTime || !roundTimeLimit || roundTimedOut) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - roundStartTime;
      const remaining = Math.max(0, 100 * (1 - elapsed / roundTimeLimit));
      setTimeLeft(remaining);

      // If time's up, send timeout
      if (remaining <= 0 && !timeoutSentRef.current) {
        timeoutSentRef.current = true;
        onMove({ action: 'timeout' });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [roundStartTime, roundTimeLimit, isComplete, roundTimedOut, onMove]);

  // Auto-advance after timeout (show answer for 3 seconds, then move on)
  useEffect(() => {
    if (roundTimedOut && !isComplete) {
      const timer = setTimeout(() => {
        onMove({ action: 'next_after_timeout' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [roundTimedOut, isComplete, onMove]);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    if (!guess.trim() || !isPlayer || showResult) return;
    onMove({ guess: guess.trim() });
    setFeedback('wrong');
    setTimeout(() => setFeedback(null), 1200);
    setGuess('');
  }, [guess, isPlayer, showResult, onMove]);

  const handleHint = useCallback(() => {
    onMove({ action: 'hint' });
  }, [onMove]);



  // Timer bar color
  const timerColor = timeLeft > 60 ? '#0F9D58' : timeLeft > 30 ? '#F29900' : '#D93025';

  // Game over result
  let resultText = '';
  if (isComplete) {
    if (winnerId === 'draw') resultText = "It's a draw!";
    else {
      const winner = players.find(p => p.id === winnerId);
      resultText = winnerId === myId ? 'You won! 🎉' : `${winner?.displayName} wins!`;
    }
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      color: 'var(--color-text-on-dark)', padding: 16,
    }}>

      {/* Player Score Bar */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'center', fontSize: 14 }}>
        {players.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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

      {isComplete ? (
        /* Game Over */
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginTop: 16,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#0F9D58' }}>emoji_events</span>
          <h2 style={{ margin: 0, fontSize: 24 }}>{resultText}</h2>
          <div style={{ fontSize: 14, color: 'var(--color-text-on-dark-dim)' }}>
            Final: {players.map(p => `${p.displayName}: ${scores[p.id] || 0}`).join(' • ')}
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
      ) : (
        /* Active Game */
        <>
          {/* Round Counter */}
          <div style={{ fontSize: 13, color: 'var(--color-text-on-dark-dim)' }}>
            Round {roundNumber}/{totalRounds}
          </div>

          {/* Timer Bar */}
          <div style={{
            width: '80%', maxWidth: 320, height: 6, borderRadius: 3,
            background: 'rgba(255,255,255,0.1)', overflow: 'hidden',
          }}>
            <div style={{
              width: `${roundTimedOut ? 0 : timeLeft}%`, height: '100%',
              background: timerColor, borderRadius: 3,
              transition: 'width 100ms linear, background 300ms ease',
            }} />
          </div>

          {/* Scrambled Word Display */}
          <div style={{
            display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            {(scrambledWord || '').split('').map((ch, i) => (
              <div key={i} style={{
                width: 44, height: 52, borderRadius: 8,
                background: 'var(--color-control-bar)',
                border: '2px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700, textTransform: 'uppercase',
                fontFamily: 'monospace', color: 'white',
              }}>
                {ch}
              </div>
            ))}
          </div>

          {/* My Private Hint Display (only my hints) */}
          {myHintsUsed > 0 && !showResult && (
            <div style={{
              display: 'flex', gap: 6, alignItems: 'center', fontSize: 14,
              color: 'var(--color-text-on-dark-dim)',
            }}>
              <span style={{ fontSize: 12 }}>Your hints:</span>
              {myHintLetters.map((ch, i) => (
                <span key={i} style={{
                  width: 24, height: 28, borderRadius: 4,
                  background: ch ? 'rgba(15, 157, 88, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: ch ? '1px solid #0F9D58' : '1px solid rgba(255,255,255,0.1)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 600, textTransform: 'uppercase',
                  fontFamily: 'monospace', color: ch ? '#0F9D58' : 'transparent',
                }}>
                  {ch || '_'}
                </span>
              ))}
              <span style={{ fontSize: 11, color: '#F29900', marginLeft: 4 }}>
                (-{myHintsUsed * hintPenalty} pts)
              </span>
            </div>
          )}

          {/* Timeout / Round Result */}
          {roundTimedOut && !roundResult?.winnerId && (
            <div style={{
              fontSize: 15, fontWeight: 600, padding: '10px 20px', borderRadius: 8,
              background: 'rgba(217, 48, 37, 0.15)', color: '#F28B82',
              textAlign: 'center',
            }}>
              ⏰ Time's up! The word was "<strong>{answer}</strong>"
            </div>
          )}

          {showResult && roundResult?.winnerId && (
            <div style={{
              fontSize: 14, fontWeight: 500, padding: '8px 16px', borderRadius: 8,
              background: 'rgba(15, 157, 88, 0.15)', color: '#0F9D58',
            }}>
              {roundResult.winnerId === myId ? 'You' : players.find(p => p.id === roundResult.winnerId)?.displayName} got it! 
              The word was "{answer}" (+{roundResult.pointsAwarded})
              {roundResult.hintsUsed > 0 && <span style={{ color: '#F29900' }}> (hint penalty applied)</span>}
            </div>
          )}



          {/* Wrong Guess Feedback */}
          {feedback === 'wrong' && !showResult && (
            <div style={{
              fontSize: 13, color: '#D93025', fontWeight: 500,
              animation: 'shake 300ms ease',
            }}>
              ❌ Not quite, try again!
            </div>
          )}

          {/* Guess Input */}
          {!showResult && isPlayer && (
            <form onSubmit={handleSubmit} style={{
              display: 'flex', gap: 8, width: '80%', maxWidth: 320,
            }}>
              <input
                type="text"
                value={guess}
                onChange={e => setGuess(e.target.value)}
                placeholder="Type your guess..."
                autoFocus
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-pill)',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white', fontSize: 14, outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                disabled={!guess.trim()}
                style={{
                  padding: '10px 20px', borderRadius: 'var(--radius-pill)',
                  background: guess.trim() ? 'var(--color-blue)' : 'rgba(255,255,255,0.05)',
                  color: 'white', border: 'none', fontSize: 14, fontWeight: 500,
                  cursor: guess.trim() ? 'pointer' : 'default',
                  transition: 'background 150ms ease',
                }}
              >
                Go
              </button>
            </form>
          )}

          {/* Hint Button */}
          {!showResult && (
            <div style={{ marginTop: 4 }}>
              <button
                onClick={handleHint}
                disabled={myHintsUsed >= maxHints}
                title={`Each hint costs ${hintPenalty} points`}
                style={{
                  padding: '6px 16px', borderRadius: 'var(--radius-pill)',
                  background: myHintsUsed >= maxHints ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
                  color: myHintsUsed >= maxHints ? 'rgba(255,255,255,0.3)' : 'var(--color-text-on-dark-dim)',
                  border: 'none', fontSize: 12, cursor: myHintsUsed >= maxHints ? 'default' : 'pointer',
                  transition: 'background 150ms ease',
                }}
              >
                💡 Hint ({maxHints - myHintsUsed} left, -{hintPenalty}pts)
              </button>
            </div>
          )}

          <style>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-6px); }
              75% { transform: translateX(6px); }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
