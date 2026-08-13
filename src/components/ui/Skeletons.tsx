// Loading skeletons used by route-level loading.tsx files.

export function NewsCardSkeleton() {
  return (
    <div className="border border-kn-border rounded-lg overflow-hidden">
      <div className="skeleton aspect-video rounded-none" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-4 w-16" />
        <div className="skeleton h-5 w-full" />
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-3.5 w-1/2" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 skeleton min-h-72 md:min-h-105" />
      <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton min-h-42" />
        ))}
      </div>
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="space-y-4 max-w-3xl">
      <div className="skeleton h-4 w-40" />
      <div className="skeleton h-9 w-full" />
      <div className="skeleton h-9 w-2/3" />
      <div className="skeleton h-4 w-56" />
      <div className="skeleton aspect-video" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton h-4 w-full" />
      ))}
    </div>
  );
}

export function AdPlaceholderSkeleton() {
  return <div className="skeleton h-24 w-full" />;
}
