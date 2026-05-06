export interface ISertifikat {
  id: string;
  nama: string;
  penerbit: string;
  tahun: string;
  url_kredensial?: string | null;
  urutan: number;
  created_at: string;
  updated_at: string;
}

export interface ISertifikatRepository {
  ambilSemua(): Promise<ISertifikat[]>;
  ambilBerdasarkanId(id: string): Promise<ISertifikat | null>;
  tambah(data: Omit<ISertifikat, 'id' | 'created_at' | 'updated_at'>): Promise<ISertifikat>;
  perbarui(id: string, data: Partial<ISertifikat>): Promise<ISertifikat>;
  hapus(id: string): Promise<boolean>;
}

