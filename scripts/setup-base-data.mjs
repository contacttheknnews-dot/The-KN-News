// Seeds ONLY the structural data the admin panel needs to create content:
// the 13 navigation categories, the UP district subcategories, and the
// editor-in-chief author profile. No sample articles, videos, or users.
//
// Idempotent (upsert by slug) — safe to run repeatedly, including against
// the production database:
//
//   node --env-file=.env scripts/setup-base-data.mjs
//
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const mains = [
  { name: "देश", nameEn: "National", slug: "desh", order: 1 },
  { name: "उत्तर प्रदेश", nameEn: "Uttar Pradesh", slug: "uttar-pradesh", order: 2 },
  { name: "दिल्ली NCR", nameEn: "Delhi NCR", slug: "delhi-ncr", order: 3 },
  { name: "राजनीति", nameEn: "Politics", slug: "rajniti", order: 4 },
  { name: "क्रिकेट", nameEn: "Cricket", slug: "cricket", order: 5 },
  { name: "खेल", nameEn: "Sports", slug: "khel", order: 6 },
  { name: "मनोरंजन", nameEn: "Entertainment", slug: "manoranjan", order: 7 },
  { name: "बिजनेस", nameEn: "Business", slug: "business", order: 8 },
  { name: "टेक्नोलॉजी", nameEn: "Technology", slug: "technology", order: 9 },
  { name: "शिक्षा", nameEn: "Education", slug: "shiksha", order: 10 },
  { name: "नौकरी", nameEn: "Jobs", slug: "naukri", order: 11 },
  { name: "लाइफस्टाइल", nameEn: "Lifestyle", slug: "lifestyle", order: 12 },
  { name: "अपराध", nameEn: "Crime", slug: "apradh", order: 13 },
];

const upChildren = [
  { name: "गाजीपुर", nameEn: "Ghazipur", slug: "ghazipur", order: 1 },
  { name: "वाराणसी", nameEn: "Varanasi", slug: "varanasi", order: 2 },
  { name: "जौनपुर", nameEn: "Jaunpur", slug: "jaunpur", order: 3 },
  { name: "लखनऊ", nameEn: "Lucknow", slug: "lucknow", order: 4 },
  { name: "प्रयागराज", nameEn: "Prayagraj", slug: "prayagraj", order: 5 },
  { name: "नोएडा", nameEn: "Noida", slug: "noida", order: 6 },
  { name: "ग्रेटर नोएडा", nameEn: "Greater Noida", slug: "greater-noida", order: 7 },
  { name: "आगरा", nameEn: "Agra", slug: "agra", order: 8 },
  { name: "गोरखपुर", nameEn: "Gorakhpur", slug: "gorakhpur", order: 9 },
  { name: "अन्य जिले", nameEn: "Other Districts", slug: "anya-jile", order: 10 },
];

async function main() {
  for (const c of mains) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  const up = await prisma.category.findUnique({ where: { slug: "uttar-pradesh" } });
  for (const c of upChildren) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, parentId: up.id, showInNav: false },
    });
  }

  await prisma.author.upsert({
    where: { slug: "krishna-nand-yadav" },
    update: {},
    create: {
      name: "कृष्ण नन्द यादव",
      slug: "krishna-nand-yadav",
      designation: "संपादक (Editor-in-Chief)",
      bio: "The KN News के संस्थापक एवं संपादक। उत्तर प्रदेश की पत्रकारिता में एक दशक से अधिक का अनुभव।",
      facebook: "https://www.facebook.com/profile.php?id=61554741623006",
      twitter: "https://x.com/thekngroup7622",
      instagram: "https://www.instagram.com/theknnews_/",
    },
  });

  const [cats, authors] = await Promise.all([prisma.category.count(), prisma.author.count()]);
  console.log(`done — categories: ${cats}, authors: ${authors}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
