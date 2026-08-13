// Generates local SVG placeholder images for sample content:
// category news images, author avatars, ad banners and the site logo.
// Run: node scripts/generate-sample-images.mjs

import { mkdirSync, writeFileSync } from "fs";
import path from "path";

const outDir = path.join(process.cwd(), "public", "images", "sample");
const imgDir = path.join(process.cwd(), "public", "images");
mkdirSync(outDir, { recursive: true });

const CATEGORIES = [
  { slug: "desh", label: "देश", hue: 356 },
  { slug: "uttar-pradesh", label: "उत्तर प्रदेश", hue: 24 },
  { slug: "delhi-ncr", label: "दिल्ली NCR", hue: 205 },
  { slug: "rajniti", label: "राजनीति", hue: 340 },
  { slug: "cricket", label: "क्रिकेट", hue: 145 },
  { slug: "khel", label: "खेल", hue: 260 },
  { slug: "manoranjan", label: "मनोरंजन", hue: 300 },
  { slug: "business", label: "बिजनेस", hue: 215 },
  { slug: "technology", label: "टेक्नोलॉजी", hue: 190 },
  { slug: "shiksha", label: "शिक्षा", hue: 45 },
  { slug: "naukri", label: "नौकरी", hue: 170 },
  { slug: "lifestyle", label: "लाइफस्टाइल", hue: 20 },
  { slug: "apradh", label: "अपराध", hue: 0 },
  { slug: "vichar", label: "विचार", hue: 230 },
];

function newsImage(label, hue, variant) {
  const l1 = 22 + variant * 6;
  const l2 = 34 + variant * 5;
  const shapes = [
    `<circle cx="960" cy="140" r="260" fill="hsl(${hue} 70% 60% / 0.25)"/>
     <circle cx="180" cy="560" r="180" fill="hsl(${hue} 70% 70% / 0.18)"/>`,
    `<rect x="700" y="80" width="420" height="420" rx="40" transform="rotate(12 910 290)" fill="hsl(${hue} 70% 60% / 0.22)"/>
     <circle cx="150" cy="120" r="120" fill="hsl(${hue} 60% 72% / 0.2)"/>`,
    `<polygon points="1200,0 1200,500 760,0" fill="hsl(${hue} 65% 62% / 0.22)"/>
     <circle cx="240" cy="520" r="220" fill="hsl(${hue} 70% 66% / 0.16)"/>`,
  ][variant % 3];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 55% ${l1}%)"/>
      <stop offset="1" stop-color="hsl(${hue} 60% ${l2}%)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#g)"/>
  ${shapes}
  <rect x="60" y="490" width="200" height="10" rx="5" fill="#ffffff" opacity="0.85"/>
  <rect x="60" y="516" width="320" height="10" rx="5" fill="#ffffff" opacity="0.55"/>
  <rect x="60" y="542" width="260" height="10" rx="5" fill="#ffffff" opacity="0.35"/>
  <text x="60" y="120" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="64" font-weight="700" fill="#ffffff" opacity="0.95">${label}</text>
  <text x="60" y="170" font-family="Arial, sans-serif" font-size="26" fill="#ffffff" opacity="0.7">The KN News · Sample Image</text>
</svg>`;
}

for (const cat of CATEGORIES) {
  for (let v = 1; v <= 3; v++) {
    writeFileSync(path.join(outDir, `${cat.slug}-${v}.svg`), newsImage(cat.label, cat.hue, v - 1));
  }
}

// Author avatars
const AUTHOR_HUES = [356, 210, 150, 40, 280, 190];
AUTHOR_HUES.forEach((hue, i) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="hsl(${hue} 50% 30%)"/>
  <circle cx="100" cy="78" r="38" fill="hsl(${hue} 60% 85%)"/>
  <path d="M30 200 a70 70 0 0 1 140 0 Z" fill="hsl(${hue} 60% 85%)"/>
</svg>`;
  writeFileSync(path.join(outDir, `author-${i + 1}.svg`), svg);
});

// Ad banners (labelled sample creatives for the direct-ads demo)
function banner(w, h, name, hue) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="hsl(${hue} 65% 32%)"/><stop offset="1" stop-color="hsl(${hue} 70% 48%)"/>
  </linearGradient></defs>
  <rect width="${w}" height="${h}" rx="8" fill="url(#b)"/>
  <text x="${w / 2}" y="${h / 2 - 8}" text-anchor="middle" font-family="Arial" font-weight="700" font-size="${Math.min(30, h / 3)}" fill="#fff">${name}</text>
  <text x="${w / 2}" y="${h / 2 + 22}" text-anchor="middle" font-family="Arial" font-size="${Math.min(16, h / 5)}" fill="#fff" opacity="0.8">Sample Advertiser Banner</text>
</svg>`;
}
writeFileSync(path.join(outDir, "ad-970x90.svg"), banner(970, 90, "Ghazipur Electronics", 215));
writeFileSync(path.join(outDir, "ad-728x90.svg"), banner(728, 90, "UP Coaching Centre", 150));
writeFileSync(path.join(outDir, "ad-300x250.svg"), banner(300, 250, "Sharma Sarees, Varanasi", 340));
writeFileSync(path.join(outDir, "ad-mobile-360x120.svg"), banner(360, 120, "Ghazipur Electronics", 215));

// Site logo
writeFileSync(
  path.join(imgDir, "logo.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="#1a1a1a"/>
  <rect x="96" y="176" width="320" height="160" rx="24" fill="#d21f2a"/>
  <text x="256" y="292" text-anchor="middle" font-family="Arial" font-weight="800" font-size="120" fill="#ffffff">KN</text>
  <text x="256" y="400" text-anchor="middle" font-family="Arial" font-weight="600" font-size="44" fill="#ffffff">NEWS</text>
</svg>`
);

console.log("Sample images generated in public/images/sample");
