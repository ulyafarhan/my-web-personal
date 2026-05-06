import type { Proyek } from "@/core/models/proyek";

export interface GlobalReachReport {
    readinessScore: number;
    targetRegions: string[];
    gaps: string[];
}

/**
 * EXPERT SYSTEM 9: GLOBAL REACH EVALUATOR
 * Method: Constraint Satisfaction Analysis for Internationalization (i18n)
 */
export class GlobalReachEvaluator {
    analisa(proyek: Proyek): GlobalReachReport {
        let score = 0;
        const gaps: string[] = [];
        const regions: string[] = ["Lokal (Indonesia)"];

        const content = proyek.konten_html.toLowerCase();

        // Check for English support (Global Standard)
        const englishKeywords = ["the", "is", "project", "build", "using"];
        const englishDensity = englishKeywords.filter(k => content.includes(k)).length / englishKeywords.length;
        
        if (englishDensity > 0.6) {
            score += 50;
            regions.push("Internasional (Global)");
        } else {
            gaps.push("Konten belum tersedia dalam bahasa Inggris.");
        }

        // Check for Timezone/Locale awareness
        if (content.includes('utc') || content.includes('timezone') || content.includes('gmt')) {
            score += 15;
        }

        // Check for Currency/International measurement
        if (content.includes('$') || content.includes('usd') || content.includes('km') || content.includes('miles')) {
            score += 15;
            regions.push("Region Spesifik (AS/Eropa)");
        }

        // Check for Geo Metadata
        if (proyek.meta_geo) {
            score += 20;
        } else {
            gaps.push("Metadata lokasi global (GEO) belum terpasang.");
        }

        return {
            readinessScore: score,
            targetRegions: regions,
            gaps
        };
    }
}
