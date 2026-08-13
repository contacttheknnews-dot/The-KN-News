"use client";

// Gallery image manager: multi-file device upload (POSTs to /api/admin/upload),
// add-by-URL, per-image caption, reorder and remove — serialized back into the
// existing `images` field format ("url | caption", one per line) so the
// saveGallery server action is unchanged.

import { useRef, useState } from "react";
import { inputCls, labelCls, btnSecondary } from "../ui";
import { compressImageForUpload, isTooLargeForUpload } from "@/lib/client-image";

type Img = { url: string; caption: string };

function parseLines(value: string): Img[] {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [url, ...rest] = line.split("|");
      return { url: url.trim(), caption: rest.join("|").trim() };
    })
    .filter((i) => i.url);
}

function serialize(images: Img[]): string {
  return images.map((i) => (i.caption ? `${i.url} | ${i.caption}` : i.url)).join("\n");
}

export default function GalleryImagesField({ defaultValue = "" }: { defaultValue?: string }) {
  const [images, setImages] = useState<Img[]>(() => parseLines(defaultValue));
  const [urlDraft, setUrlDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (files: File[]) => {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      let skipped = 0;
      for (const file of files.slice(0, 20)) {
        const prepared = await compressImageForUpload(file);
        if (isTooLargeForUpload(prepared)) {
          skipped++;
          continue;
        }
        fd.append("files", prepared);
      }
      if (![...fd.keys()].length) {
        setError("सभी इमेज बहुत बड़ी हैं (compress के बाद भी 4MB+)।");
        return;
      }
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data: {
        ok: boolean;
        message?: string;
        results?: ({ ok: true; url: string } | { ok: false; message: string })[];
      } = await res.json().catch(() => ({ ok: false, message: `Upload failed (${res.status})` }));
      const uploaded = (data.results ?? [])
        .filter((r): r is { ok: true; url: string } => r.ok)
        .map((r) => ({ url: r.url, caption: "" }));
      if (uploaded.length) setImages((prev) => [...prev, ...uploaded]);
      const firstErr = (data.results ?? []).find(
        (r): r is { ok: false; message: string } => !r.ok
      );
      const problems: string[] = [];
      if (skipped) problems.push(`${skipped} इमेज बहुत बड़ी थीं — छोड़ दी गईं।`);
      if (firstErr) problems.push(firstErr.message);
      else if (!uploaded.length) problems.push(data.message || "अपलोड विफल रही।");
      setError(problems.length ? problems.join(" ") : null);
    } catch {
      setError("अपलोड विफल रही।");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const update = (idx: number, patch: Partial<Img>) =>
    setImages((prev) => prev.map((img, i) => (i === idx ? { ...img, ...patch } : img)));
  const remove = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) =>
    setImages((prev) => {
      const to = idx + dir;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });

  return (
    <div className="space-y-3">
      <input type="hidden" name="images" value={serialize(images)} />
      <div className="flex items-center justify-between">
        <label className={labelCls}>Images * ({images.length} फोटो)</label>
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className={`${btnSecondary} shrink-0 disabled:opacity-60`}
        >
          {busy ? "अपलोड…" : "⬆ फोटो अपलोड करें"}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.gif"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) upload(files);
        }}
      />
      {error && <p className="text-xs font-semibold text-kn-red">{error}</p>}

      {images.length === 0 && (
        <p className="rounded-md border border-dashed border-kn-border px-3 py-6 text-center text-xs text-kn-muted">
          अभी कोई फोटो नहीं — ऊपर “फोटो अपलोड करें” से डिवाइस से चुनें, या नीचे URL जोड़ें।
        </p>
      )}

      <ul className="space-y-2">
        {images.map((img, i) => (
          <li key={`${img.url}-${i}`} className="flex items-center gap-2 rounded-md border border-kn-border p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt=""
              className="h-14 w-20 shrink-0 rounded object-cover border border-kn-border"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-[11px] text-kn-muted" title={img.url}>{img.url}</p>
              <input
                value={img.caption}
                onChange={(e) => update(i, { caption: e.target.value })}
                placeholder="कैप्शन (वैकल्पिक)"
                className={`${inputCls} text-xs`}
              />
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="ऊपर"
                className="rounded border border-kn-border px-1.5 text-xs disabled:opacity-30">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} title="नीचे"
                className="rounded border border-kn-border px-1.5 text-xs disabled:opacity-30">↓</button>
              <button type="button" onClick={() => remove(i)} title="हटाएँ"
                className="rounded border border-kn-border px-1.5 text-xs text-kn-red">✕</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          placeholder="या इमेज URL जोड़ें: /uploads/… या https://…"
          className={`${inputCls} text-xs`}
        />
        <button
          type="button"
          disabled={!urlDraft.trim()}
          onClick={() => {
            const url = urlDraft.trim();
            if (url) setImages((prev) => [...prev, { url, caption: "" }]);
            setUrlDraft("");
          }}
          className={`${btnSecondary} shrink-0 disabled:opacity-60`}
        >
          + जोड़ें
        </button>
      </div>
    </div>
  );
}
