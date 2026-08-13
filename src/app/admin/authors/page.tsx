import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { deleteAuthor } from "../actions";
import { DeleteButton } from "../ui";
import AuthorForm from "./AuthorForm";

export const dynamic = "force-dynamic";

export default async function AuthorsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireUser(["EDITOR"]);
  const sp = await searchParams;
  const authors = await prisma.author.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });
  const editing = sp.edit ? authors.find((a) => a.id === Number(sp.edit)) : null;

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-5">Authors</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
        <div className="bg-white rounded-lg border border-kn-border divide-y divide-kn-border">
          {authors.map((a) => (
            <div key={a.id} className="p-4 flex items-center gap-3">
              {a.photo ? (
                <img src={a.photo} alt={a.name} className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-kn-red-light text-kn-red font-bold">
                  {a.name.charAt(0)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm">{a.name}</p>
                <p className="text-[11px] text-kn-muted">
                  {a.designation || "—"} · {a._count.articles} articles
                </p>
              </div>
              <a href={`/admin/authors?edit=${a.id}`} className="text-xs font-bold hover:underline">
                Edit
              </a>
              <DeleteButton onDelete={deleteAuthor.bind(null, a.id)} />
            </div>
          ))}
        </div>
        <AuthorForm
          key={editing?.id ?? "new"}
          item={
            editing
              ? {
                  id: editing.id,
                  name: editing.name,
                  slug: editing.slug,
                  photo: editing.photo ?? "",
                  bio: editing.bio ?? "",
                  designation: editing.designation ?? "",
                  email: editing.email ?? "",
                  facebook: editing.facebook ?? "",
                  twitter: editing.twitter ?? "",
                  instagram: editing.instagram ?? "",
                }
              : null
          }
        />
      </div>
    </div>
  );
}
