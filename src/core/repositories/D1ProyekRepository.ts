import type { IProyekRepository } from './interfaces/IProyekRepository';
import { PublicationStatus, type Proyek, type ProyekPayload, type Tag } from '../models/proyek';
import type { PaginationMeta } from '../models/common';
import { ulid } from 'ulidx';
import { withRetry } from '../../lib/retry';

export class D1ProyekRepository implements IProyekRepository {
  constructor(private db: D1Database) {}

  private parseJson<T>(data: unknown): T | null {
    if (!data) return null;
    try {
      return typeof data === 'string' ? JSON.parse(data) : (data as T);
    } catch {
      return null;
    }
  }

  private parseProyek(row: any): Proyek {
    return {
      ...row,
      meta_seo: this.parseJson(row.meta_seo),
      meta_geo: this.parseJson(row.meta_geo),
      ai_tags: this.parseJson(row.ai_tags),
      tags: this.parseJson(row.tags_json) || [],
      cache_analisis: this.parseJson(row.cache_analisis)
    };
  }

  async getAll(page: number, limit: number, status?: PublicationStatus): Promise<{ data: Proyek[]; meta: PaginationMeta }> {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    let whereClause = '';

    if (status !== undefined) {
      whereClause = 'WHERE p.status_publikasi = ?';
      params.push(status);
    }

    const query = `
      SELECT p.*, 
             (SELECT JSON_GROUP_ARRAY(JSON_OBJECT('id', t.id, 'nama', t.nama, 'slug', t.slug))
              FROM proyek_tag pt 
              JOIN tag t ON pt.tag_id = t.id 
              WHERE pt.proyek_id = p.id) as tags_json
      FROM proyek p
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const { results } = await withRetry(() => this.db.prepare(query).bind(...params, limit, offset).all());
    
    const countQuery = `SELECT COUNT(*) as total FROM proyek p ${whereClause}`;
    const totalRes = await withRetry(() => this.db.prepare(countQuery).bind(...(status !== undefined ? [status] : [])).first());
    const total = (totalRes?.total as number) || 0;

    return {
      data: results.map((row) => this.parseProyek(row)),
      meta: {
        current_page: page,
        last_page: Math.ceil(total / limit),
        per_page: limit,
        total
      }
    };
  }

  async getById(id: string): Promise<Proyek | null> {
    const row = await withRetry(() => this.db.prepare(`
      SELECT p.*, 
             (SELECT JSON_GROUP_ARRAY(JSON_OBJECT('id', t.id, 'nama', t.nama, 'slug', t.slug))
              FROM proyek_tag pt 
              JOIN tag t ON pt.tag_id = t.id 
              WHERE pt.proyek_id = p.id) as tags_json
      FROM proyek p WHERE p.id = ?
    `).bind(id).first());
    return row ? this.parseProyek(row) : null;
  }

  async getByIds(ids: string[]): Promise<Proyek[]> {
    if (!ids || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const { results } = await withRetry(() => this.db.prepare(`
      SELECT p.*, 
             (SELECT JSON_GROUP_ARRAY(JSON_OBJECT('id', t.id, 'nama', t.nama, 'slug', t.slug))
              FROM proyek_tag pt 
              JOIN tag t ON pt.tag_id = t.id 
              WHERE pt.proyek_id = p.id) as tags_json
      FROM proyek p WHERE p.id IN (${placeholders})
    `).bind(...ids).all());
    
    // Sort to match original ids order
    const map = new Map();
    results.forEach((row: any) => map.set(row.id, this.parseProyek(row)));
    return ids.map(id => map.get(id)).filter(Boolean);
  }

  async getBySlug(slug: string): Promise<Proyek | null> {
    const row = await withRetry(() => this.db.prepare(`
      SELECT p.*, 
             (SELECT JSON_GROUP_ARRAY(JSON_OBJECT('id', t.id, 'nama', t.nama, 'slug', t.slug))
              FROM proyek_tag pt 
              JOIN tag t ON pt.tag_id = t.id 
              WHERE pt.proyek_id = p.id) as tags_json
      FROM proyek p WHERE p.slug = ?
    `).bind(slug).first());
    return row ? this.parseProyek(row) : null;
  }

  async create(payload: ProyekPayload): Promise<Proyek> {
    const id = ulid();
    const stmts: D1PreparedStatement[] = [];
    const status = Number(payload.status_publikasi ?? 0);

    stmts.push(this.db.prepare(`
      INSERT INTO proyek (id, judul, slug, ringkasan, konten_html, url_gambar_sampul, url_demo, url_repo, status_publikasi, meta_seo, meta_geo, ai_tags, dipublikasikan_pada)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, payload.judul, payload.slug, payload.ringkasan, payload.konten_html, 
      payload.url_gambar_sampul || null, payload.url_demo || null, payload.url_repo || null,
      status, JSON.stringify(payload.meta_seo || null),
      JSON.stringify(payload.meta_geo || null), JSON.stringify(payload.ai_tags || null),
      status === PublicationStatus.PUBLISHED ? new Date().toISOString() : null
    ));

    if (payload.tag_ids?.length) {
      payload.tag_ids.forEach(tagId => {
        stmts.push(this.db.prepare('INSERT INTO proyek_tag (proyek_id, tag_id) VALUES (?, ?)').bind(id, tagId));
      });
    }

    await withRetry(() => this.db.batch(stmts));
    return (await this.getById(id))!;
  }

  async update(id: string, payload: ProyekPayload): Promise<Proyek> {
    const stmts: D1PreparedStatement[] = [];
    const status = Number(payload.status_publikasi ?? 0);
    stmts.push(this.db.prepare(`
      UPDATE proyek SET 
        judul = ?, slug = ?, ringkasan = ?, konten_html = ?, 
        url_gambar_sampul = ?, url_demo = ?, url_repo = ?, status_publikasi = ?, 
        meta_seo = ?, meta_geo = ?, ai_tags = ?,
        dipublikasikan_pada = CASE WHEN ? = ${PublicationStatus.PUBLISHED} AND dipublikasikan_pada IS NULL THEN CURRENT_TIMESTAMP ELSE dipublikasikan_pada END
      WHERE id = ?
    `).bind(
      payload.judul, payload.slug, payload.ringkasan, payload.konten_html, 
      payload.url_gambar_sampul || null, payload.url_demo || null, payload.url_repo || null,
      status, JSON.stringify(payload.meta_seo || null),
      JSON.stringify(payload.meta_geo || null), JSON.stringify(payload.ai_tags || null),
      status, id
    ));

    stmts.push(this.db.prepare('DELETE FROM proyek_tag WHERE proyek_id = ?').bind(id));
    if (payload.tag_ids?.length) {
      payload.tag_ids.forEach(tagId => {
        stmts.push(this.db.prepare('INSERT INTO proyek_tag (proyek_id, tag_id) VALUES (?, ?)').bind(id, tagId));
      });
    }

    await withRetry(() => this.db.batch(stmts));
    const updated = await this.getById(id);
    if (!updated) throw new Error('Proyek tidak ditemukan');
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.db.prepare('DELETE FROM proyek WHERE id = ?').bind(id).run();
    return res.success && (res.meta?.changes ?? 0) > 0;
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.db.prepare('UPDATE proyek SET view_count = view_count + 1 WHERE id = ?').bind(id).run();
  }

  async updateCacheAnalisis(id: string, cache: any): Promise<void> {
    await this.db.prepare('UPDATE proyek SET cache_analisis = ? WHERE id = ?')
      .bind(JSON.stringify(cache), id)
      .run();
  }

  async getAllTags(): Promise<Tag[]> {
    const { results } = await this.db.prepare('SELECT * FROM tag ORDER BY nama ASC').all();
    return results as unknown as Tag[];
  }
}
