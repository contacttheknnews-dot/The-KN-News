import { HeroSkeleton, CardGridSkeleton, AdPlaceholderSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return (
    <div className="container-site py-5 space-y-8">
      <AdPlaceholderSkeleton />
      <HeroSkeleton />
      <CardGridSkeleton count={8} />
    </div>
  );
}
