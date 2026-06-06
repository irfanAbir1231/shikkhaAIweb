import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NoteVersion, SavedNote } from '@/lib/types/notes';

const API_PROXY = '/api/proxy';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  if (options?.body) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'API request failed');
  return data.data as T;
}

export function useNoteVersions(noteId: number) {
  return useQuery({
    queryKey: ['note-versions', noteId],
    queryFn: () => fetchJson<NoteVersion[]>(`${API_PROXY}/notes/${noteId}/versions`),
    enabled: !!noteId,
  });
}

export function useSavedNotes(bookmarkedOnly: boolean = false) {
  return useQuery({
    queryKey: ['saved-notes', bookmarkedOnly],
    queryFn: () =>
      fetchJson<SavedNote[]>(`${API_PROXY}/notes/saved/list?bookmarked_only=${bookmarkedOnly}`),
  });
}

export function useSaveNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, bookmarked }: { noteId: number; bookmarked?: boolean }) =>
      fetchJson<SavedNote>(`${API_PROXY}/notes/${noteId}/save?bookmarked=${bookmarked || false}`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-notes'] });
    },
  });
}

export function useUnsaveNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: number) =>
      fetchJson<void>(`${API_PROXY}/notes/${noteId}/save`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-notes'] });
    },
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: number) =>
      fetchJson<SavedNote>(`${API_PROXY}/notes/${noteId}/bookmark`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-notes'] });
    },
  });
}
