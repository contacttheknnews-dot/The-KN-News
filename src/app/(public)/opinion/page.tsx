import type { Metadata } from "next";
import Link from "next/link";
import { getOpinions } from "@/lib/data";
import { SectionHeader } from "@/components/news/Sections";
import { formatHindiDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "विचार — संपादकीय एवं विश्लेषण",
  description: "The KN News के विशेषज्ञ लेखकों के विचार, संपादकीय और गहरा विश्लेषण।",
};

export default async function OpinionPage() {
  const opinions = await getOpinions(12);

  return (
    <div className="container-site py-6">
      <SectionHeader title="विचार" />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {opinions.map((a) => (
          <article
            key={a.id}
            className="bg-white border border-kn-border rounded-lg p-5 hover:shadow-lg transition-shadow flex flex-col"
          >
            <div className="flex items-center gap-3 mb-3">
              {a.author.photo ? (
                <img
                  src={a.author.photo}
                  alt={a.author.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-kn-red-light text-kn-red font-bold text-lg">
                  {a.author.name.charAt(0)}
                </span>
              )}
              <div>
                <p className="font-bold text-sm">{a.author.name}</p>
                {a.author.designation && (
                  <p className="text-xs text-kn-muted">{a.author.designation}</p>
                )}
              </div>
            </div>
            <span className="text-4xl text-kn-red leading-none font-serif">&ldquo;</span>
            <h2 className="font-bold text-lg leading-snug -mt-2">
              <Link href={`/news/${a.slug}`} className="hover:text-kn-red transition-colors">
                {a.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-kn-muted line-clamp-3">{a.excerpt}</p>
            <div className="mt-auto pt-3 flex items-center justify-between">
              <span className="text-xs text-kn-muted">{formatHindiDate(a.publishedAt)}</span>
              <Link href={`/news/${a.slug}`} className="text-xs font-bold text-kn-red hover:underline">
                पूरा पढ़ें →
              </Link>
            </div>
          </article>
        ))}
      </div>
      {opinions.length === 0 && (
        <p className="text-center text-kn-muted py-12">अभी कोई विचार-लेख उपलब्ध नहीं है।</p>
      )}
    </div>
  );
}
