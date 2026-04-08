import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import roomRoutes from './routes/roomRoutes.js';
import livekitRoutes from './routes/livekitRoutes.js';
import { SocketRouter } from './socket/SocketRouter.js';

// Add global error handlers early
process.on('uncaughtException', (err) => {
    console.error(' UNCAUGHT EXCEPTION:', err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(' UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

dotenv.config();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3001;
// Support both single URL and comma-separated multiple URLs
const defaultOrigins = ['http://localhost:5173', 'https://playxtogether.vercel.app'];
const clientEnv = process.env.CLIENT_URL;
const CLIENT_URLS = clientEnv
    ? (clientEnv.includes(',') ? clientEnv.split(',').map(u => u.trim()) : [clientEnv, ...defaultOrigins])
    : defaultOrigins;

// Middleware
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(cors({
    origin: CLIENT_URLS,
    credentials: true
}));
app.use(express.json());

// REST routes
app.use('/api/rooms', roomRoutes);
app.use('/api/livekit', livekitRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
        allowedOrigins: CLIENT_URLS
    });
});

// Socket.io setup
const io = new Server(httpServer, {
    cors: {
        origin: CLIENT_URLS,
        methods: ['GET', 'POST'],
        credentials: true
    },
});

// Initialize socket routing
const socketRouter = new SocketRouter(io);
socketRouter.init();

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PlayTogether server running on port ${PORT}`);
    console.log(`📡 Accepting connections from: ${Array.isArray(CLIENT_URLS) ? CLIENT_URLS.join(', ') : CLIENT_URLS}`);
});
