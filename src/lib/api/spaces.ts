'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StudySpace, SpaceDocument, CreateSpacePayload } from '@/lib/types/spaces';

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

async function fetchDocuments(spaceId: string): Promise<SpaceDocument[]> {
  const res = await fetch(`/api/proxy/spaces/${spaceId}/documents`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch documents');
  return data.data as SpaceDocument[];
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
          reject(new Error('File too large. Maximum size is 50 MB.'));
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

    xhr.open('POST', `/api/proxy/spaces/${spaceId}/upload`);
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

export function useSpaceDocuments(spaceId: string | undefined) {
  return useQuery({
    queryKey: ['space-documents', spaceId],
    queryFn: () => fetchDocuments(spaceId!),
    enabled: !!spaceId,
  });
}

export function useUploadDocument(spaceId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { file: File; onProgress: (progress: number) => void }) =>
      uploadDocument(spaceId!, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-documents', spaceId] });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}
