// News card in several layout variants. Server component — safe to use
// anywhere. Dates render on the server so Hindi formatting stays consistent.

import Link from "next/link";
import type { ArticleCard } from "@/lib/data";
import { formatHindiDate, formatHindiTime, formatViews } from "@/lib/utils";
import { EyeIcon, ClockIcon } from "@/components/icons";

export function CategoryBadge({
  name,
  slug,
  className = "",
}: {
  name: string;
  slug: string;
  className?: string;
}) {
  return (
    <Link
      href={`/category/${slug}`}
      className={`inline-block bg-kn-red text-white text-[11px] font-bold px-2 py-0.5 rounded-sm hover:bg-kn-red-dark ${className}`}
    >
      {name}
    </Link>
  );
}

export function CardMeta({
  article,
  showAuthor = false,
  light = false,
}: {
  article: ArticleCard;
  showAuthor?: boolean;
  light?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${
        light ? "text-neutral-300" : "text-kn-muted"
      }`}
    >
      {showAuthor && <span className="font-medium">{article.author.name}</span>}
      <span className="flex items-center gap-1">
        <ClockIcon width={12} height={12} />
        {formatHindiDate(article.publishedAt)}, {formatHindiTime(article.publishedAt)}
      </span>
      <span className="flex items-center gap-1">
        <EyeIcon width={12} height={12} />
        {formatViews(article.views)}
      </span>
    </div>
  );
}

// Default vertical card (grids)
export function NewsCard({ article }: { article: ArticleCard }) {
  return (
    <article className="group bg-white border border-kn-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <Link href={`/news/${article.slug}`} className="block relative aspect-video overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <CategoryBadge name={article.category.name} slug={article.category.slug} />
        </div>
        <h3 className="font-bold text-[17px] leading-snug line-clamp-2">
          <Link href={`/news/${article.slug}`} className="hover:text-kn-red transition-colors">
            {article.title}
          </Link>
        </h3>
        <p className="text-sm text-kn-muted leading-relaxed line-clamp-2">{article.excerpt}</p>
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <CardMeta article={article} />
          <Link
            href={`/news/${article.slug}`}
            className="text-xs font-bold text-kn-red whitespace-nowrap hover:underline"
          >
            पूरा पढ़ें →
          </Link>
        </div>
      </div>
    </article>
  );
}

// Horizontal card (lists, search results)
export function NewsCardHorizontal({
  article,
  showExcerpt = true,
}: {
  article: ArticleCard;
  showExcerpt?: boolean;
}) {
  return (
    <article className="group flex gap-4 bg-white border border-kn-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <Link
        href={`/news/${article.slug}`}
        className="block relative w-32 sm:w-48 shrink-0 overflow-hidden"
      >
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <div className="py-3 pr-4 flex flex-col gap-1.5 min-w-0">
        <div>
          <CategoryBadge name={article.category.name} slug={article.category.slug} />
        </div>
        <h3 className="font-bold text-[15px] sm:text-[17px] leading-snug line-clamp-2">
          <Link href={`/news/${article.slug}`} className="hover:text-kn-red transition-colors">
            {article.title}
          </Link>
        </h3>
        {showExcerpt && (
          <p className="hidden sm:block text-sm text-kn-muted line-clamp-2">{article.excerpt}</p>
        )}
        <div className="mt-auto pt-1">
          <CardMeta article={article} />
        </div>
      </div>
    </article>
  );
}

// Large overlay card (hero main story)
export function NewsCardHero({ article }: { article: ArticleCard }) {
  return (
    <article className="group relative rounded-lg overflow-hidden h-full min-h-72 md:min-h-105">
      <Link href={`/news/${article.slug}`} className="absolute inset-0">
        <img
          src={article.image}
          alt={article.title}
          decoding="async"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
        <CategoryBadge name={article.category.name} slug={article.category.slug} />
        <h2 className="mt-2 text-xl md:text-3xl font-extrabold leading-snug text-white">
          <Link href={`/news/${article.slug}`} className="hover:underline decoration-kn-red decoration-2">
            {article.title}
          </Link>
        </h2>
        <p className="mt-2 hidden md:block text-sm text-neutral-200 line-clamp-2 max-w-2xl">
          {article.excerpt}
        </p>
        <div className="mt-3">
          <CardMeta article={article} showAuthor light />
        </div>
      </div>
    </article>
  );
}

// Smaller overlay card (hero side stories)
export function NewsCardOverlay({ article }: { article: ArticleCard }) {
  return (
    <article className="group relative rounded-lg overflow-hidden min-h-42 h-full">
      <Link href={`/news/${article.slug}`} className="absolute inset-0">
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <CategoryBadge name={article.category.name} slug={article.category.slug} />
        <h3 className="mt-1.5 text-sm md:text-[15px] font-bold leading-snug text-white line-clamp-2">
          <Link href={`/news/${article.slug}`}>{article.title}</Link>
        </h3>
      </div>
    </article>
  );
}

// Compact row (sidebar lists)
export function NewsCardCompact({ article }: { article: ArticleCard }) {
  return (
    <article className="group flex gap-3 items-start">
      <Link href={`/news/${article.slug}`} className="block w-20 h-14 shrink-0 rounded-md overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </Link>
      <div className="min-w-0">
        <h4 className="text-sm font-semibold leading-snug line-clamp-2">
          <Link href={`/news/${article.slug}`} className="hover:text-kn-red transition-colors">
            {article.title}
          </Link>
        </h4>
        <p className="mt-1 text-[11px] text-kn-muted flex items-center gap-1">
          <EyeIcon width={11} height={11} /> {formatViews(article.views)} ·{" "}
          {formatHindiDate(article.publishedAt)}
        </p>
      </div>
    </article>
  );
}
