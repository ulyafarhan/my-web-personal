export interface IKeahlian {
  id: string;
  nama: string;
  persentase: number;
  kategori?: string | null;
  warna?: string | null;
  urutan: number;
  created_at?: string;
  updated_at?: string;
}

export interface IKeahlianRepository {
  ambilSemua(): Promise<IKeahlian[]>;
  ambilBerdasarkanId(id: string): Promise<IKeahlian | null>;
  tambah(data: Omit<IKeahlian, 'id' | 'created_at' | 'updated_at'>): Promise<IKeahlian>;
  perbarui(id: string, data: Partial<IKeahlian>): Promise<IKeahlian>;
  hapus(id: string): Promise<boolean>;
}
