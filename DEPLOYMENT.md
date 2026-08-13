# The KN News — Deployment Runbook (Vercel + Hostinger Domain)

Follow these steps in order. Steps marked **[YOU]** need your accounts and can only be done by you; everything else is already prepared in the codebase.

---

## Step 0 — What is already done in the code

- ✅ Production build passes (`npm run build`).
- ✅ `prisma generate` runs automatically on install/build (required by Vercel).
- ✅ Security: demo credentials removed from login page, per-IP login rate limit, upload API role-locked + SVG uploads blocked + MIME checks, production refuses to boot without a real `AUTH_SECRET`, security headers (X-Frame-Options, nosniff, referrer policy).
- ✅ Branded error page (`error.tsx`) + Hindi 404.
- ✅ Real favicon + default social-share image (`/images/og-image.png`) wired into metadata.
- ✅ All 58 article images live in `public/uploads/` (deployed as static files with the app).
- ✅ `scripts/production-content/setup-content.cjs` recreates the full content set (30 real videos + 58 image assignments with photo credits) in any fresh database.
- ✅ `.env.example` documents every variable.

---

## Step 1 — [YOU] Create the production database (~5 min)

SQLite does not work on Vercel — you need hosted PostgreSQL. Easiest options (both have free tiers):

- **Neon** (recommended): https://neon.tech → New Project (region: Singapore `ap-southeast-1` is closest to India) → copy the **connection string** (`postgresql://...sslmode=require`).
- Or **Vercel Postgres/Marketplace** from the Vercel dashboard.

## Step 2 — Switch Prisma to PostgreSQL (1 line)

In `prisma/schema.prisma` change:

```prisma
datasource db {
  provider = "sqlite"      →  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then point `.env`'s `DATABASE_URL` at the Neon string and initialize the database **from your machine**:

```bash
npm run db:push
npm run db:seed
node scripts/production-content/setup-content.cjs
```

This gives production the same content you have locally: 13 categories + UP districts, 58 articles with real images & credits, 30 channel videos, breaking news, settings (contact + social links), and the admin accounts.

> Local development can keep using the same Neon database afterwards, or you can revert the provider line locally and keep `dev.db` — but remember the provider must be `postgresql` in the deployed repo.

## Step 3 — [YOU] Push the repo to GitHub

```bash
git init            # if not already a repo with commits
git add -A
git commit -m "Production-ready The KN News"
git remote add origin https://github.com/<your-username>/the-kn-news.git
git push -u origin master
```

`.env` is gitignored — it will NOT be uploaded (correct). `prisma/dev.db` is gitignored
going forward, but if it was committed by an earlier version of this repo, untrack it:

```bash
git rm --cached prisma/dev.db
```

## Step 4 — [YOU] Import into Vercel

1. https://vercel.com → **Add New → Project** → import the GitHub repo.
2. Framework preset: **Next.js** (auto-detected). Build command and output: leave defaults (`npm run build` already includes `prisma generate`).
3. **Environment Variables** — add all of these (Production + Preview):

| Name | Value |
|---|---|
| `DATABASE_URL` | your Neon connection string |
| `AUTH_SECRET` | a NEW long random string — generate with `openssl rand -base64 32` (do NOT reuse the dev one) |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` (your real domain, no trailing slash) |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `contacttheknnews@gmail.com` |
| `SMTP_PASS` | the Gmail App Password (from your local `.env`) |
| `NOTIFY_EMAIL` | `contacttheknnews@gmail.com` |
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` | leave empty until AdSense approval |
| `NEXT_PUBLIC_ADSENSE_AUTO_ADS` | `false` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | your GA4 id, or leave empty |

4. **Deploy.** First build takes ~2 minutes. You get a `*.vercel.app` URL — verify the site works there before touching DNS.

## Step 5 — [YOU] Connect the Hostinger domain

**In Vercel:** Project → Settings → **Domains** → Add → enter `yourdomain.com` and `www.yourdomain.com`. Vercel shows you the DNS records it needs.

**In Hostinger:** hPanel → Domains → your domain → **DNS / Name Servers → DNS records**, then:

| Type | Name | Value |
|---|---|---|
| A | `@` | `76.76.21.21` (Vercel's IP — use the value Vercel shows you) |
| CNAME | `www` | `cname.vercel-dns.com` |

Delete any old A/CNAME records for `@` and `www` that point to Hostinger parking/hosting. DNS propagation: minutes to a few hours. Vercel then issues SSL automatically (https works with no extra steps). Set `yourdomain.com` as the primary domain in Vercel (www redirects automatically).

> Alternative: in Hostinger change the **nameservers** to `ns1.vercel-dns.com` / `ns2.vercel-dns.com` and manage DNS in Vercel — do this only if you don't use Hostinger for email on this domain.

## Step 6 — Immediately after going live

1. **Change all admin passwords** — log in at `https://yourdomain.com/admin` as `admin@theknnews.com` (seeded password) → Users & Roles → set strong unique passwords for all 5 accounts. This is the top security item.
2. Verify: homepage, an article page, `/cricket`, `/videos`, `/photos`, `/search?q=क्रिकेट`, `/sitemap.xml`, `/news-sitemap.xml`, `/robots.txt`.
3. Submit both sitemaps in **Google Search Console** (add the domain property, verify via DNS TXT record in Hostinger).
4. Test the contact form and confirm the email arrives at contacttheknnews@gmail.com.
5. Share a link on WhatsApp — the branded OG image should appear.

---

## Media uploads in production (Vercel Blob)

Admin uploads (Admin → Media Library) now use **Vercel Blob** in production — the
serverless filesystem is read-only, so files are stored in Blob object storage
instead. Locally (no token set) uploads still go to `public/uploads/` on disk.

One-time setup so uploads work on the live site:

1. Vercel dashboard → your project → **Storage** tab → **Create Database → Blob** → create a store (Hobby tier is free).
2. Connect the store to the project when prompted — this automatically adds the `BLOB_READ_WRITE_TOKEN` environment variable to Production/Preview.
3. Redeploy (or push any commit). Uploads from Admin → Media Library now persist permanently and appear under "Uploads (Cloud Storage)".

The 58 shipped article images in `public/uploads/` are unaffected (static files deployed with the app).

## Empty category/author dropdowns in Add News

An article requires a Category and an Author. On a fresh database both tables are
empty, so the Add News form cannot be submitted. Seed the structural data (13 nav
categories + UP districts + the editor author profile — no sample articles):

```bash
node --env-file=.env scripts/setup-base-data.mjs
```

Idempotent — safe to run against production. (Already run against the live Neon DB on 2026-08-03.)

## Locked out of `/admin`

Login checks the `User` table in `DATABASE_URL`. If that table is empty — the usual
cause is running `db:push` without `db:seed` — no email/password can ever work, and
the login page just repeats "ईमेल या पासवर्ड गलत है।".

Point `.env` at the **production** `DATABASE_URL`, then:

```bash
node --env-file=.env scripts/create-admin.mjs --list
```

If it reports no accounts, create one (password is prompted for, never typed as an
argument, and the same command resets the password of an existing account):

```bash
node --env-file=.env scripts/create-admin.mjs you@example.com "Your Name"
```

## Rollback

Vercel keeps every previous deployment — Project → Deployments → ⋯ → **Promote to Production** instantly restores the prior version. Database changes are separate; Neon has point-in-time restore on paid tiers and you can `pg_dump` before risky changes.
