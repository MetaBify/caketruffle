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
    prepare: "Prepare",
    cook: "Cook",
    serve: "Serve",
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
    linkVault: "Bóveda de enlaces",
    searchPlaceholder: "Busca recetas, ingredientes o estilos",
    heroTitle: "Recetas claras y medidas reales.",
    heroSubtitle:
      "Busca, cocina y guarda favoritas con guías simples paso a paso.",
    featured: "Recetas destacadas",
    explore: "Explorar recetas",
    ingredients: "Ingredientes",
    steps: "Pasos",
    prepare: "Preparar",
    cook: "Cocinar",
    serve: "Servir",
    source: "Fuente",
    continue: "Continuar",
    waitToContinue: "Espera para continuar",
    orComplete: "o completa una oferta",
    offersTitle: "Ofertas",
    offerDisclaimer:
      "Las ofertas se abren en una nueva pestaña. La finalización se detecta automáticamente.",
    linkAccess: "Acceso a la bóveda",
    waitOrOffer:
      "Espera el temporizador o completa cualquier oferta para continuar.",
    offerComplete: "Oferta completada. Puedes continuar ahora.",
    unlockHint:
      "El botón se activa cuando el tiempo termina o se completa una oferta.",
    offersLoading: "Cargando ofertas...",
    offerError: "Las ofertas no están disponibles ahora.",
    adminTitle: "Control de admin",
    login: "Iniciar sesión",
    logout: "Cerrar sesión",
    createLink: "Crear enlace",
    shortLinks: "Enlaces cortos",
  },
  ru: {
    home: "Главная",
    recipes: "Рецепты",
    linkVault: "Хранилище ссылок",
    searchPlaceholder: "Ищи рецепты, ингредиенты или настроение",
    heroTitle: "Ясные рецепты и реальные меры.",
    heroSubtitle:
      "Ищите, готовьте и сохраняйте избранное с простыми шагами.",
    featured: "Избранные рецепты",
    explore: "Смотреть рецепты",
    ingredients: "Ингредиенты",
    steps: "Шаги",
    prepare: "Подготовка",
    cook: "Готовка",
    serve: "Подача",
    source: "Источник",
    continue: "Продолжить",
    waitToContinue: "Подождите, чтобы продолжить",
    orComplete: "или выполните любую офферу",
    offersTitle: "Офферы",
    offerDisclaimer:
      "Офферы открываются в новой вкладке. Завершение определяется автоматически.",
    linkAccess: "Доступ к хранилищу",
    waitOrOffer:
      "Дождитесь таймера или завершите любую офферу для продолжения.",
    offerComplete: "Оффер завершён. Можно продолжать.",
    unlockHint:
      "Кнопка активируется после таймера или завершения оффера.",
    offersLoading: "Загрузка офферов...",
    offerError: "Офферы временно недоступны.",
    adminTitle: "Панель управления",
    login: "Вход",
    logout: "Выход",
    createLink: "Создать ссылку",
    shortLinks: "Короткие ссылки",
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
