import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/shell/LandingPage.jsx';
import PreJoinScreen from './components/shell/PreJoinScreen.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/prejoin/:roomCode" element={<PreJoinScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
