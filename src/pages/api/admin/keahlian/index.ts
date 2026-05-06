import type { APIRoute } from 'astro';
import { Success, ServerError, ValidationError } from '@/lib/response';
import { D1KeahlianRepository } from '@/core/repositories/D1KeahlianRepository';
import { KeahlianService } from '@/core/services/KeahlianService';

export const prerender = false;

const getService = (db: D1Database) => {
    const repo = new D1KeahlianRepository(db);
    return new KeahlianService(repo);
};

export const GET: APIRoute = async ({ locals }) => {
    try {
        const service = getService(locals.runtime.env.DB);
        const results = await service.ambilSemua();
        return Success(results, 'Daftar keahlian berhasil diambil');
    } catch (error: unknown) {
        return ServerError();
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const body = await request.json();
        const service = getService(locals.runtime.env.DB);
        const data = await service.tambahKeahlian(body);
        return Success(data, 'Keahlian berhasil ditambahkan', 201);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
        if (message.includes('wajib diisi') || message.includes('antara 0-100')) {
            return ValidationError({ general: [message] });
        }
        return ServerError(message);
    }
};
