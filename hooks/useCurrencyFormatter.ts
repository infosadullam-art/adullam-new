import { useLocale } from "@/context/LocaleProvider"

// ============================================
// 💰 TAUX DE CHANGE USD → DEVISES AFRICAINES
// ============================================
const EXCHANGE_RATES: Record<string, number> = {
  XOF: 615.50, XAF: 615.50,
  CDF: 2850,
  MAD: 10.02, TND: 3.12, DZD: 134.50, LYD: 4.80, EGP: 30.90,
  GNF: 8600, RWF: 1310, BIF: 2870, MGA: 4550,
  NGN: 1550, GHS: 15.20, ZAR: 18.40,
  KES: 130.50, UGX: 3750, TZS: 2550,
  ZMW: 26.80, MWK: 1700, MZN: 64.50, AOA: 830,
  BWP: 13.60, NAD: 18.40, SZL: 18.40, LSL: 18.40,
  MRU: 36.50, CVE: 100.50, STN: 22.80, SCR: 13.80,
  MUR: 46.20, KMF: 460,
  USD: 1.00,
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  XOF: "FCFA", XAF: "FCFA",
  CDF: "FC",
  MAD: "DH", TND: "DT", DZD: "DA", LYD: "LD", EGP: "E£",
  GNF: "FG", RWF: "RF", BIF: "FBu", MGA: "Ar",
  NGN: "₦", GHS: "₵", ZAR: "R",
  KES: "KSh", UGX: "USh", TZS: "TSh",
  ZMW: "ZK", MWK: "MK", MZN: "MT", AOA: "Kz",
  BWP: "P", NAD: "$", SZL: "E", LSL: "L",
  MRU: "UM", CVE: "$", STN: "Db", SCR: "₨",
  MUR: "₨", KMF: "CF",
  USD: "$",
}

const NO_DECIMAL_CURRENCIES = [
  "XOF", "XAF", "CDF", "GNF", "RWF", "BIF", 
  "MGA", "NGN", "UGX", "TZS", "KMF", "MRU"
]

export const useCurrencyFormatter = () => {
  const { currency, locale } = useLocale()

  const safeCurrency = currency || "XOF"
  const safeLocale = locale || "fr-FR"

  const convertFromUSD = (usdAmount: number): number => {
    const rate = EXCHANGE_RATES[safeCurrency] || EXCHANGE_RATES.XOF
    return usdAmount * rate
  }

  const convertToUSD = (localAmount: number): number => {
    const rate = EXCHANGE_RATES[safeCurrency] || EXCHANGE_RATES.XOF
    return localAmount / rate
  }

  // ✅ CORRECTION : Pour les pays CFA, on force l'affichage de "FCFA"
  const isCFACurrency = safeCurrency === 'XOF' || safeCurrency === 'XAF'

  const formatPrice = (usdAmount: any) => {
    if (usdAmount === null || usdAmount === undefined) return "—"
    
    const value = Number(usdAmount)
    if (isNaN(value)) return "—"
    
    const convertedValue = convertFromUSD(value)
    const fractionDigits = NO_DECIMAL_CURRENCIES.includes(safeCurrency) ? 0 : 2

    // ✅ Pour les pays CFA : on formate manuellement avec "FCFA"
    if (isCFACurrency) {
      try {
        const formattedNumber = new Intl.NumberFormat(safeLocale, {
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits
        }).format(convertedValue)
        return `${formattedNumber} FCFA`
      } catch (e) {
        return `${convertedValue.toFixed(fractionDigits)} FCFA`
      }
    }

    // Pour les autres devises, comportement normal
    try {
      return new Intl.NumberFormat(safeLocale, {
        style: "currency",
        currency: safeCurrency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      }).format(convertedValue)
    } catch (e) {
      return `${CURRENCY_SYMBOLS[safeCurrency] || safeCurrency} ${convertedValue.toFixed(fractionDigits)}`
    }
  }

  const getCurrencySymbol = () => {
    // ✅ Pour les pays CFA, retourner "FCFA"
    if (isCFACurrency) {
      return "FCFA"
    }
    return CURRENCY_SYMBOLS[safeCurrency] || safeCurrency
  }

  const getCurrentRate = () => {
    return EXCHANGE_RATES[safeCurrency] || EXCHANGE_RATES.XOF
  }

  const formatPriceWithoutSymbol = (usdAmount: any) => {
    if (usdAmount === null || usdAmount === undefined) return "—"
    
    const value = Number(usdAmount)
    if (isNaN(value)) return "—"
    
    const convertedValue = convertFromUSD(value)
    const fractionDigits = NO_DECIMAL_CURRENCIES.includes(safeCurrency) ? 0 : 2
    
    try {
      return new Intl.NumberFormat(safeLocale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      }).format(convertedValue)
    } catch (e) {
      return convertedValue.toFixed(fractionDigits)
    }
  }

  const formatPriceWithSymbolAfter = (usdAmount: any) => {
    const formatted = formatPriceWithoutSymbol(usdAmount)
    const symbol = getCurrencySymbol()
    return `${formatted} ${symbol}`
  }

  return {
    formatPrice,
    getCurrencySymbol,
    getCurrentRate,
    formatPriceWithoutSymbol,
    formatPriceWithSymbolAfter,
    convertFromUSD,
    convertToUSD,
    currency: safeCurrency,
    locale: safeLocale
  }
}