import type { Proyek } from "@/core/models/proyek";

export interface AIOpportunity {
    feature: string;
    impact: 'Low' | 'Medium' | 'High';
    description: string;
}

/**
 * EXPERT SYSTEM 7: AI CAPABILITY ASSESSOR
 * Method: Contextual Heuristics & Feature Gap Analysis
 */
export class AICapabilityAssessor {
    analisa(proyek: Proyek): AIOpportunity[] {
        const opportunities: AIOpportunity[] = [];
        const content = proyek.konten_html.toLowerCase();

        // Rule 1: Text heavy projects -> Summary AI
        if (proyek.konten_html.length > 3000) {
            opportunities.push({
                feature: "AI Summary Assistant",
                impact: "High",
                description: "Konten sangat panjang. Gunakan AI untuk merangkum poin utama bagi pengunjung yang sibuk."
            });
        }

        // Rule 2: Searchable content -> Semantic Search
        if (content.includes('filter') || content.includes('search') || content.includes('cari')) {
            opportunities.push({
                feature: "Semantic Search with Vector Embeddings",
                impact: "High",
                description: "Gunakan Cloudflare Vectorize untuk pencarian berbasis makna, bukan sekadar keyword."
            });
        }

        // Rule 3: Image projects -> Alt Generation
        if (content.includes('<img')) {
            opportunities.push({
                feature: "Auto-Alt Text Generation",
                impact: "Medium",
                description: "Integrasikan Vision AI untuk mendeskripsikan gambar proyek secara otomatis."
            });
        }

        // Rule 4: International keywords -> Translation
        if (content.includes('global') || content.includes('world') || content.includes('negara')) {
            opportunities.push({
                feature: "On-the-fly Translation",
                impact: "Medium",
                description: "Gunakan AI Translation untuk melokalisasi konten bagi audiens global."
            });
        }

        // Rule 5: Code repo -> AI Code Explainer
        if (proyek.url_repo) {
            opportunities.push({
                feature: "Interactive Code Explainer",
                impact: "High",
                description: "Hubungkan repo dengan LLM untuk menjelaskan potongan kode paling kompleks dalam proyek ini."
            });
        }

        return opportunities;
    }
}
