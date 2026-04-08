import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket.js';
import { useRoom } from '../contexts/RoomContext.jsx';

/**
 * useWatchSync — Client-side synchronization hook for Watch Party
 * Listens to state updates from host to sync non-hosts, and exposes actions for the host
 */
export function useWatchSync(playerRef, duration) {
    const { socket, on, emit } = useSocket();
    const { hostId } = useRoom();
    const isHost = socket?.id === hostId;

    const [watchState, setWatchState] = useState({
        url: null,
        playing: false,
        currentTime: 0,
        updatedAt: Date.now(),
        serverTime: Date.now(),
        queue: []
    });

    const [syncDrift, setSyncDrift] = useState(0);
    const [isSynced, setIsSynced] = useState(true);

    const SYNC_THRESHOLD_MS = 1500; // Increased to prevent micro-stuttering on minor network jitters
    const lastSyncSentRef = useRef(0);

    // Initial / Server State Sync
    useEffect(() => {
        const unsub = on('watch:state-update', (state) => {
            const localReceivedTime = Date.now();
            setWatchState({ ...state, localReceivedTime });

            if (!isHost && playerRef.current) {
                // If we are guest, we might need to hard-seek if we drifted
                const clientTime = playerRef.current.getCurrentTime();

                // Compensate for network flight latency if the video is actively playing!
                const flightLatencyMs = Math.max(0, localReceivedTime - state.serverTime);
                const expectedHostTime = state.playing
                    ? state.currentTime + (flightLatencyMs / 1000)
                    : state.currentTime;

                if (clientTime !== null && clientTime !== undefined) {
                    const driftMs = Math.abs(clientTime - expectedHostTime) * 1000;
                    setSyncDrift(driftMs);

                    if (driftMs > SYNC_THRESHOLD_MS) {
                        setIsSynced(false);
                        playerRef.current.seekTo(expectedHostTime, 'seconds');
                        setTimeout(() => setIsSynced(true), 500); // Visual indicator reset
                    } else {
                        setIsSynced(true);
                    }
                }
            }
        });

        return unsub;
    }, [on, isHost, playerRef]);

    // Host Periodic Heartbeat (every 5 seconds)
    useEffect(() => {
        if (!isHost || !playerRef?.current) return;

        const interval = setInterval(() => {
            const time = playerRef.current.getCurrentTime();
            if (time !== null) {
                emit('watch:sync', {
                    currentTime: time,
                    playing: watchState.playing
                });
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [isHost, playerRef, emit, watchState.playing]);

    // Actions (Host Only)
    const play = useCallback((currentTime) => {
        if (!isHost) return;
        setWatchState(prev => ({ ...prev, playing: true }));
        emit('watch:play', { currentTime });
    }, [isHost, emit]);

    const pause = useCallback((currentTime) => {
        if (!isHost) return;
        setWatchState(prev => ({ ...prev, playing: false }));
        emit('watch:pause', { currentTime });
    }, [isHost, emit]);

    const seek = useCallback((currentTime) => {
        if (!isHost) return;
        setWatchState(prev => ({ ...prev, currentTime }));
        emit('watch:seek', { currentTime });
    }, [isHost, emit]);

    const loadUrl = useCallback((url) => {
        if (!isHost) return;
        emit('watch:load-url', { url });
    }, [isHost, emit]);

    const enqueueUrl = useCallback((url, displayName) => {
        emit('watch:queue-add', { url, displayName });
    }, [emit]);

    const removeQueuedUrl = useCallback((id) => {
        emit('watch:queue-remove', { id });
    }, [emit]);

    const playNext = useCallback(() => {
        if (!isHost) return;
        emit('watch:queue-dequeue');
    }, [isHost, emit]);

    return {
        watchState: {
            ...watchState,
            queue: watchState.queue || []
        },
        syncDrift,
        isSynced,
        play,
        pause,
        seek,
        loadUrl,
        enqueueUrl,
        removeQueuedUrl,
        playNext
    };
}
