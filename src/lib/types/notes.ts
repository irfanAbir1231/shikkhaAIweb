export interface NoteCreate {
  title: string;
  content: string;
  topic?: string;
  subject?: string;
  class_level?: string;
  source?: 'study_companion' | 'practice' | 'topic_notes';
}

export interface NoteGenerateRequest {
  topic: string;
  subject: string;
}

export interface NoteResponse {
  id: number;
  title: string;
  content: string;
  topic: string | null;
  subject: string | null;
  class_level: string | null;
  source: string;
  created_at: string;
  updated_at: string | null;
  version_count?: number;
}

export interface NoteVersion {
  id: number;
  version: number;
  content: string;
  generated_at: string;
}

export interface SavedNote {
  id: number;
  note_id: number;
  title: string;
  topic: string | null;
  bookmarked: boolean;
  saved_at: string;
}
