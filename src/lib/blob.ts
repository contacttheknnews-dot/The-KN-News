// Vercel Blob is usable in two configurations:
//  1. BLOB_READ_WRITE_TOKEN — classic read-write token.
//  2. OIDC store connection — Vercel injects VERCEL_OIDC_TOKEN and the store
//     connection provides BLOB_STORE_ID; the @vercel/blob SDK exchanges the
//     OIDC token itself when no explicit token is set.
// Gating only on BLOB_READ_WRITE_TOKEN (as the code originally did) silently
// routes uploads to the local-disk fallback when the token env var is empty —
// which on Vercel's read-only filesystem fails every upload.
export function blobConfigured(): boolean {
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) return true;
  return Boolean(process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID);
}
