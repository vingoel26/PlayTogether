import Tooltip from '../ui/Tooltip.jsx';
import TicTacToeBoard from '../game/TicTacToeBoard.jsx';
import MemoryMatchBoard from '../game/MemoryMatchBoard.jsx';
import QuickMathBoard from '../game/QuickMathBoard.jsx';
import GameSelector from '../game/GameSelector.jsx';
import { useGameSync } from '../../hooks/useGameSync.js';

/**
 * HubPanel — The resilient right-side panel that slides in
 * Takes up 60% of the screen for Games, 70% for Watch
 */
export default function HubPanel({ activeHub, onClose }) {
  const { gameState, sendMove, startGame, resetGame } = useGameSync();

  if (!activeHub) return null;

  const renderGameContent = () => {
    if (!gameState || gameState.state === 'lobby') {
      return <GameSelector onStart={startGame} />;
    }

    if (gameState.type === 'tictactoe') {
      return (
        <TicTacToeBoard
          gameState={gameState}
          onMove={sendMove}
          onStart={startGame}   // Just in case
          onReset={resetGame}
        />
      );
    }

    if (gameState.type === 'memory') {
      return (
        <MemoryMatchBoard
          gameState={gameState}
          onMove={sendMove}
          onStart={startGame}
          onReset={resetGame}
        />
      );
    }

    if (gameState.type === 'quickmath') {
      return (
        <QuickMathBoard
          gameState={gameState}
          onMove={sendMove}
          onStart={startGame}
          onReset={resetGame}
        />
      );
    }

    return null;
  };

  return (
    <div
      style={{
        flex: `0 0 ${activeHub === 'games' ? 'var(--games-panel-width)' : 'var(--watch-panel-width)'}`,
        background: 'var(--color-queue-surface)',
        borderLeft: '1px solid var(--color-control-bar)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 300ms var(--ease-standard)',
        zIndex: 10,
        height: '100%',
        position: 'relative',
      }}
    >
      <style>
        {`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
      
      {/* Panel Header */}
      <div 
        style={{ 
          height: 'var(--panel-header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-on-dark)' }}>
          {activeHub === 'games' ? 'Mini Games' : 'Watch Party'}
        </span>

        {/* Dynamic header options could go here */}

        <Tooltip text="Close Panel">
          <button
            onClick={() => {
                // IMPORTANT: If they close the panel, does it destroy the game state?
                // The state lives in RoomContext/Socket, so the panel just hides visually
                onClose();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-on-dark-dim)',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </Tooltip>
      </div>

      {/* Panel Content — Game or Watch */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeHub === 'games' ? (
            renderGameContent()
        ) : (
          <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-on-dark-dim)', textAlign: 'center',
            padding: 24, gap: 16,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.5 }}>smart_display</span>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-on-dark)' }}>Watch Party</h3>
              <p style={{ margin: 0, fontSize: 13, maxWidth: 260 }}>Coming soon in Phase E!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
