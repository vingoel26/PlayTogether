import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

/**
 * useSocket — Manages Socket.io connection lifecycle
 * Auto-connects, auto-reconnects, provides emit/on/off helpers
 */
export function useSocket() {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socket = io(SERVER_URL, {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 30000,
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('🔌 Socket connected:', socket.id);
            setIsConnected(true);
        });

        socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
            setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.warn('🔌 Socket connection error:', err.message);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    const emit = useCallback((event, data) => {
        socketRef.current?.emit(event, data);
    }, []);

    const on = useCallback((event, handler) => {
        socketRef.current?.on(event, handler);
        return () => socketRef.current?.off(event, handler);
    }, []);

    const off = useCallback((event, handler) => {
        socketRef.current?.off(event, handler);
    }, []);

    return {
        socket: socketRef.current,
        isConnected,
        emit,
        on,
        off,
    };
}
