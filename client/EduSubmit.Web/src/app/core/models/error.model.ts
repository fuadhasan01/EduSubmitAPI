export interface ApiError {
  status?: number;
  title?: string;
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}