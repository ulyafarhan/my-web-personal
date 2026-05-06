import { SEOStrategyEngine } from './SEOStrategyEngine';
import { CareerPathAdvisor } from './CareerPathAdvisor';
import { ProjectRiskAnalyzer } from './ProjectRiskAnalyzer';
import { EngagementOptimizer } from './EngagementOptimizer';
import { TechStackValidator } from './TechStackValidator';
import { ToneVoiceAnalyzer } from './ToneVoiceAnalyzer';
import { AICapabilityAssessor } from './AICapabilityAssessor';
import { ConversionFunnelEngine } from './ConversionFunnelEngine';
import { GlobalReachEvaluator } from './GlobalReachEvaluator';
import { InfrastructureBudgeter } from './InfrastructureBudgeter';
import type { Proyek } from '@/core/models/proyek';

export class PusatPakarRealtime {
    private seo = new SEOStrategyEngine();
    private career = new CareerPathAdvisor();
    private risk = new ProjectRiskAnalyzer();
    private engagement = new EngagementOptimizer();
    private tech = new TechStackValidator();
    private tone = new ToneVoiceAnalyzer();
    private ai = new AICapabilityAssessor();
    private funnel = new ConversionFunnelEngine();
    private global = new GlobalReachEvaluator();
    private infra = new InfrastructureBudgeter();

    analisaLengkap(proyek: Proyek, semuaProyek: Proyek[] = []) {
        return {
            seo: this.seo.analisa(proyek),
            career: this.career.analisa([proyek, ...semuaProyek]),
            risk: this.risk.analisa(proyek),
            engagement: this.engagement.analisa(proyek),
            tech: this.tech.analisa(proyek),
            tone: this.tone.analisa(proyek),
            ai: this.ai.analisa(proyek),
            funnel: this.funnel.analisa(proyek),
            global: this.global.analisa(proyek),
            infra: this.infra.analisa(proyek),
            timestamp: new Date().toISOString()
        };
    }
}
