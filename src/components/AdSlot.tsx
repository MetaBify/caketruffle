"use client";

import { useEffect } from "react";

type AdSlotProps = {
  label?: string;
  className?: string;
  slot?: string;
  format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  layoutKey?: string;
  fullWidthResponsive?: boolean;
};

const AD_CLIENT = "ca-pub-5356953527878151";
const DEFAULT_SLOT = "9513932121";

export default function AdSlot({
  className,
  slot = DEFAULT_SLOT,
  format = "auto",
  layoutKey,
  fullWidthResponsive = true,
}: AdSlotProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
      (window as any).adsbygoogle = adsbygoogle;
    } catch {
      // ignore adsbygoogle errors in dev/test
    }
  }, []);

  return (
    <div
      className={`min-h-[120px] w-full rounded-lg border border-black/10 bg-white/70 shadow-sm ${
        className ?? ""
      }`}
    >
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout-key={layoutKey}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}
