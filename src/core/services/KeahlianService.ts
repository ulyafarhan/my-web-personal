import type { IKeahlian, IKeahlianRepository } from '../repositories/interfaces/IKeahlianRepository';

export class KeahlianService {
  constructor(private repo: IKeahlianRepository) {}

  async ambilSemua(): Promise<IKeahlian[]> {
    return await this.repo.ambilSemua();
  }

  async ambilBerdasarkanId(id: string): Promise<IKeahlian | null> {
    return await this.repo.ambilBerdasarkanId(id);
  }

  async tambahKeahlian(payload: any): Promise<IKeahlian> {
    const nama = String(payload.nama || '').trim();
    const persentase = Number(payload.persentase ?? 0);
    const kategori = String(payload.kategori || '').trim() || null;
    const warna = String(payload.warna || '').trim() || null;
    const urutan = Number(payload.urutan ?? 0);

    if (!nama) throw new Error('Nama keahlian wajib diisi');
    if (persentase < 0 || persentase > 100 || !Number.isFinite(persentase)) {
        throw new Error('Persentase harus antara 0-100');
    }

    return await this.repo.tambah({
      nama,
      persentase,
      kategori,
      warna,
      urutan: Number.isFinite(urutan) ? urutan : 0
    });
  }

  async perbaruiKeahlian(id: string, payload: any): Promise<IKeahlian> {
    const data: Partial<IKeahlian> = {};
    
    if (payload.nama !== undefined) data.nama = String(payload.nama).trim();
    if (payload.persentase !== undefined) {
        const p = Number(payload.persentase);
        if (p < 0 || p > 100 || !Number.isFinite(p)) {
            throw new Error('Persentase harus antara 0-100');
        }
        data.persentase = p;
    }
    if (payload.kategori !== undefined) data.kategori = String(payload.kategori).trim() || null;
    if (payload.warna !== undefined) data.warna = String(payload.warna).trim() || null;
    if (payload.urutan !== undefined) data.urutan = Number(payload.urutan) || 0;

    return await this.repo.perbarui(id, data);
  }

  async hapusKeahlian(id: string): Promise<boolean> {
    return await this.repo.hapus(id);
  }
}
