export interface ProyekMetaSEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface ProyekMetaGEO {
  lat?: number;
  lng?: number;
  region?: string;
}

export interface ProyekAITags {
  keywords: string[];
  embedding_ref?: string;
}

export interface Tag {
  id: string;
  nama: string;
  slug: string;
  created_at: string;
}

export enum PublicationStatus {
  DRAFT = 0,
  PUBLISHED = 1,
  ARCHIVED = 2
}

export interface Proyek {
  id: string;
  judul: string;
  slug: string;
  ringkasan: string;
  konten_html: string;
  url_gambar_sampul?: string | null;
  url_demo?: string | null;
  url_repo?: string | null;
  meta_seo?: ProyekMetaSEO | null;
  meta_geo?: ProyekMetaGEO | null;
  ai_tags?: ProyekAITags | null;
  view_count: number;
  status_publikasi: PublicationStatus;
  dipublikasikan_pada?: string | null;
  tags?: Tag[];
  cache_analisis?: unknown | null;
  created_at: string;
  updated_at: string;
}

export interface ProyekPayload {
  judul: string;
  slug: string;
  ringkasan: string;
  konten_html: string;
  url_gambar_sampul?: string | null;
  url_demo?: string | null;
  url_repo?: string | null;
  status_publikasi: PublicationStatus;
  tag_ids?: string[];
  meta_seo?: ProyekMetaSEO;
  meta_geo?: ProyekMetaGEO;
  ai_tags?: ProyekAITags;
}
