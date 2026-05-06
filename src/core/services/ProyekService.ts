import type { IProyekRepository } from '../repositories/interfaces/IProyekRepository';
import type { ProyekPayload } from '../models/proyek';
import type { VectorService } from './VectorService';

export class ProyekService {
  constructor(
    private repo: IProyekRepository,
    private vectorService?: VectorService
  ) {}

  async ambilSemua(page: number, limit: number, status?: number) {
    return await this.repo.getAll(page, limit, status);
  }

  async ambilBerdasarkanId(id: string) {
    return await this.repo.getById(id);
  }

  async ambilBerdasarkanIds(ids: string[]) {
    return await this.repo.getByIds(ids);
  }

  async ambilBerdasarkanSlug(slug: string) {
    const proyek = await this.repo.getBySlug(slug);
    if (proyek) await this.repo.incrementViewCount(proyek.id);
    return proyek;
  }

  async buatProyek(payload: ProyekPayload) {
    const proyek = await this.repo.create(payload);
    if (this.vectorService && proyek.status_publikasi === 1) {
      await this.vectorService.upsertProyekVector(proyek).catch(err => console.error('Vector Sync Error:', err));
    }
    return proyek;
  }

  async perbaruiProyek(id: string, payload: ProyekPayload) {
    const proyek = await this.repo.update(id, payload);
    if (this.vectorService) {
      if (proyek.status_publikasi === 1) {
        await this.vectorService.upsertProyekVector(proyek).catch(err => console.error('Vector Sync Error:', err));
      } else {
        await this.vectorService.deleteProyekVector(id).catch(() => {});
      }
    }
    return proyek;
  }

  async hapusProyek(id: string) {
    const success = await this.repo.delete(id);
    if (success && this.vectorService) {
      await this.vectorService.deleteProyekVector(id).catch(() => {});
    }
    return success;
  }

  async ambilSemuaTag() {
    return await this.repo.getAllTags();
  }
}