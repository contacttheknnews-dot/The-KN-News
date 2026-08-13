import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { deleteCategory } from "../actions";
import { DeleteButton } from "../ui";
import CategoryForm from "./CategoryForm";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireUser(["EDITOR"]);
  const sp = await searchParams;
  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { order: "asc" }],
    include: { _count: { select: { articles: true, subArticles: true } }, parent: true },
  });
  const editing = sp.edit ? categories.find((c) => c.id === Number(sp.edit)) : null;
  const parents = categories.filter((c) => !c.parentId);

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-5">Categories</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
        <div className="bg-white rounded-lg border border-kn-border divide-y divide-kn-border">
          {categories.map((c) => (
            <div key={c.id} className="p-3.5 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm">
                  {c.parent && <span className="text-kn-muted">{c.parent.name} → </span>}
                  {c.name}
                  {c.nameEn && <span className="text-kn-muted font-normal"> ({c.nameEn})</span>}
                </p>
                <p className="text-[11px] text-kn-muted">
                  /{c.slug} · {c._count.articles + c._count.subArticles} articles · order {c.order}
                  {!c.showInNav && " · hidden from nav"}
                </p>
              </div>
              <a href={`/admin/categories?edit=${c.id}`} className="text-xs font-bold hover:underline">
                Edit
              </a>
              <DeleteButton
                onDelete={deleteCategory.bind(null, c.id)}
                confirmText="इस category में articles हों तो delete नहीं होगी। जारी रखें?"
              />
            </div>
          ))}
        </div>
        <CategoryForm
          key={editing?.id ?? "new"}
          parents={parents.map((p) => ({ id: p.id, name: p.name }))}
          item={
            editing
              ? {
                  id: editing.id,
                  name: editing.name,
                  nameEn: editing.nameEn ?? "",
                  slug: editing.slug,
                  description: editing.description ?? "",
                  order: editing.order,
                  showInNav: editing.showInNav,
                  parentId: editing.parentId ?? "",
                }
              : null
          }
        />
      </div>
    </div>
  );
}
