import type { IPengaturan, IPengaturanRepository } from './interfaces/IPengaturanRepository';

export class D1PengaturanRepository implements IPengaturanRepository {
  constructor(private db: D1Database) {}

  async ambilSemua(): Promise<IPengaturan[]> {
    const { results } = await this.db
      .prepare('SELECT kunci, nilai, grup FROM pengaturan_situs ORDER BY grup ASC, kunci ASC')
      .all();
    return results as unknown as IPengaturan[];
  }

  async ambilBerdasarkanKunci(kunci: string[]): Promise<IPengaturan[]> {
    if (kunci.length === 0) return [];
    
    const placeholders = kunci.map(() => '?').join(', ');
    const { results } = await this.db
      .prepare(`SELECT kunci, nilai, grup FROM pengaturan_situs WHERE kunci IN (${placeholders})`)
      .bind(...kunci)
      .all();
    
    return results as unknown as IPengaturan[];
  }

  async simpanBatch(entri: IPengaturan[]): Promise<void> {
    const stmts = entri.map((item) =>
      this.db.prepare(`
        INSERT INTO pengaturan_situs (kunci, nilai, grup)
        VALUES (?, ?, ?)
        ON CONFLICT(kunci) DO UPDATE SET nilai = excluded.nilai, grup = excluded.grup
      `).bind(item.kunci, item.nilai, item.grup)
    );

    await this.db.batch(stmts);
  }
}
