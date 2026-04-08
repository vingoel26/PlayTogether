import Avatar from '../ui/Avatar.jsx';
import { useSocket } from '../../hooks/useSocket.js';

/**
 * ScoreHeader — Shared player score bar for all game boards
 * Shows player avatars, names, scores, and turn/round indicator
 */
export default function ScoreHeader({ players, scores, marks, currentPlayerId, roundInfo }) {
  const { socket } = useSocket();
  const myId = socket?.id;

  return (
    <div style={{
      display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center',
      fontSize: 14, width: '100%',
    }}>
      {players.map((p, idx) => {
        const isActive = currentPlayerId === p.id;
        const isMe = p.id === myId;

        return (
          <div key={p.id} style={{ display: 'contents' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', borderRadius: 10,
              background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
              boxShadow: isActive ? '0 0 0 1px rgba(255,255,255,0.1)' : 'none',
              transition: 'all 200ms ease',
            }}>
              <Avatar name={p.displayName} id={p.id} size={28} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--color-text-on-dark)' }}>
                  {isMe ? 'You' : p.displayName}
                </span>
                {marks?.[p.id] && (
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: marks[p.id] === 'X' ? '#8AB4F8' : '#F28B82',
                  }}>
                    {marks[p.id]}
                  </span>
                )}
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.1)', borderRadius: 6,
                padding: '3px 12px', fontSize: 16, fontWeight: 700,
                color: 'white', minWidth: 32, textAlign: 'center',
                transition: 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}>
                {scores?.[p.id] || 0}
              </div>
            </div>

            {/* "vs" separator between players */}
            {idx < players.length - 1 && (
              <span style={{
                fontSize: 12, fontWeight: 600, color: 'var(--color-text-on-dark-dim)',
                letterSpacing: 1, textTransform: 'uppercase',
              }}>
                vs
              </span>
            )}
          </div>
        );
      })}

      {/* Round info */}
      {roundInfo && (
        <span style={{
          fontSize: 11, color: 'var(--color-text-on-dark-dim)',
          marginLeft: 8, padding: '2px 8px',
          background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-pill)',
        }}>
          {roundInfo}
        </span>
      )}
    </div>
  );
}
