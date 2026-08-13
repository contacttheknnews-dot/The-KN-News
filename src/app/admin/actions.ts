"use server";

// Admin server actions. Every mutating action re-checks the session and role
// on the server (middleware alone is not trusted).

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import {
  createSession,
  destroySession,
  getSession,
  requireUser,
  logActivity,
} from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { slugify, dateFromISTInput } from "@/lib/utils";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import type { Role } from "@/lib/constants";

export type AdminActionResult = { ok: boolean; message: string; id?: number };

/* ------------------------------ Auth ------------------------------ */

export async function login(
  _prev: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  if (!rateLimit(`admin-login:${ip}`, 10, 60_000)) {
    return { ok: false, message: "Too many attempts. Try again in a minute." };
  }
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) {
    return { ok: false, message: "ईमेल या पासवर्ड गलत है।" };
  }
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
  });
  await logActivity(user.id, "LOGIN");
  redirect("/admin");
}

export async function logout() {
  const session = await getSession();
  if (session) await logActivity(session.id, "LOGOUT");
  await destroySession();
  redirect("/admin/login");
}

/* ---------------------------- Articles ---------------------------- */

const ARTICLE_ROLES: Role[] = ["EDITOR", "REPORTER", "AUTHOR"];

export async function saveArticle(
  _prev: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  const user = await requireUser(ARTICLE_ROLES);
  const id = Number(formData.get("id")) || null;

  const title = String(formData.get("title") || "").trim();
  if (!title) return { ok: false, message: "Headline आवश्यक है।" };
  let slug = String(formData.get("slug") || "").trim() || slugify(title);
  slug = slugify(slug) || slug;

  // Whitelist the status — never trust a raw form value against the DB.
  const statusRaw = String(formData.get("status") || "DRAFT");
  const ARTICLE_STATUSES = ["DRAFT", "PUBLISHED", "SCHEDULED"];
  const validStatus = ARTICLE_STATUSES.includes(statusRaw) ? statusRaw : "DRAFT";
  // Reporters submit for review — they cannot publish directly.
  const status =
    user.role === "REPORTER" && validStatus !== "DRAFT" ? "DRAFT" : validStatus;

  const publishDate = String(formData.get("publishDate") || "");
  const publishTime = String(formData.get("publishTime") || "00:00");
  let publishedAt: Date | null = null;
  if (publishDate) {
    const parsed = dateFromISTInput(publishDate, publishTime);
    if (!parsed) {
      return { ok: false, message: "प्रकाशन तिथि/समय अमान्य है।" };
    }
    publishedAt = parsed;
  } else if (status !== "DRAFT") {
    publishedAt = new Date();
  }

  const data = {
    title,
    slug,
    subheadline: String(formData.get("subheadline") || "").trim() || null,
    excerpt: String(formData.get("excerpt") || "").trim(),
    body: sanitizeArticleHtml(String(formData.get("body") || "")),
    image: String(formData.get("image") || "").trim() || "/images/sample/desh-1.svg",
    imageCaption: String(formData.get("imageCaption") || "").trim() || null,
    categoryId: Number(formData.get("categoryId")),
    subcategoryId: Number(formData.get("subcategoryId")) || null,
    authorId: Number(formData.get("authorId")),
    location: String(formData.get("location") || "").trim() || null,
    status,
    publishedAt,
    featured: formData.get("featured") === "on",
    isOpinion: formData.get("isOpinion") === "on",
    seoTitle: String(formData.get("seoTitle") || "").trim() || null,
    metaDescription: String(formData.get("metaDescription") || "").trim() || null,
    focusKeyword: String(formData.get("focusKeyword") || "").trim() || null,
    canonicalUrl: String(formData.get("canonicalUrl") || "").trim() || null,
    socialImage: String(formData.get("socialImage") || "").trim() || null,
    editorNotes: String(formData.get("editorNotes") || "").trim() || null,
  };

  if (!data.excerpt) return { ok: false, message: "Short description आवश्यक है।" };
  if (!data.body.trim()) return { ok: false, message: "Article body आवश्यक है।" };
  if (!data.categoryId) return { ok: false, message: "Category चुनें।" };
  if (!data.authorId) return { ok: false, message: "Author चुनें।" };

  // unique slug check
  const clash = await prisma.article.findFirst({
    where: { slug, ...(id ? { id: { not: id } } : {}) },
  });
  if (clash) return { ok: false, message: `Slug "${slug}" पहले से मौजूद है।` };

  // Dedupe tags by slug so two inputs that slugify the same ("Cricket",
  // "cricket") can't cause a duplicate-key error on the join row.
  const tagPairs = Array.from(
    new Map(
      String(formData.get("tags") || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 15)
        .map((name) => [slugify(name) || name.toLowerCase(), name] as const)
    ).entries()
  ).map(([tagSlug, name]) => ({ tagSlug, name }));

  // Snapshot the outgoing version (best-effort) so edits can be rolled back.
  if (id) {
    const prev = await prisma.article.findUnique({ where: { id } });
    if (
      prev &&
      (prev.body !== data.body ||
        prev.title !== data.title ||
        prev.excerpt !== data.excerpt ||
        prev.subheadline !== data.subheadline)
    ) {
      try {
        await prisma.articleRevision.create({
          data: {
            articleId: id,
            title: prev.title,
            subheadline: prev.subheadline,
            excerpt: prev.excerpt,
            body: prev.body,
            savedBy: user.name,
          },
        });
        // keep the 20 most recent revisions per article
        const stale = await prisma.articleRevision.findMany({
          where: { articleId: id },
          orderBy: { createdAt: "desc" },
          skip: 20,
          select: { id: true },
        });
        if (stale.length) {
          await prisma.articleRevision.deleteMany({
            where: { id: { in: stale.map((r) => r.id) } },
          });
        }
      } catch {
        // revision table not migrated yet — never block a save on history
      }
    }
  }

  // Write the article and re-sync its tags atomically: a mid-way failure must
  // never leave the article saved with its tags wiped.
  let articleId: number;
  try {
    articleId = await prisma.$transaction(async (tx) => {
      let aid: number;
      if (id) {
        await tx.article.update({ where: { id }, data });
        await tx.articleTag.deleteMany({ where: { articleId: id } });
        aid = id;
      } else {
        const created = await tx.article.create({ data });
        aid = created.id;
      }
      for (const { name, tagSlug } of tagPairs) {
        const tag = await tx.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name, slug: tagSlug },
        });
        await tx.articleTag.createMany({
          data: [{ articleId: aid, tagId: tag.id }],
          skipDuplicates: true,
        });
      }
      return aid;
    });
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "P2002") {
      return { ok: false, message: `Slug "${slug}" पहले से मौजूद है।` };
    }
    if (code === "P2003") {
      return { ok: false, message: "चयनित Category या Author मौजूद नहीं है।" };
    }
    console.error("saveArticle failed:", e);
    return { ok: false, message: "लेख सेव करने में समस्या हुई। कृपया दोबारा कोशिश करें।" };
  }

  await logActivity(user.id, id ? "ARTICLE_UPDATE" : "ARTICLE_CREATE", `#${articleId} ${title}`);
  revalidatePath("/");
  revalidatePath(`/news/${slug}`);
  return { ok: true, message: id ? "लेख अपडेट हो गया।" : "लेख सेव हो गया।", id: articleId };
}

export async function deleteArticle(id: number): Promise<void> {
  const user = await requireUser(["EDITOR"]);
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return;
  await prisma.article.delete({ where: { id } });
  await logActivity(user.id, "ARTICLE_DELETE", `#${id} ${article.title}`);
  revalidatePath("/admin/articles");
  revalidatePath("/");
}

// Background autosave from the editor. Only DRAFT articles are touched, so a
// half-written edit can never silently reach the live site. Unlike other
// actions this never redirects — an expired session must not hijack the
// writer's tab mid-sentence (the local backup still protects their text).
export async function autosaveArticle(
  id: number,
  fields: { title: string; subheadline: string; excerpt: string; body: string }
): Promise<AdminActionResult> {
  const session = await getSession();
  if (
    !session ||
    (session.role !== "SUPER_ADMIN" && !ARTICLE_ROLES.includes(session.role))
  ) {
    return { ok: false, message: "Session expire हो गया — काम localStorage backup में सुरक्षित है।" };
  }
  const article = await prisma.article.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!article) return { ok: false, message: "Article not found" };
  if (article.status !== "DRAFT") {
    return { ok: false, message: "Autosave केवल draft के लिए है।" };
  }
  await prisma.article.update({
    where: { id },
    data: {
      title: fields.title.trim() || "Untitled",
      subheadline: fields.subheadline.trim() || null,
      excerpt: fields.excerpt.trim(),
      body: sanitizeArticleHtml(fields.body),
    },
  });
  return { ok: true, message: "Autosaved" };
}

export async function duplicateArticle(id: number): Promise<AdminActionResult> {
  const user = await requireUser(ARTICLE_ROLES);
  const orig = await prisma.article.findUnique({
    where: { id },
    include: { tags: true },
  });
  if (!orig) return { ok: false, message: "Article not found" };
  const copy = await prisma.article.create({
    data: {
      title: `${orig.title} (Copy)`,
      slug: `${orig.slug}-copy-${Date.now().toString(36)}`.slice(0, 90),
      subheadline: orig.subheadline,
      excerpt: orig.excerpt,
      body: orig.body,
      image: orig.image,
      imageCaption: orig.imageCaption,
      categoryId: orig.categoryId,
      subcategoryId: orig.subcategoryId,
      authorId: orig.authorId,
      location: orig.location,
      status: "DRAFT",
      publishedAt: null,
      featured: false,
      isOpinion: orig.isOpinion,
      seoTitle: orig.seoTitle,
      metaDescription: orig.metaDescription,
      focusKeyword: orig.focusKeyword,
      socialImage: orig.socialImage,
      editorNotes: orig.editorNotes,
      tags: { create: orig.tags.map((t) => ({ tagId: t.tagId })) },
    },
  });
  await logActivity(user.id, "ARTICLE_DUPLICATE", `#${id} → #${copy.id}`);
  revalidatePath("/admin/articles");
  return { ok: true, message: "Copy बन गई।", id: copy.id };
}

export async function restoreRevision(
  articleId: number,
  revisionId: number
): Promise<AdminActionResult> {
  const user = await requireUser(ARTICLE_ROLES);
  const rev = await prisma.articleRevision.findUnique({ where: { id: revisionId } });
  if (!rev || rev.articleId !== articleId) {
    return { ok: false, message: "Revision नहीं मिली।" };
  }
  const current = await prisma.article.findUnique({ where: { id: articleId } });
  if (!current) return { ok: false, message: "Article not found" };
  // snapshot the current state so the restore itself can be undone
  await prisma.articleRevision.create({
    data: {
      articleId,
      title: current.title,
      subheadline: current.subheadline,
      excerpt: current.excerpt,
      body: current.body,
      savedBy: user.name,
    },
  });
  await prisma.article.update({
    where: { id: articleId },
    data: {
      title: rev.title,
      subheadline: rev.subheadline,
      excerpt: rev.excerpt,
      body: rev.body,
    },
  });
  await logActivity(user.id, "ARTICLE_RESTORE", `#${articleId} ← rev #${revisionId}`);
  revalidatePath(`/news/${current.slug}`);
  revalidatePath("/");
  return { ok: true, message: "Revision restore हो गई — पेज reload करें।" };
}

/* -------------------------- Breaking news ------------------------- */

export async function saveBreaking(
  _prev: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  const user = await requireUser(["EDITOR"]);
  const id = Number(formData.get("id")) || null;
  const text = String(formData.get("text") || "").trim();
  if (!text) return { ok: false, message: "Text आवश्यक है।" };
  const data = {
    text,
    link: String(formData.get("link") || "").trim() || null,
    active: formData.get("active") === "on",
    order: Number(formData.get("order")) || 0,
    startAt: dateFromISTInput(String(formData.get("startAt") || "")),
    endAt: dateFromISTInput(String(formData.get("endAt") || "")),
  };
  if (id) await prisma.breakingNews.update({ where: { id }, data });
  else await prisma.breakingNews.create({ data });
  await logActivity(user.id, id ? "BREAKING_UPDATE" : "BREAKING_CREATE", text);
  revalidatePath("/admin/breaking");
  revalidatePath("/");
  return { ok: true, message: "Breaking news सेव हो गई।" };
}

export async function deleteBreaking(id: number): Promise<void> {
  const user = await requireUser(["EDITOR"]);
  await prisma.breakingNews.delete({ where: { id } }).catch(() => {});
  await logActivity(user.id, "BREAKING_DELETE", `#${id}`);
  revalidatePath("/admin/breaking");
  revalidatePath("/");
}

export async function toggleBreaking(id: number, active: boolean): Promise<void> {
  await requireUser(["EDITOR"]);
  await prisma.breakingNews.update({ where: { id }, data: { active } }).catch(() => {});
  revalidatePath("/admin/breaking");
  revalidatePath("/");
}

/* ------------------------ Categories & tags ----------------------- */

export async function saveCategory(
  _prev: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  const user = await requireUser(["EDITOR"]);
  const id = Number(formData.get("id")) || null;
  const name = String(formData.get("name") || "").trim();
  if (!name) return { ok: false, message: "Name आवश्यक है।" };
  const slug = slugify(String(formData.get("slug") || "").trim() || name);
  const data = {
    name,
    nameEn: String(formData.get("nameEn") || "").trim() || null,
    slug,
    description: String(formData.get("description") || "").trim() || null,
    order: Number(formData.get("order")) || 0,
    showInNav: formData.get("showInNav") === "on",
    parentId: Number(formData.get("parentId")) || null,
  };
  try {
    if (id) await prisma.category.update({ where: { id }, data });
    else await prisma.category.create({ data });
  } catch {
    return { ok: false, message: `Slug "${slug}" पहले से मौजूद है।` };
  }
  await logActivity(user.id, "CATEGORY_SAVE", name);
  revalidatePath("/admin/categories");
  return { ok: true, message: "Category सेव हो गई।" };
}

export async function deleteCategory(id: number): Promise<void> {
  const user = await requireUser(["EDITOR"]);
  const count = await prisma.article.count({
    where: { OR: [{ categoryId: id }, { subcategoryId: id }] },
  });
  if (count > 0) return; // never orphan articles silently
  await prisma.category.delete({ where: { id } }).catch(() => {});
  await logActivity(user.id, "CATEGORY_DELETE", `#${id}`);
  revalidatePath("/admin/categories");
}

export async function deleteTag(id: number): Promise<void> {
  await requireUser(["EDITOR"]);
  await prisma.tag.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/tags");
}

/* ----------------------------- Authors ---------------------------- */

export async function saveAuthor(
  _prev: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  const user = await requireUser(["EDITOR"]);
  const id = Number(formData.get("id")) || null;
  const name = String(formData.get("name") || "").trim();
  if (!name) return { ok: false, message: "Name आवश्यक है।" };
  const slug = slugify(String(formData.get("slug") || "").trim() || name);
  const data = {
    name,
    slug,
    photo: String(formData.get("photo") || "").trim() || null,
    bio: String(formData.get("bio") || "").trim() || null,
    designation: String(formData.get("designation") || "").trim() || null,
    email: String(formData.get("email") || "").trim() || null,
    facebook: String(formData.get("facebook") || "").trim() || null,
    twitter: String(formData.get("twitter") || "").trim() || null,
    instagram: String(formData.get("instagram") || "").trim() || null,
  };
  try {
    if (id) await prisma.author.update({ where: { id }, data });
    else await prisma.author.create({ data });
  } catch {
    return { ok: false, message: `Slug "${slug}" पहले से मौजूद है।` };
  }
  await logActivity(user.id, "AUTHOR_SAVE", name);
  revalidatePath("/admin/authors");
  return { ok: true, message: "Author सेव हो गया।" };
}

export async function deleteAuthor(id: number): Promise<void> {
  const user = await requireUser(["EDITOR"]);
  const count = await prisma.article.count({ where: { authorId: id } });
  if (count > 0) return;
  await prisma.author.delete({ where: { id } }).catch(() => {});
  await logActivity(user.id, "AUTHOR_DELETE", `#${id}`);
  revalidatePath("/admin/authors");
}

/* ---------------------------- Comments ---------------------------- */

export async function moderateComment(
  id: number,
  action: "APPROVE" | "REJECT" | "DELETE"
): Promise<void> {
  const user = await requireUser(["EDITOR", "MODERATOR"]);
  if (action === "DELETE") {
    await prisma.comment.delete({ where: { id } }).catch(() => {});
  } else {
    await prisma.comment
      .update({
        where: { id },
        data: { status: action === "APPROVE" ? "APPROVED" : "REJECTED", reported: false },
      })
      .catch(() => {});
  }
  await logActivity(user.id, `COMMENT_${action}`, `#${id}`);
  revalidatePath("/admin/comments");
}

/* --------------------------- Newsletter --------------------------- */

export async function removeSubscriber(id: number): Promise<void> {
  const user = await requireUser(["EDITOR"]);
  await prisma.newsletterSubscriber.delete({ where: { id } }).catch(() => {});
  await logActivity(user.id, "SUBSCRIBER_REMOVE", `#${id}`);
  revalidatePath("/admin/newsletter");
}

/* ------------------------- Advertisements ------------------------- */

export async function saveAd(
  _prev: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  const user = await requireUser(["AD_MANAGER", "EDITOR"]);
  const id = Number(formData.get("id")) || null;
  const advertiserName = String(formData.get("advertiserName") || "").trim();
  const imageDesktop = String(formData.get("imageDesktop") || "").trim();
  const url = String(formData.get("url") || "").trim();
  if (!advertiserName || !imageDesktop || !url) {
    return { ok: false, message: "Advertiser, banner और URL आवश्यक हैं।" };
  }
  if (!/^https?:\/\//.test(url)) {
    return { ok: false, message: "URL http/https से शुरू होना चाहिए।" };
  }
  const data = {
    advertiserName,
    imageDesktop,
    imageMobile: String(formData.get("imageMobile") || "").trim() || null,
    url,
    placement: String(formData.get("placement") || "SIDEBAR"),
    startDate: dateFromISTInput(String(formData.get("startDate") || "")),
    endDate: dateFromISTInput(String(formData.get("endDate") || "")),
    active: formData.get("active") === "on",
  };
  if (id) await prisma.advertisement.update({ where: { id }, data });
  else await prisma.advertisement.create({ data });
  await logActivity(user.id, "AD_SAVE", advertiserName);
  revalidatePath("/admin/ads");
  revalidatePath("/");
  return { ok: true, message: "Advertisement सेव हो गया।" };
}

export async function deleteAd(id: number): Promise<void> {
  const user = await requireUser(["AD_MANAGER", "EDITOR"]);
  await prisma.advertisement.delete({ where: { id } }).catch(() => {});
  await logActivity(user.id, "AD_DELETE", `#${id}`);
  revalidatePath("/admin/ads");
  revalidatePath("/");
}

/* ------------------------ Videos & galleries ---------------------- */

export async function saveVideo(
  _prev: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  const user = await requireUser(["EDITOR"]);
  const id = Number(formData.get("id")) || null;
  const title = String(formData.get("title") || "").trim();
  let youtubeId = String(formData.get("youtubeId") || "").trim();
  // accept full YouTube URLs
  const m = youtubeId.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/);
  if (m) youtubeId = m[1];
  if (!title || !youtubeId) return { ok: false, message: "Title और YouTube ID आवश्यक हैं।" };
  const data = {
    title,
    youtubeId,
    thumbnail: String(formData.get("thumbnail") || "").trim() || null,
    duration: String(formData.get("duration") || "").trim() || null,
    categoryId: Number(formData.get("categoryId")) || null,
  };
  if (id) await prisma.video.update({ where: { id }, data });
  else await prisma.video.create({ data });
  await logActivity(user.id, "VIDEO_SAVE", title);
  revalidatePath("/admin/videos");
  revalidatePath("/videos");
  return { ok: true, message: "Video सेव हो गया।" };
}

export async function deleteVideo(id: number): Promise<void> {
  await requireUser(["EDITOR"]);
  await prisma.video.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/videos");
  revalidatePath("/videos");
}

export async function saveGallery(
  _prev: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  const user = await requireUser(["EDITOR"]);
  const id = Number(formData.get("id")) || null;
  const title = String(formData.get("title") || "").trim();
  if (!title) return { ok: false, message: "Title आवश्यक है।" };
  // images: one per line, "url | caption"
  const lines = String(formData.get("images") || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const data = {
    title,
    description: String(formData.get("description") || "").trim() || null,
    categoryId: Number(formData.get("categoryId")) || null,
  };
  let galleryId: number;
  if (id) {
    await prisma.gallery.update({ where: { id }, data });
    await prisma.galleryImage.deleteMany({ where: { galleryId: id } });
    galleryId = id;
  } else {
    const g = await prisma.gallery.create({ data });
    galleryId = g.id;
  }
  for (let i = 0; i < lines.length; i++) {
    const [image, caption] = lines[i].split("|").map((s) => s.trim());
    if (!image) continue;
    await prisma.galleryImage.create({
      data: { galleryId, image, caption: caption || null, order: i },
    });
  }
  await logActivity(user.id, "GALLERY_SAVE", title);
  revalidatePath("/admin/gallery");
  revalidatePath("/photos");
  return { ok: true, message: "Gallery सेव हो गई।" };
}

export async function deleteGallery(id: number): Promise<void> {
  await requireUser(["EDITOR"]);
  await prisma.gallery.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/gallery");
  revalidatePath("/photos");
}

/* ------------------------------ Users ----------------------------- */

export async function saveUser(
  _prev: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  const actor = await requireUser([]); // SUPER_ADMIN only
  const id = Number(formData.get("id")) || null;
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "EDITOR");
  const password = String(formData.get("password") || "");
  if (!email || !name) return { ok: false, message: "Name और email आवश्यक हैं।" };
  if (!id && password.length < 8) {
    return { ok: false, message: "पासवर्ड कम से कम 8 अक्षरों का हो।" };
  }
  const data: {
    email: string;
    name: string;
    role: string;
    active: boolean;
    passwordHash?: string;
  } = {
    email,
    name,
    role,
    active: formData.get("active") === "on",
  };
  if (password) data.passwordHash = await bcrypt.hash(password, 12);
  try {
    if (id) await prisma.user.update({ where: { id }, data });
    else await prisma.user.create({ data: { ...data, passwordHash: data.passwordHash! } });
  } catch {
    return { ok: false, message: "यह email पहले से मौजूद है।" };
  }
  await logActivity(actor.id, "USER_SAVE", email);
  revalidatePath("/admin/users");
  return { ok: true, message: "User सेव हो गया।" };
}

export async function deleteUser(id: number): Promise<void> {
  const actor = await requireUser([]);
  if (actor.id === id) return; // cannot delete yourself
  await prisma.user.delete({ where: { id } }).catch(() => {});
  await logActivity(actor.id, "USER_DELETE", `#${id}`);
  revalidatePath("/admin/users");
}

/* ---------------------------- Settings ---------------------------- */

export async function saveSettings(
  _prev: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  const user = await requireUser(["EDITOR"]);
  const entries = Array.from(formData.entries()).filter(
    ([key]) => !key.startsWith("$")
  );
  for (const [key, value] of entries) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }
  await logActivity(user.id, "SETTINGS_SAVE");
  revalidatePath("/");
  return { ok: true, message: "Settings सेव हो गईं।" };
}

/* ---------------------------- Inquiries --------------------------- */

export async function updateInquiryStatus(id: number, status: string): Promise<void> {
  await requireUser(["AD_MANAGER", "EDITOR"]);
  await prisma.adInquiry.update({ where: { id }, data: { status } }).catch(() => {});
  revalidatePath("/admin/inquiries");
}
