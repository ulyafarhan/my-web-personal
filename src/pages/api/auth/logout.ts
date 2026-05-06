import type { APIRoute } from 'astro';
import { getAuth } from '@/lib/auth';
import { ServerError } from '@/lib/response';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const auth = getAuth(locals.runtime.env.DB, locals.runtime.env);
    const url = new URL('/api/auth/sign-out', request.url);
    return auth.handler(new Request(url, {
      method: 'POST',
      headers: new Headers(request.headers),
    }));
  } catch {
    return ServerError('Gagal keluar dari sesi');
  }
};
