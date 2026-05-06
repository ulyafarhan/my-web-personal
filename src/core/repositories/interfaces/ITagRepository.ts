import type { Tag, TagPayload } from '../../models/tag';

export interface ITagRepository {
  getAll(): Promise<Tag[]>;
  getById(id: string): Promise<Tag | null>;
  create(payload: TagPayload): Promise<Tag>;
  update(id: string, payload: TagPayload): Promise<Tag>;
  delete(id: string): Promise<boolean>;
}
