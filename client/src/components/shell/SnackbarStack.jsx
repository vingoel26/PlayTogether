import { useEffect, useState } from 'react';
import { useSnackbar } from '../../contexts/SnackbarContext.jsx';

/**
 * SnackbarStack — Renders the current snackbar from the global queue
 * Google Meet style: Dark floating round-corner pill at the bottom-left
 */
export default function SnackbarStack() {
  const { queue, next } = useSnackbar();
  const [animatingOut, setAnimatingOut] = useState(false);

  const active = queue[0];

  useEffect(() => {
    if (!active) return;
    
    // Auto dismiss
    const timer = setTimeout(() => {
      setAnimatingOut(true);
      setTimeout(() => {
        setAnimatingOut(false);
        next();
      }, 200); // Wait for CSS exit animation
    }, active.duration);

    return () => clearTimeout(timer);
  }, [active, next]);

  if (!active) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 88, // Above control bar
        left: 24,
        background: 'var(--color-snackbar)',
        color: 'white',
        padding: '14px 20px',
        borderRadius: 'var(--radius-snackbar)',
        boxShadow: 'var(--shadow-float)',
        zIndex: 100,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        animation: animatingOut 
          ? 'snackbarOut 200ms var(--ease-standard) forwards'
          : 'snackbarIn 250ms var(--ease-standard)',
      }}
    >
      {active.message}
      <button 
        onClick={() => {
          setAnimatingOut(true);
          setTimeout(() => {
            setAnimatingOut(false);
            next();
          }, 200);
        }}
        style={{
          background: 'none', border: 'none', color: '#8AB4F8', 
          cursor: 'pointer', fontWeight: 500, fontSize: 13,
          marginLeft: 16
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
      </button>
    </div>
  );
}
