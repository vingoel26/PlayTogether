import { BaseGame } from './BaseGame.js';

/**
 * QuickMath — Fast-paced mental arithmetic game
 * Both players race to answer math questions. First to answer correctly scores.
 * 10 rounds, 3 difficulty levels, time-bonus scoring.
 */
export class QuickMath extends BaseGame {
    constructor(roomCode, players) {
        super(roomCode, players);
        this.totalRounds = 10;
        this.currentRound = 0;
        this.question = null;       // { text, answer, options }
        this.roundStartTime = null;
        this.roundTimeLimit = 15000; // 15 seconds per round
        this.answeredThisRound = new Set(); // playerIds who answered this round
        this.roundResult = null;     // { correctPlayerId, selectedAnswer, wasTimeout } or null
        this.difficulty = 'easy';    // 'easy' | 'medium' | 'hard'
        this._roundTimer = null;
    }

    getType() {
        return 'quickmath';
    }

    start() {
        super.start();
        this.currentRound = 0;
        this.players.forEach(p => this.scores[p.id] = 0);
        this._nextRound();
    }

    handleMove(playerId, move) {
        if (this.state !== 'active') return false;

        // Only valid players can answer
        if (!this.players.some(p => p.id === playerId)) return false;

        // Cannot answer twice in the same round
        if (this.answeredThisRound.has(playerId)) return false;

        const { answer } = move;
        if (answer === undefined || answer === null) return false;

        this.answeredThisRound.add(playerId);

        const isCorrect = answer === this.question.answer;

        if (isCorrect) {
            // Time bonus: faster answer = more points (max 100, min 10)
            const elapsed = Date.now() - this.roundStartTime;
            const timeRatio = Math.max(0, 1 - (elapsed / this.roundTimeLimit));
            const points = Math.round(10 + 90 * timeRatio);
            this.scores[playerId] = (this.scores[playerId] || 0) + points;

            this.roundResult = {
                correctPlayerId: playerId,
                selectedAnswer: answer,
                wasTimeout: false,
                pointsAwarded: points,
            };

            // Clear any pending timer
            if (this._roundTimer) {
                clearTimeout(this._roundTimer);
                this._roundTimer = null;
            }

            // Brief pause then advance to next round
            // We return true immediately so the state broadcasts, 
            // then the SocketRouter should call getState() again after _nextRound
            // For simplicity, we advance immediately — client can show feedback before re-rendering
            this._scheduleNextRound();
            return true;
        }

        // Wrong answer — if both players answered wrong, advance
        if (this.answeredThisRound.size >= this.players.length) {
            this.roundResult = {
                correctPlayerId: null,
                selectedAnswer: null,
                wasTimeout: false,
            };
            if (this._roundTimer) {
                clearTimeout(this._roundTimer);
                this._roundTimer = null;
            }
            this._scheduleNextRound();
        }

        return true;
    }

    _scheduleNextRound() {
        // Give a short delay for the client to show feedback
        // Since we can't push state from a timer without the socket,
        // we advance immediately and let the client handle the transition
        this._nextRound();
    }

    _nextRound() {
        if (this._roundTimer) {
            clearTimeout(this._roundTimer);
            this._roundTimer = null;
        }

        this.currentRound++;

        if (this.currentRound > this.totalRounds) {
            this._endGame();
            return;
        }

        // Adjust difficulty based on round
        if (this.currentRound <= 3) this.difficulty = 'easy';
        else if (this.currentRound <= 7) this.difficulty = 'medium';
        else this.difficulty = 'hard';

        this.question = this._generateQuestion(this.difficulty);
        this.roundStartTime = Date.now();
        this.answeredThisRound = new Set();
        this.roundResult = null;
    }

    _endGame() {
        this.state = 'complete';
        const p1Score = this.scores[this.players[0].id] || 0;
        const p2Score = this.scores[this.players[1].id] || 0;

        if (p1Score > p2Score) this.winnerId = this.players[0].id;
        else if (p2Score > p1Score) this.winnerId = this.players[1].id;
        else this.winnerId = 'draw';
    }

    _generateQuestion(difficulty) {
        let a, b, op, answer;

        switch (difficulty) {
            case 'easy':
                a = this._rand(1, 20);
                b = this._rand(1, 20);
                op = Math.random() < 0.5 ? '+' : '−';
                answer = op === '+' ? a + b : a - b;
                // Ensure no negative results for subtraction
                if (op === '−' && a < b) [a, b] = [b, a];
                answer = op === '+' ? a + b : a - b;
                break;

            case 'medium':
                a = this._rand(2, 12);
                b = this._rand(2, 12);
                op = '×';
                answer = a * b;
                break;

            case 'hard': {
                const useMultiply = Math.random() < 0.5;
                if (useMultiply) {
                    a = this._rand(10, 30);
                    b = this._rand(2, 12);
                    op = '×';
                    answer = a * b;
                } else {
                    // Division — generate from multiplication to ensure whole numbers
                    b = this._rand(2, 12);
                    answer = this._rand(2, 20);
                    a = b * answer;
                    op = '÷';
                }
                break;
            }
        }

        const text = `${a} ${op} ${b}`;
        const options = this._generateOptions(answer);

        return { text, answer, options };
    }

    _generateOptions(correctAnswer) {
        const options = new Set([correctAnswer]);

        // Generate 3 plausible distractors
        while (options.size < 4) {
            const offset = this._rand(1, Math.max(5, Math.abs(Math.floor(correctAnswer * 0.3))));
            const distractor = Math.random() < 0.5
                ? correctAnswer + offset
                : correctAnswer - offset;

            // Avoid duplicates and negative distractors for simple questions
            if (distractor !== correctAnswer && !options.has(distractor)) {
                options.add(distractor);
            }
        }

        // Shuffle the options
        return this._shuffle([...options]);
    }

    _rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    _shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    getSpecificState() {
        return {
            question: this.question ? this.question.text : null,
            options: this.question ? this.question.options : [],
            correctAnswer: this.state === 'active' && this.roundResult
                ? this.question.answer
                : (this.state === 'complete' ? this.question?.answer : null),
            roundNumber: this.currentRound,
            totalRounds: this.totalRounds,
            roundStartTime: this.roundStartTime,
            roundTimeLimit: this.roundTimeLimit,
            difficulty: this.difficulty,
            roundResult: this.roundResult,
            answeredPlayers: [...this.answeredThisRound],
        };
    }

    reset() {
        if (this._roundTimer) {
            clearTimeout(this._roundTimer);
            this._roundTimer = null;
        }
        this.start();
    }
}
