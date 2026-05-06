import type { APIRoute } from 'astro';
import { Success, ServerError, ValidationError } from '@/lib/response';
import { R2StorageService } from '@/core/services/R2StorageService';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        
        if (!file || !(file instanceof File)) {
            return ValidationError({ file: ['File gambar wajib diunggah'] });
        }

        if (!file.type.startsWith('image/')) {
            return ValidationError({ file: ['File harus berupa gambar'] });
        }

        if (file.size > 4 * 1024 * 1024) {
            return ValidationError({ file: ['Ukuran gambar maksimal 4 MB'] });
        }

        const r2 = locals.runtime.env.R2;
        const publicUrl = locals.runtime.env.PUBLIC_R2_URL || `${new URL(request.url).origin}/uploads`;
        
        const storageService = new R2StorageService(r2, publicUrl);
        const url = await storageService.upload(file, 'portofolio');
        
        return Success({ url }, 'Berhasil mengupload file', 201);
    } catch (error: any) {
        console.error('Upload Error:', error);
        return ServerError(error.message);
    }
};
