/**
 * BaseGame — Abstract superclass for all Mini Games
 * Defines the strict interface any game must implement to plug into the real-time engine
 */
export class BaseGame {
    constructor(roomCode, players) {
        this.roomCode = roomCode;
        this.players = players; // Array of { id, displayName }

        this.state = 'lobby'; // 'lobby' | 'active' | 'complete'
        this.winnerId = null;
        this.scores = {}; // map of playerId -> score if applicable

        // Initialize scores
        this.players.forEach(p => this.scores[p.id] = 0);
    }

    /**
     * Initializes the game state and transitions to 'active'
     */
    start() {
        this.state = 'active';
        this.winnerId = null;
    }

    /**
     * Validates and applies a move
     * @param {string} playerId 
     * @param {any} move - Game specific move payload
     * @returns {boolean} - True if the move was valid and state changed
     */
    handleMove(playerId, move) {
        throw new Error('handleMove() must be implemented by subclass');
    }

    /**
     * @returns {object} - The complete current state required for the client to render
     */
    getState() {
        return {
            type: this.getType(),
            state: this.state,
            winnerId: this.winnerId,
            scores: this.scores,
            players: this.players,
            ...this.getSpecificState()
        };
    }

    // ── Abstract Methods for Subclasses ──

    /** @returns {string} */
    getType() {
        throw new Error('getType() must specify the string identifier (e.g. "tictactoe")');
    }

    /** @returns {object} */
    getSpecificState() {
        throw new Error('getSpecificState() must be implemented by subclass');
    }
}
