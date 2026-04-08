import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../ui/PrimaryButton.jsx';
import InputField from '../ui/InputField.jsx';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || '';
// In production, if VITE_SERVER_URL is missing, we assume the server is on the same domain or we use auto-detection
const FINAL_SERVER_URL = SERVER_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin);

/**
 * LandingPage — Google Meet-inspired landing page
 * Centered white card on #F1F3F4 background
 */
export default function LandingPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Create a new room and navigate to pre-join
  const handleNewMeeting = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${FINAL_SERVER_URL}/api/rooms`, { method: 'POST' });
      const data = await res.json();
      if (data.code) {
        navigate(`/prejoin/${data.code}`);
      }
    } catch (err) {
      setError('Failed to create meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Join an existing room by code
  const handleJoin = async () => {
    const trimmed = code.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter a meeting code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${SERVER_URL}/api/rooms/${trimmed}`);
      const data = await res.json();
      if (data.exists) {
        navigate(`/prejoin/${trimmed}`);
      } else {
        setError('Room not found. Check the code and try again.');
      }
    } catch (err) {
      setError('Failed to join meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleJoin();
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--color-surface-light)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Center Card */}
      <div
        style={{
          background: 'var(--color-surface-white)',
          borderRadius: 'var(--radius-dialog)',
          padding: 48,
          maxWidth: 440,
          width: '90%',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        {/* Wordmark */}
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 28,
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            marginBottom: 8,
          }}
        >
          PlayTogether
        </h1>
        <p
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: 'var(--color-text-secondary)',
            marginBottom: 24,
          }}
        >
          Video calls + games + watch parties
        </p>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: 'var(--color-border)',
            marginBottom: 24,
          }}
        />

        {/* Primary CTA — New Meeting */}
        <PrimaryButton
          icon="video_call"
          fullWidth
          onClick={handleNewMeeting}
          disabled={loading}
        >
          New meeting
        </PrimaryButton>

        {/* Code Input + Join Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            marginTop: 24,
          }}
        >
          <div style={{ flex: 1 }}>
            <InputField
              id="room-code-input"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
              }}
              placeholder="e.g. abc-defg-hij"
              error={error}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button
            onClick={handleJoin}
            disabled={loading || !code.trim()}
            style={{
              height: 40,
              width: 80,
              borderRadius: 'var(--radius-input)',
              border: `1px solid ${code.trim() ? 'var(--color-blue)' : 'var(--color-border)'}`,
              background: 'transparent',
              color: code.trim() ? 'var(--color-blue)' : 'var(--color-text-secondary)',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              fontWeight: 500,
              cursor: loading || !code.trim() ? 'default' : 'pointer',
              transition: 'all 150ms ease',
              opacity: loading ? 0.38 : 1,
            }}
          >
            Join
          </button>
        </div>

        {/* Learn More */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <a
            href="#"
            style={{
              fontSize: 12,
              color: 'var(--color-blue)',
              textDecoration: 'none',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
          >
            Learn more about PlayTogether
          </a>
        </div>
      </div>

      {/* Footer */}
      <p
        style={{
          fontSize: 12,
          color: 'var(--color-text-secondary)',
          marginTop: 24,
          textAlign: 'center',
        }}
      >
        For the best experience, use Google Chrome.
      </p>
    </div>
  );
}
