import { Router } from 'express';
import { RoomManager } from '../services/RoomManager.js';
import { generateRoomCode } from '../utils/generateRoomCode.js';

const router = Router();
const roomManager = new RoomManager(); // Singleton — shares state with SocketRouter

// POST /api/rooms — Create a new room
router.post('/', (req, res) => {
    const code = generateRoomCode();
    roomManager.createRoom(code);
    res.status(201).json({ code });
});

// GET /api/rooms/:code — Check if room exists
router.get('/:code', (req, res) => {
    const { code } = req.params;
    const room = roomManager.getRoom(code);
    if (room) {
        res.json({
            code: room.code,
            participantCount: room.participants.length,
            exists: true,
        });
    } else {
        res.status(404).json({ exists: false, message: 'Room not found' });
    }
});

export default router;
