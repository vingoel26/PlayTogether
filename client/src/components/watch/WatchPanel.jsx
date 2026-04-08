import React, { useRef, useState } from 'react';
import VideoPlayer from './VideoPlayer.jsx';
import ReactionBar from './ReactionBar.jsx';
import QueuePanel from './QueuePanel.jsx';
import FloatingReactions from './FloatingReactions.jsx';
import { useWatchSync } from '../../hooks/useWatchSync.js';
import { useRoom } from '../../contexts/RoomContext.jsx';
import { useSocket } from '../../hooks/useSocket.js';

export default function WatchPanel() {
    const playerRef = useRef(null);
    const { watchState, loadUrl, enqueueUrl, removeQueuedUrl, playNext, syncDrift, isSynced, play, pause, seek } = useWatchSync(playerRef);
    const [tempUrl, setTempUrl] = useState('');
    
    const { hostId } = useRoom();
    const { socket } = useSocket();
    const isHost = socket?.id === hostId;

    return (
        <div style={{
            display: 'flex', width: '100%', height: '100%',
            background: 'var(--color-surface)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Collapsible Add Video Bar (Top) - Host Only */}
            {isHost && (
                <div className="group absolute top-0 left-0 w-full z-30">
                    <div className="absolute top-0 w-full h-8 flex items-center justify-center cursor-pointer group-hover:opacity-0 transition-opacity" style={{ background: 'rgba(0,0,0,0.5)', color: 'var(--color-text-on-dark-dim)' }}>
                        <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Add Video</span>
                    </div>
                    <div className="-translate-y-full group-hover:translate-y-0 transition-transform duration-300 w-full bg-black/90 backdrop-blur-md border-b border-white/10 p-4 flex justify-center shadow-2xl">
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', maxWidth: 600, width: '100%' }}>
                            <span className="material-symbols-outlined text-white/50">smart_display</span>
                            <input 
                                type="text" placeholder="Paste YouTube/Vimeo/MP4 URL..." 
                                value={tempUrl} onChange={e => setTempUrl(e.target.value)}
                                style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: '#1c1c1c', color: 'white', outline: 'none' }}
                            />
                            <button 
                                onClick={() => { 
                                    const parsedUrl = tempUrl.trim();
                                    if (parsedUrl) { 
                                        loadUrl(parsedUrl); 
                                        setTempUrl(''); 
                                    } 
                                }} 
                                style={{ padding: '10px 24px', background: 'var(--color-blue)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                            >
                                Play Video
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Video Area */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                minWidth: 0,
                position: 'relative'
            }}>
                {/* Video Area */}
                <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
                    <VideoPlayer 
                        playerRef={playerRef}
                        watchState={watchState}
                        syncDrift={syncDrift}
                        isSynced={isSynced}
                        play={play}
                        pause={pause}
                        seek={seek}
                        playNext={playNext}
                    />
                    <FloatingReactions />
                </div>
                
                {/* Collapsible Reactions (Bottom) - using Tailwind group hover */}
                <div className="group absolute bottom-0 left-0 w-full z-20">
                    <div className="absolute bottom-0 w-full h-8 flex items-center justify-center cursor-pointer group-hover:opacity-0 transition-opacity" style={{ background: 'rgba(0,0,0,0.5)', color: 'var(--color-text-on-dark-dim)' }}>
                        <span className="material-symbols-outlined text-sm">keyboard_arrow_up</span>
                    </div>
                    <div className="translate-y-full group-hover:translate-y-0 transition-transform duration-300 w-full">
                        <ReactionBar />
                    </div>
                </div>
            </div>

            {/* Hover Trigger Area for right sidebar using Tailwind group */}
            <div className="group absolute top-0 right-0 h-full z-20 w-8 hover:w-[280px] transition-all duration-300">
                {/* Helper tab when collapsed */}
                <div className="absolute top-0 right-0 w-8 h-full bg-black/50 border-l border-white/10 flex items-center justify-center text-white/50 cursor-pointer group-hover:opacity-0 transition-opacity">
                    <span className="material-symbols-outlined">queue_music</span>
                </div>
                
                {/* Collapsible Queue (Right) */}
                <div className="absolute top-0 right-0 w-[280px] h-full translate-x-full group-hover:translate-x-0 transition-transform duration-300 shadow-2xl flex flex-col" style={{ background: 'var(--color-surface-hover)' }}>
                    <QueuePanel 
                        queue={watchState.queue || []} 
                        enqueueUrl={enqueueUrl} 
                        removeQueuedUrl={removeQueuedUrl} 
                    />
                </div>
            </div>
        </div>
    );
}
