// context/LocaleProvider.tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"

type LocaleContextType = {
  country: string
  currency: string
  locale: string
  setCountry: (country: string) => void
  isLoading: boolean
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

// Mapping pays → devise + locale
const countryConfig: Record<string, { currency: string; locale: string }> = {
  // 🌍 AFRIQUE DE L'OUEST (UEMOA - XOF)
  CI: { currency: "XOF", locale: "fr-CI" },
  BF: { currency: "XOF", locale: "fr-BF" },
  SN: { currency: "XOF", locale: "fr-SN" },
  ML: { currency: "XOF", locale: "fr-ML" },
  BJ: { currency: "XOF", locale: "fr-BJ" },
  TG: { currency: "XOF", locale: "fr-TG" },
  NE: { currency: "XOF", locale: "fr-NE" },
  GW: { currency: "XOF", locale: "fr-GW" },
  
  // 🌍 AFRIQUE CENTRALE (CEMAC - XAF)
  CM: { currency: "XAF", locale: "fr-CM" },
  CF: { currency: "XAF", locale: "fr-CF" },
  GA: { currency: "XAF", locale: "fr-GA" },
  CG: { currency: "XAF", locale: "fr-CG" },
  GQ: { currency: "XAF", locale: "fr-GQ" },
  TD: { currency: "XAF", locale: "fr-TD" },
  
  // 🌍 AFRIQUE DE L'OUEST HORS UEMOA
  NG: { currency: "NGN", locale: "en-NG" },
  GH: { currency: "GHS", locale: "en-GH" },
  LR: { currency: "LRD", locale: "en-LR" },
  SL: { currency: "SLL", locale: "en-SL" },
  GM: { currency: "GMD", locale: "en-GM" },
  CV: { currency: "CVE", locale: "pt-CV" },
  
  // 🌍 AFRIQUE DU NORD
  MA: { currency: "MAD", locale: "fr-MA" },
  TN: { currency: "TND", locale: "fr-TN" },
  DZ: { currency: "DZD", locale: "fr-DZ" },
  LY: { currency: "LYD", locale: "ar-LY" },
  EG: { currency: "EGP", locale: "ar-EG" },
  MR: { currency: "MRU", locale: "fr-MR" },
  
  // 🌍 AFRIQUE DE L'EST
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
  
  // 🌍 AFRIQUE AUSTRALE
  ZA: { currency: "ZAR", locale: "en-ZA" },
  NA: { currency: "NAD", locale: "en-NA" },
  BW: { currency: "BWP", locale: "en-BW" },
  ZW: { currency: "ZWL", locale: "en-ZW" },
  MZ: { currency: "MZN", locale: "pt-MZ" },
  AO: { currency: "AOA", locale: "pt-AO" },
  ZM: { currency: "ZMW", locale: "en-ZM" },
  MW: { currency: "MWK", locale: "en-MW" },
  MG: { currency: "MGA", locale: "fr-MG" },
  MU: { currency: "MUR", locale: "en-MU" },
  KM: { currency: "KMF", locale: "fr-KM" },
  SC: { currency: "SCR", locale: "en-SC" },
  
  // 🇺🇸 ÉTATS-UNIS
  US: { currency: "USD", locale: "en-US" },
  
  // 🌍 Défaut
  default: { currency: "XOF", locale: "fr-CI" }
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountry] = useState("CI")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const detectCountry = async () => {
      try {
        // 1. Vérifier localStorage
        const saved = localStorage.getItem("user_country")
        if (saved && countryConfig[saved]) {
          setCountry(saved)
          setIsLoading(false)
          return
        }

        // 2. Détection par IP
        const response = await fetch("https://ipapi.co/json/")
        const data = await response.json()
        
        // Vérifier si le pays détecté est dans notre config
        if (data.country_code && countryConfig[data.country_code]) {
          setCountry(data.country_code)
          localStorage.setItem("user_country", data.country_code)
        } else {
          // Si pays non supporté, utiliser CI par défaut
          setCountry("CI")
          localStorage.setItem("user_country", "CI")
        }
      } catch (error) {
        console.warn("⚠️ Erreur détection pays, utilisation CI par défaut")
        setCountry("CI")
      } finally {
        setIsLoading(false)
      }
    }

    detectCountry()
  }, [])

  const config = countryConfig[country] || countryConfig.default

  return (
    <LocaleContext.Provider
      value={{
        country,
        currency: config.currency,
        locale: config.locale,
        setCountry,
        isLoading
      }}
    >
      {children}
    </LocaleContext.Provider>
  )
}

export const useLocale = () => {
  const context = useContext(LocaleContext)
  if (!context) throw new Error("useLocale must be used within LocaleProvider")
  return context
}