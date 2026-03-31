import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { type Lang, t } from "@/lib/i18n";
import CakeMark from "@/components/CakeMark";

type SiteHeaderProps = {
  lang: Lang;
};

export default function SiteHeader({ lang }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-[color:var(--surface)]/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--accent)] text-lg font-semibold text-white shadow-md">
            <CakeMark />
          </div>
          <div>
            <p className="font-[family-name:var(--font-serif)] text-lg font-semibold">
              Caketruffle
            </p>
            <p className="text-xs text-[color:var(--muted)]">
              recipe index
            </p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link className="hover:text-[color:var(--accent-3)]" href="/">
            {t(lang, "home")}
          </Link>
          <Link className="hover:text-[color:var(--accent-3)]" href="/recipes">
            {t(lang, "recipes")}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher lang={lang} />
          <Link
            className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--accent-3)]"
            href="/recipes"
          >
            {t(lang, "explore")}
          </Link>
        </div>
      </div>
    </header>
  );
}
