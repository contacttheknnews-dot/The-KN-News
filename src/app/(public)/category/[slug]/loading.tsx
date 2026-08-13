import { CardGridSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return (
    <div className="container-site py-5 space-y-6">
      <div className="skeleton h-10 w-64" />
      <CardGridSkeleton count={8} />
    </div>
  );
}
