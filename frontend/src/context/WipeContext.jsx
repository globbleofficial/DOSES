import React, { createContext, useContext, useState } from 'react';

const WipeContext = createContext();

export const WipeProvider = ({ children }) => {
  const [wiping, setWiping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('IDLE');
  const [logs, setLogs] = useState([]);
  const [certificate, setCertificate] = useState(null);

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, message, type }, ...prev.slice(0, 99)]);
  };

  const clearSession = () => {
    setProgress(0);
    setWiping(false);
    setCurrentPhase('IDLE');
    setCertificate(null);
  };

  return (
    <WipeContext.Provider
      value={{
        wiping,
        setWiping,
        progress,
        setProgress,
        currentPhase,
        setCurrentPhase,
        logs,
        addLog,
        certificate,
        setCertificate,
        clearSession
      }}
    >
      {children}
    </WipeContext.Provider>
  );
};

export const useWipe = () => useContext(WipeContext);
