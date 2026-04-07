/**
 * RoomManager — In-memory room state management (Singleton pattern)
 * Handles room CRUD, participant tracking, and host transfer
 */
export class RoomManager {
    constructor() {
        if (RoomManager.instance) return RoomManager.instance;
        this.rooms = new Map();
        RoomManager.instance = this;
    }

    createRoom(code) {
        if (this.rooms.has(code)) return this.rooms.get(code);

        const room = {
            code,
            hostId: null,
            participants: [],
            createdAt: Date.now(),
            activeGame: null,
            watchState: null,
        };
        this.rooms.set(code, room);
        return room;
    }

    getRoom(code) {
        return this.rooms.get(code) || null;
    }

    addParticipant(code, participant) {
        const room = this.rooms.get(code);
        if (!room) return null;

        // Remove existing entry if same id (reconnection case)
        room.participants = room.participants.filter((p) => p.id !== participant.id);
        room.participants.push(participant);

        // Auto-assign host if none
        if (!room.hostId) {
            room.hostId = participant.id;
        }

        return room;
    }

    removeParticipant(code, participantId) {
        const room = this.rooms.get(code);
        if (!room) return null;

        const removedParticipant = room.participants.find((p) => p.id === participantId);
        if (!removedParticipant) return null;

        room.participants = room.participants.filter((p) => p.id !== participantId);

        let newHostId = null;

        // Host transfer if host left
        if (room.hostId === participantId) {
            if (room.participants.length > 0) {
                // Promote the earliest-joined participant
                const sorted = [...room.participants].sort((a, b) => a.joinedAt - b.joinedAt);
                room.hostId = sorted[0].id;
                newHostId = room.hostId;
            } else {
                // Room is empty — clean up
                this.rooms.delete(code);
                return { room: null, removedParticipant, newHostId: null };
            }
        }

        return { room, removedParticipant, newHostId };
    }

    getRoomParticipants(code) {
        const room = this.rooms.get(code);
        return room ? room.participants : [];
    }

    getRoomCount() {
        return this.rooms.size;
    }
}
