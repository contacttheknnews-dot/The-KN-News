import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AD_PLACEMENTS } from "@/lib/constants";
import { formatHindiDate } from "@/lib/utils";
import { deleteAd } from "../actions";
import { DeleteButton } from "../ui";
import AdForm from "./AdForm";

export const dynamic = "force-dynamic";

export default async function AdsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireUser(["AD_MANAGER", "EDITOR"]);
  const sp = await searchParams;
  const ads = await prisma.advertisement.findMany({ orderBy: { createdAt: "desc" } });
  const editing = sp.edit ? ads.find((a) => a.id === Number(sp.edit)) : null;
  const placementLabel = (v: string) =>
    AD_PLACEMENTS.find((p) => p.value === v)?.label ?? v;

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-2">Direct Advertisements</h1>
      <p className="text-sm text-kn-muted mb-5">
        Businesses को सीधे बेचे गए बैनर यहां manage करें। हर placement पर active ad न
        होने पर AdSense fallback दिखता है।
      </p>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-start">
        <div className="bg-white rounded-lg border border-kn-border divide-y divide-kn-border">
          {ads.map((ad) => (
            <div key={ad.id} className="p-4 flex gap-4">
              <img
                src={ad.imageDesktop}
                alt={ad.advertiserName}
                className="w-32 h-16 object-cover rounded border border-kn-border shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm flex items-center gap-2">
                  {ad.advertiserName}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      ad.active ? "bg-green-100 text-green-700" : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {ad.active ? "ACTIVE" : "OFF"}
                  </span>
                </p>
                <p className="text-[11px] text-kn-muted mt-0.5">
                  {placementLabel(ad.placement)} · {ad.impressions} impressions · {ad.clicks} clicks
                </p>
                <p className="text-[11px] text-kn-muted">
                  {ad.startDate && <>From {formatHindiDate(ad.startDate)} </>}
                  {ad.endDate && <>till {formatHindiDate(ad.endDate)}</>}
                  {" · "}
                  <a href={ad.url} target="_blank" rel="noopener noreferrer" className="underline">
                    {ad.url}
                  </a>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <a href={`/admin/ads?edit=${ad.id}`} className="text-xs font-bold hover:underline">
                  Edit
                </a>
                <DeleteButton onDelete={deleteAd.bind(null, ad.id)} />
              </div>
            </div>
          ))}
          {ads.length === 0 && (
            <p className="p-8 text-center text-sm text-kn-muted">कोई advertisement नहीं।</p>
          )}
        </div>
        <AdForm
          key={editing?.id ?? "new"}
          item={
            editing
              ? {
                  id: editing.id,
                  advertiserName: editing.advertiserName,
                  imageDesktop: editing.imageDesktop,
                  imageMobile: editing.imageMobile ?? "",
                  url: editing.url,
                  placement: editing.placement,
                  startDate: editing.startDate?.toISOString().slice(0, 10) ?? "",
                  endDate: editing.endDate?.toISOString().slice(0, 10) ?? "",
                  active: editing.active,
                }
              : null
          }
        />
      </div>
    </div>
  );
}
