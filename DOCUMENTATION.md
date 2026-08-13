# THE KN NEWS — Complete Project Documentation

> **Project:** The KN News — Digital News & Social Media Platform
> **Tagline:** "दूरगामी सोच" एक प्रतिष्ठित सामाजिक मीडिया संस्थान के रूप में होने को अग्रसर
> **Documentation date:** 1 August 2026
> **Basis:** This document was produced by inspecting the actual source code, configuration, and database of the project. Every statement is labeled **IMPLEMENTED**, **PARTIALLY IMPLEMENTED**, **NOT IMPLEMENTED**, or **RECOMMENDED**. No secrets are included.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Brand Information](#2-brand-information)
3. [Website Structure & Sitemap](#3-website-structure--sitemap)
4. [Homepage Overview](#4-homepage-overview)
5. [News Categories & Image Inventory](#5-news-categories--image-inventory)
6. [Article System](#6-article-system)
7. [Admin CMS](#7-admin-cms)
8. [Database Documentation](#8-database-documentation)
9. [Email System](#9-email-system)
10. [Advertising System (AdSense + Direct)](#10-advertising-system)
11. [SEO Documentation](#11-seo-documentation)
12. [Social Media System](#12-social-media-system)
13. [Search System](#13-search-system)
14. [Newsletter System](#14-newsletter-system)
15. [Contact / Enquiry System](#15-contact--enquiry-system)
16. [Cricket Section](#16-cricket-section)
17. [Performance](#17-performance)
18. [Security](#18-security)
19. [Tech Stack](#19-tech-stack)
20. [Project File Structure](#20-project-file-structure)
21. [Environment Variables](#21-environment-variables)
22. [API Documentation](#22-api-documentation)
23. [Deployment](#23-deployment)
24. [Testing](#24-testing)
25. [Error Handling](#25-error-handling)
26. [Current Issues / TODO](#26-current-issues--todo)
27. [Production Readiness Report](#27-production-readiness-report)
28. [Backup & Recovery](#28-backup--recovery)
29. [Business & Monetization](#29-business--monetization)
30. [Future Roadmap](#30-future-roadmap)
31. [Final Project Summary](#31-final-project-summary)

---

# 1. PROJECT OVERVIEW

| Item | Value |
|---|---|
| Project name | **The KN News** |
| Tagline | "दूरगामी सोच" एक प्रतिष्ठित सामाजिक मीडिया संस्थान के रूप में होने को अग्रसर |
| Type | Digital News & Social Media Platform (Hindi-first) |
| Primary audience | Hindi-speaking readers in India; local focus on Ghazipur / Purvanchal / Uttar Pradesh |
| Headquarters | Ghazipur, Uttar Pradesh, India |
| Coverage | देश (National), उत्तर प्रदेश, दिल्ली NCR, राजनीति, क्रिकेट, खेल, मनोरंजन, बिजनेस, टेक्नोलॉजी, शिक्षा, नौकरी, लाइफस्टाइल, अपराध |

**What the project does.** A complete Hindi news portal with a public reader-facing website and a full role-based admin CMS. Editors publish articles, breaking news, YouTube videos, and photo galleries; readers browse by category, search, comment, subscribe to the newsletter, and share to social media. The platform is monetization-ready with 11 ad placements (direct-sold banners + Google AdSense fallback).

**Main objective.** Establish The KN News as a trusted regional digital news brand ("दूरगामी सोच") with reliable, fact-based Hindi journalism, and grow it into a sustainable media business through advertising.

**Current status (as of 1 Aug 2026).** Feature-complete local build. All 58 articles carry real licensed photographs, 30 real videos from the official YouTube channel are live, social links and contact details are unified, and form-to-email notifications are configured and verified working. The project runs on SQLite locally and has **not yet been deployed to production**.

**Major functionality (all IMPLEMENTED):** article publishing workflow with drafts/scheduling, 13 news categories + 10 UP district subcategories, breaking-news ticker, video hub, photo galleries with lightbox, comments with moderation, newsletter capture + CSV export, contact & advertising enquiry forms with email notification, full-text search with filters, 6-role admin CMS with activity log, SEO (sitemaps, Google News sitemap, JSON-LD), ad server with impression/click tracking.

**Future scalability.** The schema is database-agnostic (SQLite → PostgreSQL/MySQL is a one-line provider switch). Next.js App Router supports incremental adoption of caching/ISR. See [Roadmap](#30-future-roadmap).

---

# 2. BRAND INFORMATION

| Element | Value | Status |
|---|---|---|
| Website name | The KN News | IMPLEMENTED |
| Logo | `public/images/logo.jpg` — round red "THE KN NEWS" badge; shown in Header, Footer, and Google structured data | IMPLEMENTED — ⚠️ current file carries a small "KK TIME" watermark; replace with a clean master file when available |
| Legacy logo | `public/images/logo.svg` (generated placeholder) | Superseded; no longer referenced |
| Tagline (short) | दूरगामी सोच | IMPLEMENTED (`SITE.taglineShort`) |
| Tagline (full) | "दूरगामी सोच" एक प्रतिष्ठित सामाजिक मीडिया संस्थान के रूप में होने को अग्रसर | IMPLEMENTED (`SITE.tagline`) |
| Favicon | `src/app/favicon.ico` | PARTIALLY IMPLEMENTED — still the default Next.js icon; **replace with logo-derived .ico** |
| Default social-share (OG) image | — | NOT IMPLEMENTED — recommended 1200×630 branded banner |

### Brand colors (defined in `src/app/globals.css` via Tailwind v4 `@theme`)

| Token | Hex | Usage |
|---|---|---|
| `kn-red` | `#d21f2a` | Primary brand red — buttons, badges, accents, "KN" block |
| `kn-red-dark` | `#a3131c` | Hover state |
| `kn-red-light` | `#fdecec` | Light red backgrounds |
| `kn-dark` | `#1a1a1a` | Header/footer dark, body text |
| `kn-charcoal` | `#262626` | Navigation bar |
| `kn-gray` | `#f4f4f5` | Light background |
| `kn-border` | `#e5e5e5` | Borders |
| `kn-muted` | `#6b7280` | Secondary text |

### Typography

- **Noto Sans Devanagari** (weights 400–800) — primary font for Hindi, loaded via `next/font/google`, CSS var `--font-devanagari`.
- **Inter** — Latin fallback, CSS var `--font-latin`.
- Both use `display: swap`; page language is `<html lang="hi">`.

### Social media identity (single source of truth: `src/lib/constants.ts` → `SITE.social`)

| Platform | URL |
|---|---|
| Facebook | https://www.facebook.com/profile.php?id=61554741623006 |
| Instagram | https://www.instagram.com/theknnews_/ |
| YouTube | https://www.youtube.com/@Theknnews7 |
| X (Twitter) | https://x.com/thekngroup7622 |
| Telegram | https://t.me/theknnews |
| WhatsApp Channel | https://whatsapp.com/channel/0029VbDGxI62v1IldW9WQO2I |

Where each link appears — see [Section 12](#12-social-media-system).

---

# 3. WEBSITE STRUCTURE & SITEMAP

## 3.1 Public routes (all IMPLEMENTED unless noted)

| URL | Purpose | Rendering |
|---|---|---|
| `/` | Homepage | force-dynamic |
| `/latest` | ताज़ा खबर — paginated feed (15/page) | force-dynamic |
| `/category/[slug]` | Category listing (12/page) + subcategory chips + breadcrumb | force-dynamic |
| `/news/[slug]` | Article page | force-dynamic |
| `/cricket` | The KN Cricket hub (7 tabs) | force-dynamic |
| `/search` | Search with filters | force-dynamic, `noindex` |
| `/videos` | Video hub (YouTube embeds) | force-dynamic |
| `/photos` | Photo gallery index | force-dynamic |
| `/photos/[id]` | Single gallery with lightbox | force-dynamic |
| `/opinion` | विचार — opinion articles | force-dynamic |
| `/about` | हमारे बारे में (mission, values, founder, social links, contact) | static |
| `/contact` | संपर्क करें + contact form | force-dynamic |
| `/advertise` | Advertise With Us + enquiry form | static shell + client form |
| `/privacy-policy`, `/terms`, `/disclaimer`, `/editorial-policy`, `/correction-policy`, `/cookie-policy` | Legal pages | static |
| `/sitemap-page` | Human-readable HTML sitemap | force-dynamic |
| `/sitemap.xml` | XML sitemap (17 static + categories + up to 5000 articles) | force-dynamic |
| `/news-sitemap.xml` | Google News sitemap (last 48 h) | force-dynamic |
| `/robots.txt` | Robots rules | generated |

**Category slugs (13 top-level):** `desh`, `uttar-pradesh`, `delhi-ncr`, `rajniti`, `cricket`, `khel`, `manoranjan`, `business`, `technology`, `shiksha`, `naukri`, `lifestyle`, `apradh`.
**Subcategories (10, under uttar-pradesh):** `ghazipur`, `varanasi`, `jaunpur`, `lucknow`, `prayagraj`, `noida`, `greater-noida`, `agra`, `gorakhpur`, `anya-jile`.

**Routes that do NOT exist** (requested items marked NOT IMPLEMENTED):
- `/trending` and `/most-read` — these exist only as homepage sections and sidebar boxes, not standalone pages.
- `/author/[slug]` and `/tag/[slug]` — author browsing works via the search page's author filter; tag chips link to `/search?q=<tag>`.
- RSS/Atom feed, PWA manifest.

## 3.2 Admin routes (all under `/admin`, JWT-protected by middleware)

`/admin` (dashboard) · `/admin/login` · `/admin/articles` (+ `/new`, `/[id]`) · `/admin/breaking` · `/admin/categories` · `/admin/tags` · `/admin/authors` · `/admin/media` · `/admin/comments` · `/admin/newsletter` (+ `/export` CSV) · `/admin/inquiries` · `/admin/videos` · `/admin/gallery` · `/admin/ads` · `/admin/adsense` · `/admin/settings` · `/admin/users` · `/admin/activity`

## 3.3 API routes

`POST /api/admin/upload` (media upload) · `GET /api/ads/[id]/click` (ad click tracker + redirect) · `GET /admin/newsletter/export` (subscriber CSV). Details in [Section 22](#22-api-documentation).

---

# 4. HOMEPAGE OVERVIEW

File: `src/app/(public)/page.tsx` (`force-dynamic`). Header/footer come from the `(public)` layout. Top-to-bottom:

| # | Section | Component | Data source | Admin control | Mobile behavior |
|---|---|---|---|---|---|
| 1 | **Utility bar** (date, About/Contact/Advertise links, 6 social icons) | `SiteHeader` | `SITE.social` + DB Settings override | Admin → Settings → Social Media | Links hidden below `md`; social icons always visible |
| 2 | **Branding** — logo image + "The KN News" wordmark + tagline | `SiteHeader` (next/image, priority) | `public/images/logo.jpg`, `SITE` | Replace logo file | Logo 48px → 56px on md |
| 3 | **Search / Subscribe / Login buttons** | `SiteHeader` | — | — | Hidden below `lg` (search icon in nav instead) |
| 4 | **Header ad** | `AdSlot HEADER` | `getAdFor("HEADER")` → Advertisement table, AdSense fallback | Admin → Advertisements | `imageMobile` shown when set |
| 5 | **Navigation** — 17 items + "और देखें" dropdown | `NavBar` (sticky) | `NAV_ITEMS`, `MORE_ITEMS` constants | Code-level (constants.ts) | Hamburger → left drawer with search box |
| 6 | **Breaking ticker** | `BreakingTicker` | `getBreakingNews()` (active, within start/end window) | Admin → Breaking News | CSS marquee, pauses on hover |
| 7 | **Below-nav ad** | `AdSlot BELOW_NAV` | Advertisement table | Admin → Advertisements | responsive |
| 8 | **Featured hero** — 1 large + 4 overlay cards | `HeroSection` (Suspense) | `getFeatured(5)` — articles with `featured: true` | Article form → "Featured" checkbox | 1-col stacks |
| 9 | **TRENDING strip** — 4 titles | `TrendingStrip` | `getTrending(4)` — most-viewed last 7 days | Automatic (views) | horizontal wrap |
| 10 | **ताज़ा खबर** — 8 cards | `LatestSection` (Suspense) | `getLatest(8)` | Automatic (publish date) | 1→2→4 cols |
| 11 | **HOME_MID_1 ad** | `AdSlot` | — | Admin → Advertisements | — |
| 12 | **उत्तर प्रदेश** section (5) | `CategorySection` | `getByCategorySlug("uttar-pradesh", 5)` | Automatic | lead + list stacks |
| 13 | **राजनीति** section (5) | `CategorySection` | same pattern | Automatic | — |
| 14 | **HOME_MID_2 ad** | `AdSlot` | — | — | — |
| 15 | **The KN Cricket** section (5, links to `/cricket`) | `CategorySection` | `getByCategorySlug("cricket", 5)` | Automatic | — |
| 16 | **खेल** grid (4) | `CategoryGridSection` | `getByCategorySlug("khel", 4)` | Automatic | — |
| 17 | **Sidebar** (right column, sticky ≥lg) — Trending 5, SIDEBAR ad, Most Read 5, Newsletter box | `Sidebar` | `getTrending(5)`, `getMostRead(5)` | Ads via admin | Moves below content on mobile |
| 18 | **HOME_MID_3 ad** | `AdSlot` | — | — | — |
| 19 | **मनोरंजन / बिजनेस / टेक्नोलॉजी** grids (4 each) | `CategoryGridSection` | `getByCategorySlug` | Automatic | — |
| 20 | **शिक्षा + नौकरी** two-column (4 each) | `CategorySectionHalf` | `getByCategorySlug` | Automatic | stacks below `md` |
| 21 | **वीडियो न्यूज़** — 4 latest videos | `VideoSection` | `prisma.video.findMany` (latest 4) | Admin → Videos | 1→2→4 cols |
| 22 | **फोटो गैलरी** — 4 galleries | `GallerySection` | `prisma.gallery.findMany` | Admin → Photo Gallery | — |
| 23 | **सबसे ज्यादा पढ़ी गई खबरें** — 6 | `MostReadSection` | `getMostRead(6)` (all-time views) | Automatic | — |
| 24 | **Newsletter signup** (`#newsletter` anchor) | `NewsletterBox` | `subscribeNewsletter` server action | Admin → Newsletter (subscriber list) | full width |
| 25 | **BEFORE_FOOTER ad** | `AdSlot` | — | — | — |
| 26 | **Footer** — brand + logo + social, 10 important links, 11 category links, contact block | `Footer` | `SITE`, `getSettings()` (contact.\*) | Admin → Settings → Contact | 1→2→4 cols |

Every section renders nothing when its query returns no rows. Streaming: Hero and Latest sections are wrapped in `<Suspense>` with skeletons; other sections render server-blocking.

---

# 5. NEWS CATEGORIES & IMAGE INVENTORY

## 5.1 Category images — IMPLEMENTED with real photographs

All **58 article featured images** were replaced (1 Aug 2026) with real photographs sourced from Wikimedia Commons under commercial-use licenses (CC BY, CC BY-SA, GODL-India, public domain), following the category plan of the reference poster. The tiny thumbnails embedded in the poster itself (~92×68 px) were not usable as website images; the poster served as the *visual plan* (subjects, counts, style) while real high-resolution photos supply the pixels.

**Specifications (uniform for all 58):**

| Property | Value |
|---|---|
| Location | `public/uploads/<category>-<nn>.webp` |
| Dimensions | 1200 × 675 px |
| Aspect ratio | 16:9 |
| Format | WebP, quality 80 (average ~100 KB) |
| Type | Dynamic — referenced from the `Article.image` DB field, changeable in Admin |
| Desktop/mobile | Same file; responsive `<img>` scaling (cards 1→2→4 columns) |
| Used in | Homepage hero/cards, category pages, article page (featured image), related-news cards, search results |
| Attribution | Stored in `Article.imageCaption` (e.g. "फोटो: <artist> / Wikimedia Commons, CC BY-SA 4.0") — satisfies license terms |

**Per-category counts (matches poster plan and article counts exactly, zero duplicates):**

| Category | Files | Category | Files |
|---|---|---|---|
| cricket-01…08 | 8 | uttar-pradesh-01…06 | 6 |
| politics-01…05 | 5 | business-01…05 | 5 |
| india-01…04 | 4 | delhi-ncr-01…04 | 4 |
| sports-01…04 | 4 | entertainment-01…04 | 4 |
| technology-01…04 | 4 | education-01…04 | 4 |
| jobs-01…04 | 4 | lifestyle-01…03 | 3 |
| crime-01…03 | 3 | **Total** | **58** |

Notable real subjects: Taj Mahal, Varanasi ghats, Rumi Darwaza (Lucknow), Kumbh Mela, Agra Fort, Yogi Adityanath, Narendra Modi (BJP rally), Rahul Gandhi, Smriti Irani, Sansad Bhavan, SP party flags, BSE tower, Mumbai skyline, Indian tricolour, Indian Army parade, PSLV rocket launch, India Gate, Connaught Place, Delhi Metro, Gurgaon Cyber City, field hockey, badminton, Olympic wrestling, boxing, Indian classical dancers, cinema hall, clapperboard, AI robot, microchip, Indian school classroom, graduation, library, crime-scene tape, handcuffs.

## 5.2 Other image inventories

| Asset | Count | Status |
|---|---|---|
| Logo (`/images/logo.jpg`) | 1 | IMPLEMENTED (watermarked source — replace when clean master available) |
| Author photos | 6 | **PARTIALLY IMPLEMENTED** — still `/images/sample/author-*.svg` placeholders; needs real team photos (400×400) |
| Gallery images | 14 (3 galleries) | **PARTIALLY IMPLEMENTED** — still sample SVGs (target 1200×900, 4:3) |
| Ad banners | 3 sample ads (4 files) | Sample creatives — replaced when real advertisers onboard (970×90, 360×120, 300×250, 728×90) |
| Video thumbnails | 30 | IMPLEMENTED — real thumbnails auto-served from `i.ytimg.com` |
| Favicon | 1 | Default Next.js icon — **replace** |
| Default OG image (1200×630) | 0 | NOT IMPLEMENTED — **recommended** |
| Legacy sample SVGs (`/images/sample/`, 52 files) | — | Kept for development; safe to delete once authors/galleries/ads are replaced |

---

# 6. ARTICLE SYSTEM

## 6.1 Article fields (Prisma `Article` model — all IMPLEMENTED)

| Field | Type | Notes |
|---|---|---|
| `title` | required | Headline (Hindi) |
| `slug` | required, unique | ASCII slug; `slugify()` strips Devanagari, so Hindi titles need a manual Latin slug (fallback `khabar-<timestamp>`) |
| `subheadline` | optional | Displayed under the H1 |
| `excerpt` | required | Card/description text |
| `body` | required | HTML (entered in the admin form; rendered via `.article-body` with `dangerouslySetInnerHTML`) |
| `image` | required | Featured image path (default fallback `/images/sample/desh-1.svg`) |
| `imageCaption` | optional | Shown under featured image; also carries photo credit |
| `categoryId` / `subcategoryId` | required / optional | Category + UP-district subcategory |
| `authorId` | required | Links to Author profile |
| `location` | optional | Dateline (📍 shown in byline) |
| `status` | DRAFT / PUBLISHED / SCHEDULED | Default DRAFT |
| `publishedAt` | optional datetime | Set from form date+time; defaults to "now" on publish |
| `createdAt` / `updatedAt` | auto | updatedAt shown as "अपडेटेड" |
| `views` | auto-increment on page view | Powers Trending/Most-Read |
| `featured` | boolean | Places article in homepage hero |
| `isOpinion` | boolean | Places article on `/opinion` |
| `seoTitle`, `metaDescription`, `focusKeyword`, `canonicalUrl`, `socialImage` | optional | Full per-article SEO controls |
| `tags` | many-to-many | Comma-separated in form, max 15, auto-created (Devanagari-aware slugs) |

## 6.2 Publishing workflow (IMPLEMENTED)

1. **Create** — Editor/Reporter/Author opens Admin → Add News, fills the form (image path comes from the Media Library upload → copy → paste flow).
2. **Save as Draft** — `status: DRAFT`; not visible publicly.
3. **Reporter restriction** — if a REPORTER submits any non-draft status, the server **forces DRAFT** ("submit for review"); Editors/Authors/Super Admin can publish directly.
4. **Publish** — `status: PUBLISHED` with `publishedAt` ≤ now → immediately live.
5. **Schedule** — `status: SCHEDULED` with a future `publishedAt`. The public query `publishedWhere()` treats scheduled articles as live **only after their timestamp passes** — scheduling works with zero cron jobs.
6. **Update** — edits bump `updatedAt`; slug collisions are rejected; tag set is replaced.
7. **Delete** — EDITOR/SUPER_ADMIN only.
8. Every create/update/delete is written to the **Activity Log**; `revalidatePath` refreshes the homepage and the article page.

---

# 7. ADMIN CMS

Login: `/admin/login`. Seeded accounts (⚠️ all use password `admin123` — **must be changed before production**): admin@ (SUPER_ADMIN), editor@, reporter@, ads@, moderator@ `theknnews.com`.

## 7.1 Dashboard (`/admin`) — IMPLEMENTED

Stat cards: Total Articles, Published, Drafts, Scheduled, Total Views (formatted), Users, Comments (with pending count), Active Subscribers, Active Advertisements — each links to its section. Panels: 6 most recently updated articles; last 8 activity-log entries.

## 7.2 Sections & role permissions (server-enforced via `requireUser`)

| Section | SUPER_ADMIN | EDITOR | REPORTER | AUTHOR | AD_MANAGER | MODERATOR |
|---|---|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Articles (list/create/edit) | ✅ | ✅ | ✅ (drafts only — cannot publish) | ✅ | — | — |
| Article delete | ✅ | ✅ | — | — | — | — |
| Breaking News | ✅ | ✅ | — | — | — | — |
| Categories / Tags / Authors | ✅ | ✅ | — | — | — | — |
| Media Library (upload) | ✅ | ✅ | ✅ | ✅ | — | — |
| Comments moderation | ✅ | ✅ | — | — | — | ✅ |
| Newsletter (+CSV export) | ✅ | ✅ | — | — | — | — |
| Inquiries (contact + ads) | ✅ | ✅ | — | — | ✅ | — |
| Videos / Photo Gallery | ✅ | ✅ | — | — | — | — |
| Advertisements / AdSense | ✅ | ✅ | — | — | ✅ | — |
| Settings | ✅ | ✅ | — | — | — | — |
| Users & Roles | ✅ | — | — | — | — | — |
| Activity Log | ✅ | — | — | — | — | — |

SUPER_ADMIN implicitly passes every role check. The same arrays drive both nav visibility (`AdminNav.tsx`) and server enforcement.

## 7.3 Feature notes

- **Articles list**: status filter tabs, title search, 20/page pagination.
- **Media Library**: file input → `POST /api/admin/upload` (5 MB max; jpg/jpeg/png/webp/svg/gif; random server-generated filename → `/uploads/`); grid of uploads + sample images with copyable paths. No delete-file action (NOT IMPLEMENTED).
- **Comments**: filter tabs PENDING/APPROVED/REJECTED/REPORTED/ALL (latest 100); Approve / Reject / Delete per comment.
- **Settings**: 12 keys in 3 groups (Contact, Social Media, SEO/Analytics note) — stored in the `Setting` table; social/contact values override `constants.ts` defaults in Header/Footer/Contact.
- **AdSense page**: read-only status of the two AdSense env vars + setup instructions.
- **Activity Log**: latest 200 actions with user attribution (23 action types).

---

# 8. DATABASE DOCUMENTATION

**Engine:** SQLite (dev) via Prisma ORM 6.19.3. Schema is written to be portable — switching `provider` to `postgresql` or `mysql` requires no model changes. No migration history (uses `prisma db push`); no Prisma enums (status fields are documented strings).

## 8.1 Models (17)

### User
| Field | Type | Attributes |
|---|---|---|
| id | Int | PK, autoincrement |
| email | String | **unique** |
| name | String | required |
| passwordHash | String | bcrypt cost 12 |
| role | String | default `EDITOR` (SUPER_ADMIN / EDITOR / REPORTER / AUTHOR / AD_MANAGER / MODERATOR) |
| active | Boolean | default true (inactive users cannot log in) |
| createdAt | DateTime | default now |
| activityLogs | ActivityLog[] | relation |

### ActivityLog
id PK · userId FK→User (Cascade) · action String · detail String? · createdAt

### Author
id PK · name · slug **unique** · photo? · bio? · designation? · email? · facebook? · twitter? · instagram? · articles Article[]

### Category
id PK · name (Hindi) · nameEn? · slug **unique** · description? · order (default 0) · showInNav (default true) · parentId? FK→Category self-relation "Subcategories" (SetNull) · children · articles · subArticles · videos · galleries

### Tag
id PK · name · slug **unique** · articles ArticleTag[]

### Article
See [Section 6.1](#61-article-fields). FKs: categoryId→Category (required), subcategoryId→Category (SetNull), authorId→Author (required). **Indexes:** `[status, publishedAt]`, `[categoryId]`.

### ArticleTag (join table)
Composite PK `[articleId, tagId]`; both FKs Cascade.

### Comment
id PK · articleId FK (Cascade) · parentId? self-FK "Replies" (Cascade) · name · body · likes (default 0) · reported (default false) · status (default PENDING; PENDING/APPROVED/REJECTED) · createdAt

### BreakingNews
id PK · text · link? · active (default true) · order (default 0) · startAt? · endAt? · createdAt

### Advertisement
id PK · advertiserName · imageDesktop · imageMobile? · url · placement (11 values) · startDate? · endDate? · active (default true) · impressions (default 0) · clicks (default 0) · createdAt

### Video
id PK · title · youtubeId · thumbnail? · duration? · categoryId? FK (SetNull) · publishedAt (default now) · views (default 0)

### Gallery / GalleryImage
Gallery: id PK · title · description? · categoryId? FK (SetNull) · publishedAt · images[].
GalleryImage: id PK · galleryId FK (Cascade) · image · caption? · order (default 0)

### NewsletterSubscriber
id PK · email **unique** · active (default true) · createdAt

### AdInquiry
id PK · name · company? · email · phone? · requirement? · budget? · message? · status (default NEW; NEW/CONTACTED/CLOSED) · createdAt

### ContactMessage
id PK · name · email · subject? · message · createdAt

### Setting
key String **PK** · value String (key-value store; 12 keys used)

## 8.2 ER diagram (description)

```
User 1──∞ ActivityLog
Author 1──∞ Article ∞──1 Category (category)
                    ∞──1 Category (subcategory, optional)
Article 1──∞ Comment (self-nested via parentId)
Article ∞──∞ Tag   (through ArticleTag)
Category 1──∞ Category (parent/children)
Category 1──∞ Video, Gallery (optional)
Gallery 1──∞ GalleryImage
Standalone: BreakingNews, Advertisement, NewsletterSubscriber,
            AdInquiry, ContactMessage, Setting
```

## 8.3 Tables requested but NOT IMPLEMENTED (by design or pending)

- **Roles table** — roles are a string field on User (constants-driven), not a table.
- **Media/Images table** — media files live on disk (`public/uploads`), not tracked in DB.
- **Advertisers table** — advertiser name is a field on Advertisement.
- **Newsletter Campaigns** — only subscriber capture exists; campaign sending is delegated to external tools via CSV export.
- **Social Links table** — stored in `Setting` (`social.*` keys) + `constants.ts` fallback.
- **SEO Settings** — per-article fields + two `Setting` keys; no dedicated table.
- **Analytics table** — Google Analytics (env-configured script) instead of first-party analytics.

---

# 9. EMAIL SYSTEM

**Central notification address:** `contacttheknnews@gmail.com` — IMPLEMENTED and **verified working** (test email accepted by Gmail SMTP on 1 Aug 2026).

## 9.1 Architecture

- **Provider:** Gmail SMTP (`smtp.gmail.com:465`, TLS) via **nodemailer 9** with a Gmail App Password.
- **Module:** `src/lib/mailer.ts` — `sendNotification(subject, fields[], replyTo?)`. Lazily-created singleton transport. Builds a branded HTML table (red header, IST timestamp) + plain-text fallback. Subject prefix `[The KN News]`.
- **Reliability design:** DB write happens **first**, then the email. `sendNotification` never throws — SMTP failures are logged server-side and the visitor still gets a success message; the submission is always in the admin panel. If SMTP env vars are missing, a warning is logged and sending is skipped.
- **Env vars:** `NOTIFY_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (values live only in `.env` / host settings — never in code).

## 9.2 Forms wired to email (all IMPLEMENTED)

| Form | Action | Email subject | Reply-To |
|---|---|---|---|
| Newsletter signup (homepage/sidebar) | `subscribeNewsletter` | नया Newsletter Subscriber | — |
| Contact Us (`/contact`) | `submitContact` | Contact Enquiry: <subject> | visitor's email |
| Advertise With Us (`/advertise`) | `submitAdInquiry` | नई Advertise With Us Enquiry | visitor's email |

**News tips / collaboration / general enquiries** — PARTIALLY IMPLEMENTED: no dedicated forms; they flow through the Contact form's free-text subject field and are therefore covered by the contact notification. A dedicated News-Tip form (with location + attachment) is NOT IMPLEMENTED / RECOMMENDED.

## 9.3 Protections

- **Rate limiting** (in-memory, per IP): newsletter 5/min, contact 3/min, ad enquiry 3/min.
- **Honeypot** — hidden `website` field silently discards bot submissions.
- **Validation** — server-side email regex, required-field checks, length caps.
- **Duplicate subscriptions** — `upsert` on unique email; re-subscribing reactivates (`active: true`), never duplicates.
- **Success/failure UX** — Hindi status messages via `useActionState`; email failure is invisible to visitors (by design).

**NOT IMPLEMENTED:** double-opt-in confirmation email, public unsubscribe link (admin can deactivate/remove; CSV export feeds external tools like Mailchimp/Brevo which handle unsubscribe), email templates beyond the notification layout.

---

# 10. ADVERTISING SYSTEM

## 10.1 Placements (11, defined in `AD_PLACEMENTS`)

| Placement | Location | Rendered by |
|---|---|---|
| HEADER | Top of every page (in SiteHeader) | `AdSlot` |
| BELOW_NAV | Homepage, under nav/ticker | `AdSlot` |
| HOME_MID_1/2/3 | Homepage between sections | `AdSlot` |
| SIDEBAR | Sidebar (homepage, article, category, latest, cricket) | `AdSlot` |
| ARTICLE_TOP / ARTICLE_MID / ARTICLE_BOTTOM | Article page | `AdSlot` |
| CATEGORY | Category, latest & cricket listing pages | `AdSlot` |
| BEFORE_FOOTER | Homepage bottom | `AdSlot` |

## 10.2 Direct-sold ads — IMPLEMENTED

- Managed in **Admin → Advertisements** (AD_MANAGER or EDITOR): advertiser name, **desktop image**, optional **mobile image** (shown < sm), target URL (validated `https?://`), placement, **start/end dates**, active toggle.
- **Selection:** newest active ad within its date window wins per placement (one ad per slot per render).
- **Impression tracking:** incremented server-side on every render that returns the ad.
- **Click tracking:** creatives link to `GET /api/ads/[id]/click` → increments clicks → 302 to target URL (`rel="noopener sponsored"`).
- Every ad is labeled **"विज्ञापन · Advertisement"**.
- **Sponsored content** — NOT IMPLEMENTED as a distinct article type (no `sponsored` flag on Article).

## 10.3 Google AdSense — PARTIALLY IMPLEMENTED (code-complete, awaiting account)

- `<AdSenseAd />` (`src/components/ads/AdSenseAd.tsx`): renders `<ins class="adsbygoogle">` with `data-ad-client` from `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`, `data-ad-format="auto"`, `data-full-width-responsive="true"`; loads `adsbygoogle.js` lazily; supports an optional per-slot `adsenseSlot` id (no call site passes one yet).
- **Fallback chain per AdSlot:** direct-sold ad → AdSense unit (if publisher ID set) → dashed "Ad Space — Google AdSense" placeholder (dev).
- **Auto Ads:** root layout injects the global script only when `NEXT_PUBLIC_ADSENSE_AUTO_ADS="true"`.
- **To activate:** obtain AdSense approval → set the two env vars → redeploy. Status page: Admin → Google AdSense.

---

# 11. SEO DOCUMENTATION

## 11.1 Site-wide — IMPLEMENTED

- `<html lang="hi">`; `metadataBase` from `NEXT_PUBLIC_SITE_URL`.
- Title template `%s | The KN News`; default title "The KN News — दूरगामी सोच"; site description in Hindi.
- Open Graph: `type: website`, `locale: hi_IN`, siteName, url. Twitter: `summary_large_image`, site `@thekngroup7622`.
- **JSON-LD (root layout):** `NewsMediaOrganization` (logo, sameAs → all 6 social profiles, Ghazipur address) + `WebSite` with `SearchAction` (Sitelinks search box → `/search?q={search_term_string}`).
- `robots.txt`: allow `/`, disallow `/admin`, `/api`; lists both sitemaps.
- `sitemap.xml`: 17 static pages + all category pages + up to 5000 published articles (with lastModified).
- **`news-sitemap.xml`: Google News sitemap** — publication The KN News, language `hi`, articles from the last 48 hours.
- HTML sitemap at `/sitemap-page`.

## 11.2 Per page type

| Page | Title/Description | Canonical | OG/Twitter | JSON-LD |
|---|---|---|---|---|
| Homepage | root defaults | — | site-wide | Organization + WebSite |
| Article `/news/[slug]` | `seoTitle \|\| title`; `metaDescription \|\| excerpt(160)`; keywords = focusKeyword | ✅ `canonicalUrl \|\|` self-URL | ✅ OG *article* (image, publish/modify time, author, section) + Twitter large card | ✅ **NewsArticle** (author Person, publisher + logo, keywords) + **BreadcrumbList** |
| Category | `<name> की ताज़ा खबरें` + description | — | inherited | — |
| Videos / Photos / Latest / Cricket / Opinion / legal | static titles (+descriptions) | — | inherited | — |
| Search | static + **`robots: noindex`** | — | — | — |

**NOT IMPLEMENTED / RECOMMENDED:** per-category canonicals & OG images, default OG image (1200×630), RSS feed, `generateStaticParams`/ISR for articles (currently fully dynamic), author schema pages.

---

# 12. SOCIAL MEDIA SYSTEM

## 12.1 Central management — IMPLEMENTED

Two layers keep links consistent site-wide:

1. **Code default:** `SITE.social` in `src/lib/constants.ts` (single source of truth in code).
2. **DB override:** Admin → Settings → Social Media (`social.*` keys) — lets non-developers update links; Header reads `settings["social.x"] || SITE.social.x` etc.

Both layers currently hold the same six official URLs (listed in [Section 2](#2-brand-information)); the seed file matches, so re-seeding cannot restore stale links.

## 12.2 Where each surface shows social links

| Surface | What shows | Source |
|---|---|---|
| **Header utility bar** (all pages, desktop + mobile) | 6 clickable icons (FB, IG, YT, X, TG, WA) | Settings override → SITE.social |
| **Footer** (all pages) | 6 round icon buttons | SITE.social |
| **About Us** — "Connect With Us" | 6 labeled links | SITE.social |
| **Author/Founder** | Founder author record carries official FB/X/IG | Author table (seeded) |
| **Article share bar** (twice per article) | Share *intents*: Facebook sharer, X post, WhatsApp send, Telegram share + copy-link | ShareButtons component |
| **Gallery lightbox** | WhatsApp / Facebook / X share | GalleryViewer |
| **SEO layer** | `sameAs` array in Organization JSON-LD; Twitter `site:@thekngroup7622` | layout.tsx |
| **Mobile menu** | No separate social block (header icons remain visible on mobile) | — |
| **Videos** | All 30 videos embed the official channel @Theknnews7 (privacy-friendly youtube-nocookie player) | Video table |

---

# 13. SEARCH SYSTEM

**IMPLEMENTED** at `/search` (server-rendered GET form, works without JavaScript).

| Feature | Status | Details |
|---|---|---|
| Keyword search | ✅ | `q` matched against title, excerpt, body, location (SQLite `contains`) |
| Category filter | ✅ | dropdown of top-level categories |
| Author filter | ✅ | dropdown of all authors |
| Location filter | ✅ | free text |
| Date filter | ✅ | `from` / `to` date range |
| Sorting | ✅ | `latest` (publishedAt desc, default) / `relevant` (views desc) |
| Pagination | ✅ | 10/page; page links preserve all filters |
| Empty state | ✅ | "कोई परिणाम नहीं मिला" |
| Entry points | ✅ | header search pill, mobile-drawer search box, nav search icon, tag chips, WebSite SearchAction |
| Search API endpoint | NOT IMPLEMENTED | search is a server-rendered page, not a JSON API |
| Relevance ranking / fuzzy match | NOT IMPLEMENTED | RECOMMENDED post-migration (Postgres full-text search) |

Only published (or due-scheduled) articles are searchable. The page is `noindex`.

---

# 14. NEWSLETTER SYSTEM

| Feature | Status |
|---|---|
| Subscribe form (homepage `#newsletter` + sidebar box) | IMPLEMENTED |
| Subscriber storage (`NewsletterSubscriber`) | IMPLEMENTED |
| Duplicate prevention | IMPLEMENTED — unique email + upsert (re-subscribe reactivates) |
| Email notification to contacttheknnews@gmail.com | IMPLEMENTED + verified |
| Hindi confirmation message to subscriber (on-page) | IMPLEMENTED |
| Spam protection | IMPLEMENTED — honeypot + 5/min rate limit + regex validation |
| Admin subscriber management | IMPLEMENTED — list, count, ACTIVE/INACTIVE badge, remove |
| CSV export | IMPLEMENTED — `GET /admin/newsletter/export` (SUPER_ADMIN/EDITOR) → `kn-news-subscribers.csv` |
| Campaign sending (bulk email to subscribers) | NOT IMPLEMENTED — by design: export CSV → Mailchimp/Brevo |
| Public unsubscribe page/link | NOT IMPLEMENTED — RECOMMENDED before sending campaigns |
| Confirmation (double opt-in) email | NOT IMPLEMENTED |

---

# 15. CONTACT / ENQUIRY SYSTEM

All enquiries: stored in DB first → emailed to **contacttheknnews@gmail.com** → visible in **Admin → Inbox/Inquiries**.

### Contact Us (`/contact`) — IMPLEMENTED
Fields: Name*, Email*, Subject, Message* (no phone field). Honeypot + 3/min rate limit. → `ContactMessage` table + email (Reply-To = visitor). Serves as the channel for news tips, collaboration, and general enquiries via the Subject field.

### Advertise With Us (`/advertise`) — IMPLEMENTED
Fields: Name*, Company, Email*, Phone, Advertising requirement, Budget, Message. → `AdInquiry` table (status NEW → CONTACTED → CLOSED, updatable by AD_MANAGER/EDITOR) + email.

### News Tip form — NOT IMPLEMENTED
No dedicated form with location/attachment. RECOMMENDED: add a "खबर भेजें" form (name, contact, details, location, optional image upload) reusing the existing action + mailer pattern.

Contact details shown on Contact page & Footer (email `contacttheknnews@gmail.com`, phone/WhatsApp `+91 7607711590`) are DB-driven via Settings.

---

# 16. CRICKET SECTION

**"The KN Cricket"** hub at `/cricket` — IMPLEMENTED as an editorial module with 7 tabs:

| Tab | Content source |
|---|---|
| न्यूज़ (default) | Cricket-category articles (latest 12) |
| मैच रिपोर्ट | articles tagged `match-report` |
| सीरीज अपडेट | tag `series-update` |
| रिकॉर्ड्स | tag `cricket-records` + a hard-coded sample batting table |
| खिलाड़ी | tag `players` |
| विश्लेषण | tag `cricket-analysis` |
| क्विज़ | `CricketQuiz` client component — 5 hard-coded Hindi questions with scoring |

Cricket also appears as a homepage section and holds 8 of the 58 articles + real cricket videos.

**Live scores / scorecard integration — NOT IMPLEMENTED (deliberate placeholder).** The page renders a labeled box: "लाइव स्कोर आधिकारिक क्रिकेट डेटा API से जोड़े जाएंगे।" There is **no external API call, endpoint, key, or refresh logic anywhere in the codebase** — a future integration would slot into this placeholder. (Requested documentation of API/endpoint/auth/refresh therefore does not apply yet; see Roadmap Phase 6.)

---

# 17. PERFORMANCE

| Aspect | Status | Details |
|---|---|---|
| Image optimization | IMPLEMENTED (content) | All 58 article images pre-optimized 1200×675 WebP ~100 KB; video thumbs from YouTube CDN |
| `next/image` | PARTIAL | Used only for the logo (priority); content images are `<img loading="lazy" decoding="async">` |
| Lazy loading | IMPLEMENTED | All content imagery lazy; AdSense script `lazyOnload`; GA `afterInteractive` |
| Streaming/Suspense | PARTIAL | Hero + Latest stream with skeletons; 3 route-level `loading.tsx` skeletons |
| Caching / ISR | NOT IMPLEMENTED | Every public page is `force-dynamic`; each render hits SQLite directly (fast locally; revisit for production scale) |
| Static generation | PARTIAL | Legal/About/Advertise pages are static; news pages dynamic |
| Code splitting | IMPLEMENTED | App Router route-level splitting; client components are small islands |
| CDN | NOT IMPLEMENTED | Comes with hosting (e.g. Vercel edge) at deploy time |
| Fonts | IMPLEMENTED | next/font self-hosted subsets, `display: swap` |
| Core Web Vitals measurement | NOT IMPLEMENTED | GA hook exists; no field/lab monitoring configured |
| Mobile performance | IMPLEMENTED | Mobile-first Tailwind; marquee is CSS-only; no heavy JS libraries (zero icon/UI dependencies) |

**RECOMMENDED:** enable ISR (`revalidate`) for article/category pages after DB migration; adopt `next/image` for article imagery (add `images.remotePatterns` for `i.ytimg.com`); cache `getSettings()` (currently 2+ queries per render).

---

# 18. SECURITY

| Control | Status | Details |
|---|---|---|
| Authentication | IMPLEMENTED | Email+password → bcrypt (cost 12) verify → JWT (jose HS256, 7-day expiry) in `kn_session` cookie: **httpOnly, sameSite=lax, secure in production** |
| Middleware protection | IMPLEMENTED | `/admin/:path*` verified at the edge; invalid/missing token → login redirect |
| Authorization / RBAC | IMPLEMENTED | 6 roles; every server action + admin page re-checks roles server-side (`requireUser`); reporters cannot publish; only SUPER_ADMIN manages users |
| Audit log | IMPLEMENTED | 23 action types logged with user, detail, timestamp (log failures never break the main flow) |
| SQL injection | IMPLEMENTED | 100% Prisma parameterized queries; no raw SQL |
| XSS | PARTIAL | React auto-escaping everywhere; comments stored/rendered as plain text; **but** `Article.body` renders via `dangerouslySetInnerHTML` — safe only while admin users are trusted (no HTML sanitizer such as DOMPurify) |
| CSRF | IMPLEMENTED (framework) | Next.js Server Actions enforce same-origin POSTs; sameSite=lax cookie |
| Rate limiting | PARTIAL | In-memory sliding window on all public forms + admin login. Caveats: login bucket is **global** (10/min for everyone, not per-IP); in-memory store resets per instance (fine single-server, not serverless) |
| Spam protection | IMPLEMENTED | Honeypot fields on all public forms |
| File upload security | PARTIAL | Auth required, 5 MB cap, extension allow-list, server-generated filenames. Gaps: **no role check** (any logged-in role may upload), extension-only validation (no MIME sniffing), SVG uploads allowed (stored-XSS vector if untrusted users upload) |
| Secrets handling | IMPLEMENTED | All secrets in `.env` (gitignored); no secrets in code. ⚠️ `AUTH_SECRET` has a hardcoded dev fallback — **must be set in production** |
| Password policy | PARTIAL | Min 8 chars for new users; seeded accounts share `admin123` — **change before launch** |
| Input validation | IMPLEMENTED | Server-side validation + length caps on all public and admin form fields |
| Login UX hardening | IMPLEMENTED | Uniform error message (no user enumeration); inactive accounts blocked |

---

# 19. TECH STACK

Versions read from `package.json` (✱ = pinned exact).

| Technology | Version | Purpose / Where used |
|---|---|---|
| **Next.js** | 15.5.22 ✱ | Full-stack framework — App Router, Server Components, Server Actions, Turbopack dev/build |
| **React / React DOM** | 19.1.0 ✱ | UI runtime |
| **TypeScript** | ^5 | Entire codebase, `strict: true` |
| **Tailwind CSS** | ^4 (+ @tailwindcss/postcss) | Styling — CSS-first config via `@theme` in globals.css (no tailwind.config file) |
| **Prisma / @prisma/client** | ^6.19.3 | ORM + schema + seed; SQLite provider (dev) |
| **SQLite** | file `prisma/dev.db` | Development database (production target: PostgreSQL/MySQL) |
| **jose** | ^6.2.5 | JWT sign/verify for admin sessions (edge-compatible) |
| **bcryptjs** | ^3.0.3 | Password hashing (cost 12) |
| **nodemailer** | ^9.0.3 | SMTP email notifications (Gmail App Password) |
| **tsx** | ^4.23.1 (dev) | Runs the TypeScript seed script |
| **ESLint** | ^9 + eslint-config-next | Linting (`next/core-web-vitals`) |
| Fonts | Noto Sans Devanagari + Inter | via next/font/google (self-hosted) |
| Google Analytics | gtag.js | Loaded only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` set |
| Google AdSense | adsbygoogle.js | Loaded only when publisher ID set (+ Auto Ads flag) |
| Hosting / CDN | — | NOT YET DEPLOYED (Vercel recommended) |
| Image storage | Local `public/uploads/` | No cloud object storage |
| External APIs | None | Cricket live-score integration is a placeholder |
| Icon/UI libraries | None | 22 hand-written inline SVG icons — zero UI dependencies |

Scripts: `dev` / `build` (Turbopack), `start`, `lint`, `db:push`, `db:seed`, `db:reset`, `images:generate`.

---

# 20. PROJECT FILE STRUCTURE

```text
the-kn-news/
├── .env                        # Secrets (gitignored) — DB, auth, SMTP, AdSense, GA
├── package.json                # Dependencies & scripts
├── next.config.ts              # Next.js config (currently empty defaults)
├── tsconfig.json               # strict TS, @/* → ./src/*
├── eslint.config.mjs           # next/core-web-vitals flat config
├── postcss.config.mjs          # Tailwind v4 PostCSS plugin
├── README.md                   # Quick start + feature overview
├── DOCUMENTATION.md            # ← this file
├── prisma/
│   ├── schema.prisma           # 17 models (see §8) — SAFE TO MODIFY with db:push
│   ├── seed.ts                 # Idempotent demo/seed data (users, 58 articles, videos…)
│   └── dev.db                  # SQLite dev database (do not commit/deploy)
├── scripts/
│   └── generate-sample-images.mjs  # Regenerates placeholder SVGs (dev only)
├── public/
│   ├── images/logo.jpg         # Brand logo (header/footer/JSON-LD)
│   ├── images/sample/          # 52 dev placeholder SVGs (authors/ads/galleries still use some)
│   └── uploads/                # 58 real article images + admin uploads
└── src/
    ├── middleware.ts           # JWT gate for /admin/* — CAUTION when modifying
    ├── lib/                    # Server-side core — high blast radius, modify carefully
    │   ├── constants.ts        # SITE brand + social, NAV_ITEMS, ROLES, AD_PLACEMENTS
    │   ├── db.ts               # Prisma singleton
    │   ├── auth.ts             # JWT sessions, requireUser RBAC, logActivity
    │   ├── data.ts             # All public data queries (publishedWhere, getFeatured…)
    │   ├── mailer.ts           # SMTP notifications to NOTIFY_EMAIL
    │   ├── rate-limit.ts       # In-memory rate limiter
    │   └── utils.ts            # Hindi date/number formatting, slugify, truncate
    ├── app/
    │   ├── layout.tsx          # Root: fonts, metadata, JSON-LD, GA/AdSense scripts
    │   ├── globals.css         # Tailwind v4 @theme brand tokens + custom classes
    │   ├── not-found.tsx       # Branded Hindi 404
    │   ├── sitemap.ts / robots.ts / news-sitemap.xml/route.ts   # SEO endpoints
    │   ├── actions/public.ts   # Public server actions (newsletter/comment/contact/ads)
    │   ├── api/
    │   │   ├── admin/upload/route.ts   # Media upload (5MB, ext allow-list)
    │   │   └── ads/[id]/click/route.ts # Ad click tracking redirect
    │   ├── (public)/           # Reader-facing routes (see §3) + colocated client forms
    │   └── admin/              # CMS: 18 sections + actions.ts (all server actions)
    └── components/
        ├── layout/             # SiteHeader, NavBar, BreakingTicker, Footer
        ├── news/               # NewsCard variants, homepage Sections
        ├── article/            # Comments, ShareButtons
        ├── ads/                # AdSlot (server) + AdSenseAd (client)
        ├── sidebar/Sidebar.tsx # Trending/MostRead/Newsletter boxes
        ├── ui/Skeletons.tsx    # Loading skeletons
        ├── icons.tsx           # 22 inline SVG icons + SOCIAL_ICONS map
        ├── NewsletterForm.tsx  # Subscribe form
        └── StaticPage.tsx      # Shell for legal/info pages
```

**Safe to modify freely:** components, public pages, seed data, styles.
**Modify with care (site-wide impact):** `lib/*`, `middleware.ts`, `admin/actions.ts`, `schema.prisma`, root `layout.tsx`.
**Never commit/deploy:** `.env`, `prisma/dev.db`, `node_modules`, `.next`.

---

# 21. ENVIRONMENT VARIABLES

| Variable | Required | Env | Purpose |
|---|---|---|---|
| `DATABASE_URL` | **Required** | dev + prod | Prisma connection string (dev: `file:./dev.db`; prod: Postgres/MySQL URL) |
| `AUTH_SECRET` | **Required (prod)** | dev + prod | JWT signing secret. ⚠️ Falls back to a known dev string — a production deployment without this is insecure |
| `NEXT_PUBLIC_SITE_URL` | **Required (prod)** | dev + prod | Canonical origin for metadata, sitemaps, JSON-LD (dev fallback: localhost:3000) |
| `SMTP_HOST` | Required for email | dev + prod | `smtp.gmail.com` |
| `SMTP_PORT` | Optional (default 465) | dev + prod | SMTP port |
| `SMTP_USER` | Required for email | dev + prod | Sending Gmail account |
| `SMTP_PASS` | Required for email | dev + prod | Gmail **App Password** (never a normal password; secret) |
| `NOTIFY_EMAIL` | Optional | dev + prod | Notification recipient (default `contacttheknnews@gmail.com`) |
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` | Optional | prod | AdSense `ca-pub-…` id; empty → placeholders render |
| `NEXT_PUBLIC_ADSENSE_AUTO_ADS` | Optional | prod | `"true"` enables site-wide Auto Ads script |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional | prod | Google Analytics `G-…` id; empty → no GA |

Notes: `.env` is gitignored; `NEXT_PUBLIC_*` values are embedded client-side at build time (never put secrets in them); hosting platforms need all of these configured separately since `.env` is not deployed.

---

# 22. API DOCUMENTATION

The site is server-rendered; most mutations are **Next.js Server Actions** (same-origin POSTs, not REST endpoints). Three HTTP routes exist:

### `POST /api/admin/upload`
| | |
|---|---|
| Auth | Session cookie required (401 otherwise). ⚠️ No role restriction |
| Body | `multipart/form-data`, field `file` |
| Rules | ≤ 5 MB; extensions .jpg .jpeg .png .webp .svg .gif; filename regenerated server-side |
| Success | `{ "ok": true, "url": "/uploads/<name>" }` |
| Errors | 400 (no file / too big / bad type, Hindi messages), 401 |
| DB | none (filesystem write) |

### `GET /api/ads/[id]/click`
Public. Increments `Advertisement.clicks` (errors swallowed) → 302 redirect to the ad's target URL; invalid id → redirect `/`. No rate limit.

### `GET /admin/newsletter/export`
Auth: session + role SUPER_ADMIN/EDITOR (401 otherwise). Returns `text/csv` attachment `kn-news-subscribers.csv` (`email,subscribed_at,active`).

### Server Actions (for completeness)
**Public** (`src/app/actions/public.ts`, all rate-limited + honeypot): `subscribeNewsletter` (5/min), `submitComment` (5/min → PENDING moderation), `likeComment` & `reportComment` (3/min), `submitContact` (3/min), `submitAdInquiry` (3/min). Return `{ ok, message }` (Hindi).
**Admin** (`src/app/admin/actions.ts`, 24 actions): login/logout, saveArticle/deleteArticle, saveBreaking/deleteBreaking/toggleBreaking, saveCategory/deleteCategory (blocked while articles exist), deleteTag, saveAuthor/deleteAuthor (blocked while articles exist), moderateComment, removeSubscriber, saveAd/deleteAd, saveVideo/deleteVideo, saveGallery/deleteGallery, saveUser/deleteUser (self-delete blocked), saveSettings, updateInquiryStatus — each role-guarded per §7.2 and audit-logged.

**NOT IMPLEMENTED:** public JSON/REST API, GraphQL, webhooks, API keys/rate-limited external access.

---

# 23. DEPLOYMENT

**Current state: NOT DEPLOYED — runs locally.** No CI/CD, Dockerfile, or hosting configuration exists yet.

### Local development (IMPLEMENTED)
```bash
npm install
npm run db:push      # create SQLite schema
npm run db:seed      # seed demo content (idempotent)
npm run dev          # http://localhost:3000  (Turbopack)
```
Build check: `npm run build` then `npm run start`.

### RECOMMENDED production path (Vercel + hosted Postgres)

1. **Database migration (critical):** SQLite files don't work on serverless hosts. Provision PostgreSQL (Neon/Supabase/Vercel Postgres) → change `provider = "postgresql"` in `schema.prisma` → set `DATABASE_URL` → `prisma db push` (or adopt `prisma migrate` for history) → re-run seed or import real content.
2. **Environment:** set every variable from §21 in the host dashboard; generate a strong random `AUTH_SECRET`; set `NEXT_PUBLIC_SITE_URL=https://theknnews.com`.
3. **Uploads storage:** serverless filesystems are ephemeral — move `public/uploads` to object storage (Vercel Blob / S3 / Cloudinary) or deploy on a VPS with a persistent disk. Until changed, the upload API writes to local disk.
4. **Domain/SSL/DNS:** point the domain to the host; SSL is automatic on Vercel; add a `www` redirect.
5. **Go-live checklist:** change all seeded passwords; remove demo credentials note from the login page; verify robots/sitemaps under the real domain; submit sitemaps in Google Search Console; request AdSense review.
6. **Rollback:** Vercel keeps previous immutable deployments (instant rollback). With `prisma migrate`, schema rollbacks are explicit migrations; keep DB backups (§28) before destructive changes.

---

# 24. TESTING

**Current state: NO automated tests exist** (no test framework installed, no CI). Verification so far has been manual + HTTP-level checks during development (forms, email delivery, image rendering were verified live in this build).

### RECOMMENDED production test checklist

**Functional** — ☐ login for all 6 roles; ☐ reporter cannot publish (forced draft); ☐ article create/edit/schedule/delete; ☐ scheduled article appears after its time; ☐ breaking ticker windowing; ☐ category/subcategory browsing; ☐ comment submit → moderate → appears; ☐ newsletter subscribe/duplicate/remove/export; ☐ contact + advertise forms (DB row + email at contacttheknnews@gmail.com); ☐ ad impression/click counters; ☐ video player; ☐ gallery lightbox (keys: ←/→/Esc); ☐ search filters + pagination.
**Mobile** — ☐ drawer nav + search; ☐ 1-col layouts; ☐ ticker; ☐ mobile ad creatives; ☐ tap targets.
**SEO** — ☐ `/sitemap.xml`, `/news-sitemap.xml`, `/robots.txt` under production domain; ☐ Rich Results test on an article (NewsArticle + Breadcrumb); ☐ OG preview in WhatsApp/Facebook debugger.
**Security** — ☐ `/admin` redirects when logged out; ☐ role escalation attempts blocked (direct URL + action calls); ☐ AUTH_SECRET set (no dev fallback); ☐ seeded passwords changed; ☐ upload rejects >5 MB and wrong types.
**Performance** — ☐ Lighthouse mobile ≥ 90 on home/article; ☐ image weights; ☐ DB latency after migration.
**Email** — ☐ all three notification types arrive; ☐ Reply-To works; ☐ graceful behavior with SMTP unset.

---

# 25. ERROR HANDLING

| Scenario | Behavior | Status |
|---|---|---|
| 404 (unknown route/article/category/gallery) | Branded Hindi 404 page (`not-found.tsx`) with links home/latest; data pages call `notFound()` | IMPLEMENTED |
| Loading states | Route-level skeletons (home, category, article) + Suspense skeletons | IMPLEMENTED |
| 500 / render errors | **No `error.tsx`/`global-error.tsx`** — unhandled errors show Next's default error screen | NOT IMPLEMENTED — recommended branded error boundary |
| Form errors | Server actions return Hindi `{ ok:false, message }`; rendered inline via `useActionState` | IMPLEMENTED |
| Email failure | Logged server-side; visitor unaffected; submission preserved in DB | IMPLEMENTED |
| Ad/click failures, view/impression counters | Fire-and-forget with `.catch(()=>{})` — never break the page | IMPLEMENTED |
| Empty states | Every section hides when empty; lists show Hindi empty messages | IMPLEMENTED |
| Auth errors | Middleware redirect to login; role denial → `/admin?denied=1`; uniform login error message | IMPLEMENTED |
| Image load failures | No `onerror` fallback — broken path renders a broken image | NOT IMPLEMENTED (minor) |
| Admin visibility of issues | Inquiries/comments/activity in CMS; server logs for mailer/DB warnings | IMPLEMENTED |

---

# 26. CURRENT ISSUES / TODO

### 🔴 Critical (must fix before production)
1. **SQLite + local uploads are not production-viable on serverless hosts** — migrate DB to PostgreSQL/MySQL and uploads to object storage (§23).
2. **Seeded passwords** — every account uses `admin123`, and the login page displays demo credentials. Change passwords + remove the hint.
3. **`AUTH_SECRET` dev fallback** — a deployment that forgets this env var silently signs sessions with a publicly known string.

### 🟠 High priority
4. Author photos (6) still sample SVGs — replace with real team photos.
5. Photo galleries (14 images) still sample SVGs.
6. Favicon still the Next.js default; no default OG share image (1200×630).
7. Logo master file carries a "KK TIME" watermark.
8. Upload API lacks a role check (any logged-in role can upload) and accepts SVG (stored-XSS vector) with extension-only validation.
9. Admin-login rate limit is one global bucket (10/min for all IPs combined) — make it per-IP.
10. No `error.tsx` boundary — unstyled 500s.

### 🟡 Medium priority
11. `getSettings()` uncached — Header+Footer each query per request; wrap in `React.cache`/`unstable_cache`.
12. All public pages `force-dynamic` — no ISR/HTTP caching; fine now, costly at scale.
13. Article `views` increments on every render (bots/refreshes inflate trending) — dedupe or sample.
14. In-memory rate limiter resets per instance — move to DB/Redis when serverless.
15. `/videos` unpaginated (fine at 30; add pagination as the library grows).
16. `slugify()` strips Devanagari — Hindi-titled articles silently fall back to `khabar-<timestamp>` unless a manual slug is entered.
17. Newsletter CSV lacks field escaping; comments admin caps at 100 with no pagination.
18. `next` redirect param after login is ignored (always lands on `/admin`).

### 🟢 Low priority
19. README quick-start omits the `npm run dev` line; About page retains a large commented-out old version.
20. Trending/Most-Read have no "view all" pages; tag/author archive pages don't exist.
21. `business-02` and `entertainment-01` images are the weakest of the 58 — candidates for re-pick.
22. Some deletes (`toggleBreaking`, `deleteTag`, `deleteVideo`, `deleteGallery`, `updateInquiryStatus`, uploads) skip the activity log.

### 🔵 Not implemented (future features)
Cricket live-score API · rich-text/WYSIWYG editor (body is raw HTML in a textarea) · newsletter campaign sending + unsubscribe + double opt-in · dedicated News-Tip form with attachments · RSS feed · PWA/push notifications · author & tag archive pages · sponsored-content article flag · media deletion in the library · first-party analytics dashboard.

---

# 27. PRODUCTION READINESS REPORT

| Area | Rating | Notes |
|---|---|---|
| Frontend (public site) | **Ready** | Complete, responsive, Hindi-first, real content & images |
| Admin CMS | **Ready** | 18 sections, full workflows, audit log |
| Backend (actions/data layer) | **Ready** | Clean server-action architecture, validation, rate limits |
| Database | **Needs Improvement** | Schema is production-grade; SQLite engine + `db push` workflow must migrate for hosting |
| Security | **Needs Improvement** | Solid auth/RBAC foundation; fix passwords, AUTH_SECRET, upload gaps first |
| SEO | **Ready** (minor gaps) | Sitemaps, news sitemap, JSON-LD, canonicals; add OG image + favicon |
| Performance | **Needs Improvement** | Fast today; no caching story for scale |
| Email & enquiries | **Ready** | Verified end-to-end with reliability fallback |
| Advertising | **Ready** (direct) / **Needs config** (AdSense awaits account approval) |
| Mobile responsiveness | **Ready** | Mobile-first throughout |
| Accessibility | **Needs Improvement** | Semantic HTML, aria-labels, alt text present; no focus trap in drawer, no skip links, not audited |
| Analytics | **Needs config** | GA wiring complete; needs a Measurement ID |
| Deployment | **Not Implemented** | No hosting/CI yet — see §23 |
| Testing | **Not Implemented** | Manual only; no automated suite |

**Overall: the application is feature-complete; the path to production is an infrastructure task** (DB migration, storage, secrets, hosting) plus the security checklist — not a rebuild.

---

# 28. BACKUP & RECOVERY

**Current state:** development-grade. Source of truth = local files + `prisma/dev.db`. No automated backups exist (NOT IMPLEMENTED).

| Asset | Today | RECOMMENDED (production) |
|---|---|---|
| Database | Copy `prisma/dev.db` file manually | Managed Postgres with daily automated snapshots + PITR (Neon/Supabase include this); weekly `pg_dump` to separate storage |
| Media (`public/uploads`) | Part of project folder | Object storage (S3/Blob) with versioning; periodic sync to second bucket |
| Source code | Local git repo | Push to private GitHub — becomes both backup and deploy source |
| Environment variables | `.env` on one machine | Store a copy in a password manager (never in git/docs); hosting dashboards keep prod values |
| Recovery process | Restore file copies | Documented runbook: restore DB snapshot → redeploy last good build (host keeps immutable deployments) → verify checklist (§24) |
| Disaster recovery | — | RTO target < 1 h with managed services; test a restore quarterly |

---

# 29. BUSINESS & MONETIZATION

| Stream | Status | Where it lives |
|---|---|---|
| **Direct display advertising** | IMPLEMENTED | 11 placements site-wide; Admin → Advertisements (creatives, scheduling, impression/click reporting); rate enquiries via `/advertise` form → AdInquiry pipeline (NEW→CONTACTED→CLOSED) |
| **Google AdSense** | PARTIALLY IMPLEMENTED | Full component + fallback chain ready; activates with publisher ID after account approval |
| **Advertise With Us funnel** | IMPLEMENTED | `/advertise` page (offerings incl. social-media promotion package) + form + email notification |
| **Social media promotion** | IMPLEMENTED (offering) | Listed on `/advertise`: promotion across FB/IG/YT/X/TG/WA channels |
| **Newsletter audience** | IMPLEMENTED (asset) | Subscriber capture + CSV export; sponsorship/campaigns NOT IMPLEMENTED yet |
| **Sponsored content** | NOT IMPLEMENTED | Needs a `sponsored` article flag + labeling policy |
| **Brand partnerships / premium services** | NOT IMPLEMENTED | Future scope (Phase 3+) |

---

# 30. FUTURE ROADMAP

**Phase 1 — Production stability:** Postgres migration · object storage for uploads · hosting + domain + SSL · strong secrets & password rotation · error boundary · backups · Search Console.
**Phase 2 — SEO & audience growth:** default OG image + favicon · ISR caching · RSS feed · author/tag archive pages · Core Web Vitals monitoring · consistent publishing cadence · newsletter double opt-in + unsubscribe.
**Phase 3 — Monetization:** AdSense approval & activation · direct-ad rate card · sponsored-content system · newsletter sponsorship slots.
**Phase 4 — Mobile app:** PWA first (manifest + offline shell) — the API-less server-rendered design would need a JSON API layer for a native app.
**Phase 5 — Push notifications:** Web Push for breaking news (service worker + subscription storage + admin send UI).
**Phase 6 — Advanced cricket platform:** integrate a licensed cricket data API into the existing placeholder (live scorecards, series pages, player stats), expand quiz & records from DB.
**Phase 7 — AI-assisted editorial:** headline/SEO suggestions, Hindi grammar assistance, auto social-post drafts, related-article intelligence.
**Phase 8 — Regional expansion:** district-level editions (subcategory structure already supports it), stringer/reporter onboarding (REPORTER role ready), possible multi-language support.

---

# 31. FINAL PROJECT SUMMARY

**The KN News** is a complete, Hindi-first digital news platform for Ghazipur/UP and national coverage — a reader-facing news site plus a professional 6-role CMS, built on a modern stack (Next.js 15, React 19, TypeScript, Tailwind 4, Prisma).

**Completed and working today:** full article lifecycle (draft→scheduled→published) · 13 categories + UP district subcategories · breaking ticker · 58 published articles with real licensed photographs and credits · 30 real videos from the official YouTube channel · photo galleries · moderated comments · trending/most-read · full search · newsletter capture with CSV export · contact & advertising enquiry pipelines with verified email notifications to contacttheknnews@gmail.com · 11-slot ad server with tracking + AdSense-ready fallback · strong SEO (news sitemap, JSON-LD, canonicals) · unified brand & social identity · audit-logged RBAC admin.

**Needs improvement before launch:** production database + file storage, secrets & password hygiene, favicon/OG image/author photos/gallery images, upload hardening, error boundary.

**Not yet implemented:** deployment/CI, automated tests, cricket live scores, newsletter campaigns/unsubscribe, RSS/PWA/push, rich-text editor, sponsored-content flag.

**Production readiness:** feature-complete application; remaining work is infrastructure + hardening (est. the shortest path to launch is: managed Postgres + Vercel + object storage + the §24 checklist).

**Recommended next steps (in order):**
1. Migrate to PostgreSQL and move uploads to object storage.
2. Deploy to hosting with real domain, strong `AUTH_SECRET`, rotated admin passwords.
3. Replace favicon, add OG image, real author photos, clean logo master.
4. Run the production test checklist (§24); submit sitemaps to Search Console.
5. Apply for AdSense; begin the Phase 2 growth roadmap.

*— End of documentation —*
