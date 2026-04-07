import { useEffect } from 'react';
import { useParticipants, useLocalParticipant } from '@livekit/components-react';
import { useMedia } from '../../contexts/MediaContext.jsx';
import VideoTile from './VideoTile.jsx';

/**
 * VideoGrid — Renders the WebRTC video tiles using LiveKit
 * Replaces the placeholder static array with live tracks
 */
export default function VideoGrid() {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const { camEnabled, micEnabled } = useMedia();

  // Sync our UI toggles directly to the LiveKit LocalParticipant
  useEffect(() => {
    if (localParticipant) {
      localParticipant.setCameraEnabled(camEnabled);
      localParticipant.setMicrophoneEnabled(micEnabled);
    }
  }, [localParticipant, camEnabled, micEnabled]);

  // Determine grid layout based on number of participants
  const count = participants.length;
  // Fallback to 1 column for 1 person, 2 for 2-4, 3 for 5+
  const columns = count <= 1 ? '1fr' : count <= 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';
  const rows = count <= 2 ? '1fr' : count <= 6 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';

  return (
    <div
      style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: columns,
        gridTemplateRows: rows,
        gap: 8,
        padding: 8,
      }}
    >
      {participants.map((p) => (
        <VideoTile key={p.sid || p.identity} participant={p} />
      ))}
      
      {count === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-on-dark-dim)',
          gap: 8,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.5 }}>
            hourglass_empty
          </span>
          <p style={{ fontSize: 14 }}>Connecting to room...</p>
        </div>
      )}
    </div>
  );
}
