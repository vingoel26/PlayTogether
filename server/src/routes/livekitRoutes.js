import { Router } from 'express';
import { LiveKitService } from '../services/LiveKitService.js';
import { RoomManager } from '../services/RoomManager.js';

const router = Router();
const liveKitService = new LiveKitService();
const roomManager = new RoomManager();

// POST /api/livekit/token
router.post('/token', async (req, res) => {
    try {
        const { roomCode, participantName, participantId } = req.body;

        if (!roomCode || !participantName || !participantId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify room actually exists
        const room = roomManager.getRoom(roomCode);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        const isHost = room.hostId === participantId;

        // Generate secure LiveKit access token
        const token = await liveKitService.createToken(roomCode, participantName, participantId, isHost);
        res.json({ token });
    } catch (err) {
        console.error('LiveKit Token Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;
