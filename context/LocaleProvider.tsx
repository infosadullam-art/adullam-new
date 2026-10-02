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
  DEFAULT_COUNTRY,
  LOCALE_COOKIE,
  MANUAL_COOKIE_MAX_AGE,
  normalizeCountry,
  resolveCountry,
  type UiLanguage,
} from "@/lib/country-config"

// L'API publique reste celle que consomment les 19 fichiers existants
// (country, currency, locale, setCountry, isLoading). `language` est ajouté.
type LocaleContextType = {
  country: string
  currency: string
  locale: string // BCP-47, passé tel quel à Intl.NumberFormat (ex "fr-CI", "en-NG")
  language: UiLanguage // langue d'interface : fr | en | ar | pt
  setCountry: (country: string) => void
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fromCookie = normalizeCountry(readCookie(COUNTRY_COOKIE))
    if (fromCookie) setCountryState(fromCookie)
    setIsLoading(false)
  }, [])

  // Choix manuel : persiste pays + langue UI dans les cookies (1 an).
  // proxy.ts ne réécrit jamais un cookie valide, donc le choix survit aux visites suivantes.
  const setCountry = useCallback((code: string) => {
    const normalized = normalizeCountry(code)
    if (!normalized) return // pays non desservi : on ignore plutôt que de casser les prix
    const { language } = resolveCountry(normalized)
    writeCookie(COUNTRY_COOKIE, normalized, MANUAL_COOKIE_MAX_AGE)
    writeCookie(LOCALE_COOKIE, language, MANUAL_COOKIE_MAX_AGE)
    setCountryState(normalized)
  }, [])

  const value = useMemo<LocaleContextType>(() => {
    const resolved = resolveCountry(country)
    return {
      country: resolved.country,
      currency: resolved.currency,
      locale: resolved.locale,
      language: resolved.language,
      setCountry,
      isLoading,
    }
  }, [country, setCountry, isLoading])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export const useLocale = () => {
  const context = useContext(LocaleContext)
  if (!context) throw new Error("useLocale must be used within LocaleProvider")
  return context
}
