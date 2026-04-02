import type { Metadata } from "next";
import { cookies } from "next/headers";
import { normalizeLang, t } from "@/lib/i18n";
import {
  filterByCategory,
  getRandomMeals,
  listCategories,
  searchMeals,
} from "@/lib/recipes";
import RecipeCard from "@/components/RecipeCard";
import AdSlot from "@/components/AdSlot";
import RecipeGridClient from "@/components/RecipeGridClient";

type RecipesPageProps = {
  searchParams?: Promise<{ q?: string; category?: string; page?: string }>;
};

export const metadata: Metadata = {
  title: "Recipes",
  description: "Browse curated recipes with clear ingredients and steps.",
  alternates: {
    canonical: "/recipes",
  },
  openGraph: {
    title: "Recipes",
    description: "Browse curated recipes with clear ingredients and steps.",
  },
  twitter: {
    card: "summary",
    title: "Recipes",
    description: "Browse curated recipes with clear ingredients and steps.",
  },
};

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get("lang")?.value);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const query = resolvedSearchParams?.q ?? "";
  const category = resolvedSearchParams?.category ?? "";
  const [categories, recipes] = await Promise.all([
    listCategories(),
    query
      ? searchMeals(query)
      : category
        ? filterByCategory(category)
        : getRandomMeals(9),
  ]);

  const uniqueRecipes = Array.from(
    new Map(recipes.map((recipe) => [recipe.id, recipe])).values()
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{t(lang, "recipes")}</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Curated dishes with soft steps and precise amounts.
          </p>
        </div>
        <form action="/recipes" method="get" className="flex gap-2">
          <input
            name="q"
            placeholder={t(lang, "searchPlaceholder")}
            defaultValue={query}
            className="min-w-[240px] rounded-full border border-black/10 bg-white px-4 py-2 text-sm shadow-sm outline-none focus:border-[color:var(--ring)]"
          />
          <button
            type="submit"
            className="rounded-full bg-[color:var(--accent)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--accent-3)]"
          >
            Search
          </button>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.slice(0, 10).map((cat) => (
          <a
            key={cat.idCategory}
            href={`/recipes?category=${encodeURIComponent(cat.strCategory)}`}
            className={`rounded-full px-4 py-2 text-xs font-semibold shadow-sm ${
              cat.strCategory === category
                ? "bg-[color:var(--accent)] text-white"
                : "bg-white/80 text-[color:var(--muted)]"
            }`}
          >
            {cat.strCategory}
          </a>
        ))}
      </div>

      <div className="mt-8">
        {query || category ? (
          <div className="grid gap-6 md:grid-cols-3">
            {uniqueRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <RecipeGridClient initial={uniqueRecipes} />
        )}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[2fr_1fr]">
        <AdSlot variant="wide" />
        <AdSlot variant="tall" className="min-h-[240px]" />
      </div>

    </div>
  );
}
