// Server component ad slot: shows a direct-sold banner for the placement when
// one is active, otherwise falls back to Google AdSense (or a labelled
// placeholder during development). Direct ads are always clearly labelled.

import { getAdFor } from "@/lib/data";
import AdSenseAd from "./AdSenseAd";

type Props = {
  placement: string;
  className?: string;
  minHeight?: number;
  adsenseSlot?: string;
};

export default async function AdSlot({
  placement,
  className = "",
  minHeight = 90,
  adsenseSlot,
}: Props) {
  const ad = await getAdFor(placement);

  if (!ad) {
    return (
      <AdSenseAd className={className} minHeight={minHeight} slot={adsenseSlot} />
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <p className="text-[10px] uppercase tracking-widest text-neutral-400 text-center mb-1">
        विज्ञापन · Advertisement
      </p>
      <a
        href={`/api/ads/${ad.id}/click`}
        target="_blank"
        rel="noopener sponsored"
        className="block"
      >
        {/* separate desktop / mobile creatives */}
        <img
          src={ad.imageDesktop}
          alt={ad.advertiserName}
          loading="lazy"
          className={`w-full h-auto rounded-md ${ad.imageMobile ? "hidden sm:block" : ""}`}
        />
        {ad.imageMobile && (
          <img
            src={ad.imageMobile}
            alt={ad.advertiserName}
            loading="lazy"
            className="w-full h-auto rounded-md sm:hidden"
          />
        )}
      </a>
    </div>
  );
}
