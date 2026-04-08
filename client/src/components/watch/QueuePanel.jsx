import React, { useState } from 'react';
import { useRoom } from '../../contexts/RoomContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function QueuePanel({ queue, enqueueUrl, removeQueuedUrl }) {
    const { displayName } = useRoom();
    const [tempUrl, setTempUrl] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        const url = tempUrl.trim();
        if (url) {
            enqueueUrl(url, displayName || 'Anonymous');
            setTempUrl('');
        }
    };

    return (
        <div style={{
            width: '100%', height: '100%',
            borderLeft: '1px solid var(--color-border)',
            display: 'flex', flexDirection: 'column', 
            color: 'var(--color-text-on-dark)'
        }}>
            {/* Header */}
            <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Up Next</h3>
                <span style={{ fontSize: 12, color: 'var(--color-text-on-dark-dim)' }}>
                    {queue.length} video{queue.length !== 1 && 's'} in queue
                </span>
            </div>
            
            {/* Queue List */}
            <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
                {queue.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 16 }}>queue_music</span>
                        <p style={{ margin: 0, fontSize: 13 }}>Queue is empty.</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: 11 }}>Add a video below.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <AnimatePresence>
                            {queue.map((item, index) => (
                                <motion.div 
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: 8, padding: 12,
                                        position: 'relative',
                                        display: 'flex', flexDirection: 'column', gap: 4
                                    }}
                                >
                                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-blue)', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>#{index + 1}</span>
                                        <button 
                                            onClick={() => removeQueuedUrl(item.id)}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-on-dark-dim)', cursor: 'pointer' }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                                        </button>
                                    </div>
                                    <div style={{ fontSize: 13, wordBreak: 'break-all', opacity: 0.9 }}>
                                        {item.url}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--color-text-on-dark-dim)', marginTop: 4 }}>
                                        Added by {item.addedBy}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleAdd} style={{ padding: 16, borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input 
                        type="text" 
                        placeholder="Paste URL..." 
                        value={tempUrl}
                        onChange={(e) => setTempUrl(e.target.value)}
                        style={{
                            flex: 1, padding: '8px 12px', minWidth: 0,
                            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 6, color: 'white', fontSize: 13, outline: 'none'
                        }}
                    />
                    <button 
                        type="submit"
                        disabled={!tempUrl.trim()}
                        style={{
                            background: 'var(--color-blue)', color: 'white', border: 'none',
                            borderRadius: 6, padding: '0 16px', fontWeight: 600, cursor: tempUrl.trim() ? 'pointer' : 'not-allowed',
                            opacity: tempUrl.trim() ? 1 : 0.5
                        }}
                    >
                        Add
                    </button>
                </div>
            </form>
        </div>
    );
}
