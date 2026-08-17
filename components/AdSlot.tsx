"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? "";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  slot?: string;
  className?: string;
}

export function AdSlot({ slot = "", className = "my-6" }: AdSlotProps) {
  const pushed = useRef(false);
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!PUBLISHER_ID || pushed.current) return;
    if (typeof window.adsbygoogle === "undefined") {
      window.adsbygoogle = [];
    }
    window.adsbygoogle.push({});
    pushed.current = true;
  }, []);

  if (!PUBLISHER_ID) return null;

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <div className={className}>
        <ins
          ref={insRef}
          className="adsbygoogle block w-full text-center"
          style={{ display: "block", minHeight: "90px" }}
          data-ad-client={PUBLISHER_ID}
          data-ad-slot={slot || undefined}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </>
  );
}
