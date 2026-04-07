import Tooltip from '../ui/Tooltip.jsx';

/**
 * HubPanel — The resilient right-side panel that slides in
 * Takes up 60% of the screen for Games, 70% for Watch
 */
export default function HubPanel({ activeHub, onClose }) {
  if (!activeHub) return null;

  return (
    <div
      style={{
        flex: `0 0 ${activeHub === 'games' ? 'var(--games-panel-width)' : 'var(--watch-panel-width)'}`,
        background: 'var(--color-queue-surface)',
        borderLeft: '1px solid var(--color-control-bar)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 300ms var(--ease-standard)',
        zIndex: 10,
        height: '100%',
        position: 'relative',
      }}
    >
      <style>
        {`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
      
      {/* Panel Header */}
      <div 
        style={{ 
          height: 'var(--panel-header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-on-dark)' }}>
          {activeHub === 'games' ? 'Mini Games' : 'Watch Party'}
        </span>

        <Tooltip text="Close Panel">
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-on-dark-dim)',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </Tooltip>
      </div>

      {/* Panel Content Area (To be replaced in Phase C & D) */}
      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-on-dark-dim)',
          textAlign: 'center',
          border: '2px dashed var(--color-border)',
          borderRadius: 8,
          gap: 16
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.5 }}>
            {activeHub === 'games' ? 'sports_esports' : 'smart_display'}
          </span>
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-on-dark)' }}>
              {activeHub === 'games' ? 'Game Engine' : 'Watch Engine'}
            </h3>
            <p style={{ margin: 0, fontSize: 13, maxWidth: 260 }}>
              This panel will host the interactive components during Phase C.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
