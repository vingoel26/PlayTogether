import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket.js';

/**
 * useGameSync — Subscribes to game:state-update, emits game:move
 * Provides the current game state for any active Mini Game
 */
export function useGameSync() {
    const { on, emit } = useSocket();
    const [gameState, setGameState] = useState(null);

    useEffect(() => {
        const unsub1 = on('game:state-update', (state) => {
            setGameState(state);
        });

        const unsub2 = on('game:invalid-move', (data) => {
            console.warn('Invalid move:', data.message);
        });

        return () => { unsub1(); unsub2(); };
    }, [on]);

    const sendMove = useCallback((move) => {
        emit('game:move', { move });
    }, [emit]);

    const startGame = useCallback((gameType) => {
        emit('game:start', { gameType });
    }, [emit]);

    const resetGame = useCallback(() => {
        emit('game:reset');
    }, [emit]);

    const exitGame = useCallback(() => {
        setGameState(null);
    }, []);

    return {
        gameState,
        sendMove,
        startGame,
        resetGame,
        exitGame,
    };
}
