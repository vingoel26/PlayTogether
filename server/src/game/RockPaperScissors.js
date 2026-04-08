import { BaseGame } from './BaseGame.js';

/**
 * RockPaperScissors — Simultaneous choice game
 * Both players pick rock/paper/scissors secretly, then reveal together.
 * Best of 5 rounds.
 */
export class RockPaperScissors extends BaseGame {
    constructor(roomCode, players) {
        super(roomCode, players);
        this.totalRounds = 5;
        this.currentRound = 0;
        this.choices = {};          // playerId -> 'rock'|'paper'|'scissors' (private until reveal)
        this.phase = 'choosing';    // 'choosing' | 'reveal'
        this.roundWinnerId = null;  // winner of current round
        this.roundHistory = [];     // array of { round, p1Choice, p2Choice, winnerId }
    }

    getType() {
        return 'rps';
    }

    start() {
        super.start();
        this.currentRound = 1;
        this.choices = {};
        this.phase = 'choosing';
        this.roundWinnerId = null;
        this.roundHistory = [];
        this.players.forEach(p => this.scores[p.id] = 0);
    }

    handleMove(playerId, move) {
        if (this.state !== 'active') return false;

        // Only valid players
        if (!this.players.some(p => p.id === playerId)) return false;

        if (move.action === 'next_round') {
            // Advance to next round after reveal
            if (this.phase !== 'reveal') return false;
            // Only allow once both have seen the result
            this._nextRound();
            return true;
        }

        // Submit a choice
        if (this.phase !== 'choosing') return false;

        const { choice } = move;
        const validChoices = ['rock', 'paper', 'scissors'];
        if (!validChoices.includes(choice)) return false;

        // Already chose this round
        if (this.choices[playerId]) return false;

        this.choices[playerId] = choice;

        // If both players have chosen, resolve
        if (Object.keys(this.choices).length === 2) {
            this._resolveRound();
        }

        return true;
    }

    _resolveRound() {
        const p1 = this.players[0];
        const p2 = this.players[1];
        const c1 = this.choices[p1.id];
        const c2 = this.choices[p2.id];

        let winnerId = null;

        if (c1 === c2) {
            winnerId = 'draw';
        } else if (
            (c1 === 'rock' && c2 === 'scissors') ||
            (c1 === 'scissors' && c2 === 'paper') ||
            (c1 === 'paper' && c2 === 'rock')
        ) {
            winnerId = p1.id;
            this.scores[p1.id] = (this.scores[p1.id] || 0) + 1;
        } else {
            winnerId = p2.id;
            this.scores[p2.id] = (this.scores[p2.id] || 0) + 1;
        }

        this.roundWinnerId = winnerId;
        this.phase = 'reveal';

        this.roundHistory.push({
            round: this.currentRound,
            choices: { [p1.id]: c1, [p2.id]: c2 },
            winnerId,
        });

        // Check if game is over (best of 5 = first to 3, or all 5 rounds played)
        const winsNeeded = Math.ceil(this.totalRounds / 2); // 3
        const p1Score = this.scores[p1.id] || 0;
        const p2Score = this.scores[p2.id] || 0;

        if (p1Score >= winsNeeded || p2Score >= winsNeeded || this.currentRound >= this.totalRounds) {
            this.state = 'complete';
            if (p1Score > p2Score) this.winnerId = p1.id;
            else if (p2Score > p1Score) this.winnerId = p2.id;
            else this.winnerId = 'draw';
        }
    }

    _nextRound() {
        if (this.state === 'complete') return;

        this.currentRound++;
        this.choices = {};
        this.phase = 'choosing';
        this.roundWinnerId = null;
    }

    getSpecificState() {
        const p1 = this.players[0];
        const p2 = this.players[1];

        return {
            phase: this.phase,
            roundNumber: this.currentRound,
            totalRounds: this.totalRounds,
            roundWinnerId: this.roundWinnerId,
            // During 'choosing', only show that a player has submitted, not their choice
            // During 'reveal', show both choices
            playerChoices: this.phase === 'reveal'
                ? { [p1.id]: this.choices[p1.id], [p2.id]: this.choices[p2.id] }
                : { [p1.id]: this.choices[p1.id] ? 'submitted' : null, [p2.id]: this.choices[p2.id] ? 'submitted' : null },
            roundHistory: this.roundHistory,
        };
    }

    reset() {
        this.start();
    }
}
