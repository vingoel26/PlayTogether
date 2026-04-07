import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MediaProvider } from './contexts/MediaContext.jsx';
import LandingPage from './components/shell/LandingPage.jsx';
import PreJoinScreen from './components/shell/PreJoinScreen.jsx';

/**
 * Room placeholder — will be fully built in Phase B
 */
function RoomPlaceholder() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--color-video-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-on-dark)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <p style={{ fontSize: 16, fontWeight: 500 }}>Room (Phase B)</p>
    </div>
  );
}

export default function App() {
  return (
    <MediaProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/prejoin/:roomCode" element={<PreJoinScreen />} />
          <Route path="/room/:roomCode" element={<RoomPlaceholder />} />
        </Routes>
      </BrowserRouter>
    </MediaProvider>
  );
}
