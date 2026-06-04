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
}
