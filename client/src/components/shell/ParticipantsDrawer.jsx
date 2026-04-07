import { useRoom } from '../../contexts/RoomContext.jsx';
import { useParticipants } from '@livekit/components-react';
import Avatar from '../ui/Avatar.jsx';
import Tooltip from '../ui/Tooltip.jsx';

/**
 * ParticipantsDrawer — Google Meet style right overlay sliding panel
 * Shows active participants, their roles, and mic/cam icons
 */
export default function ParticipantsDrawer({ isOpen, onClose }) {
  const { hostId } = useRoom();
  const lkParticipants = useParticipants(); // livekit participant instances for mic/cam status

  if (!isOpen) return null;

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 40,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          bottom: 16,
          width: 'var(--participants-drawer-width)',
          background: 'var(--color-queue-surface)',
          borderRadius: 'var(--radius-drawer)',
          boxShadow: 'var(--shadow-modal)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 250ms var(--ease-standard)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: '1px solid var(--color-border)',
        }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500, color: 'var(--color-text-on-dark)' }}>
            Participants
          </h2>
          <Tooltip text="Close">
            <button 
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-on-dark-dim)', display: 'flex'
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </Tooltip>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          <div style={{ padding: '0 24px', marginBottom: 12, color: 'var(--color-text-on-dark-dim)', fontSize: 12, textTransform: 'uppercase' }}>
            In call ({lkParticipants.length})
          </div>

          {lkParticipants.map(speaker => {
            const isHost = speaker.identity === hostId;
            return (
              <div
                key={speaker.identity}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 24px',
                  gap: 16
                }}
              >
                <Avatar name={speaker.name || 'Unknown'} id={speaker.identity} size={36} />
                
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ 
                    fontSize: 14, 
                    fontWeight: 500, 
                    color: 'var(--color-text-on-dark)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {speaker.name || speaker.identity} {speaker.isLocal ? '(You)' : ''}
                  </div>
                  {isHost && <div style={{ fontSize: 12, color: 'var(--color-text-on-dark-dim)' }}>Meeting host</div>}
                </div>

                <div style={{ display: 'flex', gap: 8, color: 'var(--color-text-on-dark-dim)' }}>
                  {/* Microphone status icon */}
                  {speaker.isMicrophoneEnabled ? (
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>mic</span>
                  ) : (
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-red)' }}>mic_off</span>
                  )}
                  {/* Video status icon */}
                  {!speaker.isCameraEnabled && (
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>videocam_off</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
