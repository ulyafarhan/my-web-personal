import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals, site }) => {
  const db = locals.runtime.env.DB;
  const baseUrl = site ? site.toString() : new URL(request.url).origin;

  const { results: proyek } = await db.prepare(`
    SELECT slug, dipublikasikan_pada, updated_at 
    FROM proyek 
    WHERE status_publikasi = 1 
    ORDER BY created_at DESC
  `).all();

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/proyek</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

  proyek.forEach((p: any) => {
    const lastMod = p.updated_at || p.dipublikasikan_pada || new Date().toISOString();
    sitemap += `
  <url>
    <loc>${baseUrl}/proyek/${p.slug}</loc>
    <lastmod>${new Date(lastMod).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  sitemap += `\n</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
