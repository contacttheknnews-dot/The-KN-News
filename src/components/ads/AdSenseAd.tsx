"use client";

// Reusable Google AdSense unit. Reads the publisher id from
// NEXT_PUBLIC_ADSENSE_PUBLISHER_ID; when it is not configured (development)
// a clearly-labelled placeholder box renders instead so layouts stay honest.

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  slot?: string;
  format?: string;
  responsive?: boolean;
  className?: string;
  minHeight?: number;
};

export default function AdSenseAd({
  slot,
  format = "auto",
  responsive = true,
  className = "",
  minHeight = 90,
}: Props) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  const pushed = useRef(false);

  useEffect(() => {
    if (!publisherId || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // ignore — ad blocker or script not yet loaded
    }
  }, [publisherId]);

  if (!publisherId) {
    return (
      <div className={`w-full ${className}`}>
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 text-center mb-1">
          विज्ञापन · Advertisement
        </p>
        <div
          className="w-full rounded-md border border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center"
          style={{ minHeight }}
        >
          <span className="text-xs text-neutral-400">Ad Space — Google AdSense</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <p className="text-[10px] uppercase tracking-widest text-neutral-400 text-center mb-1">
        विज्ञापन · Advertisement
      </p>
      <Script
        id="adsense-loader"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
      <ins
        className="adsbygoogle block"
        style={{ display: "block", minHeight }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
