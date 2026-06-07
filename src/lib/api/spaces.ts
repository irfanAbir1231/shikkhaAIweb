'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StudySpace, SpaceDocument, CreateSpacePayload, SpaceDetail } from '@/lib/types/spaces';

interface ApiEnvelope {
  success: boolean;
  data?: unknown;
  error?: { code?: string; message?: string };
  detail?: unknown; // FastAPI default error shape
}

async function parseApiResponse(res: Response): Promise<ApiEnvelope> {
  let text: string;
  try {
    text = await res.text();
  } catch {
    text = '';
  }

  let json: Partial<ApiEnvelope> | null = null;
  try {
    json = text ? (JSON.parse(text) as Partial<ApiEnvelope>) : null;
  } catch {
    json = null;
  }

  if (json && typeof json === 'object' && 'success' in json) {
    return json as ApiEnvelope;
  }

  // Upstream returned a non-JSON or unexpected envelope
  const upstreamMessage = json && typeof json === 'object' && 'detail' in json
    ? String((json as { detail?: unknown }).detail)
    : text || `HTTP ${res.status} ${res.statusText}`;

  return {
    success: false,
    error: {
      code: 'UPSTREAM_ERROR',
      message: upstreamMessage,
    },
  };
}

async function fetchSpaces(): Promise<StudySpace[]> {
  const res = await fetch('/api/proxy/spaces');
  const json = await parseApiResponse(res);
  if (!json.success) {
    throw new Error(json.error?.message || 'Failed to fetch spaces');
  }
  return (json.data as StudySpace[]) ?? [];
}

async function createSpace(payload: CreateSpacePayload): Promise<StudySpace> {
  const res = await fetch('/api/proxy/spaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await parseApiResponse(res);
  if (!json.success) {
    throw new Error(json.error?.message || 'Failed to create space');
  }
  return json.data as StudySpace;
}

async function fetchSpaceDetail(spaceId: string): Promise<SpaceDetail> {
  const res = await fetch(`/api/proxy/spaces/${spaceId}`);
  const json = await parseApiResponse(res);
  if (!json.success) {
    throw new Error(json.error?.message || 'Failed to fetch space detail');
  }
  return json.data as SpaceDetail;
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
        const response = JSON.parse(xhr.responseText || '{}') as ApiEnvelope;
        if (xhr.status >= 200 && xhr.status < 300 && response.success) {
          resolve(response.data as SpaceDocument);
        } else if (xhr.status === 413) {
          reject(new Error('File too large. Maximum size is 20 MB.'));
        } else if (xhr.status === 415) {
          reject(new Error('Only PDF files are supported.'));
        } else {
          reject(new Error(response.error?.message || response.detail as string || `Upload failed (${xhr.status})`));
        }
      } catch {
        reject(new Error(xhr.responseText || 'Invalid server response'));
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
