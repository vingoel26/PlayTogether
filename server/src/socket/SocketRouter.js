import { RoomManager } from '../services/RoomManager.js';
import { GameFactory } from '../game/GameFactory.js';
import { WatchSyncEngine } from '../sync/WatchSyncEngine.js';

/**
 * SocketRouter — Central mediator for all Socket.io events
 * Dispatches to room, game, and watch handlers
 */
export class SocketRouter {
    constructor(io) {
        this.io = io;
        this.roomManager = new RoomManager();
        this.activeGames = new Map(); // roomCode -> BaseGame instance
        this.activeWatches = new Map(); // roomCode -> WatchSyncEngine instance
    }

    init() {
        this.io.on('connection', (socket) => {
            console.log(`✅ Client connected: ${socket.id}`);

            // ── Room Events ──
            socket.on('room:join', (data) => this.handleRoomJoin(socket, data));
            socket.on('room:leave', () => this.handleRoomLeave(socket));
            socket.on('room:rejoin', (data) => this.handleRoomRejoin(socket, data));
            socket.on('room:set-hub', (data) => this.handleSetHub(socket, data));

            // ── Game Events ──
            socket.on('game:start', (data) => this.handleGameStart(socket, data));
            socket.on('game:move', (data) => this.handleGameMove(socket, data));
            socket.on('game:reset', () => this.handleGameReset(socket));

            // ── Watch Events ──
            socket.on('watch:sync', (data) => this.handleWatchSync(socket, data));
            socket.on('watch:play', (data) => this.handleWatchPlay(socket, data));
            socket.on('watch:pause', (data) => this.handleWatchPause(socket, data));
            socket.on('watch:seek', (data) => this.handleWatchSeek(socket, data));
            socket.on('watch:load-url', (data) => this.handleWatchLoadUrl(socket, data));

            // ── Disconnect ──
            socket.on('disconnect', (reason) => {
                console.log(`❌ Client disconnected: ${socket.id} — ${reason}`);
                this.handleRoomLeave(socket);
            });
        });

        console.log('📡 Socket.io router initialized');
    }

    // ── Room Handlers ──

    handleRoomJoin(socket, { roomCode, displayName }) {
        if (!roomCode || !displayName) {
            socket.emit('room:error', { message: 'Room code and display name are required' });
            return;
        }

        const room = this.roomManager.getRoom(roomCode);
        if (!room) {
            // Auto-create the room if it doesn't exist (created via REST earlier)
            this.roomManager.createRoom(roomCode);
        }

        const participant = {
            id: socket.id,
            displayName,
            micEnabled: true,
            camEnabled: true,
            joinedAt: Date.now(),
        };

        this.roomManager.addParticipant(roomCode, participant);
        socket.join(roomCode);
        socket.roomCode = roomCode;

        const updatedRoom = this.roomManager.getRoom(roomCode);

        // Tell the joiner about the room state
        socket.emit('room:joined', {
            roomCode,
            participants: updatedRoom.participants,
            hostId: updatedRoom.hostId,
            activeHub: updatedRoom.activeHub,
        });

        // Tell everyone else about the new participant
        socket.to(roomCode).emit('room:participant-joined', {
            participant,
            participants: updatedRoom.participants,
            hostId: updatedRoom.hostId,
        });

        console.log(`👤 ${displayName} (${socket.id}) joined room ${roomCode} — ${updatedRoom.participants.length} total`);
    }

    handleRoomLeave(socket) {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const result = this.roomManager.removeParticipant(roomCode, socket.id);
        if (!result) return;

        socket.leave(roomCode);
        socket.roomCode = null;

        const { room, removedParticipant, newHostId } = result;

        if (room) {
            // Room still has participants
            this.io.to(roomCode).emit('room:participant-left', {
                participantId: socket.id,
                displayName: removedParticipant?.displayName,
                participants: room.participants,
                hostId: room.hostId,
                hostChanged: newHostId !== null,
            });

            if (newHostId) {
                console.log(`👑 Host transferred to ${newHostId} in room ${roomCode}`);
            }
        }

        console.log(`👤 ${removedParticipant?.displayName || socket.id} left room ${roomCode}`);
    }

    handleRoomRejoin(socket, { roomCode, displayName }) {
        // Simply rejoin — treat like a fresh join with state restore
        this.handleRoomJoin(socket, { roomCode, displayName });
        console.log(`🔄 ${displayName} rejoined room ${roomCode}`);
    }

    handleSetHub(socket, { activeHub }) {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const success = this.roomManager.setActiveHub(roomCode, socket.id, activeHub);

        if (success) {
            // Broadcast the new hub state to everyone in the room
            this.io.to(roomCode).emit('room:hub-updated', { activeHub });
            console.log(`🎮 Hub set to '${activeHub}' in room ${roomCode} by host ${socket.id}`);
        } else {
            // Inform the client they are not authorized
            socket.emit('room:error', { message: 'Only the host can change the active activity' });
        }
    }

    // ── Game Handlers ──

    handleGameStart(socket, { gameType }) {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = this.roomManager.getRoom(roomCode);
        if (!room) return;

        // Only host can start games
        if (room.hostId !== socket.id) {
            socket.emit('room:error', { message: 'Only the host can start a game' });
            return;
        }

        // Need at least 2 players
        if (room.participants.length < 2) {
            socket.emit('room:error', { message: 'Need at least 2 players to start a game' });
            return;
        }

        try {
            // Pick the first 2 participants as players for the game
            const players = room.participants.slice(0, 2).map(p => ({
                id: p.id,
                displayName: p.displayName
            }));

            const game = GameFactory.create(gameType, roomCode, players);
            game.start();
            this.activeGames.set(roomCode, game);

            // Broadcast game state to the entire room
            this.io.to(roomCode).emit('game:state-update', game.getState());
            console.log(`🎮 Game '${gameType}' started in room ${roomCode}`);
        } catch (err) {
            socket.emit('room:error', { message: err.message });
        }
    }

    handleGameMove(socket, { move }) {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const game = this.activeGames.get(roomCode);
        if (!game) {
            socket.emit('room:error', { message: 'No active game in this room' });
            return;
        }

        const valid = game.handleMove(socket.id, move);
        if (valid) {
            this.io.to(roomCode).emit('game:state-update', game.getState());
        } else {
            socket.emit('game:invalid-move', { message: 'Invalid move' });
        }
    }

    handleGameReset(socket) {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = this.roomManager.getRoom(roomCode);
        if (!room || room.hostId !== socket.id) {
            socket.emit('room:error', { message: 'Only the host can reset the game' });
            return;
        }

        const game = this.activeGames.get(roomCode);
        if (!game) return;

        game.reset();
        this.io.to(roomCode).emit('game:state-update', game.getState());
        console.log(`🔄 Game reset in room ${roomCode}`);
    }

    // ── Watch Handlers ──

    _getOrCreateWatchEngine(roomCode) {
        if (!this.activeWatches.has(roomCode)) {
            this.activeWatches.set(roomCode, new WatchSyncEngine(roomCode));
        }
        return this.activeWatches.get(roomCode);
    }

    _verifyHost(socket, roomCode) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room) return false;
        if (room.hostId !== socket.id) {
            socket.emit('room:error', { message: 'Only the host can control playback' });
            return false;
        }
        return true;
    }

    handleWatchSync(socket, data) {
        const roomCode = socket.roomCode;
        if (!roomCode || !this._verifyHost(socket, roomCode)) return;

        const engine = this._getOrCreateWatchEngine(roomCode);
        engine.sync(data);

        // Broadcast to everyone else (avoid latency loop for the host)
        socket.to(roomCode).emit('watch:state-update', engine.getState());
    }

    handleWatchPlay(socket, { currentTime }) {
        const roomCode = socket.roomCode;
        if (!roomCode || !this._verifyHost(socket, roomCode)) return;

        const engine = this._getOrCreateWatchEngine(roomCode);
        engine.play(currentTime);
        this.io.to(roomCode).emit('watch:state-update', engine.getState());
        console.log(`▶️ Video playing in room ${roomCode} at ${currentTime}s`);
    }

    handleWatchPause(socket, { currentTime }) {
        const roomCode = socket.roomCode;
        if (!roomCode || !this._verifyHost(socket, roomCode)) return;

        const engine = this._getOrCreateWatchEngine(roomCode);
        engine.pause(currentTime);
        this.io.to(roomCode).emit('watch:state-update', engine.getState());
        console.log(`⏸️ Video paused in room ${roomCode} at ${currentTime}s`);
    }

    handleWatchSeek(socket, { currentTime }) {
        const roomCode = socket.roomCode;
        if (!roomCode || !this._verifyHost(socket, roomCode)) return;

        const engine = this._getOrCreateWatchEngine(roomCode);
        engine.seek(currentTime);
        this.io.to(roomCode).emit('watch:state-update', engine.getState());
        console.log(`⏭️ Video seeked to ${currentTime}s in room ${roomCode}`);
    }

    handleWatchLoadUrl(socket, { url }) {
        const roomCode = socket.roomCode;
        if (!roomCode || !this._verifyHost(socket, roomCode)) return;

        const engine = this._getOrCreateWatchEngine(roomCode);
        engine.loadUrl(url);
        this.io.to(roomCode).emit('watch:state-update', engine.getState());
        console.log(`📺 Video URL loaded in room ${roomCode}: ${url}`);
    }
}
