import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatHindiDateTime } from "@/lib/utils";
import { moderateComment } from "../actions";
import { ActionButton, DeleteButton } from "../ui";

export const dynamic = "force-dynamic";

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requireUser(["EDITOR", "MODERATOR"]);
  const sp = await searchParams;
  const filter = sp.filter || "PENDING";

  const where =
    filter === "REPORTED"
      ? { reported: true }
      : filter === "ALL"
        ? {}
        : { status: filter };

  const comments = await prisma.comment.findMany({
    where,
    include: { article: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const tabs = ["PENDING", "APPROVED", "REJECTED", "REPORTED", "ALL"];

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-5">Comments Moderation</h1>
      <div className="flex gap-2 flex-wrap mb-4">
        {tabs.map((t) => (
          <Link
            key={t}
            href={`/admin/comments?filter=${t}`}
            className={`rounded-full px-4 py-1.5 text-xs font-bold border ${
              filter === t
                ? "bg-kn-dark text-white border-kn-dark"
                : "bg-white border-kn-border hover:border-kn-dark"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-kn-border divide-y divide-kn-border">
        {comments.map((c) => (
          <div key={c.id} className="p-4">
            <div className="flex items-center gap-2 flex-wrap text-xs text-kn-muted">
              <span className="font-bold text-kn-dark text-sm">{c.name}</span>
              <span>{formatHindiDateTime(c.createdAt)}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  c.status === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : c.status === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {c.status}
              </span>
              {c.reported && (
                <span className="rounded-full bg-kn-red text-white px-2 py-0.5 text-[10px] font-bold">
                  REPORTED
                </span>
              )}
              {c.parentId && <span className="text-[10px]">(reply)</span>}
            </div>
            <p className="mt-1.5 text-sm">{c.body}</p>
            <p className="mt-1 text-[11px] text-kn-muted">
              लेख:{" "}
              <Link href={`/news/${c.article.slug}`} target="_blank" className="underline">
                {c.article.title}
              </Link>
            </p>
            <div className="mt-2 flex items-center gap-4">
              {c.status !== "APPROVED" && (
                <ActionButton
                  label="Approve"
                  onAction={moderateComment.bind(null, c.id, "APPROVE")}
                  className="text-xs font-bold text-green-700 hover:underline"
                />
              )}
              {c.status !== "REJECTED" && (
                <ActionButton
                  label="Reject"
                  onAction={moderateComment.bind(null, c.id, "REJECT")}
                  className="text-xs font-bold text-amber-700 hover:underline"
                />
              )}
              <DeleteButton onDelete={moderateComment.bind(null, c.id, "DELETE")} />
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="p-8 text-center text-sm text-kn-muted">कोई टिप्पणी नहीं।</p>
        )}
      </div>
    </div>
  );
}
