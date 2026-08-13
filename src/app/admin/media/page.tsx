import { readdir } from "fs/promises";
import path from "path";
import { list } from "@vercel/blob";
import { requireUser } from "@/lib/auth";
import { blobConfigured } from "@/lib/blob";
import Uploader from "./Uploader";
import MediaBrowser, { type MediaFile } from "./MediaBrowser";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  await requireUser(["EDITOR", "REPORTER", "AUTHOR"]);

  const files: MediaFile[] = [];

  // Production (Vercel): admin uploads live in Blob storage.
  if (blobConfigured()) {
    try {
      const res = await list({ prefix: "uploads/", limit: 500 });
      for (const b of res.blobs.sort((a, z) => (a.pathname < z.pathname ? 1 : -1))) {
        files.push({
          url: b.url,
          name: b.pathname.replace(/^uploads\//, ""),
          source: "cloud",
        });
      }
    } catch {
      // Blob unreachable — fall through to local listings only
    }
  }

  try {
    const local = await readdir(path.join(process.cwd(), "public", "uploads"));
    for (const f of local
      .filter((f) => /\.(jpe?g|png|webp|svg|gif)$/i.test(f))
      .sort()
      .reverse()) {
      files.push({ url: `/uploads/${f}`, name: f, source: "local" });
    }
  } catch {
    // uploads dir does not exist yet
  }

  try {
    const samples = await readdir(path.join(process.cwd(), "public", "images", "sample"));
    for (const f of samples.filter((f) => /\.(jpe?g|png|webp|svg)$/i.test(f)).sort()) {
      files.push({ url: `/images/sample/${f}`, name: f, source: "sample" });
    }
  } catch {
    // no sample dir
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-5">Media Library</h1>
      <Uploader />
      <MediaBrowser files={files} />
    </div>
  );
}
