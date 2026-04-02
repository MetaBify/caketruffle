import type { Metadata } from "next";
import { Fraunces, Manrope, Noto_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdNetworkScripts from "@/components/AdNetworkScripts";
import { cookies } from "next/headers";
import { normalizeLang } from "@/lib/i18n";
import { getAdSettings } from "@/lib/settings";

const displayLatin = Fraunces({
  variable: "--font-display-latin",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const bodyLatin = Manrope({
  variable: "--font-body-latin",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const displayCyrillic = Noto_Serif({
  variable: "--font-display-cyr",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
});

const bodyCyrillic = Noto_Sans({
  variable: "--font-body-cyr",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "700"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://caketruffle.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Caketruffle",
    template: "%s | Caketruffle",
  },
  description: "Clear recipes, real measurements, and easy steps.",
  applicationName: "Caketruffle",
  keywords: [
    "recipes",
    "cooking",
    "ingredients",
    "step by step",
    "food",
    "meals",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Caketruffle",
    description: "Clear recipes, real measurements, and easy steps.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Caketruffle",
    description: "Clear recipes, real measurements, and easy steps.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adSettings = await getAdSettings();
  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get("lang")?.value);
  return (
    <html
      lang={lang}
      data-lang={lang}
      data-adsense={adSettings.adsenseEnabled ? "true" : "false"}
      data-adsterra={adSettings.adsterraEnabled ? "true" : "false"}
      className={`${displayLatin.variable} ${bodyLatin.variable} ${displayCyrillic.variable} ${bodyCyrillic.variable} h-full antialiased`}
    >
      <head>
        {adSettings.adsenseEnabled ? (
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5356953527878151"
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body className="min-h-full flex flex-col">
        <SiteHeader lang={lang} />
        <main className="flex-1">{children}</main>
        <SiteFooter lang={lang} />
        <AdNetworkScripts
          adsterraEnabled={adSettings.adsterraEnabled}
          popunderEnabled={adSettings.adsterraPopunderEnabled}
          socialbarEnabled={adSettings.adsterraSocialbarEnabled}
        />
      </body>
    </html>
  );
}
