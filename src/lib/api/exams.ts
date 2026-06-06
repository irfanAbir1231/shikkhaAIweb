import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SavedExam } from '@/lib/types/exam';

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

export function useSavedExams() {
  return useQuery({
    queryKey: ['saved-exams'],
    queryFn: () => fetchJson<SavedExam[]>(`${API_PROXY}/exam/saved/list`),
  });
}

export function useSaveExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (examId: number) =>
      fetchJson<{ saved: boolean }>(`${API_PROXY}/exam/${examId}/save`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-exams'] });
    },
  });
}

export function useUnsaveExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (examId: number) =>
      fetchJson<{ saved: boolean }>(`${API_PROXY}/exam/${examId}/save`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-exams'] });
    },
  });
}

export function useToggleExamBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (examId: number) =>
      fetchJson<{ bookmarked: boolean }>(`${API_PROXY}/exam/${examId}/bookmark`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-exams'] });
    },
  });
}
