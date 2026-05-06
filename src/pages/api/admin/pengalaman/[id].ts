import type { APIRoute } from 'astro';
import { NotFound, Success, ServerError, ValidationError } from '@/lib/response';
import { D1PengalamanRepository } from '@/core/repositories/D1PengalamanRepository';
import { PengalamanService } from '@/core/services/PengalamanService';

export const prerender = false;

const makeService = (db: D1Database) => new PengalamanService(new D1PengalamanRepository(db));

export const GET: APIRoute = async ({ params, locals }) => {
    const { id } = params;
    if (!id) return ValidationError({ id: ['ID pengalaman wajib dikirim'] });

    try {
        const service = makeService(locals.runtime.env.DB);
        const data = await service.ambilBerdasarkanId(id);
        if (!data) return NotFound('Pengalaman IT tidak ditemukan');
        return Success(data, 'Pengalaman IT berhasil diambil');
    } catch (error) {
        return ServerError();
    }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
    const { id } = params;
    if (!id) return ValidationError({ id: ['ID pengalaman wajib dikirim'] });

    try {
        const body = await request.json() as any;
        const service = makeService(locals.runtime.env.DB);

        if (!body.peran || !body.organisasi || !body.periode || !body.deskripsi) {
            return ValidationError({ general: ['Judul rekam jejak, konteks, periode, dan deskripsi wajib diisi'] });
        }

        const data = await service.perbaruiPengalaman(id, body);
        return Success(data, 'Pengalaman IT berhasil diperbarui');
    } catch (error: any) {
        if (String(error.message).includes('tidak ditemukan')) return NotFound('Pengalaman IT tidak ditemukan');
        return ServerError(error.message);
    }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
    const { id } = params;
    if (!id) return ValidationError({ id: ['ID pengalaman wajib dikirim'] });

    try {
        const service = makeService(locals.runtime.env.DB);
        const success = await service.hapusPengalaman(id);
        if (!success) return NotFound('Pengalaman IT tidak ditemukan');
        return Success(null, 'Pengalaman IT berhasil dihapus');
    } catch (error: any) {
        return ServerError(error.message);
    }
};

