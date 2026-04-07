import { createContext, useContext, useState, useCallback } from 'react';

const MediaContext = createContext(null);

export function MediaProvider({ children }) {
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  const toggleMic = useCallback(() => setMicEnabled((prev) => !prev), []);
  const toggleCam = useCallback(() => setCamEnabled((prev) => !prev), []);

  return (
    <MediaContext.Provider
      value={{
        micEnabled,
        camEnabled,
        displayName,
        hasJoined,
        setMicEnabled,
        setCamEnabled,
        setDisplayName,
        setHasJoined,
        toggleMic,
        toggleCam,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
}

export function useMedia() {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error('useMedia must be used within MediaProvider');
  return ctx;
}
