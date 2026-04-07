export default {
    port: process.env.PORT || 3001,
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    livekit: {
        apiKey: process.env.LIVEKIT_API_KEY || '',
        apiSecret: process.env.LIVEKIT_API_SECRET || '',
        wsUrl: process.env.LIVEKIT_WS_URL || '',
    },
};
