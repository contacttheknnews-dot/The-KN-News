// Homepage building blocks: section header, hero block, category sections.
import Link from "next/link";
import {
  getByCategorySlug,
  getFeatured,
  getLatest,
  type ArticleCard,
} from "@/lib/data";
import {
  NewsCard,
  NewsCardHero,
  NewsCardOverlay,
  NewsCardHorizontal,
} from "./NewsCard";

export function SectionHeader({
  title,
  href,
  linkLabel = "View All →",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="section-title">
      <h2>
        <span className="accent" />
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-sm font-bold text-kn-red hover:underline whitespace-nowrap"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

// Featured news: one dominant story + 4 secondary overlay cards.
export async function HeroSection() {
  const featured = await getFeatured(5);
  if (!featured.length) return null;
  const [main, ...rest] = featured;

  return (
    <section aria-label="मुख्य समाचार">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NewsCardHero article={main} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
          {rest.slice(0, 4).map((a) => (
            <NewsCardOverlay key={a.id} article={a} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ताज़ा खबर grid
export async function LatestSection({ take = 8 }: { take?: number }) {
  const latest = await getLatest(take);
  if (!latest.length) return null;
  return (
    <section aria-label="ताज़ा खबर">
      <SectionHeader title="ताज़ा खबर" href="/latest" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {latest.map((a) => (
          <NewsCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}

// Standard category section: lead story left, headline list right.
export async function CategorySection({
  title,
  slug,
  href,
}: {
  title: string;
  slug: string;
  href?: string;
}) {
  const articles = await getByCategorySlug(slug, 5);
  if (!articles.length) return null;
  const [lead, ...rest] = articles;

  return (
    <section aria-label={title}>
      <SectionHeader title={title} href={href ?? `/category/${slug}`} linkLabel="और खबरें →" />
      <div className="grid gap-5 md:grid-cols-2">
        <NewsCardTall article={lead} />
        <div className="flex flex-col gap-4">
          {rest.map((a) => (
            <NewsCardHorizontal key={a.id} article={a} showExcerpt={false} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Grid-only category section (used for lighter sections)
export async function CategoryGridSection({
  title,
  slug,
  take = 4,
}: {
  title: string;
  slug: string;
  take?: number;
}) {
  const articles = await getByCategorySlug(slug, take);
  if (!articles.length) return null;
  return (
    <section aria-label={title}>
      <SectionHeader title={title} href={`/category/${slug}`} linkLabel="और खबरें →" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((a) => (
          <NewsCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}

function NewsCardTall({ article }: { article: ArticleCard }) {
  return (
    <article className="group bg-white border border-kn-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/news/${article.slug}`} className="block relative aspect-[16/10] overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <div className="p-4">
        <h3 className="font-bold text-lg md:text-xl leading-snug">
          <Link href={`/news/${article.slug}`} className="hover:text-kn-red transition-colors">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-kn-muted line-clamp-3">{article.excerpt}</p>
      </div>
    </article>
  );
}
