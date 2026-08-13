import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatViews, formatHindiDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireUser();

  const [
    totalArticles,
    published,
    drafts,
    scheduled,
    viewsAgg,
    users,
    pendingComments,
    totalComments,
    subscribers,
    ads,
    recentArticles,
    recentActivity,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: "SCHEDULED" } }),
    prisma.article.aggregate({ _sum: { views: true } }),
    prisma.user.count(),
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.comment.count(),
    prisma.newsletterSubscriber.count({ where: { active: true } }),
    prisma.advertisement.count({ where: { active: true } }),
    prisma.article.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { category: true, author: true },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: true },
    }),
  ]);

  const cards = [
    { label: "Total Articles", value: totalArticles, href: "/admin/articles" },
    { label: "Published", value: published, href: "/admin/articles?status=PUBLISHED" },
    { label: "Drafts", value: drafts, href: "/admin/articles?status=DRAFT" },
    { label: "Scheduled", value: scheduled, href: "/admin/articles?status=SCHEDULED" },
    { label: "Total Views", value: formatViews(viewsAgg._sum.views ?? 0), href: "/admin/articles" },
    { label: "Users", value: users, href: "/admin/users" },
    { label: `Comments${pendingComments ? ` (${pendingComments} pending)` : ""}`, value: totalComments, href: "/admin/comments" },
    { label: "Subscribers", value: subscribers, href: "/admin/newsletter" },
    { label: "Advertisements", value: ads, href: "/admin/ads" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-extrabold">Dashboard</h1>
        <Link
          href="/admin/articles/new"
          className="rounded-md bg-kn-red px-5 py-2.5 text-sm font-bold text-white hover:bg-kn-red-dark"
        >
          + Add News
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-white rounded-lg border border-kn-border p-4 hover:shadow-md transition-shadow"
          >
            <p className="text-2xl font-extrabold text-kn-dark">{c.value}</p>
            <p className="mt-1 text-xs font-semibold text-kn-muted">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg border border-kn-border">
          <h2 className="font-bold px-5 py-3 border-b border-kn-border">हाल के लेख</h2>
          <div className="divide-y divide-kn-border">
            {recentArticles.map((a) => (
              <Link
                key={a.id}
                href={`/admin/articles/${a.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-kn-gray"
              >
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    a.status === "PUBLISHED"
                      ? "bg-green-100 text-green-700"
                      : a.status === "SCHEDULED"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {a.status}
                </span>
                <span className="text-sm font-medium line-clamp-1">{a.title}</span>
                <span className="ml-auto text-[11px] text-kn-muted shrink-0">
                  {a.category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-kn-border">
          <h2 className="font-bold px-5 py-3 border-b border-kn-border">Activity Log</h2>
          <div className="divide-y divide-kn-border">
            {recentActivity.map((log) => (
              <div key={log.id} className="px-5 py-3 text-sm">
                <span className="font-bold">{log.user.name}</span>{" "}
                <span className="text-kn-muted">{log.action.toLowerCase().replace(/_/g, " ")}</span>
                {log.detail && <span className="text-kn-muted"> — {log.detail}</span>}
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {formatHindiDateTime(log.createdAt)}
                </p>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="px-5 py-6 text-sm text-kn-muted">कोई गतिविधि नहीं।</p>
            )}
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-kn-muted">
        Analytics: Google Analytics / Search Console जोड़ने के लिए{" "}
        <Link href="/admin/settings" className="underline">Settings</Link> में
        Measurement ID कॉन्फ़िगर करें।
      </p>
    </div>
  );
}
