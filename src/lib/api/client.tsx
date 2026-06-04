'use client';

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useState, ReactNode } from 'react';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => queryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export { useQuery, useMutation, useQueryClient };
