import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMedia } from '../../contexts/MediaContext.jsx';
import Avatar from '../ui/Avatar.jsx';
import PrimaryButton from '../ui/PrimaryButton.jsx';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || '';

/**
 * PreJoinScreen — Camera/mic check before joining a room
 * Dark background #202124, centered video preview, media controls, white info card
 */
export default function PreJoinScreen() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { micEnabled, camEnabled, displayName, setDisplayName, toggleMic, toggleCam } = useMedia();

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [permissionError, setPermissionError] = useState('');
  const [joining, setJoining] = useState(false);

  // Fetch room info
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/rooms/${roomCode}`);
        const data = await res.json();
        if (data.exists) {
          setParticipantCount(data.participantCount);
        } else {
          navigate('/');
        }
      } catch {
        navigate('/');
      }
    };
    fetchRoom();
  }, [roomCode, navigate]);

  // Get camera stream
  useEffect(() => {
    let cancelled = false;

    const getStream = async () => {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      if (!camEnabled) {
        if (videoRef.current) videoRef.current.srcObject = null;
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 360, facingMode: 'user' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setPermissionError('');
      } catch (err) {
        if (!cancelled) {
          setPermissionError('Camera access denied. You can still join without video.');
        }
      }
    };

    getStream();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [camEnabled]);

  // Join the room
  const handleJoin = () => {
    // Stop preview stream — LiveKit will manage its own
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setJoining(true);
    navigate(`/room/${roomCode}`);
  };

  const name = displayName || 'Guest';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--color-video-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 48,
        padding: 32,
      }}
    >
      {/* Left — Video Preview */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {/* Preview Tile */}
        <div
          style={{
            width: 480,
            height: 270,
            borderRadius: 'var(--radius-card)',
            background: '#2D2E31',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {camEnabled && !permissionError ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)', // mirror
              }}
            />
          ) : (
            <Avatar name={name} id="self" size={64} />
          )}

          {/* Name overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.5)',
                color: 'var(--color-text-on-dark)',
                fontFamily: 'var(--font-sans)',
                fontSize: 16,
                fontWeight: 500,
                outline: 'none',
                width: 180,
                padding: '4px 0',
              }}
            />
          </div>
        </div>

        {/* Media Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Mic Toggle */}
          <button
            onClick={toggleMic}
            aria-label={micEnabled ? 'Turn off microphone' : 'Turn on microphone'}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: 'none',
              background: micEnabled ? 'rgba(255,255,255,0.1)' : 'var(--color-red)',
              color: 'var(--color-text-on-dark)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 150ms ease',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              {micEnabled ? 'mic' : 'mic_off'}
            </span>
          </button>

          {/* Camera Toggle */}
          <button
            onClick={toggleCam}
            aria-label={camEnabled ? 'Turn off camera' : 'Turn on camera'}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: 'none',
              background: camEnabled ? 'rgba(255,255,255,0.1)' : 'var(--color-red)',
              color: 'var(--color-text-on-dark)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 150ms ease',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              {camEnabled ? 'videocam' : 'videocam_off'}
            </span>
          </button>
        </div>

        {permissionError && (
          <p style={{ fontSize: 12, color: 'var(--color-amber)', textAlign: 'center', maxWidth: 400 }}>
            {permissionError}
          </p>
        )}
      </div>

      {/* Right — Join Card */}
      <div
        style={{
          background: 'var(--color-surface-white)',
          borderRadius: 'var(--radius-drawer)',
          padding: 24,
          width: 340,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <h2
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Ready to join?
        </h2>

        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
          {participantCount > 0
            ? `${participantCount} ${participantCount === 1 ? 'person' : 'people'} in the call`
            : 'No one else is here yet'}
        </p>

        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            background: 'var(--color-surface-light)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-input)',
          }}
        >
          {roomCode}
        </p>

        <PrimaryButton
          fullWidth
          onClick={handleJoin}
          disabled={joining}
        >
          Join now
        </PrimaryButton>

        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
          Your {micEnabled ? 'microphone' : ''}{micEnabled && camEnabled ? ' and ' : ''}{camEnabled ? 'camera' : ''}{!micEnabled && !camEnabled ? 'microphone and camera' : ''} will be {micEnabled || camEnabled ? 'on' : 'off'}.
        </p>

        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
          Joining as <strong>{name}</strong>
        </p>
      </div>
    </div>
  );
}
