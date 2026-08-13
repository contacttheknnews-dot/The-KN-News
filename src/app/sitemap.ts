import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { publishedWhere } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      where: publishedWhere(),
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 5000,
    }),
    prisma.category.findMany({ select: { slug: true } }),
  ]);

  const staticPages = [
    "",
    "/latest",
    "/cricket",
    "/videos",
    "/photos",
    "/opinion",
    "/search",
    "/about",
    "/contact",
    "/advertise",
    "/privacy-policy",
    "/terms",
    "/disclaimer",
    "/editorial-policy",
    "/correction-policy",
    "/cookie-policy",
    "/sitemap-page",
  ].map((p) => ({
    url: `${siteUrl}${p}`,
    changeFrequency: (p === "" || p === "/latest" ? "hourly" : "weekly") as
      | "hourly"
      | "weekly",
    priority: p === "" ? 1 : 0.6,
  }));

  return [
    ...staticPages,
    ...categories.map((c) => ({
      url: `${siteUrl}/category/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...articles.map((a) => ({
      url: `${siteUrl}/news/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
