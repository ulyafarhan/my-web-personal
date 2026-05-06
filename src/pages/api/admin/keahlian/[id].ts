import type { APIRoute } from 'astro';
import { NotFound, Success, ServerError, ValidationError } from '@/lib/response';
import { D1KeahlianRepository } from '@/core/repositories/D1KeahlianRepository';
import { KeahlianService } from '@/core/services/KeahlianService';

export const prerender = false;

const getService = (db: D1Database) => {
    const repo = new D1KeahlianRepository(db);
    return new KeahlianService(repo);
};

export const GET: APIRoute = async ({ params, locals }) => {
    try {
        const { id } = params;
        if (!id) return ValidationError({ id: ['ID keahlian wajib dikirim'] });

        const service = getService(locals.runtime.env.DB);
        const data = await service.ambilBerdasarkanId(id);
        if (!data) return NotFound('Keahlian tidak ditemukan');
        return Success(data, 'Keahlian berhasil diambil');
    } catch (error: unknown) {
        return ServerError();
    }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
    try {
        const { id } = params;
        const body = await request.json();
        if (!id) return ValidationError({ id: ['ID keahlian wajib dikirim'] });

        const service = getService(locals.runtime.env.DB);
        const data = await service.perbaruiKeahlian(id, body);
        return Success(data, 'Keahlian berhasil diperbarui');
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
        if (message.includes('tidak ditemukan')) return NotFound(message);
        if (message.includes('wajib diisi') || message.includes('antara 0-100')) {
            return ValidationError({ general: [message] });
        }
        return ServerError(message);
    }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
    try {
        const { id } = params;
        if (!id) return ValidationError({ id: ['ID keahlian wajib dikirim'] });

        const service = getService(locals.runtime.env.DB);
        const success = await service.hapusKeahlian(id);
        if (!success) return NotFound('Keahlian tidak ditemukan');
        return Success(null, 'Keahlian berhasil dihapus');
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
        return ServerError(message);
    }
};
