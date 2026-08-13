// Production content setup — run AFTER `npm run db:push && npm run db:seed`
// against the production DATABASE_URL:
//
//   node scripts/production-content/setup-content.cjs
//
// 1. Imports the 30 real videos from the official YouTube channel (@Theknnews7).
// 2. Assigns the 58 real article images (/uploads/*.webp) with photo credits.
//
// Idempotent: safe to run more than once.
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const readJson = (f) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, f), "utf8").replace(/^﻿/, ""));

const GROUP_TO_SLUG = {
  cricket: "cricket",
  "uttar-pradesh": "uttar-pradesh",
  politics: "rajniti",
  business: "business",
  india: "desh",
  "delhi-ncr": "delhi-ncr",
  sports: "khel",
  entertainment: "manoranjan",
  technology: "technology",
  education: "shiksha",
  jobs: "naukri",
  lifestyle: "lifestyle",
  crime: "apradh",
};

function pickCategory(title, catBySlug) {
  const rules = [
    ["cricket", /SKY|IND vs ENG|क्रिकेट|Cricket|T-Shirt.*सोशल/i],
    ["apradh", /एनकाउंटर|गैंगस्टर|आपराधिक|हादसा|आग लगने|Lawrence Bishnoi|गिरफ्तार|पुलिस/i],
    ["delhi-ncr", /नई दिल्ली|Delhi News|जंतर-मंतर/i],
    ["uttar-pradesh", /गाजीपुर|लखनऊ|वाराणसी|अयोध्या|शाहजहांपुर|UP News|UPNews|योगी/i],
    ["rajniti", /अखिलेश|Akhilesh|सपा|भाजपा|BJP|डिंपल|Dimple|संसद|सियास|राजनीति|Politics|करणी सेना|KarniSena|Owaisi|राजभर|Samajwadi|मुख्तार|अंसारी|बृजभूषण|Tej Pratap|शिक्षा मंत्री|मंत्री/i],
  ];
  for (const [slug, re] of rules) {
    if (re.test(title) && catBySlug[slug]) return catBySlug[slug].id;
  }
  return catBySlug["desh"] ? catBySlug["desh"].id : null;
}

function creditLine(c) {
  const artist = (c.artist || "").trim();
  const lic =
    c.license && !/public domain|cc0|no restrictions/i.test(c.license)
      ? `, ${c.license}`
      : "";
  return artist
    ? `फोटो: ${artist} / Wikimedia Commons${lic}`
    : `फोटो: Wikimedia Commons${lic}`;
}

async function importVideos(catBySlug) {
  const videos = readJson("videos.json");
  const removed = await prisma.video.deleteMany({
    where: { youtubeId: "dQw4w9WgXcQ" },
  });
  if (removed.count) console.log("removed placeholder videos:", removed.count);
  let created = 0;
  for (const v of videos) {
    const data = {
      title: v.title,
      youtubeId: v.id,
      thumbnail: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
      duration: v.duration || null,
      categoryId: pickCategory(v.title, catBySlug),
      publishedAt: new Date(v.publishedAt),
      views: v.views || 0,
    };
    const existing = await prisma.video.findFirst({ where: { youtubeId: v.id } });
    if (existing) await prisma.video.update({ where: { id: existing.id }, data });
    else {
      await prisma.video.create({ data });
      created++;
    }
  }
  console.log(`videos: ${videos.length} in dataset, ${created} newly created`);
}

async function assignImages() {
  const credits = readJson("credits.json");
  const groups = {};
  for (const slot of Object.keys(credits)) {
    const m = slot.match(/^(.+)-(\d+)$/);
    (groups[m[1]] = groups[m[1]] || []).push(slot);
  }
  for (const g of Object.keys(groups)) groups[g].sort();

  let updated = 0;
  for (const [group, slots] of Object.entries(groups)) {
    const cat = await prisma.category.findUnique({
      where: { slug: GROUP_TO_SLUG[group] },
    });
    if (!cat) continue;
    const articles = await prisma.article.findMany({
      where: { categoryId: cat.id },
      orderBy: { id: "asc" },
      select: { id: true },
    });
    for (let i = 0; i < articles.length; i++) {
      const c = credits[slots[i % slots.length]];
      await prisma.article.update({
        where: { id: articles[i].id },
        data: { image: c.file, imageCaption: creditLine(c) },
      });
      updated++;
    }
  }
  const remaining = await prisma.article.count({
    where: { image: { contains: "/images/sample/" } },
  });
  console.log(`article images assigned: ${updated}; still on samples: ${remaining}`);
}

async function main() {
  const cats = await prisma.category.findMany();
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c]));
  await importVideos(catBySlug);
  await assignImages();
  console.log("DONE — production content ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
