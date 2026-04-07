import { RoomManager } from '../services/RoomManager.js';

/**
 * SocketRouter — Central mediator for all Socket.io events
 * Dispatches to room, game, and watch handlers
 */
export class SocketRouter {
    constructor(io) {
        this.io = io;
        this.roomManager = new RoomManager();
    }

    init() {
        this.io.on('connection', (socket) => {
            console.log(`✅ Client connected: ${socket.id}`);

            // ── Room Events ──
            socket.on('room:join', (data) => this.handleRoomJoin(socket, data));
            socket.on('room:leave', () => this.handleRoomLeave(socket));
            socket.on('room:rejoin', (data) => this.handleRoomRejoin(socket, data));
            socket.on('room:set-hub', (data) => this.handleSetHub(socket, data));

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
}
