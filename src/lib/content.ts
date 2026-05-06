import type { Proyek } from '@/core/models/proyek';
export type { Proyek };
import type { IKeahlian } from '@/core/repositories/interfaces/IKeahlianRepository';
export type { IKeahlian as Keahlian };
import type { ISertifikat } from '@/core/repositories/interfaces/ISertifikatRepository';
export type { ISertifikat as Sertifikat };
import { type Pengalaman } from '@/core/models/pengalaman';
export type { Pengalaman as PengalamanIT };

import { D1ProyekRepository } from '@/core/repositories/D1ProyekRepository';
import { ProyekService } from '@/core/services/ProyekService';
import { D1PengaturanRepository } from '@/core/repositories/D1PengaturanRepository';
import { PengaturanService } from '@/core/services/PengaturanService';
import { D1PengalamanRepository } from '@/core/repositories/D1PengalamanRepository';
import { PengalamanService } from '@/core/services/PengalamanService';
import { D1SertifikatRepository } from '@/core/repositories/D1SertifikatRepository';
import { SertifikatService } from '@/core/services/SertifikatService';
import { D1KeahlianRepository } from '@/core/repositories/D1KeahlianRepository';
import { KeahlianService } from '@/core/services/KeahlianService';

export const DEFAULT_SETTINGS: Record<string, string> = {
  nama_pemilik: 'Farhan',
  profesi: 'Full-Stack Developer',
  hero_badge: 'Tersedia untuk proyek, riset, dan kolaborasi teknologi',
  hero_title: 'Membangun produk digital yang cepat, aman, dan siap berkembang.',
  hero_desc: 'Saya membantu merancang dan membangun aplikasi web modern, backend API, integrasi cloud, dan pengalaman antarmuka yang rapi untuk kebutuhan bisnis maupun eksperimen teknis.',
  ringkasan_diri: 'Farhan adalah pengembang web yang berfokus pada backend, arsitektur aplikasi, integrasi cloud, dan antarmuka yang nyaman digunakan.',
  cta_primary: 'Diskusikan Proyek',
  cta_secondary: 'Lihat Karya Saya',
  email_kontak: 'hello@example.com',
  github_url: 'https://github.com/',
  linkedin_url: 'https://linkedin.com/',
  stat_1_label: 'Proyek dan riset teknis',
  stat_1_value: '30+',
  stat_2_label: 'Teknologi yang dieksplorasi',
  stat_2_value: '20+',
  stat_3_label: 'Fokus kualitas dan performa',
  stat_3_value: '99%',
};

export async function getSettings(db: D1Database) {
  if (!db) return DEFAULT_SETTINGS;
  const service = new PengaturanService(new D1PengaturanRepository(db));
  const settings = await service.ambilSemua();
  
  const reducedSettings = settings.reduce<Record<string, string>>((acc, row) => {
    acc[row.kunci] = row.nilai;
    return acc;
  }, {});

  return { ...DEFAULT_SETTINGS, ...reducedSettings };
}


export async function getPublishedProjects(db: D1Database, limit = 6): Promise<Proyek[]> {
  const service = new ProyekService(new D1ProyekRepository(db));
  const result = await service.ambilSemua(1, limit, 1); // status 1 = published
  return result.data;
}

export async function getProjectBySlug(db: D1Database, slug: string): Promise<Proyek | null> {
  const service = new ProyekService(new D1ProyekRepository(db));
  return await service.ambilBerdasarkanSlug(slug);
}

export async function getPengalamanIT(db: D1Database, limit = 6) {
  const service = new PengalamanService(new D1PengalamanRepository(db));
  const results = await service.ambilSemua();
  return results.slice(0, limit);
}

export async function getSertifikat(db: D1Database, limit = 6) {
  const service = new SertifikatService(new D1SertifikatRepository(db));
  const results = await service.ambilSemua();
  return results.slice(0, limit);
}

export async function getKeahlian(db: D1Database, limit = 8) {
  const service = new KeahlianService(new D1KeahlianRepository(db));
  const results = await service.ambilSemua();
  return results.slice(0, limit);
}

// ─── Paginated Variants ──────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getPaginatedPublishedProjects(
  db: D1Database, page = 1, limit = 9
): Promise<PaginatedResult<Proyek>> {
  const service = new ProyekService(new D1ProyekRepository(db));
  const result = await service.ambilSemua(page, limit, 1);
  return {
    data: result.data,
    total: result.meta.total,
    page: result.meta.current_page,
    totalPages: result.meta.last_page,
  };
}

export async function getPaginatedPengalamanIT(
  db: D1Database, page = 1, limit = 10
): Promise<PaginatedResult<any>> {
  const service = new PengalamanService(new D1PengalamanRepository(db));
  const all = await service.ambilSemua();
  const start = (page - 1) * limit;
  const data = all.slice(start, start + limit);
  return {
    data,
    total: all.length,
    page,
    totalPages: Math.ceil(all.length / limit),
  };
}

export async function getPaginatedSertifikat(
  db: D1Database, page = 1, limit = 9
): Promise<PaginatedResult<any>> {
  const service = new SertifikatService(new D1SertifikatRepository(db));
  const all = await service.ambilSemua();
  const start = (page - 1) * limit;
  const data = all.slice(start, start + limit);
  return {
    data,
    total: all.length,
    page,
    totalPages: Math.ceil(all.length / limit),
  };
}

