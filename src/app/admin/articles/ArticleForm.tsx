"use client";

// Full news editor: content, autosave, preview, publishing workflow and SEO.

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveArticle, autosaveArticle, duplicateArticle, type AdminActionResult } from "../actions";
import { inputCls, labelCls, btnPrimary, btnSecondary } from "../ui";
import ImageUploadField from "../ImageUploadField";
import RichTextEditor from "@/components/editor/RichTextEditor";
import SeoPanel, { CharCounter } from "./SeoPanel";
import { slugify, formatHindiDateTime, formatHindiTime } from "@/lib/utils";

type Option = { id: number; name: string; parentId?: number | null };

export type ArticleFormData = {
  id?: number;
  title: string;
  slug: string;
  subheadline: string;
  excerpt: string;
  body: string;
  image: string;
  imageCaption: string;
  categoryId: number | "";
  subcategoryId: number | "";
  authorId: number | "";
  location: string;
  status: string;
  publishDate: string;
  publishTime: string;
  featured: boolean;
  isOpinion: boolean;
  tags: string;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  socialImage: string;
  editorNotes: string;
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
};

type Backup = {
  title: string;
  subheadline: string;
  excerpt: string;
  body: string;
  savedAt: number;
};

const draftKey = (id?: number) => `kn-article-backup-${id ?? "new"}`;

export default function ArticleForm({
  article,
  categories,
  authors,
  canPublish,
}: {
  article: ArticleFormData;
  categories: Option[];
  authors: Option[];
  canPublish: boolean;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    saveArticle,
    null
  );
  const [categoryId, setCategoryId] = useState<string>(String(article.categoryId || ""));
  const parents = categories.filter((c) => !c.parentId);
  const subcats = categories.filter((c) => c.parentId && String(c.parentId) === categoryId);

  // controlled fields (needed for autosave + live SEO feedback)
  const [title, setTitle] = useState(article.title);
  const [subheadline, setSubheadline] = useState(article.subheadline);
  const [excerpt, setExcerpt] = useState(article.excerpt);
  const [slug, setSlug] = useState(article.slug);
  const [seoTitle, setSeoTitle] = useState(article.seoTitle);
  const [metaDescription, setMetaDescription] = useState(article.metaDescription);
  const [focusKeyword, setFocusKeyword] = useState(article.focusKeyword);
  const [status, setStatus] = useState(article.status);
  const [bodyHtml, setBodyHtml] = useState(article.body);

  // editor remount key (used when restoring a backup)
  const [editorSeed, setEditorSeed] = useState({ key: 0, content: article.body });

  const [backup, setBackup] = useState<Backup | null>(null);
  const [lastAutosave, setLastAutosave] = useState<Date | null>(null);
  const [duplicating, startDuplicate] = useTransition();

  const dirtyRef = useRef(false);
  const valuesRef = useRef({ title, subheadline, excerpt, body: bodyHtml, status });
  valuesRef.current = { title, subheadline, excerpt, body: bodyHtml, status };

  const markDirty = () => {
    dirtyRef.current = true;
  };

  /* ---------- lost-work protection ---------- */

  // offer to restore a local backup left behind by a crash / closed tab
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey(article.id));
      if (!raw) return;
      const b = JSON.parse(raw) as Backup;
      const differs =
        b.title !== article.title ||
        b.subheadline !== article.subheadline ||
        b.excerpt !== article.excerpt ||
        b.body !== article.body;
      if (differs) setBackup(b);
      else localStorage.removeItem(draftKey(article.id));
    } catch {
      // corrupt backup — ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // local backup every 5 seconds while there are unsaved changes
  useEffect(() => {
    const t = setInterval(() => {
      if (!dirtyRef.current) return;
      try {
        const v = valuesRef.current;
        localStorage.setItem(
          draftKey(article.id),
          JSON.stringify({ ...v, savedAt: Date.now() } satisfies Backup & { status?: string })
        );
      } catch {
        // storage full — nothing we can do
      }
    }, 5000);
    return () => clearInterval(t);
  }, [article.id]);

  // server autosave for drafts every 45 seconds
  useEffect(() => {
    if (!article.id) return;
    const t = setInterval(() => {
      const v = valuesRef.current;
      if (!dirtyRef.current || v.status !== "DRAFT") return;
      autosaveArticle(article.id!, {
        title: v.title,
        subheadline: v.subheadline,
        excerpt: v.excerpt,
        body: v.body,
      })
        .then((res) => {
          if (res.ok) setLastAutosave(new Date());
        })
        .catch(() => {});
    }, 45_000);
    return () => clearInterval(t);
  }, [article.id]);

  // warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // after a successful save: clear protection, move new articles to their edit page
  useEffect(() => {
    if (!state?.ok) return;
    dirtyRef.current = false;
    try {
      localStorage.removeItem(draftKey(article.id));
      localStorage.removeItem(draftKey(undefined));
    } catch {}
    if (!article.id && state.id) {
      router.replace(`/admin/articles/${state.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  /* ---------- actions ---------- */

  const restoreBackup = () => {
    if (!backup) return;
    setTitle(backup.title);
    setSubheadline(backup.subheadline);
    setExcerpt(backup.excerpt);
    setBodyHtml(backup.body);
    setEditorSeed((s) => ({ key: s.key + 1, content: backup.body }));
    setBackup(null);
    dirtyRef.current = true;
  };

  const discardBackup = () => {
    try {
      localStorage.removeItem(draftKey(article.id));
    } catch {}
    setBackup(null);
  };

  const openPreview = async () => {
    if (!article.id) return;
    const v = valuesRef.current;
    if (dirtyRef.current && v.status === "DRAFT") {
      // push latest text so the preview matches what's on screen
      await autosaveArticle(article.id, {
        title: v.title,
        subheadline: v.subheadline,
        excerpt: v.excerpt,
        body: v.body,
      }).catch(() => {});
    }
    window.open(`/preview/${article.id}`, "_blank", "noopener");
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (status === "PUBLISHED" && article.status !== "PUBLISHED") {
      if (!window.confirm("यह लेख तुरंत वेबसाइट पर LIVE हो जाएगा। Publish करें?")) {
        e.preventDefault();
      }
    }
  };

  const effectiveSlug = slug.trim() ? slugify(slug) : title.trim() ? slugify(title) : "";

  return (
    <form
      action={formAction}
      onSubmit={onSubmit}
      onInput={markDirty}
      className="grid gap-6 xl:grid-cols-[1fr_320px]"
    >
      {article.id && <input type="hidden" name="id" value={article.id} />}

      {/* -------- Main column -------- */}
      <div className="space-y-4">
        {backup && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
            <span className="font-semibold">
              💾 बिना सेव किया backup मिला ({formatHindiDateTime(new Date(backup.savedAt))})।
            </span>
            <button type="button" onClick={restoreBackup} className="rounded bg-kn-red px-3 py-1 text-xs font-bold text-white">
              Restore करें
            </button>
            <button type="button" onClick={discardBackup} className="rounded border border-kn-border bg-white px-3 py-1 text-xs font-semibold">
              हटाएँ
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg border border-kn-border p-5 space-y-4">
          <div>
            <label className={labelCls}>Headline *</label>
            <input
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${inputCls} text-lg font-bold`}
              placeholder="खबर का शीर्षक"
            />
          </div>
          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputCls}
              placeholder="खाली छोड़ें — headline से अपने-आप बनेगा (Hindi → English)"
            />
            {effectiveSlug && (
              <p className="mt-1 text-[11px] text-kn-muted break-all">
                URL: theknnews.in/news/<span className="font-semibold text-kn-dark">{effectiveSlug}</span>
              </p>
            )}
          </div>
          <div>
            <label className={labelCls}>Subheadline</label>
            <input
              name="subheadline"
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              className={inputCls}
              placeholder="उप-शीर्षक (वैकल्पिक)"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className={labelCls}>Short Description *</label>
              <CharCounter value={excerpt} ideal={160} max={200} />
            </div>
            <textarea
              name="excerpt"
              required
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className={`${inputCls} resize-y`}
              placeholder="खबर का संक्षिप्त सारांश (कार्ड और SEO में दिखेगा)"
            />
          </div>
          <div>
            <label className={labelCls}>Article Body *</label>
            <RichTextEditor
              key={editorSeed.key}
              name="body"
              defaultValue={editorSeed.content}
              onChangeHtml={(h) => {
                setBodyHtml(h);
                dirtyRef.current = true;
              }}
            />
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-lg border border-kn-border p-5 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wide text-neutral-500">SEO</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <label className={labelCls}>SEO Title</label>
                <CharCounter value={seoTitle || title} ideal={60} max={70} />
              </div>
              <input
                name="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className={inputCls}
                placeholder="खाली छोड़ने पर headline इस्तेमाल होगा"
              />
            </div>
            <div>
              <label className={labelCls}>Focus Keyword</label>
              <input
                name="focusKeyword"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className={labelCls}>Meta Description</label>
              <CharCounter value={metaDescription} ideal={160} max={170} />
            </div>
            <textarea
              name="metaDescription"
              rows={2}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className={`${inputCls} resize-y`}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>Canonical URL</label>
              <input name="canonicalUrl" defaultValue={article.canonicalUrl} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Social Image URL</label>
              <input name="socialImage" defaultValue={article.socialImage} className={inputCls} />
            </div>
          </div>
          <div className="border-t border-kn-border pt-4">
            <SeoPanel
              title={title}
              seoTitle={seoTitle}
              metaDescription={metaDescription}
              excerpt={excerpt}
              focusKeyword={focusKeyword}
              slug={effectiveSlug}
              bodyHtml={bodyHtml}
            />
          </div>
        </div>
      </div>

      {/* -------- Side column -------- */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-kn-border p-5 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wide text-neutral-500">Publish</h2>
          <div>
            <label className={labelCls}>Status</label>
            <select
              name="status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                markDirty();
              }}
              className={inputCls}
            >
              <option value="DRAFT">Draft</option>
              {canPublish && <option value="PUBLISHED">Published</option>}
              {canPublish && <option value="SCHEDULED">Scheduled</option>}
            </select>
            {!canPublish && (
              <p className="mt-1 text-[11px] text-kn-muted">
                Reporter के लेख Editor की समीक्षा के बाद प्रकाशित होते हैं।
              </p>
            )}
            {status === "SCHEDULED" && (
              <p className="mt-1 text-[11px] text-kn-muted">
                नीचे दी गई date/time पर अपने-आप live होगा।
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Publish Date</label>
              <input type="date" name="publishDate" defaultValue={article.publishDate} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Time</label>
              <input type="time" name="publishTime" defaultValue={article.publishTime} className={inputCls} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="featured" defaultChecked={article.featured} className="accent-kn-red h-4 w-4" />
            Featured (होमपेज हीरो)
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="isOpinion" defaultChecked={article.isOpinion} className="accent-kn-red h-4 w-4" />
            विचार / Opinion लेख
          </label>

          <div className="flex gap-2">
            <button type="submit" disabled={pending} className={`${btnPrimary} flex-1`}>
              {pending ? "सेव हो रहा है…" : status === "PUBLISHED" ? "Publish / Save" : "Save"}
            </button>
            {article.id && (
              <button
                type="button"
                onClick={openPreview}
                title="नए tab में देखें कि लेख वेबसाइट पर कैसा दिखेगा"
                className={btnSecondary}
              >
                👁 Preview
              </button>
            )}
          </div>
          {!article.id && (
            <p className="text-[11px] text-kn-muted">Preview पहली बार save करने के बाद उपलब्ध होगा।</p>
          )}
          {state && (
            <p className={`text-sm font-semibold ${state.ok ? "text-green-700" : "text-kn-red"}`} role="status">
              {state.message}
            </p>
          )}
          {lastAutosave && (
            <p className="text-[11px] text-green-700">
              ☁ Draft autosaved — {formatHindiTime(lastAutosave)}
            </p>
          )}

          {/* Status timeline */}
          {article.id && (
            <div className="border-t border-kn-border pt-3 space-y-1 text-[11px] text-kn-muted">
              {article.createdAt && <p>📝 बनाया गया: {formatHindiDateTime(article.createdAt)}</p>}
              {article.status !== "DRAFT" && article.publishDate && (
                <p>
                  🚀 {article.status === "SCHEDULED" ? "Scheduled" : "Published"}: {article.publishDate}{" "}
                  {article.publishTime}
                </p>
              )}
              {article.updatedAt && <p>♻ आख़िरी अपडेट: {formatHindiDateTime(article.updatedAt)}</p>}
            </div>
          )}

          {article.id && (
            <button
              type="button"
              disabled={duplicating}
              onClick={() => {
                startDuplicate(async () => {
                  const res = await duplicateArticle(article.id!);
                  if (res.ok && res.id) router.push(`/admin/articles/${res.id}`);
                  else if (!res.ok) window.alert(res.message);
                });
              }}
              className="w-full rounded-md border border-kn-border bg-white px-4 py-2 text-xs font-bold hover:bg-kn-gray disabled:opacity-50"
            >
              {duplicating ? "…" : "⧉ Duplicate (draft copy बनाएँ)"}
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg border border-kn-border p-5 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wide text-neutral-500">Organize</h2>
          <div>
            <label className={labelCls}>Category *</label>
            <select
              name="categoryId"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputCls}
            >
              <option value="">— चुनें —</option>
              {parents.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {subcats.length > 0 && (
            <div>
              <label className={labelCls}>Subcategory (जिला)</label>
              <select name="subcategoryId" defaultValue={String(article.subcategoryId || "")} className={inputCls}>
                <option value="">— कोई नहीं —</option>
                {subcats.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className={labelCls}>Author *</label>
            <select name="authorId" required defaultValue={String(article.authorId || "")} className={inputCls}>
              <option value="">— चुनें —</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Location</label>
            <input name="location" defaultValue={article.location} className={inputCls} placeholder="जैसे: गाजीपुर" />
          </div>
          <div>
            <label className={labelCls}>Tags (comma से अलग करें)</label>
            <input name="tags" defaultValue={article.tags} className={inputCls} placeholder="चुनाव, यूपी, क्रिकेट" />
          </div>
          <div>
            <label className={labelCls}>Internal Notes (सिर्फ team के लिए)</label>
            <textarea
              name="editorNotes"
              rows={3}
              defaultValue={article.editorNotes}
              className={`${inputCls} resize-y`}
              placeholder="संपादकीय टिप्पणी, source, follow-up… पाठकों को नहीं दिखेगा।"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-kn-border p-5 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wide text-neutral-500">Featured Image</h2>
          <div>
            <label className={labelCls}>Image URL *</label>
            <ImageUploadField
              name="image"
              required
              defaultValue={article.image}
              placeholder="/uploads/… या https://…"
            />
            <p className="mt-1 text-[11px] text-kn-muted">
              Upload बटन से सीधे डिवाइस से इमेज अपलोड करें, या Media Library का URL पेस्ट करें।
            </p>
          </div>
          <div>
            <label className={labelCls}>Image Caption</label>
            <input name="imageCaption" defaultValue={article.imageCaption} className={inputCls} />
          </div>
        </div>
      </div>
    </form>
  );
}
