import type { Proyek } from "@/core/models/proyek";

export interface RiskAnalysis {
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    score: number;
    threats: string[];
    mitigation: string;
}

/**
 * EXPERT SYSTEM 3: PROJECT RISK ANALYZER
 * Method: Boolean Logic Gates & Impact Assessment Matrix
 */
export class ProjectRiskAnalyzer {
    analisa(proyek: Proyek): RiskAnalysis {
        let riskScore = 0;
        const threats: string[] = [];

        // 1. Dependency Risk (Stale Tech)
        const oldTech = ["jquery", "php5", "bootstrap3", "mysql-native"];
        if (oldTech.some(t => new RegExp(`\\b${t}\\b`, 'i').test(proyek.konten_html))) {
            riskScore += 40;
            threats.push("Penggunaan teknologi usang/deprecated (Technical Debt).");
        }

        // 2. Deployment Risk (Missing URLs)
        if (!proyek.url_demo && proyek.status_publikasi === 1) {
            riskScore += 30;
            threats.push("Proyek publik tanpa live demo (Risiko Kredibilitas).");
        }

        // 3. Maintenance Risk (Poor Documentation)
        if (proyek.konten_html.length < 500) {
            riskScore += 20;
            threats.push("Dokumentasi teknis sangat minim (Maintenance Risk).");
        }

        // 4. Security Risk (Plain Text Indicators)
        const securityFlaws = ["password", "secret", "apikey", "token"];
        if (securityFlaws.some(f => new RegExp(`\\b${f}\\b`, 'i').test(proyek.konten_html))) {
            riskScore += 50;
            threats.push("Potensi kebocoran kredensial dalam dokumentasi kode (Security Risk).");
        }

        // 5. Data Integrity Risk
        if (!proyek.meta_seo || !proyek.meta_geo) {
            riskScore += 10;
            threats.push("Metadata tidak lengkap (Data Integrity Risk).");
        }

        let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
        if (riskScore >= 100) riskLevel = 'Critical';
        else if (riskScore >= 60) riskLevel = 'High';
        else if (riskScore >= 30) riskLevel = 'Medium';

        return {
            riskLevel,
            score: riskScore,
            threats,
            mitigation: this.getMitigation(riskLevel)
        };
    }

    private getMitigation(level: string): string {
        switch(level) {
            case 'Critical': return "Tunda publikasi. Segera lakukan audit kode dan hapus kredensial sensitif.";
            case 'High': return "Lakukan refactoring pada teknologi lama dan lengkapi live demo.";
            case 'Medium': return "Tambahkan dokumentasi teknis dan lengkapi metadata.";
            default: return "Risiko terkendali. Lakukan pemeliharaan rutin.";
        }
    }
}
