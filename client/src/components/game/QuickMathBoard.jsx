import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../hooks/useSocket.js';
import { useRoom } from '../../contexts/RoomContext.jsx';
import ScoreHeader from './ScoreHeader.jsx';
import GameOverOverlay from './GameOverOverlay.jsx';

/**
 * QuickMathBoard — Fast-paced mental arithmetic game board
 * Players race to answer math questions with time-bonus scoring
 */
export default function QuickMathBoard({ gameState, onMove, onStart, onReset, onExit }) {
  const { socket } = useSocket();
  const { hostId } = useRoom();
  const myId = socket?.id;
  const isHost = myId === hostId;

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(100); // percentage
  const [prevRound, setPrevRound] = useState(0);

  // Pre-game state
  if (!gameState || gameState.state === 'lobby') {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 24,
        color: 'var(--color-text-on-dark)',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 64, opacity: 0.4 }}>calculate</span>
        <h3 style={{ margin: 0 }}>Quick Math</h3>
        <p style={{ color: 'var(--color-text-on-dark-dim)', fontSize: 13, textAlign: 'center', maxWidth: 240 }}>
          {isHost
            ? 'Race to answer math questions! Click below to start.'
            : 'Waiting for the host to start the game...'}
        </p>
        {isHost && (
          <button
            onClick={() => onStart('quickmath')}
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
    question, options, correctAnswer, roundNumber, totalRounds,
    roundStartTime, roundTimeLimit, difficulty, roundResult,
    answeredPlayers, players, scores, state, winnerId
  } = gameState;

  const isComplete = state === 'complete';
  const isPlayer = players.some(p => p.id === myId);
  const hasAnswered = answeredPlayers?.includes(myId);
  const showResult = !!roundResult;

  // Reset selected answer when round changes
  useEffect(() => {
    if (roundNumber !== prevRound) {
      setSelectedAnswer(null);
      setPrevRound(roundNumber);
    }
  }, [roundNumber, prevRound]);

  // Countdown timer
  useEffect(() => {
    if (isComplete || !roundStartTime || !roundTimeLimit) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - roundStartTime;
      const remaining = Math.max(0, 100 * (1 - elapsed / roundTimeLimit));
      setTimeLeft(remaining);
    }, 50);

    return () => clearInterval(interval);
  }, [roundStartTime, roundTimeLimit, isComplete]);

  const handleAnswer = useCallback((answer) => {
    if (hasAnswered || isComplete || !isPlayer) return;
    setSelectedAnswer(answer);
    onMove({ answer });
  }, [hasAnswered, isComplete, isPlayer, onMove]);

  // Difficulty badge color
  const difficultyColors = {
    easy: '#0F9D58',
    medium: '#F29900',
    hard: '#D93025',
  };

  // Timer bar color
  const timerColor = timeLeft > 60 ? '#0F9D58' : timeLeft > 30 ? '#F29900' : '#D93025';

  // Result text
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
      position: 'relative',
    }}>

      {/* Shared Score Header */}
      <ScoreHeader
        players={players}
        scores={scores}
        roundInfo={!isComplete ? `Round ${roundNumber}/${totalRounds}` : undefined}
      />

      {isComplete ? (
        <GameOverOverlay
          players={players}
          scores={scores}
          winnerId={winnerId}
          isHost={isHost}
          onReset={onReset}
          onExit={onExit}
        />
      ) : (
        /* Active Game UI */
        <>
          {/* Round & Difficulty */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13 }}>
            <span style={{ color: 'var(--color-text-on-dark-dim)' }}>
              Round {roundNumber}/{totalRounds}
            </span>
            <span style={{
              background: difficultyColors[difficulty],
              color: 'white', borderRadius: 'var(--radius-pill)',
              padding: '2px 10px', fontSize: 11, fontWeight: 600,
              textTransform: 'uppercase',
            }}>
              {difficulty}
            </span>
          </div>

          {/* Timer Bar */}
          <div style={{
            width: '80%', maxWidth: 320, height: 6, borderRadius: 3,
            background: 'rgba(255,255,255,0.1)', overflow: 'hidden',
          }}>
            <div style={{
              width: `${timeLeft}%`, height: '100%',
              background: timerColor, borderRadius: 3,
              transition: 'width 100ms linear, background 300ms ease',
            }} />
          </div>

          {/* Question */}
          <div style={{
            fontSize: 40, fontWeight: 700, margin: '12px 0',
            letterSpacing: 2, fontFamily: 'monospace',
            color: 'white', textAlign: 'center',
          }}>
            {question || '...'}
          </div>

          {/* Status */}
          <div style={{ fontSize: 14, color: 'var(--color-text-on-dark-dim)', minHeight: 20 }}>
            {showResult
              ? (roundResult.correctPlayerId
                ? `${roundResult.correctPlayerId === myId ? 'You' : players.find(p => p.id === roundResult.correctPlayerId)?.displayName} got it! (+${roundResult.pointsAwarded})`
                : 'Nobody got it right!')
              : hasAnswered
                ? 'Waiting for opponent...'
                : isPlayer
                  ? 'Pick the correct answer!'
                  : 'Spectating...'}
          </div>

          {/* Answer Options — 2x2 Grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12, width: '80%', maxWidth: 320,
          }}>
            {options.map((opt, i) => {
              const isSelected = selectedAnswer === opt;
              const isCorrectOpt = showResult && opt === correctAnswer;
              const isWrongSelection = showResult && isSelected && opt !== correctAnswer;

              let bg = 'var(--color-control-bar)';
              if (isCorrectOpt) bg = '#0F9D58';
              else if (isWrongSelection) bg = '#D93025';
              else if (isSelected) bg = 'rgba(255,255,255,0.15)';

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  disabled={hasAnswered || !isPlayer}
                  style={{
                    padding: '16px 12px', borderRadius: 12,
                    background: bg, border: '2px solid transparent',
                    borderColor: isSelected && !showResult ? 'var(--color-blue)' : 'transparent',
                    color: 'white', fontSize: 20, fontWeight: 600,
                    cursor: hasAnswered || !isPlayer ? 'default' : 'pointer',
                    transition: 'all 150ms ease',
                    transform: isCorrectOpt ? 'scale(1.05)' : 'scale(1)',
                    fontFamily: 'monospace',
                  }}
                  onMouseEnter={e => {
                    if (!hasAnswered && isPlayer) e.currentTarget.style.background = '#4A4E51';
                  }}
                  onMouseLeave={e => {
                    if (!hasAnswered && isPlayer && !isSelected) e.currentTarget.style.background = 'var(--color-control-bar)';
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
