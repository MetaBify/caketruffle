"use client";

import Script from "next/script";

type AdNetworkScriptsProps = {
  adsterraEnabled: boolean;
  popunderEnabled: boolean;
  socialbarEnabled: boolean;
};

export default function AdNetworkScripts({
  adsterraEnabled,
  popunderEnabled,
  socialbarEnabled,
}: AdNetworkScriptsProps) {
  if (!adsterraEnabled) return null;

  return (
    <>
      {socialbarEnabled ? (
        <Script
          src="https://overestimatecapricornspittle.com/8b/57/5d/8b575dd2e5ba67eaf6f9b0e8e11a4323.js"
          strategy="afterInteractive"
        />
      ) : null}
      {popunderEnabled ? (
        <Script
          src="https://overestimatecapricornspittle.com/ba/ef/d8/baefd8ee16d37e5641ed22c95cd1e48c.js"
          strategy="afterInteractive"
        />
      ) : null}
    </>
  );
}
