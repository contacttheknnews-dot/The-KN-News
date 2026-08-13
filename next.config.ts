import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Force HTTPS for two years incl. subdomains; safe on a Vercel custom domain
  // that is always served over TLS.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // NOTE: A Content-Security-Policy is NOT set here yet. The site injects
  // inline JSON-LD, Next.js runtime scripts, Google AdSense/Analytics, and
  // social-embed SDKs (Twitter/Instagram/Facebook), so a correct policy needs
  // per-request nonces (middleware) and must be tested end-to-end before
  // enabling — shipping a wrong CSP silently breaks ads/embeds. Track as a
  // follow-up; the sanitize-html pass on article bodies is the current XSS
  // control.
];

const nextConfig: NextConfig = {
  // sharp is a native module — it must be required from node_modules at
  // runtime, never bundled (Turbopack bundling breaks its binding on Vercel).
  serverExternalPackages: ["sharp"],
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
