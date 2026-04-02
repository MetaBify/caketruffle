"use client";

import { useEffect, useRef } from "react";

const AD_REDIRECT_URL =
  "https://www.profitablecpmratenetwork.com/r9rdnu3mu?key=64944c90ab6c4982b913889f63062228";
const CLICK_INTERVAL = 7;

function shouldIgnoreClick(event: MouseEvent) {
  if (event.defaultPrevented) return true;
  if (event.button !== 0) return true;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return true;
  }
  return false;
}

export default function AdClickGate() {
  const clickCount = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/admin")) return;

    const stored = Number(window.localStorage.getItem("adClickCount") ?? "0");
    clickCount.current = Number.isFinite(stored) ? stored : 0;

    const handler = (event: MouseEvent) => {
      if (shouldIgnoreClick(event)) return;
      if (document.body?.dataset.adclickDisabled === "true") return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      if (anchor.hasAttribute("data-no-adclick")) return;

      clickCount.current += 1;
      window.localStorage.setItem("adClickCount", String(clickCount.current));

      if (clickCount.current % CLICK_INTERVAL === 0) {
        window.open(AD_REDIRECT_URL, "_blank", "noopener,noreferrer");
      }
    };

    document.addEventListener("click", handler);
    return () => {
      document.removeEventListener("click", handler);
    };
  }, []);

  return null;
}
