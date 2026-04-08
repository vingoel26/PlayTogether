import { TicTacToe } from './TicTacToe.js';
import { MemoryMatch } from './MemoryMatch.js';
import { QuickMath } from './QuickMath.js';

/**
 * GameFactory — Creates game instances by type string
 * Add new games here as they are implemented
 */
export class GameFactory {
    static create(type, roomCode, players) {
        switch (type) {
            case 'tictactoe':
                return new TicTacToe(roomCode, players);
            case 'memory':
                return new MemoryMatch(roomCode, players);
            case 'quickmath':
                return new QuickMath(roomCode, players);
            default:
                throw new Error(`Unknown game type: ${type}`);
        }
    }
}
