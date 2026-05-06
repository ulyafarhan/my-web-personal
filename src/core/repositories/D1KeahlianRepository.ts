import type { IKeahlian, IKeahlianRepository } from './interfaces/IKeahlianRepository';
import { ulid } from 'ulidx';
import { withRetry } from '../../lib/retry';

export class D1KeahlianRepository implements IKeahlianRepository {
  constructor(private db: D1Database) {}

  async ambilSemua(): Promise<IKeahlian[]> {
    const { results } = await withRetry(() => 
      this.db.prepare('SELECT * FROM keahlian ORDER BY urutan ASC, created_at DESC').all()
    );
    return results as unknown as IKeahlian[];
  }

  async ambilBerdasarkanId(id: string): Promise<IKeahlian | null> {
    const result = await withRetry(() => 
      this.db.prepare('SELECT * FROM keahlian WHERE id = ?').bind(id).first()
    );
    return result as unknown as IKeahlian | null;
  }

  async tambah(data: Omit<IKeahlian, 'id' | 'created_at' | 'updated_at'>): Promise<IKeahlian> {
    const id = ulid();
    await withRetry(() => 
      this.db.prepare(`
        INSERT INTO keahlian (id, nama, persentase, kategori, warna, urutan)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(id, data.nama, data.persentase, data.kategori || null, data.warna || null, data.urutan).run()
    );

    const result = await this.ambilBerdasarkanId(id);
    if (!result) throw new Error('Gagal mengambil keahlian setelah ditambahkan');
    return result;
  }

  async perbarui(id: string, data: Partial<IKeahlian>): Promise<IKeahlian> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.nama !== undefined) {
      fields.push('nama = ?');
      values.push(data.nama);
    }
    if (data.persentase !== undefined) {
      fields.push('persentase = ?');
      values.push(data.persentase);
    }
    if (data.kategori !== undefined) {
      fields.push('kategori = ?');
      values.push(data.kategori);
    }
    if (data.warna !== undefined) {
      fields.push('warna = ?');
      values.push(data.warna);
    }
    if (data.urutan !== undefined) {
      fields.push('urutan = ?');
      values.push(data.urutan);
    }

    if (fields.length === 0) {
        const result = await this.ambilBerdasarkanId(id);
        if (!result) throw new Error('Keahlian tidak ditemukan');
        return result;
    }

    values.push(id);
    await withRetry(() => 
      this.db.prepare(`UPDATE keahlian SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run()
    );

    const result = await this.ambilBerdasarkanId(id);
    if (!result) throw new Error('Keahlian tidak ditemukan setelah diperbarui');
    return result;
  }

  async hapus(id: string): Promise<boolean> {
    const res = await withRetry(() => 
      this.db.prepare('DELETE FROM keahlian WHERE id = ?').bind(id).run()
    );
    return res.success && (res.meta?.changes ?? 0) > 0;
  }
}
