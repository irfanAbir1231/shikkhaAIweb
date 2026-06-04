export interface Student {
  id: number;
  name: string;
  email: string;
  grade_level: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  grade_level: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  student: Student;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: null | { code: string; message: string };
}
