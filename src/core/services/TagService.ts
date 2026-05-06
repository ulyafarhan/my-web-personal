import type { ITagRepository } from '../repositories/interfaces/ITagRepository';
import type { TagPayload } from '../models/tag';

export class TagService {
  constructor(private repo: ITagRepository) {}

  async ambilSemua() {
    return await this.repo.getAll();
  }

  async ambilBerdasarkanId(id: string) {
    return await this.repo.getById(id);
  }

  async tambahTag(payload: TagPayload) {
    return await this.repo.create(payload);
  }

  async perbaruiTag(id: string, payload: TagPayload) {
    return await this.repo.update(id, payload);
  }

  async hapusTag(id: string) {
    return await this.repo.delete(id);
  }
}
