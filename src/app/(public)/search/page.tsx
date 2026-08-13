import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { searchArticles } from "@/lib/data";
import { NewsCardHorizontal } from "@/components/news/NewsCard";
import { SearchIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "खोजें",
  description: "The KN News पर खबरें खोजें — श्रेणी, तारीख, लेखक और स्थान के अनुसार।",
  robots: { index: false },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const page = Math.max(1, Number(sp.page) || 1);
  const sort = sp.sort === "relevant" ? "relevant" : "latest";

  const [categories, authors] = await Promise.all([
    prisma.category.findMany({ where: { parentId: null }, orderBy: { order: "asc" } }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
  ]);

  const hasQuery = Boolean(q || sp.category || sp.author || sp.location || sp.from || sp.to);
  const results = hasQuery
    ? await searchArticles(
        {
          q,
          category: sp.category,
          author: sp.author,
          location: sp.location,
          from: sp.from,
          to: sp.to,
          sort,
          page,
        },
        10
      )
    : null;

  const qs = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    for (const key of ["q", "category", "author", "location", "from", "to", "sort"]) {
      if (sp[key]) params.set(key, sp[key]!);
    }
    for (const [k, v] of Object.entries(overrides)) params.set(k, v);
    return `/search?${params.toString()}`;
  };

  return (
    <div className="container-site py-6 max-w-4xl">
      <h1 className="text-2xl font-extrabold mb-4">खोज</h1>

      {/* Search form */}
      <form action="/search" method="get" className="bg-white border border-kn-border rounded-lg p-4 md:p-5 space-y-4">
        <div className="flex items-center gap-2 rounded-md border-2 border-kn-red px-3 py-2.5">
          <SearchIcon width={18} height={18} className="text-kn-red shrink-0" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="The KN News पर खोजें…"
            className="w-full outline-none text-[15px]"
          />
          <button
            type="submit"
            className="rounded-md bg-kn-red px-5 py-1.5 text-sm font-bold text-white hover:bg-kn-red-dark shrink-0"
          >
            खोजें
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs font-semibold text-kn-muted">
            श्रेणी
            <select
              name="category"
              defaultValue={sp.category || ""}
              className="mt-1 w-full rounded-md border border-kn-border px-2.5 py-2 text-sm font-normal text-kn-dark"
            >
              <option value="">सभी श्रेणियां</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-kn-muted">
            लेखक
            <select
              name="author"
              defaultValue={sp.author || ""}
              className="mt-1 w-full rounded-md border border-kn-border px-2.5 py-2 text-sm font-normal text-kn-dark"
            >
              <option value="">सभी लेखक</option>
              {authors.map((a) => (
                <option key={a.id} value={a.slug}>{a.name}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-kn-muted">
            स्थान
            <input
              type="text"
              name="location"
              defaultValue={sp.location || ""}
              placeholder="जैसे: गाजीपुर"
              className="mt-1 w-full rounded-md border border-kn-border px-2.5 py-2 text-sm font-normal"
            />
          </label>
          <label className="text-xs font-semibold text-kn-muted">
            तारीख (से)
            <input
              type="date"
              name="from"
              defaultValue={sp.from || ""}
              className="mt-1 w-full rounded-md border border-kn-border px-2.5 py-2 text-sm font-normal"
            />
          </label>
          <label className="text-xs font-semibold text-kn-muted">
            तारीख (तक)
            <input
              type="date"
              name="to"
              defaultValue={sp.to || ""}
              className="mt-1 w-full rounded-md border border-kn-border px-2.5 py-2 text-sm font-normal"
            />
          </label>
          <label className="text-xs font-semibold text-kn-muted">
            क्रम
            <select
              name="sort"
              defaultValue={sort}
              className="mt-1 w-full rounded-md border border-kn-border px-2.5 py-2 text-sm font-normal text-kn-dark"
            >
              <option value="latest">Latest — नवीनतम पहले</option>
              <option value="relevant">Relevant — सबसे लोकप्रिय</option>
            </select>
          </label>
        </div>
      </form>

      {/* Results */}
      {results && (
        <div className="mt-6">
          <p className="text-sm text-kn-muted mb-4">
            {results.total} परिणाम मिले {q && <>— “<span className="font-bold text-kn-dark">{q}</span>”</>}
          </p>
          <div className="space-y-4">
            {results.items.map((a) => (
              <NewsCardHorizontal key={a.id} article={a} />
            ))}
          </div>
          {results.total === 0 && (
            <div className="text-center py-12 text-kn-muted">
              <p className="text-lg font-bold text-kn-dark mb-1">कोई परिणाम नहीं मिला</p>
              <p className="text-sm">कृपया दूसरे शब्दों से खोजें या फ़िल्टर बदलें।</p>
            </div>
          )}
          {results.pages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="पेज">
              {Array.from({ length: results.pages }).map((_, i) => {
                const n = i + 1;
                return (
                  <Link
                    key={n}
                    href={qs({ page: String(n) })}
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
        </div>
      )}
    </div>
  );
}
