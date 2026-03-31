"use client";

import { useState, useTransition } from "react";
import RecipeCard from "@/components/RecipeCard";
import type { Recipe } from "@/lib/recipes";

type RecipeGridClientProps = {
  initial: Recipe[];
  perPage?: number;
};

function dedupe(list: Recipe[]) {
  const map = new Map<string, Recipe>();
  list.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

export default function RecipeGridClient({
  initial,
  perPage = 9,
}: RecipeGridClientProps) {
  const [recipes, setRecipes] = useState<Recipe[]>(dedupe(initial));
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    startTransition(async () => {
      const response = await fetch(`/api/recipes/random?count=${perPage}`, {
        cache: "no-store",
      });
      if (!response.ok) return;
      const data = (await response.json()) as Recipe[];
      setRecipes((prev) => dedupe([...prev, ...data]));
    });
  }

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-3">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={loadMore}
          className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-[color:var(--accent-3)] shadow-sm transition hover:bg-[color:var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
        >
          {isPending ? "Loading..." : "Show more"}
        </button>
      </div>
    </div>
  );
}
