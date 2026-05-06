import type { APIRoute } from 'astro';
import { Success, ServerError, ValidationError } from '@/lib/response';
import { D1SertifikatRepository } from '@/core/repositories/D1SertifikatRepository';
import { SertifikatService } from '@/core/services/SertifikatService';

export const prerender = false;

const getService = (db: D1Database) => {
    const repo = new D1SertifikatRepository(db);
    return new SertifikatService(repo);
};

export const GET: APIRoute = async ({ locals }) => {
    try {
        const service = getService(locals.runtime.env.DB);
        const results = await service.ambilSemua();
        return Success(results, 'Daftar sertifikat berhasil diambil');
    } catch (error: unknown) {
        return ServerError();
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const body = await request.json();
        const service = getService(locals.runtime.env.DB);
        const data = await service.tambahSertifikat(body);
        return Success(data, 'Sertifikat berhasil ditambahkan', 201);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
        if (message.includes('wajib diisi')) {
            return ValidationError({ general: [message] });
        }
        return ServerError(message);
    }
};
