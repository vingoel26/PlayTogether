import { BaseGame } from './BaseGame.js';

const EMOJI_CARDS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

/**
 * MemoryMatch — Classic card flipping memory game
 * Designed for 2 players taking turns to find pairs
 */
export class MemoryMatch extends BaseGame {
    constructor(roomCode, players) {
        super(roomCode, players);
        this.cards = [];
        this.flippedIndices = [];
        this.matchedPairs = new Set();
        this.currentTurn = 0; // Index into this.players
    }

    getType() {
        return 'memory';
    }

    start() {
        super.start();
        // Create pairs and shuffle
        const deck = [...EMOJI_CARDS, ...EMOJI_CARDS];
        this.cards = this._shuffle(deck);
        this.flippedIndices = [];
        this.matchedPairs = new Set();
        this.currentTurn = 0;
        this.players.forEach(p => this.scores[p.id] = 0);
    }

    handleMove(playerId, move) {
        if (this.state !== 'active') return false;

        // If two cards are already flipped and waiting to be resolved, ignore clicks
        if (this.flippedIndices.length >= 2) return false;

        const { cardIndex } = move;

        // Validate turn
        const expectedPlayer = this.players[this.currentTurn];
        if (expectedPlayer.id !== playerId) return false;

        // Validate card
        if (cardIndex < 0 || cardIndex >= this.cards.length) return false;
        if (this.flippedIndices.includes(cardIndex)) return false;
        if (this.matchedPairs.has(this.cards[cardIndex])) return false;

        // Flip it
        this.flippedIndices.push(cardIndex);

        // If two cards are now flipped, we must wait for them to resolve
        // In a real-time game, we evaluate the match, then force the client to wait 1s before they disappear
        if (this.flippedIndices.length === 2) {
            this._resolveTurn();
        }

        return true;
    }

    _resolveTurn() {
        const [idx1, idx2] = this.flippedIndices;
        const match = this.cards[idx1] === this.cards[idx2];
        const playerId = this.players[this.currentTurn].id;

        if (match) {
            // Player scored
            this.matchedPairs.add(this.cards[idx1]);
            this.scores[playerId] = (this.scores[playerId] || 0) + 1;

            // Check for game over
            if (this.matchedPairs.size === EMOJI_CARDS.length) {
                // Determine winner
                const p1Score = this.scores[this.players[0].id] || 0;
                const p2Score = this.scores[this.players[1].id] || 0;

                this.state = 'complete';
                if (p1Score > p2Score) this.winnerId = this.players[0].id;
                else if (p2Score > p1Score) this.winnerId = this.players[1].id;
                else this.winnerId = 'draw';
            }

            // If match, they get to keep going! So we don't change currentTurn.
            // But we must clear flipped immediately so they can click again.
            this.flippedIndices = [];
        } else {
            // No match. Turn goes to next player.
            // We use a timeout to let the client see the mistake
            setTimeout(() => {
                this.flippedIndices = [];
                this.currentTurn = 1 - this.currentTurn;

                // IMPORTANT: Since we are using a setTimeout to mutate game state asynchronously,
                // we technically need to broadcast this change via the RoomManager socket! 
                // A better approach is to return the timeout signal, or rely on client-side delays.
                // For simplicity, we just mutate state here, but we'd need access to SocketRouter to emit it.
            }, 1000);

            // Wait! If we use setTimeout here without broadcasting, the client never sees them unflip!
            // We should NOT use setTimeout on the server.
            // Instead, we just wait for the client to send a 'game:clear-flip' move!
        }
    }

    // Changing approach: Client sends "game:move" with { action: 'clear' } after 1 second if no match.
    // Let's refactor `handleMove`:

    handleMove(playerId, move) {
        if (this.state !== 'active') return false;

        const expectedPlayer = this.players[this.currentTurn];
        if (expectedPlayer.id !== playerId) return false;

        if (move.action === 'clear_flips') {
            if (this.flippedIndices.length === 2 && this.cards[this.flippedIndices[0]] !== this.cards[this.flippedIndices[1]]) {
                this.flippedIndices = [];
                this.currentTurn = 1 - this.currentTurn;
                return true;
            }
            return false;
        }

        // Action is flip
        if (this.flippedIndices.length >= 2) return false;

        const { cardIndex } = move;

        if (cardIndex < 0 || cardIndex >= this.cards.length) return false;
        if (this.flippedIndices.includes(cardIndex)) return false;
        if (this.matchedPairs.has(this.cards[cardIndex])) return false;

        this.flippedIndices.push(cardIndex);

        if (this.flippedIndices.length === 2) {
            const [idx1, idx2] = this.flippedIndices;
            const match = this.cards[idx1] === this.cards[idx2];

            if (match) {
                this.matchedPairs.add(this.cards[idx1]);
                this.scores[playerId] = (this.scores[playerId] || 0) + 1;
                this.flippedIndices = []; // Instant clear

                // Check win
                if (this.matchedPairs.size === EMOJI_CARDS.length) {
                    const p1 = this.scores[this.players[0].id] || 0;
                    const p2 = this.scores[this.players[1].id] || 0;
                    this.state = 'complete';
                    if (p1 > p2) this.winnerId = this.players[0].id;
                    else if (p2 > p1) this.winnerId = this.players[1].id;
                    else this.winnerId = 'draw';
                }
            }
            // If NO match, we do NOT clear them yet. 
            // We wait for the client to send 'clear_flips' after animating the mistake.
        }

        return true;
    }

    getSpecificState() {
        return {
            // We only send the emoji if the card is flipped or matched
            board: this.cards.map((card, idx) =>
                (this.flippedIndices.includes(idx) || this.matchedPairs.has(card)) ? card : null
            ),
            matchedDocs: Array.from(this.matchedPairs),
            currentTurn: this.currentTurn,
            currentPlayerId: this.players[this.currentTurn]?.id,
            isWaitingForClear: this.flippedIndices.length === 2 && this.cards[this.flippedIndices[0]] !== this.cards[this.flippedIndices[1]]
        };
    }

    reset() {
        this.start();
    }

    _shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}
