import { prisma } from "@/lib/db";
import { publishedWhere } from "@/lib/data";
import { SITE } from "@/lib/constants";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const dynamic = "force-dynamic";

// Google News sitemap: only articles from the last 48 hours.
export async function GET() {
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const articles = await prisma.article.findMany({
    where: { ...publishedWhere(), publishedAt: { gte: twoDaysAgo } },
    select: { slug: true, title: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
    take: 1000,
  });

  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articles
  .map(
    (a) => `  <url>
    <loc>${siteUrl}/news/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${escape(SITE.name)}</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${a.publishedAt?.toISOString()}</news:publication_date>
      <news:title>${escape(a.title)}</news:title>
    </news:news>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
