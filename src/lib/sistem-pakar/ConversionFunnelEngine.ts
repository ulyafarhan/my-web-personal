import type { Proyek } from "@/core/models/proyek";

export interface FunnelAnalysis {
    conversionProbability: number; // 0 - 100
    bottleneck: string;
    actionableTips: string[];
}

/**
 * EXPERT SYSTEM 8: CONVERSION FUNNEL ENGINE
 * Method: Probability Thresholding & Friction Analysis
 */
export class ConversionFunnelEngine {
    analisa(proyek: Proyek): FunnelAnalysis {
        let prob = 20; // Base probability (Visitor just looking)
        let bottleneck = "Low Initial Interest";
        const tips: string[] = [];

        // Stage 1: Trust (Demo/Repo)
        if (proyek.url_demo && proyek.url_repo) {
            prob += 40;
            tips.push("Transparansi kode dan demo live sangat meningkatkan kepercayaan.");
        } else if (proyek.url_demo || proyek.url_repo) {
            prob += 20;
            tips.push("Lengkapi baik demo maupun repo untuk trust maksimal.");
        }

        // Stage 2: Clarity (Summary)
        if (proyek.ringkasan.length > 50 && proyek.ringkasan.length < 200) {
            prob += 15;
        } else {
            prob -= 10;
            tips.push("Ringkasan terlalu panjang atau terlalu pendek menghambat pemahaman cepat.");
        }

        // Stage 3: Engagement (Views)
        if (proyek.view_count > 1000) {
            prob += 15;
            bottleneck = "None (High Funnel Efficiency)";
        } else if (proyek.view_count > 100) {
            prob += 5;
            bottleneck = "Mid-Funnel Friction";
        }

        // Stage 4: Call to Action (Implicit)
        if (proyek.konten_html.includes('hubungi') || proyek.konten_html.includes('contact')) {
            prob += 10;
        } else {
            tips.push("Tambahkan ajakan bertindak (CTA) di akhir konten.");
        }

        return {
            conversionProbability: Math.min(95, Math.max(5, prob)),
            bottleneck,
            actionableTips: tips
        };
    }
}
