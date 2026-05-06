import type { APIRoute } from 'astro';
import { NotFound, Success, ServerError, ValidationError } from '@/lib/response';
import { D1SertifikatRepository } from '@/core/repositories/D1SertifikatRepository';
import { SertifikatService } from '@/core/services/SertifikatService';

export const prerender = false;

const getService = (db: D1Database) => {
    const repo = new D1SertifikatRepository(db);
    return new SertifikatService(repo);
};

export const GET: APIRoute = async ({ params, locals }) => {
    try {
        const { id } = params;
        if (!id) return ValidationError({ id: ['ID sertifikat wajib dikirim'] });

        const service = getService(locals.runtime.env.DB);
        const data = await service.ambilBerdasarkanId(id);
        if (!data) return NotFound('Sertifikat tidak ditemukan');
        return Success(data, 'Sertifikat berhasil diambil');
    } catch (error: unknown) {
        return ServerError();
    }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
    try {
        const { id } = params;
        const body = await request.json();
        if (!id) return ValidationError({ id: ['ID sertifikat wajib dikirim'] });

        const service = getService(locals.runtime.env.DB);
        const data = await service.perbaruiSertifikat(id, body);
        return Success(data, 'Sertifikat berhasil diperbarui');
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
        if (message.includes('tidak ditemukan')) return NotFound(message);
        return ServerError(message);
    }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
    try {
        const { id } = params;
        if (!id) return ValidationError({ id: ['ID sertifikat wajib dikirim'] });

        const service = getService(locals.runtime.env.DB);
        const success = await service.hapusSertifikat(id);
        if (!success) return NotFound('Sertifikat tidak ditemukan');
        return Success(null, 'Sertifikat berhasil dihapus');
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
        return ServerError(message);
    }
};
