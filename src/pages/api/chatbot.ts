import type { APIRoute } from 'astro';
import { Success, ServerError, ValidationError } from '@/lib/response';
import { AIService } from '@/core/services/AIService';
import { D1ProyekRepository } from '@/core/repositories/D1ProyekRepository';
import { VectorService } from '@/core/services/VectorService';
import { D1PengaturanRepository } from '@/core/repositories/D1PengaturanRepository';
import { PengaturanService } from '@/core/services/PengaturanService';
import { ChatbotService } from '@/core/services/ChatbotService';

interface ChatbotRequest {
    pesan?: string;
    riwayat?: any[];
}

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const body = (await request.json()) as ChatbotRequest;
        const { pesan, riwayat } = body;
        
        if (!pesan || !Array.isArray(riwayat)) {
          return ValidationError({ general: ['Pesan dan riwayat wajib diisi'] });
        }

        // Dependency Orchestration (Rule 4: Thin Controller)
        const db = locals.runtime.env.DB;
        const aiKey = locals.runtime.env.GROQ_API_KEY;
        const aiBinding = locals.runtime.env.AI;
        const vectorize = locals.runtime.env.VECTOR_INDEX;

        const proyekRepo = new D1ProyekRepository(db);
        const pengaturanRepo = new D1PengaturanRepository(db);
        const vectorService = new VectorService(aiBinding, vectorize);
        const aiService = new AIService(aiKey);
        const pengaturanService = new PengaturanService(pengaturanRepo);
        
        const chatbotService = new ChatbotService(
            aiService,
            vectorService,
            proyekRepo,
            pengaturanService
        );

        const jawaban = await chatbotService.executeChat(pesan, riwayat);
        
        return Success({ jawaban });
    } catch (error: unknown) {
        console.error('Chatbot Error:', error);
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan internal';
        return ServerError(message);
    }
};
