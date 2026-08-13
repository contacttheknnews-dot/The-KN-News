import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

// sharp is loaded lazily: if the native module is unavailable in this
// runtime, uploads still succeed with the original (client-compressed)
// file instead of crashing the whole route.
type SharpFn = (typeof import("sharp"))["default"];
let sharpMod: SharpFn | null | undefined;
async function getSharp(): Promise<SharpFn | null> {
  if (sharpMod !== undefined) return sharpMod;
  try {
    sharpMod = (await import("sharp")).default;
  } catch (err) {
    console.error("[upload] sharp unavailable, storing originals:", err);
    sharpMod = null;
  }
  return sharpMod;
}

export const dynamic = "force-dynamic";

const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const UPLOAD_ROLES = new Set(["SUPER_ADMIN", "EDITOR", "REPORTER", "AUTHOR"]);
const MAX_SIZE = 12 * 1024 * 1024; // 12 MB input — output is compressed anyway
const MAX_WIDTH = 1600;

type Uploaded = { ok: true; url: string } | { ok: false; message: string };

// Recompress to WebP (max 1600px wide). GIFs pass through to keep animation;
// if sharp is unavailable the original bytes are stored unchanged.
async function processImage(
  file: File
): Promise<{ buffer: Buffer; name: string; contentType: string }> {
  const ext = path.extname(file.name).toLowerCase();
  const base = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  const input = Buffer.from(await file.arrayBuffer());
  if (ext === ".gif") {
    return { buffer: input, name: `${base}.gif`, contentType: "image/gif" };
  }
  const sharp = await getSharp();
  if (!sharp) {
    return { buffer: input, name: `${base}${ext}`, contentType: file.type };
  }
  try {
    const buffer = await sharp(input)
      .rotate() // respect EXIF orientation
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    return { buffer, name: `${base}.webp`, contentType: "image/webp" };
  } catch (err) {
    // odd-but-valid image sharp can't parse — store the original
    console.error("[upload] sharp processing failed, storing original:", err);
    return { buffer: input, name: `${base}${ext}`, contentType: file.type };
  }
}

async function storeOne(file: File): Promise<Uploaded> {
  if (file.size > MAX_SIZE) {
    return { ok: false, message: `${file.name}: 12MB से बड़ी फ़ाइल समर्थित नहीं है।` };
  }
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED.has(ext) || !ALLOWED_MIME.has(file.type)) {
    return { ok: false, message: `${file.name}: केवल JPG, PNG, WebP, GIF समर्थित हैं।` };
  }

  let processed: { buffer: Buffer; name: string; contentType: string };
  try {
    processed = await processImage(file);
  } catch {
    return { ok: false, message: `${file.name}: इमेज प्रोसेस नहीं हो सकी (फ़ाइल corrupt हो सकती है)।` };
  }

  // Production (Vercel): the filesystem is read-only, so store in Vercel Blob.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`uploads/${processed.name}`, processed.buffer, {
        access: "public",
        contentType: processed.contentType,
      });
      return { ok: true, url: blob.url };
    } catch (err) {
      console.error("[upload] Vercel Blob error:", err);
      const detail = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        message: `अपलोड विफल रही — Blob storage से संपर्क नहीं हो सका। (${detail.slice(0, 200)})`,
      };
    }
  }

  // Local development: write to public/uploads on disk.
  try {
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, processed.name), processed.buffer);
    return { ok: true, url: `/uploads/${processed.name}` };
  } catch {
    return { ok: false, message: "अपलोड विफल रही — फ़ाइल सेव नहीं हो सकी।" };
  }
}

// Secure image upload for the media library (content roles only).
// Accepts one `file` or several `files` entries; responds with `url` for a
// single upload (backward compatible) plus a `results` array for bulk.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !UPLOAD_ROLES.has(session.role)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  if (!rateLimit(`upload:${session.id}`, 40, 60_000)) {
    return NextResponse.json(
      { ok: false, message: "बहुत तेज़ी से अपलोड हो रही हैं — एक मिनट रुकें।" },
      { status: 429 }
    );
  }

  const formData = await req.formData();
  const files = [...formData.getAll("file"), ...formData.getAll("files")].filter(
    (f): f is File => f instanceof File
  );
  if (files.length === 0) {
    return NextResponse.json({ ok: false, message: "No file" }, { status: 400 });
  }
  if (files.length > 20) {
    return NextResponse.json(
      { ok: false, message: "एक बार में अधिकतम 20 फ़ाइलें अपलोड करें।" },
      { status: 400 }
    );
  }

  const results: Uploaded[] = [];
  for (const file of files) {
    results.push(await storeOne(file));
  }

  const firstOk = results.find((r): r is { ok: true; url: string } => r.ok);
  const firstErr = results.find((r): r is { ok: false; message: string } => !r.ok);
  return NextResponse.json({
    ok: !!firstOk,
    url: firstOk?.url,
    message: firstOk ? undefined : firstErr?.message,
    results,
    uploaded: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
  });
}
