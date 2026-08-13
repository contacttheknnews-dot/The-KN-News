// Browser-side image compression, used before every upload.
//
// Vercel serverless functions reject request bodies over ~4.5 MB
// (FUNCTION_PAYLOAD_TOO_LARGE), so phone photos must be shrunk in the
// browser — the server never gets a chance to compress them otherwise.

const MAX_DIMENSION = 1920;
const TARGET_BYTES = 3_500_000; // stay well under Vercel's ~4.5 MB body limit
const SKIP_BELOW_BYTES = 600_000; // small files upload as-is

export async function compressImageForUpload(file: File): Promise<File> {
  // GIF (animation) and unknown types pass through untouched
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  if (file.size < SKIP_BELOW_BYTES) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const toBlob = (quality: number) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));

    let blob = await toBlob(0.85);
    if (blob && blob.size > TARGET_BYTES) blob = await toBlob(0.7);
    if (blob && blob.size > TARGET_BYTES) blob = await toBlob(0.55);
    if (!blob || blob.size >= file.size) return file; // no gain — keep original

    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", {
      type: "image/webp",
    });
  } catch {
    // canvas/bitmap unsupported — upload the original and let the server try
    return file;
  }
}

// True when the (already compressed) file still can't fit through Vercel's
// request body limit and would die with an opaque 413.
export function isTooLargeForUpload(file: File): boolean {
  return file.size > 4_200_000;
}

// Turn a fetch Response that may be a platform error page into a readable
// message (413 from Vercel is plain text, not our JSON).
export async function parseUploadResponse(
  res: Response
): Promise<{ ok: boolean; url?: string; message?: string; uploaded?: number; failed?: number }> {
  try {
    return await res.clone().json();
  } catch {
    if (res.status === 413) {
      return { ok: false, message: "इमेज बहुत बड़ी है — 4MB से छोटी इमेज चुनें।" };
    }
    return { ok: false, message: `अपलोड विफल रही (server error ${res.status})।` };
  }
}
