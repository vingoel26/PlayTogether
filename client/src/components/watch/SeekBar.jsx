import React, { useRef, useState, useCallback, useEffect } from 'react';

/**
 * SeekBar — Custom video progress bar
 */
export default function SeekBar({ 
    played, 
    loaded, 
    duration, 
    onSeekStart, 
    onSeekChange, 
    onSeekEnd 
}) {
    const trackRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [hoverPos, setHoverPos] = useState(null); // percentage 0-1
    const [localPlayed, setLocalPlayed] = useState(played);

    // Sync local state if not dragging
    useEffect(() => {
        if (!isDragging) {
            setLocalPlayed(played);
        }
    }, [played, isDragging]);

    const calculatePercentage = (clientX) => {
        if (!trackRef.current) return 0;
        const rect = trackRef.current.getBoundingClientRect();
        let perc = (clientX - rect.left) / rect.width;
        perc = Math.max(0, Math.min(1, perc));
        return perc;
    };

    const handlePointerDown = (e) => {
        const perc = calculatePercentage(e.clientX);
        setIsDragging(true);
        setLocalPlayed(perc);
        if (onSeekStart) onSeekStart(perc);
        if (onSeekChange) onSeekChange(perc);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        const perc = calculatePercentage(e.clientX);
        setHoverPos(perc);

        if (isDragging) {
            setLocalPlayed(perc);
            if (onSeekChange) onSeekChange(perc);
        }
    };

    const handlePointerUp = (e) => {
        if (isDragging) {
            setIsDragging(false);
            const perc = calculatePercentage(e.clientX);
            if (onSeekEnd) onSeekEnd(perc);
        }
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const handlePointerLeave = () => {
        setHoverPos(null);
    };
    
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Calculate times
    const currentTime = localPlayed * duration;
    const hoverTime = hoverPos !== null ? hoverPos * duration : 0;

    return (
        <div 
            ref={trackRef}
            style={{
                position: 'relative',
                height: 24, // bigger click target
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                touchAction: 'none'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
        >
            {/* Visual Track Container */}
            <div style={{
                position: 'relative',
                width: '100%',
                height: isDragging || hoverPos !== null ? 6 : 4,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 2,
                transition: 'height 100ms ease'
            }}>
                {/* Loaded Buffer (Optional if you pass loaded) */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, bottom: 0,
                    width: `${(loaded || 0) * 100}%`,
                    background: 'rgba(255,255,255,0.4)',
                    borderRadius: 2,
                    pointerEvents: 'none'
                }} />

                {/* Played Progress */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, bottom: 0,
                    width: `${localPlayed * 100}%`,
                    background: 'var(--color-blue)',
                    borderRadius: 2,
                    pointerEvents: 'none'
                }} />

                {/* Scrubber Handle */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${localPlayed * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 14,
                    height: 14,
                    background: 'var(--color-blue)',
                    borderRadius: '50%',
                    opacity: isDragging || hoverPos !== null ? 1 : 0,
                    transition: 'opacity 100ms ease, transform 100ms ease',
                    pointerEvents: 'none',
                    boxShadow: '0 0 6px rgba(0,0,0,0.5)'
                }} />
                
                {/* Hover Tooltip (Timestamp) */}
                {hoverPos !== null && (
                    <div style={{
                        position: 'absolute',
                        bottom: 16,
                        left: `${hoverPos * 100}%`,
                        transform: 'translateX(-50%)',
                        background: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                        fontWeight: 500
                    }}>
                        {formatTime(hoverTime)}
                    </div>
                )}
            </div>
        </div>
    );
}
