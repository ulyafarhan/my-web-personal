export interface Tag {
  id: string;
  nama: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface TagPayload {
  nama: string;
  slug?: string;
}
