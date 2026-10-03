// lib/locale-client.ts
//
// Langue d'interface du visiteur côté navigateur, partagée par lib/api.ts et par
// tous les composants qui appellent l'API avec leur propre fetch.
// Le backend lit ?locale=xx en priorité (produits, catégories traduits à la volée).

import { LOCALE_COOKIE, isUiLanguage } from "./country-config"

/** Langue d'interface (cookie nx_locale). null côté serveur ou si le cookie est absent/invalide. */
export function getUiLocale(): string | null {
  if (typeof document === "undefined") return null
  const entry = document.cookie.split("; ").find((row) => row.startsWith(`${LOCALE_COOKIE}=`))
  if (!entry) return null
  try {
    const value = decodeURIComponent(entry.slice(LOCALE_COOKIE.length + 1))
    return isUiLanguage(value) ? value : null
  } catch {
    return null
  }
}

/**
 * Ajoute ?locale=xx (ou &locale=xx) à une URL ou un chemin d'API.
 * Les écritures (POST, PATCH, DELETE...) ne sont jamais modifiées et un `locale=` déjà présent est respecté.
 */
export function withLocale(url: string, method?: string): string {
  if ((method || "GET").toUpperCase() !== "GET") return url
  if (/[?&]locale=/.test(url)) return url
  const locale = getUiLocale()
  if (!locale) return url
  return `${url}${url.includes("?") ? "&" : "?"}locale=${locale}`
}
