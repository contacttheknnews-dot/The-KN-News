// Central brand + navigation configuration for The KN News.

export const SITE = {
  name: "The KN News",
  taglineShort: "दूरगामी सोच",
  tagline:
    "“दूरगामी सोच” एक प्रतिष्ठित सामाजिक मीडिया संस्थान के रूप में होने को अग्रसर",
  description:
    "The KN News एक डिजिटल समाचार एवं सामाजिक मीडिया मंच है, जहां देश, उत्तर प्रदेश, राजनीति, क्रिकेट, खेल, मनोरंजन, बिजनेस, टेक्नोलॉजी और समाज से जुड़ी महत्वपूर्ण खबरें प्रस्तुत की जाती हैं।",
  address: "Ghazipur, Uttar Pradesh, India",
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61554741623006",
    instagram: "https://www.instagram.com/theknnews_/",
    youtube: "https://www.youtube.com/@Theknnews7",
    x: "https://x.com/thekngroup7622",
    telegram: "https://t.me/theknnews",
    whatsapp: "https://whatsapp.com/channel/0029VbDGxI62v1IldW9WQO2I",
  },
} as const;

// Main navigation. Category links point at /category/<slug>; special
// sections have their own routes.
export const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "होम", href: "/" },
  { label: "ताज़ा खबर", href: "/latest" },
  { label: "देश", href: "/category/desh" },
  { label: "उत्तर प्रदेश", href: "/category/uttar-pradesh" },
  { label: "दिल्ली NCR", href: "/category/delhi-ncr" },
  { label: "राजनीति", href: "/category/rajniti" },
  { label: "क्रिकेट", href: "/cricket" },
  { label: "खेल", href: "/category/khel" },
  { label: "मनोरंजन", href: "/category/manoranjan" },
  { label: "बिजनेस", href: "/category/business" },
  { label: "टेक्नोलॉजी", href: "/category/technology" },
  { label: "शिक्षा", href: "/category/shiksha" },
  { label: "नौकरी", href: "/category/naukri" },
  { label: "लाइफस्टाइल", href: "/category/lifestyle" },
  { label: "अपराध", href: "/category/apradh" },
  { label: "वीडियो", href: "/videos" },
  { label: "फोटो", href: "/photos" },
];

// Items shown under "और देखें"
export const MORE_ITEMS: { label: string; href: string }[] = [
  { label: "विचार", href: "/opinion" },
  { label: "हमारे बारे में", href: "/about" },
  { label: "संपर्क करें", href: "/contact" },
  { label: "Advertise With Us", href: "/advertise" },
  { label: "Editorial Policy", href: "/editorial-policy" },
];

export const ROLES = [
  "SUPER_ADMIN",
  "EDITOR",
  "REPORTER",
  "AUTHOR",
  "AD_MANAGER",
  "MODERATOR",
] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  EDITOR: "Editor",
  REPORTER: "Reporter",
  AUTHOR: "Author",
  AD_MANAGER: "Advertisement Manager",
  MODERATOR: "Moderator",
};

export const AD_PLACEMENTS = [
  { value: "HEADER", label: "Header (top of every page)" },
  { value: "BELOW_NAV", label: "Below navigation / breaking news" },
  { value: "HOME_MID_1", label: "Homepage — between featured & latest" },
  { value: "HOME_MID_2", label: "Homepage — mid content" },
  { value: "HOME_MID_3", label: "Homepage — between category sections" },
  { value: "SIDEBAR", label: "Sidebar" },
  { value: "ARTICLE_TOP", label: "Article — below headline/image" },
  { value: "ARTICLE_MID", label: "Article — mid-article" },
  { value: "ARTICLE_BOTTOM", label: "Article — before related news" },
  { value: "CATEGORY", label: "Category pages" },
  { value: "BEFORE_FOOTER", label: "Before footer" },
] as const;
