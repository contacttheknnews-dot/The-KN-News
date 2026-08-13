"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  compressImageForUpload,
  isTooLargeForUpload,
  parseUploadResponse,
} from "@/lib/client-image";

// Bulk uploader with drag-and-drop. Images are compressed to WebP
// server-side, so large phone photos are fine.

export default function Uploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const upload = async (files: File[]) => {
    if (!files.length) return;
    setBusy(true);
    setMessage(null);
    try {
      // compress in the browser, then upload one-by-one so the total
      // request stays under Vercel's ~4.5MB body limit
      let uploaded = 0;
      let failed = 0;
      let lastError: string | null = null;
      for (const f of files.slice(0, 20)) {
        const prepared = await compressImageForUpload(f);
        if (isTooLargeForUpload(prepared)) {
          failed++;
          lastError = `${f.name}: 4MB+ के बाद भी बड़ी`;
          continue;
        }
        const fd = new FormData();
        fd.append("file", prepared);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await parseUploadResponse(res);
        if (data.ok) uploaded++;
        else {
          failed++;
          lastError = data.message || null;
        }
      }
      setMessage(
        `${uploaded ? `✅ ${uploaded} इमेज अपलोड हो गईं` : ""}${
          failed ? ` ❌ ${failed} विफल${lastError ? ` (${lastError})` : ""}` : ""
        }`.trim() || "❌ अपलोड विफल रही।"
      );
      if (uploaded) router.refresh();
    } catch {
      setMessage("❌ अपलोड विफल रही।");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        upload(Array.from(e.dataTransfer.files));
      }}
      className={`bg-white border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragOver ? "border-kn-red bg-kn-red-light/30" : "border-kn-border"
      }`}
    >
      <p className="text-sm font-semibold mb-1">
        इमेज यहाँ drag-drop करें, या चुनें (एक साथ 20 तक)
      </p>
      <p className="text-[11px] text-kn-muted mb-3">
        JPG, PNG, WebP, GIF — 12MB तक। अपलोड पर अपने-आप compress होकर WebP बनती हैं।
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.gif"
        disabled={busy}
        onChange={(e) => upload(Array.from(e.target.files || []))}
        className="mx-auto block text-sm"
      />
      {busy && <p className="mt-3 text-xs text-kn-muted">अपलोड हो रही है…</p>}
      {message && <p className="mt-3 text-xs font-medium select-all">{message}</p>}
    </div>
  );
}
