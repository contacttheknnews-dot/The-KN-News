import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { publishedWhere, cardInclude } from "@/lib/data";
import { NewsCardHorizontal } from "@/components/news/NewsCard";
import Sidebar from "@/components/sidebar/Sidebar";
import AdSlot from "@/components/ads/AdSlot";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ताज़ा खबर — हर पल की अपडेट",
  description:
    "देश, उत्तर प्रदेश, राजनीति, क्रिकेट, बिजनेस और मनोरंजन की ताज़ा खबरें — The KN News पर सबसे पहले।",
};

const PAGE_SIZE = 15;

export default async function LatestPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where = publishedWhere();
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

  return (
    <div className="container-site py-5">
      <div className="section-title">
        <h2>
          <span className="accent" />
          ताज़ा खबर
        </h2>
        <span className="text-xs text-kn-muted">{total} खबरें</span>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          {articles.map((a, i) => (
            <div key={a.id} className="space-y-4">
              <NewsCardHorizontal article={a} />
              {i === 5 && <AdSlot placement="CATEGORY" minHeight={90} />}
            </div>
          ))}
          {pages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="पेज">
              {Array.from({ length: pages }).map((_, i) => {
                const n = i + 1;
                return (
                  <Link
                    key={n}
                    href={`/latest?page=${n}`}
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
        <Sidebar />
      </div>
    </div>
  );
}
