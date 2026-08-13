import { ArticleSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return (
    <div className="container-site py-5">
      <ArticleSkeleton />
    </div>
  );
}
