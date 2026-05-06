import type { APIRoute } from 'astro';
import { Success, ServerError, ValidationError } from '@/lib/response';
import { D1PengaturanRepository } from '@/core/repositories/D1PengaturanRepository';
import { PengaturanService } from '@/core/services/PengaturanService';

export const prerender = false;

const getService = (db: D1Database) => {
    const repo = new D1PengaturanRepository(db);
    return new PengaturanService(repo);
};

export const GET: APIRoute = async ({ locals }) => {
    try {
        const service = getService(locals.runtime.env.DB);
        const results = await service.ambilSemua();
        return Success(results, 'Pengaturan berhasil diambil');
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan internal';
        return ServerError(message);
    }
};

export const PUT: APIRoute = async ({ request, locals }) => {
    try {
        const body = await request.json();
        const service = getService(locals.runtime.env.DB);
        
        await service.simpanPengaturan(body);
        return Success(null, 'Pengaturan berhasil disimpan');
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan internal';
        if (message.includes('tidak valid')) {
            return ValidationError({ general: [message] });
        }
        return ServerError(message);
    }
};

export const POST = PUT;
