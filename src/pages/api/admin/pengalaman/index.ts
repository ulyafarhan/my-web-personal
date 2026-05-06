import type { APIRoute } from 'astro';
import { Success, ServerError, ValidationError } from '@/lib/response';
import { D1PengalamanRepository } from '@/core/repositories/D1PengalamanRepository';
import { PengalamanService } from '@/core/services/PengalamanService';

export const prerender = false;

const makeService = (db: D1Database) => new PengalamanService(new D1PengalamanRepository(db));

export const GET: APIRoute = async ({ locals }) => {
    try {
        const service = makeService(locals.runtime.env.DB);
        const results = await service.ambilSemua();
        return Success(results, 'Daftar pengalaman IT berhasil diambil');
    } catch (error) {
        return ServerError();
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const body = await request.json() as any;
        const service = makeService(locals.runtime.env.DB);
        
        if (!body.peran || !body.organisasi || !body.periode || !body.deskripsi) {
            return ValidationError({ general: ['Judul rekam jejak, konteks, periode, dan deskripsi wajib diisi'] });
        }

        const data = await service.tambahPengalaman(body);
        return Success(data, 'Pengalaman IT berhasil dibuat', 201);
    } catch (error: any) {
        return ServerError(error.message);
    }
};

