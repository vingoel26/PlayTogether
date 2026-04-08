import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';

const SERVER_ENV = import.meta.env.VITE_SERVER_URL || '';
const SERVER_URL = SERVER_ENV || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin);

// Global singleton socket instance
let globalSocket = null;
let connectionState = false;
let listeners = new Set();

const notifyListeners = () => listeners.forEach(fn => fn(connectionState));

export function useSocket() {
    const [isConnected, setIsConnected] = useState(connectionState);

    useEffect(() => {
        // Register listener for reactive updates
        listeners.add(setIsConnected);

        if (!globalSocket) {
            globalSocket = io(SERVER_URL, {
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 30000,
                transports: ['polling', 'websocket'],
            });

            // Attach global listeners
            globalSocket.on('connect', () => {
                console.log('🔌 Socket connected:', globalSocket.id);
                connectionState = true;
                notifyListeners();
            });

            globalSocket.on('disconnect', (reason) => {
                console.log('🔌 Socket disconnected:', reason);
                connectionState = false;
                notifyListeners();
            });

            globalSocket.on('connect_error', (err) => {
                console.warn('🔌 Socket connection error:', err.message);
            });
        }

        return () => {
            listeners.delete(setIsConnected);
            // We intentionally do NOT disconnect the singleton socket on unmount
            // because other components still rely on it!
        };
    }, []);

    const emit = useCallback((event, data) => {
        globalSocket?.emit(event, data);
    }, []);

    const on = useCallback((event, handler) => {
        globalSocket?.on(event, handler);
        return () => globalSocket?.off(event, handler);
    }, []);

    const off = useCallback((event, handler) => {
        globalSocket?.off(event, handler);
    }, []);

    return {
        socket: globalSocket,
        isConnected,
        emit,
        on,
        off,
    };
}
