import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatHindiDateTime, formatViews } from "@/lib/utils";
import { deleteArticle } from "../actions";
import { DeleteButton } from "../ui";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const user = await requireUser(["EDITOR", "REPORTER", "AUTHOR"]);
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const where = {
    ...(sp.status ? { status: sp.status } : {}),
    ...(sp.q ? { title: { contains: sp.q } } : {}),
  };
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { category: true, author: true },
      orderBy: { updatedAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.article.count({ where }),
  ]);
  const pages = Math.ceil(total / PAGE_SIZE);
  const canDelete = user.role === "SUPER_ADMIN" || user.role === "EDITOR";

  const filters = [
    { label: "All", value: "" },
    { label: "Published", value: "PUBLISHED" },
    { label: "Drafts", value: "DRAFT" },
    { label: "Scheduled", value: "SCHEDULED" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <h1 className="text-2xl font-extrabold">All News ({total})</h1>
        <Link
          href="/admin/articles/new"
          className="rounded-md bg-kn-red px-5 py-2.5 text-sm font-bold text-white hover:bg-kn-red-dark"
        >
          + Add News
        </Link>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/articles?status=${f.value}` : "/admin/articles"}
            className={`rounded-full px-4 py-1.5 text-xs font-bold border ${
              (sp.status || "") === f.value
                ? "bg-kn-dark text-white border-kn-dark"
                : "bg-white border-kn-border hover:border-kn-dark"
            }`}
          >
            {f.label}
          </Link>
        ))}
        <form action="/admin/articles" className="ml-auto">
          <input
            name="q"
            defaultValue={sp.q || ""}
            placeholder="खोजें…"
            className="rounded-md border border-kn-border px-3 py-1.5 text-sm outline-none focus:border-kn-red"
          />
        </form>
      </div>

      <div className="bg-white rounded-lg border border-kn-border overflow-x-auto">
        <table className="w-full text-sm min-w-175">
          <thead>
            <tr className="bg-kn-gray text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">Headline</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kn-border">
            {articles.map((a) => (
              <tr key={a.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="font-semibold hover:text-kn-red line-clamp-2"
                  >
                    {a.title}
                  </Link>
                  <span className="text-[11px] text-kn-muted">/{a.slug}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{a.category.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">{a.author.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      a.status === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : a.status === "SCHEDULED"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3">{formatViews(a.views)}</td>
                <td className="px-4 py-3 text-xs text-kn-muted whitespace-nowrap">
                  {formatHindiDateTime(a.updatedAt)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link
                    href={`/news/${a.slug}`}
                    target="_blank"
                    className="text-xs font-bold text-kn-muted hover:underline mr-3"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="text-xs font-bold text-kn-dark hover:underline mr-3"
                  >
                    Edit
                  </Link>
                  {canDelete && (
                    <DeleteButton onDelete={deleteArticle.bind(null, a.id)} />
                  )}
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-kn-muted">
                  कोई लेख नहीं मिला।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav className="mt-5 flex gap-2">
          {Array.from({ length: pages }).map((_, i) => {
            const n = i + 1;
            const params = new URLSearchParams();
            if (sp.status) params.set("status", sp.status);
            if (sp.q) params.set("q", sp.q);
            params.set("page", String(n));
            return (
              <Link
                key={n}
                href={`/admin/articles?${params.toString()}`}
                className={`h-8 min-w-8 px-2 flex items-center justify-center rounded text-xs font-bold border ${
                  n === page ? "bg-kn-red text-white border-kn-red" : "bg-white border-kn-border"
                }`}
              >
                {n}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
