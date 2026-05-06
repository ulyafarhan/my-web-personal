import type { APIRoute } from 'astro';
import { ServerError, Success, ValidationError } from '@/lib/response';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
    try {
        const { results } = await locals.runtime.env.DB.prepare('SELECT kunci, nilai, grup FROM pengaturan_situs ORDER BY grup ASC, kunci ASC').all();
        return Success(results, 'Pengaturan berhasil diambil');
    } catch (err: any) {
        return ServerError(err.message);
    }
};

const saveSettings = async (request: Request, db: D1Database) => {
    const body = await request.json() as any;
    const entries = Array.isArray(body)
        ? body.map((item: any) => [item.kunci, item.nilai, item.grup || 'publik'])
        : Object.entries(body).map(([kunci, nilai]) => [kunci, nilai, 'publik']);

    if (entries.length === 0 || entries.some(([kunci]) => !kunci)) {
        return ValidationError({ general: ['Pengaturan yang dikirim tidak valid'] });
    }

    const stmts = entries.map(([kunci, nilai, grup]) =>
        db.prepare(`
            INSERT INTO pengaturan_situs (kunci, nilai, grup)
            VALUES (?, ?, ?)
            ON CONFLICT(kunci) DO UPDATE SET nilai = excluded.nilai, grup = excluded.grup
        `).bind(String(kunci), String(nilai ?? ''), String(grup || 'publik'))
    );

    await db.batch(stmts);
    return Success(null, 'Pengaturan berhasil disimpan');
};

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        return await saveSettings(request, locals.runtime.env.DB);
    } catch (err: any) {
        return ServerError(err.message);
    }
};

export const PUT = POST;
