import type { IPengalamanRepository } from '../repositories/interfaces/IPengalamanRepository';
import type { PengalamanPayload } from '../models/pengalaman';

export class PengalamanService {
  constructor(private repo: IPengalamanRepository) {}

  async ambilSemua() {
    return await this.repo.getAll();
  }

  async ambilBerdasarkanId(id: string) {
    return await this.repo.getById(id);
  }

  async tambahPengalaman(payload: PengalamanPayload) {
    return await this.repo.create(payload);
  }

  async perbaruiPengalaman(id: string, payload: PengalamanPayload) {
    return await this.repo.update(id, payload);
  }

  async hapusPengalaman(id: string) {
    return await this.repo.delete(id);
  }
}
