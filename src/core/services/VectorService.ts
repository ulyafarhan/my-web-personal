import type { Proyek } from '../models/proyek';

export interface VectorMatch {
    id: string;
    score: number;
    metadata?: Record<string, any>;
}

export class VectorService {
    private model = '@cf/baai/bge-m3';

    constructor(
        private ai: any, // Ai binding
        private vectorize: any // Vectorize index binding
    ) {}

    /**
     * Menghasilkan embedding untuk teks tertentu.
     */
    async generateEmbedding(text: string): Promise<number[]> {
        const response = await this.ai.run(this.model, {
            text: [text]
        });
        return response.data[0];
    }

    /**
     * Menyimpan atau memperbarui vektor proyek.
     */
    async upsertProyekVector(proyek: Proyek) {
        const content = `${proyek.judul} ${proyek.ringkasan} ${proyek.konten_html.replace(/<[^>]*>?/gm, '')}`;
        const values = await this.generateEmbedding(content);

        await this.vectorize.upsert([{
            id: proyek.id,
            values: values,
            metadata: {
                judul: proyek.judul,
                slug: proyek.slug
            }
        }]);
    }

    /**
     * Mencari proyek yang relevan berdasarkan query teks.
     */
    async searchRelevantProjects(query: string, limit: number = 3): Promise<VectorMatch[]> {
        const queryVector = await this.generateEmbedding(query);
        const matches = await this.vectorize.query(queryVector, {
            topK: limit,
            returnValues: false,
            returnMetadata: true
        });

        return matches.matches.map((m: any) => ({
            id: m.id,
            score: m.score,
            metadata: m.metadata
        }));
    }

    /**
     * Menghapus vektor proyek.
     */
    async deleteProyekVector(id: string) {
        await this.vectorize.deleteByIds([id]);
    }
}
