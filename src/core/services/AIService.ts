import type { Proyek } from '../models/proyek';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIService {
  private static circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private static failureCount = 0;
  private static lastFailureTime = 0;
  private static readonly FAILURE_THRESHOLD = 5;
  private static readonly RECOVERY_TIMEOUT = 30000; // 30 detik

  constructor(private apiKey: string) {}

  private onSuccess() {
    AIService.failureCount = 0;
    AIService.circuitState = 'CLOSED';
  }

  private onFailure() {
    AIService.failureCount++;
    AIService.lastFailureTime = Date.now();
    if (AIService.failureCount >= AIService.FAILURE_THRESHOLD) {
      AIService.circuitState = 'OPEN';
    }
  }

  private checkCircuit() {
    if (AIService.circuitState === 'OPEN') {
      const now = Date.now();
      if (now - AIService.lastFailureTime > AIService.RECOVERY_TIMEOUT) {
        AIService.circuitState = 'HALF_OPEN';
        return;
      }
      console.error('[CircuitBreaker] State: OPEN - Terlalu banyak kegagalan API AI.');
    }
  }

  async generateChatResponse(pesan: string, riwayat: ChatMessage[], context: {
    nama_pemilik: string;
    ringkasan_diri: string;
    proyek: Partial<Proyek>[];
    expert_rules?: string;
  }) {
    // 0. Limit Input User (Strategi Pencegahan Over-token)
    const sanitizedPesan = pesan.substring(0, 500);

    try {
      this.checkCircuit();

      const system_prompt = `
Kamu adalah asisten AI pribadi untuk portofolio ${context.nama_pemilik}.

TENTANG PEMILIK:
${context.ringkasan_diri}

PROYEK TERSEDIA (${context.proyek.length} proyek):
${context.proyek.map(p => `- ${p.judul}: ${p.ringkasan} (URL: /proyek/${p.slug})`).join('\n')}

${context.expert_rules || ''}

INSTRUKSI:
- Jawab secara singkat dan padat (maksimal 2-3 paragraf kecil).
- Gunakan data di atas untuk akurasi.
      `.trim();

      // Retry Logic (Optimasi Kecepatan: Max 2 percobaan saja untuk portofolio)
      let attempt = 0;
      const maxAttempts = 2;

      while (attempt < maxAttempts) {
        // Tambahkan AbortController untuk mencegah fetch menggantung terlalu lama
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 detik timeout

        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
            body: JSON.stringify({
              model: 'llama-3.1-8b-instant',
              messages: [
                { role: 'system', content: system_prompt },
                ...riwayat,
                { role: 'user', content: sanitizedPesan },
              ],
              max_tokens: 200,
              temperature: 0.7,
            }),
          });

          clearTimeout(timeoutId);

          if (response.status === 429 && attempt < maxAttempts - 1) {
            const waitTime = 1500; // Cukup tunggu 1.5 detik saja
            await new Promise(resolve => setTimeout(resolve, waitTime));
            attempt++;
            continue;
          }

          if (!response.ok) throw new Error('API Error');

          const data = await response.json() as any;
          this.onSuccess();
          return data.choices[0].message.content;

        } catch (err) {
          clearTimeout(timeoutId);
          attempt++;
          if (attempt >= maxAttempts) throw err;
        }
      }
      
      throw new Error('Limit API tercapai.');
    } catch (error: unknown) {
      this.onFailure();
      
      // Graceful Degradation
      if (AIService.circuitState === 'OPEN' || AIService.circuitState === 'HALF_OPEN') {
        return "Maaf, asisten AI sedang mencapai batas penggunaan harian. Silakan jelajahi portofolio saya secara manual melalui menu Proyek dan Pengalaman.";
      }
      throw error;
    }
  }
}
