import type { APIRoute } from 'astro';
import { Success, ServerError, ValidationError } from '@/lib/response';
import { ulid } from 'ulidx';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const body = await request.json() as any;
        const { filename, content_type } = body;
        if (!filename || !content_type) return ValidationError({ general: ['Data file tidak lengkap'] });
        if (!String(content_type).startsWith('image/')) return ValidationError({ file: ['File harus berupa gambar'] });

        const ext = filename.split('.').pop();
        const key = `uploads/${ulid()}.${ext}`;

        const publicUrl = locals.runtime.env.PUBLIC_R2_URL || `${new URL(request.url).origin}/uploads`;

        return Success({ 
            upload_key: key,
            upload_url: null,
            public_url: `${publicUrl}/${key}`
        }, 'Gunakan /api/admin/assets/upload untuk unggah file melalui server');
    } catch (error) {
      return ServerError();
    }
};
