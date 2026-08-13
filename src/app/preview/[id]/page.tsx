import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatHindiDate, formatHindiTime, normalizeArticleHtml } from "@/lib/utils";
import { CategoryBadge } from "@/components/news/NewsCard";
import EmbedLoader from "@/components/article/EmbedLoader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Preview — The KN News",
  robots: { index: false, follow: false },
};

// Staff-only article preview: renders drafts/scheduled articles exactly like
// the public /news/[slug] page (minus ads, comments and view counters).
export default async function ArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser(["EDITOR", "REPORTER", "AUTHOR"]);
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id: Number(id) || 0 },
    include: {
      category: true,
      subcategory: true,
      author: true,
      tags: { include: { tag: true } },
    },
  });
  if (!article) notFound();

  const shownDate = article.publishedAt ?? article.updatedAt;

  return (
    <div className="min-h-screen bg-white">
      {/* Preview banner */}
      <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2 bg-kn-dark px-4 py-2 text-sm text-white">
        <span className="font-bold">
          👁 PREVIEW — {article.status === "PUBLISHED" ? "यह लेख live है" : "यह draft है, पाठकों को नहीं दिखता"}
        </span>
        <Link href={`/admin/articles/${article.id}`} className="rounded bg-white/15 px-3 py-1 font-semibold hover:bg-white/25">
          ← Editor पर वापस
        </Link>
      </div>

      <div className="container-site py-5">
        <div className="mx-auto max-w-3xl">
          <article className="min-w-0">
            <CategoryBadge name={article.category.name} slug={article.category.slug} />

            <h1 className="mt-3 text-2xl md:text-[2.1rem] font-extrabold leading-snug text-kn-dark">
              {article.title}
            </h1>
            {article.subheadline && (
              <p className="mt-3 text-base md:text-lg text-neutral-600 leading-relaxed">
                {article.subheadline}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-kn-border py-3 text-sm text-kn-muted">
              <div className="flex items-center gap-2">
                {article.author.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
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
                प्रकाशित: {formatHindiDate(shownDate)}, {formatHindiTime(shownDate)}
              </span>
            </div>

            <figure className="mt-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
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

            <div
              className="article-body mt-6"
              dangerouslySetInnerHTML={{ __html: normalizeArticleHtml(article.body) }}
            />
            <EmbedLoader html={article.body} />

            {article.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold">टैग्स:</span>
                {article.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-kn-gray px-3 py-1 text-xs font-medium text-neutral-700"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
