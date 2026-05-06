import type { ISertifikat, ISertifikatRepository } from './interfaces/ISertifikatRepository';
import { ulid } from 'ulidx';
import { withRetry } from '../../lib/retry';

export class D1SertifikatRepository implements ISertifikatRepository {
  constructor(private db: D1Database) {}

  async ambilSemua(): Promise<ISertifikat[]> {
    const { results } = await withRetry(() => 
      this.db.prepare('SELECT * FROM sertifikat ORDER BY urutan ASC, tahun DESC, created_at DESC').all()
    );
    return results as unknown as ISertifikat[];
  }

  async ambilBerdasarkanId(id: string): Promise<ISertifikat | null> {
    const result = await withRetry(() => 
      this.db.prepare('SELECT * FROM sertifikat WHERE id = ?').bind(id).first()
    );
    return result as unknown as ISertifikat | null;
  }

  async tambah(data: Omit<ISertifikat, 'id' | 'created_at' | 'updated_at'>): Promise<ISertifikat> {
    const id = ulid();
    await withRetry(() => 
      this.db.prepare(`
        INSERT INTO sertifikat (id, nama, penerbit, tahun, url_kredensial, urutan)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(id, data.nama, data.penerbit, data.tahun, data.url_kredensial || null, data.urutan ?? 0).run()
    );

    const result = await this.ambilBerdasarkanId(id);
    if (!result) throw new Error('Gagal mengambil sertifikat setelah ditambahkan');
    return result;
  }

  async perbarui(id: string, data: Partial<ISertifikat>): Promise<ISertifikat> {
    const fields: string[] = [];
    const values: any[] = [];

    const updateableFields = ['nama', 'penerbit', 'tahun', 'url_kredensial', 'urutan'];
    
    updateableFields.forEach(field => {
      if ((data as any)[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push((data as any)[field]);
      }
    });

    if (fields.length === 0) {
        const result = await this.ambilBerdasarkanId(id);
        if (!result) throw new Error('Sertifikat tidak ditemukan');
        return result;
    }

    values.push(id);
    await withRetry(() => 
      this.db.prepare(`UPDATE sertifikat SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run()
    );

    const result = await this.ambilBerdasarkanId(id);
    if (!result) throw new Error('Sertifikat tidak ditemukan setelah diperbarui');
    return result;
  }

  async hapus(id: string): Promise<boolean> {
    const res = await withRetry(() => 
      this.db.prepare('DELETE FROM sertifikat WHERE id = ?').bind(id).run()
    );
    return res.success && (res.meta?.changes ?? 0) > 0;
  }
}

