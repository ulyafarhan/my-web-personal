import type { Proyek } from "@/core/models/proyek";

export interface StackAudit {
    status: 'Consistent' | 'Inconsistent' | 'Fragmented';
    score: number;
    anomalies: string[];
    recommendations: string[];
}

/**
 * EXPERT SYSTEM 5: TECH STACK VALIDATOR
 * Method: Dependency Tree Analysis & Architectural Pattern Matching
 */
export class TechStackValidator {
    private ecosystemPatterns = [
        { name: 'Vue Ecosystem', primary: 'vue', expected: ['pinia', 'vuex', 'vue-router', 'vite'] },
        { name: 'React Ecosystem', primary: 'react', expected: ['redux', 'next', 'tailwind', 'framer-motion'] },
        { name: 'Astro Ecosystem', primary: 'astro', expected: ['tailwind', 'cloudflare', 'd1', 'island'] },
        { name: 'Laravel Ecosystem', primary: 'laravel', expected: ['eloquent', 'blade', 'inertia', 'livewire'] }
    ];

    analisa(proyek: Proyek): StackAudit {
        const content = proyek.konten_html.toLowerCase();
        const anomalies: string[] = [];
        const recommendations: string[] = [];
        let score = 100;

        this.ecosystemPatterns.forEach(pattern => {
            if (content.includes(pattern.primary)) {
                const missing = pattern.expected.filter(req => !content.includes(req));
                if (missing.length > 2) {
                    score -= 20;
                    anomalies.push(`Ekosistem ${pattern.name} tidak lengkap. Hilang: ${missing.join(', ')}.`);
                    recommendations.push(`Pertimbangkan menambah ${missing[0]} untuk standardisasi ${pattern.name}.`);
                }
            }
        });

        // Anti-pattern: Mixing heavy frameworks
        if (content.includes('react') && content.includes('vue') && !content.includes('astro')) {
            score -= 40;
            anomalies.push("Terdeteksi pencampuran React dan Vue tanpa Micro-frontend (Astro). Ini sangat tidak efisien.");
            recommendations.push("Gunakan Astro untuk mengisolasi framework UI yang berbeda.");
        }

        // Database logic check
        if (content.includes('crud') && !content.includes('database') && !content.includes('sql') && !content.includes('nosql')) {
            score -= 15;
            anomalies.push("Proyek CRUD terdeteksi tanpa penjelasan implementasi database.");
        }

        let status: 'Consistent' | 'Inconsistent' | 'Fragmented' = 'Consistent';
        if (score < 50) status = 'Fragmented';
        else if (score < 80) status = 'Inconsistent';

        return {
            status,
            score,
            anomalies,
            recommendations
        };
    }
}
