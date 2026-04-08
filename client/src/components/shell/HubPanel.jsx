import React, { Suspense, lazy } from 'react';
import Tooltip from '../ui/Tooltip.jsx';
import GameSelector from '../game/GameSelector.jsx';
import WatchPanel from '../watch/WatchPanel.jsx';
import { useGameSync } from '../../hooks/useGameSync.js';

const TicTacToeBoard = lazy(() => import('../game/TicTacToeBoard.jsx'));
const MemoryMatchBoard = lazy(() => import('../game/MemoryMatchBoard.jsx'));
const QuickMathBoard = lazy(() => import('../game/QuickMathBoard.jsx'));
const RPSBoard = lazy(() => import('../game/RPSBoard.jsx'));
const WordScrambleBoard = lazy(() => import('../game/WordScrambleBoard.jsx'));

/**
 * HubPanel — The resilient right-side panel that slides in
 * Takes up 60% of the screen for Games, 70% for Watch
 */
export default function HubPanel({ activeHub, onClose }) {
  const { gameState, sendMove, startGame, resetGame, exitGame } = useGameSync();

  if (!activeHub) return null;

  const renderGameContent = () => {
    if (!gameState || gameState.state === 'lobby') {
      return <GameSelector onStart={startGame} />;
    }

    const commonProps = {
      gameState,
      onMove: sendMove,
      onStart: startGame,
      onReset: resetGame,
      onExit: exitGame,
    };

    if (gameState.type === 'tictactoe') return <TicTacToeBoard {...commonProps} />;
    if (gameState.type === 'memory') return <MemoryMatchBoard {...commonProps} />;
    if (gameState.type === 'quickmath') return <QuickMathBoard {...commonProps} />;
    if (gameState.type === 'rps') return <RPSBoard {...commonProps} />;
    if (gameState.type === 'wordscramble') return <WordScrambleBoard {...commonProps} />;

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
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <Suspense fallback={<div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-on-dark-dim)' }}>Loading component...</div>}>
          {activeHub === 'watch' ? <WatchPanel /> : renderGameContent()}
        </Suspense>
      </div>
    </div>
  );
}
