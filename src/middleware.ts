import { defineMiddleware } from 'astro:middleware';
import { Forbidden, Unauthorized } from './lib/response';
import { getAuth, isAdminEmail } from './lib/auth';

export const onRequest = defineMiddleware(async ({ locals, request, redirect }, next) => {
    const url = new URL(request.url);
    const isApi = url.pathname.startsWith('/api/admin');
    const isAdminPage = url.pathname.startsWith('/admin');

    if (isAdminPage || isApi) {
        if (!locals.runtime?.env?.DB) return next();
        
        const auth = getAuth(locals.runtime.env.DB, locals.runtime.env);
        const session = await auth.api.getSession({
            headers: new Headers(request.headers)
        });

        if (!session) {
            return isApi ? Unauthorized() : redirect('/masuk');
        }

        if (!isAdminEmail(session.user.email, locals.runtime.env)) {
            return isApi ? Forbidden() : redirect('/masuk?error=akses-admin');
        }

        (locals as any).user = session.user;
        (locals as any).session = session.session;
    }

    const response = await next();

    // Implementasi Multi-tier Edge Caching (SWR) untuk rute publik
    // s-maxage=3600 (1 jam di CDN), stale-while-revalidate=86400 (24 jam di latar belakang)
    const isPublicPage = !isAdminPage && 
                         !isApi && 
                         !url.pathname.startsWith('/api/auth') && 
                         !url.pathname.startsWith('/masuk') &&
                         !url.pathname.startsWith('/api/debug');
    
    if (isPublicPage && response.status === 200) {
        response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    }

    // Security Headers (Rule: Secure by Default)
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
});
