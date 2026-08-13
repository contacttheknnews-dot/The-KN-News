import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { publishedWhere, getRelated } from "@/lib/data";
import {
  formatHindiDate,
  formatHindiTime,
  formatViews,
  truncate,
  normalizeArticleHtml,
} from "@/lib/utils";
import { CategoryBadge } from "@/components/news/NewsCard";
import { NewsCard } from "@/components/news/NewsCard";
import ShareButtons from "@/components/article/ShareButtons";
import EmbedLoader from "@/components/article/EmbedLoader";
import Comments, { type CommentItem } from "@/components/article/Comments";
import Sidebar from "@/components/sidebar/Sidebar";
import AdSlot from "@/components/ads/AdSlot";
import { EyeIcon, ChevronRight } from "@/components/icons";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getArticle(slug: string) {
  return prisma.article.findFirst({
    where: { slug, ...publishedWhere() },
    include: {
      category: true,
      subcategory: true,
      author: true,
      tags: { include: { tag: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "खबर नहीं मिली" };
  const title = article.seoTitle || article.title;
  const description = article.metaDescription || truncate(article.excerpt, 160);
  const url = article.canonicalUrl || `${siteUrl}/news/${article.slug}`;
  const image = article.socialImage || article.image;
  return {
    title,
    description,
    keywords: article.focusKeyword || undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      images: [{ url: image }],
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.author.name],
      section: article.category.name,
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  // fire-and-forget view counter
  prisma.article
    .update({ where: { id: article.id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  const [related, commentRows] = await Promise.all([
    getRelated(article.id, article.categoryId, 6),
    prisma.comment.findMany({
      where: { articleId: article.id, status: "APPROVED", parentId: null },
      include: {
        replies: { where: { status: "APPROVED" }, orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const comments: CommentItem[] = commentRows.map((c) => ({
    id: c.id,
    name: c.name,
    body: c.body,
    likes: c.likes,
    createdAt: c.createdAt.toISOString(),
    replies: c.replies.map((r) => ({
      id: r.id,
      name: r.name,
      body: r.body,
      likes: r.likes,
      createdAt: r.createdAt.toISOString(),
      replies: [],
    })),
  }));

  const url = `${siteUrl}/news/${article.slug}`;
  const newsSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.metaDescription || article.excerpt,
    image: [article.socialImage || article.image],
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    inLanguage: "hi",
    author: {
      "@type": "Person",
      name: article.author.name,
      jobTitle: article.author.designation ?? undefined,
    },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: `${siteUrl}/images/logo.jpg` },
    },
    mainEntityOfPage: url,
    articleSection: article.category.name,
    keywords: article.tags.map((t) => t.tag.name).join(", "),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "होम", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: article.category.name,
        item: `${siteUrl}/category/${article.category.slug}`,
      },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  };

  return (
    <div className="container-site py-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <article className="min-w-0">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="flex items-center flex-wrap gap-1 text-xs text-kn-muted mb-3">
            <Link href="/" className="hover:text-kn-red">होम</Link>
            <ChevronRight width={12} height={12} />
            <Link href={`/category/${article.category.slug}`} className="hover:text-kn-red">
              {article.category.name}
            </Link>
            {article.subcategory && (
              <>
                <ChevronRight width={12} height={12} />
                <Link href={`/category/${article.subcategory.slug}`} className="hover:text-kn-red">
                  {article.subcategory.name}
                </Link>
              </>
            )}
          </nav>

          <CategoryBadge name={article.category.name} slug={article.category.slug} />

          <h1 className="mt-3 text-2xl md:text-[2.1rem] font-extrabold leading-snug text-kn-dark">
            {article.title}
          </h1>
          {article.subheadline && (
            <p className="mt-3 text-base md:text-lg text-neutral-600 leading-relaxed">
              {article.subheadline}
            </p>
          )}

          {/* Byline */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-kn-border py-3 text-sm text-kn-muted">
            <div className="flex items-center gap-2">
              {article.author.photo && (
                <img
                  src={article.author.photo}
                  alt={article.author.name}
                  className="h-9 w-9 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-bold text-kn-dark leading-tight">{article.author.name}</p>
                {article.author.designation && (
                  <p className="text-[11px]">{article.author.designation}</p>
                )}
              </div>
            </div>
            {article.location && <span>📍 {article.location}</span>}
            <span>
              प्रकाशित: {formatHindiDate(article.publishedAt)}, {formatHindiTime(article.publishedAt)}
            </span>
            <span>अपडेटेड: {formatHindiDate(article.updatedAt)}</span>
            <span className="flex items-center gap-1">
              <EyeIcon width={14} height={14} /> {formatViews(article.views + 1)}
            </span>
          </div>

          <div className="mt-4">
            <ShareButtons title={article.title} url={url} />
          </div>

          <AdSlot placement="ARTICLE_TOP" className="mt-5" minHeight={90} />

          {/* Featured image */}
          <figure className="mt-5">
            <img
              src={article.image}
              alt={article.imageCaption || article.title}
              className="w-full h-auto rounded-lg"
            />
            {article.imageCaption && (
              <figcaption className="mt-2 text-sm text-kn-muted">
                {article.imageCaption}
              </figcaption>
            )}
          </figure>

          {/* Body */}
          <div
            className="article-body mt-6"
            dangerouslySetInnerHTML={{ __html: normalizeArticleHtml(article.body) }}
          />
          <EmbedLoader html={article.body} />

          <AdSlot placement="ARTICLE_MID" className="mt-8" minHeight={120} />

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold">टैग्स:</span>
              {article.tags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/search?q=${encodeURIComponent(tag.name)}`}
                  className="rounded-full bg-kn-gray px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-kn-red hover:text-white transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 border-t border-kn-border pt-4">
            <ShareButtons title={article.title} url={url} />
          </div>

          <AdSlot placement="ARTICLE_BOTTOM" className="mt-8" minHeight={90} />

          {/* Related news */}
          {related.length > 0 && (
            <section aria-label="संबंधित खबरें" className="mt-10">
              <h2 className="text-xl font-bold border-b-2 border-kn-red pb-2 mb-5">
                संबंधित खबरें
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((a) => (
                  <NewsCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          )}

          <Comments articleId={article.id} comments={comments} />
        </article>

        <Sidebar />
      </div>
    </div>
  );
}
