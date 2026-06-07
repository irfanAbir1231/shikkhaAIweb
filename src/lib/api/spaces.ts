'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StudySpace, SpaceDocument, CreateSpacePayload, SpaceDetail } from '@/lib/types/spaces';

async function fetchSpaces(): Promise<StudySpace[]> {
  const res = await fetch('/api/proxy/spaces');
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch spaces');
  return data.data as StudySpace[];
}

async function createSpace(payload: CreateSpacePayload): Promise<StudySpace> {
  const res = await fetch('/api/proxy/spaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to create space');
  return data.data as StudySpace;
}

async function fetchSpaceDetail(spaceId: string): Promise<SpaceDetail> {
  const res = await fetch(`/api/proxy/spaces/${spaceId}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch space detail');
  return data.data as SpaceDetail;
}

async function uploadDocument(
  spaceId: string,
  { file, onProgress }: { file: File; onProgress: (progress: number) => void }
): Promise<SpaceDocument> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && response.success) {
          resolve(response.data as SpaceDocument);
        } else if (xhr.status === 413) {
          reject(new Error('File too large. Maximum size is 20 MB.'));
        } else if (xhr.status === 415) {
          reject(new Error('Only PDF files are supported.'));
        } else {
          reject(new Error(response.error?.message || 'Upload failed'));
        }
      } catch {
        reject(new Error('Invalid server response'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload. Please try again.'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was cancelled.'));
    });

    xhr.open('POST', `/api/proxy/spaces/${spaceId}/documents`);
    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
}

export function useSpaces() {
  return useQuery({
    queryKey: ['spaces'],
    queryFn: fetchSpaces,
  });
}

export function useCreateSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}

export function useSpaceDetail(spaceId: string | undefined) {
  return useQuery({
    queryKey: ['space-detail', spaceId],
    queryFn: () => fetchSpaceDetail(spaceId!),
    enabled: !!spaceId,
  });
}

export function useUploadDocument(spaceId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { file: File; onProgress: (progress: number) => void }) =>
      uploadDocument(spaceId!, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-detail', spaceId] });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}
