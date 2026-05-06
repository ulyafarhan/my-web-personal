import type { Proyek } from "@/core/models/proyek";

export interface ToneAnalysis {
    dominantTone: 'Academic' | 'Professional' | 'Casual' | 'Creative';
    confidence: number;
    suitability: string; // Suitability for the tech industry
}

/**
 * EXPERT SYSTEM 6: TONE & VOICE ANALYZER
 * Method: Lexical Pattern Matching & Sentiment Weighting
 */
export class ToneVoiceAnalyzer {
    private lexicons = {
        Academic: ["analisis", "metodologi", "signifikan", "penelitian", "kerangka kerja", "implementasi"],
        Professional: ["solusi", "efisiensi", "skalabilitas", "bisnis", "manajemen", "performais"],
        Casual: ["asik", "keren", "gampang", "iseng", "penasaran", "banget"],
        Creative: ["imajinasi", "vibrant", "estetika", "ekspresi", "seni", "inspirasi"]
    };

    analisa(proyek: Proyek): ToneAnalysis {
        const text = proyek.konten_html.toLowerCase();
        const scores: Record<string, number> = { Academic: 0, Professional: 0, Casual: 0, Creative: 0 };

        Object.entries(this.lexicons).forEach(([tone, keywords]) => {
            keywords.forEach(kw => {
                const matches = (text.match(new RegExp(kw, 'g')) || []).length;
                scores[tone] += matches;
            });
        });

        const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        const dominantTone = (sorted[0][1] === 0 ? 'Professional' : sorted[0][0]) as ToneAnalysis['dominantTone'];
        
        const total = Object.values(scores).reduce((a, b) => a + b, 0);
        const confidence = total === 0 ? 1 : Number((scores[dominantTone] / total).toFixed(2));

        return {
            dominantTone,
            confidence,
            suitability: this.getSuitability(dominantTone)
        };
    }

    private getSuitability(tone: string): string {
        switch(tone) {
            case 'Professional': return "Sangat cocok untuk target klien korporat dan rekruiter IT.";
            case 'Academic': return "Cocok untuk publikasi riset atau portofolio bidang Data Science.";
            case 'Creative': return "Ideal untuk studio desain atau agensi kreatif.";
            default: return "Nada terlalu santai. Pertimbangkan untuk menggunakan bahasa yang lebih formal untuk profesionalisme.";
        }
    }
}
