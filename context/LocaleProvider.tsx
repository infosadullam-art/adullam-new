// context/LocaleProvider.tsx
"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  COUNTRY_COOKIE,
  COUNTRY_SOURCE_COOKIE,
  DEFAULT_COUNTRY,
  LOCALE_COOKIE,
  LOCALE_SOURCE_COOKIE,
  MANUAL_COOKIE_MAX_AGE,
  isUiLanguage,
  normalizeCountry,
  resolveCountry,
  type UiLanguage,
} from "@/lib/country-config"

// L'API publique reste celle que consomment les fichiers existants
// (country, currency, locale, setCountry, isLoading). `language` et `setLanguage` sont ajoutés.
// Pays (devise, livraison) et langue d'interface sont INDÉPENDANTS : changer de pays
// ne change jamais la langue choisie, et inversement.
type LocaleContextType = {
  country: string
  currency: string
  locale: string // BCP-47, passé tel quel à Intl.NumberFormat (ex "fr-CI", "en-NG")
  language: UiLanguage // langue d'interface : fr | en | ar | pt
  setCountry: (country: string) => void
  setLanguage: (language: UiLanguage) => void
  isLoading: boolean
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

function readCookie(name: string): string | null {
  const entry = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`))
  if (!entry) return null
  try {
    return decodeURIComponent(entry.slice(name.length + 1))
  } catch {
    return null
  }
}

function writeCookie(name: string, value: string, maxAge: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Rendu serveur et premier rendu client identiques (pas de mismatch d'hydratation),
  // puis lecture du cookie posé par proxy.ts juste après le montage.
  const [country, setCountryState] = useState(DEFAULT_COUNTRY)
  // null = pas de langue connue : on dérive celle du pays (utile avant la lecture du cookie).
  const [languageState, setLanguageState] = useState<UiLanguage | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const countryFromCookie = normalizeCountry(readCookie(COUNTRY_COOKIE))
    if (countryFromCookie) setCountryState(countryFromCookie)

    const languageFromCookie = readCookie(LOCALE_COOKIE)
    if (isUiLanguage(languageFromCookie)) setLanguageState(languageFromCookie)

    setIsLoading(false)
  }, [])

  // Choix manuel du pays (devise + livraison) : persisté 1 an. La langue n'est PAS modifiée.
  // proxy.ts ne réécrit jamais un cookie valide, donc le choix survit aux visites suivantes.
  const setCountry = useCallback((code: string) => {
    const normalized = normalizeCountry(code)
    if (!normalized) return // pays non desservi : on ignore plutôt que de casser les prix
    writeCookie(COUNTRY_COOKIE, normalized, MANUAL_COOKIE_MAX_AGE)
    writeCookie(COUNTRY_SOURCE_COOKIE, "manual", MANUAL_COOKIE_MAX_AGE) // proxy.ts ne ré-détecte plus ce visiteur
    setCountryState(normalized)
  }, [])

  // Choix manuel de la langue : persisté 1 an. Le composant appelant recharge la page
  // pour que les données (API) et l'interface repartent dans la nouvelle langue.
  const setLanguage = useCallback((next: UiLanguage) => {
    if (!isUiLanguage(next)) return
    writeCookie(LOCALE_COOKIE, next, MANUAL_COOKIE_MAX_AGE)
    writeCookie(LOCALE_SOURCE_COOKIE, "manual", MANUAL_COOKIE_MAX_AGE)
    setLanguageState(next)
  }, [])

  const value = useMemo<LocaleContextType>(() => {
    const resolved = resolveCountry(country)
    return {
      country: resolved.country,
      currency: resolved.currency,
      locale: resolved.locale,
      language: languageState ?? resolved.language,
      setCountry,
      setLanguage,
      isLoading,
    }
  }, [country, languageState, setCountry, setLanguage, isLoading])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export const useLocale = () => {
  const context = useContext(LocaleContext)
  if (!context) throw new Error("useLocale must be used within LocaleProvider")
  return context
}