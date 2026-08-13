import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { istDateInputValue, istTimeInputValue } from "@/lib/utils";
import ArticleForm from "../ArticleForm";
import RevisionHistory, { type RevisionItem } from "../RevisionHistory";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(["EDITOR", "REPORTER", "AUTHOR"]);
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id: Number(id) || 0 },
    include: { tags: { include: { tag: true } } },
  });
  if (!article) notFound();

  const [categories, authors] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ parentId: "asc" }, { order: "asc" }] }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
  ]);

  // revision history (tolerates the table not existing before migration)
  let revisions: RevisionItem[] = [];
  try {
    const rows = await prisma.articleRevision.findMany({
      where: { articleId: article.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, savedBy: true, createdAt: true },
    });
    revisions = rows.map((r) => ({
      id: r.id,
      title: r.title,
      savedBy: r.savedBy,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch {
    // ArticleRevision table not migrated yet
  }

  const publishedAt = article.publishedAt ?? new Date();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Edit News</h1>
      <ArticleForm
        canPublish={user.role !== "REPORTER"}
        categories={categories}
        authors={authors}
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          subheadline: article.subheadline ?? "",
          excerpt: article.excerpt,
          body: article.body,
          image: article.image,
          imageCaption: article.imageCaption ?? "",
          categoryId: article.categoryId,
          subcategoryId: article.subcategoryId ?? "",
          authorId: article.authorId,
          location: article.location ?? "",
          status: article.status,
          publishDate: istDateInputValue(publishedAt),
          publishTime: istTimeInputValue(publishedAt),
          featured: article.featured,
          isOpinion: article.isOpinion,
          tags: article.tags.map((t) => t.tag.name).join(", "),
          seoTitle: article.seoTitle ?? "",
          metaDescription: article.metaDescription ?? "",
          focusKeyword: article.focusKeyword ?? "",
          canonicalUrl: article.canonicalUrl ?? "",
          socialImage: article.socialImage ?? "",
          editorNotes: article.editorNotes ?? "",
          createdAt: article.createdAt.toISOString(),
          updatedAt: article.updatedAt.toISOString(),
        }}
      />
      <RevisionHistory articleId={article.id} revisions={revisions} />
    </div>
  );
}
