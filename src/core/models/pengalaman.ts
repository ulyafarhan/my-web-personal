export interface Pengalaman {
  id: string;
  peran: string;
  organisasi: string;
  periode: string;
  deskripsi: string;
  urutan: number;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface PengalamanPayload {
  peran: string;
  organisasi: string;
  periode: string;
  deskripsi: string;
  urutan?: number;
  metadata?: Record<string, unknown> | null;
}
