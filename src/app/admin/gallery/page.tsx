import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatHindiDate } from "@/lib/utils";
import { deleteGallery } from "../actions";
import { DeleteButton } from "../ui";
import GalleryForm from "./GalleryForm";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireUser(["EDITOR"]);
  const sp = await searchParams;
  const [galleries, categories] = await Promise.all([
    prisma.gallery.findMany({
      orderBy: { publishedAt: "desc" },
      include: { images: { orderBy: { order: "asc" } }, category: true },
    }),
    prisma.category.findMany({ where: { parentId: null }, orderBy: { order: "asc" } }),
  ]);
  const editing = sp.edit ? galleries.find((g) => g.id === Number(sp.edit)) : null;

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-5">Photo Galleries</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-start">
        <div className="bg-white rounded-lg border border-kn-border divide-y divide-kn-border">
          {galleries.map((g) => (
            <div key={g.id} className="p-4 flex items-center gap-4">
              {g.images[0] && (
                <img src={g.images[0].image} alt="" className="w-20 h-14 object-cover rounded shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm line-clamp-1">{g.title}</p>
                <p className="text-[11px] text-kn-muted">
                  {g.images.length} फोटो · {g.category?.name ?? "—"} · {formatHindiDate(g.publishedAt)}
                </p>
              </div>
              <a href={`/admin/gallery?edit=${g.id}`} className="text-xs font-bold hover:underline">
                Edit
              </a>
              <DeleteButton onDelete={deleteGallery.bind(null, g.id)} />
            </div>
          ))}
          {galleries.length === 0 && (
            <p className="p-8 text-center text-sm text-kn-muted">कोई gallery नहीं।</p>
          )}
        </div>
        <GalleryForm
          key={editing?.id ?? "new"}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          item={
            editing
              ? {
                  id: editing.id,
                  title: editing.title,
                  description: editing.description ?? "",
                  categoryId: editing.categoryId ?? "",
                  images: editing.images
                    .map((i) => `${i.image}${i.caption ? ` | ${i.caption}` : ""}`)
                    .join("\n"),
                }
              : null
          }
        />
      </div>
    </div>
  );
}
