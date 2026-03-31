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

export type StepSectionKey = "prepare" | "cook" | "serve" | "steps";

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
  stepSections: { key: StepSectionKey; steps: string[] }[];
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
    stepSections: [],
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
  const stepSections = buildStepSections(steps);

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
    stepSections,
  };
}

function extractIngredients(meal: Meal): { name: string; measure: string }[] {
  const items: { name: string; measure: string }[] = [];
  for (let i = 1; i <= 20; i += 1) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      const normalized = normalizeIngredient(ingredient.trim(), measure);
      items.push({
        name: normalized.name,
        measure: normalized.measure,
      });
    }
  }
  return items;
}

const UNIT_WORDS = new Set([
  "tsp",
  "tbsp",
  "tbs",
  "tablespoon",
  "tablespoons",
  "teaspoon",
  "teaspoons",
  "cup",
  "cups",
  "ml",
  "l",
  "g",
  "kg",
  "oz",
  "lb",
  "lbs",
  "pinch",
  "dash",
  "clove",
  "cloves",
  "slice",
  "slices",
  "can",
  "cans",
  "packet",
  "packets",
  "piece",
  "pieces",
  "handful",
]);

function normalizeIngredient(ingredient: string, measure?: string) {
  const rawMeasure = (measure ?? "").trim();
  if (!rawMeasure) {
    return { name: ingredient, measure: "" };
  }

  const tokens = rawMeasure.split(/\s+/);
  let name = ingredient;
  let cleanedMeasure = rawMeasure;

  if (tokens.length > 1 && /[0-9]/.test(tokens[0])) {
    const rest = tokens.slice(1);
    const restIsUnits = rest.every((token) =>
      UNIT_WORDS.has(token.toLowerCase())
    );
    if (!restIsUnits) {
      name = `${rest.join(" ")} ${ingredient}`.trim();
      cleanedMeasure = tokens[0];
    }
  }

  if (/^\\d{2}$/.test(cleanedMeasure) && /egg/i.test(ingredient)) {
    cleanedMeasure = `${cleanedMeasure[0]}-${cleanedMeasure[1]}`;
  }

  return { name, measure: cleanedMeasure };
}

function parseSteps(instructions: string): string[] {
  const cleaned = instructions.trim();
  if (!cleaned) return [];
  const byLine = cleaned
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const base = byLine.length > 1 ? byLine : [cleaned];

  return base
    .flatMap(splitNumberedSteps)
    .flatMap(splitSentences)
    .flatMap(splitLongStep)
    .map(cleanStep)
    .filter(Boolean);
}

function splitNumberedSteps(text: string): string[] {
  if (!/(^|\s)\d+[\).]\s+/.test(text)) {
    return [text];
  }
  return text
    .split(/(?:^|\s)(?:\d+[\).])\s+/)
    .map((step) => step.trim())
    .filter(Boolean);
}

function splitSentences(text: string): string[] {
  return text
    .replace(/([.!?])\s+/g, "$1|")
    .split("|")
    .map((step) => step.trim())
    .filter(Boolean);
}

function splitLongStep(step: string): string[] {
  if (step.length <= 160) {
    return [step];
  }

  const connectorSplit = step
    .replace(
      /\b(then|next|after that|afterwards|meanwhile|once|when)\b/gi,
      "|$1"
    )
    .split("|")
    .map((piece) => piece.trim())
    .filter(Boolean);
  if (connectorSplit.length > 1) {
    return connectorSplit;
  }

  const semicolonSplit = step
    .split(/;\s+/)
    .map((piece) => piece.trim())
    .filter(Boolean);
  if (semicolonSplit.length > 1) {
    return semicolonSplit;
  }

  return [step];
}

function cleanStep(step: string): string {
  return step
    .replace(/^[\s•\-–—]+/, "")
    .replace(/^\d+[\).]\s+/, "")
    .trim();
}

function buildStepSections(steps: string[]) {
  if (steps.length === 0) {
    return [];
  }

  const sections: { key: StepSectionKey; steps: string[] }[] = [];
  const categorize = (text: string): StepSectionKey => {
    const lower = text.toLowerCase();
    if (
      /(prep|prepare|preheat|peel|chop|slice|cut|mix|combine|whisk|marinate|season)/.test(
        lower
      )
    ) {
      return "prepare";
    }
    if (
      /(cook|bake|fry|grill|roast|simmer|boil|saute|steam|broil)/.test(lower)
    ) {
      return "cook";
    }
    if (/(serve|garnish|plate|enjoy)/.test(lower)) {
      return "serve";
    }
    return "steps";
  };

  steps.forEach((step, index) => {
    let title = categorize(step);
    if (title === "steps" && index < 2) {
      title = "prepare";
    }
    const current = sections[sections.length - 1];
    if (!current || current.key !== title) {
      sections.push({ key: title, steps: [step] });
    } else {
      current.steps.push(step);
    }
  });

  return sections;
}
