import type { APIRoute } from 'astro';
import { D1ProyekRepository } from '@/core/repositories/D1ProyekRepository';
import { ProyekService } from '@/core/services/ProyekService';
import { Success, ValidationError, ServerError } from '@/lib/response';
import { ProyekDTO } from '@/core/dto/ProyekDTO';

export const prerender = false;

const makeService = (db: D1Database) => new ProyekService(new D1ProyekRepository(db));

export const GET: APIRoute = async ({ url, locals }) => {
    try {
        const service = makeService(locals.runtime.env.DB);
        const page = Math.max(Number(url.searchParams.get('page') || '1'), 1);
        const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || '20'), 1), 100);
        const statusParam = url.searchParams.get('status');
        const status = statusParam === null || statusParam === '' ? undefined : Number(statusParam);
        
        const result = await service.ambilSemua(page, limit, status);
        return Success(result.data, 'Daftar proyek berhasil diambil', 200, { meta: result.meta });
    } catch (err: any) {
        return ServerError(err.message);
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const service = makeService(locals.runtime.env.DB);
        const { data, errors } = ProyekDTO.fromRequest(await request.json());
        
        if (errors) return ValidationError(errors);
        if (!data) return ServerError('Gagal memproses data');

        const proyek = await service.buatProyek(data);
        return Success(proyek, 'Proyek berhasil dibuat', 201);
    } catch (err: any) {
        const msg = String(err.message);
        if (msg.includes('UNIQUE')) return ValidationError({ slug: ['Slug sudah digunakan'] });
        return ServerError(msg);
    }
};

