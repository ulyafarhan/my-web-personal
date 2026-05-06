import type { Proyek } from "@/core/models/proyek";

export interface CareerRecommendation {
    role: string;
    score: number;
    description: string;
    missingSkills: string[];
}

/**
 * EXPERT SYSTEM 2: CAREER PATH ADVISOR
 * Method: Weighted Feature Mapping & Heuristic Analysis
 */
export class CareerPathAdvisor {
    private roles = [
        { 
            name: "Full-Stack Architect", 
            keywords: ["database", "auth", "backend", "frontend", "api", "system"],
            minProjects: 5 
        },
        { 
            name: "AI / Machine Learning Engineer", 
            keywords: ["ai", "machine learning", "neural", "data", "extraction", "groq", "llama"],
            minProjects: 2 
        },
        { 
            name: "Creative UI/UX Developer", 
            keywords: ["design", "bento", "animation", "css", "interaction", "ui", "ux"],
            minProjects: 3 
        },
        { 
            name: "DevOps / Infrastructure Engineer", 
            keywords: ["cloudflare", "workers", "d1", "r2", "edge", "deployment", "kv"],
            minProjects: 2 
        }
    ];

    analisa(proyekList: Proyek[]): CareerRecommendation[] {
        const allKeywords = proyekList.flatMap(p => [
            p.judul.toLowerCase(),
            p.ringkasan.toLowerCase(),
            ...(p.tags?.map(t => t.nama.toLowerCase()) || []),
            ...(p.ai_tags?.keywords.map(k => k.toLowerCase()) || [])
        ]);

        const results: CareerRecommendation[] = this.roles.map(role => {
            let matches = 0;
            const foundKeywords: string[] = [];

            role.keywords.forEach(kw => {
                const count = allKeywords.filter(k => k.includes(kw)).length;
                if (count > 0) {
                    matches += count;
                    foundKeywords.push(kw);
                }
            });

            // Scoring Formula: (Keyword Matches * 10) + (Projects * 5)
            let score = (matches * 10) + (proyekList.length * 5);
            
            // Normalize to 0-100
            score = Math.min(100, score);

            const missingSkills = role.keywords.filter(kw => !foundKeywords.includes(kw));

            return {
                role: role.name,
                score,
                description: this.generateDescription(role.name, score),
                missingSkills
            };
        });

        return results.sort((a, b) => b.score - a.score);
    }

    private generateDescription(role: string, score: number): string {
        if (score > 80) return `Anda adalah seorang ${role} yang sangat kompeten. Portfolio Anda menunjukkan penguasaan mendalam.`;
        if (score > 50) return `Anda memiliki potensi besar sebagai ${role}. Perbanyak proyek di bidang ini untuk memperkuat otoritas.`;
        return `Dasar-dasar ${role} sudah terlihat, namun perlu bukti proyek yang lebih spesifik.`;
    }
}
