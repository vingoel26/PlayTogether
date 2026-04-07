import { useState } from 'react';
import ControlButton from './components/ui/ControlButton.jsx';
import PrimaryButton from './components/ui/PrimaryButton.jsx';
import OutlinedButton from './components/ui/OutlinedButton.jsx';
import Chip from './components/ui/Chip.jsx';
import InputField from './components/ui/InputField.jsx';
import Avatar from './components/ui/Avatar.jsx';
import Snackbar from './components/ui/Snackbar.jsx';

/**
 * Temporary component showcase for Step A2 verification.
 * Will be replaced by the actual App in Step A3.
 */
export default function App() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [inputVal, setInputVal] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-light)', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '48px 48px 0', maxWidth: 900, margin: '0 auto' }}>
        <h1 className="text-display" style={{ color: 'var(--color-text-primary)', marginBottom: 8 }}>
          PlayTogether
        </h1>
        <p className="text-body" style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>
          Design System — Component Showcase
        </p>
        <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 32 }} />
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 48px 48px' }}>

        {/* Section: Buttons */}
        <section style={{ marginBottom: 40 }}>
          <h2 className="text-h1" style={{ marginBottom: 16 }}>Buttons</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <PrimaryButton icon="video_call">New meeting</PrimaryButton>
            <PrimaryButton danger>Danger</PrimaryButton>
            <PrimaryButton disabled>Disabled</PrimaryButton>
            <OutlinedButton icon="person_add">Invite</OutlinedButton>
            <OutlinedButton disabled>Disabled</OutlinedButton>
          </div>
        </section>

        {/* Section: Control Buttons (dark bg) */}
        <section style={{
          marginBottom: 40,
          background: 'var(--color-control-bar)',
          borderRadius: 'var(--radius-card)',
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <h2 className="text-h2" style={{ color: 'var(--color-text-on-dark)', marginRight: 24 }}>Controls</h2>
          <ControlButton
            icon="mic"
            activeIcon="mic_off"
            label={micOn ? 'Turn off microphone' : 'Turn on microphone'}
            active={!micOn}
            onClick={() => setMicOn(!micOn)}
          />
          <ControlButton
            icon="videocam"
            activeIcon="videocam_off"
            label={camOn ? 'Turn off camera' : 'Turn on camera'}
            active={!camOn}
            onClick={() => setCamOn(!camOn)}
          />
          <ControlButton icon="screen_share" label="Share screen" />
          <ControlButton icon="pan_tool" label="Raise hand" />
          <div style={{ width: 16 }} />
          {/* Leave call pill */}
          <button
            style={{
              width: 96,
              height: 40,
              borderRadius: 'var(--radius-pill)',
              background: 'var(--color-red)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>call_end</span>
          </button>
          <div style={{ width: 24 }} />
          <ControlButton icon="chat" label="Chat" size={40} />
          <ControlButton icon="people" label="Participants" size={40} />
          <ControlButton icon="grid_view" label="Activities" size={40} active activeColor="var(--color-blue)" />
          <ControlButton icon="more_vert" label="More" size={40} />
        </section>

        {/* Section: Chips */}
        <section style={{ marginBottom: 40 }}>
          <h2 className="text-h1" style={{ marginBottom: 16 }}>Chips</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Chip icon="group" color="var(--color-blue)" bg="var(--color-blue-light)">2 players</Chip>
            <Chip color="var(--color-green)" bg="var(--color-green-light)">Easy</Chip>
            <Chip color="var(--color-cyan)" bg="var(--color-cyan-bg)" icon="fiber_manual_record">SYNC</Chip>
            <Chip selected>Round 2</Chip>
            <Chip color="var(--color-amber)" bg="rgba(242,153,0,0.15)">Your turn</Chip>
          </div>
        </section>

        {/* Section: Input */}
        <section style={{ marginBottom: 40 }}>
          <h2 className="text-h1" style={{ marginBottom: 16 }}>Input</h2>
          <div style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InputField
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. abc-defg-hij"
            />
            <InputField
              value=""
              onChange={() => {}}
              placeholder="Error state"
              error="Room code not found"
            />
          </div>
        </section>

        {/* Section: Avatars */}
        <section style={{ marginBottom: 40 }}>
          <h2 className="text-h1" style={{ marginBottom: 16 }}>Avatars</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar name="Alice Chen" id="user-1" size={64} />
            <Avatar name="Bob Kumar" id="user-2" size={40} />
            <Avatar name="Charlie Doe" id="user-3" size={32} speaking />
            <Avatar name="Diana Fox" id="user-4" size={16} />
            <Avatar name="Offline User" id="user-5" size={40} online={false} />
          </div>
        </section>

        {/* Section: Typography */}
        <section style={{ marginBottom: 40 }}>
          <h2 className="text-h1" style={{ marginBottom: 16 }}>Typography</h2>
          <p className="text-display" style={{ marginBottom: 8 }}>Display — 32px/500</p>
          <p className="text-h1" style={{ marginBottom: 8 }}>Heading 1 — 22px/500</p>
          <p className="text-h2" style={{ marginBottom: 8 }}>Heading 2 — 16px/500</p>
          <p className="text-body" style={{ marginBottom: 8 }}>Body — 14px/400</p>
          <p className="text-body-small" style={{ marginBottom: 8 }}>Body small — 12px/400</p>
          <p className="text-mono" style={{ marginBottom: 8 }}>Mono — abc-defg-hij (Roboto Mono 13px)</p>
          <p className="text-overline" style={{ marginBottom: 8 }}>Overline — 11px uppercase</p>
        </section>

        {/* Section: Snackbar */}
        <section style={{ marginBottom: 40 }}>
          <h2 className="text-h1" style={{ marginBottom: 16 }}>Snackbar</h2>
          <PrimaryButton onClick={() => setShowSnackbar(true)}>Show Snackbar</PrimaryButton>
        </section>

      </div>

      {/* Snackbar */}
      {showSnackbar && (
        <Snackbar
          message="Alice joined the call"
          onDismiss={() => setShowSnackbar(false)}
        />
      )}
    </div>
  );
}
