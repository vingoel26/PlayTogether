import { BaseGame } from './BaseGame.js';

/**
 * TicTacToe — Classic 3×3 grid game
 * First player is 'X', second is 'O'
 */
export class TicTacToe extends BaseGame {
    constructor(roomCode, players) {
        super(roomCode, players);
        this.board = Array(9).fill(null); // 0-8 cells, null = empty
        this.currentTurn = 0; // Index into this.players
    }

    getType() {
        return 'tictactoe';
    }

    start() {
        super.start();
        this.board = Array(9).fill(null);
        this.currentTurn = 0;
    }

    handleMove(playerId, move) {
        if (this.state !== 'active') return false;

        const { cellIndex } = move;

        // Validate turn
        const expectedPlayer = this.players[this.currentTurn];
        if (expectedPlayer.id !== playerId) return false;

        // Validate cell
        if (cellIndex < 0 || cellIndex > 8) return false;
        if (this.board[cellIndex] !== null) return false;

        // Place mark
        const mark = this.currentTurn === 0 ? 'X' : 'O';
        this.board[cellIndex] = mark;

        // Check for winner
        const winner = this._checkWinner();
        if (winner) {
            this.state = 'complete';
            this.winnerId = this.players[winner === 'X' ? 0 : 1].id;
            this.scores[this.winnerId] = (this.scores[this.winnerId] || 0) + 1;
            return true;
        }

        // Check for draw
        if (this.board.every(cell => cell !== null)) {
            this.state = 'complete';
            this.winnerId = 'draw';
            return true;
        }

        // Next turn
        this.currentTurn = 1 - this.currentTurn;
        return true;
    }

    getSpecificState() {
        return {
            board: this.board,
            currentTurn: this.currentTurn,
            currentPlayerId: this.players[this.currentTurn]?.id,
            marks: {
                [this.players[0]?.id]: 'X',
                [this.players[1]?.id]: 'O',
            }
        };
    }

    /** Reset board for a rematch */
    reset() {
        this.board = Array(9).fill(null);
        this.currentTurn = 0;
        this.state = 'active';
        this.winnerId = null;
    }

    // ── Private Helpers ──

    _checkWinner() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6],           // diagonals
        ];

        for (const [a, b, c] of lines) {
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return this.board[a]; // 'X' or 'O'
            }
        }
        return null;
    }
}
