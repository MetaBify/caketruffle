"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AdSlotVariant = "wide" | "tall" | "box" | "native";

type AdSlotProps = {
  className?: string;
  variant?: AdSlotVariant;
  useNative?: boolean;
};

const AD_CLIENT = "ca-pub-5356953527878151";
const ADSENSE_SLOT = "9513932121";

const ADSTERRA_UNITS = {
  wide: {
    key: "5de46641a4d1884a9b58d8c4c59eafb0",
    width: 728,
    height: 90,
    format: "iframe",
  },
  mobile: {
    key: "a5ba523913e973fc9ab4a264848deccf",
    width: 320,
    height: 50,
    format: "iframe",
  },
  tall: {
    key: "5f7f70debc937b256d8ce2f96a773c8f",
    width: 160,
    height: 600,
    format: "iframe",
  },
  box: {
    key: "306f23681560db221a0013f74022646f",
    width: 300,
    height: 250,
    format: "iframe",
  },
  native: {
    key: "aca2070e1f4f093f3a0a0a4a3d0331a3",
    containerId: "container-aca2070e1f4f093f3a0a0a4a3d0331a3",
  },
} as const;

declare global {
  interface Window {
    __adsterraQueue?: Promise<void>;
  }
}

export default function AdSlot({
  className,
  variant = "wide",
  useNative = false,
}: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [provider, setProvider] = useState<"adsterra" | "adsense" | "none">(
    "adsterra"
  );
  const [isMobile, setIsMobile] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const adsterraEnabled = root.dataset.adsterra === "true";
    const adsenseEnabled = root.dataset.adsense === "true";
    setProvider(adsterraEnabled ? "adsterra" : adsenseEnabled ? "adsense" : "none");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const adsterraUnit = useMemo(() => {
    if (variant === "wide") {
      if (isMobile || containerWidth < 520) {
        return ADSTERRA_UNITS.mobile;
      }
      if (useNative) {
        return ADSTERRA_UNITS.native;
      }
      return ADSTERRA_UNITS.wide;
    }
    if (variant === "tall") return ADSTERRA_UNITS.tall;
    if (variant === "box") return ADSTERRA_UNITS.box;
    if (variant === "native") return ADSTERRA_UNITS.native;
    return ADSTERRA_UNITS.wide;
  }, [variant, isMobile, containerWidth, useNative]);

  useEffect(() => {
    if (provider !== "adsterra") return;
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    const enqueue = () =>
      new Promise<void>((resolve) => {
        if (cancelled || !container.isConnected) {
          resolve();
          return;
        }

        container.innerHTML = "";

        if ("containerId" in adsterraUnit) {
          const nativeContainer = document.createElement("div");
          nativeContainer.id = adsterraUnit.containerId;
          container.appendChild(nativeContainer);
          const script = document.createElement("script");
          script.async = true;
          script.setAttribute("data-cfasync", "false");
          script.src = `https://overestimatecapricornspittle.com/${adsterraUnit.key}/invoke.js`;
          script.onload = () => resolve();
          script.onerror = () => resolve();
          container.appendChild(script);
          return;
        }

        const optionsScript = document.createElement("script");
        optionsScript.type = "text/javascript";
        optionsScript.text = `atOptions = ${JSON.stringify({
          key: adsterraUnit.key,
          format: adsterraUnit.format,
          height: adsterraUnit.height,
          width: adsterraUnit.width,
          params: {},
        })};`;
        container.appendChild(optionsScript);

        const invokeScript = document.createElement("script");
        invokeScript.src = `https://overestimatecapricornspittle.com/${adsterraUnit.key}/invoke.js`;
        invokeScript.async = true;
        invokeScript.onload = () => resolve();
        invokeScript.onerror = () => resolve();
        container.appendChild(invokeScript);
      });

    window.__adsterraQueue = (window.__adsterraQueue ?? Promise.resolve()).then(
      enqueue
    );

    return () => {
      cancelled = true;
    };
  }, [provider, adsterraUnit]);

  useEffect(() => {
    if (provider !== "adsense") return;
    if (typeof window === "undefined") return;
    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
      (window as any).adsbygoogle = adsbygoogle;
    } catch {
      // ignore adsbygoogle errors in dev/test
    }
  }, [provider]);

  const slotHeight =
    provider === "adsterra" && "height" in adsterraUnit
      ? adsterraUnit.height
      : undefined;
  const slotWidth =
    provider === "adsterra" && "width" in adsterraUnit
      ? adsterraUnit.width
      : undefined;
  const fallbackHeight =
    variant === "tall" ? 600 : variant === "box" ? 250 : 90;
  const slotStyle =
    slotHeight && slotWidth
      ? {
          minHeight: `${slotHeight}px`,
          height: `${slotHeight}px`,
          width: "100%",
          maxWidth: `${slotWidth}px`,
          marginLeft: "auto",
          marginRight: "auto",
        }
      : {
          minHeight: `${fallbackHeight}px`,
          width: "100%",
        };

  return (
    <div
      className={`flex w-full items-center justify-center overflow-hidden rounded-lg border border-black/10 bg-white/70 shadow-sm ${className ?? ""}`}
      ref={containerRef}
      style={slotStyle}
    >
      {provider === "adsense" ? (
        <ins
          className="adsbygoogle block"
          style={{ display: "block" }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={ADSENSE_SLOT}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : null}
    </div>
  );
}
