import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { deleteTag } from "../actions";
import { DeleteButton } from "../ui";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  await requireUser(["EDITOR"]);
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-2">Tags</h1>
      <p className="text-sm text-kn-muted mb-5">
        Tags लेख सेव करते समय अपने-आप बनते हैं (News Editor के Tags फ़ील्ड से)।
      </p>
      <div className="bg-white rounded-lg border border-kn-border p-5 flex flex-wrap gap-2.5">
        {tags.map((t) => (
          <span
            key={t.id}
            className="inline-flex items-center gap-2 rounded-full bg-kn-gray px-3.5 py-1.5 text-sm"
          >
            #{t.name}
            <span className="text-[11px] text-kn-muted">({t._count.articles})</span>
            <DeleteButton onDelete={deleteTag.bind(null, t.id)} label="×" />
          </span>
        ))}
        {tags.length === 0 && <p className="text-sm text-kn-muted">कोई tag नहीं।</p>}
      </div>
    </div>
  );
}
