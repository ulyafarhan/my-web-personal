import type { APIRoute } from 'astro';
import { NotFound, ServerError, Success, ValidationError, slugify } from '@/lib/response';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
    const db = locals.runtime.env.DB;
    const { id } = params;

    if (!id) return ValidationError({ id: ['ID tag wajib dikirim'] });

    try {
        const tag = await db.prepare('SELECT * FROM tag WHERE id = ?').bind(id).first();
        if (!tag) return NotFound('Tag tidak ditemukan');
        return Success(tag, 'Tag berhasil diambil');
    } catch (err: any) {
        return ServerError(err.message);
    }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
    try {
        const db = locals.runtime.env.DB;
        const { id } = params;
        const body = await request.json() as any;
        const nama = String(body.nama || '').trim();
        const slug = slugify(String(body.slug || nama));

        if (!id) return ValidationError({ id: ['ID tag wajib dikirim'] });
        if (!nama || !slug) return ValidationError({ general: ['Nama tag wajib diisi'] });

        const result = await db.prepare('UPDATE tag SET nama = ?, slug = ? WHERE id = ?')
            .bind(nama, slug, id)
            .run();
        if ((result.meta?.changes ?? 0) === 0) return NotFound('Tag tidak ditemukan');

        const data = await db.prepare('SELECT * FROM tag WHERE id = ?').bind(id).first();
        return Success(data, 'Tag berhasil diperbarui');
    } catch (err: any) {
        if (String(err.message).includes('UNIQUE')) {
            return ValidationError({ nama: ['Nama atau slug tag sudah digunakan'] });
        }
        return ServerError(err.message);
    }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
    const db = locals.runtime.env.DB;
    const { id } = params;

    if (!id) return ValidationError({ id: ['ID tag wajib dikirim'] });

    try {
        const result = await db.prepare('DELETE FROM tag WHERE id = ?').bind(id).run();
        if ((result.meta?.changes ?? 0) === 0) return NotFound('Tag tidak ditemukan');
        return Success(null, 'Tag berhasil dihapus');
    } catch (err: any) {
        return ServerError(err.message);
    }
};
