// Shared client-side image upload helper for the editor.

import {
  compressImageForUpload,
  isTooLargeForUpload,
  parseUploadResponse,
} from "@/lib/client-image";

export async function uploadImageFile(
  file: File
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  try {
    const prepared = await compressImageForUpload(file);
    if (isTooLargeForUpload(prepared)) {
      return { ok: false, message: `${file.name}: इमेज बहुत बड़ी है (compress के बाद भी 4MB+)।` };
    }
    const fd = new FormData();
    fd.append("file", prepared);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await parseUploadResponse(res);
    if (data.ok && data.url) return { ok: true, url: data.url };
    return { ok: false, message: data.message || "इमेज अपलोड विफल रही।" };
  } catch {
    return { ok: false, message: "इमेज अपलोड विफल रही।" };
  }
}

export function isImageFile(file: File): boolean {
  return /^image\/(jpeg|png|webp|gif)$/.test(file.type);
}
