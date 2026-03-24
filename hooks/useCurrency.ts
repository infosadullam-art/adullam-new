"use client"

import { useLocale } from "@/context/LocaleProvider"

const EXCHANGE_RATES: Record<string, number> = {
  XOF: 612.75, XAF: 612.75, CDF: 2850,
  MAD: 10.02, TND: 3.12, DZD: 134.50,
  GNF: 8600, RWF: 1310, BIF: 2870,
  MGA: 4550, NGN: 1550, GHS: 15.20, ZAR: 18.40,
}

export const useCurrencyFormatter = () => {
  const { currency, locale } = useLocale()

  const convertFromUSD = (usdAmount: number): number => {
    const rate = EXCHANGE_RATES[currency] || EXCHANGE_RATES.XOF
    return usdAmount * rate
  }

  const formatPrice = (usdAmount: number) => {
    // ✅ GESTION DES ERREURS
    if (typeof usdAmount !== 'number' || isNaN(usdAmount)) {
      console.warn("❌ formatPrice: usdAmount invalide", usdAmount)
      return "—"
    }
    
    const convertedValue = convertFromUSD(usdAmount)
    const noDecimalCurrencies = ["XOF", "XAF", "CDF", "GNF", "RWF", "BIF", "MGA", "NGN"]
    const fractionDigits = noDecimalCurrencies.includes(currency) ? 0 : 2

    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      }).format(convertedValue)
    } catch (error) {
      console.error("❌ Erreur formatage prix:", error)
      return `${convertedValue.toFixed(fractionDigits)} ${currency}`
    }
  }

  return { formatPrice }
}