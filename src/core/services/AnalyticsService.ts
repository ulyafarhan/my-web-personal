import type { D1Database } from '@cloudflare/workers-types';

export interface DashboardStats {
  projects: {
    total: number;
    views: number;
    published: number;
  };
  experience: {
    total: number;
  };
  certificates: {
    total: number;
  };
  recentProjects: any[];
  tagDistribution: { nama: string; count: number }[];
  recommendation: string | null;
}

export class AnalyticsService {
  constructor(private db: D1Database) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const [
      projectStats,
      expStats,
      certStats,
      recentProjects,
      tagDistribution,
    ] = await Promise.all([
      this.db
        .prepare(
          "SELECT COUNT(*) AS total, COALESCE(SUM(view_count), 0) AS views, SUM(CASE WHEN status_publikasi = 1 THEN 1 ELSE 0 END) AS published FROM proyek",
        )
        .first(),
      this.db.prepare("SELECT COUNT(*) AS total FROM pengalaman").first(),
      this.db.prepare("SELECT COUNT(*) AS total FROM sertifikat").first(),
      this.db
        .prepare(
          "SELECT id, judul, slug, status_publikasi, created_at FROM proyek ORDER BY created_at DESC LIMIT 5",
        )
        .all(),
      this.db
        .prepare(
          `
        SELECT t.nama, COUNT(pt.proyek_id) as count
        FROM tag t
        JOIN proyek_tag pt ON t.id = pt.tag_id
        GROUP BY t.id
      `,
        )
        .all(),
    ]);

    const tagResults = (tagDistribution?.results || []) as any[];
    const recommendation = this.calculateRecommendation(tagResults);

    return {
      projects: {
        total: (projectStats?.total as number) ?? 0,
        views: (projectStats?.views as number) ?? 0,
        published: (projectStats?.published as number) ?? 0,
      },
      experience: {
        total: (expStats?.total as number) ?? 0,
      },
      certificates: {
        total: (certStats?.total as number) ?? 0,
      },
      recentProjects: (recentProjects?.results || []) as any[],
      tagDistribution: tagResults,
      recommendation,
    };
  }

  private calculateRecommendation(tagResults: any[]): string | null {
    const totalLinks = tagResults.length;
    if (totalLinks === 0) return null;

    const frontendTags = ["Vue", "Astro", "Tailwind", "React", "HTML", "CSS", "JavaScript"];
    const backendTags = ["D1", "SQLite", "Docker", "Cloudflare", "Go", "PHP", "Node.js", "PostgreSQL", "MySQL"];

    const feCount = tagResults.filter((t) => frontendTags.includes(t.nama)).length;
    const beCount = tagResults.filter((t) => backendTags.includes(t.nama)).length;

    const fePercentage = (feCount / totalLinks) * 100;
    const bePercentage = (beCount / totalLinks) * 100;

    if (fePercentage > 70 && bePercentage < 15) {
      return "Profil sangat condong ke Frontend. Tambahkan dokumentasi API atau Database untuk mencapai profil Fullstack yang se平衡.";
    } else if (bePercentage > 60) {
      return "Backend Anda sangat kuat. Tunjukkan kemampuan visual dengan menambahkan proyek UI/UX yang memukau di landing page.";
    }
    return null;
  }
}
