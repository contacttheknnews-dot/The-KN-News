import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { publishedWhere, cardInclude } from "@/lib/data";
import { NewsCard, NewsCardHorizontal } from "@/components/news/NewsCard";
import Sidebar from "@/components/sidebar/Sidebar";
import AdSlot from "@/components/ads/AdSlot";
import CricketQuiz from "./CricketQuiz";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The KN Cricket — क्रिकेट की हर खबर",
  description:
    "क्रिकेट की ताज़ा खबरें, मैच रिपोर्ट, सीरीज अपडेट, रिकॉर्ड्स, खिलाड़ियों की खबरें और गहरा विश्लेषण — The KN Cricket पर।",
};

const TABS = [
  { key: "news", label: "ताज़ा खबर", tag: null },
  { key: "reports", label: "मैच रिपोर्ट", tag: "match-report" },
  { key: "series", label: "सीरीज अपडेट", tag: "series-update" },
  { key: "records", label: "रिकॉर्ड्स", tag: "cricket-records" },
  { key: "players", label: "खिलाड़ी", tag: "players" },
  { key: "analysis", label: "विश्लेषण", tag: "cricket-analysis" },
  { key: "quiz", label: "क्विज", tag: null },
] as const;

// Sample statistics table (clearly-labelled sample data — replace with a real
// cricket data API such as an official/licensed feed before going live).
const SAMPLE_BATTING = [
  { player: "खिलाड़ी A (नमूना)", matches: 52, runs: 2140, avg: "48.6", sr: "138.2" },
  { player: "खिलाड़ी B (नमूना)", matches: 47, runs: 1876, avg: "44.1", sr: "129.7" },
  { player: "खिलाड़ी C (नमूना)", matches: 39, runs: 1502, avg: "41.7", sr: "141.5" },
  { player: "खिलाड़ी D (नमूना)", matches: 44, runs: 1387, avg: "36.5", sr: "125.3" },
];

export default async function CricketPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const active = TABS.find((t) => t.key === sp.tab) ?? TABS[0];

  const articles =
    active.key === "quiz"
      ? []
      : await prisma.article.findMany({
          where: {
            ...publishedWhere(),
            category: { slug: "cricket" },
            ...(active.tag ? { tags: { some: { tag: { slug: active.tag } } } } : {}),
          },
          include: cardInclude,
          orderBy: { publishedAt: "desc" },
          take: 12,
        });

  return (
    <div className="container-site py-5">
      {/* Cricket hub masthead */}
      <div className="rounded-lg bg-kn-dark text-white p-5 md:p-6 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">
              The <span className="bg-kn-red px-1.5 rounded-sm">KN</span> Cricket
            </h1>
            <p className="mt-1 text-sm text-neutral-300">
              क्रिकेट की हर खबर, हर रिकॉर्ड, हर विश्लेषण — एक ही जगह।
            </p>
          </div>
          {/* Scorecard integration placeholder */}
          <div className="rounded-md border border-white/20 bg-white/5 px-4 py-3 text-xs text-neutral-300">
            <p className="font-bold text-white mb-0.5">🏏 लाइव स्कोरकार्ड</p>
            <p>लाइव स्कोर आधिकारिक क्रिकेट डेटा API से जोड़े जाएंगे।</p>
          </div>
        </div>
        {/* Tabs */}
        <nav className="mt-5 flex gap-1.5 overflow-x-auto no-scrollbar -mb-1">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={t.key === "news" ? "/cricket" : `/cricket?tab=${t.key}`}
              className={`whitespace-nowrap rounded-t-md px-4 py-2 text-sm font-bold transition-colors ${
                active.key === t.key
                  ? "bg-kn-red text-white"
                  : "bg-white/10 text-neutral-200 hover:bg-white/20"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-8">
          {active.key === "quiz" ? (
            <CricketQuiz />
          ) : (
            <>
              {active.key === "records" && (
                <section className="bg-white border border-kn-border rounded-lg p-5">
                  <h2 className="font-bold text-lg mb-1">बैटिंग प्रदर्शन (T20)</h2>
                  <p className="text-xs text-kn-muted mb-3">
                    * नमूना आंकड़े — लाइव आंकड़े क्रिकेट डेटा API से जोड़े जाएंगे।
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-kn-gray text-left">
                          <th className="px-3 py-2 font-bold">खिलाड़ी</th>
                          <th className="px-3 py-2 font-bold">मैच</th>
                          <th className="px-3 py-2 font-bold">रन</th>
                          <th className="px-3 py-2 font-bold">औसत</th>
                          <th className="px-3 py-2 font-bold">स्ट्राइक रेट</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SAMPLE_BATTING.map((r) => (
                          <tr key={r.player} className="border-b border-kn-border last:border-0">
                            <td className="px-3 py-2 font-medium">{r.player}</td>
                            <td className="px-3 py-2">{r.matches}</td>
                            <td className="px-3 py-2 font-bold text-kn-red">{r.runs}</td>
                            <td className="px-3 py-2">{r.avg}</td>
                            <td className="px-3 py-2">{r.sr}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {articles.length === 0 ? (
                <p className="text-center text-kn-muted py-12">
                  इस सेक्शन में अभी कोई खबर उपलब्ध नहीं है।
                </p>
              ) : (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {articles.slice(0, 2).map((a) => (
                      <NewsCard key={a.id} article={a} />
                    ))}
                  </div>
                  <div className="space-y-4">
                    {articles.slice(2).map((a) => (
                      <NewsCardHorizontal key={a.id} article={a} />
                    ))}
                  </div>
                </>
              )}
              <AdSlot placement="CATEGORY" minHeight={90} />
            </>
          )}
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
