import type { Metadata } from "next";
import { Fraunces, Manrope, Noto_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { cookies } from "next/headers";
import { normalizeLang } from "@/lib/i18n";

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

export const metadata: Metadata = {
  title: "Savorlane",
  description: "Soft, modern recipes with a curated link vault.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get("lang")?.value);
  return (
    <html
      lang={lang}
      data-lang={lang}
      className={`${displayLatin.variable} ${bodyLatin.variable} ${displayCyrillic.variable} ${bodyCyrillic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader lang={lang} />
        <main className="flex-1">{children}</main>
        <SiteFooter lang={lang} />
      </body>
    </html>
  );
}
