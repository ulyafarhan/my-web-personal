import type { AIService, ChatMessage } from './AIService';
import type { VectorService } from './VectorService';
import type { IProyekRepository } from '../repositories/interfaces/IProyekRepository';
import type { PengaturanService } from './PengaturanService';
import { ExpertService } from './ExpertService';

export class ChatbotService {
    private expertService: ExpertService;

    constructor(
        private aiService: AIService,
        private vectorService: VectorService,
        private proyekRepo: IProyekRepository,
        private pengaturanService: PengaturanService
    ) {
        this.expertService = new ExpertService();
    }

    async executeChat(pesan: string, riwayat: ChatMessage[]) {
        // 1. Analisis awal oleh Sistem Pakar (Security & Intent Detection)
        const decision = await this.expertService.analyzeIntent(pesan);

        // Jika terdeteksi Prompt Injection atau Pelanggaran Keamanan
        if (decision.type === 'BLOCKED') {
            return decision.response;
        }

        // Jika sistem pakar bisa menjawab instan
        if (decision.type === 'INSTANT_REPLY') {
            return decision.response;
        }

        // 2. Siapkan konteks (Data Lokal)
        let projects = [];
        try {
            const vectorMatches = await this.vectorService.searchRelevantProjects(pesan, 3);
            const relevantIds = vectorMatches.map(m => m.id);
            
            if (relevantIds.length > 0) {
                projects = await this.proyekRepo.getByIds(relevantIds);
            } else {
                const result = await this.proyekRepo.getAll(1, 3, 1);
                projects = result.data;
            }
        } catch (err) {
            const result = await this.proyekRepo.getAll(1, 3, 1);
            projects = result.data;
        }

        const profil = await this.pengaturanService.getProfilSingkat();

        const context = {
            nama_pemilik: profil.nama_pemilik,
            ringkasan_diri: [profil.profesi, profil.ringkasan_diri].filter(Boolean).join('\n'),
            proyek: projects,
            expert_rules: this.expertService.getExpertRules()
        };

        // 3. Panggil AI dengan Fallback Lokal
        try {
            return await this.aiService.generateChatResponse(pesan, riwayat, context);
        } catch (error) {
            console.warn('[ChatbotService] AI Error/Limit, using smart fallback logic');
            return this.expertService.getFallbackResponse(pesan, context);
        }
    }
}
