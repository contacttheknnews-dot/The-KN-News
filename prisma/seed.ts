// Seed data for The KN News — realistic but clearly-fictional sample content.
// Every article body ends with a note that it is sample content, so the
// editorial team knows to replace it. Run: npm run db:seed

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000);

type Entry = {
  title: string;
  slug: string;
  cat: string;
  subcat?: string;
  author: number; // index into authors
  location?: string;
  excerpt: string;
  points: string[];
  quote?: string;
  tags: string[];
  featured?: boolean;
  opinion?: boolean;
  views: number;
  h: number; // published hours ago
  img: string; // image path
};

function body(e: Entry): string {
  const parts = [
    `<p>${e.excerpt} इस पूरे घटनाक्रम पर The KN News की टीम लगातार नज़र बनाए हुए है और हर नई जानकारी सबसे पहले आप तक पहुंचाई जाएगी।</p>`,
    `<h2>मुख्य बातें</h2>`,
    `<ul>${e.points.map((p) => `<li>${p}</li>`).join("")}</ul>`,
  ];
  if (e.quote) {
    parts.push(`<blockquote>${e.quote}</blockquote>`);
  }
  parts.push(
    `<p>स्थानीय स्तर पर इस खबर को लेकर लोगों में खासी चर्चा है। जानकारों का मानना है कि आने वाले दिनों में इसके और भी पहलू सामने आ सकते हैं। संबंधित पक्षों से प्रतिक्रिया ली जा रही है और विस्तृत रिपोर्ट जल्द प्रकाशित की जाएगी।</p>`,
    `<p>ऐसी ही ताज़ा और भरोसेमंद खबरों के लिए The KN News के साथ जुड़े रहें। आप हमें Facebook, X, Telegram और WhatsApp चैनल पर भी फॉलो कर सकते हैं।</p>`,
    `<p><em>नोट: यह एक नमूना (sample) खबर है — प्रकाशन से पूर्व इसे वास्तविक संपादकीय सामग्री से बदलें।</em></p>`
  );
  return parts.join("\n");
}

// Refuse to seed a database that looks like production. The seed both creates
// default accounts AND (below) resets breaking-news/videos/galleries/ads/
// comments — running it against the live DB has already destroyed real data
// once. Override only with an explicit, unambiguous env flag.
function assertNotProduction() {
  const url = process.env.DATABASE_URL ?? "";
  const looksProd =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production" ||
    [/ep-noisy-sun/i, /neondb_owner/i, /theknnews/i].some((re) => re.test(url));
  if (looksProd && process.env.SEED_CONFIRM_PROD !== "I_UNDERSTAND_THIS_WIPES_DATA") {
    throw new Error(
      "seed.ts refused: DATABASE_URL looks like production. Point it at a dev branch, " +
        "or set SEED_CONFIRM_PROD=I_UNDERSTAND_THIS_WIPES_DATA to override."
    );
  }
}

async function main() {
  assertNotProduction();
  console.log("Seeding The KN News …");

  /* ---------- Users ---------- */
  // Dev default; override with SEED_ADMIN_PASSWORD. Never ships to prod (guarded
  // above), and existing users are never overwritten (upsert update:{}).
  const password = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || "admin123", 12);
  const usersData = [
    { email: "admin@theknnews.com", name: "Krishna Nand Yadav", role: "SUPER_ADMIN" },
    { email: "editor@theknnews.com", name: "Rahul Srivastav", role: "EDITOR" },
    { email: "reporter@theknnews.com", name: "Priya Singh", role: "REPORTER" },
    { email: "ads@theknnews.com", name: "Sanjay Verma", role: "AD_MANAGER" },
    { email: "moderator@theknnews.com", name: "Neha Gupta", role: "MODERATOR" },
  ];
  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash: password },
    });
  }

  /* ---------- Authors ---------- */
  const authorsData = [
    {
      name: "कृष्ण नन्द यादव",
      slug: "krishna-nand-yadav",
      designation: "संपादक (Editor-in-Chief)",
      bio: "The KN News के संस्थापक एवं संपादक। उत्तर प्रदेश की पत्रकारिता में एक दशक से अधिक का अनुभव।",
      photo: "/images/sample/author-1.svg",
      facebook: "https://www.facebook.com/profile.php?id=61554741623006",
      twitter: "https://x.com/thekngroup7622",
      instagram: "https://www.instagram.com/theknnews_/",
    },
    {
      name: "राहुल श्रीवास्तव",
      slug: "rahul-srivastav",
      designation: "वरिष्ठ संवाददाता",
      bio: "राजनीति और प्रशासन की गहरी समझ रखने वाले वरिष्ठ पत्रकार।",
      photo: "/images/sample/author-2.svg",
    },
    {
      name: "प्रिया सिंह",
      slug: "priya-singh",
      designation: "विशेष संवाददाता",
      bio: "शिक्षा, समाज और ग्राउंड रिपोर्टिंग में विशेषज्ञता।",
      photo: "/images/sample/author-3.svg",
    },
    {
      name: "अमित तिवारी",
      slug: "amit-tiwari",
      designation: "क्रिकेट विश्लेषक",
      bio: "क्रिकेट के आंकड़ों और रणनीति के जानकार। The KN Cricket के प्रमुख।",
      photo: "/images/sample/author-4.svg",
    },
    {
      name: "नेहा गुप्ता",
      slug: "neha-gupta",
      designation: "मनोरंजन संवाददाता",
      bio: "बॉलीवुड, OTT और म्यूज़िक इंडस्ट्री की खबरों पर पकड़।",
      photo: "/images/sample/author-5.svg",
    },
    {
      name: "संजय वर्मा",
      slug: "sanjay-verma",
      designation: "बिजनेस संपादक",
      bio: "बाजार, अर्थव्यवस्था और पर्सनल फाइनेंस के विशेषज्ञ।",
      photo: "/images/sample/author-6.svg",
    },
  ];
  const authors = [];
  for (const a of authorsData) {
    authors.push(
      await prisma.author.upsert({ where: { slug: a.slug }, update: {}, create: a })
    );
  }

  /* ---------- Categories ---------- */
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
  const catBySlug: Record<string, { id: number }> = {};
  for (const c of mains) {
    catBySlug[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
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
  for (const c of upChildren) {
    catBySlug[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, parentId: catBySlug["uttar-pradesh"].id, showInNav: false },
    });
  }

  /* ---------- Articles ---------- */
  const img = (slug: string, v: number) => `/images/sample/${slug}-${v}.svg`;
  const E: Entry[] = [
    // ---------------- उत्तर प्रदेश ----------------
    {
      title: "गाजीपुर में गंगा किनारे बनेगा नया रिवरफ्रंट, पर्यटन को मिलेगी नई उड़ान",
      slug: "ghazipur-ganga-riverfront-yojana",
      cat: "uttar-pradesh", subcat: "ghazipur", author: 0, location: "गाजीपुर",
      excerpt: "गाजीपुर के गंगा घाटों को विकसित कर रिवरफ्रंट बनाने की परियोजना को प्रशासनिक मंजूरी मिल गई है।",
      points: [
        "पहले चरण में तीन प्रमुख घाटों का सौंदर्यीकरण होगा",
        "स्थानीय युवाओं को रोजगार के नए अवसर मिलने की उम्मीद",
        "परियोजना दो वर्षों में पूरी करने का लक्ष्य",
      ],
      quote: "“रिवरफ्रंट बनने से गाजीपुर की पहचान और मजबूत होगी।” — जिला प्रशासन (नमूना बयान)",
      tags: ["गाजीपुर", "विकास", "पर्यटन"],
      featured: true, views: 45200, h: 3, img: img("uttar-pradesh", 1),
    },
    {
      title: "गाजीपुर के किसान ने जैविक खेती से बदली तकदीर, अब दूसरों को दे रहे प्रशिक्षण",
      slug: "ghazipur-jaivik-kheti-safalta",
      cat: "uttar-pradesh", subcat: "ghazipur", author: 2, location: "गाजीपुर",
      excerpt: "जिले के एक किसान ने जैविक खेती अपनाकर आय तीन गुना बढ़ाई और अब गांव-गांव जाकर किसानों को प्रशिक्षित कर रहे हैं।",
      points: [
        "पांच एकड़ में जैविक सब्जियों की खेती",
        "जिले भर से किसान प्रशिक्षण लेने पहुंच रहे",
        "कृषि विभाग ने सम्मानित करने की घोषणा की",
      ],
      tags: ["गाजीपुर", "किसान", "जैविक खेती"],
      views: 12800, h: 26, img: img("uttar-pradesh", 2),
    },
    {
      title: "वाराणसी में देव दीपावली की तैयारियां शुरू, घाटों पर जलेंगे लाखों दीये",
      slug: "varanasi-dev-deepawali-taiyari",
      cat: "uttar-pradesh", subcat: "varanasi", author: 2, location: "वाराणसी",
      excerpt: "काशी के घाटों पर देव दीपावली की भव्य तैयारियां शुरू हो गई हैं, इस बार रिकॉर्ड संख्या में दीये जलाने की योजना है।",
      points: [
        "84 घाटों पर होगी विशेष सजावट",
        "लेज़र शो और सांस्कृतिक कार्यक्रमों का आयोजन",
        "पर्यटकों की भारी भीड़ की संभावना, सुरक्षा बढ़ाई गई",
      ],
      tags: ["वाराणसी", "देव दीपावली", "संस्कृति"],
      views: 31500, h: 8, img: img("uttar-pradesh", 3),
    },
    {
      title: "लखनऊ मेट्रो के नए कॉरिडोर को मंजूरी, इन इलाकों को मिलेगा सीधा फायदा",
      slug: "lucknow-metro-new-corridor",
      cat: "uttar-pradesh", subcat: "lucknow", author: 1, location: "लखनऊ",
      excerpt: "लखनऊ मेट्रो के दूसरे चरण के नए कॉरिडोर को मंजूरी मिल गई है, जिससे शहर के पूर्वी इलाकों की कनेक्टिविटी बेहतर होगी।",
      points: [
        "नए कॉरिडोर में 12 स्टेशन प्रस्तावित",
        "निर्माण कार्य अगले वर्ष से शुरू होने की उम्मीद",
        "रोज़ाना दो लाख यात्रियों को लाभ का अनुमान",
      ],
      tags: ["लखनऊ", "मेट्रो", "विकास"],
      views: 18900, h: 14, img: img("delhi-ncr", 2),
    },
    {
      title: "गोरखपुर में खाद कारखाने का विस्तार, हजारों को मिलेगा रोजगार",
      slug: "gorakhpur-khad-karkhana-vistar",
      cat: "uttar-pradesh", subcat: "gorakhpur", author: 1, location: "गोरखपुर",
      excerpt: "गोरखपुर के उर्वरक संयंत्र के विस्तार की योजना को हरी झंडी मिल गई है, स्थानीय स्तर पर रोजगार बढ़ने की उम्मीद है।",
      points: [
        "नई उत्पादन इकाई अगले साल होगी शुरू",
        "प्रत्यक्ष-अप्रत्यक्ष रूप से 5,000 रोजगार का अनुमान",
        "पूर्वांचल की अर्थव्यवस्था को मिलेगी मजबूती",
      ],
      tags: ["गोरखपुर", "रोजगार", "उद्योग"],
      views: 9700, h: 33, img: img("business", 2),
    },
    {
      title: "नोएडा में बनेगा प्रदेश का सबसे बड़ा स्पोर्ट्स कॉम्प्लेक्स",
      slug: "noida-sports-complex-yojana",
      cat: "uttar-pradesh", subcat: "noida", author: 3, location: "नोएडा",
      excerpt: "नोएडा प्राधिकरण ने अंतरराष्ट्रीय स्तर के स्पोर्ट्स कॉम्प्लेक्स की योजना पेश की है, जिसमें क्रिकेट स्टेडियम भी शामिल होगा।",
      points: [
        "40 एकड़ में फैला होगा कॉम्प्लेक्स",
        "क्रिकेट, फुटबॉल, बैडमिंटन समेत 15 खेलों की सुविधा",
        "युवा खिलाड़ियों के लिए अकादमी भी प्रस्तावित",
      ],
      tags: ["नोएडा", "खेल", "क्रिकेट"],
      views: 14300, h: 40, img: img("khel", 1),
    },
    // ---------------- देश ----------------
    {
      title: "देशभर में डिजिटल साक्षरता अभियान का विस्तार, गांव-गांव पहुंचेगी ट्रेनिंग",
      slug: "digital-saksharta-abhiyan-vistar",
      cat: "desh", author: 1, location: "नई दिल्ली",
      excerpt: "डिजिटल साक्षरता अभियान के नए चरण में ग्रामीण क्षेत्रों के करोड़ों नागरिकों को प्रशिक्षित करने का लक्ष्य रखा गया है।",
      points: [
        "पंचायत स्तर पर लगेंगे प्रशिक्षण शिविर",
        "महिलाओं और बुजुर्गों पर विशेष फोकस",
        "ऑनलाइन ठगी से बचाव की भी ट्रेनिंग",
      ],
      tags: ["डिजिटल इंडिया", "शिक्षा"],
      featured: true, views: 52100, h: 5, img: img("desh", 1),
    },
    {
      title: "रेलवे ने त्योहारों के लिए चलाईं 200 स्पेशल ट्रेनें, यूपी-बिहार रूट पर सबसे ज्यादा",
      slug: "railway-festival-special-trains",
      cat: "desh", author: 2, location: "नई दिल्ली",
      excerpt: "त्योहारी सीजन में यात्रियों की भीड़ को देखते हुए रेलवे ने 200 से अधिक स्पेशल ट्रेनों का ऐलान किया है।",
      points: [
        "यूपी-बिहार रूट पर 80 से अधिक स्पेशल ट्रेनें",
        "ऑनलाइन बुकिंग आज से शुरू",
        "प्रमुख स्टेशनों पर अतिरिक्त सुरक्षा व्यवस्था",
      ],
      tags: ["रेलवे", "त्योहार"],
      views: 38600, h: 10, img: img("desh", 2),
    },
    {
      title: "मौसम विभाग का अलर्ट: उत्तर भारत में अगले हफ्ते बदलेगा मौसम का मिजाज",
      slug: "mausam-alert-uttar-bharat",
      cat: "desh", author: 2, location: "नई दिल्ली",
      excerpt: "मौसम विभाग ने उत्तर भारत के कई राज्यों में तापमान गिरने और कुछ इलाकों में बारिश की संभावना जताई है।",
      points: [
        "पहाड़ी राज्यों में बर्फबारी के आसार",
        "मैदानी इलाकों में सुबह-शाम ठंड बढ़ेगी",
        "किसानों को फसल सुरक्षा की सलाह",
      ],
      tags: ["मौसम", "अलर्ट"],
      views: 27400, h: 18, img: img("desh", 3),
    },
    {
      title: "स्वच्छ भारत रैंकिंग जारी: यूपी के तीन शहर टॉप-20 में शामिल",
      slug: "swachh-bharat-ranking-up-shahar",
      cat: "desh", author: 0, location: "नई दिल्ली",
      excerpt: "स्वच्छता सर्वेक्षण की ताज़ा रैंकिंग में उत्तर प्रदेश के तीन शहरों ने टॉप-20 में जगह बनाकर प्रदेश का मान बढ़ाया है।",
      points: [
        "लखनऊ ने पिछले साल से 8 पायदान की छलांग लगाई",
        "छोटे शहरों की श्रेणी में भी यूपी का दबदबा",
        "नगर निगमों की भूमिका सराही गई",
      ],
      tags: ["स्वच्छ भारत", "यूपी"],
      views: 15800, h: 45, img: img("uttar-pradesh", 1),
    },
    // ---------------- दिल्ली NCR ----------------
    {
      title: "दिल्ली-NCR में इलेक्ट्रिक बसों का बेड़ा बढ़ा, 500 नई बसें सड़कों पर उतरीं",
      slug: "delhi-ncr-electric-bus-beda",
      cat: "delhi-ncr", author: 1, location: "नई दिल्ली",
      excerpt: "प्रदूषण से निपटने की दिशा में बड़ा कदम उठाते हुए दिल्ली-NCR में 500 नई इलेक्ट्रिक बसें शुरू की गई हैं।",
      points: [
        "नई बसों में GPS और पैनिक बटन की सुविधा",
        "महिलाओं के लिए रिज़र्व सीटें बढ़ाई गईं",
        "अगले साल तक 1,000 और बसों की योजना",
      ],
      tags: ["दिल्ली", "परिवहन", "पर्यावरण"],
      views: 21900, h: 7, img: img("delhi-ncr", 1),
    },
    {
      title: "ग्रेटर नोएडा में नई IT सिटी की योजना, बड़ी कंपनियों ने दिखाई रुचि",
      slug: "greater-noida-it-city-yojana",
      cat: "delhi-ncr", author: 5, location: "ग्रेटर नोएडा",
      excerpt: "ग्रेटर नोएडा में प्रस्तावित IT सिटी को लेकर कई बड़ी टेक कंपनियों ने निवेश की इच्छा जताई है।",
      points: [
        "पहले चरण में 300 एकड़ भूमि चिह्नित",
        "50,000 प्रत्यक्ष रोजगार का अनुमान",
        "मेट्रो कनेक्टिविटी का भी प्रस्ताव",
      ],
      tags: ["ग्रेटर नोएडा", "IT", "निवेश"],
      views: 17600, h: 21, img: img("technology", 2),
    },
    {
      title: "गाजियाबाद में यातायात व्यवस्था सुधारने के लिए नया ट्रैफिक प्लान लागू",
      slug: "ghaziabad-traffic-plan-lagu",
      cat: "delhi-ncr", author: 2, location: "गाजियाबाद",
      excerpt: "गाजियाबाद में जाम की समस्या से निपटने के लिए नया ट्रैफिक प्लान लागू किया गया है।",
      points: [
        "पीक आवर्स में भारी वाहनों की एंट्री बंद",
        "प्रमुख चौराहों पर स्मार्ट सिग्नल",
        "ई-चालान व्यवस्था और सख्त",
      ],
      tags: ["गाजियाबाद", "ट्रैफिक"],
      views: 8900, h: 30, img: img("delhi-ncr", 3),
    },
    {
      title: "गुरुग्राम में साइबर सुरक्षा केंद्र की शुरुआत, NCR के शिकायतकर्ताओं को राहत",
      slug: "gurugram-cyber-suraksha-kendra",
      cat: "delhi-ncr", author: 1, location: "गुरुग्राम",
      excerpt: "साइबर अपराधों की बढ़ती शिकायतों के बीच गुरुग्राम में अत्याधुनिक साइबर सुरक्षा केंद्र शुरू किया गया है।",
      points: [
        "24x7 हेल्पलाइन की सुविधा",
        "ऑनलाइन ठगी के मामलों की फास्ट-ट्रैक जांच",
        "जागरूकता कार्यक्रम भी चलाए जाएंगे",
      ],
      tags: ["गुरुग्राम", "साइबर क्राइम"],
      views: 11200, h: 52, img: img("apradh", 2),
    },
    // ---------------- राजनीति ----------------
    {
      title: "यूपी विधानसभा का शीतकालीन सत्र: इन बड़े मुद्दों पर होगी चर्चा",
      slug: "up-vidhansabha-sheetkalin-satra",
      cat: "rajniti", author: 1, location: "लखनऊ",
      excerpt: "उत्तर प्रदेश विधानसभा का शीतकालीन सत्र अगले सप्ताह से शुरू हो रहा है, जिसमें कई अहम विधेयक पेश किए जाएंगे।",
      points: [
        "शिक्षा और स्वास्थ्य बजट पर विशेष चर्चा",
        "विपक्ष ने कानून-व्यवस्था पर घेरने की तैयारी की",
        "सत्र 10 दिन चलने की संभावना",
      ],
      quote: "“जनता से जुड़े हर मुद्दे पर सार्थक बहस होगी।” — विधानसभा अध्यक्ष (नमूना बयान)",
      tags: ["यूपी", "विधानसभा", "राजनीति"],
      featured: true, views: 41300, h: 6, img: img("rajniti", 1),
    },
    {
      title: "पंचायत चुनाव की तैयारियां तेज़, आरक्षण सूची पर सबकी निगाहें",
      slug: "panchayat-chunav-taiyari-aarakshan",
      cat: "rajniti", author: 1, location: "लखनऊ",
      excerpt: "प्रदेश में पंचायत चुनाव की सुगबुगाहट तेज़ हो गई है और आरक्षण सूची को लेकर दावेदारों की धड़कनें बढ़ी हुई हैं।",
      points: [
        "निर्वाचन आयोग ने शुरू की मतदाता सूची की समीक्षा",
        "ग्राम प्रधान पदों के लिए दावेदारी तेज़",
        "अगले माह अधिसूचना जारी होने की संभावना",
      ],
      tags: ["पंचायत चुनाव", "यूपी"],
      views: 33800, h: 12, img: img("rajniti", 2),
    },
    {
      title: "केंद्र की नई योजना पर सियासत गरम, पक्ष-विपक्ष में तीखी बयानबाजी",
      slug: "kendra-yojana-siyasat-bayanbazi",
      cat: "rajniti", author: 1, location: "नई दिल्ली",
      excerpt: "केंद्र सरकार की नई कल्याणकारी योजना को लेकर राजनीतिक दलों के बीच बयानबाजी तेज़ हो गई है।",
      points: [
        "सत्ता पक्ष ने बताया ऐतिहासिक कदम",
        "विपक्ष ने क्रियान्वयन पर उठाए सवाल",
        "विशेषज्ञ बोले — असली परीक्षा ज़मीन पर होगी",
      ],
      tags: ["राजनीति", "योजना"],
      views: 19500, h: 24, img: img("rajniti", 3),
    },
    {
      title: "विश्लेषण: पूर्वांचल की राजनीति में क्यों बढ़ रहा है युवा चेहरों का दबदबा",
      slug: "vishleshan-purvanchal-yuva-rajniti",
      cat: "rajniti", author: 0, location: "गाजीपुर",
      excerpt: "पूर्वांचल की राजनीति में युवा नेतृत्व तेजी से उभर रहा है — इसके पीछे सोशल मीडिया और बदलती आकांक्षाओं की बड़ी भूमिका है।",
      points: [
        "स्थानीय मुद्दों पर मुखर हो रहे युवा नेता",
        "सोशल मीडिया बना नई राजनीतिक ज़मीन",
        "पुराने समीकरणों में बदलाव के संकेत",
      ],
      tags: ["पूर्वांचल", "विश्लेषण", "युवा"],
      opinion: true, views: 24700, h: 36, img: img("vichar", 1),
    },
    {
      title: "विचार: स्थानीय पत्रकारिता ही लोकतंत्र की असली प्रहरी है",
      slug: "vichar-sthaniya-patrakarita-loktantra",
      cat: "rajniti", author: 0, location: "गाजीपुर",
      excerpt: "जिले और कस्बे की खबरें ही आम आदमी के जीवन को सबसे ज्यादा छूती हैं — इसलिए स्थानीय पत्रकारिता का मजबूत होना जरूरी है।",
      points: [
        "स्थानीय मुद्दों को राष्ट्रीय मंच तक पहुंचाने की जरूरत",
        "डिजिटल माध्यमों ने खोले नए रास्ते",
        "भरोसे की पत्रकारिता ही टिकाऊ है",
      ],
      quote: "“खबर वही, जो ज़मीन से जुड़ी हो — यही The KN News की दूरगामी सोच है।”",
      tags: ["पत्रकारिता", "विचार"],
      opinion: true, views: 16200, h: 60, img: img("vichar", 2),
    },
    // ---------------- क्रिकेट ----------------
    {
      title: "भारतीय टीम का नया कीर्तिमान: लगातार आठवीं सीरीज जीत के साथ रचा इतिहास",
      slug: "team-india-series-jeet-kirtiman",
      cat: "cricket", author: 3, location: "मुंबई",
      excerpt: "भारतीय क्रिकेट टीम ने शानदार प्रदर्शन करते हुए लगातार आठवीं द्विपक्षीय सीरीज अपने नाम की।",
      points: [
        "आखिरी मैच में 6 विकेट से जीत",
        "युवा बल्लेबाज़ों का दमदार प्रदर्शन",
        "कप्तान बोले — टीम संतुलन ही ताकत",
      ],
      tags: ["टीम इंडिया", "series-update", "क्रिकेट"],
      featured: true, views: 88400, h: 4, img: img("cricket", 1),
    },
    {
      title: "मैच रिपोर्ट: रोमांचक मुकाबले में भारत ने आखिरी ओवर में मारी बाज़ी",
      slug: "match-report-akhri-over-jeet",
      cat: "cricket", author: 3, location: "कोलकाता",
      excerpt: "आखिरी ओवर तक चले रोमांचक मुकाबले में भारतीय टीम ने 4 विकेट से जीत दर्ज की।",
      points: [
        "लक्ष्य: 187 — भारत ने 19.5 ओवर में हासिल किया",
        "मध्यक्रम की साझेदारी बनी जीत की नींव",
        "गेंदबाज़ों ने डेथ ओवरों में कसी लगाम",
      ],
      quote: "“दबाव में शांत रहना ही हमारी जीत की कुंजी थी।” — मैन ऑफ द मैच (नमूना बयान)",
      tags: ["match-report", "T20", "टीम इंडिया"],
      views: 61200, h: 9, img: img("cricket", 2),
    },
    {
      title: "सीरीज अपडेट: अगले महीने होगी बड़ी टेस्ट सीरीज, शेड्यूल जारी",
      slug: "series-update-test-schedule",
      cat: "cricket", author: 3, location: "नई दिल्ली",
      excerpt: "अगले महीने शुरू होने वाली बहुप्रतीक्षित टेस्ट सीरीज का पूरा कार्यक्रम जारी कर दिया गया है।",
      points: [
        "पांच मैचों की सीरीज, पहला टेस्ट 5 तारीख से",
        "दो नए स्टेडियमों को मिली मेज़बानी",
        "टिकटों की ऑनलाइन बिक्री शुरू",
      ],
      tags: ["series-update", "टेस्ट क्रिकेट"],
      views: 42700, h: 15, img: img("cricket", 3),
    },
    {
      title: "रिकॉर्ड्स: T20 में सबसे तेज़ शतक के ये हैं पांच बड़े कीर्तिमान",
      slug: "records-t20-sabse-tez-shatak",
      cat: "cricket", author: 3,
      excerpt: "T20 क्रिकेट में सबसे तेज़ शतकों की सूची में इस सीज़न बड़ा फेरबदल देखने को मिला है।",
      points: [
        "35 गेंदों का शतक बना चर्चा का विषय",
        "भारतीय बल्लेबाज़ टॉप-5 में शामिल",
        "स्ट्राइक रेट का बढ़ता महत्व",
      ],
      tags: ["cricket-records", "T20", "रिकॉर्ड"],
      views: 35900, h: 22, img: img("cricket", 1),
    },
    {
      title: "खिलाड़ी विशेष: चोट से वापसी कर रहे स्टार तेज़ गेंदबाज़ की कहानी",
      slug: "khiladi-vishesh-tez-gendbaaz-wapsi",
      cat: "cricket", author: 3,
      excerpt: "लंबी चोट के बाद मैदान पर लौट रहे स्टार तेज़ गेंदबाज़ ने अपनी फिटनेस यात्रा साझा की।",
      points: [
        "आठ महीने की रिहैब प्रक्रिया",
        "घरेलू क्रिकेट से करेंगे वापसी",
        "विश्व कप टीम में जगह की दावेदारी",
      ],
      tags: ["players", "फिटनेस"],
      views: 28600, h: 28, img: img("cricket", 2),
    },
    {
      title: "विश्लेषण: पावरप्ले में आक्रामकता — आंकड़े क्या कहते हैं?",
      slug: "vishleshan-powerplay-aankde",
      cat: "cricket", author: 3,
      excerpt: "पिछले दो सीज़न के आंकड़े बताते हैं कि पावरप्ले की रणनीति ही T20 मैचों का रुख तय कर रही है।",
      points: [
        "पहले 6 ओवर में रन रेट 22% बढ़ा",
        "आक्रामक ओपनिंग वाली टीमों की जीत दर ऊंची",
        "गेंदबाज़ी टीमें अपना रहीं नई फील्ड सेटिंग",
      ],
      tags: ["cricket-analysis", "T20", "आंकड़े"],
      views: 22100, h: 38, img: img("cricket", 3),
    },
    {
      title: "घरेलू क्रिकेट: यूपी के युवा बल्लेबाज़ का दोहरा शतक, चयनकर्ताओं की नज़र",
      slug: "up-yuva-batsman-dohra-shatak",
      cat: "cricket", author: 3, location: "कानपुर",
      excerpt: "घरेलू टूर्नामेंट में उत्तर प्रदेश के युवा बल्लेबाज़ ने दोहरा शतक जड़कर चयनकर्ताओं का ध्यान खींचा है।",
      points: [
        "248 रनों की नाबाद पारी",
        "इस सीज़न 800 से ज्यादा रन",
        "अंडर-23 टीम से राष्ट्रीय स्तर तक का सफर",
      ],
      tags: ["players", "घरेलू क्रिकेट", "यूपी"],
      views: 19800, h: 44, img: img("cricket", 1),
    },
    {
      title: "महिला क्रिकेट: भारतीय टीम की सीरीज जीत, गेंदबाज़ों ने दिखाया दम",
      slug: "mahila-cricket-series-jeet",
      cat: "cricket", author: 3, location: "बेंगलुरु",
      excerpt: "भारतीय महिला क्रिकेट टीम ने शानदार गेंदबाज़ी के दम पर सीरीज 2-1 से अपने नाम की।",
      points: [
        "स्पिन तिकड़ी ने चटकाए 18 विकेट",
        "निर्णायक मैच में 45 रन से जीत",
        "अगली चुनौती विश्व कप क्वालिफायर",
      ],
      tags: ["महिला क्रिकेट", "series-update"],
      views: 17400, h: 50, img: img("cricket", 2),
    },
    // ---------------- खेल ----------------
    {
      title: "हॉकी: भारतीय टीम ने एशियाई टूर्नामेंट के फाइनल में बनाई जगह",
      slug: "hockey-asian-tournament-final",
      cat: "khel", author: 3,
      excerpt: "भारतीय हॉकी टीम ने सेमीफाइनल में शानदार जीत दर्ज कर टूर्नामेंट के फाइनल में प्रवेश किया।",
      points: [
        "सेमीफाइनल में 3-1 से जीत",
        "ड्रैग फ्लिकर का शानदार प्रदर्शन",
        "फाइनल रविवार को",
      ],
      tags: ["हॉकी", "टीम इंडिया"],
      views: 13600, h: 11, img: img("khel", 1),
    },
    {
      title: "बैडमिंटन: युवा शटलर ने जीता पहला अंतरराष्ट्रीय खिताब",
      slug: "badminton-yuva-shuttler-khitab",
      cat: "khel", author: 2,
      excerpt: "भारत की युवा बैडमिंटन खिलाड़ी ने करियर का पहला अंतरराष्ट्रीय खिताब जीतकर इतिहास रच दिया।",
      points: [
        "फाइनल में सीधे गेम में जीत",
        "विश्व रैंकिंग में लंबी छलांग तय",
        "अगला लक्ष्य ओलंपिक क्वालिफिकेशन",
      ],
      tags: ["बैडमिंटन"],
      views: 11900, h: 19, img: img("khel", 2),
    },
    {
      title: "फुटबॉल: भारतीय लीग का नया सीज़न शुरू, पहले मैच में रोमांचक ड्रॉ",
      slug: "football-league-naya-season",
      cat: "khel", author: 3,
      excerpt: "भारतीय फुटबॉल लीग के नए सीज़न की शुरुआत रोमांचक मुकाबले से हुई, पहला मैच 2-2 से ड्रॉ रहा।",
      points: [
        "दोनों गोल दूसरे हाफ में",
        "स्टेडियम में रिकॉर्ड दर्शक",
        "अगला मुकाबला शनिवार को",
      ],
      tags: ["फुटबॉल", "लीग"],
      views: 9400, h: 27, img: img("khel", 3),
    },
    {
      title: "एथलेटिक्स: यूपी की धाविका ने राष्ट्रीय रिकॉर्ड तोड़ा",
      slug: "athletics-up-dhavika-record",
      cat: "khel", author: 2, location: "लखनऊ",
      excerpt: "राष्ट्रीय एथलेटिक्स चैंपियनशिप में उत्तर प्रदेश की धाविका ने 400 मीटर दौड़ का रिकॉर्ड तोड़ दिया।",
      points: [
        "51.2 सेकंड में पूरी की दौड़",
        "गांव से राष्ट्रीय स्तर तक का संघर्ष",
        "अंतरराष्ट्रीय स्पर्धा के लिए क्वालिफाई",
      ],
      tags: ["एथलेटिक्स", "यूपी"],
      views: 8700, h: 42, img: img("khel", 1),
    },
    // ---------------- मनोरंजन ----------------
    {
      title: "बॉक्स ऑफिस: नई फिल्म ने पहले वीकेंड पर की रिकॉर्ड कमाई",
      slug: "box-office-record-kamai",
      cat: "manoranjan", author: 4, location: "मुंबई",
      excerpt: "इस हफ्ते रिलीज़ हुई बड़े बजट की फिल्म ने पहले ही वीकेंड में कमाई के कई रिकॉर्ड तोड़ दिए।",
      points: [
        "तीन दिन में 150 करोड़ का आंकड़ा पार",
        "छोटे शहरों में भी जबरदस्त रिस्पॉन्स",
        "समीक्षकों ने की अभिनय की तारीफ",
      ],
      tags: ["बॉलीवुड", "बॉक्स ऑफिस"],
      views: 47800, h: 8, img: img("manoranjan", 1),
    },
    {
      title: "OTT पर इस हफ्ते: ये 5 नई वेब सीरीज़ और फिल्में देखना न भूलें",
      slug: "ott-is-hafte-web-series",
      cat: "manoranjan", author: 4,
      excerpt: "इस हफ्ते OTT प्लेटफॉर्म्स पर कई दमदार वेब सीरीज़ और फिल्में रिलीज़ हो रही हैं।",
      points: [
        "क्राइम थ्रिलर से लेकर फैमिली ड्रामा तक",
        "दो क्षेत्रीय भाषाओं की फिल्में भी सूची में",
        "वीकेंड बिंज-वॉच की पूरी गाइड",
      ],
      tags: ["OTT", "वेब सीरीज"],
      views: 29300, h: 16, img: img("manoranjan", 2),
    },
    {
      title: "भोजपुरी सिनेमा के बड़े स्टार गाजीपुर में करेंगे नई फिल्म की शूटिंग",
      slug: "bhojpuri-film-ghazipur-shooting",
      cat: "manoranjan", author: 4, location: "गाजीपुर",
      excerpt: "भोजपुरी सिनेमा के चर्चित सितारे अपनी आगामी फिल्म की शूटिंग गाजीपुर की लोकेशनों पर करने जा रहे हैं।",
      points: [
        "गंगा घाट और ऐतिहासिक स्थलों पर होगी शूटिंग",
        "स्थानीय कलाकारों को मिलेगा मौका",
        "अगले महीने से शेड्यूल शुरू",
      ],
      tags: ["भोजपुरी", "गाजीपुर", "फिल्म"],
      views: 22600, h: 25, img: img("manoranjan", 3),
    },
    {
      title: "संगीत: लोकगीतों का नया अंदाज़ — यूपी के युवा गायक की धूम",
      slug: "sangeet-lokgeet-yuva-gayak",
      cat: "manoranjan", author: 4, location: "वाराणसी",
      excerpt: "पारंपरिक लोकगीतों को आधुनिक संगीत के साथ पेश कर रहे युवा गायक के गाने सोशल मीडिया पर छाए हुए हैं।",
      points: [
        "नया गीत 5 करोड़ व्यूज़ पार",
        "कजरी और बिरहा को नई पहचान",
        "अंतरराष्ट्रीय कॉन्सर्ट का न्योता",
      ],
      tags: ["संगीत", "लोकगीत"],
      views: 18100, h: 39, img: img("manoranjan", 1),
    },
    // ---------------- बिजनेस ----------------
    {
      title: "शेयर बाजार में रिकॉर्ड तेजी, निवेशकों को एक दिन में बड़ा फायदा",
      slug: "share-bazaar-record-teji",
      cat: "business", author: 5, location: "मुंबई",
      excerpt: "घरेलू शेयर बाजार ने नई ऊंचाई छूते हुए निवेशकों को एक ही दिन में शानदार रिटर्न दिया।",
      points: [
        "सेंसेक्स-निफ्टी दोनों रिकॉर्ड स्तर पर",
        "बैंकिंग और IT शेयरों में सबसे ज्यादा तेजी",
        "विदेशी निवेशकों की जोरदार खरीदारी",
      ],
      tags: ["शेयर बाजार", "निवेश"],
      views: 26800, h: 6, img: img("business", 1),
    },
    {
      title: "छोटे शहरों के स्टार्टअप्स को मिलेगा बढ़ावा, नई फंडिंग योजना शुरू",
      slug: "chhote-shahar-startup-funding",
      cat: "business", author: 5,
      excerpt: "टियर-2 और टियर-3 शहरों के स्टार्टअप्स के लिए विशेष फंडिंग योजना की घोषणा की गई है।",
      points: [
        "शुरुआती चरण में 500 स्टार्टअप्स को सहायता",
        "यूपी के स्टार्टअप हब बनने की संभावना",
        "मेंटरशिप प्रोग्राम भी शामिल",
      ],
      tags: ["स्टार्टअप", "फंडिंग"],
      views: 15400, h: 20, img: img("business", 2),
    },
    {
      title: "पर्सनल फाइनेंस: नए साल से पहले निपटा लें ये 5 जरूरी काम",
      slug: "personal-finance-5-jaroori-kaam",
      cat: "business", author: 5,
      excerpt: "वित्तीय वर्ष की अंतिम तिमाही से पहले टैक्स और निवेश से जुड़े कुछ काम समय रहते निपटाना समझदारी है।",
      points: [
        "टैक्स-सेविंग निवेश की समीक्षा करें",
        "बीमा पॉलिसी का रिन्युअल न भूलें",
        "आपातकालीन फंड को मजबूत करें",
      ],
      tags: ["पर्सनल फाइनेंस", "टैक्स"],
      views: 12700, h: 34, img: img("business", 3),
    },
    {
      title: "गाजीपुर की हस्तशिल्प मंडी को ई-कॉमर्स से जोड़ने की पहल",
      slug: "ghazipur-hastshilp-ecommerce",
      cat: "business", author: 5, location: "गाजीपुर",
      excerpt: "गाजीपुर के पारंपरिक हस्तशिल्प उत्पादों को ऑनलाइन बाज़ार से जोड़ने की नई पहल शुरू हुई है।",
      points: [
        "200 से अधिक कारीगर होंगे ऑनबोर्ड",
        "जूट वॉल हैंगिंग की देशभर में मांग",
        "प्रशिक्षण शिविर अगले हफ्ते से",
      ],
      tags: ["गाजीपुर", "हस्तशिल्प", "ई-कॉमर्स"],
      views: 9800, h: 47, img: img("business", 1),
    },
    // ---------------- टेक्नोलॉजी ----------------
    {
      title: "AI की मदद से हिंदी में पढ़ाई होगी आसान, नए टूल्स लॉन्च",
      slug: "ai-hindi-padhai-tools-launch",
      cat: "technology", author: 2,
      excerpt: "छात्रों के लिए हिंदी भाषा में AI आधारित लर्निंग टूल्स लॉन्च किए गए हैं, जो पढ़ाई को आसान बनाएंगे।",
      points: [
        "गणित-विज्ञान की अवधारणाएं हिंदी में समझाएगा AI",
        "ग्रामीण छात्रों के लिए ऑफलाइन मोड",
        "शिक्षकों के लिए भी विशेष फीचर्स",
      ],
      tags: ["AI", "एजुकेशन टेक"],
      featured: true, views: 36200, h: 13, img: img("technology", 1),
    },
    {
      title: "स्मार्टफोन बाजार: 15,000 रुपये से कम में ये हैं इस महीने के बेहतरीन फोन",
      slug: "smartphone-15000-best-phones",
      cat: "technology", author: 2,
      excerpt: "बजट सेगमेंट में इस महीने कई दमदार स्मार्टफोन लॉन्च हुए हैं — जानिए कौन-सा आपके लिए सही है।",
      points: [
        "5G सपोर्ट अब बजट फोन में भी आम",
        "कैमरा और बैटरी में बड़ा सुधार",
        "खरीदने से पहले ये 3 बातें जांचें",
      ],
      tags: ["स्मार्टफोन", "गैजेट्स"],
      views: 24900, h: 23, img: img("technology", 2),
    },
    {
      title: "साइबर सुरक्षा: OTP ठगी के नए तरीके, ऐसे रखें खुद को सुरक्षित",
      slug: "cyber-suraksha-otp-thagi",
      cat: "technology", author: 1,
      excerpt: "साइबर ठग OTP ठगी के नए-नए तरीके अपना रहे हैं — सतर्कता ही बचाव का सबसे बड़ा हथियार है।",
      points: [
        "अनजान लिंक पर कभी क्लिक न करें",
        "बैंक कभी फोन पर OTP नहीं मांगता",
        "ठगी होने पर 1930 पर तुरंत कॉल करें",
      ],
      tags: ["साइबर सुरक्षा", "OTP"],
      views: 20300, h: 31, img: img("technology", 3),
    },
    {
      title: "ऐप्स की दुनिया: किसानों के लिए बने इस देसी ऐप ने जीता दिल",
      slug: "kisan-desi-app-charcha",
      cat: "technology", author: 2,
      excerpt: "मौसम, मंडी भाव और सरकारी योजनाओं की जानकारी एक जगह देने वाला देसी ऐप किसानों में लोकप्रिय हो रहा है।",
      points: [
        "10 लाख से ज्यादा डाउनलोड",
        "हिंदी समेत 8 भाषाओं में उपलब्ध",
        "गांव के युवाओं की टीम ने बनाया",
      ],
      tags: ["ऐप", "किसान", "एग्रीटेक"],
      views: 13500, h: 49, img: img("technology", 1),
    },
    // ---------------- शिक्षा ----------------
    {
      title: "बोर्ड परीक्षा की डेटशीट जारी, फरवरी के अंतिम सप्ताह से शुरू होंगे एग्ज़ाम",
      slug: "board-pariksha-datesheet-jari",
      cat: "shiksha", author: 2, location: "लखनऊ",
      excerpt: "बोर्ड परीक्षाओं की डेटशीट जारी कर दी गई है — परीक्षाएं फरवरी के अंतिम सप्ताह से शुरू होंगी।",
      points: [
        "हाईस्कूल-इंटर की परीक्षाएं साथ-साथ",
        "प्रैक्टिकल परीक्षाएं जनवरी में",
        "एडमिट कार्ड फरवरी के पहले हफ्ते से",
      ],
      tags: ["बोर्ड परीक्षा", "डेटशीट"],
      views: 44600, h: 7, img: img("shiksha", 1),
    },
    {
      title: "छात्रवृत्ति योजना: आवेदन की अंतिम तिथि बढ़ी, ऐसे करें अप्लाई",
      slug: "scholarship-antim-tithi-badhi",
      cat: "shiksha", author: 2,
      excerpt: "छात्रवृत्ति योजना के लिए आवेदन की अंतिम तिथि बढ़ा दी गई है — पात्र छात्र जल्द आवेदन करें।",
      points: [
        "नई अंतिम तिथि: इस महीने की 30 तारीख",
        "आय प्रमाणपत्र अनिवार्य दस्तावेज़",
        "आवेदन पूरी तरह ऑनलाइन",
      ],
      tags: ["छात्रवृत्ति", "आवेदन"],
      views: 31800, h: 17, img: img("shiksha", 2),
    },
    {
      title: "गाजीपुर के सरकारी स्कूल का कमाल: 40 छात्रों का नवोदय में चयन",
      slug: "ghazipur-school-navodaya-chayan",
      cat: "shiksha", author: 2, location: "गाजीपुर",
      excerpt: "गाजीपुर के एक सरकारी स्कूल के 40 छात्रों ने नवोदय विद्यालय प्रवेश परीक्षा में सफलता हासिल की है।",
      points: [
        "शिक्षकों ने चलाई विशेष तैयारी कक्षाएं",
        "जिले में सबसे बेहतर परिणाम",
        "डीएम ने की स्कूल की सराहना",
      ],
      tags: ["गाजीपुर", "नवोदय", "स्कूल"],
      views: 14900, h: 29, img: img("shiksha", 3),
    },
    {
      title: "उच्च शिक्षा: नई शिक्षा नीति के तहत बदलेगा ग्रेजुएशन का ढांचा",
      slug: "uchch-shiksha-graduation-dhancha",
      cat: "shiksha", author: 2,
      excerpt: "नई शिक्षा नीति के तहत स्नातक पाठ्यक्रमों में बड़े बदलाव लागू किए जा रहे हैं।",
      points: [
        "मल्टीपल एंट्री-एग्ज़िट की सुविधा",
        "स्किल आधारित कोर्स अनिवार्य",
        "क्रेडिट सिस्टम से आसान होगा ट्रांसफर",
      ],
      tags: ["शिक्षा नीति", "ग्रेजुएशन"],
      views: 11600, h: 41, img: img("shiksha", 1),
    },
    // ---------------- नौकरी ----------------
    {
      title: "सरकारी नौकरी: पुलिस भर्ती के 60,000 पदों का नोटिफिकेशन जल्द",
      slug: "police-bharti-60000-pad",
      cat: "naukri", author: 1, location: "लखनऊ",
      excerpt: "प्रदेश में पुलिस भर्ती के 60,000 से अधिक पदों के लिए अधिसूचना जल्द जारी होने की उम्मीद है।",
      points: [
        "लिखित परीक्षा और फिजिकल टेस्ट दोनों होंगे",
        "महिला अभ्यर्थियों के लिए आरक्षित पद",
        "आयु सीमा में छूट का प्रावधान",
      ],
      tags: ["सरकारी नौकरी", "पुलिस भर्ती"],
      views: 58900, h: 5, img: img("naukri", 1),
    },
    {
      title: "रेलवे भर्ती परीक्षा का रिजल्ट जारी, ऐसे देखें अपना परिणाम",
      slug: "railway-bharti-result-jari",
      cat: "naukri", author: 2,
      excerpt: "रेलवे भर्ती बोर्ड ने बहुप्रतीक्षित परीक्षा का परिणाम जारी कर दिया है।",
      points: [
        "आधिकारिक वेबसाइट पर रोल नंबर से देखें रिजल्ट",
        "अगला चरण: दस्तावेज़ सत्यापन",
        "कट-ऑफ पिछले साल से ऊंची",
      ],
      tags: ["रेलवे", "रिजल्ट"],
      views: 39700, h: 12, img: img("naukri", 2),
    },
    {
      title: "एडमिट कार्ड जारी: शिक्षक पात्रता परीक्षा इस तारीख को",
      slug: "shikshak-patrata-admit-card",
      cat: "naukri", author: 2,
      excerpt: "शिक्षक पात्रता परीक्षा के एडमिट कार्ड जारी कर दिए गए हैं, परीक्षा अगले रविवार को होगी।",
      points: [
        "दो पालियों में होगी परीक्षा",
        "परीक्षा केंद्र पर एक घंटा पहले पहुंचें",
        "मोबाइल-स्मार्टवॉच पूरी तरह प्रतिबंधित",
      ],
      tags: ["एडमिट कार्ड", "TET"],
      views: 27200, h: 24, img: img("naukri", 3),
    },
    {
      title: "करियर गाइड: 12वीं के बाद ये हैं कमाई और भविष्य के बेहतरीन विकल्प",
      slug: "career-guide-12th-ke-baad",
      cat: "naukri", author: 2,
      excerpt: "12वीं के बाद सही करियर चुनना सबसे अहम फैसला है — जानिए परंपरागत और नए दौर के बेहतरीन विकल्प।",
      points: [
        "टेक्नोलॉजी और हेल्थकेयर में तेज़ी से बढ़ते मौके",
        "स्किल कोर्स भी दिला सकते हैं अच्छी नौकरी",
        "सरकारी परीक्षाओं की तैयारी की रणनीति",
      ],
      tags: ["करियर", "गाइड"],
      views: 16800, h: 37, img: img("naukri", 1),
    },
    // ---------------- लाइफस्टाइल ----------------
    {
      title: "सर्दियों में सेहत का खज़ाना: ये 5 देसी सुपरफूड जरूर खाएं",
      slug: "sardi-desi-superfood",
      cat: "lifestyle", author: 4,
      excerpt: "सर्दियों के मौसम में इम्युनिटी बढ़ाने के लिए देसी सुपरफूड्स से बेहतर कुछ नहीं।",
      points: [
        "गुड़-तिल से मिलती है गर्माहट और आयरन",
        "बाजरे की रोटी पाचन के लिए बेहतरीन",
        "आंवला — विटामिन C का भंडार",
      ],
      tags: ["सेहत", "सर्दी", "खानपान"],
      views: 21500, h: 14, img: img("lifestyle", 1),
    },
    {
      title: "योग और ध्यान: व्यस्त दिनचर्या में 15 मिनट ऐसे बदल सकते हैं आपका दिन",
      slug: "yoga-dhyan-15-minute",
      cat: "lifestyle", author: 4,
      excerpt: "सुबह के सिर्फ 15 मिनट का योग-ध्यान पूरे दिन की ऊर्जा और एकाग्रता बढ़ा सकता है।",
      points: [
        "सूर्य नमस्कार से करें शुरुआत",
        "5 मिनट का प्राणायाम तनाव घटाए",
        "नियमितता सबसे जरूरी",
      ],
      tags: ["योग", "स्वास्थ्य"],
      views: 12400, h: 32, img: img("lifestyle", 2),
    },
    {
      title: "घूमने की जगहें: पूर्वांचल के ये 5 खूबसूरत स्थल वीकेंड के लिए परफेक्ट",
      slug: "purvanchal-weekend-jagah",
      cat: "lifestyle", author: 4,
      excerpt: "अगर वीकेंड पर कहीं घूमने का प्लान है, तो पूर्वांचल के ये स्थल आपकी लिस्ट में जरूर होने चाहिए।",
      points: [
        "गंगा घाटों की शाम — सुकून का दूसरा नाम",
        "ऐतिहासिक किले और संग्रहालय",
        "कम बजट में शानदार अनुभव",
      ],
      tags: ["यात्रा", "पूर्वांचल"],
      views: 10100, h: 46, img: img("lifestyle", 3),
    },
    // ---------------- अपराध ----------------
    {
      title: "ऑनलाइन ठगी करने वाले गिरोह का पर्दाफाश, तीन गिरफ्तार",
      slug: "online-thagi-giroh-giraftar",
      cat: "apradh", author: 1, location: "वाराणसी",
      excerpt: "पुलिस ने ऑनलाइन ठगी करने वाले अंतरराज्यीय गिरोह का पर्दाफाश करते हुए तीन आरोपियों को गिरफ्तार किया है।",
      points: [
        "फर्जी लोन ऐप के जरिए करते थे ठगी",
        "50 से अधिक शिकायतें दर्ज थीं",
        "लैपटॉप, सिम कार्ड और नकदी बरामद",
      ],
      tags: ["साइबर क्राइम", "गिरफ्तारी"],
      views: 18700, h: 9, img: img("apradh", 1),
    },
    {
      title: "यातायात नियमों पर सख्ती: एक हफ्ते में 5,000 से ज्यादा चालान",
      slug: "yatayat-niyam-chalan-abhiyan",
      cat: "apradh", author: 1, location: "गाजीपुर",
      excerpt: "यातायात माह के तहत चलाए जा रहे अभियान में एक हफ्ते के भीतर 5,000 से अधिक चालान किए गए।",
      points: [
        "बिना हेलमेट वाहन चलाने वालों पर सख्ती",
        "स्कूलों में जागरूकता कार्यक्रम",
        "अभियान महीने भर चलेगा",
      ],
      tags: ["यातायात", "पुलिस"],
      views: 8300, h: 35, img: img("apradh", 2),
    },
    {
      title: "नकली खाद बेचने वाले गोदाम पर छापा, भारी मात्रा में माल जब्त",
      slug: "nakli-khad-godam-chapa",
      cat: "apradh", author: 1, location: "जौनपुर",
      excerpt: "कृषि विभाग और पुलिस की संयुक्त टीम ने नकली खाद के गोदाम पर छापा मारकर भारी मात्रा में माल जब्त किया।",
      points: [
        "किसानों की शिकायत पर हुई कार्रवाई",
        "गोदाम मालिक फरार, तलाश जारी",
        "सैंपल जांच के लिए भेजे गए",
      ],
      tags: ["किसान", "छापा", "जौनपुर"],
      views: 7600, h: 55, img: img("apradh", 3),
    },
    // एक अतिरिक्त विचार-लेख
    {
      title: "विचार: गांव की अर्थव्यवस्था को डिजिटल पंख देने का समय",
      slug: "vichar-gaon-digital-arthvyavastha",
      cat: "business", author: 5,
      excerpt: "UPI और ई-कॉमर्स ने गांव के छोटे कारोबारियों के लिए संभावनाओं के नए दरवाज़े खोले हैं — जरूरत है सही मार्गदर्शन की।",
      points: [
        "डिजिटल भुगतान अपनाने में ग्रामीण भारत आगे",
        "स्थानीय उत्पादों को मिल सकता है राष्ट्रीय बाज़ार",
        "डिजिटल साक्षरता सबसे बड़ी चुनौती",
      ],
      opinion: true,
      tags: ["डिजिटल", "ग्रामीण अर्थव्यवस्था", "विचार"],
      views: 9200, h: 65, img: img("vichar", 3),
    },
  ];

  for (const e of E) {
    const cat = catBySlug[e.cat];
    const subcat = e.subcat ? catBySlug[e.subcat] : null;
    const article = await prisma.article.upsert({
      where: { slug: e.slug },
      update: {},
      create: {
        title: e.title,
        slug: e.slug,
        excerpt: e.excerpt,
        body: body(e),
        image: e.img,
        imageCaption: "प्रतीकात्मक तस्वीर (नमूना)",
        categoryId: cat.id,
        subcategoryId: subcat?.id ?? null,
        authorId: authors[e.author].id,
        location: e.location ?? null,
        status: "PUBLISHED",
        publishedAt: hoursAgo(e.h),
        views: e.views,
        featured: e.featured ?? false,
        isOpinion: e.opinion ?? false,
        metaDescription: e.excerpt,
      },
    });
    for (const name of e.tags) {
      const slug =
        name
          .toLowerCase()
          .replace(/[^\wऀ-ॿ-]+/g, "-")
          .replace(/^-+|-+$/g, "") || `tag-${article.id}`;
      const tag = await prisma.tag.upsert({
        where: { slug },
        update: {},
        create: { name, slug },
      });
      await prisma.articleTag.upsert({
        where: { articleId_tagId: { articleId: article.id, tagId: tag.id } },
        update: {},
        create: { articleId: article.id, tagId: tag.id },
      });
    }
  }

  /* ---------- Breaking news ---------- */
  await prisma.breakingNews.deleteMany();
  await prisma.breakingNews.createMany({
    data: [
      { text: "उत्तर प्रदेश: गाजीपुर रिवरफ्रंट परियोजना को मिली मंजूरी, दो साल में पूरा होगा काम", link: "/news/ghazipur-ganga-riverfront-yojana", order: 1 },
      { text: "क्रिकेट: भारतीय टीम ने लगातार आठवीं सीरीज जीतकर रचा इतिहास", link: "/news/team-india-series-jeet-kirtiman", order: 2 },
      { text: "नौकरी: पुलिस भर्ती के 60,000 पदों का नोटिफिकेशन जल्द जारी होगा", link: "/news/police-bharti-60000-pad", order: 3 },
      { text: "शिक्षा: बोर्ड परीक्षा की डेटशीट जारी — फरवरी के अंतिम सप्ताह से एग्ज़ाम", link: "/news/board-pariksha-datesheet-jari", order: 4 },
      { text: "बाजार: सेंसेक्स-निफ्टी रिकॉर्ड ऊंचाई पर बंद", link: "/news/share-bazaar-record-teji", order: 5 },
    ],
  });

  /* ---------- Videos ---------- */
  await prisma.video.deleteMany();
  await prisma.video.createMany({
    data: [
      // Real videos from the official channel: https://www.youtube.com/@Theknnews7
      { title: "संसद में सपा सांसद डिंपल यादव का अनोखा अंदाज अचानक लोगों से मांगने लगीं चंदा, जानिए क्या है मामला", youtubeId: "JjglWqv1A4w", thumbnail: "https://i.ytimg.com/vi/JjglWqv1A4w/hqdefault.jpg", duration: "3:24", categoryId: catBySlug["rajniti"].id, publishedAt: hoursAgo(48), views: 3 },
      { title: "नई दिल्ली : शिक्षा मंत्री धर्मेंद्र प्रधान ने अपने पद से इस्तीफा दे दिया", youtubeId: "dGRwEzrySUY", thumbnail: "https://i.ytimg.com/vi/dGRwEzrySUY/hqdefault.jpg", duration: "1:19", categoryId: catBySlug["delhi-ncr"].id, publishedAt: hoursAgo(144), views: 2 },
      { title: "SKY का Silent Attack? 🤫👕IND vs ENG सीरीज के बीच Surya की एक T-Shirt ने सोशल मीडिया पर मचा दी हलचल।", youtubeId: "EL15KXFoC2w", thumbnail: "https://i.ytimg.com/vi/EL15KXFoC2w/hqdefault.jpg", duration: "4:02", categoryId: catBySlug["cricket"].id, publishedAt: hoursAgo(336), views: 50 },
      { title: "अपरना भावुक रो पड़ीं, तो अखिलेश बने सहारा! परिवार के इस भावनात्मक पल में डिंपल ने बेटियों को संभाला", youtubeId: "wzjlOpyHWiU", thumbnail: "https://i.ytimg.com/vi/wzjlOpyHWiU/hqdefault.jpg", duration: "3:09", categoryId: catBySlug["rajniti"].id, publishedAt: hoursAgo(720), views: 323 },
    ],
  });

  /* ---------- Galleries ---------- */
  await prisma.gallery.deleteMany();
  const g1 = await prisma.gallery.create({
    data: {
      title: "देव दीपावली की तैयारी में सजे वाराणसी के घाट",
      description: "काशी के घाटों की रौनक — तस्वीरों में (नमूना गैलरी)",
      categoryId: catBySlug["uttar-pradesh"].id,
      publishedAt: hoursAgo(8),
    },
  });
  const g2 = await prisma.gallery.create({
    data: {
      title: "सीरीज जीत के यादगार लम्हे",
      description: "भारतीय टीम की ऐतिहासिक जीत की झलकियां (नमूना गैलरी)",
      categoryId: catBySlug["cricket"].id,
      publishedAt: hoursAgo(12),
    },
  });
  const g3 = await prisma.gallery.create({
    data: {
      title: "गाजीपुर के गंगा घाटों की सुबह",
      description: "गंगा किनारे की खूबसूरत सुबह (नमूना गैलरी)",
      categoryId: catBySlug["uttar-pradesh"].id,
      publishedAt: hoursAgo(40),
    },
  });
  const galleryImages = [
    { galleryId: g1.id, imgs: ["uttar-pradesh-1", "uttar-pradesh-2", "uttar-pradesh-3", "lifestyle-3", "vichar-1"] },
    { galleryId: g2.id, imgs: ["cricket-1", "cricket-2", "cricket-3", "khel-1", "khel-2"] },
    { galleryId: g3.id, imgs: ["uttar-pradesh-2", "lifestyle-1", "lifestyle-2", "uttar-pradesh-1"] },
  ];
  for (const g of galleryImages) {
    for (let i = 0; i < g.imgs.length; i++) {
      await prisma.galleryImage.create({
        data: {
          galleryId: g.galleryId,
          image: `/images/sample/${g.imgs[i]}.svg`,
          caption: `फोटो ${i + 1} — प्रतीकात्मक तस्वीर (नमूना)`,
          order: i,
        },
      });
    }
  }

  /* ---------- Direct advertisements ---------- */
  await prisma.advertisement.deleteMany();
  await prisma.advertisement.createMany({
    data: [
      {
        advertiserName: "Ghazipur Electronics (Sample)",
        imageDesktop: "/images/sample/ad-970x90.svg",
        imageMobile: "/images/sample/ad-mobile-360x120.svg",
        url: "https://example.com/ghazipur-electronics",
        placement: "HEADER",
        active: true,
        impressions: 1240,
        clicks: 37,
      },
      {
        advertiserName: "Sharma Sarees Varanasi (Sample)",
        imageDesktop: "/images/sample/ad-300x250.svg",
        url: "https://example.com/sharma-sarees",
        placement: "SIDEBAR",
        active: true,
        impressions: 2210,
        clicks: 64,
      },
      {
        advertiserName: "UP Coaching Centre (Sample)",
        imageDesktop: "/images/sample/ad-728x90.svg",
        url: "https://example.com/up-coaching",
        placement: "ARTICLE_MID",
        active: true,
        impressions: 890,
        clicks: 21,
      },
    ],
  });

  /* ---------- Comments ---------- */
  await prisma.comment.deleteMany();
  const firstArticle = await prisma.article.findUnique({
    where: { slug: "ghazipur-ganga-riverfront-yojana" },
  });
  const cricketArticle = await prisma.article.findUnique({
    where: { slug: "team-india-series-jeet-kirtiman" },
  });
  if (firstArticle) {
    const c1 = await prisma.comment.create({
      data: {
        articleId: firstArticle.id,
        name: "रमेश यादव",
        body: "बहुत अच्छी खबर! गाजीपुर के लिए यह परियोजना गेम-चेंजर साबित होगी।",
        status: "APPROVED",
        likes: 12,
        createdAt: hoursAgo(2),
      },
    });
    await prisma.comment.create({
      data: {
        articleId: firstArticle.id,
        parentId: c1.id,
        name: "सुनीता देवी",
        body: "सही कहा — बस काम समय पर पूरा हो जाए।",
        status: "APPROVED",
        likes: 4,
        createdAt: hoursAgo(1),
      },
    });
    await prisma.comment.create({
      data: {
        articleId: firstArticle.id,
        name: "विकास कुमार",
        body: "घाटों की सफाई पर भी ध्यान दिया जाए।",
        status: "PENDING",
        createdAt: hoursAgo(1),
      },
    });
  }
  if (cricketArticle) {
    await prisma.comment.create({
      data: {
        articleId: cricketArticle.id,
        name: "अर्जुन सिंह",
        body: "क्या शानदार जीत थी! पूरी टीम को बधाई। 🏏",
        status: "APPROVED",
        likes: 28,
        createdAt: hoursAgo(3),
      },
    });
  }

  /* ---------- Newsletter subscribers ---------- */
  for (const email of ["reader1@example.com", "reader2@example.com", "reader3@example.com"]) {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email, createdAt: hoursAgo(70) },
    });
  }

  /* ---------- Settings ---------- */
  const settings: Record<string, string> = {
    "contact.email": "contacttheknnews@gmail.com",
    "contact.phone": "+91 7607711590",
    "contact.whatsapp": "+91 7607711590",
    "social.facebook": "https://www.facebook.com/profile.php?id=61554741623006",
    "social.instagram": "https://www.instagram.com/theknnews_/",
    "social.youtube": "https://www.youtube.com/@Theknnews7",
    "social.x": "https://x.com/thekngroup7622",
    "social.telegram": "https://t.me/theknnews",
    "social.whatsapp": "https://whatsapp.com/channel/0029VbDGxI62v1IldW9WQO2I",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  console.log("Seed complete ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
