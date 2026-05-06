import type { Proyek } from "@/core/models/proyek";

export interface EngagementPrediction {
    retentionRate: number; // Percentage
    appealFactor: 'Cold' | 'Warm' | 'Hot';
    optimizations: string[];
}

/**
 * EXPERT SYSTEM 4: ENGAGEMENT OPTIMIZER
 * Method: Simplified Fuzzy Logic for Content Appeal
 */
export class EngagementOptimizer {
    analisa(proyek: Proyek): EngagementPrediction {
        // Input Variables
        const views = proyek.view_count;
        const length = proyek.konten_html.length;
        const hasImages = !!proyek.url_gambar_sampul;
        const hasDemo = !!proyek.url_demo;

        // Fuzzification (Membership Functions)
        const isPopular = views > 500 ? 1 : (views > 100 ? 0.5 : 0.1);
        const isDetailed = length > 2000 ? 1 : (length > 1000 ? 0.6 : 0.2);
        const visualAppeal = hasImages ? 1 : 0.2;
        const interactiveAppeal = hasDemo ? 1 : 0.3;

        // Inference Rules
        // (isPopular AND isDetailed) OR (visualAppeal AND interactiveAppeal)
        const totalAppeal = (isPopular * 0.3) + (isDetailed * 0.2) + (visualAppeal * 0.25) + (interactiveAppeal * 0.25);
        
        const retentionRate = Math.round(totalAppeal * 100);
        
        let appealFactor: 'Cold' | 'Warm' | 'Hot' = 'Cold';
        if (retentionRate >= 75) appealFactor = 'Hot';
        else if (retentionRate >= 40) appealFactor = 'Warm';

        const optimizations: string[] = [];
        if (!hasImages) optimizations.push("Tambahkan visual untuk meningkatkan engagement hingga 25%.");
        if (!hasDemo) optimizations.push("Live demo dapat meningkatkan kepercayaan pengunjung secara signifikan.");
        if (length < 1000) optimizations.push("Konten terlalu singkat; pengunjung cenderung cepat meninggalkan halaman.");

        return {
            retentionRate,
            appealFactor,
            optimizations
        };
    }
}
