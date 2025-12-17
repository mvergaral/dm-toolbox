import React, { createContext, useContext, useState } from 'react';

interface SettingsContextType {
  sidebarAutoHide: boolean;
  setSidebarAutoHide: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [sidebarAutoHide, setSidebarAutoHideState] = useState(() => {
    const saved = localStorage.getItem('settings_sidebarAutoHide');
    return saved ? JSON.parse(saved) : false;
  });

  const setSidebarAutoHide = (value: boolean) => {
    setSidebarAutoHideState(value);
    localStorage.setItem('settings_sidebarAutoHide', JSON.stringify(value));
  };

  return (
    <SettingsContext.Provider value={{ sidebarAutoHide, setSidebarAutoHide }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
