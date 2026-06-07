export interface StudySpace {
  id: number;
  name: string;
  subject: string | null;
  class_level: string | null;
  description: string | null;
  document_count: number;
  created_at: string;
  updated_at: string;
}

export interface SpaceDocument {
  id: number;
  space_id: number;
  filename: string;
  size_bytes: number;
  page_count: number;
  chunks_count: number;
  created_at: string;
}

export interface CreateSpacePayload {
  name: string;
  subject: string;
  class_level: string;
  description: string;
}

export interface SpaceDetail {
  id: number;
  student_id: number;
  name: string;
  subject: string | null;
  class_level: string | null;
  description: string | null;
  documents: SpaceDocument[];
  created_at: string;
  updated_at: string;
}
