'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
