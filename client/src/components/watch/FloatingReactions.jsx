import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../hooks/useSocket.js';

export default function FloatingReactions() {
    const { on } = useSocket();
    const [reactions, setReactions] = useState([]);

    useEffect(() => {
        const unsub = on('watch:reacted', (data) => {
            // data has { id, emoji, userId }
            // Add custom randomness for floating path
            const newReaction = {
                ...data,
                // Spread evenly across the bottom width instead of just center
                left: Math.random() * 80 + 10, // 10% to 90%
                duration: 2 + Math.random() * 1.5 // 2s to 3.5s
            };
            
            setReactions(prev => [...prev, newReaction]);
            
            // Clean up old reactions after their animation ends
            setTimeout(() => {
                setReactions(prev => prev.filter(r => r.id !== data.id));
            }, newReaction.duration * 1000 + 500); // Pad cleanup time
        });

        return unsub;
    }, [on]);

    return (
        <div style={{
            position: 'absolute', inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 40 // Above video, beneath actual controls and sidebars
        }}>
            <AnimatePresence>
                {reactions.map((r) => (
                    <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 100, scale: 0.5 }}
                        animate={{ 
                            opacity: [0, 1, 1, 0], 
                            y: [100, -100, -300, -500], 
                            scale: [0.5, 1.5, 1, 0.8] 
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: r.duration, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: `${r.left}%`,
                            fontSize: 48,
                            filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.5))',
                            willChange: 'transform, opacity'
                        }}
                    >
                        {r.emoji}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
