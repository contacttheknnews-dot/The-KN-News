// Shared formatting helpers. All date output uses the hi-IN locale so the
// whole site reads naturally in Hindi.

const HINDI_MONTHS = [
  "जनवरी",
  "फरवरी",
  "मार्च",
  "अप्रैल",
  "मई",
  "जून",
  "जुलाई",
  "अगस्त",
  "सितंबर",
  "अक्टूबर",
  "नवंबर",
  "दिसंबर",
];

// Always render in IST regardless of the server's timezone. On Vercel the
// runtime is UTC, so getDate()/getHours() would show times 5.5h early for this
// India-based site. Intl with an explicit timeZone fixes it (India has no DST).
const IST = "Asia/Kolkata";

function istParts(date: Date | string): {
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
} {
  const d = new Date(date);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST,
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  // en-GB hour12:false yields "24" at midnight — normalize to 0.
  const hour = get("hour") % 24;
  return { day: get("day"), month: get("month"), year: get("year"), hour, minute: get("minute") };
}

export function formatHindiDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const { day, month, year } = istParts(date);
  return `${day} ${HINDI_MONTHS[month - 1]} ${year}`;
}

export function formatHindiTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const { hour, minute } = istParts(date);
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:${minute.toString().padStart(2, "0")} ${suffix}`;
}

export function formatHindiDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  return `${formatHindiDate(date)}, ${formatHindiTime(date)}`;
}

// ---- IST form-input helpers ------------------------------------------------
// <input type="date"/"time"/"datetime-local"> values must be written and read
// as IST wall-clock time, not the runtime's zone (Vercel runs in UTC), or
// every prefill and every save shifts by 5.5 hours. India has no DST, so the
// fixed +05:30 offset is always exact.

export function istDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const { day, month, year } = istParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function istTimeInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const { hour, minute } = istParts(date);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function istDateTimeInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  return `${istDateInputValue(date)}T${istTimeInputValue(date)}`;
}

/**
 * Parse form-input values as IST wall-clock time. Accepts a date ("YYYY-MM-DD",
 * optionally with a separate "HH:mm" time) or a combined datetime-local value
 * ("YYYY-MM-DDTHH:mm" or with seconds). Returns null when empty or invalid.
 */
export function dateFromISTInput(dateStr: string, timeStr?: string): Date | null {
  if (!dateStr) return null;
  const iso = dateStr.includes("T") ? dateStr : `${dateStr}T${timeStr || "00:00"}`;
  const withSeconds = /T\d{2}:\d{2}$/.test(iso) ? `${iso}:00` : iso;
  const parsed = new Date(`${withSeconds}+05:30`);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function timeAgoHindi(date: Date | string | null | undefined): string {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "अभी-अभी";
  if (mins < 60) return `${mins} मिनट पहले`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} घंटे पहले`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} दिन पहले`;
  return formatHindiDate(date);
}

export function formatViews(views: number): string {
  if (views >= 10000000) return `${(views / 10000000).toFixed(1)} करोड़`;
  if (views >= 100000) return `${(views / 100000).toFixed(1)} लाख`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return String(views);
}

/* ---------- Devanagari → Latin transliteration (for SEO slugs) ---------- */

const DEV_INDEPENDENT_VOWELS: Record<string, string> = {
  अ: "a", आ: "a", इ: "i", ई: "i", उ: "u", ऊ: "u", ऋ: "ri",
  ए: "e", ऐ: "ai", ओ: "o", औ: "au", ऑ: "o", ऍ: "e", ऎ: "e", ऒ: "o",
};

const DEV_MATRAS: Record<string, string> = {
  "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u", "ृ": "ri",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ॉ": "o", "ॅ": "e", "ॆ": "e", "ॊ": "o",
};

const DEV_CONSONANTS: Record<string, string> = {
  क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "n",
  च: "ch", छ: "chh", ज: "j", झ: "jh", ञ: "n",
  ट: "t", ठ: "th", ड: "d", ढ: "dh", ण: "n",
  त: "t", थ: "th", द: "d", ध: "dh", न: "n",
  प: "p", फ: "ph", ब: "b", भ: "bh", म: "m",
  य: "y", र: "r", ल: "l", व: "v",
  श: "sh", ष: "sh", स: "s", ह: "h", ळ: "l",
  // nukta (precomposed) forms
  "क़": "q", "ख़": "kh", "ग़": "g", "ज़": "z", "ड़": "r", "ढ़": "rh", "फ़": "f", "य़": "y",
};

// nukta variants for consonant + combining U+093C sequences
const NUKTA_MAP: Record<string, string> = {
  क: "q", ख: "kh", ग: "g", ज: "z", ड: "r", ढ: "rh", फ: "f", य: "y",
};

const DEV_DIGITS: Record<string, string> = {
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
  "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
};

// Practical Hindi transliteration: consonants carry an inherent "a" that is
// removed by a matra or halant, and dropped word-finally (schwa deletion).
export function transliterateDevanagari(input: string): string {
  const text = input.normalize("NFC");
  let out = "";
  let pendingA = false; // an inherent "a" waiting to be confirmed/replaced

  const flush = (final: boolean) => {
    if (pendingA && !final) out += "a";
    pendingA = false;
  };

  for (let i = 0; i < text.length; i++) {
    let ch = text[i];
    // fold combining nukta into the previous consonant lookup
    if (text[i + 1] === "़" && NUKTA_MAP[ch]) {
      ch = NUKTA_MAP[ch];
      i++;
      flush(false);
      out += ch;
      pendingA = true;
      continue;
    }
    if (DEV_CONSONANTS[ch]) {
      flush(false);
      out += DEV_CONSONANTS[ch];
      pendingA = true;
    } else if (DEV_MATRAS[ch]) {
      // matra replaces the inherent "a"
      pendingA = false;
      out += DEV_MATRAS[ch];
    } else if (ch === "्") {
      // halant: suppress inherent vowel
      pendingA = false;
    } else if (DEV_INDEPENDENT_VOWELS[ch]) {
      flush(false);
      out += DEV_INDEPENDENT_VOWELS[ch];
    } else if (ch === "ं" || ch === "ँ") {
      flush(false);
      out += "n";
    } else if (ch === "ः") {
      flush(false);
      out += "h";
    } else if (DEV_DIGITS[ch]) {
      flush(false);
      out += DEV_DIGITS[ch];
    } else if (ch === "।" || ch === "॥") {
      flush(true);
      out += " ";
    } else if (/[ऀ-ॿ]/.test(ch)) {
      // any other Devanagari mark: end the syllable
      flush(true);
    } else {
      // word boundary or ASCII: final schwa is dropped
      flush(!/[a-zA-Z]/.test(ch));
      out += ch;
    }
  }
  flush(true);
  return out;
}

// SEO slug generator: transliterates Hindi, keeps it short, editors can
// still override manually in the CMS.
export function slugify(input: string, maxLength = 70): string {
  const ascii = transliterateDevanagari(input)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
  if (!ascii) return `khabar-${Date.now().toString(36)}`;
  if (ascii.length <= maxLength) return ascii;
  // cut at a word boundary
  const cut = ascii.slice(0, maxLength);
  const lastDash = cut.lastIndexOf("-");
  return lastDash > 30 ? cut.slice(0, lastDash) : cut;
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

// Very small HTML sanitizer for user comments (plain text only).
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const BLOCK_TAG_RE = /<(p|h[1-6]|ul|ol|li|blockquote|figure|img|iframe|div|table|br|hr)\b/i;

// Article bodies written before the rich-text editor are plain text with
// \r\n breaks. Convert those to <p>/<br> so they render with proper
// paragraph spacing; already-HTML bodies pass through untouched.
// Defer offscreen images/iframes in article bodies (performance).
function lazifyMedia(html: string): string {
  return html
    .replace(/<img (?![^>]*\bloading=)/g, '<img loading="lazy" decoding="async" ')
    .replace(/<iframe (?![^>]*\bloading=)/g, '<iframe loading="lazy" ');
}

export function normalizeArticleHtml(body: string): string {
  const trimmed = (body || "").trim();
  if (!trimmed) return "";
  if (BLOCK_TAG_RE.test(trimmed)) return lazifyMedia(trimmed);
  return trimmed
    .split(/\r?\n\s*\r?\n/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p>${escapeHtml(para).replace(/\r?\n/g, "<br />")}</p>`)
    .join("");
}
