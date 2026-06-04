export interface StudySpace {
  id: string;
  name: string;
  subject: string;
  document_count: number;
  class_level?: string;
  description?: string;
  created_at?: string;
}

export interface SpaceDocument {
  id: string;
  original_name: string;
  file_size_bytes: number;
  is_indexed: boolean;
  uploaded_at?: string;
}

export interface CreateSpacePayload {
  name: string;
  subject: string;
  class_level: string;
  description: string;
}
