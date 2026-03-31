const API_BASE = "https://www.themealdb.com/api/json/v1";
const API_KEY = process.env.MEALDB_API_KEY ?? "1";

export type Meal = {
  idMeal: string;
  strMeal: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strMealThumb?: string;
  strSource?: string;
  strYoutube?: string;
  [key: string]: string | undefined;
};

export type Recipe = {
  id: string;
  title: string;
  image?: string;
  category?: string;
  area?: string;
  instructions?: string;
  sourceUrl?: string;
  youtube?: string;
  ingredients: { name: string; measure: string }[];
  steps: string[];
};

export type Category = {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
};

async function fetchMealDB<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number } }
): Promise<T> {
  const useNoStore = init?.cache === "no-store";
  const response = await fetch(`${API_BASE}/${API_KEY}/${path}`, {
    ...(useNoStore ? {} : { next: { revalidate: 3600 } }),
    ...init,
  });
  if (!response.ok) {
    throw new Error(`MealDB error: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function searchMeals(query: string): Promise<Recipe[]> {
  if (!query.trim()) {
    return [];
  }
  const data = await fetchMealDB<{ meals: Meal[] | null }>(
    `search.php?s=${encodeURIComponent(query)}`
  );
  return (data.meals ?? []).map(toRecipe);
}

export async function listCategories(): Promise<Category[]> {
  const data = await fetchMealDB<{ categories: Category[] }>("categories.php");
  return data.categories ?? [];
}

export async function filterByCategory(category: string): Promise<Recipe[]> {
  if (!category.trim()) {
    return [];
  }
  const data = await fetchMealDB<{ meals: Meal[] | null }>(
    `filter.php?c=${encodeURIComponent(category)}`
  );
  return (data.meals ?? []).map((meal) => ({
    id: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb,
    ingredients: [],
    steps: [],
  }));
}

export async function getMealById(id: string): Promise<Recipe | null> {
  const data = await fetchMealDB<{ meals: Meal[] | null }>(
    `lookup.php?i=${encodeURIComponent(id)}`
  );
  const meal = data.meals?.[0];
  return meal ? toRecipe(meal) : null;
}

export async function getRandomMeals(count = 6): Promise<Recipe[]> {
  const unique = new Map<string, Recipe>();
  let attempts = 0;

  while (unique.size < count && attempts < count * 4) {
    const remaining = count - unique.size;
    const batchSize = Math.min(remaining, 6);
    const requests = Array.from({ length: batchSize }, (_, index) =>
      fetchMealDB<{ meals: Meal[] }>(
        `random.php?ts=${Date.now()}-${attempts}-${index}-${Math.random()}`,
        { cache: "no-store" }
      )
    );
    const results = await Promise.all(requests);
    results.forEach((result) => {
      const recipe = toRecipe(result.meals[0]);
      unique.set(recipe.id, recipe);
    });
    attempts += batchSize;
  }

  return Array.from(unique.values()).slice(0, count);
}

function toRecipe(meal: Meal): Recipe {
  const ingredients = extractIngredients(meal);
  const instructions = meal.strInstructions ?? "";
  const steps = parseSteps(instructions);

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb,
    category: meal.strCategory,
    area: meal.strArea,
    instructions,
    sourceUrl: meal.strSource,
    youtube: meal.strYoutube,
    ingredients,
    steps,
  };
}

function extractIngredients(meal: Meal): { name: string; measure: string }[] {
  const items: { name: string; measure: string }[] = [];
  for (let i = 1; i <= 20; i += 1) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      items.push({
        name: ingredient.trim(),
        measure: measure?.trim() || "",
      });
    }
  }
  return items;
}

function parseSteps(instructions: string): string[] {
  const cleaned = instructions.trim();
  if (!cleaned) return [];
  const byLine = cleaned
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (byLine.length > 1) {
    return byLine;
  }
  return cleaned
    .split(/\. +/)
    .map((step) => step.trim())
    .filter(Boolean);
}
