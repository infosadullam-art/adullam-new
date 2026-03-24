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

// Mapping pays → devise + locale (Afrique + USA uniquement)
const countryConfig: Record<string, { currency: string; locale: string }> = {
  // 🌍 AFRIQUE DE L'OUEST (UEMOA - XOF)
  CI: { currency: "XOF", locale: "fr-CI" }, // Côte d'Ivoire
  BF: { currency: "XOF", locale: "fr-BF" }, // Burkina Faso
  SN: { currency: "XOF", locale: "fr-SN" }, // Sénégal
  ML: { currency: "XOF", locale: "fr-ML" }, // Mali
  BJ: { currency: "XOF", locale: "fr-BJ" }, // Bénin
  TG: { currency: "XOF", locale: "fr-TG" }, // Togo
  NE: { currency: "XOF", locale: "fr-NE" }, // Niger
  GW: { currency: "XOF", locale: "fr-GW" }, // Guinée-Bissau
  
  // 🌍 AFRIQUE CENTRALE (CEMAC - XAF)
  CM: { currency: "XAF", locale: "fr-CM" }, // Cameroun
  CF: { currency: "XAF", locale: "fr-CF" }, // Centrafrique
  GA: { currency: "XAF", locale: "fr-GA" }, // Gabon
  CG: { currency: "XAF", locale: "fr-CG" }, // Congo
  GQ: { currency: "XAF", locale: "fr-GQ" }, // Guinée Équatoriale
  TD: { currency: "XAF", locale: "fr-TD" }, // Tchad
  
  // 🌍 AFRIQUE DE L'OUEST HORS UEMOA
  NG: { currency: "NGN", locale: "en-NG" }, // Nigeria (Naira)
  GH: { currency: "GHS", locale: "en-GH" }, // Ghana (Cedi)
  LR: { currency: "LRD", locale: "en-LR" }, // Liberia (Dollar libérien)
  SL: { currency: "SLL", locale: "en-SL" }, // Sierra Leone (Leone)
  GM: { currency: "GMD", locale: "en-GM" }, // Gambie (Dalasi)
  CV: { currency: "CVE", locale: "pt-CV" }, // Cap-Vert (Escudo)
  
  // 🌍 AFRIQUE DU NORD
  MA: { currency: "MAD", locale: "fr-MA" }, // Maroc
  TN: { currency: "TND", locale: "fr-TN" }, // Tunisie
  DZ: { currency: "DZD", locale: "fr-DZ" }, // Algérie
  LY: { currency: "LYD", locale: "ar-LY" }, // Libye
  EG: { currency: "EGP", locale: "ar-EG" }, // Égypte
  MR: { currency: "MRU", locale: "fr-MR" }, // Mauritanie
  
  // 🌍 AFRIQUE DE L'EST
  KE: { currency: "KES", locale: "en-KE" }, // Kenya
  UG: { currency: "UGX", locale: "en-UG" }, // Ouganda
  TZ: { currency: "TZS", locale: "en-TZ" }, // Tanzanie
  RW: { currency: "RWF", locale: "en-RW" }, // Rwanda
  BI: { currency: "BIF", locale: "fr-BI" }, // Burundi
  ET: { currency: "ETB", locale: "am-ET" }, // Éthiopie
  SO: { currency: "SOS", locale: "so-SO" }, // Somalie
  DJ: { currency: "DJF", locale: "fr-DJ" }, // Djibouti
  SD: { currency: "SDG", locale: "ar-SD" }, // Soudan
  SS: { currency: "SSP", locale: "en-SS" }, // Soudan du Sud
  
  // 🌍 AFRIQUE AUSTRALE
  ZA: { currency: "ZAR", locale: "en-ZA" }, // Afrique du Sud
  NA: { currency: "NAD", locale: "en-NA" }, // Namibie
  BW: { currency: "BWP", locale: "en-BW" }, // Botswana
  ZW: { currency: "ZWL", locale: "en-ZW" }, // Zimbabwe
  MZ: { currency: "MZN", locale: "pt-MZ" }, // Mozambique
  AO: { currency: "AOA", locale: "pt-AO" }, // Angola
  ZM: { currency: "ZMW", locale: "en-ZM" }, // Zambie
  MW: { currency: "MWK", locale: "en-MW" }, // Malawi
  MG: { currency: "MGA", locale: "fr-MG" }, // Madagascar
  MU: { currency: "MUR", locale: "en-MU" }, // Maurice
  KM: { currency: "KMF", locale: "fr-KM" }, // Comores
  SC: { currency: "SCR", locale: "en-SC" }, // Seychelles
  
  // 🇺🇸 ÉTATS-UNIS (USD)
  US: { currency: "USD", locale: "en-US" }, // États-Unis
  
  // 🌍 Défaut (Côte d'Ivoire)
  default: { currency: "XOF", locale: "fr-CI" }
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountry] = useState("CI")
  const [isLoading, setIsLoading] = useState(true)

  // 🔴 MODE TEST : Forcer le Ghana pour tester
  useEffect(() => {
    // Commenter cette ligne après le test pour revenir à la normale
    setCountry("GH")
    setIsLoading(false)
    
    // ⚠️ Tout le code ci-dessous est commenté pour le test
    /*
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
    */
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