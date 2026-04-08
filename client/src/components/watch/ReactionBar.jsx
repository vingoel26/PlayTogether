import React from 'react';
import { useSocket } from '../../hooks/useSocket.js';

const EMOJIS = ['😂', '😲', '🔥', '😍', '😭', '👏'];

export default function ReactionBar() {
    const { emit } = useSocket();

    const handleReact = (emoji) => {
        emit('watch:react', { emoji });
    };

    return (
        <div style={{
            background: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            padding: '12px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
            color: 'var(--color-text-on-dark)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'
        }}>
            {EMOJIS.map(emoji => (
                <button
                    key={emoji}
                    onClick={() => handleReact(emoji)}
                    className="hover:scale-125 transition-transform"
                    style={{
                        background: 'transparent', border: 'none',
                        fontSize: 32, cursor: 'pointer',
                        padding: 8,
                        filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))'
                    }}
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
}
