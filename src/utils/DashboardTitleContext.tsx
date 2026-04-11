import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

interface TitleContextType {
  title: string;
  setTitle: (title: string) => void;
}

const TitleContext = createContext<TitleContextType | undefined>(undefined);

export function DashboardTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('Inicio');

  const value = useMemo(() => ({ title, setTitle }), [title]);

  return (
    <TitleContext.Provider value={value}>
      {children}
    </TitleContext.Provider>
  );
}

export function useDashboardTitle() {
  const context = useContext(TitleContext);
  if (!context) {
    throw new Error('useDashboardTitle must be used within a DashboardTitleProvider');
  }
  return context;
}
