import { slugify } from '@/lib/response';
import { PublicationStatus, type ProyekPayload } from '../models/proyek';

export class ProyekDTO {
  static fromRequest(payload: any): { data?: ProyekPayload; errors?: Record<string, string[]> } {
    const judul = String(payload.judul || '').trim();
    const slug = slugify(String(payload.slug || judul));
    const ringkasan = String(payload.ringkasan || '').trim();
    const konten_html = String(payload.konten_html || '').trim();

    if (!judul || !slug || !ringkasan || !konten_html) {
      return {
        errors: {
          judul: !judul ? ['Judul proyek wajib diisi'] : [],
          slug: !slug ? ['Slug proyek wajib diisi'] : [],
          ringkasan: !ringkasan ? ['Ringkasan proyek wajib diisi'] : [],
          konten_html: !konten_html ? ['Konten proyek wajib diisi'] : [],
        },
      };
    }

    return {
      data: {
        judul,
        slug,
        ringkasan,
        konten_html,
        url_gambar_sampul: payload.url_gambar_sampul ? String(payload.url_gambar_sampul) : null,
        url_demo: payload.url_demo ? String(payload.url_demo) : null,
        url_repo: payload.url_repo ? String(payload.url_repo) : null,
        status_publikasi: Number(payload.status_publikasi) === PublicationStatus.PUBLISHED ? PublicationStatus.PUBLISHED : PublicationStatus.DRAFT,
        tag_ids: Array.isArray(payload.tag_ids) ? payload.tag_ids.map(String) : [],
        meta_seo: payload.meta_seo || null,
        meta_geo: payload.meta_geo || null,
        ai_tags: payload.ai_tags || null,
      },
    };
  }
}
