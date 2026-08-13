"use client";

// Horizontal scrolling breaking-news ticker. The track is duplicated so the
// CSS animation loops seamlessly; hover pauses it.

import Link from "next/link";

type Item = { text: string; link?: string | null };

export default function BreakingTicker({ items }: { items: Item[] }) {
  if (!items.length) return null;
  const track = [...items, ...items];

  return (
    <div className="bg-white border-b border-kn-border">
      <div className="container-site flex items-stretch overflow-hidden">
        <div className="flex items-center gap-2 bg-kn-red text-white px-3 md:px-4 py-2 shrink-0 z-10">
          <span className="breaking-dot inline-block h-2 w-2 rounded-full bg-white" />
          <span className="text-xs md:text-sm font-extrabold tracking-wide whitespace-nowrap">
            BREAKING NEWS
          </span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="ticker-track flex items-center h-full w-max">
            {track.map((item, i) => (
              <span key={i} className="flex items-center whitespace-nowrap text-sm">
                <span className="mx-4 text-kn-red font-bold">●</span>
                {item.link ? (
                  <Link href={item.link} className="hover:text-kn-red font-medium">
                    {item.text}
                  </Link>
                ) : (
                  <span className="font-medium">{item.text}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
