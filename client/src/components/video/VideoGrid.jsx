import { useEffect } from 'react';
import { useParticipants, useLocalParticipant } from '@livekit/components-react';
import { useMedia } from '../../contexts/MediaContext.jsx';
import { useRoom } from '../../contexts/RoomContext.jsx';
import VideoTile from './VideoTile.jsx';
import HubPanel from '../shell/HubPanel.jsx';

/**
 * VideoGrid — Renders the WebRTC video tiles using LiveKit
 * Replaces the placeholder static array with live tracks
 */
export default function VideoGrid({ onCloseHub }) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const { camEnabled, micEnabled } = useMedia();
  const { activeHub } = useRoom();

  // Sync our UI toggles directly to the LiveKit LocalParticipant
  useEffect(() => {
    if (localParticipant) {
      localParticipant.setCameraEnabled(camEnabled);
      localParticipant.setMicrophoneEnabled(micEnabled);
    }
  }, [localParticipant, camEnabled, micEnabled]);

  // Determine grid layout based on number of participants
  const count = participants.length;
  
  let layoutStyle = {
    flex: 1,
    display: 'grid',
    gap: 8,
    padding: 8,
    overflowY: 'auto',
    position: 'relative',
  };

  let tileRender = null;
  let hubRender = null;

  if (activeHub) {
    if (count === 4) {
      // 4 Participants Special Layout: Left Col (2 tiles) - Panel (Center) - Right Col (2 tiles)
      layoutStyle.gridTemplateColumns = 'minmax(200px, 1fr) var(--games-panel-width) minmax(200px, 1fr)';
      layoutStyle.gridTemplateRows = '1fr 1fr';
      
      tileRender = participants.map((p, index) => {
        // Index 0: Left Top, Index 1: Left Bottom, Index 2: Right Top, Index 3: Right Bottom
        const col = index < 2 ? 1 : 3;
        const row = index % 2 === 0 ? 1 : 2;
        return (
          <div key={p.sid || p.identity} style={{ gridColumn: col, gridRow: row, minHeight: 0 }}>
            <VideoTile participant={p} />
          </div>
        );
      });

      hubRender = (
        <div style={{ gridColumn: 2, gridRow: '1 / span 2', position: 'relative', overflow: 'hidden', minHeight: 0, borderRadius: 12 }}>
          <HubPanel activeHub={activeHub} onClose={onCloseHub} style={{ width: '100%' }} />
        </div>
      );
    } else {
      // Standard Split Layout (1 column or 2 columns based on size)
      layoutStyle.display = 'flex';
      
      tileRender = (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
          <div style={{ 
            flex: 1, display: 'grid', gap: 8,
            gridTemplateColumns: count <= 3 ? '1fr' : 'repeat(2, 1fr)',
            gridTemplateRows: count <= 3 ? `repeat(${Math.max(1, count)}, 1fr)` : `repeat(${Math.ceil(count / 2)}, 1fr)`,
          }}>
            {participants.map((p) => (
              <VideoTile key={p.sid || p.identity} participant={p} />
            ))}
          </div>
        </div>
      );

      hubRender = <HubPanel activeHub={activeHub} onClose={onCloseHub} />;
    }
  } else {
    // Full screen layout
    layoutStyle.gridTemplateColumns = count <= 1 ? '1fr' : count <= 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';
    layoutStyle.gridTemplateRows = count <= 2 ? '1fr' : count <= 6 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';
    
    tileRender = participants.map((p) => (
      <div key={p.sid || p.identity} style={{ minHeight: 0 }}>
        <VideoTile participant={p} />
      </div>
    ));
  }

  return (
    <div style={layoutStyle}>
      {tileRender}
      {hubRender}
      
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
