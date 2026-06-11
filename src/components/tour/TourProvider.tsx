'use client';

import { useAppTour } from '@/hooks/use-app-tour';
import { createContext, useContext, ReactNode } from 'react';

interface TourContextValue {
  reset: () => void;
}

const TourContext = createContext<TourContextValue>({ reset: () => {} });

export function useTourContext() {
  return useContext(TourContext);
}

export function TourProvider({ children }: { children: ReactNode }) {
  const { reset } = useAppTour();

  return (
    <TourContext.Provider value={{ reset }}>
      {children}
    </TourContext.Provider>
  );
}
