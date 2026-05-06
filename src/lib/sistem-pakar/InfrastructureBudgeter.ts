import type { Proyek } from "@/core/models/proyek";

export interface PerformanceBudget {
    estimatedLatency: string; // "Low" | "Medium" | "High"
    efficiencyScore: number;
    warnings: string[];
}

/**
 * EXPERT SYSTEM 10: INFRASTRUCTURE BUDGETER
 * Method: Resource Consumption Modeling for Cloudflare Workers
 */
export class InfrastructureBudgeter {
    analisa(proyek: Proyek): PerformanceBudget {
        let efficiency = 100;
        const warnings: string[] = [];

        // Analysis 1: Content Size (Bandwidth)
        const sizeKB = proyek.konten_html.length / 1024;
        if (sizeKB > 500) {
            efficiency -= 30;
            warnings.push("Konten HTML terlalu besar (>500KB). Risiko latensi tinggi di koneksi lambat.");
        }

        // Analysis 2: External Images (Request Overhead)
        const imgCount = (proyek.konten_html.match(/<img/g) || []).length;
        if (imgCount > 10) {
            efficiency -= 20;
            warnings.push(`Terlalu banyak gambar (${imgCount}). Pertimbangkan menggunakan Lazy Loading.`);
        }

        // Analysis 3: Script Tags (Client-side Load)
        if (proyek.konten_html.includes('<script')) {
            efficiency -= 15;
            warnings.push("Terdapat tag <script> inline. Gunakan Astro Islands untuk performa lebih baik.");
        }

        // Analysis 4: Database Complexity (Binding check)
        if (proyek.tags && proyek.tags.length > 5) {
            // Relational complexity in D1
            efficiency -= 5;
        }

        let latency: PerformanceBudget['estimatedLatency'] = 'Low';
        if (efficiency < 50) latency = 'High';
        else if (efficiency < 80) latency = 'Medium';

        return {
            estimatedLatency: latency,
            efficiencyScore: efficiency,
            warnings
        };
    }
}
