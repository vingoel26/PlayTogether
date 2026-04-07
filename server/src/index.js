import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import roomRoutes from './routes/roomRoutes.js';
import livekitRoutes from './routes/livekitRoutes.js';
import { SocketRouter } from './socket/SocketRouter.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// REST routes
app.use('/api/rooms', roomRoutes);
app.use('/api/livekit', livekitRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io setup
const io = new Server(httpServer, {
    cors: {
        origin: CLIENT_URL,
        methods: ['GET', 'POST'],
    },
});

// Initialize socket routing
const socketRouter = new SocketRouter(io);
socketRouter.init();

// Start server
httpServer.listen(PORT, () => {
    console.log(`🚀 PlayTogether server running on port ${PORT}`);
    console.log(`📡 Accepting connections from ${CLIENT_URL}`);
});
