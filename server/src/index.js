import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

// ── Allowed Origins (whitelist-based) ──────────────────────────────────────
const defaultOrigins = ['http://localhost:5173', 'https://playxtogether.vercel.app'];
const clientEnv = process.env.CLIENT_URL;
const CLIENT_URLS = clientEnv
    ? (clientEnv.includes(',') ? clientEnv.split(',').map(u => u.trim()) : [clientEnv, ...defaultOrigins])
    : defaultOrigins;

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. server-to-server, curl)
        if (!origin || CLIENT_URLS.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`🚫 CORS blocked origin: ${origin}`);
            callback(new Error(`Origin ${origin} not allowed by CORS policy`));
        }
    },
    credentials: true,
};

// ── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
    // Allow iframes for LiveKit embed scenarios but keep everything else strict
    frameguard: { action: 'sameorigin' },
    crossOriginEmbedderPolicy: false,
}));

app.use(cors(corsOptions));
app.use(express.json());

// ── Rate Limiting (REST API routes only) ─────────────────────────────────────
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // 100 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});

// ── Request Logger ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
});

// ── REST Routes ───────────────────────────────────────────────────────────────
app.use('/api/rooms', apiLimiter, roomRoutes);
app.use('/api/livekit', apiLimiter, livekitRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
        allowedOrigins: CLIENT_URLS,
    });
});

// ── Socket.io Setup ───────────────────────────────────────────────────────────
const io = new Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || CLIENT_URLS.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`Origin ${origin} not allowed`));
            }
        },
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Initialize socket routing
const socketRouter = new SocketRouter(io);
socketRouter.init();

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PlayTogether server running on port ${PORT}`);
    console.log(`🔒 CORS whitelist: ${CLIENT_URLS.join(', ')}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
