"use client";

// Thumbnail grid + fullscreen viewer with next/previous, captions and share.

import { useCallback, useEffect, useState } from "react";
import { CloseIcon, ChevronRight, WhatsAppIcon, FacebookIcon, XIcon } from "@/components/icons";
import { formatHindiDate } from "@/lib/utils";

type Img = { id: number; image: string; caption: string | null };

export default function GalleryViewer({
  title,
  description,
  category,
  publishedAt,
  images,
}: {
  title: string;
  description: string | null;
  category: string | null;
  publishedAt: string;
  images: Img[];
}) {
  const [index, setIndex] = useState<number | null>(null);

  const next = useCallback(
    () => setIndex((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length]
  );
  const prev = useCallback(
    () => setIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, next, prev]);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div>
      <div className="border-b-2 border-kn-red pb-3 mb-5">
        {category && (
          <span className="inline-block bg-kn-red text-white text-[11px] font-bold px-2 py-0.5 rounded-sm mb-2">
            {category}
          </span>
        )}
        <h1 className="text-2xl md:text-3xl font-extrabold">{title}</h1>
        {description && <p className="mt-2 text-kn-muted">{description}</p>}
        <p className="mt-1 text-xs text-kn-muted">
          {formatHindiDate(publishedAt)} · {images.length} फोटो
        </p>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setIndex(i)}
            className="group relative rounded-md overflow-hidden aspect-[4/3]"
            aria-label={img.caption || `फोटो ${i + 1}`}
          >
            <img
              src={img.image}
              alt={img.caption || title}
              loading="lazy"
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </button>
        ))}
      </div>

      {/* Fullscreen viewer */}
      {index !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <p className="text-sm font-medium">
              {index + 1} / {images.length}
            </p>
            <div className="flex items-center gap-3">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp पर शेयर करें"
                className="hover:text-kn-red"
              >
                <WhatsAppIcon width={18} height={18} />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook पर शेयर करें"
                className="hover:text-kn-red"
              >
                <FacebookIcon width={18} height={18} />
              </a>
              <a
                href={`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X पर शेयर करें"
                className="hover:text-kn-red"
              >
                <XIcon width={18} height={18} />
              </a>
              <button onClick={() => setIndex(null)} aria-label="बंद करें" className="p-1 hover:text-kn-red">
                <CloseIcon width={24} height={24} />
              </button>
            </div>
          </div>
          <div className="relative flex-1 flex items-center justify-center px-12">
            <button
              onClick={prev}
              aria-label="पिछली फोटो"
              className="absolute left-2 md:left-6 h-11 w-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-kn-red transition-colors rotate-180"
            >
              <ChevronRight width={22} height={22} />
            </button>
            <img
              src={images[index].image}
              alt={images[index].caption || title}
              className="max-h-full max-w-full object-contain"
            />
            <button
              onClick={next}
              aria-label="अगली फोटो"
              className="absolute right-2 md:right-6 h-11 w-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-kn-red transition-colors"
            >
              <ChevronRight width={22} height={22} />
            </button>
          </div>
          {images[index].caption && (
            <p className="p-4 text-center text-sm text-neutral-300">{images[index].caption}</p>
          )}
        </div>
      )}
    </div>
  );
}
