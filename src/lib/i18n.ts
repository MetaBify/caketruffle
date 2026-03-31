export type Lang = "en" | "es" | "ru";

const translations = {
  en: {
    home: "Home",
    recipes: "Recipes",
    linkVault: "Link Vault",
    searchPlaceholder: "Search recipes, ingredients, or vibes",
    heroTitle: "Clear recipes, real measurements.",
    heroSubtitle:
      "Search, cook, and save your favorites with simple step-by-step guides.",
    featured: "Featured Recipes",
    explore: "Explore Recipes",
    ingredients: "Ingredients",
    steps: "Steps",
    source: "Source",
    continue: "Continue",
    waitToContinue: "Wait to continue",
    orComplete: "or complete any offer",
    offersTitle: "Offers",
    offerDisclaimer:
      "Offers open in a new tab. Completion is detected automatically.",
    linkAccess: "Link Vault Access",
    waitOrOffer: "Wait for the timer or complete any one offer to continue.",
    offerComplete: "Offer completed. You can continue now.",
    unlockHint:
      "The button unlocks when the timer ends or an offer is completed.",
    offersLoading: "Loading offers...",
    offerError: "Offers are temporarily unavailable.",
    adminTitle: "Admin Control",
    login: "Log in",
    logout: "Log out",
    createLink: "Create Link",
    shortLinks: "Short Links",
  },
  es: {
    home: "Inicio",
    recipes: "Recetas",
    linkVault: "Boveda de enlaces",
    searchPlaceholder: "Busca recetas, ingredientes o estilos",
    heroTitle: "Recetas claras y medidas reales.",
    heroSubtitle:
      "Busca, cocina y guarda favoritas con guias simples paso a paso.",
    featured: "Recetas Destacadas",
    explore: "Explorar Recetas",
    ingredients: "Ingredientes",
    steps: "Pasos",
    source: "Fuente",
    continue: "Continuar",
    waitToContinue: "Espera para continuar",
    orComplete: "o completa una oferta",
    offersTitle: "Ofertas",
    offerDisclaimer:
      "Las ofertas se abren en una nueva pestana. La finalizacion se detecta automaticamente.",
    linkAccess: "Acceso a la boveda",
    waitOrOffer:
      "Espera el temporizador o completa cualquier oferta para continuar.",
    offerComplete: "Oferta completada. Puedes continuar ahora.",
    unlockHint:
      "El boton se activa cuando el tiempo termina o se completa una oferta.",
    offersLoading: "Cargando ofertas...",
    offerError: "Las ofertas no estan disponibles ahora.",
    adminTitle: "Control Admin",
    login: "Iniciar sesion",
    logout: "Cerrar sesion",
    createLink: "Crear enlace",
    shortLinks: "Enlaces cortos",
  },
  ru: {
    home: "Glavnaya",
    recipes: "Retsepty",
    linkVault: "Khranilishche ssylok",
    searchPlaceholder: "Ishi retsepty, ingredienty ili nastroenie",
    heroTitle: "Yasnye retsepty i realnye mery.",
    heroSubtitle:
      "Ishite, gotovte i sokhranyayte izbrannoe s prostymi shagami.",
    featured: "Izbrannye retsepty",
    explore: "Smotret retsepty",
    ingredients: "Ingredienty",
    steps: "Shagi",
    source: "Istochnik",
    continue: "Prodolzhit",
    waitToContinue: "Podozhdite, chtoby prodolzhit",
    orComplete: "ili vypolnite lyubuyu ofertu",
    offersTitle: "Oferty",
    offerDisclaimer:
      "Oferty otkryvayutsya v novoy vkladke. Zavershenie opredelyaetsya avtomaticheski.",
    linkAccess: "Dostup k khranilishchu",
    waitOrOffer:
      "Dozhdites taymera ili zavershite lyubuyu ofertu dlya prodolzheniya.",
    offerComplete: "Oferta zavershena. Mozhno prodolzhat.",
    unlockHint:
      "Knopka aktiviruetsya posle taimera ili zaversheniya ofert.",
    offersLoading: "Zagruzka ofert...",
    offerError: "Oferty vremenno nedostupny.",
    adminTitle: "Panel upravleniya",
    login: "Vkhod",
    logout: "Vykhod",
    createLink: "Sozdat ssylku",
    shortLinks: "Korotkie ssylki",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function normalizeLang(value?: string): Lang {
  if (value === "es" || value === "ru" || value === "en") {
    return value;
  }
  return "en";
}

export function t(lang: Lang, key: TranslationKey): string {
  return translations[lang][key] ?? translations.en[key];
}
