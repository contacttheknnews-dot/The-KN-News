"use client";

// Video cards with inline YouTube embed on click (privacy-friendly nocookie).

import { useState } from "react";
import { PlayIcon, CloseIcon } from "@/components/icons";
import { formatHindiDate, formatViews } from "@/lib/utils";

type VideoItem = {
  id: number;
  title: string;
  youtubeId: string;
  thumbnail: string | null;
  duration: string | null;
  category: string | null;
  publishedAt: string;
  views: number;
};

export default function VideoGrid({ videos }: { videos: VideoItem[] }) {
  const [playing, setPlaying] = useState<VideoItem | null>(null);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {videos.map((v) => (
          <button
            key={v.id}
            onClick={() => setPlaying(v)}
            className="group text-left bg-white border border-kn-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
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
              {v.category && (
                <span className="inline-block bg-kn-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm mb-1.5">
                  {v.category}
                </span>
              )}
              <h3 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-kn-red">
                {v.title}
              </h3>
              <p className="mt-1.5 text-[11px] text-kn-muted">
                {formatHindiDate(v.publishedAt)} · {formatViews(v.views)} views
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Player modal */}
      {playing && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setPlaying(null)}
        >
          <div
            className="w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white text-sm font-bold line-clamp-1 pr-4">{playing.title}</h3>
              <button
                onClick={() => setPlaying(null)}
                aria-label="बंद करें"
                className="text-white p-1.5 hover:text-kn-red"
              >
                <CloseIcon width={22} height={22} />
              </button>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${playing.youtubeId}?autoplay=1`}
                title={playing.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
