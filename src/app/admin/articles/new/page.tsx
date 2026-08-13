import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import ArticleForm from "../ArticleForm";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const user = await requireUser(["EDITOR", "REPORTER", "AUTHOR"]);
  const [categories, authors] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ parentId: "asc" }, { order: "asc" }] }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
  ]);

  const now = new Date();
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-5">Add News</h1>
      <ArticleForm
        canPublish={user.role !== "REPORTER"}
        categories={categories}
        authors={authors}
        article={{
          title: "",
          slug: "",
          subheadline: "",
          excerpt: "",
          body: "",
          image: "",
          imageCaption: "",
          categoryId: "",
          subcategoryId: "",
          authorId: "",
          location: "",
          status: "DRAFT",
          publishDate: now.toISOString().slice(0, 10),
          publishTime: now.toTimeString().slice(0, 5),
          featured: false,
          isOpinion: false,
          tags: "",
          seoTitle: "",
          metaDescription: "",
          focusKeyword: "",
          canonicalUrl: "",
          socialImage: "",
          editorNotes: "",
        }}
      />
    </div>
  );
}
