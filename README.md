# The KN News — “दूरगामी सोच”

Hindi-first digital news & social media platform for **The KN News** (Ghazipur, Uttar Pradesh).
Built with Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + Prisma (SQLite → PostgreSQL/MySQL ready).

## Quick start

```bash
npm install
npm run db:push         # create the database
npm run images:generate # regenerate sample SVG images (already committed)
npm run db:seed         # load sample Hindi content

npm run dev             # http://localhost:3000
```

**Admin login:** http://localhost:3000/admin — `admin@theknnews.com` (change the seeded password before going live)
(also seeded: editor@ / reporter@ / ads@ / moderator@ — same password. **Change all passwords before going live.**)

## What's inside

**Public site** — homepage (hero, trending, ताज़ा खबर, all category sections, videos,
photo gallery, most-read, newsletter), article pages (breadcrumb, byline, share,
tags, related news, moderated comments), category + UP-district subcategory pages,
The KN Cricket hub (tabs: ताज़ा खबर / मैच रिपोर्ट / सीरीज अपडेट / रिकॉर्ड्स / खिलाड़ी /
विश्लेषण / क्विज), search with filters (category/author/date/location/sort), वीडियो,
फोटो गैलरी with fullscreen viewer, विचार (opinion), Advertise With Us + inquiry form,
contact form, all legal pages, branded 404, loading skeletons.

**Admin CMS** (`/admin`) — dashboard cards, full news editor (slug, subheadline,
SEO fields, schedule, featured, opinion, tags, subcategory/district), breaking-news
ticker manager (activate/schedule/order), categories, tags, authors, comment
moderation (approve/reject/delete/reported), newsletter subscribers + CSV export,
direct advertisements (placements, date windows, impression/click counts), AdSense
status, videos, galleries, media library with secure upload, users & roles
(RBAC: Super Admin / Editor / Reporter / Author / Ad Manager / Moderator),
website settings, activity log.

**Monetization** — reusable `<AdSenseAd />` (env-configured, dev placeholders,
Auto Ads support) + `<AdSlot />` that prefers direct-sold banners per placement
(13 placements across homepage/article/category) and falls back to AdSense.
All ads labelled «विज्ञापन · Advertisement».

**SEO** — hi-IN metadata, Open Graph/Twitter cards, canonical URLs,
NewsArticle/Breadcrumb/Organization/WebSite JSON-LD, `/sitemap.xml`,
`/news-sitemap.xml` (Google News, last 48h), `robots.txt`, HTML sitemap page.

**Security** — bcrypt password hashing, JWT session cookie (httpOnly, `jose`),
middleware-protected admin + per-action server-side role checks, rate-limited
public forms with honeypots, validated file uploads (type/size/random names),
plain-text comments (no HTML injection), admin activity log, env-based secrets.

## Configuration (`.env`)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite file in dev; point to Postgres/MySQL in prod (change `provider` in `prisma/schema.prisma`) |
| `AUTH_SECRET` | Session signing secret — **must** change in production |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for SEO/sitemaps |
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` | ca-pub-… id; empty ⇒ labelled placeholders |
| `NEXT_PUBLIC_ADSENSE_AUTO_ADS` | `"true"` to enable Auto Ads |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 id (optional) |

## Notes

- All seeded articles are clearly-marked **sample content** (each body carries a
  «नमूना खबर» note) — replace via the admin editor.
- Cricket live scores are a placeholder by design — integrate a licensed cricket
  data API before showing live data.
- Scheduled articles publish automatically once their publish time passes
  (query-based, no cron needed).
