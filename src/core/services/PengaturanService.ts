import type { IPengaturan, IPengaturanRepository } from '../repositories/interfaces/IPengaturanRepository';

export class PengaturanService {
  constructor(private repo: IPengaturanRepository) {}

  async ambilSemua() {
    return await this.repo.ambilSemua();
  }

  async simpanPengaturan(data: any) {
    let entries: IPengaturan[] = [];

    if (Array.isArray(data)) {
      entries = data.map((item: any) => ({
        kunci: String(item.kunci),
        nilai: String(item.nilai ?? ''),
        grup: String(item.grup || 'publik')
      }));
    } else {
      entries = Object.entries(data).map(([kunci, nilai]) => ({
        kunci: String(kunci),
        nilai: String(nilai ?? ''),
        grup: 'publik'
      }));
    }

    if (entries.length === 0 || entries.some(e => !e.kunci)) {
      throw new Error('Data pengaturan tidak valid');
    }

    await this.repo.simpanBatch(entries);
  }

  async getProfilSingkat() {
    const kunci = ['nama_pemilik', 'ringkasan_diri', 'profesi'];
    const data = await this.repo.ambilBerdasarkanKunci(kunci);
    
    return {
      nama_pemilik: data.find(p => p.kunci === 'nama_pemilik')?.nilai ?? 'Admin',
      profesi: data.find(p => p.kunci === 'profesi')?.nilai ?? '',
      ringkasan_diri: data.find(p => p.kunci === 'ringkasan_diri')?.nilai ?? ''
    };
  }
}
