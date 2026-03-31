import { cookies } from "next/headers";
import { normalizeLang, t } from "@/lib/i18n";
import { getRandomMeals } from "@/lib/recipes";
import RecipeCard from "@/components/RecipeCard";
import AdSlot from "@/components/AdSlot";
import Link from "next/link";

export default async function Home() {
  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get("lang")?.value);
  const featured = await getRandomMeals(6);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
      <section className="grid gap-10 rounded-[36px] border border-white/70 bg-white/70 p-6 shadow-[var(--shadow)] sm:p-8 md:grid-cols-[1.1fr_0.9fr] md:p-10">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--muted)]">
            Caketruffle recipes
          </p>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl md:text-5xl">
            {t(lang, "heroTitle")}
          </h1>
          <p className="mt-4 text-base text-[color:var(--muted)]">
            {t(lang, "heroSubtitle")}
          </p>
          <form
            action="/recipes"
            method="get"
            className="mt-6 flex flex-col gap-3 sm:flex-row"
          >
            <input
              name="q"
              placeholder={t(lang, "searchPlaceholder")}
              className="flex-1 rounded-full border border-black/10 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--ring)]"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--accent-3)] sm:w-auto"
            >
              Search
            </button>
          </form>
          <div className="mt-6" />
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl bg-[color:var(--surface-2)] p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
              Today&apos;s mood
            </p>
            <h3 className="mt-3 text-2xl font-semibold">Honeyed Comfort</h3>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Warm spices, mellow sauces, and a quiet finish.
            </p>
          </div>
          <AdSlot label="Ad Slot - Hero" />
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t(lang, "featured")}</h2>
          <Link
            href="/recipes"
            className="text-sm font-semibold text-[color:var(--accent-3)]"
          >
            {t(lang, "explore")}
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {featured.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <AdSlot label="Ad Slot - Wide" />
      </section>
    </div>
  );
}
