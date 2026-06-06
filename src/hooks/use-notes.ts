import { useQuery } from '@tanstack/react-query';
import type { NoteResponse } from '@/lib/types/notes';

const API_PROXY = '/api/proxy';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'API request failed');
  return data.data as T;
}

export function useNotes(source?: string) {
  return useQuery({
    queryKey: ['notes', source],
    queryFn: () =>
      fetchJson<NoteResponse[]>(
        `${API_PROXY}/notes${source ? `?source=${source}` : ''}`
      ),
  });
}

export function useNote(noteId: number) {
  return useQuery({
    queryKey: ['note', noteId],
    queryFn: () => fetchJson<NoteResponse>(`${API_PROXY}/notes/${noteId}`),
    enabled: !!noteId,
  });
}
