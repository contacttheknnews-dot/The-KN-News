"use client";

// Live SEO + readability feedback while writing. Pure client-side checks —
// no network calls, updates as the writer types.

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

function Check({ ok, warn, children }: { ok: boolean; warn?: boolean; children: React.ReactNode }) {
  const icon = ok ? "✅" : warn ? "⚠️" : "❌";
  return (
    <li className="flex items-start gap-1.5 text-xs leading-relaxed">
      <span className="shrink-0">{icon}</span>
      <span className={ok ? "text-neutral-600" : "text-neutral-800 font-medium"}>{children}</span>
    </li>
  );
}

export function CharCounter({ value, ideal, max }: { value: string; ideal: number; max: number }) {
  const len = value.length;
  const color = len === 0 ? "text-kn-muted" : len <= ideal ? "text-green-700" : len <= max ? "text-amber-600" : "text-kn-red";
  return (
    <span className={`text-[11px] font-semibold tabular-nums ${color}`}>
      {len}/{max}
    </span>
  );
}

export default function SeoPanel({
  title,
  seoTitle,
  metaDescription,
  excerpt,
  focusKeyword,
  slug,
  bodyHtml,
}: {
  title: string;
  seoTitle: string;
  metaDescription: string;
  excerpt: string;
  focusKeyword: string;
  slug: string;
  bodyHtml: string;
}) {
  const kw = focusKeyword.trim().toLowerCase();
  const bodyText = stripHtml(bodyHtml);
  const bodyLower = bodyText.toLowerCase();
  const words = bodyText ? bodyText.split(/\s+/).length : 0;

  // sentence stats (। and . both end Hindi news sentences)
  const sentences = bodyText.split(/[।.!?]+/).map((s) => s.trim()).filter(Boolean);
  const avgSentenceLen = sentences.length ? Math.round(words / sentences.length) : 0;
  const paragraphs = (bodyHtml.match(/<p[\s>]/g) || []).length;
  const longParagraphs = (bodyHtml.match(/<p[^>]*>[^<]{600,}/g) || []).length;
  const headings = (bodyHtml.match(/<h[2-6][\s>]/g) || []).length;

  const kwCount = kw ? bodyLower.split(kw).length - 1 : 0;
  const effectiveTitle = (seoTitle || title).toLowerCase();

  return (
    <div className="space-y-3">
      {kw ? (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500 mb-1.5">
            Focus Keyword: &ldquo;{focusKeyword.trim()}&rdquo;
          </p>
          <ul className="space-y-1">
            <Check ok={effectiveTitle.includes(kw)}>Title में keyword</Check>
            <Check ok={excerpt.toLowerCase().includes(kw)}>Short description में keyword</Check>
            <Check ok={kwCount >= 2} warn={kwCount === 1}>
              Body में keyword {kwCount} बार (2+ अच्छा)
            </Check>
            <Check ok={metaDescription.toLowerCase().includes(kw)}>Meta description में keyword</Check>
          </ul>
        </div>
      ) : (
        <p className="text-xs text-kn-muted">Focus keyword भरें — यहाँ live SEO जाँच दिखेगी।</p>
      )}

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500 mb-1.5">Readability</p>
        <ul className="space-y-1">
          <Check ok={words >= 300} warn={words >= 150}>
            {words} शब्द (Google News के लिए 300+ अच्छा)
          </Check>
          <Check ok={avgSentenceLen > 0 && avgSentenceLen <= 25} warn={avgSentenceLen <= 32}>
            औसत वाक्य {avgSentenceLen} शब्द (25 से कम रखें)
          </Check>
          <Check ok={longParagraphs === 0}>
            {longParagraphs === 0
              ? "पैराग्राफ की लंबाई ठीक है"
              : `${longParagraphs} पैराग्राफ बहुत लंबे हैं — तोड़ें`}
          </Check>
          <Check ok={headings > 0 || words < 300} warn={headings === 0}>
            {headings > 0 ? `${headings} subheading (H2/H3)` : "लंबे लेख में subheading जोड़ें"}
          </Check>
          <Check ok={paragraphs >= 3 || words < 150}>{paragraphs} पैराग्राफ</Check>
        </ul>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500 mb-1.5">Metadata</p>
        <ul className="space-y-1">
          <Check ok={(seoTitle || title).length > 0 && (seoTitle || title).length <= 60} warn={(seoTitle || title).length <= 70}>
            SEO title {(seoTitle || title).length} अक्षर (60 तक Google में पूरा दिखता है)
          </Check>
          <Check ok={metaDescription.length >= 70 && metaDescription.length <= 160} warn={metaDescription.length > 0}>
            Meta description {metaDescription.length} अक्षर (70–160 आदर्श)
          </Check>
          <Check ok={!!slug && slug.length <= 70 && !/khabar-[a-z0-9]+$/.test(slug)}>
            {slug ? `Slug: ${slug.slice(0, 40)}${slug.length > 40 ? "…" : ""}` : "Slug headline से अपने-आप बनेगा"}
          </Check>
        </ul>
      </div>
    </div>
  );
}
