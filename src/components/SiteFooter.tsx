import Link from "next/link";
import { type Lang } from "@/lib/i18n";

type SiteFooterProps = {
  lang: Lang;
};

export default function SiteFooter({ lang }: SiteFooterProps) {
  return (
    <footer className="border-t border-white/50 bg-[color:var(--surface)]/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 text-xs text-[color:var(--muted)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-[family-name:var(--font-serif)] text-sm text-[color:var(--ink)]">
            Savorlane
          </p>
          <p>Soft recipes. Gentle steps. Cozy destinations.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span>Language: {lang.toUpperCase()}</span>
          <span>Ad slots are placeholders.</span>
          <Link
            href="/admin"
            className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)] hover:text-[color:var(--accent-3)]"
          >
            admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
