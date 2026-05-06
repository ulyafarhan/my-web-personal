import type { IPengalamanRepository } from './interfaces/IPengalamanRepository';
import type { Pengalaman, PengalamanPayload } from '../models/pengalaman';
import { ulid } from 'ulidx';
import { parseJson } from '../../lib/response';

export class D1PengalamanRepository implements IPengalamanRepository {
  constructor(private db: D1Database) {}

  private mapRow(row: any): Pengalaman {
    return {
      ...row,
      metadata: parseJson<Record<string, unknown>>(row.metadata, {})
    };
  }

  async getAll(): Promise<Pengalaman[]> {
    const { results } = await this.db.prepare('SELECT * FROM pengalaman ORDER BY urutan ASC, created_at DESC').all();
    return results.map(row => this.mapRow(row));
  }

  async getById(id: string): Promise<Pengalaman | null> {
    const row = await this.db.prepare('SELECT * FROM pengalaman WHERE id = ?').bind(id).first();
    return row ? this.mapRow(row) : null;
  }

  async create(payload: PengalamanPayload): Promise<Pengalaman> {
    const id = ulid();
    await this.db.prepare(`
      INSERT INTO pengalaman (id, peran, organisasi, periode, deskripsi, urutan, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      payload.peran,
      payload.organisasi,
      payload.periode,
      payload.deskripsi,
      payload.urutan ?? 0,
      JSON.stringify(payload.metadata ?? {})
    ).run();

    return (await this.getById(id))!;
  }

  async update(id: string, payload: PengalamanPayload): Promise<Pengalaman> {
    await this.db.prepare(`
      UPDATE pengalaman 
      SET peran = ?, organisasi = ?, periode = ?, deskripsi = ?, urutan = ?, metadata = ?
      WHERE id = ?
    `).bind(
      payload.peran,
      payload.organisasi,
      payload.periode,
      payload.deskripsi,
      payload.urutan ?? 0,
      JSON.stringify(payload.metadata ?? {}),
      id
    ).run();

    const updated = await this.getById(id);
    if (!updated) throw new Error('Pengalaman tidak ditemukan');
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM pengalaman WHERE id = ?').bind(id).run();
    return (result.meta?.changes ?? 0) > 0;
  }
}
