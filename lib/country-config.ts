// lib/country-config.ts
//
// Source UNIQUE de vérité pays → devise → locale (BCP-47) → langue d'interface.
// Fichier volontairement sans "use client" ni dépendance : il est importé à la
// fois par proxy.ts (serveur/edge) et par context/LocaleProvider.tsx (client).
//
// Pour ajouter un pays : ajouter UNE ligne dans COUNTRY_CONFIG. La langue UI
// est dérivée du préfixe de la locale, il n'y a pas de second tableau à tenir
// à jour.

// ---------------------------------------------------------------------------
// Langues d'interface supportées (celles que le backend sait traduire via DeepL)
// ---------------------------------------------------------------------------
export const UI_LANGUAGES = ["fr", "en", "ar", "pt"] as const
export type UiLanguage = (typeof UI_LANGUAGES)[number]

// Langue utilisée quand la langue du pays n'est pas supportée
// (ex : am-ET amharique, so-SO somali → anglais).
export const FALLBACK_UI_LANGUAGE: UiLanguage = "en"

// Langues écrites de droite à gauche (appliqué sur <html dir="...">).
export const RTL_LANGUAGES: readonly UiLanguage[] = ["ar"]

// Pays par défaut (marché principal) quand la géoloc échoue ou que le pays
// détecté n'est pas desservi.
export const DEFAULT_COUNTRY = "CI"

// ---------------------------------------------------------------------------
// Cookies partagés proxy.ts <-> LocaleProvider
// ---------------------------------------------------------------------------
export const COUNTRY_COOKIE = "nx_country"
export const LOCALE_COOKIE = "nx_locale" // contient la langue UI : fr | en | ar | pt

// Marqueurs : valent "manual" quand le visiteur a CHOISI son pays / sa langue lui-même.
// Sans marqueur, le pays est ré-détecté à chaque visite (devise dynamique, comme avant) ;
// avec marqueur, le choix du visiteur n'est jamais écrasé par la géolocalisation.
export const COUNTRY_SOURCE_COOKIE = "nx_country_src"
export const LOCALE_SOURCE_COOKIE = "nx_locale_src"

// Valeur détectée automatiquement : durée courte (elle est de toute façon recalculée à chaque
// visite tant que le visiteur n'a rien choisi). Choix manuel de l'utilisateur : durée longue.
export const AUTO_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 jours
export const MANUAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 an

// ---------------------------------------------------------------------------
// Table pays → devise + locale
// ---------------------------------------------------------------------------
export type CountryConfig = {
  currency: string
  locale: string
}

export const COUNTRY_CONFIG: Record<string, CountryConfig> = {
  // Afrique de l'Ouest — zone UEMOA (XOF)
  CI: { currency: "XOF", locale: "fr-CI" },
  BF: { currency: "XOF", locale: "fr-BF" },
  SN: { currency: "XOF", locale: "fr-SN" },
  ML: { currency: "XOF", locale: "fr-ML" },
  BJ: { currency: "XOF", locale: "fr-BJ" },
  TG: { currency: "XOF", locale: "fr-TG" },
  NE: { currency: "XOF", locale: "fr-NE" },
  GW: { currency: "XOF", locale: "fr-GW" },

  // Afrique centrale — zone CEMAC (XAF)
  CM: { currency: "XAF", locale: "fr-CM" },
  CF: { currency: "XAF", locale: "fr-CF" },
  GA: { currency: "XAF", locale: "fr-GA" },
  CG: { currency: "XAF", locale: "fr-CG" },
  GQ: { currency: "XAF", locale: "fr-GQ" },
  TD: { currency: "XAF", locale: "fr-TD" },

  // Afrique de l'Ouest — hors zone CFA
  GN: { currency: "GNF", locale: "fr-GN" },
  NG: { currency: "NGN", locale: "en-NG" },
  GH: { currency: "GHS", locale: "en-GH" },
  LR: { currency: "LRD", locale: "en-LR" },
  SL: { currency: "SLL", locale: "en-SL" },
  GM: { currency: "GMD", locale: "en-GM" },
  CV: { currency: "CVE", locale: "pt-CV" },

  // Afrique centrale — hors zone CEMAC
  CD: { currency: "CDF", locale: "fr-CD" },
  ST: { currency: "STN", locale: "pt-ST" },

  // Afrique du Nord
  MA: { currency: "MAD", locale: "fr-MA" },
  TN: { currency: "TND", locale: "fr-TN" },
  DZ: { currency: "DZD", locale: "fr-DZ" },
  LY: { currency: "LYD", locale: "ar-LY" },
  EG: { currency: "EGP", locale: "ar-EG" },
  MR: { currency: "MRU", locale: "fr-MR" },

  // Afrique de l'Est
  KE: { currency: "KES", locale: "en-KE" },
  UG: { currency: "UGX", locale: "en-UG" },
  TZ: { currency: "TZS", locale: "en-TZ" },
  RW: { currency: "RWF", locale: "en-RW" },
  BI: { currency: "BIF", locale: "fr-BI" },
  ET: { currency: "ETB", locale: "am-ET" },
  SO: { currency: "SOS", locale: "so-SO" },
  DJ: { currency: "DJF", locale: "fr-DJ" },
  SD: { currency: "SDG", locale: "ar-SD" },
  SS: { currency: "SSP", locale: "en-SS" },
  ER: { currency: "ERN", locale: "en-ER" },

  // Afrique australe
  ZA: { currency: "ZAR", locale: "en-ZA" },
  NA: { currency: "NAD", locale: "en-NA" },
  BW: { currency: "BWP", locale: "en-BW" },
  ZW: { currency: "ZWL", locale: "en-ZW" },
  MZ: { currency: "MZN", locale: "pt-MZ" },
  AO: { currency: "AOA", locale: "pt-AO" },
  ZM: { currency: "ZMW", locale: "en-ZM" },
  MW: { currency: "MWK", locale: "en-MW" },
  SZ: { currency: "SZL", locale: "en-SZ" },
  LS: { currency: "LSL", locale: "en-LS" },

  // Océan Indien
  MG: { currency: "MGA", locale: "fr-MG" },
  MU: { currency: "MUR", locale: "en-MU" },
  KM: { currency: "KMF", locale: "fr-KM" },
  SC: { currency: "SCR", locale: "en-SC" },

  // Hors Afrique
  US: { currency: "USD", locale: "en-US" },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalise un code pays (trim + majuscules). Retourne null s'il n'est pas desservi. */
export function normalizeCountry(code: string | null | undefined): string | null {
  if (!code) return null
  const upper = code.trim().toUpperCase()
  return Object.prototype.hasOwnProperty.call(COUNTRY_CONFIG, upper) ? upper : null
}

export function isUiLanguage(value: string | null | undefined): value is UiLanguage {
  return !!value && (UI_LANGUAGES as readonly string[]).includes(value)
}

/** Dérive la langue UI du préfixe de la locale ("fr-CI" → "fr"), repli sur l'anglais. */
export function getUiLanguage(locale: string): UiLanguage {
  const prefix = locale.split("-")[0].toLowerCase()
  return isUiLanguage(prefix) ? prefix : FALLBACK_UI_LANGUAGE
}

/** Sens d'écriture d'une langue d'interface. */
export function getDirection(language: string): "rtl" | "ltr" {
  return (RTL_LANGUAGES as readonly string[]).includes(language) ? "rtl" : "ltr"
}

export type ResolvedCountry = {
  country: string
  currency: string
  locale: string
  language: UiLanguage
}

/** Résout un code pays (même invalide) en configuration complète, repli sur DEFAULT_COUNTRY. */
export function resolveCountry(code: string | null | undefined): ResolvedCountry {
  const country = normalizeCountry(code) ?? DEFAULT_COUNTRY
  const { currency, locale } = COUNTRY_CONFIG[country]
  return { country, currency, locale, language: getUiLanguage(locale) }
}

// ---------------------------------------------------------------------------
// Liste des pays pour les sélecteurs (livraison, etc.)
// ---------------------------------------------------------------------------

// Pays présents dans la table uniquement pour l'affichage de la devise.
const NON_AFRICAN_COUNTRIES = new Set(["US"])

export type CountryOption = { code: string; name: string }

const displayNamesCache = new Map<string, Intl.DisplayNames>()
const africanCountriesCache = new Map<string, CountryOption[]>()

/** Nom d'un pays dans la langue demandée, via Intl (aucun nom codé en dur). */
export function getCountryName(code: string, language: string = "fr"): string {
  try {
    let names = displayNamesCache.get(language)
    if (!names) {
      names = new Intl.DisplayNames([language], { type: "region" })
      displayNamesCache.set(language, names)
    }
    return names.of(code) ?? code
  } catch {
    return code
  }
}

/** Tous les pays africains de COUNTRY_CONFIG, triés par nom dans la langue demandée. */
export function getAfricanCountries(language: string = "fr"): CountryOption[] {
  const cached = africanCountriesCache.get(language)
  if (cached) return cached

  const list = Object.keys(COUNTRY_CONFIG)
    .filter((code) => !NON_AFRICAN_COUNTRIES.has(code))
    .map((code) => ({ code, name: getCountryName(code, language) }))
    .sort((a, b) => a.name.localeCompare(b.name, language))

  africanCountriesCache.set(language, list)
  return list
}