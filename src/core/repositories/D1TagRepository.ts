import type { ITagRepository } from './interfaces/ITagRepository';
import type { Tag, TagPayload } from '../models/tag';
import { ulid } from 'ulidx';

export class D1TagRepository implements ITagRepository {
  constructor(private db: D1Database) {}

  async getAll(): Promise<Tag[]> {
    const { results } = await this.db.prepare('SELECT * FROM tag ORDER BY nama ASC').all();
    return results as unknown as Tag[];
  }

  async getById(id: string): Promise<Tag | null> {
    const row = await this.db.prepare('SELECT * FROM tag WHERE id = ?').bind(id).first();
    return row as unknown as Tag | null;
  }

  async create(payload: TagPayload): Promise<Tag> {
    const id = ulid();
    await this.db.prepare('INSERT INTO tag (id, nama, slug) VALUES (?, ?, ?)')
      .bind(id, payload.nama, payload.slug || payload.nama.toLowerCase().replace(/ /g, '-'))
      .run();

    return (await this.getById(id))!;
  }

  async update(id: string, payload: TagPayload): Promise<Tag> {
    await this.db.prepare('UPDATE tag SET nama = ?, slug = ? WHERE id = ?')
      .bind(payload.nama, payload.slug, id)
      .run();

    const updated = await this.getById(id);
    if (!updated) throw new Error('Tag tidak ditemukan');
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM tag WHERE id = ?').bind(id).run();
    return (result.meta?.changes ?? 0) > 0;
  }
}
