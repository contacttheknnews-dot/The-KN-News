import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { publishedWhere, cardInclude } from "@/lib/data";
import { NewsCard, NewsCardHorizontal } from "@/components/news/NewsCard";
import Sidebar from "@/components/sidebar/Sidebar";
import AdSlot from "@/components/ads/AdSlot";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: "श्रेणी नहीं मिली" };
  return {
    title: `${category.name} की ताज़ा खबरें`,
    description:
      category.description ||
      `${category.name} से जुड़ी ताज़ा खबरें, ब्रेकिंग न्यूज़ और विश्लेषण — The KN News पर।`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: { orderBy: { order: "asc" } }, parent: true },
  });
  if (!category) notFound();

  const where = {
    ...publishedWhere(),
    OR: [{ categoryId: category.id }, { subcategoryId: category.id }],
  };
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: cardInclude,
      orderBy: { publishedAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.article.count({ where }),
  ]);
  const pages = Math.ceil(total / PAGE_SIZE);
  const [lead, ...rest] = articles;

  return (
    <div className="container-site py-5">
      {/* Category header */}
      <div className="border-b-2 border-kn-red pb-3 mb-5">
        <nav className="text-xs text-kn-muted mb-1">
          <Link href="/" className="hover:text-kn-red">होम</Link>
          {category.parent && (
            <>
              {" / "}
              <Link href={`/category/${category.parent.slug}`} className="hover:text-kn-red">
                {category.parent.name}
              </Link>
            </>
          )}
          {" / "}
          <span>{category.name}</span>
        </nav>
        <h1 className="text-2xl md:text-3xl font-extrabold text-kn-dark">
          {category.name}
          {category.nameEn && (
            <span className="ml-2 text-base font-medium text-kn-muted">
              {category.nameEn}
            </span>
          )}
        </h1>
        {/* Subcategory chips (e.g. UP districts) */}
        {category.children.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {category.children.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="rounded-full border border-kn-border bg-white px-3.5 py-1.5 text-sm font-medium hover:bg-kn-red hover:text-white hover:border-kn-red transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <AdSlot placement="CATEGORY" minHeight={90} className="mb-6" />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {articles.length === 0 ? (
            <p className="text-kn-muted py-10 text-center">
              इस श्रेणी में अभी कोई खबर उपलब्ध नहीं है।
            </p>
          ) : (
            <>
              {page === 1 && lead ? (
                <>
                  <div className="grid gap-5 md:grid-cols-2 mb-6">
                    <NewsCard article={lead} />
                    <div className="flex flex-col gap-4">
                      {rest.slice(0, 3).map((a) => (
                        <NewsCardHorizontal key={a.id} article={a} showExcerpt={false} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {rest.slice(3).map((a) => (
                      <NewsCardHorizontal key={a.id} article={a} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {articles.map((a) => (
                    <NewsCardHorizontal key={a.id} article={a} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-2" aria-label="पेज">
                  {Array.from({ length: pages }).map((_, i) => {
                    const n = i + 1;
                    return (
                      <Link
                        key={n}
                        href={`/category/${slug}?page=${n}`}
                        className={`h-9 min-w-9 px-2 flex items-center justify-center rounded-md text-sm font-bold border ${
                          n === page
                            ? "bg-kn-red text-white border-kn-red"
                            : "bg-white border-kn-border hover:border-kn-red hover:text-kn-red"
                        }`}
                      >
                        {n}
                      </Link>
                    );
                  })}
                </nav>
              )}
            </>
          )}
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
