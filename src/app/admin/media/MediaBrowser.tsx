"use client";

import { useMemo, useState } from "react";

export type MediaFile = {
  url: string;
  name: string;
  source: "cloud" | "local" | "sample";
};

const SOURCE_LABEL: Record<MediaFile["source"], string> = {
  cloud: "Cloud",
  local: "Local",
  sample: "Sample",
};

export default function MediaBrowser({ files }: { files: MediaFile[] }) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<"all" | MediaFile["source"]>("all");
  const [copied, setCopied] = useState<string | null>(null);

  const sources = useMemo(
    () => [...new Set(files.map((f) => f.source))],
    [files]
  );

  const filtered = files.filter((f) => {
    if (source !== "all" && f.source !== source) return false;
    if (query && !f.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard unavailable — the URL text is selectable as fallback
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="फ़ाइल नाम खोजें…"
          className="w-64 rounded-md border border-kn-border bg-white px-3 py-2 text-sm outline-none focus:border-kn-red"
        />
        {sources.length > 1 && (
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as typeof source)}
            className="rounded-md border border-kn-border bg-white px-2 py-2 text-sm outline-none"
          >
            <option value="all">सभी स्रोत</option>
            {sources.map((s) => (
              <option key={s} value={s}>{SOURCE_LABEL[s]}</option>
            ))}
          </select>
        )}
        <span className="text-xs text-kn-muted">{filtered.length} फ़ाइलें</span>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {filtered.map((f) => (
          <div key={f.url} className="bg-white border border-kn-border rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.url} alt={f.name} loading="lazy" className="aspect-video w-full object-cover" />
            <div className="px-2 py-1.5">
              <p className="text-[10px] text-kn-muted break-all select-all leading-tight">{f.name}</p>
              <button
                type="button"
                onClick={() => copy(f.url)}
                className="mt-1 w-full rounded border border-kn-border bg-white px-2 py-1 text-[10px] font-bold hover:bg-kn-gray"
              >
                {copied === f.url ? "✅ Copy हो गया" : "URL copy करें"}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-kn-muted col-span-full">कोई फ़ाइल नहीं मिली।</p>
        )}
      </div>
    </div>
  );
}
