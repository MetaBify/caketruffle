"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { type Lang } from "@/lib/i18n";

const options: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "ru", label: "RU" },
];

type LanguageSwitcherProps = {
  lang: Lang;
};

export default function LanguageSwitcher({ lang }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nextUrl = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;

  return (
    <div className="flex items-center rounded-full border border-black/10 bg-white/70 p-1 text-xs font-semibold uppercase tracking-wide shadow-sm">
      {options.map((option) => (
        <a
          key={option.code}
          href={`/api/lang?set=${option.code}&next=${encodeURIComponent(
            nextUrl
          )}`}
          className={`rounded-full px-3 py-1 transition ${
            lang === option.code
              ? "bg-[color:var(--accent)] text-white"
              : "text-[color:var(--muted)] hover:text-[color:var(--accent-3)]"
          }`}
        >
          {option.label}
        </a>
      ))}
    </div>
  );
}
