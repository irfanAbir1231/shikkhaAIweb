import { useMutation } from '@tanstack/react-query';
import { Student } from '@/lib/types/auth';

const API_PROXY = '/api/proxy';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || 'Request failed');
  }
  return data.data as T;
}

export interface UpdateStudentPayload {
  name?: string;
  grade_level?: string;
}

export function useUpdateStudent() {
  return useMutation({
    mutationFn: ({ studentId, payload }: { studentId: number; payload: UpdateStudentPayload }) =>
      fetchJson<Student>(`${API_PROXY}/student/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
  });
}
