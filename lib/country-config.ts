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

// Pays par défaut (marché principal) quand la géoloc échoue ou que le pays
// détecté n'est pas desservi.
export const DEFAULT_COUNTRY = "CI"

// ---------------------------------------------------------------------------
// Cookies partagés proxy.ts <-> LocaleProvider
// ---------------------------------------------------------------------------
export const COUNTRY_COOKIE = "nx_country"
export const LOCALE_COOKIE = "nx_locale" // contient la langue UI : fr | en | ar | pt

// Valeur détectée automatiquement : durée courte, on re-détecte ensuite
// (voyage, VPN...). Choix manuel de l'utilisateur : durée longue.
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
  NG: { currency: "NGN", locale: "en-NG" },
  GH: { currency: "GHS", locale: "en-GH" },
  LR: { currency: "LRD", locale: "en-LR" },
  SL: { currency: "SLL", locale: "en-SL" },
  GM: { currency: "GMD", locale: "en-GM" },
  CV: { currency: "CVE", locale: "pt-CV" },

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

  // Afrique australe
  ZA: { currency: "ZAR", locale: "en-ZA" },
  NA: { currency: "NAD", locale: "en-NA" },
  BW: { currency: "BWP", locale: "en-BW" },
  ZW: { currency: "ZWL", locale: "en-ZW" },
  MZ: { currency: "MZN", locale: "pt-MZ" },
  AO: { currency: "AOA", locale: "pt-AO" },
  ZM: { currency: "ZMW", locale: "en-ZM" },
  MW: { currency: "MWK", locale: "en-MW" },

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
