"use client";

// URL input + direct device upload (POSTs to /api/admin/upload) with preview.

import { useRef, useState } from "react";
import { inputCls, btnSecondary } from "./ui";
import {
  compressImageForUpload,
  isTooLargeForUpload,
  parseUploadResponse,
} from "@/lib/client-image";

export default function ImageUploadField({
  name,
  defaultValue = "",
  required = false,
  placeholder = "/uploads/… या https://…",
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const prepared = await compressImageForUpload(file);
      if (isTooLargeForUpload(prepared)) {
        setError("इमेज बहुत बड़ी है (compress के बाद भी 4MB+)।");
        return;
      }
      const fd = new FormData();
      fd.append("file", prepared);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await parseUploadResponse(res);
      if (data.ok && data.url) setUrl(data.url);
      else setError(data.message || "अपलोड विफल रही।");
    } catch {
      setError("अपलोड विफल रही।");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          name={name}
          required={required}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={inputCls}
          placeholder={placeholder}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className={`${btnSecondary} shrink-0 disabled:opacity-60`}
        >
          {busy ? "अपलोड…" : "Upload"}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
      />
      {error && <p className="text-xs font-semibold text-kn-red">{error}</p>}
      {url && !error && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="preview"
          className="aspect-video w-full rounded-md border border-kn-border object-cover"
        />
      )}
    </div>
  );
}
