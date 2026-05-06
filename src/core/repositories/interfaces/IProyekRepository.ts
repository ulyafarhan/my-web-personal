import type { Proyek, ProyekPayload, Tag, PublicationStatus } from '../../models/proyek';
import type { PaginationMeta } from '../../models/common';

export interface IProyekRepository {
  getAll(page: number, limit: number, status?: PublicationStatus): Promise<{ data: Proyek[]; meta: PaginationMeta }>;
  getById(id: string): Promise<Proyek | null>;
  getByIds(ids: string[]): Promise<Proyek[]>;
  getBySlug(slug: string): Promise<Proyek | null>;
  create(payload: ProyekPayload): Promise<Proyek>;
  update(id: string, payload: ProyekPayload): Promise<Proyek>;
  delete(id: string): Promise<boolean>;
  incrementViewCount(id: string): Promise<void>;
  updateCacheAnalisis(id: string, cache: any): Promise<void>;
  getAllTags(): Promise<Tag[]>;
}
