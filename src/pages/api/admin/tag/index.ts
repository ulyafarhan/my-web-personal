import type { APIRoute } from 'astro';
import { Success, ServerError, ValidationError } from '@/lib/response';
import { D1TagRepository } from '@/core/repositories/D1TagRepository';
import { TagService } from '@/core/services/TagService';

export const prerender = false;

const makeService = (db: D1Database) => new TagService(new D1TagRepository(db));

export const GET: APIRoute = async ({ locals }) => {
    try {
        const service = makeService(locals.runtime.env.DB);
        const results = await service.ambilSemua();
        return Success(results, 'Daftar tag berhasil diambil');
    } catch (err: any) {
        return ServerError(err.message);
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const body = await request.json() as any;
        const service = makeService(locals.runtime.env.DB);

        if (!body.nama) {
            return ValidationError({ general: ['Nama tag wajib diisi'] });
        }

        const data = await service.tambahTag(body);
        return Success(data, 'Tag berhasil dibuat', 201);
    } catch (err: any) {
        if (String(err.message).includes('UNIQUE')) {
            return ValidationError({ nama: ['Nama atau slug tag sudah digunakan'] });
        }
        return ServerError(err.message);
    }
};

