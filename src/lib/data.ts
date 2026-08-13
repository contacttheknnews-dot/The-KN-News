import "server-only";
import { cache } from "react";
import { prisma } from "./db";
import type { Prisma } from "@prisma/client";

// An article is publicly visible when it is PUBLISHED, or SCHEDULED and its
// publish time has passed (scheduling works without a cron job).
//
// This MUST NOT use a top-level `OR`: several callers spread `...publishedWhere()`
// and then add their own `OR` (e.g. category/subcategory match), which would
// overwrite this key and silently drop the visibility filter — leaking drafts
// and future-scheduled articles onto public pages. Keep it as flat AND-able
// conditions so it composes safely (also uses @@index([status, publishedAt])).
export function publishedWhere(): Prisma.ArticleWhereInput {
  return {
    status: { in: ["PUBLISHED", "SCHEDULED"] },
    publishedAt: { lte: new Date() },
  };
}

export const cardInclude = {
  category: true,
  subcategory: true,
  author: true,
} satisfies Prisma.ArticleInclude;

export type ArticleCard = Prisma.ArticleGetPayload<{ include: typeof cardInclude }>;

export async function getFeatured(take = 5): Promise<ArticleCard[]> {
  return prisma.article.findMany({
    where: { ...publishedWhere(), featured: true },
    include: cardInclude,
    orderBy: { publishedAt: "desc" },
    take,
  });
}

export async function getLatest(take = 8, skip = 0): Promise<ArticleCard[]> {
  return prisma.article.findMany({
    where: publishedWhere(),
    include: cardInclude,
    orderBy: { publishedAt: "desc" },
    take,
    skip,
  });
}

export async function getByCategorySlug(slug: string, take = 5): Promise<ArticleCard[]> {
  return prisma.article.findMany({
    where: {
      ...publishedWhere(),
      OR: [{ category: { slug } }, { subcategory: { slug } }],
    },
    include: cardInclude,
    orderBy: { publishedAt: "desc" },
    take,
  });
}

export async function getTrending(take = 5): Promise<ArticleCard[]> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recent = await prisma.article.findMany({
    where: { ...publishedWhere(), publishedAt: { gte: weekAgo } },
    include: cardInclude,
    orderBy: { views: "desc" },
    take,
  });
  if (recent.length >= take) return recent;
  return getMostRead(take);
}

export async function getMostRead(take = 5): Promise<ArticleCard[]> {
  return prisma.article.findMany({
    where: publishedWhere(),
    include: cardInclude,
    orderBy: { views: "desc" },
    take,
  });
}

export async function getOpinions(take = 6): Promise<ArticleCard[]> {
  return prisma.article.findMany({
    where: { ...publishedWhere(), isOpinion: true },
    include: cardInclude,
    orderBy: { publishedAt: "desc" },
    take,
  });
}

export async function getRelated(articleId: number, categoryId: number, take = 6) {
  const tagLinks = await prisma.articleTag.findMany({
    where: { articleId },
    select: { tagId: true },
  });
  const tagIds = tagLinks.map((t) => t.tagId);
  return prisma.article.findMany({
    where: {
      ...publishedWhere(),
      id: { not: articleId },
      OR: [
        { categoryId },
        { subcategoryId: categoryId },
        ...(tagIds.length ? [{ tags: { some: { tagId: { in: tagIds } } } }] : []),
      ],
    },
    include: cardInclude,
    orderBy: { publishedAt: "desc" },
    take,
  });
}

export async function getBreakingNews() {
  const now = new Date();
  return prisma.breakingNews.findMany({
    where: {
      active: true,
      OR: [{ startAt: null }, { startAt: { lte: now } }],
      AND: [{ OR: [{ endAt: null }, { endAt: { gte: now } }] }],
    },
    orderBy: { order: "asc" },
  });
}

// Direct-sold advertisement for a placement (date-window aware).
export async function getAdFor(placement: string) {
  const now = new Date();
  const ad = await prisma.advertisement.findFirst({
    where: {
      placement,
      active: true,
      OR: [{ startDate: null }, { startDate: { lte: now } }],
      AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
    },
    orderBy: { createdAt: "desc" },
  });
  if (ad) {
    // fire-and-forget impression count
    prisma.advertisement
      .update({ where: { id: ad.id }, data: { impressions: { increment: 1 } } })
      .catch(() => {});
  }
  return ad;
}

// cache() dedupes the query within a single render pass (Header + Footer +
// page all share one Setting fetch per request).
export const getSettings = cache(async (): Promise<Record<string, string>> => {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
});

export async function getNavCategories() {
  return prisma.category.findMany({
    where: { parentId: null, showInNav: true },
    orderBy: { order: "asc" },
    include: { children: { orderBy: { order: "asc" } } },
  });
}

export type SearchParams = {
  q?: string;
  category?: string;
  author?: string;
  location?: string;
  from?: string;
  to?: string;
  sort?: "latest" | "relevant";
  page?: number;
};

// Parse a user-supplied date string; return undefined for missing/invalid input
// so a garbage `from`/`to` query param can never throw inside Prisma.
function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

export async function searchArticles(params: SearchParams, pageSize = 10) {
  const { q, category, author, location, from, to } = params;
  const page = Math.max(1, Number(params.page) || 1);
  const where: Prisma.ArticleWhereInput = { ...publishedWhere() };
  if (q) {
    where.AND = [
      {
        // mode: "insensitive" is required on Postgres — without it `contains`
        // is a case-sensitive LIKE and English queries ("BJP" vs "bjp") miss.
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
          { body: { contains: q, mode: "insensitive" } },
          { location: { contains: q, mode: "insensitive" } },
        ],
      },
    ];
  }
  if (category) where.category = { slug: category };
  if (author) where.author = { slug: author };
  if (location) where.location = { contains: location, mode: "insensitive" };
  const fromDate = parseDate(from);
  const toDate = parseDate(to ? to + "T23:59:59" : undefined);
  if (fromDate || toDate) {
    where.publishedAt = {
      ...(publishedWhere().publishedAt as object),
      ...(fromDate ? { gte: fromDate } : {}),
      ...(toDate ? { lte: toDate } : {}),
    };
  }
  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: cardInclude,
      orderBy:
        params.sort === "relevant" ? { views: "desc" } : { publishedAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.article.count({ where }),
  ]);
  return { items, total, pages: Math.ceil(total / pageSize) };
}
