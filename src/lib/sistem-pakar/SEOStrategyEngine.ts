import type { Proyek } from "@/core/models/proyek";

export interface SEOAnalysisResult {
    score: number; // 0 - 100
    certainty: number; // 0 - 1
    grade: 'A' | 'B' | 'C' | 'D' | 'E';
    findings: string[];
    strategy: string;
}

/**
 * EXPERT SYSTEM 1: SEO STRATEGY ENGINE
 * Method: Certainty Factor (CF) for Semantic SEO Analysis
 */
export class SEOStrategyEngine {
    private calculateCF(mb: number, md: number): number {
        return mb - md;
    }

    analisa(proyek: Proyek): SEOAnalysisResult {
        let mb = 0; // Measure of Belief
        let md = 0; // Measure of Disbelief

        const findings: string[] = [];

        // Rule 1: Title Tag Optimization
        if (proyek.meta_seo?.title && proyek.meta_seo.title.length >= 50 && proyek.meta_seo.title.length <= 60) {
            mb += 0.4;
            findings.push("Panjang judul SEO ideal (50-60 karakter).");
        } else {
            md += 0.2;
            findings.push("Judul SEO tidak optimal secara visual di SERP.");
        }

        // Rule 2: Semantic Density
        const keywordMatches = (proyek.meta_seo?.keywords || []).filter(kw => 
            proyek.konten_html.toLowerCase().includes(kw.toLowerCase())
        );
        const density = keywordMatches.length / (proyek.meta_seo?.keywords?.length || 1);
        if (density > 0.7) {
            mb += 0.5;
            findings.push("Densitas keyword semantik sangat tinggi.");
        } else if (density > 0.3) {
            mb += 0.2;
        } else {
            md += 0.4;
            findings.push("Konten kurang mencerminkan keyword yang ditargetkan.");
        }

        // Rule 3: Heading Structure
        const h1Count = (proyek.konten_html.match(/<h1/g) || []).length;
        const h2Count = (proyek.konten_html.match(/<h2/g) || []).length;
        if (h1Count === 0) {
            md += 0.6;
            findings.push("Kritis: Tidak ditemukan tag H1 di dalam konten.");
        } else if (h1Count > 1) {
            md += 0.3;
            findings.push("Peringatan: Terlalu banyak tag H1 (Hanya boleh 1 per halaman).");
        } else {
            mb += 0.3;
        }

        if (h2Count >= 2) mb += 0.2;

        // Rule 4: Image Alt Optimization
        if (proyek.konten_html.includes('<img') && !proyek.konten_html.includes('alt=')) {
            md += 0.4;
            findings.push("Ditemukan gambar tanpa atribut ALT (Buruk untuk aksesibilitas).");
        } else if (proyek.konten_html.includes('<img')) {
            mb += 0.2;
        }

        // Final Calculation
        const cf = this.calculateCF(Math.min(mb, 1), Math.min(md, 1));
        const finalScore = Math.max(0, Math.min(100, (cf + 1) * 50));

        let grade: 'A' | 'B' | 'C' | 'D' | 'E' = 'C';
        if (finalScore >= 85) grade = 'A';
        else if (finalScore >= 70) grade = 'B';
        else if (finalScore >= 50) grade = 'C';
        else if (finalScore >= 30) grade = 'D';
        else grade = 'E';

        return {
            score: Math.round(finalScore),
            certainty: Number(cf.toFixed(2)),
            grade,
            findings,
            strategy: this.getStrategy(grade)
        };
    }

    private getStrategy(grade: string): string {
        switch(grade) {
            case 'A': return "Konten sudah sangat optimal. Fokus pada backlinking eksternal.";
            case 'B': return "Perbaiki struktur heading dan meta deskripsi sedikit lagi.";
            case 'C': return "Lakukan audit keyword ulang dan pastikan struktur HTML5 benar.";
            case 'D': return "Konten berisiko dianggap spam atau tidak relevan oleh crawler.";
            default: return "Segera rombak konten. Fokus pada pondasi SEO On-Page.";
        }
    }
}
