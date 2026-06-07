export interface StudyCompanionAskRequest {
  student_id: number;
  message: string;
  mode: string;
  subject: string;
  class_level: string;
  pdf_context?: string;
}

export interface StudyCompanionAskResponse {
  response: string;
  sources: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
  isLoading?: boolean;
  isError?: boolean;
  retryText?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}
