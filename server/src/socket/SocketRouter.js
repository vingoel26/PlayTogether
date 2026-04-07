export class SocketRouter {
    constructor(io) {
        this.io = io;
    }

    init() {
        this.io.on('connection', (socket) => {
            console.log(`✅ Client connected: ${socket.id}`);

            socket.on('disconnect', (reason) => {
                console.log(`❌ Client disconnected: ${socket.id} — ${reason}`);
            });
        });

        console.log('📡 Socket.io router initialized');
    }
}
