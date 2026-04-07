import { Router } from 'express';
import { generateRoomCode } from '../utils/generateRoomCode.js';

const router = Router();

// In-memory room store (Phase 1)
const rooms = new Map();

// POST /api/rooms — Create a new room
router.post('/', (req, res) => {
    const code = generateRoomCode();
    rooms.set(code, {
        code,
        createdAt: new Date().toISOString(),
        hostId: null,
        participants: [],
    });
    res.status(201).json({ code });
});

// GET /api/rooms/:code — Check if room exists
router.get('/:code', (req, res) => {
    const { code } = req.params;
    if (rooms.has(code)) {
        const room = rooms.get(code);
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
