import React, { createContext, useContext, useState } from 'react';

interface TimeContextType {
  timeInterval: number;
  setTimeInterval: (interval: number) => void;
}

const TimeContext = createContext<TimeContextType | undefined>(undefined);

import { TIME_INTERVAL } from '../utils/timeUtils';

export const TimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializar con localStorage o el valor central por defecto
  const [timeInterval, setTimeIntervalState] = useState<number>(() => {
    const saved = localStorage.getItem('admin_time_interval');
    return saved ? parseInt(saved, 10) : TIME_INTERVAL;
  });

  const setTimeInterval = (interval: number) => {
    setTimeIntervalState(interval);
    localStorage.setItem('admin_time_interval', interval.toString());
  };

  return (
    <TimeContext.Provider value={{ timeInterval, setTimeInterval }}>
      {children}
    </TimeContext.Provider>
  );
};

export const useTimeConfig = () => {
  const context = useContext(TimeContext);
  if (context === undefined) {
    throw new Error('useTimeConfig must be used within a TimeProvider');
  }
  return context;
};
