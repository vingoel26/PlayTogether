import { Track } from 'livekit-client';
import { VideoTrack, AudioTrack, useIsMuted, useIsSpeaking } from '@livekit/components-react';
import Avatar from '../ui/Avatar.jsx';
import { useRoom } from '../../contexts/RoomContext.jsx';

/**
 * VideoTile — Represents a single participant's video feed
 * Features: live video track, fallback avatar, audio level indication, overlay chip
 */
export default function VideoTile({ participant }) {
  const { hostId } = useRoom();
  const isSpeaking = useIsSpeaking(participant);
  const isCamMuted = useIsMuted(Track.Source.Camera, { participant });
  const isMicMuted = useIsMuted(Track.Source.Microphone, { participant });

  const isCameraEnabled = !isCamMuted;
  const isMicrophoneEnabled = !isMicMuted;
  
  return (
    <div
      style={{
        background: '#2D2E31',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        // "Speaking ring" effect matching Google Meet
        border: `3px solid ${isSpeaking ? 'var(--color-blue)' : 'transparent'}`,
        transition: 'border-color 0.15s ease-in-out',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Actual LiveKit Video Stream */}
      {isCameraEnabled ? (
        <VideoTrack
          trackRef={{ participant, source: Track.Source.Camera }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
        />
      ) : (
        <Avatar name={participant.name || 'Unknown'} id={participant.identity} size={64} />
      )}

      {/* Hidden audio track ensures we hear them */}
      {isMicrophoneEnabled && (
        <AudioTrack trackRef={{ participant, source: Track.Source.Microphone }} />
      )}

      {/* Overlays */}
      
      {/* Name chip */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          padding: '2px 8px',
          borderRadius: 'var(--radius-tile)',
          background: 'rgba(0,0,0,0.6)',
          color: 'var(--color-text-on-dark)',
          fontSize: 12,
          fontFamily: 'var(--font-sans)',
          maxWidth: '40%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {participant.name || participant.identity}
        {participant.identity === hostId && (
          <span style={{
            marginLeft: 4,
            fontSize: 10,
            color: 'var(--color-cyan)',
          }}>
            (host)
          </span>
        )}
      </div>

      {/* Mic icon overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 20,
            color: isMicrophoneEnabled ? 'var(--color-text-on-dark)' : 'var(--color-red)',
            // Google meet hides the mic icon if you are 'normal', and shows it red if muted
            opacity: isMicrophoneEnabled ? 0 : 1 
          }}
        >
          mic_off
        </span>
      </div>
    </div>
  );
}
