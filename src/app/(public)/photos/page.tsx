import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { SectionHeader } from "@/components/news/Sections";
import { CameraIcon } from "@/components/icons";
import { formatHindiDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "फोटो गैलरी",
  description: "The KN News की फोटो गैलरी — खबरों की झलक तस्वीरों में।",
};

export default async function PhotosPage() {
  const galleries = await prisma.gallery.findMany({
    orderBy: { publishedAt: "desc" },
    include: { images: { orderBy: { order: "asc" } }, category: true },
  });

  return (
    <div className="container-site py-6">
      <SectionHeader title="फोटो गैलरी" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="flex items-center gap-1.5 text-xs text-neutral-300 mb-1">
                <CameraIcon width={14} height={14} /> {g.images.length} फोटो
                {g.category && <> · {g.category.name}</>}
                {" · "}
                {formatHindiDate(g.publishedAt)}
              </p>
              <h2 className="text-base font-bold text-white leading-snug">{g.title}</h2>
            </div>
          </Link>
        ))}
      </div>
      {galleries.length === 0 && (
        <p className="text-center text-kn-muted py-12">अभी कोई गैलरी उपलब्ध नहीं है।</p>
      )}
    </div>
  );
}
