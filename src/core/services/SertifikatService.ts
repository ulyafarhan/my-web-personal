import type { ISertifikat, ISertifikatRepository } from '../repositories/interfaces/ISertifikatRepository';

export class SertifikatService {
  constructor(private repo: ISertifikatRepository) {}

  async ambilSemua(): Promise<ISertifikat[]> {
    return await this.repo.ambilSemua();
  }

  async ambilBerdasarkanId(id: string): Promise<ISertifikat | null> {
    return await this.repo.ambilBerdasarkanId(id);
  }

  async tambahSertifikat(payload: any): Promise<ISertifikat> {
    const nama = String(payload.nama || '').trim();
    const penerbit = String(payload.penerbit || '').trim();
    const tahun = String(payload.tahun || '').trim();

    if (!nama) throw new Error('Nama sertifikat wajib diisi');
    if (!penerbit) throw new Error('Penerbit wajib diisi');
    if (!tahun) throw new Error('Tahun wajib diisi');

    return await this.repo.tambah({
      nama,
      penerbit,
      tahun,
      url_kredensial: payload.url_kredensial || null,
      urutan: Number(payload.urutan ?? 0)
    });
  }

  async perbaruiSertifikat(id: string, payload: any): Promise<ISertifikat> {
    return await this.repo.perbarui(id, payload);
  }

  async hapusSertifikat(id: string): Promise<boolean> {
    return await this.repo.hapus(id);
  }
}

