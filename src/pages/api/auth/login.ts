import type { APIRoute } from 'astro';
import { getAuth } from '@/lib/auth';
import { ServerError, ValidationError } from '@/lib/response';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json() as any;
    const { username, password } = body;

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return ValidationError({ general: ['Username dan password wajib diisi dengan format yang benar'] });
    }

    const auth = getAuth(locals.runtime.env.DB, locals.runtime.env);
    const url = new URL('/api/auth/sign-in/username', request.url);
    return auth.handler(new Request(url, {
      method: 'POST',
      headers: new Headers(request.headers),
      body: JSON.stringify({ username, password }),
    }));
  } catch (error) {
    return ServerError('Gagal memproses login');
  }
};
