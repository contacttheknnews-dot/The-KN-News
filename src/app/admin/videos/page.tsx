import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatHindiDate } from "@/lib/utils";
import { deleteVideo } from "../actions";
import { DeleteButton } from "../ui";
import VideoForm from "./VideoForm";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireUser(["EDITOR"]);
  const sp = await searchParams;
  const [videos, categories] = await Promise.all([
    prisma.video.findMany({ orderBy: { publishedAt: "desc" }, include: { category: true } }),
    prisma.category.findMany({ where: { parentId: null }, orderBy: { order: "asc" } }),
  ]);
  const editing = sp.edit ? videos.find((v) => v.id === Number(sp.edit)) : null;

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-5">Videos</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
        <div className="bg-white rounded-lg border border-kn-border divide-y divide-kn-border">
          {videos.map((v) => (
            <div key={v.id} className="p-4 flex items-center gap-4">
              <img
                src={v.thumbnail || `https://i.ytimg.com/vi/${v.youtubeId}/default.jpg`}
                alt=""
                className="w-24 h-14 object-cover rounded shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm line-clamp-1">{v.title}</p>
                <p className="text-[11px] text-kn-muted">
                  {v.youtubeId} · {v.category?.name ?? "—"} · {formatHindiDate(v.publishedAt)}
                </p>
              </div>
              <a href={`/admin/videos?edit=${v.id}`} className="text-xs font-bold hover:underline">
                Edit
              </a>
              <DeleteButton onDelete={deleteVideo.bind(null, v.id)} />
            </div>
          ))}
          {videos.length === 0 && (
            <p className="p-8 text-center text-sm text-kn-muted">कोई video नहीं।</p>
          )}
        </div>
        <VideoForm
          key={editing?.id ?? "new"}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          item={
            editing
              ? {
                  id: editing.id,
                  title: editing.title,
                  youtubeId: editing.youtubeId,
                  thumbnail: editing.thumbnail ?? "",
                  duration: editing.duration ?? "",
                  categoryId: editing.categoryId ?? "",
                }
              : null
          }
        />
      </div>
    </div>
  );
}
