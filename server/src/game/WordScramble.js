import { BaseGame } from './BaseGame.js';

const WORD_BANK = [
    'apple', 'beach', 'chair', 'dance', 'eagle', 'flame', 'grape', 'house',
    'light', 'music', 'ocean', 'piano', 'queen', 'river', 'stone', 'tiger',
    'cloud', 'dream', 'earth', 'frost', 'giant', 'horse', 'ivory', 'jewel',
    'knife', 'lemon', 'magic', 'noble', 'orbit', 'pearl', 'radio', 'shine',
    'train', 'ultra', 'voice', 'whale', 'youth', 'blaze', 'crest', 'drift',
    'flint', 'globe', 'haste', 'joker', 'lunar', 'maple', 'nerve', 'pixel',
    'quest', 'realm', 'solar', 'trace', 'vault', 'wizard', 'breeze', 'canyon',
    'dragon', 'falcon', 'golden', 'harbor', 'jungle', 'knight', 'legend',
    'marble', 'nectar', 'orphan', 'parrot', 'quartz', 'rocket', 'silver',
    'throne', 'unique', 'velvet', 'winter', 'zenith', 'bridge', 'copper',
];

const HINT_PENALTY = 10; // Points deducted per hint used

/**
 * WordScramble — Unscramble the word game
 * Both players race to guess the scrambled word. First correct guess scores.
 * 5 rounds, 30s per word, per-player hints with point penalty.
 */
export class WordScramble extends BaseGame {
    constructor(roomCode, players) {
        super(roomCode, players);
        this.totalRounds = 5;
        this.currentRound = 0;
        this.currentWord = null;
        this.scrambledWord = null;
        this.playerHints = {};      // playerId -> [revealed positions]
        this.maxHints = 2;
        this.roundStartTime = null;
        this.roundTimeLimit = 30000; // 30 seconds
        this.roundResult = null;     // { winnerId, word, pointsAwarded, wasTimeout }
        this.usedWords = new Set();
        this.roundTimedOut = false;
    }

    getType() {
        return 'wordscramble';
    }

    start() {
        super.start();
        this.currentRound = 0;
        this.usedWords = new Set();
        this.players.forEach(p => this.scores[p.id] = 0);
        this._nextRound();
    }

    handleMove(playerId, move) {
        if (this.state !== 'active') return false;
        if (!this.players.some(p => p.id === playerId)) return false;

        // Timeout — client sends this when timer reaches 0
        if (move.action === 'timeout') {
            if (this.roundTimedOut) return false; // Already handled
            // Validate that enough time has actually passed
            const elapsed = Date.now() - this.roundStartTime;
            if (elapsed < this.roundTimeLimit - 2000) return false; // Allow 2s tolerance

            this.roundTimedOut = true;
            this.roundResult = {
                winnerId: null,
                word: this.currentWord,
                pointsAwarded: 0,
                wasTimeout: true,
            };
            // Don't advance yet — let client show the answer briefly
            // Client will send 'next_after_timeout' to advance
            return true;
        }

        if (move.action === 'next_after_timeout') {
            if (!this.roundTimedOut) return false;
            this._nextRound();
            return true;
        }

        if (move.action === 'hint') {
            return this._giveHint(playerId);
        }

        if (move.action === 'skip') {
            this.roundResult = { winnerId: null, word: this.currentWord, pointsAwarded: 0, wasTimeout: false };
            this._nextRound();
            return true;
        }

        // Submit a guess
        const { guess } = move;
        if (!guess || typeof guess !== 'string') return false;
        if (this.roundTimedOut) return false; // Can't guess after timeout

        if (guess.toLowerCase().trim() === this.currentWord.toLowerCase()) {
            // Correct!
            const elapsed = Date.now() - this.roundStartTime;
            const timeRatio = Math.max(0, 1 - (elapsed / this.roundTimeLimit));
            const hintsUsed = (this.playerHints[playerId] || []).length;
            const hintPenalty = hintsUsed * HINT_PENALTY;
            const basePoints = Math.round(10 + 40 * timeRatio); // 10-50 base
            const points = Math.max(5, basePoints - hintPenalty); // Min 5 points
            this.scores[playerId] = (this.scores[playerId] || 0) + points;

            this.roundResult = {
                winnerId: playerId,
                word: this.currentWord,
                pointsAwarded: points,
                hintsUsed,
                wasTimeout: false,
            };

            this._nextRound();
            return true;
        }

        // Wrong guess
        return true;
    }

    _giveHint(playerId) {
        if (!this.currentWord) return false;

        const playerHintList = this.playerHints[playerId] || [];
        if (playerHintList.length >= this.maxHints) return false;

        // Find positions not yet revealed for THIS player
        const unrevealed = [];
        for (let i = 0; i < this.currentWord.length; i++) {
            if (!playerHintList.includes(i)) {
                unrevealed.push(i);
            }
        }
        if (unrevealed.length === 0) return false;

        const pos = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        playerHintList.push(pos);
        this.playerHints[playerId] = playerHintList;
        return true;
    }

    _nextRound() {
        this.currentRound++;
        this.roundTimedOut = false;

        if (this.currentRound > this.totalRounds) {
            this._endGame();
            return;
        }

        this.currentWord = this._pickWord();
        this.scrambledWord = this._scramble(this.currentWord);
        // Reset per-player hints for the new round
        this.playerHints = {};
        this.players.forEach(p => this.playerHints[p.id] = []);
        this.roundStartTime = Date.now();
        this.roundResult = null;
    }

    _pickWord() {
        const available = WORD_BANK.filter(w => !this.usedWords.has(w));
        const word = available[Math.floor(Math.random() * available.length)];
        this.usedWords.add(word);
        return word;
    }

    _scramble(word) {
        const arr = word.split('');
        let attempts = 0;
        do {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            attempts++;
        } while (arr.join('') === word && attempts < 20);
        return arr.join('');
    }

    _endGame() {
        this.state = 'complete';
        const p1Score = this.scores[this.players[0].id] || 0;
        const p2Score = this.scores[this.players[1].id] || 0;

        if (p1Score > p2Score) this.winnerId = this.players[0].id;
        else if (p2Score > p1Score) this.winnerId = this.players[1].id;
        else this.winnerId = 'draw';
    }

    getSpecificState() {
        // Build per-player hint letters: for each player, an array of length wordLength
        // with revealed letters at hint positions and null elsewhere
        const playerHintLetters = {};
        for (const p of this.players) {
            const hints = this.playerHints[p.id] || [];
            playerHintLetters[p.id] = this.currentWord
                ? this.currentWord.split('').map((ch, i) => hints.includes(i) ? ch : null)
                : [];
        }

        return {
            scrambledWord: this.scrambledWord,
            wordLength: this.currentWord ? this.currentWord.length : 0,
            playerHints: this.playerHints,
            playerHintLetters,
            maxHints: this.maxHints,
            hintPenalty: HINT_PENALTY,
            roundNumber: this.currentRound,
            totalRounds: this.totalRounds,
            roundStartTime: this.roundStartTime,
            roundTimeLimit: this.roundTimeLimit,
            roundResult: this.roundResult,
            roundTimedOut: this.roundTimedOut,
            answer: (this.roundResult || this.roundTimedOut) ? this.currentWord : null,
        };
    }

    reset() {
        this.start();
    }
}
