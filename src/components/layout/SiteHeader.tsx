// Full site header: utility bar, branding, navigation, breaking ticker.
import Link from "next/link";
import Image from "next/image";
import { SITE, NAV_ITEMS, MORE_ITEMS } from "@/lib/constants";
import { getBreakingNews, getSettings } from "@/lib/data";
import { formatHindiDate } from "@/lib/utils";
import { SOCIAL_ICONS } from "@/components/icons";
import NavBar from "./NavBar";
import BreakingTicker from "./BreakingTicker";
import AdSlot from "@/components/ads/AdSlot";

export default async function SiteHeader() {
  const [breaking, settings] = await Promise.all([getBreakingNews(), getSettings()]);

  const social = {
    facebook: settings["social.facebook"] || SITE.social.facebook,
    instagram: settings["social.instagram"] || SITE.social.instagram,
    youtube: settings["social.youtube"] || SITE.social.youtube,
    x: settings["social.x"] || SITE.social.x,
    telegram: settings["social.telegram"] || SITE.social.telegram,
    whatsapp: settings["social.whatsapp"] || SITE.social.whatsapp,
  };

  return (
    <header>
      {/* ---- Top utility bar ---- */}
      <div className="bg-kn-dark text-neutral-300 text-xs">
        <div className="container-site flex items-center justify-between h-8 gap-4">
          <p className="whitespace-nowrap" suppressHydrationWarning>
            {formatHindiDate(new Date())}
          </p>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/about" className="hover:text-white">हमारे बारे में</Link>
            <Link href="/contact" className="hover:text-white">संपर्क करें</Link>
            <Link href="/advertise" className="hover:text-white">Advertise With Us</Link>
          </nav>
          <div className="flex items-center gap-2.5">
            {(Object.keys(SOCIAL_ICONS) as (keyof typeof SOCIAL_ICONS)[]).map((key) => {
              const Icon = SOCIAL_ICONS[key];
              return (
                <a
                  key={key}
                  href={social[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={key}
                  className="hover:text-white"
                >
                  <Icon width={14} height={14} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---- Branding ---- */}
      <div className="bg-white border-b border-kn-border">
        <div className="container-site py-4 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0 flex items-center gap-3">
            <Image
              src="/images/logo.jpg"
              alt={`${SITE.name} logo`}
              width={56}
              height={56}
              priority
              className="h-12 w-12 md:h-14 md:w-14 rounded-md border border-kn-border object-cover"
            />
            <span>
              <p className="text-2xl md:text-[2rem] font-extrabold leading-none tracking-tight">
                <span className="text-kn-dark">The </span>
                <span className="bg-kn-red text-white px-2 py-0.5 rounded-sm">KN</span>
                <span className="text-kn-dark"> News</span>
              </p>
              <p className="mt-1.5 text-[11px] md:text-xs text-kn-muted max-w-105">
                {SITE.tagline}
              </p>
            </span>
          </Link>
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/search"
              className="flex items-center gap-2 rounded-full border border-kn-border px-4 py-2 text-sm text-kn-muted hover:border-kn-red hover:text-kn-red transition-colors"
            >
              <span>The KN News पर खोजें…</span>
            </Link>
            <Link
              href="/#newsletter"
              className="rounded-full bg-kn-red px-5 py-2 text-sm font-bold text-white hover:bg-kn-red-dark transition-colors"
            >
              Subscribe
            </Link>
            <Link
              href="/admin/login"
              className="rounded-full border border-kn-border px-5 py-2 text-sm font-medium text-kn-dark hover:bg-kn-gray transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* ---- Header advertisement ---- */}
      <div className="bg-white">
        <div className="container-site py-2">
          <AdSlot placement="HEADER" minHeight={70} />
        </div>
      </div>

      {/* ---- Navigation (client: active state + mobile drawer) ---- */}
      <NavBar items={NAV_ITEMS} moreItems={MORE_ITEMS} />

      {/* ---- Breaking news ---- */}
      {breaking.length > 0 && (
        <BreakingTicker items={breaking.map((b) => ({ text: b.text, link: b.link }))} />
      )}
    </header>
  );
}
