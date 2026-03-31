import Link from "next/link";
import type { Recipe } from "@/lib/recipes";

type RecipeCardProps = {
  recipe: Recipe;
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-[color:var(--surface-2)]">
        {recipe.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.image}
            alt={recipe.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[color:var(--accent-2)]/50 to-white" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
          {recipe.category ?? "Seasonal"}{" "}
          {recipe.area ? `• ${recipe.area}` : ""}
        </p>
        <h3 className="text-lg font-semibold">{recipe.title}</h3>
        <p className="text-sm text-[color:var(--muted)]">
          {recipe.ingredients.length
            ? `${recipe.ingredients.length} ingredients`
            : "Tap to see ingredients"}
        </p>
      </div>
    </Link>
  );
}
