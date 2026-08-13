// Dark site footer with brand, link columns, contact info and social icons.
import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/constants";
import { getSettings } from "@/lib/data";
import { SOCIAL_ICONS, MailIcon, PhoneIcon, MapPinIcon, WhatsAppIcon } from "@/components/icons";

const IMPORTANT_LINKS = [
  { label: "हमारे बारे में", href: "/about" },
  { label: "संपर्क करें", href: "/contact" },
  { label: "Advertise With Us", href: "/advertise" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Editorial Policy", href: "/editorial-policy" },
  { label: "Correction Policy", href: "/correction-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Sitemap", href: "/sitemap-page" },
];

const CATEGORY_LINKS = [
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
];

export default async function Footer() {
  const settings = await getSettings();
  const email = settings["contact.email"] || "contacttheknnews@gmail.com";
  const phone = settings["contact.phone"] || "+91 7607711590";
  const whatsapp = settings["contact.whatsapp"] || "+91 7607711590";

  return (
    <footer className="bg-kn-dark text-neutral-300 mt-12">
      <div className="container-site py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.jpg"
              alt={`${SITE.name} logo`}
              width={48}
              height={48}
              className="h-12 w-12 rounded-md object-cover"
            />
            <p className="text-2xl font-extrabold text-white">
              The <span className="bg-kn-red px-1.5 py-0.5 rounded-sm">KN</span> News
            </p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">{SITE.tagline}</p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            “{SITE.description}”
          </p>
          <div className="mt-4 flex items-center gap-3">
            {(Object.keys(SOCIAL_ICONS) as (keyof typeof SOCIAL_ICONS)[]).map((key) => {
              const Icon = SOCIAL_ICONS[key];
              return (
                <a
                  key={key}
                  href={SITE.social[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={key}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-kn-red transition-colors"
                >
                  <Icon width={16} height={16} />
                </a>
              );
            })}
          </div>
        </div>

        {/* Important links */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4 border-l-4 border-kn-red pl-3">
            महत्वपूर्ण लिंक
          </h3>
          <ul className="space-y-2.5 text-sm">
            {IMPORTANT_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-kn-red transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4 border-l-4 border-kn-red pl-3">
            श्रेणियां
          </h3>
          <ul className="space-y-2.5 text-sm">
            {CATEGORY_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-kn-red transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4 border-l-4 border-kn-red pl-3">
            संपर्क करें
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPinIcon width={16} height={16} className="mt-0.5 text-kn-red shrink-0" />
              <span>
                {SITE.name}
                <br />
                {SITE.address}
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <MailIcon width={16} height={16} className="text-kn-red shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-kn-red">{email}</a>
            </li>
            <li className="flex items-center gap-2.5">
              <PhoneIcon width={16} height={16} className="text-kn-red shrink-0" />
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-kn-red">{phone}</a>
            </li>
            <li className="flex items-center gap-2.5">
              <WhatsAppIcon width={16} height={16} className="text-kn-red shrink-0" />
              <span>{whatsapp}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <p>© 2026 {SITE.name}. All Rights Reserved.</p>
          <p>{SITE.taglineShort} — भरोसेमंद खबर, हर पल आपके साथ।</p>
        </div>
      </div>
    </footer>
  );
}
