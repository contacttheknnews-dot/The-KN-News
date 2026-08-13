import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { SectionHeader } from "@/components/news/Sections";
import VideoGrid from "./VideoGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "वीडियो न्यूज़",
  description: "The KN News के ताज़ा वीडियो — समाचार, विश्लेषण, ग्राउंड रिपोर्ट और इंटरव्यू।",
};

export default async function VideosPage() {
  const videos = await prisma.video.findMany({
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="container-site py-6">
      <SectionHeader title="वीडियो न्यूज़" />
      <VideoGrid
        videos={videos.map((v) => ({
          id: v.id,
          title: v.title,
          youtubeId: v.youtubeId,
          thumbnail: v.thumbnail,
          duration: v.duration,
          category: v.category?.name ?? null,
          publishedAt: v.publishedAt.toISOString(),
          views: v.views,
        }))}
      />
      {videos.length === 0 && (
        <p className="text-center text-kn-muted py-12">अभी कोई वीडियो उपलब्ध नहीं है।</p>
      )}
    </div>
  );
}
