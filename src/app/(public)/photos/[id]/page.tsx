import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import GalleryViewer from "./GalleryViewer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const gallery = await prisma.gallery.findUnique({ where: { id: Number(id) || 0 } });
  if (!gallery) return { title: "गैलरी नहीं मिली" };
  return { title: `${gallery.title} — फोटो गैलरी`, description: gallery.description || undefined };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gallery = await prisma.gallery.findUnique({
    where: { id: Number(id) || 0 },
    include: { images: { orderBy: { order: "asc" } }, category: true },
  });
  if (!gallery) notFound();

  return (
    <div className="container-site py-6">
      <GalleryViewer
        title={gallery.title}
        description={gallery.description}
        category={gallery.category?.name ?? null}
        publishedAt={gallery.publishedAt.toISOString()}
        images={gallery.images.map((i) => ({
          id: i.id,
          image: i.image,
          caption: i.caption,
        }))}
      />
    </div>
  );
}
