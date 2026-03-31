import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getMealById } from "@/lib/recipes";
import { normalizeLang, t } from "@/lib/i18n";
import AdSlot from "@/components/AdSlot";

const EMOJI_STEPS = [
  "\u{1F944}",
  "\u{1F525}",
  "\u{1F9C2}",
  "\u{1F373}",
  "\u{1FAC7}",
  "\u{1F37D}\u{FE0F}",
  "\u{1F33F}",
  "\u2728",
];

type RecipePageProps = {
  params: Promise<{ id: string }>;
};

export default async function RecipePage({ params }: RecipePageProps) {
  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get("lang")?.value);
  const resolvedParams = await Promise.resolve(params);
  const recipe = await getMealById(resolvedParams.id);
  if (!recipe) return notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[var(--shadow)]">
          <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--muted)]">
            {recipe.category ?? "Recipe"}{" "}
            {recipe.area ? `• ${recipe.area}` : ""}
          </p>
          <h1 className="mt-3 text-3xl font-semibold">{recipe.title}</h1>
          {recipe.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.image}
              alt={recipe.title}
              className="mt-6 h-[220px] w-full rounded-3xl object-cover shadow-sm sm:h-[320px]"
            />
          ) : null}

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold">{t(lang, "ingredients")}</h2>
              <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
                {recipe.ingredients.map((item) => (
                  <li
                    key={`${item.name}-${item.measure}`}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="font-semibold text-[color:var(--ink)]">
                      {item.name}
                    </span>
                    {item.measure ? (
                      <span className="shrink-0 rounded-full bg-[color:var(--surface-2)] px-3 py-1 text-xs font-semibold text-[color:var(--accent-3)]">
                        {item.measure}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t(lang, "steps")}</h2>
              <div className="mt-3 space-y-5 text-sm text-[color:var(--muted)]">
                {recipe.stepSections.length === 0 ? (
                  <p className="text-[color:var(--muted)]">
                    No steps available for this recipe.
                  </p>
                ) : (
                  recipe.stepSections.map((section, sectionIndex) => (
                    <div key={`${section.key}-${sectionIndex}`}>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
                        {t(lang, section.key)}
                      </p>
                      <ol className="mt-3 space-y-3">
                        {section.steps.map((step, index) => (
                          <li
                            key={`${step}-${index}`}
                            className="flex gap-3"
                          >
                            <span className="text-lg">
                              {
                                EMOJI_STEPS[
                                  (sectionIndex + index) % EMOJI_STEPS.length
                                ]
                              }
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {recipe.sourceUrl ? (
            <p className="mt-6 text-xs text-[color:var(--muted)]">
              {t(lang, "source")}:{" "}
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[color:var(--accent-3)]"
              >
                Original recipe
              </a>
            </p>
          ) : null}
        </section>

        <aside className="space-y-4">
          <AdSlot label="Ad Slot - Tall" className="min-h-[280px]" />
          <AdSlot label="Ad Slot - Tall" className="min-h-[280px]" />
        </aside>
      </div>
    </div>
  );
}
