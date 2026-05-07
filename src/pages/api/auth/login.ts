import type { APIRoute } from 'astro';
import { getAuth } from '@/lib/auth';
import { ServerError, ValidationError } from '@/lib/response';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json() as any;
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return ValidationError({ general: ['Email dan password wajib diisi dengan format yang benar'] });
    }

    const auth = getAuth(locals.runtime.env.DB, locals.runtime.env);
    
    // Menggunakan endpoint email untuk Better Auth
    const url = new URL('/api/auth/sign-in/email', request.url);
    
    const response = await auth.handler(new Request(url, {
      method: 'POST',
      headers: new Headers(request.headers),
      body: JSON.stringify({ email, password }),
    }));

    return response;
  } catch (error) {
    console.error('[Login API Error]', error);
    return ServerError('Gagal memproses login');
  }
};
