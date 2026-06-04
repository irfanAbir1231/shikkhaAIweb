import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Student } from '@/lib/types/auth';

interface AuthState {
  user: Student | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: Student | null) => void;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setLoading: (value) => set({ isLoading: value }),
      logout: () => {
        set({ user: null, isAuthenticated: false });
        // Clear cookie via API
        fetch('/api/auth/logout', { method: 'POST' });
      },
    }),
    {
      name: 'auth-storage',
      skipHydration: true,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
