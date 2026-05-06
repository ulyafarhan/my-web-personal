/**
 * Helper untuk melakukan eksekusi fungsi dengan mekanisme Exponential Backoff.
 * Berguna untuk mengatasi error sementara (transient) pada koneksi database atau API.
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 100
): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            
            // Jangan retry jika bukan error jaringan atau D1 timeout
            const isTransient = error.message?.includes('D1_ERROR') || 
                               error.message?.includes('timeout') || 
                               error.message?.includes('network');
            
            if (!isTransient || attempt === maxRetries) {
                break;
            }
            
            const delay = baseDelay * Math.pow(2, attempt);
            console.warn(`[Retry] Percobaan ${attempt + 1} gagal. Menunggu ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError;
}
