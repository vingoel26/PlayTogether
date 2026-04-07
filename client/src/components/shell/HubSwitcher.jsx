export default function HubSwitcher({ isOpen, onClose, onSelectHub }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Invisible backdrop to close when clicking outside */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 40,
        }}
      />
      
      {/* Bottom Sheet Modal */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px', // Just above the control bar
          right: '24px',
          width: '360px',
          background: 'var(--color-queue-surface)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'var(--shadow-modal)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          animation: 'snackbarIn 250ms var(--ease-standard)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, color: 'var(--color-text-on-dark)' }}>Activities</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', color: 'var(--color-text-on-dark-dim)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p style={{ color: 'var(--color-text-on-dark-dim)', fontSize: 14, margin: 0 }}>
          Launch an interactive activity for everyone in the room.
        </p>

        {/* Option Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          
          <button
            onClick={() => { onSelectHub('games'); onClose(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: '#3C4043',
              border: '1px solid var(--color-border)',
              padding: '16px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--color-text-on-dark)',
              textAlign: 'left',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#4A4E51'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#3C4043'}
          >
            <div style={{ background: 'var(--color-blue)', padding: 12, borderRadius: 8, display: 'flex' }}>
              <span className="material-symbols-outlined">sports_esports</span>
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 15 }}>Mini Games</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-on-dark-dim)' }}>Tic Tac Toe, Quick Math</div>
            </div>
          </button>

          <button
            onClick={() => { onSelectHub('watch'); onClose(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: '#3C4043',
              border: '1px solid var(--color-border)',
              padding: '16px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--color-text-on-dark)',
              textAlign: 'left',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#4A4E51'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#3C4043'}
          >
            <div style={{ background: 'var(--color-red)', padding: 12, borderRadius: 8, display: 'flex' }}>
              <span className="material-symbols-outlined">smart_display</span>
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 15 }}>Watch Party</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-on-dark-dim)' }}>Sync YouTube together</div>
            </div>
          </button>
          
        </div>
      </div>
    </>
  );
}
