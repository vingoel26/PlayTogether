import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { useRoom } from '../../contexts/RoomContext.jsx';
import { useSocket } from '../../hooks/useSocket.js';
import SeekBar from './SeekBar.jsx';

/**
 * VideoPlayer — Custom wrapper around ReactPlayer
 * Adds synchronized host-only controls, seek bar, volume, and fullscreen
 */
// Extract default to handle Vite CommonJS import mismatch
const PlayerComponent = ReactPlayer.default || ReactPlayer;

export default function VideoPlayer({ playerRef, watchState, syncDrift, isSynced, play, pause, seek, playNext }) {
    const { hostId } = useRoom();
    const { socket } = useSocket();
    const isHost = socket?.id === hostId;

    const containerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    const playing = watchState.playing;
    const currentMedia = { url: watchState.url };
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    
    // Controls Auto-Hide just for the overlay badges
    const [showControls, setShowControls] = useState(true);
    const lastPlayedSecondsRef = useRef(0);

    const handleMouseMove = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    }, []);

    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, []);

    // Video Events
    const handleProgress = (state) => {
        setPlayed(state.played);
        
        if (isHost) {
            const currentSeconds = state.playedSeconds;
            const lastSeconds = lastPlayedSecondsRef.current;
            
            // If time jumps by more than 1.5s, it was a manual seek/skip!
            if (Math.abs(currentSeconds - lastSeconds) > 1.5) {
                seek(currentSeconds);
            }
            lastPlayedSecondsRef.current = currentSeconds;
        }
    };

    const handleDuration = (dur) => setDuration(dur);

    if (!currentMedia?.url) {
        return (
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 16,
                color: 'var(--color-text-on-dark-dim)', background: '#000',
            }}>
                <span className="material-symbols-outlined" style={{ fontSize: 64, opacity: 0.3 }}>smart_display</span>
                <p style={{ margin: 0, fontSize: 14 }}>No video loaded. Add a URL to the queue to begin.</p>
            </div>
        );
    }

    return (
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setShowControls(false)}
            onClick={() => handleMouseMove()} // Mobile tap to show
            style={{ 
                position: 'absolute', inset: 0, 
                backgroundColor: 'black', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                pointerEvents: isHost ? 'auto' : 'none' // Prevent guests from touching native controls!
            }}
        >
            <PlayerComponent
                ref={playerRef}
                url={currentMedia.url}
                width="100%"
                height="100%"
                playing={playing}
                controls={true}
                onProgress={handleProgress}
                onDuration={handleDuration}
                onPlay={() => { if (isHost && !playing) play(playerRef.current?.getCurrentTime() || 0); }}
                onPause={() => { if (isHost && playing) pause(playerRef.current?.getCurrentTime() || 0); }}
                onSeek={(seconds) => { if (isHost) seek(seconds); }}
                onEnded={() => { if (isHost) playNext(); }}
                onReady={() => console.log('Video Ready!')}
                onStart={() => console.log('Video Started!')}
                onError={(e) => console.error('ReactPlayer Error:', e)}
                style={{ position: 'absolute', top: 0, left: 0 }}
            />

            {/* SYNC Badge (Top Left Overlay) */}
            <div style={{
                position: 'absolute', top: 16, left: 16,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                padding: '4px 8px', borderRadius: 6,
                display: 'flex', alignItems: 'center', gap: 6,
                color: isSynced ? '#8AB4F8' : '#F29900', // Cyan vs Amber
                fontSize: 12, fontWeight: 600,
                transition: 'opacity 300ms ease',
                opacity: showControls ? 1 : 0
            }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    {isSynced ? 'sync' : 'sync_problem'}
                </span>
                {isSynced ? 'SYNCED' : `DRIFT (${Math.round(syncDrift)}ms)`}
            </div>
            
            {/* Guest Hint Badge */}
            {!isHost && (
                <div style={{
                    position: 'absolute', bottom: 16, right: 16,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    padding: '6px 12px', borderRadius: 6,
                    color: 'var(--color-text-on-dark-dim)', fontSize: 12, fontWeight: 600,
                    transition: 'opacity 300ms ease',
                    opacity: showControls ? 1 : 0
                }}>
                    Host Controls Playback
                </div>
            )}
        </div>
    );
}
