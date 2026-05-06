import type { APIRoute } from 'astro';
import { D1ProyekRepository } from '@/core/repositories/D1ProyekRepository';
import { ProyekService } from '@/core/services/ProyekService';
import { NotFound, ServerError, Success, ValidationError } from '@/lib/response';
import { ProyekDTO } from '@/core/dto/ProyekDTO';

export const prerender = false;

const makeService = (db: D1Database) => new ProyekService(new D1ProyekRepository(db));

export const GET: APIRoute = async ({ params, locals }) => {
    const { id } = params;
    if (!id) return ValidationError({ id: ['ID proyek wajib dikirim'] });

    try {
        const service = makeService(locals.runtime.env.DB);
        const proyek = await service.ambilBerdasarkanId(id);
        if (!proyek) return NotFound('Proyek tidak ditemukan');
        return Success(proyek, 'Proyek berhasil diambil');
    } catch (err: any) {
        return ServerError(err.message);
    }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
    const { id } = params;
    if (!id) return ValidationError({ id: ['ID proyek wajib dikirim'] });

    try {
        const service = makeService(locals.runtime.env.DB);
        const deleted = await service.hapusProyek(id);
        if (!deleted) return NotFound('Proyek tidak ditemukan');
        return Success(null, 'Proyek berhasil dihapus');
    } catch (err: any) {
        return ServerError(err.message);
    }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
    const { id } = params;
    if (!id) return ValidationError({ id: ['ID proyek wajib dikirim'] });

    try {
        const service = makeService(locals.runtime.env.DB);
        const { data, errors } = ProyekDTO.fromRequest(await request.json());
        
        if (errors) return ValidationError(errors);
        if (!data) return ServerError('Gagal memproses data');

        const proyek = await service.perbaruiProyek(id, data);
        return Success(proyek, 'Proyek berhasil diperbarui');
    } catch (err: any) {
        const msg = String(err.message);
        if (msg.includes('UNIQUE')) return ValidationError({ slug: ['Slug sudah digunakan'] });
        if (msg.includes('tidak ditemukan')) return NotFound('Proyek tidak ditemukan');
        return ServerError(msg);
    }
};

