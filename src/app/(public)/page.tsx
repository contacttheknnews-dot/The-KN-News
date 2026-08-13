// Homepage — follows the final structure in the brand spec:
// header → ad → nav → breaking (in SiteHeader) → ad → featured → trending →
// latest → ad → category sections interleaved with ads → videos → photos →
// most read → newsletter → ad → footer.

import Link from "next/link";
import { Suspense } from "react";
import {
  HeroSection,
  LatestSection,
  CategorySection,
  CategoryGridSection,
  SectionHeader,
} from "@/components/news/Sections";
import Sidebar, { NewsletterBox } from "@/components/sidebar/Sidebar";
import AdSlot from "@/components/ads/AdSlot";
import { getTrending, getMostRead } from "@/lib/data";
import { prisma } from "@/lib/db";
import { NewsCardCompact } from "@/components/news/NewsCard";
import { PlayIcon, CameraIcon } from "@/components/icons";
import { formatHindiDate, formatViews } from "@/lib/utils";
import { HeroSkeleton, CardGridSkeleton } from "@/components/ui/Skeletons";

export const dynamic = "force-dynamic";

async function TrendingStrip() {
  const trending = await getTrending(4);
  if (!trending.length) return null;
  return (
    <section aria-label="ट्रेंडिंग">
      <div className="bg-white border border-kn-border rounded-lg p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="bg-kn-red text-white text-xs font-extrabold px-2.5 py-1 rounded-sm shrink-0">
            TRENDING
          </span>
          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-4 flex-1">
            {trending.map((a, i) => (
              <Link
                key={a.id}
                href={`/news/${a.slug}`}
                className="text-sm font-semibold hover:text-kn-red line-clamp-1"
              >
                <span className="text-kn-red font-extrabold mr-1.5">{i + 1}.</span>
                {a.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

async function VideoSection() {
  const videos = await prisma.video.findMany({
    orderBy: { publishedAt: "desc" },
    take: 4,
    include: { category: true },
  });
  if (!videos.length) return null;
  return (
    <section aria-label="वीडियो न्यूज़">
      <SectionHeader title="वीडियो न्यूज़" href="/videos" linkLabel="सभी वीडियो →" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {videos.map((v) => (
          <Link
            key={v.id}
            href="/videos"
            className="group bg-white border border-kn-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative aspect-video bg-kn-dark">
              <img
                src={v.thumbnail || `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`}
                alt={v.title}
                loading="lazy"
                className="h-full w-full object-cover opacity-90"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-kn-red/90 text-white group-hover:scale-110 transition-transform">
                  <PlayIcon width={22} height={22} />
                </span>
              </span>
              {v.duration && (
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] px-1.5 py-0.5 rounded">
                  {v.duration}
                </span>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-kn-red">
                {v.title}
              </h3>
              <p className="mt-1.5 text-[11px] text-kn-muted">
                {v.category?.name ? `${v.category.name} · ` : ""}
                {formatHindiDate(v.publishedAt)} · {formatViews(v.views)} views
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

async function GallerySection() {
  const galleries = await prisma.gallery.findMany({
    orderBy: { publishedAt: "desc" },
    take: 4,
    include: { images: { orderBy: { order: "asc" }, take: 1 }, category: true },
  });
  if (!galleries.length) return null;
  return (
    <section aria-label="फोटो गैलरी">
      <SectionHeader title="फोटो गैलरी" href="/photos" linkLabel="सभी गैलरी →" />
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        {galleries.map((g) => (
          <Link
            key={g.id}
            href={`/photos/${g.id}`}
            className="group relative rounded-lg overflow-hidden aspect-[4/3]"
          >
            {g.images[0] && (
              <img
                src={g.images[0].image}
                alt={g.title}
                loading="lazy"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3">
              <p className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                <CameraIcon width={13} height={13} /> {g.images.length}+ फोटो
              </p>
              <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
                {g.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

async function MostReadSection() {
  const mostRead = await getMostRead(6);
  if (!mostRead.length) return null;
  return (
    <section aria-label="सबसे ज्यादा पढ़ी गई खबरें">
      <SectionHeader title="सबसे ज्यादा पढ़ी गई खबरें" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {mostRead.map((a) => (
          <div key={a.id} className="bg-white border border-kn-border rounded-lg p-3">
            <NewsCardCompact article={a} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="container-site py-5 space-y-10">
      {/* Ad: below navigation / breaking news */}
      <AdSlot placement="BELOW_NAV" minHeight={90} />

      {/* Featured news */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      {/* Trending strip */}
      <TrendingStrip />

      {/* Latest + sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10 min-w-0">
          <Suspense fallback={<CardGridSkeleton count={8} />}>
            <LatestSection take={8} />
          </Suspense>

          <AdSlot placement="HOME_MID_1" minHeight={120} />

          <CategorySection title="उत्तर प्रदेश" slug="uttar-pradesh" />
          <CategorySection title="राजनीति" slug="rajniti" />

          <AdSlot placement="HOME_MID_2" minHeight={120} />

          <CategorySection title="The KN Cricket" slug="cricket" href="/cricket" />
          <CategoryGridSection title="खेल" slug="khel" />
        </div>
        <Sidebar />
      </div>

      <AdSlot placement="HOME_MID_3" minHeight={120} />

      {/* Full-width category sections */}
      <CategoryGridSection title="मनोरंजन" slug="manoranjan" />
      <CategoryGridSection title="बिजनेस" slug="business" />
      <CategoryGridSection title="टेक्नोलॉजी" slug="technology" />

      <div className="grid gap-8 md:grid-cols-2">
        <CategorySectionHalf title="शिक्षा" slug="shiksha" />
        <CategorySectionHalf title="नौकरी" slug="naukri" />
      </div>

      <VideoSection />
      <GallerySection />
      <MostReadSection />

      {/* Newsletter */}
      <div className="max-w-2xl mx-auto w-full">
        <NewsletterBox />
      </div>

      <AdSlot placement="BEFORE_FOOTER" minHeight={90} />
    </div>
  );
}

async function CategorySectionHalf({ title, slug }: { title: string; slug: string }) {
  const { getByCategorySlug } = await import("@/lib/data");
  const articles = await getByCategorySlug(slug, 4);
  if (!articles.length) return null;
  return (
    <section aria-label={title}>
      <SectionHeader title={title} href={`/category/${slug}`} linkLabel="और →" />
      <div className="bg-white border border-kn-border rounded-lg divide-y divide-kn-border">
        {articles.map((a) => (
          <div key={a.id} className="p-3">
            <NewsCardCompact article={a} />
          </div>
        ))}
      </div>
    </section>
  );
}
