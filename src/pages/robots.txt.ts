import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request, site }) => {
  const baseUrl = site ? site.toString() : new URL(request.url).origin;
  
  const robotsTxt = `
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/admin/

Sitemap: ${baseUrl}/sitemap.xml
`.trim();

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  });
};