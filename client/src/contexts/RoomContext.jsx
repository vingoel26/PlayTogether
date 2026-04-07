import { createContext, useContext, useState } from 'react';

const RoomContext = createContext(null);

export function RoomProvider({ children }) {
  const [roomCode, setRoomCode] = useState('');
  const [participants, setParticipants] = useState([]);
  const [hostId, setHostId] = useState(null);
  const [activeHub, setActiveHubLocal] = useState(null); // Managed globally via sockets
  const [isConnected, setIsConnected] = useState(false);

  return (
    <RoomContext.Provider
      value={{
        roomCode,
        participants,
        hostId,
        activeHub,
        isConnected,
        setRoomCode,
        setParticipants,
        setHostId,
        setActiveHub: setActiveHubLocal,
        setIsConnected,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error('useRoom must be used within RoomProvider');
  return ctx;
}
