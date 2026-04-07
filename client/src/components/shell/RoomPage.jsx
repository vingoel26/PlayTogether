import { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LiveKitRoom } from '@livekit/components-react';
import { useSocket } from '../../hooks/useSocket.js';
import { useMedia } from '../../contexts/MediaContext.jsx';
import { useRoom } from '../../contexts/RoomContext.jsx';
import Avatar from '../ui/Avatar.jsx';
import ControlButton from '../ui/ControlButton.jsx';
import Tooltip from '../ui/Tooltip.jsx';
import VideoGrid from '../video/VideoGrid.jsx';

/**
 * RoomPage — Main in-room experience
 * Phase B: video-only state with control bar, participant list, and socket-driven state
 */
export default function RoomPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { emit, on, isConnected, socket } = useSocket();
  const { displayName, micEnabled, camEnabled, toggleMic, toggleCam, hasJoined } = useMedia();
  const [token, setToken] = useState('');
  const {
    participants, setParticipants,
    hostId, setHostId,
    setRoomCode, setIsConnected,
    isConnected: isRoomJoined
  } = useRoom();

  // Fetch LiveKit token once server confirms room join over socket
  useEffect(() => {
    if (!isRoomJoined || !socket?.id) return;
    if (token) return;

    let mounted = true;
    const fetchToken = async () => {
      try {
        const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
        const res = await fetch(`${SERVER_URL}/api/livekit/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            roomCode, 
            participantName: displayName || 'Guest', 
            participantId: socket.id 
          })
        });
        const data = await res.json();
        if (mounted && data.token) setToken(data.token);
      } catch (err) {
        console.error('Failed to get LiveKit token:', err);
      }
    };

    fetchToken();
    return () => { mounted = false; };
  }, [isRoomJoined, socket?.id, roomCode, displayName, token]);

  // Join room on mount
  useEffect(() => {
    if (!hasJoined) {
      navigate(`/prejoin/${roomCode}`, { replace: true });
      return;
    }

    if (!isConnected) return;

    setRoomCode(roomCode);
    emit('room:join', {
      roomCode,
      displayName: displayName || 'Guest',
    });
  }, [isConnected, roomCode, displayName, emit, setRoomCode]);

  // Listen for room events
  useEffect(() => {
    if (!isConnected) return;

    const unsub1 = on('room:joined', (data) => {
      setParticipants(data.participants);
      setHostId(data.hostId);
      setIsConnected(true);
    });

    const unsub2 = on('room:participant-joined', (data) => {
      setParticipants(data.participants);
      setHostId(data.hostId);
    });

    const unsub3 = on('room:participant-left', (data) => {
      setParticipants(data.participants);
      setHostId(data.hostId);
    });

    const unsub4 = on('room:error', (data) => {
      console.error('Room error:', data.message);
    });

    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, [isConnected, on, setParticipants, setHostId, setIsConnected]);

  // Leave room
  const handleLeave = useCallback(() => {
    emit('room:leave');
    navigate('/');
  }, [emit, navigate]);

  if (!hasJoined) return null;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--color-video-surface)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
        }}
      >
        <span style={{
          fontSize: 16,
          fontWeight: 500,
          color: 'var(--color-text-on-dark)',
          fontFamily: 'var(--font-sans)',
        }}>
          PlayTogether
        </span>

        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          color: 'var(--color-text-on-dark-dim)',
        }}>
          {roomCode}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 12,
            color: 'var(--color-text-on-dark)',
          }}>
            {isConnected ? '● Connected' : '○ Connecting...'}
          </span>
          <Tooltip text="Participants">
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              color: 'var(--color-text-on-dark)',
              fontSize: 14,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>people</span>
              <span>{participants.length}</span>
            </div>
          </Tooltip>
        </div>
      </div>

      {/* Video Grid Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {token ? (
          <LiveKitRoom
            video={camEnabled}
            audio={micEnabled}
            token={token}
            serverUrl={import.meta.env.VITE_LIVEKIT_WS_URL}
            data-lk-theme="default"
            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <VideoGrid />
          </LiveKitRoom>
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-on-dark-dim)' }}>
            {isConnected ? 'Acquiring secure video token...' : 'Connecting to room socket...'}
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div
        style={{
          height: 72,
          background: 'var(--color-control-bar)',
          boxShadow: 'var(--shadow-control-bar)',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          flexShrink: 0,
          padding: '0 24px',
        }}
      >
        <ControlButton
          icon="mic"
          activeIcon="mic_off"
          label={micEnabled ? 'Turn off microphone' : 'Turn on microphone'}
          active={!micEnabled}
          onClick={toggleMic}
        />
        <ControlButton
          icon="videocam"
          activeIcon="videocam_off"
          label={camEnabled ? 'Turn off camera' : 'Turn on camera'}
          active={!camEnabled}
          onClick={toggleCam}
        />
        <ControlButton icon="screen_share" label="Share screen" />
        <ControlButton icon="pan_tool" label="Raise hand" />

        {/* Leave call button */}
        <div style={{ marginLeft: 16 }}>
          <Tooltip text="Leave call">
            <button
              onClick={handleLeave}
              aria-label="Leave call"
              style={{
                width: 96,
                height: 40,
                borderRadius: 'var(--radius-pill)',
                background: 'var(--color-red)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--color-red-hover)'}
              onMouseLeave={(e) => e.target.style.background = 'var(--color-red)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>call_end</span>
            </button>
          </Tooltip>
        </div>

        {/* Right zone */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <ControlButton icon="chat" label="Chat" size={40} />
          <ControlButton icon="people" label="Participants" size={40} />
          <ControlButton icon="grid_view" label="Activities" size={40} />
          <ControlButton icon="more_vert" label="More options" size={40} />
        </div>
      </div>
    </div>
  );
}
