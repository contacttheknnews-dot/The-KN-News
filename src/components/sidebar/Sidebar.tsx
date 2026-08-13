// Desktop sidebar: trending, most read, advertisement, newsletter signup.
import Link from "next/link";
import { getTrending, getMostRead } from "@/lib/data";
import { NewsCardCompact } from "@/components/news/NewsCard";
import { TrendingIcon } from "@/components/icons";
import AdSlot from "@/components/ads/AdSlot";
import NewsletterForm from "@/components/NewsletterForm";

export function SidebarBox({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-kn-border rounded-lg overflow-hidden">
      <h3 className="flex items-center gap-2 bg-kn-dark text-white font-bold text-[15px] px-4 py-2.5">
        <span className="inline-block h-4 w-1 bg-kn-red rounded-sm" />
        {title}
        {icon}
      </h3>
      <div className="p-4">{children}</div>
    </div>
  );
}

export async function TrendingBox() {
  const trending = await getTrending(5);
  if (!trending.length) return null;
  return (
    <SidebarBox title="Trending News" icon={<TrendingIcon width={16} height={16} className="text-kn-red ml-auto" />}>
      <ol className="space-y-4">
        {trending.map((a, i) => (
          <li key={a.id} className="flex gap-3 items-start">
            <span className="text-2xl font-extrabold text-neutral-200 leading-none w-8 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h4 className="text-sm font-semibold leading-snug line-clamp-2 -mt-0.5">
              <Link href={`/news/${a.slug}`} className="hover:text-kn-red transition-colors">
                {a.title}
              </Link>
            </h4>
          </li>
        ))}
      </ol>
    </SidebarBox>
  );
}

export async function MostReadBox() {
  const mostRead = await getMostRead(5);
  if (!mostRead.length) return null;
  return (
    <SidebarBox title="Most Read">
      <div className="space-y-4">
        {mostRead.map((a) => (
          <NewsCardCompact key={a.id} article={a} />
        ))}
      </div>
    </SidebarBox>
  );
}

export function NewsletterBox() {
  return (
    <div id="newsletter" className="bg-kn-dark text-white rounded-lg p-5 scroll-mt-24">
      <h3 className="font-extrabold text-lg">
        The <span className="bg-kn-red px-1 rounded-sm">KN</span> News से जुड़ें
      </h3>
      <p className="mt-1.5 mb-4 text-sm text-neutral-300">
        “ताज़ा खबरें सीधे अपने ईमेल पर पाएं।”
      </p>
      <NewsletterForm compact />
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="space-y-6 lg:sticky lg:top-16 self-start">
      <TrendingBox />
      <AdSlot placement="SIDEBAR" minHeight={250} />
      <MostReadBox />
      <NewsletterBox />
    </aside>
  );
}
