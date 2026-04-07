import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const SnackbarContext = createContext(null);

export function SnackbarProvider({ children }) {
  const [queue, setQueue] = useState([]);

  // Removes the oldest snackbar
  const next = useCallback(() => {
    setQueue((q) => q.slice(1));
  }, []);

  // Adds a global alert to the queue
  const enqueueSnackbar = useCallback((message, duration = 4000) => {
    const id = Date.now();
    setQueue((q) => [...q, { id, message, duration }]);
  }, []);

  return (
    <SnackbarContext.Provider value={{ queue, enqueueSnackbar, next }}>
      {children}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
}
