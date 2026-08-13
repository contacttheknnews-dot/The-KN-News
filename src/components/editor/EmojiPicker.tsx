"use client";

import { useEffect, useRef } from "react";

// Compact emoji palette for news writing (no heavy emoji-data dependency).

const EMOJI_GROUPS: { label: string; emoji: string[] }[] = [
  {
    label: "समाचार",
    emoji: ["⚡", "🚨", "📢", "📰", "🗞️", "📌", "📍", "🔴", "🟢", "⭐", "✅", "❌", "⚠️", "🔥", "💥", "🎯"],
  },
  {
    label: "भाव",
    emoji: ["😀", "😂", "🙂", "😢", "😡", "😱", "🙏", "👍", "👎", "👏", "💪", "🤝", "❤️", "💔", "🎉", "😷"],
  },
  {
    label: "विषय",
    emoji: ["🏛️", "⚖️", "🗳️", "👮", "🚔", "🏏", "⚽", "🏆", "🥇", "💰", "💼", "📈", "📉", "🏦", "💻", "📱",
      "🎬", "📺", "🎓", "📚", "🏥", "💊", "🌧️", "🌊", "🚗", "🚆", "✈️", "🌾", "🐄", "🕌", "🛕", "⛪"],
  },
];

export default function EmojiPicker({
  onSelect,
  onClose,
}: {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1 z-30 w-72 max-h-64 overflow-y-auto rounded-md border border-kn-border bg-white p-2 shadow-lg"
    >
      {EMOJI_GROUPS.map((g) => (
        <div key={g.label}>
          <p className="px-1 pt-1 pb-0.5 text-[10px] font-bold uppercase text-kn-muted">{g.label}</p>
          <div className="grid grid-cols-8">
            {g.emoji.map((e) => (
              <button
                key={e}
                type="button"
                onMouseDown={(ev) => ev.preventDefault()}
                onClick={() => onSelect(e)}
                className="h-8 w-8 rounded text-lg hover:bg-kn-gray"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
