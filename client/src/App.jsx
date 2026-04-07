import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MediaProvider } from './contexts/MediaContext.jsx';
import { RoomProvider } from './contexts/RoomContext.jsx';
import LandingPage from './components/shell/LandingPage.jsx';
import PreJoinScreen from './components/shell/PreJoinScreen.jsx';
import RoomPage from './components/shell/RoomPage.jsx';

export default function App() {
  return (
    <MediaProvider>
      <RoomProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/prejoin/:roomCode" element={<PreJoinScreen />} />
            <Route path="/room/:roomCode" element={<RoomPage />} />
          </Routes>
        </BrowserRouter>
      </RoomProvider>
    </MediaProvider>
  );
}
