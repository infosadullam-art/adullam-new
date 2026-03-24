"use client"

import { createContext, useContext, useEffect, useState } from "react"

export type LocaleData = {
  country: string
  language: "fr" | "en"
  locale: "fr-FR" | "en-US"
  currency: "XOF" | "NGN" | "GHS" | "KES" | "ZAR" | "USD"
}

const LocaleContext = createContext<LocaleData | null>(null)

// 🌍 Mapping AFRIQUE
const COUNTRY_MAP: Record<string, LocaleData> = {
  CI: { country: "CI", language: "fr", locale: "fr-FR", currency: "XOF" },
  SN: { country: "SN", language: "fr", locale: "fr-FR", currency: "XOF" },
  BJ: { country: "BJ", language: "fr", locale: "fr-FR", currency: "XOF" },
  BF: { country: "BF", language: "fr", locale: "fr-FR", currency: "XOF" },
  TG: { country: "TG", language: "fr", locale: "fr-FR", currency: "XOF" },
  ML: { country: "ML", language: "fr", locale: "fr-FR", currency: "XOF" },

  NG: { country: "NG", language: "en", locale: "en-US", currency: "NGN" },
  GH: { country: "GH", language: "en", locale: "en-US", currency: "GHS" },
  KE: { country: "KE", language: "en", locale: "en-US", currency: "KES" },
  ZA: { country: "ZA", language: "en", locale: "en-US", currency: "ZAR" },
}

// 🔒 Fallback Afrique par défaut
const DEFAULT_LOCALE: LocaleData = {
  country: "CI",
  language: "fr",
  locale: "fr-FR",
  currency: "XOF",
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<LocaleData>(DEFAULT_LOCALE)

  useEffect(() => {
    let mounted = true

    async function detectLocale() {
      try {
        const res = await fetch("https://ipapi.co/json/")
        const data = await res.json()

        const countryCode = data?.country_code
        if (mounted && countryCode && COUNTRY_MAP[countryCode]) {
          setLocale(COUNTRY_MAP[countryCode])
        }
      } catch {
        console.warn("Locale detection failed – fallback Africa used")
      }
    }

    detectLocale()
    return () => {
      mounted = false
    }
  }, [])

  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error("useLocale must be used inside LocaleProvider")
  }
  return ctx
}
