export interface UploadResponse {
  success: boolean;
  data: { url: string };
  message?: string;
  errors?: Record<string, string[]>;
}

export interface SaveResponse {
  success: boolean;
  data: unknown;
  message?: string;
  errors?: Record<string, string[]>;
}
