import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { NAV_ITEMS, MORE_ITEMS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Sitemap" };

export default async function SitemapPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });

  return (
    <div className="container-site py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold border-b-2 border-kn-red pb-3">
        Sitemap
      </h1>
      <div className="mt-6 grid gap-8 md:grid-cols-3">
        <div>
          <h2 className="font-bold text-lg mb-3">मुख्य पेज</h2>
          <ul className="space-y-2 text-sm">
            {[...NAV_ITEMS, ...MORE_ITEMS].map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="text-kn-muted hover:text-kn-red">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h2 className="font-bold text-lg mb-3">श्रेणियां एवं उप-श्रेणियां</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {categories.map((c) => (
              <div key={c.id}>
                <Link
                  href={`/category/${c.slug}`}
                  className="font-bold hover:text-kn-red"
                >
                  {c.name}
                </Link>
                {c.children.length > 0 && (
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {c.children.map((ch) => (
                      <li key={ch.id}>
                        <Link
                          href={`/category/${ch.slug}`}
                          className="text-kn-muted hover:text-kn-red"
                        >
                          — {ch.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-kn-muted">
            XML sitemap: <Link href="/sitemap.xml" className="underline">/sitemap.xml</Link>{" "}
            · News sitemap: <Link href="/news-sitemap.xml" className="underline">/news-sitemap.xml</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
