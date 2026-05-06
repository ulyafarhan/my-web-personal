export interface AturanPakar {
    id: string;
    kondisi_tag: string[];
    rekomendasi: string[];
    bobot: number;
}

export interface HasilInferensi {
    proyek_id: string;
    skor: number;
}
